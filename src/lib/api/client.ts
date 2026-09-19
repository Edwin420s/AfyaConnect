/**
 * AfyaConnect Frontend-to-Backend Typed API Client
 * Connects the React/TypeScript client with the FastAPI / SQLite backend service.
 * Supports transparent fallback to client-side orchestrator when offline.
 */

import { CareRequest, Facility, FeedbackCardData, ChatMessage } from '../../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

export interface BackendInteractResponse {
  conversationId: string;
  responseMessage: string;
  dialectTag: string;
  triageScore: number;
  urgency: string;
  isEmergency: boolean;
  feedbackCard: FeedbackCardData;
  nearbyFacilities: Array<{
    id: string;
    name: string;
    distanceKm: number;
    driveTime: string;
    leadDoctor: string;
    earliestSlot: string;
    subCounty: string;
  }>;
  careRequest?: any;
}

export interface BackendBookAppointmentRequest {
  careRequestId?: string;
  patientPhone: string;
  facilityName: string;
  doctorName: string;
  slotTime: string;
  facilityId?: string;
}

export interface BackendBookAppointmentResponse {
  success: boolean;
  tokenPass: string;
  status: string;
  appointmentId: string;
  doctorName: string;
  facilityName: string;
  slotTime: string;
  message: string;
}

export interface BackendDashboardData {
  facility: {
    id: string;
    name: string;
    subCounty: string;
    phone: string;
  };
  metrics: {
    totalRequests: number;
    awaitingReview: number;
    slotsProposed: number;
    confirmedToday: number;
    avgTriageTime: string;
  };
  inbox: any[];
}

/**
 * Check if the backend FastAPI service is reachable
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:8000/health', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Send patient message to backend Claude care-navigation API
 */
export async function sendInteractMessage(params: {
  message: string;
  isAudioSnippet?: boolean;
  languagePreference?: 'swa_eng' | 'swa' | 'eng';
  patientName?: string;
  patientPhone?: string;
  conversationId?: string;
}): Promise<BackendInteractResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/conversations/interact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: params.message,
        isAudioSnippet: params.isAudioSnippet || false,
        languagePreference: params.languagePreference || 'swa_eng',
        patientName: params.patientName || 'Jane M.',
        patientPhone: params.patientPhone || '+254 712 345 678',
        conversationId: params.conversationId,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Backend /conversations/interact unavailable, using client fallback:', err);
    return null;
  }
}

/**
 * Fetch facilities from backend
 */
export async function fetchBackendFacilities(): Promise<Facility[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/facilities`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch hospital reception dashboard data
 */
export async function fetchHospitalDashboard(facilityId: string = 'f-agakhan'): Promise<BackendDashboardData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/hospital/dashboard?facility_id=${facilityId}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Confirm and book appointment on backend
 */
export async function bookAppointmentOnBackend(
  payload: BackendBookAppointmentRequest
): Promise<BackendBookAppointmentResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Backend /appointments/book error:', err);
    return null;
  }
}

/**
 * Reschedule appointment on backend
 */
export async function rescheduleAppointmentOnBackend(
  appointmentId: string,
  newSlotTime: string,
  reason: string = 'Patient requested time change'
): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newSlotTime, reason }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Cancel appointment on backend
 */
export async function cancelAppointmentOnBackend(
  appointmentId: string,
  reason: string = 'Patient cancelled'
): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Assign doctor to care request from Hospital Dashboard
 */
export async function assignDoctorOnBackend(
  careRequestId: string,
  doctorId: string,
  doctorName: string,
  slotTime: string
): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/hospital/care-requests/${careRequestId}/assign-doctor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId, doctorName, slotTime }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Confirm slot from Hospital Dashboard
 */
export async function confirmSlotOnBackend(
  careRequestId: string,
  doctorName: string,
  slotTime: string
): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/hospital/care-requests/${careRequestId}/confirm-slot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorName, slotTime }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Dispatch SMS / WhatsApp pass from Hospital Dashboard
 */
export async function dispatchPassOnBackend(
  careRequestId: string,
  channel: 'SMS' | 'WHATSAPP' = 'SMS'
): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/hospital/care-requests/${careRequestId}/dispatch-pass?channel=${channel}`, {
      method: 'POST',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Query real-time doctor availability
 */
export async function checkDoctorAvailability(
  facilityId: string = 'f-agakhan',
  departmentCode: string = 'OPD',
  preferredDay: string = 'today'
): Promise<any | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/availability/check?facility_id=${facilityId}&department_code=${departmentCode}&preferred_day=${preferredDay}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Resolve GPS coordinates to Kenyan locality and return nearest facilities
 */
export async function resolvePatientCoordinates(
  latitude: number,
  longitude: number,
  carePathway: string = 'All'
): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/location/resolve-area`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, radiusKm: 5.0, carePathway }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
