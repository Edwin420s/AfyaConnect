from fastapi import APIRouter
from .auth import router as auth_router
from .facilities import router as facilities_router
from .departments import router as departments_router
from .doctors import router as doctors_router
from .services import router as services_router
from .patients import router as patients_router
from .conversations import router as conversations_router
from .care_requests import router as care_requests_router
from .availability import router as availability_router
from .appointments import router as appointments_router
from .location import router as location_router
from .notifications import router as notifications_router
from .hospital import router as hospital_router
from .doctor import router as doctor_router
from .admin import router as admin_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(facilities_router)
api_router.include_router(departments_router)
api_router.include_router(doctors_router)
api_router.include_router(services_router)
api_router.include_router(patients_router)
api_router.include_router(conversations_router)
api_router.include_router(care_requests_router)
api_router.include_router(availability_router)
api_router.include_router(appointments_router)
api_router.include_router(location_router)
api_router.include_router(notifications_router)
api_router.include_router(hospital_router)
api_router.include_router(doctor_router)
api_router.include_router(admin_router)
