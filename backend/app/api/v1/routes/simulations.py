from __future__ import annotations

import uuid
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.performance_calculator import PerformanceInputs, calculate_performance
from app.crud.implement import implement_crud
from app.crud.operating_condition import operating_condition_crud
from app.crud.simulation import simulation_crud
from app.crud.tractor import tractor_crud
from app.crud.tire_specification import tire_crud
from app.models.enums import DriveMode
from app.schemas.common import DeleteResponse, PaginatedResponse
from app.schemas.simulation import SimulationRead, SimulationRunRequest

router = APIRouter()


@router.get("", response_model=PaginatedResponse[SimulationRead])
def list_simulations(
    db: Session = Depends(get_db),
    tractor_id: Optional[uuid.UUID] = Query(default=None),
    implement_id: Optional[uuid.UUID] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    total, items = simulation_crud.list(
        db, tractor_id=tractor_id, implement_id=implement_id, limit=limit, offset=offset
    )
    return {"total": total, "items": items, "limit": limit, "offset": offset}


@router.get("/compare", response_model=list[SimulationRead])
def compare_simulations(
    ids: list[uuid.UUID] = Query(
        ...,
        description="Simulation IDs to compare (repeat query param).",
        max_length=10,
    ),
    db: Session = Depends(get_db),
):
    # simple compare: return list of SimulationRead for requested ids (client can compare)
    sims = []
    for id_ in ids:
        sim = simulation_crud.get(db, id=id_)
        if sim:
            sims.append(sim)
    if not sims:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No simulations found for given ids"
        )
    return sims


@router.get("/{id}", response_model=SimulationRead)
def get_simulation(id: uuid.UUID, db: Session = Depends(get_db)):
    obj = simulation_crud.get(db, id=id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")
    return obj


@router.post("/run", response_model=SimulationRead, status_code=status.HTTP_201_CREATED)
def run_simulation(payload: SimulationRunRequest, db: Session = Depends(get_db)):
    tractor = tractor_crud.get_with_tires(db, id=payload.tractor_id)
    if not tractor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tractor not found")
    implement = implement_crud.get(db, id=payload.implement_id)
    if not implement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Implement not found")
    tires = tire_crud.get_by_tractor_id(db, tractor_id=tractor.id)
    if not tires:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Tractor is missing tire specifications",
        )

    # Resolve operating conditions
    if payload.operating_conditions_preset_id is not None:
        preset = operating_condition_crud.get(db, id=payload.operating_conditions_preset_id)
        if not preset:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Preset not found")
        cone_index = preset.cone_index
        depth = preset.depth
        speed = preset.speed
        field_area = preset.field_area
        field_length = preset.field_length
        field_width = preset.field_width
        number_of_turns = preset.number_of_turns
        soil_texture = preset.soil_texture.value
        soil_hardness = preset.soil_hardness.value
    else:
        preset = None
        cone_index = payload.cone_index
        depth = payload.depth
        speed = payload.speed
        field_area = payload.field_area
        field_length = payload.field_length
        field_width = payload.field_width
        number_of_turns = payload.number_of_turns
        soil_texture = payload.soil_texture
        soil_hardness = payload.soil_hardness

    # Validate required numeric fields for algorithm
    required_tractor = [
        ("pto_power", tractor.pto_power),
        ("wheelbase", tractor.wheelbase),
        ("front_axle_weight", tractor.front_axle_weight),
        ("rear_axle_weight", tractor.rear_axle_weight),
        ("hitch_distance_from_rear", tractor.hitch_distance_from_rear),
        ("transmission_efficiency", tractor.transmission_efficiency),
    ]
    missing_tractor = [k for k, v in required_tractor if v is None]
    if missing_tractor:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Tractor missing required fields for simulation: {missing_tractor}",
        )

    required_impl = [
        ("width", implement.width),
        ("weight", implement.weight),
        ("cg_distance_from_hitch", implement.cg_distance_from_hitch),
        ("vertical_horizontal_ratio", implement.vertical_horizontal_ratio),
        ("asae_param_a", implement.asae_param_a),
        ("asae_param_b", implement.asae_param_b),
        ("asae_param_c", implement.asae_param_c),
    ]
    missing_impl = [k for k, v in required_impl if v is None]
    if missing_impl:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Implement missing required fields for simulation: {missing_impl}",
        )

    required_cond = [
        ("cone_index", cone_index),
        ("depth", depth),
        ("speed", speed),
        ("field_area", field_area),
        ("number_of_turns", number_of_turns),
    ]
    missing_cond = [k for k, v in required_cond if v is None]
    if missing_cond:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Operating conditions missing required fields for simulation: {missing_cond}",
        )

    if tires.rear_overall_diameter is None or tires.rear_section_width is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Tire specs missing rear_overall_diameter or rear_section_width",
        )

    perf_inputs = PerformanceInputs(
        pto_power_kw=float(tractor.pto_power),
        wheelbase_m=float(tractor.wheelbase),
        front_axle_weight_kg=float(tractor.front_axle_weight),
        rear_axle_weight_kg=float(tractor.rear_axle_weight),
        hitch_distance_from_rear_m=float(tractor.hitch_distance_from_rear),
        drive_mode=tractor.drive_mode if isinstance(tractor.drive_mode, DriveMode) else DriveMode(tractor.drive_mode),
        transmission_efficiency_pct=float(tractor.transmission_efficiency),
        tire_type=tires.tire_type,
        rear_overall_diameter_m=float(tires.rear_overall_diameter) / 1000.0,
        rear_section_width_m=float(tires.rear_section_width) / 1000.0,
        width_m=float(implement.width),
        weight_kg=float(implement.weight),
        cg_distance_from_hitch_m=float(implement.cg_distance_from_hitch),
        vertical_horizontal_ratio=float(implement.vertical_horizontal_ratio),
        asae_param_a=float(implement.asae_param_a),
        asae_param_b=float(implement.asae_param_b),
        asae_param_c=float(implement.asae_param_c),
        cone_index_kpa=float(cone_index),
        depth_cm=float(depth),
        speed_kmh=float(speed),
        field_area_ha=float(field_area),
        number_of_turns=int(number_of_turns),
    )

    results = calculate_performance(perf_inputs)

    # Persist simulation + key result columns
    sim = simulation_crud.create(
        db,
        obj_in=payload,
        extra={
            "operating_conditions_preset_id": payload.operating_conditions_preset_id,
            "cone_index": cone_index,
            "depth": depth,
            "speed": speed,
            "field_area": field_area,
            "field_length": field_length,
            "field_width": field_width,
            "number_of_turns": number_of_turns,
            "soil_texture": soil_texture,
            "soil_hardness": soil_hardness,
            "results": results,
            "draft_force": Decimal(str(results.get("draft_force"))) if results.get("draft_force") is not None else None,
            "drawbar_power": Decimal(str(results.get("drawbar_power"))) if results.get("drawbar_power") is not None else None,
            "slip": Decimal(str(results.get("slip"))) if results.get("slip") is not None else None,
            "traction_efficiency": Decimal(str(results.get("traction_efficiency"))) if results.get("traction_efficiency") is not None else None,
            "power_utilization": Decimal(str(results.get("power_utilization"))) if results.get("power_utilization") is not None else None,
            "field_capacity_theoretical": Decimal(str(results.get("field_capacity_theoretical"))) if results.get("field_capacity_theoretical") is not None else None,
            "field_capacity_actual": Decimal(str(results.get("field_capacity_actual"))) if results.get("field_capacity_actual") is not None else None,
            "field_efficiency": Decimal(str(results.get("field_efficiency"))) if results.get("field_efficiency") is not None else None,
            "fuel_consumption_per_hectare": Decimal(str(results.get("fuel_consumption_per_hectare"))) if results.get("fuel_consumption_per_hectare") is not None else None,
            "overall_efficiency": Decimal(str(results.get("overall_efficiency"))) if results.get("overall_efficiency") is not None else None,
            "ballast_front_required": Decimal(str(results.get("ballast_front_required"))) if results.get("ballast_front_required") is not None else None,
            "ballast_rear_required": Decimal(str(results.get("ballast_rear_required"))) if results.get("ballast_rear_required") is not None else None,
            "status_message": results.get("status_message"),
            "recommendations": results.get("recommendations"),
        },
    )
    return sim


@router.delete("/{id}", response_model=DeleteResponse)
def delete_simulation(id: uuid.UUID, db: Session = Depends(get_db)):
    obj = simulation_crud.remove(db, id=id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")
    return {"ok": True, "id": id}

