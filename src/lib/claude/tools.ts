/**
 * AfyaConnect Claude API Tool Definitions
 * Defines the tool schemas for Claude tool-use in the healthcare access platform.
 */

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const AFYACONNECT_TOOLS: ToolDefinition[] = [
  {
    name: 'find_nearby_facilities',
    description: 'Finds participating healthcare facilities near the patient based on location radius and optional specialty care pathway.',
    input_schema: {
      type: 'object',
      properties: {
        radiusKm: {
          type: 'number',
          description: 'Maximum search radius in kilometers (default: 5km).',
        },
        carePathway: {
          type: 'string',
          enum: ['General Consultation', 'Pediatrics', 'ENT', 'Dental', 'Maternity', 'Emergency', 'All'],
          description: 'The care department or specialty needed.',
        },
        insuranceProvider: {
          type: 'string',
          description: 'Optional insurance filter (e.g. "SHA", "NHIF", "Linda Mama", "Britam").',
        },
      },
    },
  },
  {
    name: 'check_doctor_availability',
    description: 'Checks the verified hospital duty roster for doctor availability and real open appointment slots. Essential anti-hallucination tool.',
    input_schema: {
      type: 'object',
      properties: {
        facilityId: {
          type: 'string',
          description: 'The unique ID of the participating facility (e.g. "f-agakhan", "f-avenue", "f-mpshah", "f-westlands").',
        },
        departmentCode: {
          type: 'string',
          description: 'Department code e.g. "OPD", "PED", "ENT", "DENT".',
        },
        preferredDay: {
          type: 'string',
          enum: ['today', 'tomorrow', 'this_week'],
          description: 'The target timeframe for the appointment.',
        },
      },
      required: ['facilityId'],
    },
  },
  {
    name: 'create_care_request',
    description: 'Creates a structured patient intake case in the hospital dashboard queue for triage staff review.',
    input_schema: {
      type: 'object',
      properties: {
        patientName: {
          type: 'string',
          description: 'Name of the patient or alias (e.g. "Jane M.").',
        },
        verbatimTranscript: {
          type: 'string',
          description: 'Exact text or transcript spoken by the patient in Swahili/English/Sheng.',
        },
        chiefConcern: {
          type: 'string',
          description: 'Extracted primary symptom or concern (e.g. "Abdominal pain x 48h").',
        },
        triageScore: {
          type: 'number',
          description: 'Triage urgency score from 1 (routine) to 5 (emergency).',
        },
        urgency: {
          type: 'string',
          enum: ['Routine', 'Standard', 'Urgent', 'Emergency'],
        },
        facilityId: {
          type: 'string',
          description: 'Selected facility ID.',
        },
        preferredSlot: {
          type: 'string',
          description: 'Requested time slot e.g. "Leo 2:30 PM" or "Kesho 10:30 AM".',
        },
      },
      required: ['chiefConcern', 'triageScore', 'urgency'],
    },
  },
  {
    name: 'propose_appointment_slot',
    description: 'Temporarily holds a doctor slot for patient review and confirmation.',
    input_schema: {
      type: 'object',
      properties: {
        careRequestId: {
          type: 'string',
          description: 'The ID of the care request being scheduled.',
        },
        doctorName: {
          type: 'string',
          description: 'Name of the doctor.',
        },
        slotTime: {
          type: 'string',
          description: 'Slot time (e.g. "Kesho 10:30 AM").',
        },
      },
      required: ['doctorName', 'slotTime'],
    },
  },
  {
    name: 'confirm_appointment',
    description: 'Finalizes the appointment booking, generates digital pass token, and triggers SMS confirmation.',
    input_schema: {
      type: 'object',
      properties: {
        careRequestId: {
          type: 'string',
          description: 'The care request reference (e.g. "#10482").',
        },
        patientPhone: {
          type: 'string',
          description: 'Patient mobile phone number for M-PESA & SMS pass dispatch.',
        },
        facilityName: {
          type: 'string',
          description: 'Hospital facility name.',
        },
        doctorName: {
          type: 'string',
          description: 'Assigned doctor name.',
        },
        slotTime: {
          type: 'string',
          description: 'Confirmed time slot.',
        },
      },
      required: ['patientPhone', 'doctorName', 'slotTime'],
    },
  },
  {
    name: 'reschedule_appointment',
    description: 'Updates an existing appointment to a new available time slot.',
    input_schema: {
      type: 'object',
      properties: {
        appointmentId: {
          type: 'string',
          description: 'ID or token pass of the appointment.',
        },
        newSlotTime: {
          type: 'string',
          description: 'New desired slot time.',
        },
        reason: {
          type: 'string',
          description: 'Reason for rescheduling.',
        },
      },
      required: ['appointmentId', 'newSlotTime'],
    },
  },
  {
    name: 'cancel_appointment',
    description: 'Cancels an appointment and notifies hospital reception to release the doctor slot.',
    input_schema: {
      type: 'object',
      properties: {
        appointmentId: {
          type: 'string',
          description: 'ID or token pass of the appointment to cancel.',
        },
        cancellationReason: {
          type: 'string',
          description: 'Optional reason for cancellation.',
        },
      },
      required: ['appointmentId'],
    },
  },
];
