import datetime
import json
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Enum as SQLEnum,
    Table,
)
from sqlalchemy.orm import relationship
from .connection import Base


class RoleEnum(str):
    PATIENT = "PATIENT"
    HOSPITAL_STAFF = "HOSPITAL_STAFF"
    DOCTOR = "DOCTOR"
    HOSPITAL_ADMIN = "HOSPITAL_ADMIN"
    SYSTEM_ADMIN = "SYSTEM_ADMIN"


class RequestStatusEnum(str):
    RECEIVED = "RECEIVED"
    HOSPITAL_REVIEW = "HOSPITAL_REVIEW"
    DEPARTMENT_ASSIGNED = "DEPARTMENT_ASSIGNED"
    CHECKING_AVAILABILITY = "CHECKING_AVAILABILITY"
    SLOT_PROPOSED = "SLOT_PROPOSED"
    PATIENT_ACCEPTED = "PATIENT_ACCEPTED"
    CONFIRMED = "CONFIRMED"
    RESCHEDULING = "RESCHEDULING"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"


class UrgencyEnum(str):
    ROUTINE = "ROUTINE"
    STANDARD = "STANDARD"
    URGENT = "URGENT"
    EMERGENCY = "EMERGENCY"


class AppointmentStatusEnum(str):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    RESCHEDULED = "RESCHEDULED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"
    NO_SHOW = "NO_SHOW"


class NotificationChannelEnum(str):
    IN_APP = "IN_APP"
    SMS = "SMS"
    WHATSAPP = "WHATSAPP"
    USSD = "USSD"
    VOICE = "VOICE"


class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    phone = Column(String(32), unique=True, index=True, nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=True)
    name = Column(String(128), nullable=False)
    role = Column(String(32), default=RoleEnum.PATIENT, nullable=False)
    preferredLanguage = Column(String(32), default="swa_eng", nullable=False)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="user", uselist=False, cascade="all, delete-orphan")
    staff = relationship("HospitalStaff", back_populates="user", uselist=False, cascade="all, delete-orphan")
    doctor = relationship("Doctor", back_populates="user", uselist=False)


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(64), primary_key=True, index=True)
    userId = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    dateOfBirth = Column(DateTime, nullable=True)
    nationalId = Column(String(32), nullable=True)
    insuranceProvider = Column(String(64), default="SHA")
    insuranceNumber = Column(String(64), nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="patient")
    conversations = relationship("Conversation", back_populates="patient", cascade="all, delete-orphan")
    careRequests = relationship("CareRequest", back_populates="patient", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="patient", cascade="all, delete-orphan")
    locationRecords = relationship("LocationRecord", back_populates="patient", cascade="all, delete-orphan")


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    level = Column(String(64), nullable=False)  # e.g. "Level 6 Referral", "Level 5 Hospital", "Level 4 Public Centre"
    accreditation = Column(String(128), nullable=False)  # e.g. "SHA Verified", "Linda Mama Free"
    address = Column(String(256), nullable=False)
    subCounty = Column(String(128), nullable=False)
    city = Column(String(64), default="Nairobi", nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone = Column(String(32), nullable=False)
    email = Column(String(128), nullable=True)
    imageUrl = Column(String(512), nullable=True)
    mapImageUrl = Column(String(512), nullable=True)
    isEmergencyReady = Column(Boolean, default=True)
    isPublic = Column(Boolean, default=False)
    acceptsInsurance = Column(Text, default="SHA,NHIF,Britam,Jubilee,Cash,M-PESA")
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    departments = relationship("Department", back_populates="facility", cascade="all, delete-orphan")
    services = relationship("FacilityService", back_populates="facility", cascade="all, delete-orphan")
    doctors = relationship("Doctor", back_populates="facility", cascade="all, delete-orphan")
    staff = relationship("HospitalStaff", back_populates="facility", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="facility", cascade="all, delete-orphan")
    careRequests = relationship("CareRequest", back_populates="facility")


class Department(Base):
    __tablename__ = "departments"

    id = Column(String(64), primary_key=True, index=True)
    facilityId = Column(String(64), ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(128), nullable=False)
    code = Column(String(32), nullable=False)
    description = Column(String(256), nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)

    facility = relationship("Facility", back_populates="departments")
    doctors = relationship("DoctorDepartment", back_populates="department", cascade="all, delete-orphan")
    careRequests = relationship("CareRequest", back_populates="department")


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(64), primary_key=True, index=True)
    userId = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True)
    facilityId = Column(String(64), ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False)
    fullName = Column(String(128), nullable=False)
    initials = Column(String(16), nullable=False)
    specialty = Column(String(128), nullable=False)
    qualification = Column(String(64), default="MBChB")
    yearsExperience = Column(Integer, default=5)
    roomNumber = Column(String(64), default="Room 04")
    consultationMinutes = Column(Integer, default=30)
    isOnDuty = Column(Boolean, default=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="doctor")
    facility = relationship("Facility", back_populates="doctors")
    departments = relationship("DoctorDepartment", back_populates="doctor", cascade="all, delete-orphan")
    availability = relationship("DoctorAvailability", back_populates="doctor", cascade="all, delete-orphan")
    exceptions = relationship("AvailabilityException", back_populates="doctor", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="doctor", cascade="all, delete-orphan")


class DoctorDepartment(Base):
    __tablename__ = "doctor_departments"

    doctorId = Column(String(64), ForeignKey("doctors.id", ondelete="CASCADE"), primary_key=True)
    departmentId = Column(String(64), ForeignKey("departments.id", ondelete="CASCADE"), primary_key=True)

    doctor = relationship("Doctor", back_populates="departments")
    department = relationship("Department", back_populates="doctors")


class DoctorAvailability(Base):
    __tablename__ = "doctor_availability"

    id = Column(String(64), primary_key=True, index=True)
    doctorId = Column(String(64), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    weekday = Column(Integer, nullable=False)  # 0=Sun, 1=Mon, ..., 6=Sat
    startMinute = Column(Integer, nullable=False)  # e.g. 540 = 09:00
    endMinute = Column(Integer, nullable=False)    # e.g. 1020 = 17:00
    slotDurationMins = Column(Integer, default=30)
    maxPatients = Column(Integer, default=16)

    doctor = relationship("Doctor", back_populates="availability")


class AvailabilityException(Base):
    __tablename__ = "availability_exceptions"

    id = Column(String(64), primary_key=True, index=True)
    doctorId = Column(String(64), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    date = Column(DateTime, nullable=False)
    startMinute = Column(Integer, nullable=True)
    endMinute = Column(Integer, nullable=True)
    reason = Column(String(256), nullable=True)
    isFullDayLeave = Column(Boolean, default=True)

    doctor = relationship("Doctor", back_populates="exceptions")


class FacilityService(Base):
    __tablename__ = "facility_services"

    id = Column(String(64), primary_key=True, index=True)
    facilityId = Column(String(64), ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False)
    code = Column(String(64), nullable=False)
    name = Column(String(128), nullable=False)
    departmentCode = Column(String(32), nullable=True)
    feeAmountKsh = Column(Float, nullable=True)
    isCoveredBySha = Column(Boolean, default=True)

    facility = relationship("Facility", back_populates="services")


class HospitalStaff(Base):
    __tablename__ = "hospital_staff"

    id = Column(String(64), primary_key=True, index=True)
    userId = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    facilityId = Column(String(64), ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False)
    position = Column(String(128), default="Triage Receptionist")
    shift = Column(String(128), default="Morning (07:00–15:00)")
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="staff")
    facility = relationship("Facility", back_populates="staff")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(64), primary_key=True, index=True)
    patientId = Column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    languageMode = Column(String(32), default="swa_eng")
    channel = Column(String(32), default="app_chat")  # app_chat | voice_call | sms | ussd
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="conversations")
    messages = relationship("ConversationMessage", back_populates="conversation", cascade="all, delete-orphan")
    careRequests = relationship("CareRequest", back_populates="conversation")


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(String(64), primary_key=True, index=True)
    conversationId = Column(String(64), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    senderRole = Column(String(32), nullable=False)  # "patient" | "assistant" | "system" | "tool"
    content = Column(Text, nullable=False)
    isAudioSnippet = Column(Boolean, default=False)
    audioDuration = Column(String(16), nullable=True)
    dialectTag = Column(String(64), nullable=True)
    triageLevel = Column(String(64), nullable=True)
    toolCallName = Column(String(64), nullable=True)
    toolCallPayload = Column(Text, nullable=True)  # JSON string
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class CareRequest(Base):
    __tablename__ = "care_requests"

    id = Column(String(64), primary_key=True, index=True)
    referenceNumber = Column(String(32), unique=True, index=True, nullable=False)  # e.g. "#10482"
    patientId = Column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    conversationId = Column(String(64), ForeignKey("conversations.id", ondelete="SET NULL"), nullable=True)
    facilityId = Column(String(64), ForeignKey("facilities.id", ondelete="SET NULL"), nullable=True)
    departmentId = Column(String(64), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    assignedDoctorId = Column(String(64), nullable=True)
    assignedDoctorName = Column(String(128), nullable=True)
    assignedSlot = Column(String(64), nullable=True)

    verbatimTranscript = Column(Text, nullable=False)
    chiefConcern = Column(String(256), nullable=False)
    symptomDuration = Column(String(64), nullable=False)
    secondarySymptoms = Column(Text, default="[]")  # JSON array
    triageScore = Column(Integer, default=2)
    urgency = Column(String(32), default=UrgencyEnum.STANDARD)
    clinicalSummary = Column(Text, nullable=False)
    flags = Column(Text, default="[]")  # JSON array
    preferredTime = Column(String(64), nullable=True)
    preferredDate = Column(String(64), nullable=True)
    status = Column(String(32), default=RequestStatusEnum.RECEIVED)
    tokenPass = Column(String(64), nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="careRequests")
    conversation = relationship("Conversation", back_populates="careRequests")
    facility = relationship("Facility", back_populates="careRequests")
    department = relationship("Department", back_populates="careRequests")
    events = relationship("CareRequestEvent", back_populates="careRequest", cascade="all, delete-orphan")
    appointment = relationship("Appointment", back_populates="careRequest", uselist=False)


class CareRequestEvent(Base):
    __tablename__ = "care_request_events"

    id = Column(String(64), primary_key=True, index=True)
    careRequestId = Column(String(64), ForeignKey("care_requests.id", ondelete="CASCADE"), nullable=False)
    stepNumber = Column(Integer, nullable=False)
    title = Column(String(128), nullable=False)
    description = Column(String(256), nullable=False)
    actor = Column(String(64), nullable=True)
    timestampText = Column(String(32), nullable=False)
    isCompleted = Column(Boolean, default=False)
    isActive = Column(Boolean, default=False)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)

    careRequest = relationship("CareRequest", back_populates="events")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(64), primary_key=True, index=True)
    careRequestId = Column(String(64), ForeignKey("care_requests.id", ondelete="SET NULL"), unique=True, nullable=True)
    patientId = Column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    facilityId = Column(String(64), ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False)
    doctorId = Column(String(64), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)

    startsAt = Column(DateTime, nullable=False)
    endsAt = Column(DateTime, nullable=False)
    slotLabel = Column(String(64), nullable=False)  # e.g. "Kesho 10:30 AM"
    status = Column(String(32), default=AppointmentStatusEnum.PENDING)
    tokenPass = Column(String(64), unique=True, index=True, nullable=False)
    notes = Column(Text, nullable=True)
    isCheckInScanned = Column(Boolean, default=False)
    scannedAt = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    careRequest = relationship("CareRequest", back_populates="appointment")
    patient = relationship("Patient", back_populates="appointments")
    facility = relationship("Facility", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(64), primary_key=True, index=True)
    patientId = Column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    channel = Column(String(32), default=NotificationChannelEnum.SMS)
    title = Column(String(128), nullable=False)
    message = Column(Text, nullable=False)
    isSent = Column(Boolean, default=True)
    sentAt = Column(DateTime, default=datetime.datetime.utcnow)
    readAt = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="notifications")


class LocationRecord(Base):
    __tablename__ = "location_records"

    id = Column(String(64), primary_key=True, index=True)
    patientId = Column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accuracyMeters = Column(Float, nullable=True)
    resolvedArea = Column(String(128), nullable=False)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="locationRecords")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    action = Column(String(64), nullable=False)
    actorId = Column(String(64), nullable=True)
    actorRole = Column(String(32), nullable=True)
    actorName = Column(String(128), nullable=True)
    targetEntity = Column(String(64), nullable=True)
    targetId = Column(String(64), nullable=True)
    details = Column(Text, nullable=False)
    ipAddress = Column(String(64), nullable=True)
