AFYACONNECT_CLAUDE_TOOLS = [
    {
        "name": "find_nearby_facilities",
        "description": "Finds participating healthcare facilities near the patient based on location radius and optional specialty care pathway.",
        "input_schema": {
            "type": "object",
            "properties": {
                "radiusKm": {
                    "type": "number",
                    "description": "Maximum search radius in kilometers (default: 5km).",
                },
                "carePathway": {
                    "type": "string",
                    "enum": ["General Consultation", "Pediatrics", "ENT", "Dental", "Maternity", "Emergency", "All"],
                    "description": "The care department or specialty needed.",
                },
                "insuranceProvider": {
                    "type": "string",
                    "description": "Optional insurance filter (e.g. 'SHA', 'NHIF', 'Linda Mama', 'Britam').",
                },
            },
        },
    },
    {
        "name": "check_doctor_availability",
        "description": "Checks the verified hospital duty roster for doctor availability and real open appointment slots. Essential anti-hallucination tool.",
        "input_schema": {
            "type": "object",
            "properties": {
                "facilityId": {
                    "type": "string",
                    "description": "The unique ID of the participating facility (e.g. 'f-agakhan', 'f-avenue', 'f-mpshah', 'f-westlands').",
                },
                "departmentCode": {
                    "type": "string",
                    "description": "Department code e.g. 'OPD', 'PED', 'ENT', 'DERM'.",
                },
                "preferredDay": {
                    "type": "string",
                    "enum": ["today", "tomorrow", "this_week"],
                    "description": "Target appointment day.",
                },
            },
            "required": ["facilityId"],
        },
    },
    {
        "name": "create_appointment_request",
        "description": "Creates a structured patient intake request in the hospital dashboard queue for triage staff review.",
        "input_schema": {
            "type": "object",
            "properties": {
                "patientName": {"type": "string"},
                "verbatimTranscript": {"type": "string"},
                "chiefConcern": {"type": "string"},
                "triageScore": {"type": "number"},
                "urgency": {"type": "string", "enum": ["Routine", "Standard", "Urgent", "Emergency"]},
                "facilityId": {"type": "string"},
                "preferredSlot": {"type": "string"},
            },
            "required": ["chiefConcern", "triageScore", "urgency"],
        },
    },
    {
        "name": "propose_appointment",
        "description": "Temporarily holds a doctor slot for patient review and confirmation.",
        "input_schema": {
            "type": "object",
            "properties": {
                "careRequestId": {"type": "string"},
                "doctorName": {"type": "string"},
                "slotTime": {"type": "string"},
            },
            "required": ["doctorName", "slotTime"],
        },
    },
    {
        "name": "confirm_appointment",
        "description": "Finalizes the appointment booking, generates digital pass token, and triggers SMS confirmation.",
        "input_schema": {
            "type": "object",
            "properties": {
                "careRequestId": {"type": "string"},
                "patientPhone": {"type": "string"},
                "facilityName": {"type": "string"},
                "doctorName": {"type": "string"},
                "slotTime": {"type": "string"},
            },
            "required": ["patientPhone", "doctorName", "slotTime"],
        },
    },
    {
        "name": "reschedule_appointment",
        "description": "Updates an existing appointment to a new available time slot.",
        "input_schema": {
            "type": "object",
            "properties": {
                "appointmentId": {"type": "string"},
                "newSlotTime": {"type": "string"},
                "reason": {"type": "string"},
            },
            "required": ["appointmentId", "newSlotTime"],
        },
    },
    {
        "name": "cancel_appointment",
        "description": "Cancels an appointment and notifies hospital reception to release the doctor slot.",
        "input_schema": {
            "type": "object",
            "properties": {
                "appointmentId": {"type": "string"},
                "cancellationReason": {"type": "string"},
            },
            "required": ["appointmentId"],
        },
    },
    {
        "name": "get_appointment_status",
        "description": "Retrieves the live 8-step timeline status for an appointment request.",
        "input_schema": {
            "type": "object",
            "properties": {
                "careRequestId": {"type": "string"},
            },
            "required": ["careRequestId"],
        },
    },
]
