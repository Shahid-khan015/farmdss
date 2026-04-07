from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.middleware.auth import get_current_user
from app.models.session import IoTAlert, OperationSession
from app.models.user import User
from app.routes.sessions import _assert_session_access, _to_utc
from app.schemas.session import AlertSummaryItem, SessionSummaryReport
from app.services.report_service import ReportFilters, generate_report

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])


@router.get("/summary")
def get_report_summary(
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    start_time: Optional[str] = Query(default=None),
    end_time: Optional[str] = Query(default=None),
    operation_type: Optional[str] = Query(default=None),
    tractor_id: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    start_dt: Optional[datetime] = None
    end_dt: Optional[datetime] = None

    if start_date is not None:
        try:
            start_dt = datetime.strptime(
                f"{start_date} {start_time or '00:00'}", "%Y-%m-%d %H:%M"
            ).replace(tzinfo=timezone.utc)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="start_date must be YYYY-MM-DD and start_time must be HH:MM",
            ) from exc

    if end_date is not None:
        try:
            end_dt = datetime.strptime(
                f"{end_date} {end_time or '23:59'}", "%Y-%m-%d %H:%M"
            ).replace(tzinfo=timezone.utc)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="end_date must be YYYY-MM-DD and end_time must be HH:MM",
            ) from exc

    if start_dt is not None and end_dt is not None and end_dt < start_dt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end datetime must be greater than or equal to start datetime",
        )

    tractor_uuid: Optional[UUID] = None
    if tractor_id is not None:
        try:
            tractor_uuid = UUID(tractor_id)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="tractor_id must be a valid UUID",
            ) from exc

    filters = ReportFilters(
        owner_id=current_user.id if current_user.role == "owner" else None,
        operator_id=current_user.id if current_user.role == "operator" else None,
        client_farmer_id=current_user.id if current_user.role == "farmer" else None,
        tractor_id=tractor_uuid,
        start_datetime=start_dt,
        end_datetime=end_dt,
        operation_type=operation_type,
    )
    return generate_report(filters, db)


@router.get("/session/{session_id}", response_model=SessionSummaryReport)
def get_session_summary_report(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.get(OperationSession, session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    _assert_session_access(session, current_user, db)

    alerts = list(
        db.scalars(
            select(IoTAlert)
            .where(IoTAlert.session_id == session_id)
            .order_by(IoTAlert.created_at.desc())
        ).all()
    )

    duration_minutes: Optional[float] = None
    if session.started_at is not None:
        end_dt = _to_utc(session.ended_at) if session.ended_at is not None else datetime.now(timezone.utc)
        duration_minutes = max(0.0, (end_dt - _to_utc(session.started_at)).total_seconds() / 60.0)

    def severity_color_for(alert: IoTAlert) -> Optional[str]:
        if alert.alert_status == "critical":
            return "#C00000"
        if alert.alert_status == "warning":
            return "#C55A11"
        return None

    alert_items = [
        AlertSummaryItem(
            feed_key=alert.feed_key,
            alert_type=alert.alert_type,
            alert_status=alert.alert_status,
            severity_color=severity_color_for(alert),
            actual_value=alert.actual_value,
            message=alert.message,
            acknowledged=alert.acknowledged,
            created_at=alert.created_at,
        )
        for alert in alerts
    ]

    return SessionSummaryReport(
        session_id=str(session.id),
        operation_type=session.operation_type,
        status=session.status,
        tractor_id=str(session.tractor_id),
        implement_id=str(session.implement_id) if session.implement_id else None,
        operator_id=str(session.operator_id),
        started_at=session.started_at,
        ended_at=session.ended_at,
        duration_minutes=duration_minutes,
        area_ha=session.area_ha,
        total_cost_inr=session.total_cost_inr,
        charge_per_ha_applied=session.charge_per_ha_applied,
        cost_note=session.cost_note,
        alerts=alert_items,
        total_alerts=len(alert_items),
        unacknowledged_alerts=sum(1 for alert in alerts if not alert.acknowledged),
    )
