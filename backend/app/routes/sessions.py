from __future__ import annotations

import json
import math
import uuid
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_db
from app.middleware.auth import get_current_user, require_role
from app.models.implement import Implement
from app.models.iot_reading import IoTReading
from app.models.session import FieldObservation, IoTAlert, OperationSession, SessionPresetValue
from app.models.tractor import Tractor
from app.models.user import User
from app.schemas.session import (
    AlertResponse,
    FieldObservationCreate,
    FieldObservationResponse,
    PresetValueResponse,
    SessionDetailResponse,
    SessionResponse,
    SessionStartRequest,
    SessionStopRequest,
)

router = APIRouter(prefix="/api/v1/sessions", tags=["Sessions"])
alerts_router = APIRouter(prefix="/api/v1/alerts", tags=["Sessions"])


def _assert_session_access(session: OperationSession, user: User, db: Session) -> None:
    if user.role == "researcher":
        return
    if session.operator_id == user.id or session.client_farmer_id == user.id:
        return
    if session.tractor_owner_id == user.id:
        return
    if user.role == "owner":
        tractor = db.get(Tractor, session.tractor_id)
        if tractor is not None and tractor.owner_id == user.id:
            return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have access to this session",
    )


def _to_session_response(obj: OperationSession) -> SessionResponse:
    return SessionResponse.model_validate(obj)


def _to_utc(dt: datetime) -> datetime:
    """Normalize datetime to UTC-aware for safe arithmetic."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _duration_minutes(started_at: datetime, ended_at: Optional[datetime]) -> float:
    start = _to_utc(started_at)
    end = _to_utc(ended_at) if ended_at else datetime.now(timezone.utc)
    delta = end - start
    return max(0.0, delta.total_seconds() / 60.0)


def _extract_lat_lon(raw_value: str) -> tuple[Optional[float], Optional[float]]:
    try:
        parsed = json.loads(raw_value)
    except Exception:
        parsed = None

    if isinstance(parsed, dict):
        lat = parsed.get("lat")
        lon = parsed.get("lon")
        if lat is not None and lon is not None:
            return float(lat), float(lon)
        lat = parsed.get("latitude")
        lon = parsed.get("longitude")
        if lat is not None and lon is not None:
            return float(lat), float(lon)
    elif isinstance(parsed, list) and len(parsed) >= 2:
        return float(parsed[0]), float(parsed[1])

    if "," in raw_value:
        parts = [p.strip() for p in raw_value.split(",")]
        if len(parts) >= 2:
            try:
                return float(parts[0]), float(parts[1])
            except ValueError:
                pass
    return None, None


@router.post("/start", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def start_session(
    body: SessionStartRequest,
    current_user: User = Depends(require_role(["operator"])),
    db: Session = Depends(get_db),
):
    tractor_id = uuid.UUID(body.tractor_id)
    tractor = db.get(Tractor, tractor_id)
    if tractor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tractor not found")

    active_exists = db.scalars(
        select(OperationSession).where(
            OperationSession.operator_id == current_user.id,
            OperationSession.status.in_(("active", "paused")),
        )
    ).first()
    if active_exists is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Operator already has an active session",
        )

    implement_width_m: Optional[float] = None
    implement_uuid: Optional[uuid.UUID] = None
    implement: Optional[Implement] = None
    if body.implement_id:
        implement_uuid = uuid.UUID(body.implement_id)
        implement = db.get(Implement, implement_uuid)
        if implement is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Implement not found")
        raw_width = getattr(implement, "working_width_m", None)
        if raw_width is None:
            raw_width = getattr(implement, "width", None)
        if raw_width is not None:
            implement_width_m = float(raw_width)

    session = OperationSession(
        tractor_id=tractor.id,
        implement_id=implement_uuid,
        operator_id=current_user.id,
        tractor_owner_id=getattr(tractor, "owner_id", None),
        client_farmer_id=uuid.UUID(body.client_farmer_id) if body.client_farmer_id else None,
        operation_type=body.operation_type,
        gps_tracking_enabled=body.gps_tracking_enabled,
        implement_width_m=implement_width_m,
        status="active",
    )
    db.add(session)
    db.flush()

    auto_presets: list[SessionPresetValue] = []
    if implement is not None:
        if implement.preset_speed_kmh is not None:
            auto_presets.append(
                SessionPresetValue(
                    session_id=session.id,
                    parameter_name="forward_speed",
                    required_value=implement.preset_speed_kmh,
                    unit="km/h",
                    deviation_pct_warn=10.0,
                    deviation_pct_crit=25.0,
                )
            )
        if implement.preset_depth_cm is not None:
            auto_presets.append(
                SessionPresetValue(
                    session_id=session.id,
                    parameter_name="operation_depth",
                    required_value=implement.preset_depth_cm,
                    unit="cm",
                    deviation_pct_warn=10.0,
                    deviation_pct_crit=25.0,
                )
            )
        if implement.preset_gearbox_temp_max_c is not None:
            auto_presets.append(
                SessionPresetValue(
                    session_id=session.id,
                    parameter_name="gearbox_temperature",
                    required_value=implement.preset_gearbox_temp_max_c,
                    unit="\u00B0C",
                    deviation_pct_warn=10.0,
                    deviation_pct_crit=25.0,
                )
            )

    for preset in auto_presets:
        db.add(preset)

    db.commit()
    db.refresh(session)
    return _to_session_response(session)


@router.post("/{session_id}/stop", response_model=SessionResponse)
def stop_session(
    session_id: uuid.UUID,
    _: SessionStopRequest,
    current_user: User = Depends(require_role(["operator"])),
    db: Session = Depends(get_db),
):
    session = db.get(OperationSession, session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if session.operator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this session")
    if session.status not in ("active", "paused"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Session is not active or paused")

    session.ended_at = datetime.utcnow()
    session.status = "completed"
    from app.services.field_area_service import finalize_session_area
    from app.services.operation_cost_service import compute_session_cost
    finalize_session_area(session_id, db)
    compute_session_cost(session, db)
    db.commit()
    db.refresh(session)
    return _to_session_response(session)


@router.patch("/{session_id}/pause", response_model=SessionResponse)
def pause_session(
    session_id: uuid.UUID,
    current_user: User = Depends(require_role(["operator"])),
    db: Session = Depends(get_db),
):
    session = db.get(OperationSession, session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if session.operator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this session")
    if session.status != "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only active sessions can be paused")

    session.status = "paused"
    db.commit()
    db.refresh(session)
    return _to_session_response(session)


@router.patch("/{session_id}/resume", response_model=SessionResponse)
def resume_session(
    session_id: uuid.UUID,
    current_user: User = Depends(require_role(["operator"])),
    db: Session = Depends(get_db),
):
    session = db.get(OperationSession, session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if session.operator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this session")
    if session.status != "paused":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only paused sessions can be resumed")

    session.status = "active"
    db.commit()
    db.refresh(session)
    return _to_session_response(session)


@router.get("/active", response_model=list[SessionResponse])
def list_active_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(OperationSession).where(OperationSession.status.in_(("active", "paused")))
    if current_user.role == "operator":
        stmt = stmt.where(OperationSession.operator_id == current_user.id)
    elif current_user.role == "owner":
        stmt = (
            stmt.join(Tractor, OperationSession.tractor_id == Tractor.id)
            .where(
                or_(
                    OperationSession.tractor_owner_id == current_user.id,
                    Tractor.owner_id == current_user.id,
                )
            )
        )
    elif current_user.role == "farmer":
        stmt = stmt.where(OperationSession.client_farmer_id == current_user.id)
    elif current_user.role == "researcher":
        pass
    else:
        return []
    rows = db.scalars(stmt.order_by(OperationSession.started_at.desc())).all()
    return [_to_session_response(r) for r in rows]


@router.get("/{session_id}", response_model=SessionDetailResponse)
def get_session_detail(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.scalars(
        select(OperationSession)
        .where(OperationSession.id == session_id)
        .options(
            selectinload(OperationSession.preset_values),
            selectinload(OperationSession.alerts),
        )
    ).first()
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    _assert_session_access(session, current_user, db)

    return SessionDetailResponse(
        **SessionResponse.model_validate(session).model_dump(),
        preset_values=[PresetValueResponse.model_validate(p) for p in session.preset_values],
        alerts=[AlertResponse.model_validate(a) for a in session.alerts],
        total_duration_minutes=_duration_minutes(session.started_at, session.ended_at),
    )


@router.get("/", response_model=list[SessionResponse])
def list_sessions(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(OperationSession)
    if current_user.role == "operator":
        stmt = stmt.where(OperationSession.operator_id == current_user.id)
    elif current_user.role == "owner":
        stmt = (
            stmt.join(Tractor, OperationSession.tractor_id == Tractor.id)
            .where(
                or_(
                    OperationSession.tractor_owner_id == current_user.id,
                    Tractor.owner_id == current_user.id,
                )
            )
        )
    elif current_user.role == "farmer":
        stmt = stmt.where(OperationSession.client_farmer_id == current_user.id)
    else:
        return []

    if status_filter:
        stmt = stmt.where(OperationSession.status == status_filter)
    if start_date:
        stmt = stmt.where(OperationSession.started_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        stmt = stmt.where(OperationSession.started_at <= datetime.combine(end_date, datetime.max.time()))

    rows = db.scalars(
        stmt.order_by(OperationSession.started_at.desc()).limit(limit).offset(offset)
    ).all()
    return [_to_session_response(r) for r in rows]


@router.post("/{session_id}/observations", response_model=FieldObservationResponse, status_code=status.HTTP_201_CREATED)
def create_observation(
    session_id: uuid.UUID,
    body: FieldObservationCreate,
    current_user: User = Depends(require_role(["operator"])),
    db: Session = Depends(get_db),
):
    session = db.get(OperationSession, session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if session.operator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this session")

    lat = body.lat
    lon = body.lon
    if lat is None:
        latest_gps = db.scalars(
            select(IoTReading)
            .where(
                and_(
                    IoTReading.session_id == session_id,
                    IoTReading.feed_key == "gpsloc",
                )
            )
            .order_by(IoTReading.device_timestamp.desc())
            .limit(1)
        ).first()
        if latest_gps is not None:
            parsed_lat, parsed_lon = _extract_lat_lon(latest_gps.raw_value)
            if parsed_lat is not None:
                lat = parsed_lat
            if lon is None and parsed_lon is not None:
                lon = parsed_lon

    obs = FieldObservation(
        session_id=session_id,
        obs_type=body.obs_type,
        value=body.value,
        unit=body.unit,
        lat=lat,
        lon=lon,
        notes=body.notes,
        recorded_by=current_user.id,
    )
    db.add(obs)
    db.commit()
    db.refresh(obs)
    return FieldObservationResponse.model_validate(obs)


@router.get("/{session_id}/observations", response_model=list[FieldObservationResponse])
def list_observations(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.get(OperationSession, session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    _assert_session_access(session, current_user, db)

    rows = db.scalars(
        select(FieldObservation)
        .where(FieldObservation.session_id == session_id)
        .order_by(FieldObservation.recorded_at.desc())
    ).all()
    return [FieldObservationResponse.model_validate(r) for r in rows]


@router.get("/{session_id}/gps-path")
def get_session_gps_path(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.get(OperationSession, session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    _assert_session_access(session, current_user, db)

    rows = db.scalars(
        select(IoTReading)
        .where(
            and_(
                IoTReading.session_id == session_id,
                IoTReading.feed_key == "gpsloc",
            )
        )
        .order_by(IoTReading.device_timestamp.asc())
    ).all()

    points: list[dict] = []
    for reading in rows:
        lat: Optional[float] = None
        lon: Optional[float] = None

        try:
            parsed = json.loads(reading.raw_value)
            if isinstance(parsed, dict):
                lat_raw = parsed["lat"]
                lon_raw = parsed["lon"]
                lat = float(lat_raw)
                lon = float(lon_raw)
        except Exception:
            lat_raw = getattr(reading, "lat", None)
            lon_raw = getattr(reading, "lon", None)
            if lat_raw is None:
                lat_raw = getattr(reading, "latitude", None)
            if lon_raw is None:
                lon_raw = getattr(reading, "longitude", None)
            if lat_raw is not None and lon_raw is not None:
                try:
                    lat = float(lat_raw)
                    lon = float(lon_raw)
                except (TypeError, ValueError):
                    lat = None
                    lon = None

        if lat is None or lon is None:
            continue
        if math.isnan(lat) or math.isnan(lon):
            continue

        points.append(
            {
                "lat": lat,
                "lon": lon,
                "timestamp": reading.device_timestamp.isoformat(),
            }
        )

    return {
        "session_id": str(session_id),
        "points": points,
        "total_points": len(points),
        "area_ha": float(session.area_ha) if session.area_ha is not None else None,
        "implement_width_m": float(session.implement_width_m) if session.implement_width_m is not None else None,
    }


@router.get("/{session_id}/area-summary")
def get_session_area_summary(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.get(OperationSession, session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    _assert_session_access(session, current_user, db)

    total_gps_points = db.scalar(
        select(func.count())
        .select_from(IoTReading)
        .where(
            and_(
                IoTReading.session_id == session_id,
                IoTReading.feed_key == "gpsloc",
            )
        )
    ) or 0

    if session.area_ha is None and session.status == "completed":
        from app.services.field_area_service import finalize_session_area

        finalize_session_area(session_id, db)
        db.commit()
        db.refresh(session)

    duration_minutes: Optional[float] = None
    if session.started_at is not None:
        duration_minutes = _duration_minutes(session.started_at, session.ended_at)

    return {
        "session_id": str(session_id),
        "area_ha": float(session.area_ha) if session.area_ha is not None else None,
        "implement_width_m": float(session.implement_width_m) if session.implement_width_m is not None else None,
        "total_gps_points": int(total_gps_points),
        "session_duration_minutes": duration_minutes,
        "operation_type": session.operation_type,
        "status": session.status,
    }


@alerts_router.patch("/{alert_id}/acknowledge", response_model=AlertResponse)
def acknowledge_alert(
    alert_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alert = db.get(IoTAlert, alert_id)
    if alert is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    if alert.session_id is not None:
        session = db.get(OperationSession, alert.session_id)
        if session is not None:
            _assert_session_access(session, current_user, db)

    alert.acknowledged = True
    alert.acknowledged_at = datetime.utcnow()
    alert.acknowledged_by = current_user.id
    db.commit()
    db.refresh(alert)
    return AlertResponse.model_validate(alert)


_combined_router = APIRouter()
_combined_router.include_router(router)
_combined_router.include_router(alerts_router)
router = _combined_router
