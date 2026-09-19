import pytest
from backend.app.location.service import calculate_haversine_distance, estimate_drive_time_minutes, resolve_patient_area


def test_haversine_calculation():
    # Distance between Westlands (-1.2675, 36.8121) and Aga Khan (-1.2635, 36.8202)
    dist = calculate_haversine_distance(-1.2675, 36.8121, -1.2635, 36.8202)
    assert 0.8 <= dist <= 1.8


def test_drive_time_estimation():
    time_str = estimate_drive_time_minutes(1.4)
    assert "min drive" in time_str


def test_area_resolution():
    area = resolve_patient_area(-1.2675, 36.8121)
    assert "Westlands" in area
