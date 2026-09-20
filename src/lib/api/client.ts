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
  options?: string[];
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
    const rawList = await res.json();
    if (!Array.isArray(rawList)) return null;

    return rawList.map((f: any) => ({
      id: f.id,
      name: f.name,
      level: f.level || 'Level 4 Hospital',
      accreditation: f.accreditation || 'SHA Verified',
      address: f.address || 'Nairobi, Kenya',
      subCounty: f.subCounty || 'Nairobi County',
      distanceKm: typeof f.distanceKm === 'number' ? f.distanceKm : 2.5,
      driveTime: f.driveTime || '10 mins',
      imageUrl: f.imageUrl || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=400',
      mapImageUrl: f.mapImageUrl || f.imageUrl || '',
      phone: f.phone || '+254 20 000 0000',
      isPublic: !!f.isPublic,
      queueCount: f.queueCount || 3,
      services: Array.isArray(f.services)
        ? f.services
        : Array.isArray(f.departments)
        ? f.departments
        : ['General Consultation', 'Pediatrics'],
      paymentBadges: Array.isArray(f.paymentBadges)
        ? f.paymentBadges
        : Array.isArray(f.acceptsInsurance)
        ? f.acceptsInsurance
        : ['SHA / NHIF', 'Cash / M-PESA'],
      doctors: Array.isArray(f.doctors)
        ? f.doctors.map((d: any) => ({
            id: d.id,
            name: d.name || d.fullName || 'Medical Officer',
            initials: d.initials || 'MO',
            specialty: d.specialty || 'General Consultation',
            qualification: d.qualification || 'MBChB',
            experience: d.experience || '5+ years',
            room: d.room || d.roomNumber || 'Room 01',
            isOnDuty: d.isOnDuty !== false,
            freeSlotsCount: d.freeSlotsCount || 2,
            avatarUrl: d.avatarUrl,
            slots: Array.isArray(d.slots) && d.slots.length > 0
              ? d.slots
              : [
                  { id: `${d.id}-s1`, time: 'Leo 3:30 PM', isAvailable: true, remainingCount: 2 },
                  { id: `${d.id}-s2`, time: 'Kesho 10:30 AM', isAvailable: true, remainingCount: 3 },
                  { id: `${d.id}-s3`, time: 'Kesho 02:00 PM', isAvailable: true, remainingCount: 1 },
                ],
          }))
        : [],
    }));
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
