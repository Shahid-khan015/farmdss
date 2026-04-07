from __future__ import annotations

import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.models.iot_reading import IoTReading
from app.models.session import IoTAlert, SessionPresetValue

logger = logging.getLogger(__name__)


def get_status_label(feed_key: str, numeric_value: Optional[float]) -> str:
    if numeric_value is None:
        return "normal"

    if feed_key == "gearbox-temp":
        if numeric_value >= 100:
            return "critical"
        if numeric_value >= 85:
            return "warning"
        return "normal"

    if feed_key == "vibration-level":
        if numeric_value >= 5.0:
            return "critical"
        if numeric_value >= 3.0:
            return "warning"
        return "normal"

    if feed_key == "wheel-slip":
        if numeric_value >= 25:
            return "critical"
        if numeric_value >= 15:
            return "warning"
        return "normal"

    if feed_key == "soil-moisture":
        if numeric_value <= 10:
            return "critical"
        if numeric_value <= 20:
            return "warning"
        return "normal"

    if feed_key == "forward-speed":
        if numeric_value >= 15:
            return "critical"
        if numeric_value >= 12:
            return "warning"
        return "normal"

    if feed_key in ("operation-depth", "pto-speed"):
        return "normal"

    return "normal"


def evaluate(reading: IoTReading, db: Session) -> None:
    try:
        # Step 1: absolute threshold alert
        status_label = get_status_label(reading.feed_key, reading.numeric_value)
        if status_label in ("warning", "critical"):
            threshold_ref: Optional[float] = None
            if reading.feed_key == "gearbox-temp":
                threshold_ref = 100.0 if status_label == "critical" else 85.0
                label = "Gearbox temperature"
                unit = "°C"
            elif reading.feed_key == "vibration-level":
                threshold_ref = 5.0 if status_label == "critical" else 3.0
                label = "Vibration level"
                unit = "g"
            elif reading.feed_key == "wheel-slip":
                threshold_ref = 25.0 if status_label == "critical" else 15.0
                label = "Wheel slip"
                unit = "%"
            elif reading.feed_key == "soil-moisture":
                threshold_ref = 10.0 if status_label == "critical" else 20.0
                label = "Soil moisture"
                unit = "%"
            elif reading.feed_key == "forward-speed":
                threshold_ref = 15.0 if status_label == "critical" else 12.0
                label = "Forward speed"
                unit = "km/h"
            else:
                threshold_ref = None
                label = reading.feed_key
                unit = ""

            existing_threshold = db.query(IoTAlert).filter(
                IoTAlert.session_id == reading.session_id,
                IoTAlert.feed_key == reading.feed_key,
                IoTAlert.alert_type == "threshold",
                IoTAlert.acknowledged == False,  # noqa: E712
            ).first()
            if existing_threshold is None:
                severity_text = "critically high" if status_label == "critical" else "warning"
                if reading.feed_key == "soil-moisture":
                    severity_text = "critically low" if status_label == "critical" else "warning"
                value_text = f"{reading.numeric_value:g}" if reading.numeric_value is not None else "n/a"
                threshold_text = f"{threshold_ref:g}" if threshold_ref is not None else "n/a"
                msg = f"{label} {severity_text}: {value_text}{unit} (threshold: {threshold_text}{unit})"
                db.add(
                    IoTAlert(
                        session_id=reading.session_id,
                        reading_id=reading.id,
                        feed_key=reading.feed_key,
                        alert_type="threshold",
                        alert_status=status_label,
                        actual_value=reading.numeric_value,
                        reference_value=threshold_ref,
                        message=msg,
                    )
                )
                db.flush()

        # Step 2: deviation alert from preset
        if reading.session_id is None or reading.numeric_value is None:
            return

        feed_to_parameter = {
            "forward-speed": "forward_speed",
            "operation-depth": "operation_depth",
            "pto-speed": "pto_shaft_speed",
            "gearbox-temp": "gearbox_temperature",
            "wheel-slip": "wheel_slip",
            "soil-moisture": "soil_moisture",
            "field-capacity": "field_capacity",
            "vibration-level": "vibration_level",
        }
        parameter_name = feed_to_parameter.get(reading.feed_key)
        if parameter_name is None:
            return

        preset = db.query(SessionPresetValue).filter(
            SessionPresetValue.session_id == reading.session_id,
            SessionPresetValue.parameter_name == parameter_name,
        ).first()
        if preset is None or preset.required_value is None:
            return
        if preset.required_value == 0:
            return

        actual = float(reading.numeric_value)
        target = float(preset.required_value)
        deviation_pct = abs(actual - target) / target * 100.0
        if deviation_pct >= float(preset.deviation_pct_crit):
            deviation_status = "critical"
        elif deviation_pct >= float(preset.deviation_pct_warn):
            deviation_status = "warning"
        else:
            return

        existing_deviation = db.query(IoTAlert).filter(
            IoTAlert.session_id == reading.session_id,
            IoTAlert.feed_key == reading.feed_key,
            IoTAlert.alert_type == "deviation",
            IoTAlert.acknowledged == False,  # noqa: E712
        ).first()
        if existing_deviation is not None:
            return

        direction = "above" if actual >= target else "below"
        unit = preset.unit or ""
        msg = (
            f"{parameter_name.replace('_', ' ').capitalize()} {deviation_pct:.0f}% {direction} target: "
            f"{actual:g}{unit} (target: {target:g}{unit})"
        )
        db.add(
            IoTAlert(
                session_id=reading.session_id,
                reading_id=reading.id,
                feed_key=reading.feed_key,
                alert_type="deviation",
                alert_status=deviation_status,
                actual_value=actual,
                reference_value=target,
                message=msg,
            )
        )
        db.flush()
    except Exception as exc:  # pragma: no cover - defensive pipeline guard
        logger.exception("alert evaluation failed for iot_reading_id=%s: %s", getattr(reading, "id", None), exc)
        return
