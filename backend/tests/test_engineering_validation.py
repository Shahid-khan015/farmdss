from app.core.engineering_validation import evaluate_simulation_rules, _get_mu_threshold
from app.models.enums import SoilTexture


def test_get_mu_threshold_with_enum_values():
    assert _get_mu_threshold(SoilTexture.FINE) == 0.6
    assert _get_mu_threshold(SoilTexture.MEDIUM) == 0.55
    assert _get_mu_threshold(SoilTexture.COARSE) == 0.4


def test_get_mu_threshold_with_string_values():
    assert _get_mu_threshold("Fine") == 0.6
    assert _get_mu_threshold("Medium") == 0.55
    assert _get_mu_threshold("Coarse") == 0.4


def test_evaluate_simulation_rules_flags_power_utilization_over_100():
    result = evaluate_simulation_rules(
        slip=10.0,
        coefficient_net_traction=0.5,
        front_weight_utilization=0.25,
        power_utilization=105.0,
        soil_texture=SoilTexture.FINE,
    )

    assert result["compatible"] is False
    assert any("Power utilization exceeds 100%" in warning for warning in result["warnings"])
    assert "Reduce implement width" in result["recommendations"]
    assert "Increase tractor HP" in result["recommendations"]
    assert "Reduce operating depth" in result["recommendations"]


def test_evaluate_simulation_rules_flags_mu_below_threshold_for_soil_texture():
    result = evaluate_simulation_rules(
        slip=10.0,
        coefficient_net_traction=0.35,
        front_weight_utilization=0.25,
        power_utilization=80.0,
        soil_texture=SoilTexture.COARSE,
    )

    assert result["compatible"] is False
    assert any("Net traction coefficient μ is below the recommended" in warning for warning in result["warnings"])
    assert "Increase tire traction" in result["recommendations"]
    assert "Add ballast" in result["recommendations"]
    assert "Reduce operating depth" in result["recommendations"]


def test_evaluate_simulation_rules_flags_low_front_weight_utilization():
    result = evaluate_simulation_rules(
        slip=10.0,
        coefficient_net_traction=0.5,
        front_weight_utilization=0.15,
        power_utilization=80.0,
        soil_texture=SoilTexture.MEDIUM,
    )

    assert result["compatible"] is False
    assert any("Front weight utilization is below 0.2" in warning for warning in result["warnings"])
    assert "Add front ballast" in result["recommendations"]
    assert "Reduce operating depth" in result["recommendations"]


def test_evaluate_simulation_rules_deduplicates_recommendations():
    result = evaluate_simulation_rules(
        slip=10.0,
        coefficient_net_traction=0.35,
        front_weight_utilization=0.15,
        power_utilization=105.0,
        soil_texture="Fine",
    )

    assert result["compatible"] is False
    assert result["recommendations"].count("Reduce operating depth") == 1
    assert len(result["recommendations"]) == len(set(result["recommendations"]))
