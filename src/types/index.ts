export type UserRole = 'patient' | 'hospital' | 'doctor' | 'admin';

export type Language = 'swa' | 'eng' | 'mixed';

export type TriageUrgency = 'Routine' | 'Standard' | 'Urgent' | 'Emergency';

export interface DoctorSlot {
  id: string;
  time: string;
  isAvailable: boolean;
  isBooked?: boolean;
  label?: string; // e.g. "Leo 2:30 PM", "Kesho 10:30 AM"
  remainingCount?: number;
}

export interface Doctor {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  qualification: string;
  experience: string;
  room: string;
  isOnDuty: boolean;
  freeSlotsCount: number;
  avatarUrl?: string;
  slots: DoctorSlot[];
}

export interface Facility {
  id: string;
  name: string;
  level: string; // e.g. 'Level 6 Referral', 'Level 5 Hospital', 'Level 4 Public Centre'
  accreditation: string; // e.g. 'SHA Verified', 'SHA Accredited', 'Linda Mama Free'
  address: string;
  subCounty: string;
  distanceKm: number;
  driveTime: string;
  imageUrl: string;
  mapImageUrl: string;
  doctors: Doctor[];
  services: string[];
  paymentBadges: string[];
  queueCount: number;
  isPublic: boolean;
  phone: string;
}

export interface TimelineStep {
  step: number;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  active: boolean;
}

export interface CareRequest {
  id: string; // e.g. '#10482'
  patientName: string;
  patientAge: number;
  patientPhone: string;
  patientLocation: string;
  languageMode: 'SWA + ENG CODE-SWITCH' | 'ENGLISH' | 'KISWAHILI';
  verbatimTranscript: string;
  audioDurationSeconds?: number;
  chiefConcern: string;
  symptomDuration: string;
  secondarySymptoms: string[];
  triageScore: number; // 1 to 5
  urgency: TriageUrgency;
  clinicalSummary: string;
  flags: string[];
  insurance: string;
  distanceKm: number;
  preferredTime: string;
  preferredDate?: string;
  assignedFacilityId: string;
  assignedFacilityName: string;
  assignedDepartment: string;
  assignedDoctorName?: string;
  assignedSlot?: string;
  status: 'AWAITING_REVIEW' | 'CHECKING_AVAILABILITY' | 'SLOT_PROPOSED' | 'CONFIRMED' | 'RESCHEDULING' | 'CANCELLED' | 'COMPLETED';
  tokenPass?: string;
  timeline: TimelineStep[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackCardData {
  type: 'request_received' | 'doctor_availability' | 'appointment_confirmed';
  department: string;
  requestedTime?: string;
  statusText?: string;
  doctorName?: string;
  date?: string;
  time?: string;
  facilityName?: string;
  requestId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'patient' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  isAudioSnippet?: boolean;
  audioDuration?: string;
  dialectTag?: string; // e.g. 'SHG / SWA', 'ENG', 'SWA'
  triageLevel?: string; // e.g. 'Triage Level 2'
  feedbackCard?: FeedbackCardData;
  recommendedHospital?: {
    name: string;
    subCounty: string;
    distance: string;
    doctorName: string;
    doctorSpecialty: string;
    todaySlot: string;
    waitTime: string;
    coverage: string;
    facilityId: string;
  };
  options?: string[];
}
