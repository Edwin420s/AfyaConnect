import pytest
from backend.app.claude.care_navigation import determine_care_pathway


def test_pediatric_pathway():
    res = determine_care_pathway("Mtoto wangu ako na homa kali na hataki kula")
    assert res["departmentCode"] == "PED"
    assert "Pediatrics" in res["department"]
    assert res["urgency"] == "URGENT"


def test_ent_pathway():
    res = determine_care_pathway("Nimekuwa nikisikia mlio masikioni kwa wiki moja")
    assert res["departmentCode"] == "ENT"
    assert "ENT" in res["department"]


def test_dental_pathway():
    res = determine_care_pathway("Jino linaniuma sana upande wa kulia")
    assert res["departmentCode"] == "DENT"
    assert "Dental" in res["department"]


def test_dermatology_pathway():
    res = determine_care_pathway("I have an itchy red rash spreading on my arm")
    assert res["departmentCode"] == "DERM"
    assert "Dermatology" in res["department"]


def test_maternity_pathway():
    res = determine_care_pathway("Nahitaji kliniki ya uzazi na Linda Mama")
    assert res["departmentCode"] == "MAT"
    assert "Linda Mama" in res["department"]


def test_analyze_clinical_intake_greeting():
    """Single greeting like 'hi' or 'habari' must ask for clarification and not book a doctor."""
    from backend.app.claude.care_navigation import analyze_clinical_intake
    res = analyze_clinical_intake("hi", language_preference="eng")
    assert res["needsClarification"] is True
    assert len(res["clarificationOptions"]) > 0
    assert "To help you connect with the right specialist" in res["clarificationMessage"]

    res_swa = analyze_clinical_intake("habari", language_preference="swa")
    assert res_swa["needsClarification"] is True
    assert len(res_swa["clarificationOptions"]) > 0
    assert "Karibu AfyaConnect" in res_swa["clarificationMessage"]


def test_analyze_clinical_intake_vague_one_word():
    """Single vague word like 'headache' or 'kichwa' must ask targeted clarifying questions."""
    from backend.app.claude.care_navigation import analyze_clinical_intake
    res_eng = analyze_clinical_intake("headache", language_preference="eng")
    assert res_eng["needsClarification"] is True
    assert "How long has the headache lasted" in res_eng["clarificationMessage"]

    res_swa = analyze_clinical_intake("kichwa", language_preference="swa")
    assert res_swa["needsClarification"] is True
    assert "Maumivu haya yameanza lini" in res_swa["clarificationMessage"]


def test_analyze_clinical_intake_specific_pediatrics():
    """Child health with duration must route to Pediatrics with Dr. Faith Achieng."""
    from backend.app.claude.care_navigation import analyze_clinical_intake
    res = analyze_clinical_intake("Mtoto wangu ako na homa kali kwa siku mbili", language_preference="swa")
    assert res["needsClarification"] is False
    assert res["specialist"]["doctorName"] == "Dr. Faith Achieng"
    assert "Pediatrics" in res["specialist"]["department"]


def test_analyze_clinical_intake_specific_dermatology():
    """Skin rash query with duration must route to Dermatology with Dr. Mwangi."""
    from backend.app.claude.care_navigation import analyze_clinical_intake
    res = analyze_clinical_intake("I have an itchy rash on my face for 3 days", language_preference="eng")
    assert res["needsClarification"] is False
    assert res["specialist"]["doctorName"] == "Dr. Mwangi"
    assert "Dermatology" in res["specialist"]["department"]


def test_analyze_clinical_intake_multi_turn():
    """Multi-turn conversation where initial turn was vague and second turn provides details."""
    from backend.app.claude.care_navigation import analyze_clinical_intake
    history = [
        {"sender": "patient", "text": "headache"},
        {"sender": "assistant", "text": "How long has the headache lasted?"},
    ]
    res = analyze_clinical_intake("It has lasted 2 days and is moderate", history=history, language_preference="eng")
    assert res["needsClarification"] is False
    assert res["specialist"]["doctorName"] != ""
