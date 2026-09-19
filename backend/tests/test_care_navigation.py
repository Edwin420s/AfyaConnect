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
