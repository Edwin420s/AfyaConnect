/**
 * AfyaConnect Anthropic Claude API Client & Multi-Turn Tool Calling Engine
 * Supports Claude 3.7 Sonnet, Claude 3.5 Sonnet, and Claude 3.5 Haiku.
 * Handles tool-use cycles, local clinical agent fallback, and browser API key storage.
 */

import { AFYACONNECT_SYSTEM_PROMPT } from './prompts';
import { AFYACONNECT_TOOLS } from './tools';
import { executeAfyaConnectTool, ToolExecutionContext, ToolExecutionResult } from './toolExecutor';
import { evaluateClinicalSafety } from './safety';
import { determineCarePathway } from './careNavigation';
import { findNearbyFacilitiesForClaude } from '../services/locationService';
import { checkRealDoctorAvailability } from '../services/availabilityEngine';
import { CareRequest, ChatMessage, FeedbackCardData } from '../../types';

export const CLAUDE_MODELS = [
  { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet (Hybrid Reasoning)', isDefault: true },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Clinical Triage)', isDefault: false },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Ultra-fast)', isDefault: false },
] as const;

export type ClaudeModelId = (typeof CLAUDE_MODELS)[number]['id'];

const API_KEY_STORAGE_KEY = 'afyaconnect_anthropic_api_key';
const MODEL_STORAGE_KEY = 'afyaconnect_claude_model';
const LIVE_MODE_STORAGE_KEY = 'afyaconnect_claude_live_mode';

export function getAnthropicApiKey(): string {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (local && local.trim()) return local.trim();
  }
  // Vite environment fallback
  return (import.meta as any).env?.VITE_ANTHROPIC_API_KEY || '';
}

export function setAnthropicApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  }
}

export function getSelectedClaudeModel(): ClaudeModelId {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(MODEL_STORAGE_KEY);
    if (saved && CLAUDE_MODELS.some(m => m.id === saved)) {
      return saved as ClaudeModelId;
    }
  }
  return 'claude-3-7-sonnet-20250219';
}

export function setSelectedClaudeModel(modelId: ClaudeModelId): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MODEL_STORAGE_KEY, modelId);
  }
}

export function isLiveApiEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const setting = localStorage.getItem(LIVE_MODE_STORAGE_KEY);
    if (setting !== null) return setting === 'true';
  }
  return Boolean(getAnthropicApiKey());
}

export function setLiveApiEnabled(enabled: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LIVE_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
  }
}

export interface ClaudeApiMessage {
  role: 'user' | 'assistant';
  content: string | Array<ClaudeContentBlock>;
}

export type ClaudeContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, any> }
  | { type: 'tool_result'; tool_use_id: string; content: string; is_error?: boolean };

export interface ClaudeApiResponse {
  id: string;
  type: string;
  role: 'assistant';
  content: ClaudeContentBlock[];
  model: string;
  stop_reason: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence';
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Direct call to Anthropic Messages API
 */
export async function callAnthropicMessagesApi(
  messages: ClaudeApiMessage[],
  systemPrompt: string = AFYACONNECT_SYSTEM_PROMPT,
  model: string = getSelectedClaudeModel(),
  apiKey: string = getAnthropicApiKey()
): Promise<ClaudeApiResponse> {
  if (!apiKey) {
    throw new Error('Anthropic API key is not configured.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      system: systemPrompt,
      tools: AFYACONNECT_TOOLS,
      messages,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
    throw new Error(`Claude API Error: ${errorMsg}`);
  }

  return response.json();
}

/**
 * Validates Claude API key connectivity
 */
export async function testClaudeConnection(apiKey?: string): Promise<{ success: boolean; message: string }> {
  const keyToTest = apiKey || getAnthropicApiKey();
  if (!keyToTest) {
    return { success: false, message: 'Hakuna API key iliyowekwa (No API key provided).' };
  }

  try {
    const testMsg: ClaudeApiMessage[] = [
      { role: 'user', content: 'Habari AfyaConnect test ping. Reply with "OK".' },
    ];
    const res = await callAnthropicMessagesApi(
      testMsg,
      'You are a test ping responder. Reply concisely.',
      'claude-3-5-haiku-20241022',
      keyToTest
    );
    const textBlock = res.content.find(c => c.type === 'text') as { type: 'text'; text: string } | undefined;
    return {
      success: true,
      message: `Imefaulu! Claude API imeunganishwa (${res.model}). Jibu: "${textBlock?.text?.slice(0, 30)}"`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Imeshindwa kuunganisha: ${err.message || String(err)}`,
    };
  }
}

export interface ClaudeAgentLoopResult {
  finalText: string;
  executedTools: ToolExecutionResult[];
  createdCareRequest?: CareRequest;
  feedbackCard?: FeedbackCardData;
  isEmergency: boolean;
  triageScore: number;
  urgency: 'Routine' | 'Standard' | 'Urgent' | 'Emergency';
  dialectTag: string;
}

/**
 * Full Agentic Tool-Use Loop
 * Sends messages to Claude, resolves tool_use blocks, loops until final answer.
 * Falls back to high-fidelity simulated agent if no API key or on error.
 */
export async function runClaudeAgentLoop(
  userText: string,
  history: ChatMessage[] = [],
  context: ToolExecutionContext = {},
  languagePreference: 'swa_eng' | 'swa' | 'eng' = 'swa_eng'
): Promise<ClaudeAgentLoopResult> {
  const apiKey = getAnthropicApiKey();
  const useLiveApi = isLiveApiEnabled() && Boolean(apiKey);

  // 1. First evaluate clinical safety
  const safety = evaluateClinicalSafety(userText);
  if (safety.isEmergency) {
    return {
      finalText: safety.recommendedAction,
      executedTools: [],
      isEmergency: true,
      triageScore: 5,
      urgency: 'Emergency',
      dialectTag: 'Dharura / Emergency Alert',
    };
  }

  // 2. If live API enabled, attempt live Claude Tool-Calling Loop
  if (useLiveApi) {
    try {
      return await executeLiveClaudeAgentLoop(userText, history, context, languagePreference);
    } catch (apiError: any) {
      console.warn('Live Claude API call failed, falling back to local clinical agent:', apiError.message);
      // Fallback gracefully so patient never experiences a crash
      return simulateClaudeAgentLoop(userText, context, languagePreference, safety.triageScore, safety.urgency);
    }
  }

  // 3. Simulated Intelligent Local Clinical Agent (Offline / No Key Mode)
  return simulateClaudeAgentLoop(userText, context, languagePreference, safety.triageScore, safety.urgency);
}

/**
 * Live Anthropic Claude Multi-Turn Tool-Use Execution
 */
async function executeLiveClaudeAgentLoop(
  userText: string,
  history: ChatMessage[],
  context: ToolExecutionContext,
  languagePreference: 'swa_eng' | 'swa' | 'eng'
): Promise<ClaudeAgentLoopResult> {
  // Format past history into Claude message format (last 6 turns)
  const recentHistory = history.slice(-6);
  const messages: ClaudeApiMessage[] = recentHistory.map(m => ({
    role: m.sender === 'patient' ? 'user' : 'assistant',
    content: m.text,
  }));

  // Append new user message
  messages.push({
    role: 'user',
    content: userText,
  });

  const executedTools: ToolExecutionResult[] = [];
  let latestFeedbackCard: FeedbackCardData | undefined;
  let latestCareRequest: CareRequest | undefined;
  let iterations = 0;
  const maxIterations = 4;

  while (iterations < maxIterations) {
    iterations++;

    const response = await callAnthropicMessagesApi(messages);

    // Collect assistant blocks
    const assistantBlocks: ClaudeContentBlock[] = response.content;
    messages.push({
      role: 'assistant',
      content: assistantBlocks,
    });

    // Check if Claude requested tool calls
    const toolUseBlocks = assistantBlocks.filter(b => b.type === 'tool_use') as Array<{
      type: 'tool_use';
      id: string;
      name: string;
      input: Record<string, any>;
    }>;

    if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
      // Finished! Extract final text
      const textBlocks = assistantBlocks.filter(b => b.type === 'text') as Array<{ type: 'text'; text: string }>;
      const finalText = textBlocks.map(t => t.text).join('\n\n') || 'Nimekuelewa vizuri. Ombi lako linachakatwa.';

      const pathway = determineCarePathway(userText);

      return {
        finalText,
        executedTools,
        createdCareRequest: latestCareRequest,
        feedbackCard: latestFeedbackCard,
        isEmergency: false,
        triageScore: pathway.triageScore,
        urgency: pathway.urgency,
        dialectTag: languagePreference === 'swa' ? 'KISWAHILI' : languagePreference === 'eng' ? 'ENGLISH' : 'SWA + ENG CODE-SWITCH',
      };
    }

    // Execute each tool requested by Claude
    const toolResultBlocks: ClaudeContentBlock[] = [];

    for (const toolUse of toolUseBlocks) {
      const result = await executeAfyaConnectTool(toolUse.name, toolUse.input, context);
      executedTools.push(result);

      if (result.feedbackCard) {
        latestFeedbackCard = result.feedbackCard;
      }
      if (result.createdCareRequest) {
        latestCareRequest = result.createdCareRequest;
      }

      toolResultBlocks.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result.data || { success: result.success, message: result.message }),
      });
    }

    // Append tool results as user message back to Claude
    messages.push({
      role: 'user',
      content: toolResultBlocks,
    });
  }

  // If reached max iterations, fallback to accumulated results
  const pathway = determineCarePathway(userText);
  return {
    finalText: 'Nimekuelewa vizuri. Maelezo ya hospitali na nafasi za madaktari yamepatikana.',
    executedTools,
    createdCareRequest: latestCareRequest,
    feedbackCard: latestFeedbackCard,
    isEmergency: false,
    triageScore: pathway.triageScore,
    urgency: pathway.urgency,
    dialectTag: 'SWA + ENG CODE-SWITCH',
  };
}

/**
 * Intelligent Local Clinical Agent (Offline / Zero-Key Fallback)
 * Executes the exact same tool execution pipeline!
 */
export async function simulateClaudeAgentLoop(
  userText: string,
  context: ToolExecutionContext,
  languagePreference: 'swa_eng' | 'swa' | 'eng',
  triageScore: number,
  urgency: 'Routine' | 'Standard' | 'Urgent' | 'Emergency'
): Promise<ClaudeAgentLoopResult> {
  const pathway = determineCarePathway(userText);
  const executedTools: ToolExecutionResult[] = [];

  // 1. Tool Call: find_nearby_facilities
  const findToolRes = await executeAfyaConnectTool(
    'find_nearby_facilities',
    { radiusKm: 4.5, carePathway: pathway.department },
    context
  );
  executedTools.push(findToolRes);

  const facilities = findToolRes.data.facilities || [];
  const primaryFacility = facilities[0] || {
    id: 'f-agakhan',
    name: 'Aga Khan Univ. Hospital',
    subCounty: 'Parklands',
    distanceKm: 1.4,
    driveTime: '~6 min drive',
    leadDoctor: 'Dr. Wanjiku Kamau',
    earliestSlot: 'Leo 3:30 PM',
  };

  // 2. Tool Call: check_doctor_availability
  const availToolRes = await executeAfyaConnectTool(
    'check_doctor_availability',
    { facilityId: primaryFacility.id, departmentCode: pathway.departmentCode },
    context
  );
  executedTools.push(availToolRes);

  const availability = availToolRes.data;
  const leadDoctor = availability?.availableDoctors?.[0]?.doctorName || primaryFacility.leadDoctor;
  const earliestSlot = availability?.earliestAvailableSlot || primaryFacility.earliestSlot;

  // 3. Tool Call: create_care_request
  const careRequestRes = await executeAfyaConnectTool(
    'create_care_request',
    {
      patientName: context.patientName || 'Jane M.',
      verbatimTranscript: userText,
      chiefConcern: userText.length > 35 ? userText.slice(0, 35) + '...' : userText,
      triageScore: pathway.triageScore,
      urgency: pathway.urgency,
      facilityId: primaryFacility.id,
      preferredSlot: earliestSlot,
    },
    context
  );
  executedTools.push(careRequestRes);

  // 4. Construct Empathetic Bilingual Text
  let finalText = '';
  let dialectTag = 'SWA + ENG CODE-SWITCH';
  const lower = userText.toLowerCase();

  const isTomorrow = earliestSlot.toLowerCase().includes('kesho') || earliestSlot.toLowerCase().includes('tomorrow');
  const cleanSlot = earliestSlot.replace(/Leo\s*|Kesho\s*|Today\s*|Tomorrow\s*/gi, '').trim();

  let formattedDate = 'Tomorrow, Tuesday 24 Sept';
  let formattedTime = `Tomorrow at ${cleanSlot}`;
  let statusText = 'Verified Slot';

  if (languagePreference === 'eng') {
    dialectTag = 'ENGLISH';
    formattedDate = isTomorrow ? 'Tomorrow, Tuesday 24 Sept' : 'Today, Sunday 20 Sept';
    formattedTime = isTomorrow ? `Tomorrow at ${cleanSlot}` : `Today at ${cleanSlot}`;
    statusText = 'Verified Slot';
    finalText = `I have received your request regarding ${pathway.department.toLowerCase()}. ${pathway.explanationEnglish} I found ${facilities.length} healthcare facilities near you in ${primaryFacility.subCounty} with consultation slots available. Dr. ${leadDoctor} at ${primaryFacility.name} is available ${formattedTime}. Would you like to book this appointment?`;
  } else if (languagePreference === 'swa') {
    dialectTag = 'KISWAHILI PEKEE';
    formattedDate = isTomorrow ? 'Kesho, Jumanne 24 Sept' : 'Leo, Jumapili 20 Sept';
    formattedTime = isTomorrow ? `Kesho ${cleanSlot}` : `Leo ${cleanSlot}`;
    statusText = 'Nafasi Imethibitishwa';
    finalText = `Nimekuelewa vizuri kuhusu ${pathway.department}. ${pathway.explanationSwahili} Nimepata vituo ${facilities.length} vilivyo karibu nawe hapa ${primaryFacility.subCounty} vyenye nafasi ya daktari ${leadDoctor} (${formattedTime}). Je, ungependa kuthibitisha miadi hii katika hospitali ya ${primaryFacility.name}?`;
  } else {
    // Kenyan Code-Switching (Sheng / Swahili + English)
    dialectTag = 'SWA + ENG CODE-SWITCH';
    formattedDate = isTomorrow ? 'Tomorrow, Tuesday 24 Sept' : 'Leo, Jumapili 20 Sept';
    formattedTime = isTomorrow ? `Kesho at ${cleanSlot}` : `Leo at ${cleanSlot}`;
    statusText = 'Verified Slot';
    const userHasSwahili = /nimekuwa|nahisi|tumbo|kichwa|daktari|kesho|leo|homa|mtoto|masikio|jino|ngozi|kuona/i.test(lower);
    if (!userHasSwahili) {
      finalText = `Pole sana, I understand what you are experiencing. ${pathway.explanationEnglish} I found ${facilities.length} nearby healthcare centers in ${primaryFacility.subCounty}. Dr. ${leadDoctor} at ${primaryFacility.name} has an open slot ${formattedTime}. Would you like to book this consultation?`;
    } else {
      finalText = `Pole sana, nimekuelewa vizuri: ${pathway.explanationSwahili} Nimepata vituo ${facilities.length} vya afya vilivyo karibu. Daktari ${leadDoctor} katika ${primaryFacility.name} ana nafasi ${formattedTime}. Je, ungependa kuthibitisha miadi hii?`;
    }
  }

  // 5. Build Feedback Card
  const feedbackCard: FeedbackCardData = {
    type: 'doctor_availability',
    department: pathway.department,
    requestedTime: languagePreference === 'eng' ? (isTomorrow ? 'Tomorrow' : 'Today') : (isTomorrow ? 'Kesho' : 'Leo'),
    statusText,
    doctorName: leadDoctor,
    date: formattedDate,
    time: formattedTime,
    facilityName: primaryFacility.name,
    requestId: careRequestRes.createdCareRequest?.id || `#${Math.floor(10487 + Math.random() * 500)}`,
  };

  return {
    finalText,
    executedTools,
    createdCareRequest: careRequestRes.createdCareRequest,
    feedbackCard,
    isEmergency: false,
    triageScore: pathway.triageScore,
    urgency: pathway.urgency,
    dialectTag,
  };
}
