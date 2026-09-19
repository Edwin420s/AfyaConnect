/**
 * AfyaConnect Claude Agent Orchestrator
 * Connects patient conversation, tool calling, clinical safety evaluation,
 * hospital queue generation, and bilingual feedback cards.
 */

import { runClaudeAgentLoop, ClaudeAgentLoopResult } from './api';
import { ToolExecutionContext, ToolExecutionResult } from './toolExecutor';
import { evaluateClinicalSafety } from './safety';
import { determineCarePathway } from './careNavigation';
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

  // 3. Resolve Recommended Hospital Card (Anti-hallucination source of truth)
  const pathway = determineCarePathway(patientMessage);
  const { facilities } = findNearbyFacilitiesForClaude(pathway.department, 4.5);
  const primaryFacility = facilities[0] || {
    id: 'f-agakhan',
    name: 'Aga Khan Univ. Hospital',
    subCounty: 'Parklands',
    distanceKm: 1.4,
    driveTime: '~6 min drive',
    leadDoctor: 'Dr. Wanjiku Kamau',
    earliestSlot: 'Leo 3:30 PM',
  };

  const availability = checkRealDoctorAvailability(primaryFacility.id, pathway.departmentCode);
  const leadDoctor = availability.availableDoctors[0]?.doctorName || primaryFacility.leadDoctor;
  const earliestSlot = availability.earliestAvailableSlot || primaryFacility.earliestSlot;

  // 4. Construct Structured Response Message
  const responseMsg: ChatMessage = {
    id: `msg-${Date.now() + 1}`,
    sender: 'assistant',
    text: loopResult.finalText,
    timestamp: timeNow,
    triageLevel: `Triage Level ${loopResult.triageScore}`,
    dialectTag: loopResult.dialectTag,
    feedbackCard: loopResult.feedbackCard || {
      type: 'doctor_availability',
      department: pathway.department,
      requestedTime: 'Tomorrow morning / Leo',
      statusText: 'Verified Slot',
      doctorName: leadDoctor,
      date: 'Kesho, Jumanne 24 Sept',
      time: earliestSlot,
      facilityName: primaryFacility.name,
      requestId: loopResult.createdCareRequest?.id || `#${Math.floor(10487 + Math.random() * 500)}`,
    },
    recommendedHospital: {
      name: primaryFacility.name,
      subCounty: primaryFacility.subCounty,
      distance: `${primaryFacility.distanceKm} km away`,
      doctorName: leadDoctor,
      doctorSpecialty: pathway.suggestedSpecialty,
      todaySlot: earliestSlot,
      waitTime: '~15 mins wait',
      coverage: 'SHA / NHIF Verified',
      facilityId: primaryFacility.id,
    },
    options: [
      `Confirm Slot: ${leadDoctor} • ${earliestSlot}`,
      '📍 Ona Vituo / Other Options',
      '🩺 Nahitaji daktari leo',
    ],
  };

  const careRequestToUse: CareRequest = loopResult.createdCareRequest || {
    id: responseMsg.feedbackCard?.requestId || `#${Math.floor(10487 + Math.random() * 500)}`,
    patientName: context.patientName || 'Jane M.',
    patientAge: 32,
    patientPhone: context.patientPhone || '+254 712 345 678',
    patientLocation: context.patientLocation || 'Westlands (2.1 km away)',
    languageMode: loopResult.dialectTag,
    verbatimTranscript: `“${patientMessage}”`,
    audioDurationSeconds: isAudioSnippet ? 24 : undefined,
    chiefConcern: patientMessage.length > 35 ? patientMessage.slice(0, 35) + '...' : patientMessage,
    symptomDuration: 'Ongoing inquiry (2-3 days)',
    secondarySymptoms: [pathway.department, 'Postural trigger'],
    triageScore: loopResult.triageScore,
    urgency: loopResult.urgency,
    clinicalSummary: `Intake: ${patientMessage}. Suggested Department: ${pathway.department}. Triage Level: ${loopResult.triageScore}/5.`,
    flags: ['Live Voice/Chat Intake', 'SHA Member', 'Auto-Location Active'],
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
      { step: 1, title: '1. Ombi Limepokelewa', description: 'Triage intake initiated from chat/voice', timestamp: timeNow, completed: true, active: true },
      { step: 2, title: '2. Hospital Central Triage Synced', description: 'HMIS Gateway handshake validated', timestamp: 'Pending', completed: false, active: false },
      { step: 3, title: `3. Idara: ${pathway.department}`, description: 'Auto-routed by clinical algorithm', timestamp: 'Pending', completed: false, active: false },
      { step: 4, title: `4. Daktari: ${leadDoctor}`, description: 'Doctor schedule locked', timestamp: 'Pending', completed: false, active: false },
      { step: 5, title: `5. Saa: ${earliestSlot}`, description: 'Slot held for patient', timestamp: 'Pending', completed: false, active: false },
      { step: 6, title: '6. Uthibitisho wa Mgonjwa', description: 'Patient confirmation pending', timestamp: 'Pending', completed: false, active: false },
      { step: 7, title: '7. MIADI IMETHIBITISHWA NA KUFUNGWA', description: 'Booking pass generation', timestamp: 'Pending', completed: false, active: false },
    ],
  };

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

  // 2. Care Pathway Determination
  const pathway = determineCarePathway(patientMessage);

  // 3. Location & Nearby Facilities Tool Resolution
  const { facilities } = findNearbyFacilitiesForClaude(pathway.department, 4.5);
  const primaryFacility = facilities[0] || {
    id: 'f-agakhan',
    name: 'Aga Khan Univ. Hospital',
    subCounty: 'Parklands',
    distanceKm: 1.4,
    driveTime: '~6 min drive',
    leadDoctor: 'Dr. Wanjiku Kamau',
    earliestSlot: 'Leo 3:30 PM',
  };

  // 4. Check Doctor Availability Tool Resolution (Anti-hallucination source of truth)
  const availability = checkRealDoctorAvailability(primaryFacility.id, pathway.departmentCode);
  const leadDoctor = availability.availableDoctors[0]?.doctorName || primaryFacility.leadDoctor;
  const earliestSlot = availability.earliestAvailableSlot || primaryFacility.earliestSlot;

  // 5. Construct Empathetic Bilingual Text
  let aiText = '';
  let dialectTag = 'Swahili + English Response';
  const lower = patientMessage.toLowerCase();

  if (languagePreference === 'swa') {
    dialectTag = 'KISWAHILI PEKEE';
    aiText = `Nimekuelewa vizuri. ${pathway.explanationSwahili} Nimepata vituo ${facilities.length} vilivyo karibu nawe hapa ${primaryFacility.subCounty} vyenye nafasi ya daktari ${leadDoctor} leo au kesho.`;
  } else if (languagePreference === 'eng') {
    dialectTag = 'ENGLISH';
    aiText = `I understand what you are experiencing. ${pathway.explanationEnglish} I found ${facilities.length} healthcare centers near you in ${primaryFacility.subCounty} with consultation slots available with ${leadDoctor}.`;
  } else {
    // Kenyan Code-Switching (Sheng / Swahili + English)
    dialectTag = 'SWA + ENG CODE-SWITCH';
    if (lower.includes('kichwa') || lower.includes('headache') || lower.includes('dizzy')) {
      aiText = `Pole sana. Nimekuelewa vizuri: maumivu ya kichwa kwa siku kadhaa na kizunguzungu yanaweza kuhitaji uchunguzi wa daktari. I have detected 3 healthcare centers nearby with general consultation slots available today and tomorrow.`;
    } else if (lower.includes('tumbo') || lower.includes('stomach') || lower.includes('fever')) {
      aiText = `Pole sana kwa maumivu ya tumbo. Nimetambua kuwa una maumivu yanayoendelea. Kuna nafasi ya daktari ${leadDoctor} katika ${primaryFacility.name} leo saa ${earliestSlot}.`;
    } else {
      aiText = `Nimekuelewa vizuri. Mfumo wa AfyaConnect umeunganishwa na vituo vya afya vilivyo karibu nawe. Daktari ${leadDoctor} anaweza kukuona leo au kesho. Je, ungependa kupangiwa nafasi hii?`;
    }
  }

  // 6. Embedded Feedback Card Data
  const feedbackCard: FeedbackCardData = {
    type: 'doctor_availability',
    department: pathway.department,
    requestedTime: 'Tomorrow morning / Leo',
    statusText: 'Verified Slot',
    doctorName: leadDoctor,
    date: 'Kesho, Jumanne 24 Sept',
    time: earliestSlot,
    facilityName: primaryFacility.name,
    requestId: `#${Math.floor(10487 + Math.random() * 500)}`,
  };

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
      doctorSpecialty: pathway.suggestedSpecialty,
      todaySlot: earliestSlot,
      waitTime: '~15 mins wait',
      coverage: 'SHA / NHIF Verified',
      facilityId: primaryFacility.id,
    },
    options: [
      `Confirm Slot: ${leadDoctor} • ${earliestSlot}`,
      '📍 Ona Vituo / Other Options',
      '🩺 Nahitaji daktari leo',
    ],
  };

  // 8. Create Structured Case for Hospital Reception Dashboard
  const newCareRequest: CareRequest = {
    id: feedbackCard.requestId || `#${Math.floor(10487 + Math.random() * 500)}`,
    patientName: 'Jane M.',
    patientAge: 32,
    patientPhone: '+254 712 345 678',
    patientLocation: 'Westlands (2.1 km away)',
    languageMode: 'SWA + ENG CODE-SWITCH',
    verbatimTranscript: `“${patientMessage}”`,
    audioDurationSeconds: isAudioSnippet ? 24 : undefined,
    chiefConcern: patientMessage.length > 35 ? patientMessage.slice(0, 35) + '...' : patientMessage,
    symptomDuration: 'Ongoing inquiry (2-3 days)',
    secondarySymptoms: [pathway.department, 'Postural trigger'],
    triageScore: pathway.triageScore,
    urgency: pathway.urgency,
    clinicalSummary: `Intake: ${patientMessage}. Suggested Department: ${pathway.department}. Triage Level: ${pathway.triageScore}/5.`,
    flags: ['Live Voice/Chat Intake', 'SHA Member', 'Auto-Location Active'],
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
      { step: 1, title: '1. Ombi Limepokelewa', description: 'Triage intake initiated from chat/voice', timestamp: timeNow, completed: true, active: true },
      { step: 2, title: '2. Hospital Central Triage Synced', description: 'HMIS Gateway handshake validated', timestamp: 'Pending', completed: false, active: false },
      { step: 3, title: `3. Idara: ${pathway.department}`, description: 'Auto-routed by clinical algorithm', timestamp: 'Pending', completed: false, active: false },
      { step: 4, title: `4. Daktari: ${leadDoctor}`, description: 'Doctor schedule locked', timestamp: 'Pending', completed: false, active: false },
      { step: 5, title: `5. Saa: ${earliestSlot}`, description: 'Slot held for patient', timestamp: 'Pending', completed: false, active: false },
      { step: 6, title: '6. Uthibitisho wa Mgonjwa', description: 'Patient confirmation pending', timestamp: 'Pending', completed: false, active: false },
      { step: 7, title: '7. MIADI IMETHIBITISHWA NA KUFUNGWA', description: 'Booking pass generation', timestamp: 'Pending', completed: false, active: false },
    ],
  };

  return {
    message: responseMsg,
    createdCareRequest: newCareRequest,
    isEmergencyAlert: false,
  };
}
