from __future__ import annotations

import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.operation_charge import OperationCharge
from app.models.session import OperationSession
from app.models.tractor import Tractor

logger = logging.getLogger(__name__)


def compute_session_cost(session: OperationSession, db: Session) -> None:
    """
    Looks up the OperationCharge for this session's owner + operation_type.
    Requires session.area_ha to already be computed (call after finalize_session_area).
    Sets session.total_cost_inr, session.charge_per_ha_applied, session.cost_note.
    If no charge is found, sets cost fields to None and logs a warning.
    Does NOT commit - caller commits.
    """
    tractor = db.get(Tractor, session.tractor_id)
    owner_id = tractor.owner_id if tractor is not None else None
    if owner_id is None:
        logger.warning("No owner on tractor - skipping cost")
        session.total_cost_inr = None
        session.charge_per_ha_applied = None
        session.cost_note = None
        return

    charge = db.scalars(
        select(OperationCharge).where(
            OperationCharge.owner_id == owner_id,
            OperationCharge.operation_type == session.operation_type,
        )
    ).first()

    if charge is None:
        logger.warning(
            "No operation charge found for owner_id=%s operation_type=%s",
            owner_id,
            session.operation_type,
        )
        session.total_cost_inr = None
        session.charge_per_ha_applied = None
        session.cost_note = None
        return

    if session.area_ha is None or session.area_ha == 0:
        session.total_cost_inr = None
        session.charge_per_ha_applied = charge.charge_per_ha
        session.cost_note = "Area not computed — cost pending"
        return

    total_cost = round(charge.charge_per_ha * session.area_ha, 2)
    session.total_cost_inr = total_cost
    session.charge_per_ha_applied = charge.charge_per_ha
    session.cost_note = (
        f"{session.operation_type}: ₹{charge.charge_per_ha}/ha "
        f"× {round(session.area_ha, 2)} ha = ₹{total_cost}"
    )
