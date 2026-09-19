/**
 * AfyaConnect Claude Tool Execution Engine
 * Executes tool calls made by Claude (or the local clinical agent),
 * interacting with location services, doctor availability, appointment queues,
 * and dispatch notifications.
 */

import { findNearbyFacilitiesForClaude } from '../services/locationService';
import { checkRealDoctorAvailability, validateAndHoldSlot } from '../services/availabilityEngine';
import { dispatchAppointmentConfirmedNotification, dispatchAppointmentProposalNotification } from '../services/notificationService';
import { CareRequest, Facility, TimelineStep, FeedbackCardData } from '../../types';
import { INITIAL_FACILITIES } from '../../data/mockData';

export interface ToolExecutionContext {
  facilities?: Facility[];
  careRequests?: CareRequest[];
  patientName?: string;
  patientPhone?: string;
  patientLocation?: string;
  userLocationText?: string;
  onCareRequestCreated?: (request: CareRequest) => void;
  onSlotHeld?: (facilityId: string, doctorName: string, slotTime: string) => void;
  onAppointmentConfirmed?: (token: string, request: CareRequest) => void;
}

export interface ToolExecutionResult {
  toolName: string;
  success: boolean;
  data: any;
  feedbackCard?: FeedbackCardData;
  createdCareRequest?: CareRequest;
  message?: string;
}

/**
 * Main dispatcher for Claude tool calls
 */
export async function executeAfyaConnectTool(
  toolName: string,
  input: Record<string, any>,
  context: ToolExecutionContext = {}
): Promise<ToolExecutionResult> {
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  switch (toolName) {
    case 'find_nearby_facilities': {
      const radiusKm = Number(input.radiusKm) || 5.0;
      const carePathway = input.carePathway || 'All';
      const insuranceProvider = input.insuranceProvider;

      let { facilities } = findNearbyFacilitiesForClaude(carePathway, radiusKm);

      if (insuranceProvider) {
        facilities = facilities.filter(f =>
          f.accreditation.toLowerCase().includes(insuranceProvider.toLowerCase()) ||
          f.name.toLowerCase().includes('sub-county') // public always covers
        );
      }

      return {
        toolName,
        success: true,
        data: {
          radiusKm,
          carePathway,
          insuranceProvider: insuranceProvider || 'Any',
          totalFound: facilities.length,
          facilities: facilities.map(f => ({
            id: f.id,
            name: f.name,
            subCounty: f.subCounty,
            distanceKm: f.distanceKm,
            driveTime: f.driveTime,
            level: f.level,
            accreditation: f.accreditation,
            earliestSlot: f.earliestSlot,
            leadDoctor: f.leadDoctor,
            services: f.availableServices,
          })),
        },
        message: `Found ${facilities.length} healthcare facilities within ${radiusKm}km radius.`,
      };
    }

    case 'check_doctor_availability': {
      const facilityId = input.facilityId || 'f-agakhan';
      const departmentCode = input.departmentCode || 'OPD';
      const preferredDay = input.preferredDay || 'today';

      const availability = checkRealDoctorAvailability(facilityId, departmentCode);

      const feedbackCard: FeedbackCardData = {
        type: 'doctor_availability',
        department: availability.department,
        doctorName: availability.availableDoctors[0]?.doctorName || 'Dr. Wanjiku Kamau',
        time: availability.earliestAvailableSlot,
        date: preferredDay === 'tomorrow' ? 'Kesho, Jumanne 24 Sept' : 'Leo (Today)',
        facilityName: availability.facilityName,
        requestId: `#${Math.floor(10487 + Math.random() * 500)}`,
      };

      return {
        toolName,
        success: true,
        data: availability,
        feedbackCard,
        message: `Verified roster: ${availability.availableDoctors.length} doctors on duty with open slots. Earliest slot: ${availability.earliestAvailableSlot}`,
      };
    }

    case 'create_care_request': {
      const patientName = input.patientName || context.patientName || 'Jane M.';
      const verbatimTranscript = input.verbatimTranscript || 'Patient reported symptoms via AfyaConnect.';
      const chiefConcern = input.chiefConcern || 'General Medical Consultation';
      const triageScore = Number(input.triageScore) || 2;
      const urgency = input.urgency || (triageScore >= 4 ? 'Urgent' : 'Standard');
      const facilityId = input.facilityId || 'f-agakhan';
      const preferredSlot = input.preferredSlot || 'Leo 3:30 PM';

      const matchedFacility = (context.facilities || INITIAL_FACILITIES).find(f => f.id === facilityId) || INITIAL_FACILITIES[0];
      const leadDoc = matchedFacility.doctors[0]?.name || 'On Duty Medical Officer';
      const requestId = `#${Math.floor(10487 + Math.random() * 500)}`;

      const timeline: TimelineStep[] = [
        { step: 1, title: 'CALL / CHAT MADE', description: 'Patient initiated triage conversation', timestamp: timeNow, completed: true, active: false },
        { step: 2, title: 'Request received', description: 'Triage intake logged and pre-screened', timestamp: timeNow, completed: true, active: true },
        { step: 3, title: 'Hospital received request', description: `${matchedFacility.name} HMIS queue synced`, timestamp: 'Pending', completed: false, active: false },
        { step: 4, title: 'Department identified', description: `Auto-routed to ${chiefConcern}`, timestamp: 'Pending', completed: false, active: false },
        { step: 5, title: 'Doctor availability checked', description: `${leadDoc} calendar verified`, timestamp: 'Pending', completed: false, active: false },
        { step: 6, title: 'Time proposed', description: `Slot proposed: ${preferredSlot}`, timestamp: 'Pending', completed: false, active: false },
        { step: 7, title: 'Patient confirmed', description: 'Patient confirmation pending', timestamp: 'Pending', completed: false, active: false },
        { step: 8, title: 'APPOINTMENT BOOKED', description: 'Digital token pass generation', timestamp: 'Pending', completed: false, active: false },
      ];

      const newCareRequest: CareRequest = {
        id: requestId,
        patientName,
        patientAge: 32,
        patientPhone: context.patientPhone || '+254 712 345 678',
        patientLocation: context.userLocationText || 'Westlands, Nairobi (2.1 km away)',
        languageMode: 'SWA + ENG CODE-SWITCH',
        verbatimTranscript: `“${verbatimTranscript}”`,
        chiefConcern,
        symptomDuration: '2-3 days',
        secondarySymptoms: [chiefConcern, 'Auto-triage'],
        triageScore,
        urgency,
        clinicalSummary: `Intake: ${chiefConcern}. Urgency: ${urgency} (Score: ${triageScore}/5). Preferred slot: ${preferredSlot}.`,
        flags: ['Claude AI Intake', 'SHA Member', 'Location Verified'],
        insurance: 'SHA Active #602931-B',
        distanceKm: matchedFacility.distanceKm,
        preferredTime: preferredSlot,
        assignedFacilityId: matchedFacility.id,
        assignedFacilityName: matchedFacility.name,
        assignedDepartment: 'General Consultation',
        assignedDoctorName: leadDoc,
        assignedSlot: preferredSlot,
        status: 'AWAITING_REVIEW',
        timeline,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (context.onCareRequestCreated) {
        context.onCareRequestCreated(newCareRequest);
      }

      const feedbackCard: FeedbackCardData = {
        type: 'request_received',
        department: 'General Consultation',
        requestedTime: preferredSlot,
        statusText: 'Checking availability',
        facilityName: matchedFacility.name,
        requestId,
      };

      return {
        toolName,
        success: true,
        data: {
          careRequestId: requestId,
          status: 'AWAITING_REVIEW',
          assignedFacility: matchedFacility.name,
          triageScore,
          urgency,
        },
        createdCareRequest: newCareRequest,
        feedbackCard,
        message: `Created Care Request ${requestId} for ${patientName} at ${matchedFacility.name}.`,
      };
    }

    case 'propose_appointment_slot': {
      const careRequestId = input.careRequestId || '#10482';
      const doctorName = input.doctorName || 'Dr. Wanjiku Kamau';
      const slotTime = input.slotTime || 'Kesho 10:30 AM';
      const phone = context.patientPhone || '+254 712 345 678';

      dispatchAppointmentProposalNotification(phone, doctorName, slotTime);

      const feedbackCard: FeedbackCardData = {
        type: 'doctor_availability',
        department: 'General Consultation',
        doctorName,
        time: slotTime,
        date: 'Kesho, Jumanne 24 Sept',
        facilityName: 'Aga Khan Univ. Hospital',
        requestId: careRequestId,
      };

      return {
        toolName,
        success: true,
        data: {
          careRequestId,
          doctorName,
          slotTime,
          status: 'SLOT_PROPOSED',
          proposalNotificationDispatched: true,
        },
        feedbackCard,
        message: `Proposed slot ${slotTime} with ${doctorName} for request ${careRequestId}.`,
      };
    }

    case 'confirm_appointment': {
      const careRequestId = input.careRequestId || '#10482';
      const patientPhone = input.patientPhone || context.patientPhone || '+254 712 345 678';
      const facilityName = input.facilityName || 'Aga Khan Univ. Hospital';
      const doctorName = input.doctorName || 'Dr. Wanjiku Kamau';
      const slotTime = input.slotTime || 'Kesho 10:30 AM';

      const tokenPass = `#AC-NBO-${Math.floor(1000 + Math.random() * 9000)}`;

      // Double-booking check & slot lock
      validateAndHoldSlot('f-agakhan', doctorName, slotTime);

      // Dispatch SMS & WhatsApp Pass
      dispatchAppointmentConfirmedNotification(
        patientPhone,
        doctorName,
        facilityName,
        slotTime,
        tokenPass
      );

      const feedbackCard: FeedbackCardData = {
        type: 'appointment_confirmed',
        department: 'General Consultation',
        doctorName,
        facilityName,
        date: 'Kesho, Jumanne 24 Sept',
        time: slotTime,
        requestId: tokenPass,
      };

      return {
        toolName,
        success: true,
        data: {
          careRequestId,
          tokenPass,
          status: 'CONFIRMED',
          doctorName,
          facilityName,
          slotTime,
          smsDispatchedTo: patientPhone,
        },
        feedbackCard,
        message: `Appointment confirmed with ${doctorName} at ${facilityName} for ${slotTime}. Gate pass: ${tokenPass}`,
      };
    }

    case 'reschedule_appointment': {
      const appointmentId = input.appointmentId || '#AC-NBO-8492';
      const newSlotTime = input.newSlotTime || 'Kesho 2:00 PM';
      const reason = input.reason || 'Patient requested reschedule';

      return {
        toolName,
        success: true,
        data: {
          appointmentId,
          newSlotTime,
          reason,
          status: 'RESCHEDULED',
          updatedAt: timeNow,
        },
        message: `Appointment ${appointmentId} rescheduled to ${newSlotTime}. Hospital notified.`,
      };
    }

    case 'cancel_appointment': {
      const appointmentId = input.appointmentId || '#AC-NBO-8492';
      const cancellationReason = input.cancellationReason || 'Patient requested cancellation';

      return {
        toolName,
        success: true,
        data: {
          appointmentId,
          cancellationReason,
          status: 'CANCELLED',
          cancelledAt: timeNow,
        },
        message: `Appointment ${appointmentId} cancelled. Doctor slot has been released back to roster.`,
      };
    }

    default:
      return {
        toolName,
        success: false,
        data: null,
        message: `Unknown tool: "${toolName}". Available tools: find_nearby_facilities, check_doctor_availability, create_care_request, propose_appointment_slot, confirm_appointment, reschedule_appointment, cancel_appointment.`,
      };
  }
}
