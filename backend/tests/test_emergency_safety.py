import pytest
from backend.app.emergency.service import evaluate_clinical_safety


def test_cardiac_emergency_detection():
    result = evaluate_clinical_safety("Nina maumivu makali ya kifua na nahisi kizunguzungu")
    assert result["isEmergency"] is True
    assert result["triageScore"] == 5
    assert result["urgency"] == "EMERGENCY"
    assert "maumivu ya kifua" in result["redFlagReason"]
    assert any(h["number"] == "1199" for h in result["emergencyHotlines"])


def test_respiratory_emergency_detection():
    result = evaluate_clinical_safety("I cannot breathe properly and my chest is tight")
    assert result["isEmergency"] is True
    assert result["triageScore"] == 5
    assert result["urgency"] == "EMERGENCY"
    assert "cannot breathe" in result["redFlagReason"]


def test_standard_symptom_not_emergency():
    result = evaluate_clinical_safety("Nimekuwa na maumivu ya tumbo for two days")
    assert result["isEmergency"] is False
    assert result["triageScore"] <= 4
    assert result["urgency"] in ["STANDARD", "URGENT"]
