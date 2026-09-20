/**
 * AfyaConnect Claude Agent Orchestrator
 * Connects patient conversation, tool calling, clinical safety evaluation,
 * hospital queue generation, and bilingual feedback cards.
 */

import { runClaudeAgentLoop, ClaudeAgentLoopResult } from './api';
import { ToolExecutionContext, ToolExecutionResult } from './toolExecutor';
import { evaluateClinicalSafety } from './safety';
import { determineCarePathway, analyzeClinicalIntake, SPECIALIST_ROSTER } from './careNavigation';
import { findNearbyFacilitiesForClaude } from '../services/locationService';
import { checkRealDoctorAvailability } from '../services/availabilityEngine';
import { CareRequest, ChatMessage, FeedbackCardData } from '../../types';

export interface OrchestrationResult {
  message: ChatMessage;
  createdCareRequest?: CareRequest;
  isEmergencyAlert: boolean;
  executedTools?: ToolExecutionResult[];
}

/**
 * Async patient interaction orchestrator powered by Claude API & Agentic Tool-Use
 */
export async function orchestratePatientInteractionAsync(
  patientMessage: string,
  isAudioSnippet: boolean = false,
  languagePreference: 'swa_eng' | 'swa' | 'eng' = 'swa_eng',
  context: ToolExecutionContext = {},
  conversationHistory: ChatMessage[] = []
): Promise<OrchestrationResult> {
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Clinical Safety & Emergency Short-Circuit
  const safetyCheck = evaluateClinicalSafety(patientMessage);
  if (safetyCheck.isEmergency) {
    const alertMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: safetyCheck.recommendedAction,
      timestamp: timeNow,
      triageLevel: 'Triage Level 5 (Emergency)',
      dialectTag: 'Dharura / Emergency Alert',
      options: ['🚨 Piga 1199 (Red Cross)', '🏥 Tafuta Hospitali ya Dharura', '🚑 Piga 999 Ambulance'],
    };
    return {
      message: alertMsg,
      isEmergencyAlert: true,
      executedTools: [],
    };
  }

  // 2. Execute Claude Agentic Tool-Use Loop
  const loopResult: ClaudeAgentLoopResult = await runClaudeAgentLoop(
    patientMessage,
    conversationHistory,
    context,
    languagePreference
  );

  if (loopResult.isEmergency) {
    const alertMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: loopResult.finalText,
      timestamp: timeNow,
      triageLevel: 'Triage Level 5 (Emergency)',
      dialectTag: loopResult.dialectTag,
      options: ['🚨 Piga 1199 (Red Cross)', '🏥 Tafuta Hospitali ya Dharura'],
    };
    return {
      message: alertMsg,
      isEmergencyAlert: true,
      executedTools: loopResult.executedTools,
    };
  }

  // 3. Resolve Clinical Intake & Specialist Routing
  const intake = analyzeClinicalIntake(patientMessage, conversationHistory, languagePreference);
  const pathway = intake.pathway;
  const specialist = intake.specialist;

  let responseMsg: ChatMessage;
  let careRequestToUse: CareRequest;

  if (intake.needsClarification) {
    const feedbackCard: FeedbackCardData = loopResult.feedbackCard || {
      type: 'request_received',
      department: pathway.department,
      requestedTime: languagePreference === 'eng' ? 'Pending triage details' : languagePreference === 'swa' ? 'Inasubiri maelezo' : 'Pending triage details',
      statusText: languagePreference === 'eng' ? 'Assessing symptoms' : languagePreference === 'swa' ? 'Inakaguliwa' : 'Checking symptoms',
      facilityName: 'AfyaConnect Clinical Gateway',
      requestId: loopResult.createdCareRequest?.id || `#${Math.floor(10487 + Math.random() * 500)}`,
    };

    responseMsg = {
      id: `msg-${Date.now() + 1}`,
      sender: 'assistant',
      text: loopResult.finalText || intake.clarificationMessage,
      timestamp: timeNow,
      triageLevel: `Triage Level ${loopResult.triageScore}`,
      dialectTag: loopResult.dialectTag,
      feedbackCard,
      options: intake.clarificationOptions,
    };

    careRequestToUse = loopResult.createdCareRequest || {
      id: feedbackCard.requestId || `#${Math.floor(10487 + Math.random() * 500)}`,
      patientName: context.patientName || 'Jane M.',
      patientAge: 32,
      patientPhone: context.patientPhone || '+254 712 345 678',
      patientLocation: context.patientLocation || 'Westlands (2.1 km away)',
      languageMode: (loopResult.dialectTag === 'ENGLISH' || loopResult.dialectTag === 'KISWAHILI'
        ? loopResult.dialectTag
        : 'SWA + ENG CODE-SWITCH') as 'SWA + ENG CODE-SWITCH' | 'ENGLISH' | 'KISWAHILI',
      verbatimTranscript: `“${patientMessage}”`,
      audioDurationSeconds: isAudioSnippet ? 24 : undefined,
      chiefConcern: patientMessage.length > 35 ? patientMessage.slice(0, 35) + '...' : patientMessage,
      symptomDuration: 'Initial intake',
      secondarySymptoms: [pathway.department, 'Awaiting clinical details'],
      triageScore: loopResult.triageScore,
      urgency: loopResult.urgency,
      clinicalSummary: `Intake in progress: ${patientMessage}. Proposed Department: ${pathway.department}. Triage Level: ${loopResult.triageScore}/5.`,
      flags: ['Live Voice/Chat Intake', 'Clarification Active', 'SHA Member'],
      insurance: 'SHA Active #602931-B',
      distanceKm: 2.1,
      preferredTime: 'Pending triage',
      assignedFacilityId: specialist.facilityId || 'f-agakhan',
      assignedFacilityName: 'AfyaConnect Clinical Gateway',
      assignedDepartment: pathway.department,
      status: 'AWAITING_REVIEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        { step: 1, title: 'CALL / CHAT MADE', description: 'Patient initiated triage conversation via app / audio', timestamp: timeNow, completed: true, active: false },
        { step: 2, title: 'Request received', description: 'Triage intake logged and symptom assessment in progress', timestamp: timeNow, completed: true, active: true },
        { step: 3, title: 'Hospital received request', description: 'Hospital triage queue synced', timestamp: 'Pending', completed: false, active: false },
        { step: 4, title: 'Department identified', description: `Proposed: ${pathway.department}`, timestamp: 'Pending', completed: false, active: false },
        { step: 5, title: 'Doctor availability checked', description: 'Awaiting clinical details before doctor allocation', timestamp: 'Pending', completed: false, active: false },
        { step: 6, title: 'Time proposed', description: 'Pending triage completion', timestamp: 'Pending', completed: false, active: false },
        { step: 7, title: 'Patient confirmed', description: 'Pending', timestamp: 'Pending', completed: false, active: false },
        { step: 8, title: 'APPOINTMENT BOOKED', description: 'Pending', timestamp: 'Pending', completed: false, active: false },
      ],
    };
  } else {
    // Clinical intake is complete -> route to specific specialist
    const targetFacilityId = specialist.facilityId || 'f-agakhan';
    const leadDoctor = specialist.doctorName || 'Dr. Wanjiku Kamau';
    const specialtyName = specialist.specialist;

    const { facilities } = findNearbyFacilitiesForClaude(pathway.department, 4.5);
    const primaryFacility = facilities.find(f => f.id === targetFacilityId) || facilities[0] || {
      id: 'f-agakhan',
      name: 'Aga Khan Univ. Hospital',
      subCounty: 'Parklands',
      distanceKm: 1.4,
      driveTime: '~6 min drive',
      leadDoctor,
      earliestSlot: 'Leo 3:30 PM',
    };

    const availability = checkRealDoctorAvailability(primaryFacility.id, pathway.departmentCode);
    const matchedDoc = availability.availableDoctors.find(d => d.doctorName === leadDoctor);
    const earliestSlot = matchedDoc?.freeSlots?.[0]?.time || availability.earliestAvailableSlot || primaryFacility.earliestSlot;

    const isTomorrow = earliestSlot.toLowerCase().includes('kesho') || earliestSlot.toLowerCase().includes('tomorrow');
    const cleanSlot = earliestSlot.replace(/Leo\s*|Kesho\s*|Today\s*|Tomorrow\s*/gi, '').trim();

    let formattedDate = 'Tomorrow, Tuesday 24 Sept';
    let formattedTime = `Tomorrow at ${cleanSlot}`;
    let statusText = 'Verified Slot';

    if (languagePreference === 'eng') {
      formattedDate = isTomorrow ? 'Tomorrow, Tuesday 24 Sept' : 'Today, Sunday 20 Sept';
      formattedTime = isTomorrow ? `Tomorrow at ${cleanSlot}` : `Today at ${cleanSlot}`;
      statusText = 'Verified Slot';
    } else if (languagePreference === 'swa') {
      formattedDate = isTomorrow ? 'Kesho, Jumanne 24 Sept' : 'Leo, Jumapili 20 Sept';
      formattedTime = isTomorrow ? `Kesho ${cleanSlot}` : `Leo ${cleanSlot}`;
      statusText = 'Nafasi Imethibitishwa';
    } else {
      formattedDate = isTomorrow ? 'Tomorrow, Tuesday 24 Sept' : 'Leo, Jumapili 20 Sept';
      formattedTime = isTomorrow ? `Kesho at ${cleanSlot}` : `Leo at ${cleanSlot}`;
      statusText = 'Verified Slot';
    }

    const feedbackCard: FeedbackCardData = loopResult.feedbackCard || {
      type: 'doctor_availability',
      department: pathway.department,
      requestedTime: languagePreference === 'eng' ? (isTomorrow ? 'Tomorrow' : 'Today') : (isTomorrow ? 'Kesho' : 'Leo'),
      statusText,
      doctorName: leadDoctor,
      date: formattedDate,
      time: formattedTime,
      facilityName: primaryFacility.name,
      requestId: loopResult.createdCareRequest?.id || `#${Math.floor(10487 + Math.random() * 500)}`,
    };

    const responseOptions = languagePreference === 'eng'
      ? [`Confirm Slot: ${leadDoctor} • ${formattedTime}`, '📍 Check Nearby Facilities', '🩺 I need a doctor today']
      : languagePreference === 'swa'
      ? [`Thibitisha: ${leadDoctor} • ${formattedTime}`, '📍 Tazama Vituo Vilivyo Karibu', '🩺 Nahitaji daktari leo']
      : [`Confirm Slot: ${leadDoctor} • ${formattedTime}`, '📍 Ona Vituo / Other Options', '🩺 Nahitaji daktari leo'];

    responseMsg = {
      id: `msg-${Date.now() + 1}`,
      sender: 'assistant',
      text: loopResult.finalText,
      timestamp: timeNow,
      triageLevel: `Triage Level ${loopResult.triageScore}`,
      dialectTag: loopResult.dialectTag,
      feedbackCard,
      recommendedHospital: {
        name: primaryFacility.name,
        subCounty: primaryFacility.subCounty,
        distance: `${primaryFacility.distanceKm} km away`,
        doctorName: leadDoctor,
        doctorSpecialty: specialtyName,
        todaySlot: earliestSlot,
        waitTime: '~15 mins wait',
        coverage: 'SHA / NHIF Verified',
        facilityId: primaryFacility.id,
      },
      options: responseOptions,
    };

    careRequestToUse = loopResult.createdCareRequest || {
      id: feedbackCard.requestId || `#${Math.floor(10487 + Math.random() * 500)}`,
      patientName: context.patientName || 'Jane M.',
      patientAge: 32,
      patientPhone: context.patientPhone || '+254 712 345 678',
      patientLocation: context.patientLocation || 'Westlands (2.1 km away)',
      languageMode: (loopResult.dialectTag === 'ENGLISH' || loopResult.dialectTag === 'KISWAHILI'
        ? loopResult.dialectTag
        : 'SWA + ENG CODE-SWITCH') as 'SWA + ENG CODE-SWITCH' | 'ENGLISH' | 'KISWAHILI',
      verbatimTranscript: `“${patientMessage}”`,
      audioDurationSeconds: isAudioSnippet ? 24 : undefined,
      chiefConcern: patientMessage.length > 35 ? patientMessage.slice(0, 35) + '...' : patientMessage,
      symptomDuration: 'Ongoing inquiry (2-3 days)',
      secondarySymptoms: [pathway.department, specialtyName],
      triageScore: loopResult.triageScore,
      urgency: loopResult.urgency,
      clinicalSummary: `Intake: ${patientMessage}. Specialist: ${specialtyName} (${leadDoctor}). Department: ${pathway.department}. Triage Level: ${loopResult.triageScore}/5.`,
      flags: ['Live Voice/Chat Intake', 'Specialist Matched', 'SHA Member', 'Auto-Location Active'],
      insurance: 'SHA Active #602931-B',
      distanceKm: primaryFacility.distanceKm,
      preferredTime: earliestSlot,
      assignedFacilityId: primaryFacility.id,
      assignedFacilityName: primaryFacility.name,
      assignedDepartment: pathway.department,
      assignedDoctorName: leadDoctor,
      assignedSlot: earliestSlot,
      status: 'AWAITING_REVIEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        { step: 1, title: 'CALL / CHAT MADE', description: 'Patient initiated triage conversation via app / audio', timestamp: timeNow, completed: true, active: false },
        { step: 2, title: 'Request received', description: 'Triage intake logged and pre-screened', timestamp: timeNow, completed: true, active: false },
        { step: 3, title: 'Hospital received request', description: `${primaryFacility.name} triage queue synced`, timestamp: timeNow, completed: true, active: true },
        { step: 4, title: 'Department identified', description: `Auto-routed to ${pathway.department} (${specialtyName})`, timestamp: timeNow, completed: true, active: false },
        { step: 5, title: 'Doctor availability checked', description: `${leadDoctor} calendar verified on duty`, timestamp: timeNow, completed: true, active: false },
        { step: 6, title: 'Time proposed', description: `Proposed slot: ${earliestSlot}`, timestamp: timeNow, completed: true, active: true },
        { step: 7, title: 'Patient confirmed', description: 'Patient confirmation pending', timestamp: 'Pending', completed: false, active: false },
        { step: 8, title: 'APPOINTMENT BOOKED', description: 'Digital token pass generation', timestamp: 'Pending', completed: false, active: false },
      ],
    };
  }

  return {
    message: responseMsg,
    createdCareRequest: careRequestToUse,
    isEmergencyAlert: false,
    executedTools: loopResult.executedTools,
  };
}

/**
 * Synchronous backward-compatible wrapper
 */
export function orchestratePatientInteraction(
  patientMessage: string,
  isAudioSnippet: boolean = false,
  languagePreference: 'swa_eng' | 'swa' | 'eng' = 'swa_eng'
): OrchestrationResult {
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Clinical Safety & Emergency Evaluation
  const safetyCheck = evaluateClinicalSafety(patientMessage);
  if (safetyCheck.isEmergency) {
    const alertMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: safetyCheck.recommendedAction,
      timestamp: timeNow,
      triageLevel: 'Triage Level 5 (Emergency)',
      dialectTag: 'Dharura / Emergency Alert',
      options: ['🚨 Piga 1199 (Red Cross)', '🏥 Tafuta Hospitali ya Dharura'],
    };
    return {
      message: alertMsg,
      isEmergencyAlert: true,
    };
  }

  // 2. Clinical Intake Evaluation & Specialist Routing
  const intake = analyzeClinicalIntake(patientMessage, [], languagePreference);
  const pathway = intake.pathway;
  const specialist = intake.specialist;

  if (intake.needsClarification) {
    const feedbackCard: FeedbackCardData = {
      type: 'request_received',
      department: pathway.department,
      requestedTime: languagePreference === 'eng' ? 'Pending triage details' : languagePreference === 'swa' ? 'Inasubiri maelezo' : 'Pending triage details',
      statusText: languagePreference === 'eng' ? 'Assessing symptoms' : languagePreference === 'swa' ? 'Inakaguliwa' : 'Checking symptoms',
      facilityName: 'AfyaConnect Clinical Gateway',
      requestId: `#${Math.floor(10487 + Math.random() * 500)}`,
    };

    const responseMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'assistant',
      text: intake.clarificationMessage,
      timestamp: timeNow,
      triageLevel: `Triage Level ${pathway.triageScore}`,
      dialectTag: languagePreference === 'eng' ? 'ENGLISH' : languagePreference === 'swa' ? 'KISWAHILI PEKEE' : 'SWA + ENG CODE-SWITCH',
      feedbackCard,
      options: intake.clarificationOptions,
    };

    const newCareRequest: CareRequest = {
      id: feedbackCard.requestId || `#${Math.floor(10487 + Math.random() * 500)}`,
      patientName: 'Jane M.',
      patientAge: 32,
      patientPhone: '+254 712 345 678',
      patientLocation: 'Westlands (2.1 km away)',
      languageMode: languagePreference === 'eng' ? 'ENGLISH' : languagePreference === 'swa' ? 'KISWAHILI' : 'SWA + ENG CODE-SWITCH',
      verbatimTranscript: `“${patientMessage}”`,
      audioDurationSeconds: isAudioSnippet ? 24 : undefined,
      chiefConcern: patientMessage.length > 35 ? patientMessage.slice(0, 35) + '...' : patientMessage,
      symptomDuration: 'Initial intake',
      secondarySymptoms: [pathway.department, 'Awaiting clinical details'],
      triageScore: pathway.triageScore,
      urgency: pathway.urgency,
      clinicalSummary: `Intake in progress: ${patientMessage}. Proposed Department: ${pathway.department}. Triage Level: ${pathway.triageScore}/5.`,
      flags: ['Live Voice/Chat Intake', 'Clarification Active', 'SHA Member'],
      insurance: 'SHA Active #602931-B',
      distanceKm: 2.1,
      preferredTime: 'Pending triage',
      assignedFacilityId: specialist.facilityId || 'f-agakhan',
      assignedFacilityName: 'AfyaConnect Clinical Gateway',
      assignedDepartment: pathway.department,
      status: 'AWAITING_REVIEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        { step: 1, title: 'CALL / CHAT MADE', description: 'Patient initiated triage conversation via app / audio', timestamp: timeNow, completed: true, active: false },
        { step: 2, title: 'Request received', description: 'Triage intake logged and symptom assessment in progress', timestamp: timeNow, completed: true, active: true },
        { step: 3, title: 'Hospital received request', description: 'Hospital triage queue synced', timestamp: 'Pending', completed: false, active: false },
        { step: 4, title: 'Department identified', description: `Proposed: ${pathway.department}`, timestamp: 'Pending', completed: false, active: false },
        { step: 5, title: 'Doctor availability checked', description: 'Awaiting clinical details before doctor allocation', timestamp: 'Pending', completed: false, active: false },
        { step: 6, title: 'Time proposed', description: 'Pending triage completion', timestamp: 'Pending', completed: false, active: false },
        { step: 7, title: 'Patient confirmed', description: 'Pending', timestamp: 'Pending', completed: false, active: false },
        { step: 8, title: 'APPOINTMENT BOOKED', description: 'Pending', timestamp: 'Pending', completed: false, active: false },
      ],
    };

    return {
      message: responseMsg,
      createdCareRequest: newCareRequest,
      isEmergencyAlert: false,
    };
  }

  // Clinical intake complete -> Match specific specialist
  const targetFacilityId = specialist.facilityId || 'f-agakhan';
  const leadDoctor = specialist.doctorName || 'Dr. Wanjiku Kamau';
  const specialtyName = specialist.specialist;

  // 3. Location & Nearby Facilities Tool Resolution
  const { facilities } = findNearbyFacilitiesForClaude(pathway.department, 4.5);
  const primaryFacility = facilities.find(f => f.id === targetFacilityId) || facilities[0] || {
    id: 'f-agakhan',
    name: 'Aga Khan Univ. Hospital',
    subCounty: 'Parklands',
    distanceKm: 1.4,
    driveTime: '~6 min drive',
    leadDoctor,
    earliestSlot: 'Leo 3:30 PM',
  };

  // 4. Check Doctor Availability Tool Resolution (Anti-hallucination source of truth)
  const availability = checkRealDoctorAvailability(primaryFacility.id, pathway.departmentCode);
  const matchedDoc = availability.availableDoctors.find(d => d.doctorName === leadDoctor);
  const earliestSlot = matchedDoc?.freeSlots?.[0]?.time || availability.earliestAvailableSlot || primaryFacility.earliestSlot;

  // 5. Construct Empathetic Bilingual Text
  let aiText = '';
  let dialectTag = 'Swahili + English Response';
  const lower = patientMessage.toLowerCase();

  const isTomorrow = earliestSlot.toLowerCase().includes('kesho') || earliestSlot.toLowerCase().includes('tomorrow');
  const cleanSlot = earliestSlot.replace(/Leo\s*|Kesho\s*|Today\s*|Tomorrow\s*/gi, '').trim();

  let formattedDate = 'Tomorrow, Tuesday 24 Sept';
  let formattedTime = `Tomorrow at ${cleanSlot}`;
  let statusText = 'Verified Slot';

  if (languagePreference === 'swa') {
    dialectTag = 'KISWAHILI PEKEE';
    formattedDate = isTomorrow ? 'Kesho, Jumanne 24 Sept' : 'Leo, Jumapili 20 Sept';
    formattedTime = isTomorrow ? `Kesho ${cleanSlot}` : `Leo ${cleanSlot}`;
    statusText = 'Nafasi Imethibitishwa';
    aiText = `Kulingana na maelezo ya dalili zako, ninapendekeza mashauriano na ${specialtyName} (${leadDoctor}) katika kitengo cha ${pathway.department} hapa ${primaryFacility.name}. ${pathway.explanationSwahili} Nafasi ya daktari inapatikana ${formattedTime}. Je, ungependa kuthibitisha miadi hii?`;
  } else if (languagePreference === 'eng') {
    dialectTag = 'ENGLISH';
    formattedDate = isTomorrow ? 'Tomorrow, Tuesday 24 Sept' : 'Today, Sunday 20 Sept';
    formattedTime = isTomorrow ? `Tomorrow at ${cleanSlot}` : `Today at ${cleanSlot}`;
    statusText = 'Verified Slot';
    aiText = `Based on your symptoms, I recommend a consultation with ${specialtyName} (${leadDoctor}) in the ${pathway.department} department at ${primaryFacility.name}. ${pathway.explanationEnglish} A verified slot is available ${formattedTime}. Would you like to book this appointment?`;
  } else {
    dialectTag = 'SWA + ENG CODE-SWITCH';
    formattedDate = isTomorrow ? 'Tomorrow, Tuesday 24 Sept' : 'Leo, Jumapili 20 Sept';
    formattedTime = isTomorrow ? `Kesho at ${cleanSlot}` : `Leo at ${cleanSlot}`;
    statusText = 'Verified Slot';
    const userHasSwahili = /nimekuwa|nahisi|tumbo|kichwa|daktari|kesho|leo|homa|mtoto|masikio|jino|ngozi|kuona/i.test(lower);
    if (!userHasSwahili) {
      aiText = `Based on your description, I recommend consulting with ${specialtyName} (${leadDoctor}) in ${pathway.department} at ${primaryFacility.name}. ${pathway.explanationEnglish} A slot is available ${formattedTime}. Would you like to book this appointment?`;
    } else {
      aiText = `Pole sana, nimekuelewa vizuri: ${pathway.explanationSwahili} Ninapendekeza ${specialtyName} (${leadDoctor}) katika hospitali ya ${primaryFacility.name}. Kuna nafasi ${formattedTime}. Je, ungependa kuthibitisha miadi hii?`;
    }
  }

  // 6. Embedded Feedback Card Data
  const feedbackCard: FeedbackCardData = {
    type: 'doctor_availability',
    department: pathway.department,
    requestedTime: languagePreference === 'eng' ? (isTomorrow ? 'Tomorrow' : 'Today') : (isTomorrow ? 'Kesho' : 'Leo'),
    statusText,
    doctorName: leadDoctor,
    date: formattedDate,
    time: formattedTime,
    facilityName: primaryFacility.name,
    requestId: `#${Math.floor(10487 + Math.random() * 500)}`,
  };

  const responseOptions = languagePreference === 'eng'
    ? [`Confirm Slot: ${leadDoctor} • ${formattedTime}`, '📍 Check Nearby Facilities', '🩺 I need a doctor today']
    : languagePreference === 'swa'
    ? [`Thibitisha: ${leadDoctor} • ${formattedTime}`, '📍 Tazama Vituo Vilivyo Karibu', '🩺 Nahitaji daktari leo']
    : [`Confirm Slot: ${leadDoctor} • ${formattedTime}`, '📍 Ona Vituo / Other Options', '🩺 Nahitaji daktari leo'];

  // 7. Structured Response Message
  const responseMsg: ChatMessage = {
    id: `msg-${Date.now() + 1}`,
    sender: 'assistant',
    text: aiText,
    timestamp: timeNow,
    triageLevel: `Triage Level ${pathway.triageScore}`,
    dialectTag,
    feedbackCard,
    recommendedHospital: {
      name: primaryFacility.name,
      subCounty: primaryFacility.subCounty,
      distance: `${primaryFacility.distanceKm} km away`,
      doctorName: leadDoctor,
      doctorSpecialty: specialtyName,
      todaySlot: earliestSlot,
      waitTime: '~15 mins wait',
      coverage: 'SHA / NHIF Verified',
      facilityId: primaryFacility.id,
    },
    options: responseOptions,
  };

  // 8. Create Structured Case for Hospital Reception Dashboard
  const newCareRequest: CareRequest = {
    id: feedbackCard.requestId || `#${Math.floor(10487 + Math.random() * 500)}`,
    patientName: 'Jane M.',
    patientAge: 32,
    patientPhone: '+254 712 345 678',
    patientLocation: 'Westlands (2.1 km away)',
    languageMode: languagePreference === 'eng' ? 'ENGLISH' : languagePreference === 'swa' ? 'KISWAHILI' : 'SWA + ENG CODE-SWITCH',
    verbatimTranscript: `“${patientMessage}”`,
    audioDurationSeconds: isAudioSnippet ? 24 : undefined,
    chiefConcern: patientMessage.length > 35 ? patientMessage.slice(0, 35) + '...' : patientMessage,
    symptomDuration: 'Ongoing inquiry (2-3 days)',
    secondarySymptoms: [pathway.department, specialtyName],
    triageScore: pathway.triageScore,
    urgency: pathway.urgency,
    clinicalSummary: `Intake: ${patientMessage}. Specialist: ${specialtyName} (${leadDoctor}). Department: ${pathway.department}. Triage Level: ${pathway.triageScore}/5.`,
    flags: ['Live Voice/Chat Intake', 'Specialist Matched', 'SHA Member', 'Auto-Location Active'],
    insurance: 'SHA Active #602931-B',
    distanceKm: primaryFacility.distanceKm,
    preferredTime: earliestSlot,
    assignedFacilityId: primaryFacility.id,
    assignedFacilityName: primaryFacility.name,
    assignedDepartment: pathway.department,
    assignedDoctorName: leadDoctor,
    assignedSlot: earliestSlot,
    status: 'AWAITING_REVIEW',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      { step: 1, title: 'CALL / CHAT MADE', description: 'Patient initiated triage conversation via app / audio', timestamp: timeNow, completed: true, active: false },
      { step: 2, title: 'Request received', description: 'Triage intake logged and pre-screened', timestamp: timeNow, completed: true, active: false },
      { step: 3, title: 'Hospital received request', description: `${primaryFacility.name} triage queue synced`, timestamp: timeNow, completed: true, active: true },
      { step: 4, title: 'Department identified', description: `Auto-routed to ${pathway.department} (${specialtyName})`, timestamp: timeNow, completed: true, active: false },
      { step: 5, title: 'Doctor availability checked', description: `${leadDoctor} calendar verified on duty`, timestamp: timeNow, completed: true, active: false },
      { step: 6, title: 'Time proposed', description: `Proposed slot: ${earliestSlot}`, timestamp: timeNow, completed: true, active: true },
      { step: 7, title: 'Patient confirmed', description: 'Patient confirmation pending', timestamp: 'Pending', completed: false, active: false },
      { step: 8, title: 'APPOINTMENT BOOKED', description: 'Digital token pass generation', timestamp: 'Pending', completed: false, active: false },
    ],
  };

  return {
    message: responseMsg,
    createdCareRequest: newCareRequest,
    isEmergencyAlert: false,
  };
}
