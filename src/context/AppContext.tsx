import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Language, CareRequest, Facility, ChatMessage, TimelineStep } from '../types';
import { INITIAL_FACILITIES, INITIAL_CARE_REQUESTS, INITIAL_CHAT_MESSAGES } from '../data/mockData';
import { orchestratePatientInteractionAsync } from '../lib/claude/orchestrator';
import { dispatchAppointmentConfirmedNotification } from '../lib/services/notificationService';
import {
  sendInteractMessage,
  bookAppointmentOnBackend,
  rescheduleAppointmentOnBackend,
  cancelAppointmentOnBackend,
  assignDoctorOnBackend,
  confirmSlotOnBackend,
  fetchBackendFacilities,
  fetchHospitalDashboard,
} from '../lib/api/client';
import { AppLanguage, Translations, translations } from '../lib/i18n';

export interface AppContextType {
  // Navigation & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activePatientTab: 'triage' | 'vituo' | 'miadi' | 'hospital';
  setActivePatientTab: (tab: 'triage' | 'vituo' | 'miadi' | 'hospital') => void;
  selectedFacilityForDetail: string | null;
  setSelectedFacilityForDetail: (id: string | null) => void;
  
  // Language & Location
  languagePreference: AppLanguage;
  setLanguagePreference: (lang: AppLanguage) => void;
  toggleLanguagePreference: () => void;
  t: Translations;
  userLocationText: string;
  isGpsActive: boolean;
  toggleGps: () => void;
  
  // Data State
  facilities: Facility[];
  careRequests: CareRequest[];
  activeRequestId: string;
  setActiveRequestId: (id: string) => void;
  activeRequest: CareRequest;
  chatMessages: ChatMessage[];
  
  // Patient Actions
  sendMessage: (text: string, isAudioSnippet?: boolean) => void;
  selectSlotForBooking: (hospitalName: string, doctorName: string, slotTime: string, facilityId?: string) => void;
  confirmBooking: (phone: string) => void;
  rescheduleBooking: (newSlot: string) => void;
  cancelBooking: () => void;
  
  // Hospital Actions
  assignDoctorToRequest: (requestId: string, doctorName: string, slotTime: string) => void;
  confirmSlotFromHospital: (requestId: string, doctorName: string, slotTime: string) => void;
  addCustomHospitalSlot: (doctorId: string, slotTime: string) => void;
  updateRequestDepartment: (requestId: string, department: string) => void;
  
  // Booking Sheet UI
  isBookingSheetOpen: boolean;
  setIsBookingSheetOpen: (open: boolean) => void;
  pendingBooking: {
    hospital: string;
    doctor: string;
    slot: string;
    facilityId: string;
  };
  setPendingBooking: React.Dispatch<React.SetStateAction<{ hospital: string; doctor: string; slot: string; facilityId: string }>>;

  // Toast Notification
  toast: { message: string; visible: boolean };
  showToast: (message: string) => void;

  // Emergency SOS Modal
  isEmergencyModalOpen: boolean;
  setIsEmergencyModalOpen: (open: boolean) => void;

  // AI Processing & Thinking State
  isAiThinking: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const WELCOME_CHAT_MESSAGE: ChatMessage = {
  id: 'welcome-afyaconnect',
  sender: 'assistant',
  text: 'Habari! Karibu AfyaConnect. How can we help you today? You can explain what you are experiencing in English, Kiswahili, or Sheng, and I will help you navigate care and find available doctors.',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  dialectTag: 'AFYACONNECT BILINGUAL',
  options: [
    'Nimekuwa na maumivu ya tumbo (Stomach pain)',
    'Nahitaji kuona daktari kesho asubuhi',
    'Mtoto ana homa kali (Child fever)',
    'Routine check-up & BP refill',
  ],
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [activePatientTab, setActivePatientTab] = useState<'triage' | 'vituo' | 'miadi' | 'hospital'>('triage');
  const [selectedFacilityForDetail, setSelectedFacilityForDetail] = useState<string | null>('f-agakhan');
  const [languagePreference, setLanguagePreference] = useState<AppLanguage>('swa_eng');
  const t = translations[languagePreference];
  const [userLocationText, setUserLocationText] = useState<string>('Westlands, Nairobi • < 2.5 km');
  const [isGpsActive, setIsGpsActive] = useState<boolean>(true);

  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [careRequests, setCareRequests] = useState<CareRequest[]>(INITIAL_CARE_REQUESTS);
  const [activeRequestId, setActiveRequestId] = useState<string>('#10482');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([WELCOME_CHAT_MESSAGE]);

  // Synchronize welcome message when language changes
  useEffect(() => {
    setChatMessages(prev => {
      const idx = prev.findIndex(m => m.id === 'welcome-afyaconnect');
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          text: t.welcomeMessage,
          dialectTag:
            languagePreference === 'eng'
              ? 'ENGLISH'
              : languagePreference === 'swa'
              ? 'KISWAHILI'
              : 'AFYACONNECT BILINGUAL',
          options: t.welcomeOptions,
        };
        return updated;
      }
      return prev;
    });
  }, [languagePreference, t]);

  // Load real facilities and live care requests from backend database on mount
  useEffect(() => {
    let isMounted = true;

    async function loadRealBackendData() {
      try {
        // 1. Fetch real facilities from backend API
        const realFacilities = await fetchBackendFacilities();
        if (isMounted && realFacilities && Array.isArray(realFacilities) && realFacilities.length > 0) {
          setFacilities(realFacilities);
        }

        // 2. Fetch live care requests & inbox from backend hospital dashboard
        const dashboardData = await fetchHospitalDashboard('f-agakhan');
        if (isMounted && dashboardData && dashboardData.inbox && Array.isArray(dashboardData.inbox) && dashboardData.inbox.length > 0) {
          setCareRequests(dashboardData.inbox);
          if (dashboardData.inbox[0]?.id) {
            setActiveRequestId(dashboardData.inbox[0].id);
          }
        }
      } catch (err) {
        console.warn('Real backend data fetch notice, keeping resilient state:', err);
      }
    }

    loadRealBackendData();

    return () => {
      isMounted = false;
    };
  }, []);

  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState<boolean>(false);
  const [pendingBooking, setPendingBooking] = useState({
    hospital: 'Aga Khan Univ. Hospital',
    doctor: 'Dr. Wanjiku Kamau',
    slot: 'Leo 3:30 PM',
    facilityId: 'f-agakhan',
  });

  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3200);
  };

  const toggleLanguagePreference = () => {
    setLanguagePreference((prev: AppLanguage) => {
      if (prev === 'swa_eng') return 'swa';
      if (prev === 'swa') return 'eng';
      return 'swa_eng';
    });
    showToast(
      languagePreference === 'swa_eng'
        ? 'Lugha: Kiswahili Pekee'
        : languagePreference === 'swa'
        ? 'Language: English Only'
        : 'Lugha: Sheng, Swahili & English (Code-switch)'
    );
  };

  const toggleGps = () => {
    setIsGpsActive(prev => !prev);
    if (!isGpsActive) {
      setUserLocationText('Westlands, Nairobi • < 2.5 km (Live GPS)');
      showToast('📍 Mahali pamepatikana kwa GPS (Westlands & Parklands)');
    } else {
      setUserLocationText('Nairobi Central (Manual Selection)');
      showToast('📍 GPS imezimwa. Eneo: Nairobi Central');
    }
  };

  const activeRequest = careRequests.find(r => r.id === activeRequestId) || careRequests[0];

  // Send message in patient chat using Backend API with Claude Agent Orchestrator fallback
  const sendMessage = async (text: string, isAudioSnippet: boolean = false) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newPatientMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'patient',
      text,
      timestamp: timeNow,
      isAudioSnippet,
      audioDuration: isAudioSnippet ? '0:24s' : undefined,
      dialectTag: languagePreference === 'swa' ? 'KISWAHILI' : languagePreference === 'eng' ? 'ENGLISH' : 'SHG / SWA',
    };

    const updatedHistory = [...chatMessages, newPatientMsg];
    setChatMessages(updatedHistory);
    setIsAiThinking(true);

    try {
      // 1. Attempt Backend API First
      const backendRes = await sendInteractMessage({
        message: text,
        isAudioSnippet,
        languagePreference,
        patientName: 'Jane M.',
        patientPhone: '+254 712 345 678',
      });

      if (backendRes) {
        if (backendRes.isEmergency) {
          setIsEmergencyModalOpen(true);
        }

        const primaryFac = backendRes.nearbyFacilities?.[0];
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: backendRes.responseMessage,
          timestamp: timeNow,
          triageLevel: `Triage Level ${backendRes.triageScore}`,
          dialectTag: backendRes.dialectTag,
          feedbackCard: backendRes.feedbackCard,
          recommendedHospital: primaryFac
            ? {
                name: primaryFac.name,
                subCounty: primaryFac.subCounty,
                distance: `${primaryFac.distanceKm} km away`,
                doctorName: primaryFac.leadDoctor,
                doctorSpecialty: 'General Consultation',
                todaySlot: primaryFac.earliestSlot,
                waitTime: '~15 mins wait',
                coverage: 'SHA / NHIF Verified',
                facilityId: primaryFac.id,
              }
            : undefined,
          options: primaryFac
            ? (languagePreference === 'eng'
                ? [
                    `Confirm Slot: ${primaryFac.leadDoctor} • ${primaryFac.earliestSlot.replace(/Leo\s*/gi, 'Today at ').replace(/Kesho\s*/gi, 'Tomorrow at ')}`,
                    '📍 View Nearby Facilities',
                    '🩺 I need a doctor today',
                  ]
                : languagePreference === 'swa'
                ? [
                    `Thibitisha Nafasi: ${primaryFac.leadDoctor} • ${primaryFac.earliestSlot}`,
                    '📍 Ona Vituo Vingine',
                    '🩺 Nahitaji daktari leo',
                  ]
                : [
                    `Confirm Slot: ${primaryFac.leadDoctor} • ${primaryFac.earliestSlot}`,
                    '📍 Ona Vituo / Other Options',
                    '🩺 Nahitaji daktari leo',
                  ])
            : undefined,
        };

        setChatMessages(prev => [...prev, assistantMsg]);

        if (backendRes.careRequest) {
          setCareRequests(prev => [backendRes.careRequest, ...prev]);
          setActiveRequestId(backendRes.careRequest.id);
        }
      } else {
        // 2. Resilient Client-Side Orchestrator Fallback
        const result = await orchestratePatientInteractionAsync(
          text,
          isAudioSnippet,
          languagePreference,
          {
            patientName: 'Jane M.',
            patientPhone: '+254 712 345 678',
            patientLocation: userLocationText,
          },
          updatedHistory
        );

        if (result.isEmergencyAlert) {
          setIsEmergencyModalOpen(true);
        }

        setChatMessages(prev => [...prev, result.message]);

        if (result.createdCareRequest) {
          setCareRequests(prev => [result.createdCareRequest!, ...prev]);
          setActiveRequestId(result.createdCareRequest.id);
        }
      }
    } catch (err: any) {
      console.error('Patient interaction error:', err);
      showToast('Hitilafu ya AI. Jaribu tena.');
    } finally {
      setIsAiThinking(false);
    }
  };

  // When patient selects slot from Vituo or Chat
  const selectSlotForBooking = (hospitalName: string, doctorName: string, slotTime: string, facilityId: string = 'f-agakhan') => {
    setPendingBooking({
      hospital: hospitalName,
      doctor: doctorName,
      slot: slotTime,
      facilityId,
    });
    setIsBookingSheetOpen(true);
  };

  // Confirm booking from sheet or feedback card (8-step synchronized timeline)
  const confirmBooking = (phone: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const token = `#AC-NBO-${Math.floor(1000 + Math.random() * 9000)}`;

    setCareRequests(prev =>
      prev.map(req => {
        if (req.id === activeRequestId || req.id === '#10482') {
          const updatedTimeline: TimelineStep[] = [
            { step: 1, title: 'CALL / CHAT MADE', description: 'Patient initiated triage conversation via app / audio', timestamp: '09:14 AM', completed: true, active: false },
            { step: 2, title: 'Request received', description: 'Triage intake logged and pre-screened', timestamp: '09:15 AM', completed: true, active: false },
            { step: 3, title: 'Hospital received request', description: `${pendingBooking.hospital} intake and triage queue synced`, timestamp: '09:16 AM', completed: true, active: false },
            { step: 4, title: 'Department identified', description: 'General Consultation (OPD)', timestamp: '09:18 AM', completed: true, active: false },
            { step: 5, title: 'Doctor availability checked', description: `${pendingBooking.doctor} calendar confirmed`, timestamp: '09:22 AM', completed: true, active: false },
            { step: 6, title: 'Time proposed', description: `Consultation slot: ${pendingBooking.slot}`, timestamp: '09:23 AM', completed: true, active: false },
            { step: 7, title: 'Patient confirmed', description: `Approved via Phone +254 ${phone}`, timestamp: timeNow, completed: true, active: false },
            { step: 8, title: 'APPOINTMENT BOOKED', description: `Booking confirmed • Token ${token} issued`, timestamp: timeNow, completed: true, active: true },
          ];

          return {
            ...req,
            assignedFacilityName: pendingBooking.hospital,
            assignedDoctorName: pendingBooking.doctor,
            assignedSlot: pendingBooking.slot,
            status: 'CONFIRMED',
            tokenPass: token,
            patientPhone: `+254 ${phone}`,
            timeline: updatedTimeline,
            updatedAt: new Date().toISOString(),
          };
        }
        return req;
      })
    );

    // Send Multi-channel SMS & WhatsApp Notification
    dispatchAppointmentConfirmedNotification(
      `+254 ${phone}`,
      pendingBooking.doctor,
      pendingBooking.hospital,
      pendingBooking.slot,
      token
    );

    // Sync booking with FastAPI backend database
    bookAppointmentOnBackend({
      careRequestId: activeRequestId,
      patientPhone: `+254 ${phone}`,
      facilityName: pendingBooking.hospital,
      doctorName: pendingBooking.doctor,
      slotTime: pendingBooking.slot,
      facilityId: pendingBooking.facilityId,
    }).catch(err => console.warn('Background backend booking sync error:', err));

    // Add confirmation feedback card directly to conversation
    const isEng = languagePreference === 'eng';
    const isSwa = languagePreference === 'swa';
    const isTomorrow = pendingBooking.slot.toLowerCase().includes('kesho') || pendingBooking.slot.toLowerCase().includes('tomorrow');

    const confirmationMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'assistant',
      text: isEng
        ? `Congratulations! Your appointment has been officially confirmed with ${pendingBooking.doctor} at ${pendingBooking.hospital}. Your digital gate pass token is ${token}.`
        : isSwa
        ? `Hongera! Miadi yako imethibitishwa rasmi na ${pendingBooking.doctor} katika ${pendingBooking.hospital}. Nambari yako ya geti ni ${token}.`
        : `Hongera! Your appointment has been confirmed with ${pendingBooking.doctor} at ${pendingBooking.hospital}. Gate pass token: ${token}.`,
      timestamp: timeNow,
      triageLevel: isEng ? 'Confirmed' : 'Imethibitishwa',
      dialectTag: isEng ? 'APPOINTMENT CONFIRMED' : isSwa ? 'MIADI IMETHIBITISHWA' : 'SWA + ENG CONFIRMATION',
      feedbackCard: {
        type: 'appointment_confirmed',
        doctorName: pendingBooking.doctor,
        department: 'General Consultation',
        facilityName: pendingBooking.hospital,
        date: isEng
          ? (isTomorrow ? 'Tomorrow, Tuesday 24 Sept' : 'Today, Sunday 20 Sept')
          : (isTomorrow ? 'Kesho, Jumanne 24 Sept' : 'Leo, Jumapili 20 Sept'),
        time: isEng
          ? pendingBooking.slot.replace(/Leo\s*/gi, 'Today at ').replace(/Kesho\s*/gi, 'Tomorrow at ')
          : pendingBooking.slot,
        requestId: token,
      },
    };
    setChatMessages(prev => [...prev, confirmationMsg]);

    setIsBookingSheetOpen(false);
    showToast(isEng ? `✓ Appointment Confirmed! Pass: ${token} (SMS & Pass sent)` : `✓ Miadi Imethibitishwa! Pass: ${token} (SMS & Pass imetumwa)`);
    setActivePatientTab('miadi');
  };

  // Hospital assigns doctor
  const assignDoctorToRequest = (requestId: string, doctorName: string, slotTime: string) => {
    setCareRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          const updatedTimeline = r.timeline.map(t => {
            if (t.step === 5) return { ...t, completed: true, active: false, description: `${doctorName} verified` };
            if (t.step === 6) return { ...t, completed: true, active: true, title: 'Time proposed', description: `Time proposed: ${slotTime}` };
            return t;
          });
          return {
            ...r,
            assignedDoctorName: doctorName,
            assignedSlot: slotTime,
            status: 'SLOT_PROPOSED',
            timeline: updatedTimeline,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );

    // Sync with backend
    assignDoctorOnBackend(requestId, 'doc-kamau-1', doctorName, slotTime).catch(err =>
      console.warn('Background assign doctor error:', err)
    );

    showToast(`Hospital: ${doctorName} amepewa ombi ${requestId} (${slotTime})`);
  };

  // Hospital confirms slot & dispatches
  const confirmSlotFromHospital = (requestId: string, doctorName: string, slotTime: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const token = `#AC-NBO-${Math.floor(1000 + Math.random() * 9000)}`;

    setCareRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          const updatedTimeline = r.timeline.map(t => {
            if (t.step <= 7) return { ...t, completed: true, active: false };
            if (t.step === 8) return { ...t, completed: true, active: true, timestamp: timeNow, description: `Booking confirmed • Token ${token} issued` };
            return t;
          });

          return {
            ...r,
            assignedDoctorName: doctorName,
            assignedSlot: slotTime,
            status: 'CONFIRMED',
            tokenPass: token,
            timeline: updatedTimeline,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );

    // Sync with backend
    confirmSlotOnBackend(requestId, doctorName, slotTime).catch(err =>
      console.warn('Background confirm slot error:', err)
    );

    showToast(`✓ Dispatched to SHA & SMS! Slot confirmed for ${doctorName} at ${slotTime}`);
  };

  // Hospital updates department
  const updateRequestDepartment = (requestId: string, department: string) => {
    setCareRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          const updatedTimeline = r.timeline.map(t => {
            if (t.step === 4) {
              return {
                ...t,
                completed: true,
                active: true,
                title: 'Department identified',
                description: `Department identified: ${department}`,
              };
            }
            return t;
          });
          return {
            ...r,
            assignedDepartment: department,
            timeline: updatedTimeline,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );
    showToast(`Ombi ${requestId} limepelekwa idara ya ${department}`);
  };

  // Reschedule booking
  const rescheduleBooking = (newSlot: string) => {
    setCareRequests(prev =>
      prev.map(r => {
        if (r.id === activeRequestId || r.id === '#10482') {
          return {
            ...r,
            assignedSlot: newSlot,
            status: 'RESCHEDULING',
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );

    rescheduleAppointmentOnBackend(activeRequestId, newSlot).catch(err =>
      console.warn('Background reschedule error:', err)
    );

    showToast(`Ombi la kubadilisha saa limepokelewa: ${newSlot}`);
  };

  // Cancel booking
  const cancelBooking = () => {
    setCareRequests(prev =>
      prev.map(r => {
        if (r.id === activeRequestId || r.id === '#10482') {
          return {
            ...r,
            status: 'CANCELLED',
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );

    cancelAppointmentOnBackend(activeRequestId).catch(err =>
      console.warn('Background cancel error:', err)
    );

    showToast(`Miadi imeghairiwa. Hospitali imejulishwa.`);
  };

  // Add custom slot override
  const addCustomHospitalSlot = (doctorId: string, slotTime: string) => {
    setFacilities(prev =>
      prev.map(f => {
        return {
          ...f,
          doctors: f.doctors.map(d => {
            if (d.id === doctorId) {
              return {
                ...d,
                slots: [...d.slots, { id: `s-custom-${Date.now()}`, time: slotTime, isAvailable: true, label: `${slotTime} (Custom)` }],
                freeSlotsCount: d.freeSlotsCount + 1,
              };
            }
            return d;
          }),
        };
      })
    );
    showToast(`Custom slot "${slotTime}" imeongezwa kwenye ratiba.`);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activePatientTab,
        setActivePatientTab,
        selectedFacilityForDetail,
        setSelectedFacilityForDetail,
        languagePreference,
        setLanguagePreference,
        toggleLanguagePreference,
        t,
        userLocationText,
        isGpsActive,
        toggleGps,
        facilities,
        careRequests,
        activeRequestId,
        setActiveRequestId,
        activeRequest,
        chatMessages,
        sendMessage,
        selectSlotForBooking,
        confirmBooking,
        rescheduleBooking,
        cancelBooking,
        assignDoctorToRequest,
        confirmSlotFromHospital,
        addCustomHospitalSlot,
        updateRequestDepartment,
        isBookingSheetOpen,
        setIsBookingSheetOpen,
        pendingBooking,
        setPendingBooking,
        toast,
        showToast,
        isEmergencyModalOpen,
        setIsEmergencyModalOpen,
        isAiThinking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
