import json
import datetime
from sqlalchemy.orm import Session
from .connection import Base, engine, SessionLocal
from .models import (
    User,
    Patient,
    HospitalStaff,
    Doctor,
    Department,
    DoctorDepartment,
    DoctorAvailability,
    Facility,
    FacilityService,
    CareRequest,
    CareRequestEvent,
    Appointment,
    Notification,
    AuditLog,
    RoleEnum,
    RequestStatusEnum,
    UrgencyEnum,
    AppointmentStatusEnum,
)


def seed_database(db: Session = None):
    close_db = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_db = True

    try:
        # Check if already seeded
        if db.query(Facility).count() > 0:
            return

        print("Seeding AfyaConnect database...")

        # 1. Users
        patient_user = User(
            id="u-jane-1",
            phone="+254712345678",
            email="jane.m@example.com",
            name="Jane M.",
            role=RoleEnum.PATIENT,
            preferredLanguage="swa_eng",
        )
        staff_user = User(
            id="u-staff-1",
            phone="+254722000111",
            email="intake.agakhan@afyaconnect.ke",
            name="Grace Muthoni",
            role=RoleEnum.HOSPITAL_STAFF,
            preferredLanguage="swa_eng",
        )
        doctor_user = User(
            id="u-kamau-1",
            phone="+254733000222",
            email="dr.kamau@agakhan.org",
            name="Dr. Wanjiku Kamau",
            role=RoleEnum.DOCTOR,
            preferredLanguage="swa_eng",
        )
        admin_user = User(
            id="u-admin-1",
            phone="+254700999888",
            email="admin@afyaconnect.ke",
            name="Dr. Omondi (MOH Liaison)",
            role=RoleEnum.SYSTEM_ADMIN,
            preferredLanguage="eng",
        )

        db.add_all([patient_user, staff_user, doctor_user, admin_user])
        db.flush()

        # 2. Patient Profile
        patient_profile = Patient(
            id="pat-jane-1",
            userId=patient_user.id,
            nationalId="32984112",
            insuranceProvider="SHA Active",
            insuranceNumber="602931-B",
        )
        db.add(patient_profile)

        # 3. Facilities
        f_agakhan = Facility(
            id="f-agakhan",
            name="Aga Khan Univ. Hospital",
            level="Level 6 Referral",
            accreditation="SHA Verified",
            address="Parklands Clinic • 3rd Parklands Avenue",
            subCounty="Westlands & Parklands Sub-County",
            city="Nairobi",
            latitude=-1.2635,
            longitude=36.8202,
            phone="+254 20 366 2000",
            email="casualty@aku.edu",
            imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuB5RnNBjrooXB03VO6Mr1X5PNeqNVkEKBmihBc4kFIMRinNDpX76gP4V5yDcx47-hkZuj8p0sRnvHoS8ssxBa2Cms9pKSa01gSbH1nX5s5RqbuvCKvVnsqJzhW5nnaLd6dAl6_xAcq0GAQG5Crcto56Yhd-BQecA-cb60Kw47sCNNHxKtEFldY-rxlKM4FknS_RZmO79wn5L0uPi9DeuZbBKqqCxzxXJEjAg5unk-yIiH9mInTG-EhP",
            isEmergencyReady=True,
            isPublic=False,
            acceptsInsurance="SHA,NHIF,Britam,Jubilee,Cash,M-PESA",
        )

        f_mpshah = Facility(
            id="f-mpshah",
            name="MP Shah Hospital",
            level="Level 5 Hospital",
            accreditation="SHA Accredited",
            address="Shivachi Road, Parklands",
            subCounty="Parklands Sub-County",
            city="Nairobi",
            latitude=-1.2678,
            longitude=36.8125,
            phone="+254 20 429 1000",
            email="info@mpshahhospital.org",
            imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuC3F103G3pdmJhsqyvbE3Gr3p7kHcNvmWRULXQpIprMyGcu2HRVXxDjAi17MhistTmyDCH2GLgTDUzWm1pBYpzI2HI0fmQEzERDYOwE4cGkOpkQq58JenadDHA0ztdUMULEw-JHjkdHBq_2HZMqxhcEopM1z-v3twNFOGUQQIzfTpu-h9C0wOxWcf2R0oNf2-_nXNv4UreIjOcS3kfX3uf3lR9VWqARyxGr02z_katlAors1DK0ck5h",
            isEmergencyReady=True,
            isPublic=False,
            acceptsInsurance="SHA,NHIF,M-PESA,Cash,AAR,First Assurance",
        )

        f_westlands = Facility(
            id="f-westlands",
            name="Westlands Sub-County Clinic",
            level="Level 4 Public Centre",
            accreditation="Linda Mama Free",
            address="Commercial Street, Westlands",
            subCounty="Westlands Sub-County",
            city="Nairobi",
            latitude=-1.2690,
            longitude=36.8050,
            phone="+254 20 444 3211",
            email="westlands.hosp@nairobi.go.ke",
            imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuAAT-8u3aZAdJ9ji_CEIfm_lwS6RJodz6SWzmUhPPbzCIjVGvotbJufcZrqwHM2P7Qkex6yGVmRehHU5Cf4Oc4NyVvzYf3a_k5-r4hfdAXpq9KkoGo5nTFPKGu6QUfYz9pX3af-u2-hFwHyDnKbCFH-txHWklop3xQMILktGKpefMLdBoALG-tqreN6SueSnQeyAaCWtme2oLNW0fyHH4ganZlzhcT_vMQQUymlVDjR6NhM1g1QNgxY",
            isEmergencyReady=True,
            isPublic=True,
            acceptsInsurance="Universal SHA Coverage,Linda Mama Free,GoK Subsidized",
        )

        f_avenue = Facility(
            id="f-avenue",
            name="Avenue Hospital",
            level="Level 5 Hospital",
            accreditation="SHA / NHIF Verified",
            address="1st Parklands Avenue",
            subCounty="Parklands Sub-County",
            city="Nairobi",
            latitude=-1.2660,
            longitude=36.8180,
            phone="+254 711 060 000",
            email="info@avenuehealthcare.com",
            imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuAAT-8u3aZAdJ9ji_CEIfm_lwS6RJodz6SWzmUhPPbzCIjVGvotbJufcZrqwHM2P7Qkex6yGVmRehHU5Cf4Oc4NyVvzYf3a_k5-r4hfdAXpq9KkoGo5nTFPKGu6QUfYz9pX3af-u2-hFwHyDnKbCFH-txHWklop3xQMILktGKpefMLdBoALG-tqreN6SueSnQeyAaCWtme2oLNW0fyHH4ganZlzhcT_vMQQUymlVDjR6NhM1g1QNgxY",
            isEmergencyReady=True,
            isPublic=False,
            acceptsInsurance="SHA,NHIF,AAR,Jubilee,Cash",
        )

        db.add_all([f_agakhan, f_mpshah, f_westlands, f_avenue])
        db.flush()

        # 4. Departments
        dept_general = Department(id="d-aga-gen", facilityId=f_agakhan.id, name="General Consultation", code="OPD")
        dept_ent = Department(id="d-aga-ent", facilityId=f_agakhan.id, name="ENT", code="ENT")
        dept_ped = Department(id="d-aga-ped", facilityId=f_agakhan.id, name="Pediatrics", code="PED")
        dept_derm = Department(id="d-mp-derm", facilityId=f_mpshah.id, name="Dermatology", code="DERM")
        dept_mch = Department(id="d-west-mch", facilityId=f_westlands.id, name="Pediatrics & MCH", code="MCH")

        db.add_all([dept_general, dept_ent, dept_ped, dept_derm, dept_mch])
        db.flush()

        # 5. Doctors
        doc_kamau = Doctor(
            id="doc-kamau-1",
            userId=doctor_user.id,
            facilityId=f_agakhan.id,
            fullName="Dr. Wanjiku Kamau",
            initials="WK",
            specialty="General Physician",
            qualification="MBChB (UoN), MMed",
            yearsExperience=12,
            roomNumber="Room 04, Ground Floor",
            consultationMinutes=30,
            isOnDuty=True,
        )
        doc_achieng = Doctor(
            id="doc-achieng-1",
            facilityId=f_agakhan.id,
            fullName="Dr. Achieng",
            initials="DA",
            specialty="Internal Medicine & ENT",
            qualification="MD, FCP(ECSA)",
            yearsExperience=10,
            roomNumber="Room 08",
            consultationMinutes=30,
            isOnDuty=True,
        )
        doc_mwangi = Doctor(
            id="doc-mwangi-1",
            facilityId=f_mpshah.id,
            fullName="Dr. Mwangi",
            initials="DM",
            specialty="Consultant Dermatologist",
            qualification="MBChB, MMed Derm",
            yearsExperience=14,
            roomNumber="OPD Suite 2",
            consultationMinutes=30,
            isOnDuty=True,
        )
        doc_co_team = Doctor(
            id="doc-west-co",
            facilityId=f_westlands.id,
            fullName="Clinical Officer Team",
            initials="CO",
            specialty="Walk-in Triage & General OPD",
            qualification="Registered Clinical Officers",
            yearsExperience=8,
            roomNumber="Triage Room 1-3",
            consultationMinutes=20,
            isOnDuty=True,
        )

        db.add_all([doc_kamau, doc_achieng, doc_mwangi, doc_co_team])
        db.flush()

        # Doctor Departments
        db.add_all([
            DoctorDepartment(doctorId=doc_kamau.id, departmentId=dept_general.id),
            DoctorDepartment(doctorId=doc_achieng.id, departmentId=dept_ent.id),
            DoctorDepartment(doctorId=doc_mwangi.id, departmentId=dept_derm.id),
            DoctorDepartment(doctorId=doc_co_team.id, departmentId=dept_mch.id),
        ])

        # Doctor Availability
        for doc in [doc_kamau, doc_achieng, doc_mwangi, doc_co_team]:
            for weekday in range(1, 6):  # Mon-Fri
                db.add(DoctorAvailability(
                    id=f"avail-{doc.id}-{weekday}",
                    doctorId=doc.id,
                    weekday=weekday,
                    startMinute=540,  # 09:00
                    endMinute=1020,   # 17:00
                    slotDurationMins=30,
                    maxPatients=16,
                ))

        # 6. Care Requests (Matching prompt cases: #10482, #10483, #10484, #10485, #10486)
        req_10482 = CareRequest(
            id="req-10482",
            referenceNumber="#10482",
            patientId=patient_profile.id,
            facilityId=f_agakhan.id,
            departmentId=dept_general.id,
            assignedDoctorId=doc_kamau.id,
            assignedDoctorName="Dr. Wanjiku Kamau",
            assignedSlot="Kesho 10:30 AM",
            verbatimTranscript="Nimekuwa na maumivu ya tumbo for the last two days, na nahisi homa kali sana tangu jana usiku. Kesho morning would be okay kama daktari yuko.",
            chiefConcern="Cephalea & Abdominal Pain",
            symptomDuration="2-3 days",
            secondarySymptoms=json.dumps(["Intermittent Vertigo", "Postural trigger", "Fever spike"]),
            triageScore=4,
            urgency=UrgencyEnum.URGENT,
            clinicalSummary="Abdominal pain x 48h with fever spike. Patient requests General Consultation slot for tomorrow morning (10:30 AM).",
            flags=json.dumps(["Vitals check required", "Symptom onset: 48h", "Fever flag"]),
            preferredTime="Tomorrow morning (10:30 AM)",
            preferredDate="Kesho, Jumanne 24 Sept",
            status=RequestStatusEnum.CONFIRMED,
            tokenPass="#AC-NBO-8492",
        )

        req_10483 = CareRequest(
            id="req-10483",
            referenceNumber="#10483",
            patientId=patient_profile.id,
            facilityId=f_mpshah.id,
            departmentId=dept_derm.id,
            assignedDoctorId=doc_mwangi.id,
            assignedDoctorName="Dr. Mwangi",
            assignedSlot="Leo 5:00 PM",
            verbatimTranscript="I have had an itchy red rash spreading along my left forearm for about a week now.",
            chiefConcern="Erythematous Cutaneous Rash",
            symptomDuration="7 days",
            secondarySymptoms=json.dumps(["Pruritus", "Localized spreading"]),
            triageScore=2,
            urgency=UrgencyEnum.STANDARD,
            clinicalSummary="Persistent localized erythema/rash x 7 days without systemic fever. Requesting specialist evaluation this week.",
            flags=json.dumps(["No fever", "Non-acute", "OPD follow-up"]),
            preferredTime="Today PM",
            status=RequestStatusEnum.CHECKING_AVAILABILITY,
            tokenPass="#AC-NBO-8493",
        )

        req_10484 = CareRequest(
            id="req-10484",
            referenceNumber="#10484",
            patientId=patient_profile.id,
            facilityId=f_agakhan.id,
            departmentId=dept_ent.id,
            assignedDoctorId=doc_achieng.id,
            assignedDoctorName="Dr. Achieng",
            assignedSlot="Leo 2:00 PM",
            verbatimTranscript="Nahitaji ukaguzi wa masikio na koo. Nimekuwa nikisikia mlio kwa wiki moja.",
            chiefConcern="Tinnitus & Throat Discomfort",
            symptomDuration="7 days",
            secondarySymptoms=json.dumps(["Unilateral ear ringing", "Mild dysphagia"]),
            triageScore=3,
            urgency=UrgencyEnum.STANDARD,
            clinicalSummary="ENT Check-up booked with Dr. Achieng for Today at 2:00 PM (Room 14, Wing B).",
            flags=json.dumps(["Tinnitus evaluation", "SHA Verified"]),
            preferredTime="Today 2:00 PM",
            status=RequestStatusEnum.CONFIRMED,
            tokenPass="#AC-NBO-7729",
        )

        req_10485 = CareRequest(
            id="req-10485",
            referenceNumber="#10485",
            patientId=patient_profile.id,
            facilityId=f_agakhan.id,
            departmentId=dept_general.id,
            assignedDoctorId=doc_kamau.id,
            assignedDoctorName="Dr. Kamau",
            verbatimTranscript="Nahitaji regular blood pressure checkup na refill ya dawa za BP. Pia nataka daktari aangalie mguu wangu uliofura kidogo.",
            chiefConcern="Hypertension Follow-up & Peripheral Edema",
            symptomDuration="Ongoing",
            secondarySymptoms=json.dumps(["Bilateral pedal edema", "Medication refill needed"]),
            triageScore=2,
            urgency=UrgencyEnum.ROUTINE,
            clinicalSummary="Routine cardiovascular review and refill. Edema mild, ambulatory.",
            flags=json.dumps(["Hypertension flag", "Refill pending"]),
            preferredTime="Friday morning",
            status=RequestStatusEnum.RECEIVED,
        )

        req_10486 = CareRequest(
            id="req-10486",
            referenceNumber="#10486",
            patientId=patient_profile.id,
            facilityId=f_westlands.id,
            departmentId=dept_mch.id,
            assignedDoctorId=doc_co_team.id,
            assignedDoctorName="Clinical Officer Team",
            verbatimTranscript="Mtoto wangu wa miezi kumi na minane ana joto jingi na anakataa kula tangu asubuhi.",
            chiefConcern="Pediatric Pyrexia & Poor Feeding",
            symptomDuration="12 hours",
            secondarySymptoms=json.dumps(["High fever", "Anorexia in toddler", "Lethargy"]),
            triageScore=4,
            urgency=UrgencyEnum.URGENT,
            clinicalSummary="18-month toddler with acute fever and anorexia. Fast track pediatric triage recommended.",
            flags=json.dumps(["Pediatric alert", "Fever flag", "Urgent intake"]),
            preferredTime="Immediate / Today AM",
            status=RequestStatusEnum.RECEIVED,
        )

        db.add_all([req_10482, req_10483, req_10484, req_10485, req_10486])
        db.flush()

        # 7. Timeline Events for #10482 (All 8 steps completed)
        timeline_10482_data = [
            (1, "CALL / CHAT MADE", "Patient initiated triage conversation via app / audio", "09:14 AM", True, False),
            (2, "Request received", "Triage intake logged and pre-screened", "09:15 AM", True, False),
            (3, "Hospital received request", "Aga Khan hospital intake and triage queue synced", "09:16 AM", True, False),
            (4, "Department identified", "General Consultation (OPD)", "09:18 AM", True, False),
            (5, "Doctor availability checked", "Dr. Kamau calendar confirmed", "09:22 AM", True, False),
            (6, "Time proposed", "Tomorrow at 10:30 AM proposed to patient", "09:23 AM", True, False),
            (7, "Patient confirmed", "Patient approved appointment time", "09:24 AM", True, False),
            (8, "APPOINTMENT BOOKED", "Booking confirmed • Token #AC-NBO-8492 issued", "09:24 AM", True, True),
        ]
        for step, title, desc, ts, comp, act in timeline_10482_data:
            db.add(CareRequestEvent(
                id=f"evt-10482-{step}",
                careRequestId=req_10482.id,
                stepNumber=step,
                title=title,
                description=desc,
                actor="Hospital Intake Gateway",
                timestampText=ts,
                isCompleted=comp,
                isActive=act,
            ))

        # 8. Appointments
        appt_10482 = Appointment(
            id="appt-10482",
            careRequestId=req_10482.id,
            patientId=patient_profile.id,
            facilityId=f_agakhan.id,
            doctorId=doc_kamau.id,
            startsAt=datetime.datetime.utcnow() + datetime.timedelta(days=1, hours=2),
            endsAt=datetime.datetime.utcnow() + datetime.timedelta(days=1, hours=2, minutes=30),
            slotLabel="Kesho 10:30 AM",
            status=AppointmentStatusEnum.CONFIRMED,
            tokenPass="#AC-NBO-8492",
            notes="Triage Level 4: Cephalea & Abdominal pain x 48h. Vitals check on arrival.",
        )
        db.add(appt_10482)

        # 9. Audit Logs
        db.add_all([
            AuditLog(
                id="log-1",
                action="REQUEST_CREATED",
                actorRole="PATIENT",
                actorName="Jane M.",
                targetEntity="CareRequest",
                targetId=req_10482.id,
                details="Patient created care request via bilingual audio intake.",
            ),
            AuditLog(
                id="log-2",
                action="SLOT_PROPOSED",
                actorRole="SYSTEM",
                actorName="Claude Agent Orchestrator",
                targetEntity="DoctorAvailability",
                targetId=doc_kamau.id,
                details="Slot Kesho 10:30 AM held for Jane M.",
            ),
            AuditLog(
                id="log-3",
                action="APPOINTMENT_CONFIRMED",
                actorRole="HOSPITAL_STAFF",
                actorName="Grace Muthoni",
                targetEntity="Appointment",
                targetId=appt_10482.id,
                details="Confirmed appointment and dispatched pass #AC-NBO-8492 via SMS.",
            ),
        ])

        db.commit()
        print("AfyaConnect database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        if close_db:
            db.close()


if __name__ == "__main__":
    seed_database()
