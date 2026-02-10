from __future__ import annotations

from dataclasses import asdict, dataclass

from app.core.algorithms import (
    SlipSolution,
    draft_force_asae,
    drawbar_power_kw,
    dynamic_front_weight_n_4wd,
    dynamic_rear_weight_n_2wd,
    field_capacity_actual_ha_per_h,
    field_capacity_theoretical_ha_per_h,
    field_efficiency_percent,
    front_ballast_required_kg_4wd,
    fuel_consumption_l_per_ha,
    overall_performance_efficiency_percent,
    power_utilization_percent,
    rear_ballast_required_kg,
    solve_slip_iterative,
    specific_fuel_consumption_l_per_kw_h,
    total_operating_time_hours,
    total_weight_kg,
    traction_efficiency_percent,
    turn_time_seconds,
)
from app.models.enums import DriveMode, TireType


@dataclass(frozen=True)
class PerformanceInputs:
    # Tractor
    pto_power_kw: float
    wheelbase_m: float
    front_axle_weight_kg: float
    rear_axle_weight_kg: float
    hitch_distance_from_rear_m: float
    drive_mode: DriveMode
    transmission_efficiency_pct: float

    # Tire (rear used for slip calc in provided md)
    tire_type: TireType
    rear_overall_diameter_m: float
    rear_section_width_m: float

    # Implement
    width_m: float
    weight_kg: float
    cg_distance_from_hitch_m: float
    vertical_horizontal_ratio: float
    asae_param_a: float
    asae_param_b: float
    asae_param_c: float

    # Operating conditions
    cone_index_kpa: float
    depth_cm: float
    speed_kmh: float
    field_area_ha: float
    number_of_turns: int


def calculate_performance(inputs: PerformanceInputs) -> dict:
    """
    End-to-end performance pipeline using ONLY the formulas/loops documented in
    `tractor_performance_algorithms.md`.
    """
    draft_n = draft_force_asae(
        inputs.asae_param_a,
        inputs.asae_param_b,
        inputs.asae_param_c,
        inputs.speed_kmh,
        inputs.width_m,
        inputs.depth_cm,
    )
    pdb_kw = drawbar_power_kw(draft_n, inputs.speed_kmh)

    tw_kg = total_weight_kg(
        inputs.front_axle_weight_kg, inputs.rear_axle_weight_kg, inputs.weight_kg
    )

    # Dynamic weights
    rd_n = dynamic_rear_weight_n_2wd(
        inputs.rear_axle_weight_kg,
        inputs.weight_kg,
        inputs.cg_distance_from_hitch_m,
        inputs.wheelbase_m,
        draft_n,
        inputs.vertical_horizontal_ratio,
        inputs.hitch_distance_from_rear_m,
    )

    fd_n = None
    if inputs.drive_mode == DriveMode.WD4:
        fd_n = dynamic_front_weight_n_4wd(
            inputs.front_axle_weight_kg,
            inputs.weight_kg,
            inputs.cg_distance_from_hitch_m,
            inputs.wheelbase_m,
            draft_n,
            inputs.vertical_horizontal_ratio,
            inputs.hitch_distance_from_rear_m,
        )

    tire_is_bias = inputs.tire_type == TireType.BIAS_PLY
    slip_solution: SlipSolution = solve_slip_iterative(
        draft_n=draft_n,
        rd_n=rd_n,
        ci_kpa=inputs.cone_index_kpa,
        sw_m=inputs.rear_section_width_m,
        od_m=inputs.rear_overall_diameter_m,
        tire_is_bias=tire_is_bias,
    )

    if not slip_solution.converged:
        return {
            "draft_force": draft_n,
            "drawbar_power": pdb_kw,
            "status_message": "Slip calculation did not converge (difference >= 5N within max iterations).",
            "recommendations": "Check inputs for invalid combinations (weights, cone index, speed, depth).",
            "results_debug": asdict(slip_solution),
        }

    te_pct = traction_efficiency_percent(slip_solution.rrr, slip_solution.gt, slip_solution.slip)
    pused_pct = power_utilization_percent(
        pdb_kw, inputs.transmission_efficiency_pct, te_pct, inputs.pto_power_kw
    )

    fc_th = field_capacity_theoretical_ha_per_h(inputs.width_m, inputs.speed_kmh)
    tt_s = turn_time_seconds(inputs.width_m, inputs.speed_kmh)
    total_time_h = total_operating_time_hours(inputs.field_area_ha, fc_th, inputs.number_of_turns, tt_s)
    fc_ac = field_capacity_actual_ha_per_h(inputs.field_area_ha, total_time_h)
    fe_pct = field_efficiency_percent(fc_ac, fc_th)

    sfc = specific_fuel_consumption_l_per_kw_h(
        pdb_kw, inputs.transmission_efficiency_pct, te_pct, inputs.pto_power_kw
    )
    fuel_l_per_ha = fuel_consumption_l_per_ha(sfc, pdb_kw, fc_ac)
    overall_pct = overall_performance_efficiency_percent(pdb_kw, fc_th, fuel_l_per_ha)

    ballast_front_kg = 0.0
    if inputs.drive_mode == DriveMode.WD4 and fd_n is not None:
        ballast_front_kg = front_ballast_required_kg_4wd(tw_kg, fd_n)

    ballast_rear_kg = 0.0
    if slip_solution.slip > 15.0:
        ballast_rear_kg = rear_ballast_required_kg(
            draft_n=draft_n,
            rd_n=rd_n,
            ci_kpa=inputs.cone_index_kpa,
            sw_m=inputs.rear_section_width_m,
            od_m=inputs.rear_overall_diameter_m,
            tire_is_bias=tire_is_bias,
        )

    # Assessment messages (as documented)
    recs: list[str] = []
    if te_pct < 0:
        recs.append("Either decrease depth or speed of operation")

    if slip_solution.slip < 8.0:
        recs.append("Slip < 8%: Increase depth or speed (underutilized)")
    elif slip_solution.slip <= 15.0:
        recs.append("Slip 8–15%: Optimal slip range")
    else:
        recs.append("Slip > 15%: Add ballast to reduce slip")

    if 90.0 < pused_pct < 95.0:
        recs.append("Power utilization 90–95%: Properly Loaded")
    elif pused_pct <= 90.0:
        recs.append("Power utilization ≤ 90%: Under Loaded")
    else:
        recs.append("Power utilization ≥ 95%: Over Loaded")

    status_message = "OK"
    recommendations = "\n".join(recs)

    return {
        "draft_force": draft_n,
        "drawbar_power": pdb_kw,
        "slip": slip_solution.slip,
        "traction_efficiency": te_pct,
        "power_utilization": pused_pct,
        "field_capacity_theoretical": fc_th,
        "field_capacity_actual": fc_ac,
        "field_efficiency": fe_pct,
        "fuel_consumption_per_hectare": fuel_l_per_ha,
        "overall_efficiency": overall_pct,
        "ballast_front_required": ballast_front_kg,
        "ballast_rear_required": ballast_rear_kg,
        "status_message": status_message,
        "recommendations": recommendations,
        "debug": {
            "slip_solution": asdict(slip_solution),
            "tw_kg": tw_kg,
            "rd_n": rd_n,
            "fd_n": fd_n,
            "sfc": sfc,
        },
    }

