export type AppLanguage = 'swa_eng' | 'swa' | 'eng';

export interface Translations {
  // Navigation & Header
  brandTagline: string;
  connected: string;
  switchRole: string;
  switchRoleTitle: string;
  rolePatient: string;
  roleHospital: string;
  roleDoctor: string;
  roleAdmin: string;
  
  // Bottom Nav
  navTriage: string;
  navFacilities: string;
  navAppointments: string;
  navHospital: string;

  // Care Frontdoor
  welcomeMessage: string;
  welcomeOptions: string[];
  quickPromptsTitle: string;
  quickPrompts: { text: string; actionText: string }[];
  inputPlaceholder: string;
  holdToTalk: string;
  listening: string;
  langHint: string;
  listenAudio: string;
  bannerTitle: string;
  bannerSubtitle: string;
  smsFallback: string;
  viewOptions: string;
  bookThisSlot: string;

  // Nearby Facilities
  backToTriage: string;
  myPasses: string;
  facilitiesTitle: string;
  facilitiesSubtitle: string;
  searchPlaceholder: string;
  allFacilities: string;
  generalConsultation: string;
  pediatrics: string;
  dental: string;
  maternity: string;
  availableSlots: string;
  selectSlot: string;
  slotFree: string;
  queue: string;
  mapTitle: string;
  viewMap: string;
  readyDoctorsCount: string;
  readyDoctorsDesc: string;

  // My Appointment
  myAppointmentTitle: string;
  appointmentConfirmed: string;
  appointmentCancelled: string;
  dateTimeSlot: string;
  consultationSuite: string;
  shaReference: string;
  qrPassTitle: string;
  qrPassDesc: string;
  requestReschedule: string;
  cancelBooking: string;
  selectNewSlot: string;
  confirmNewTime: string;
  cancel: string;
  emergencySupportText: string;

  // Booking Sheet Modal
  bookSlotTitle: string;
  facilityLabel: string;
  doctorLabel: string;
  timeLabel: string;
  phoneLabel: string;
  completeBookingBtn: string;
  bookingNote: string;

  // Emergency Modal
  emergencyTitle: string;
  emergencyWarning: string;
  callRedCross: string;
  call999: string;
  nearestER: string;
  getDirections: string;
  callERDesk: string;
  closeEmergency: string;
}

export const translations: Record<AppLanguage, Translations> = {
  eng: {
    brandTagline: 'Live',
    connected: 'Connected • Nairobi Central',
    switchRole: 'Switch View',
    switchRoleTitle: 'Select Platform Role',
    rolePatient: 'Patient Frontdoor',
    roleHospital: 'Hospital Intake Desk',
    roleDoctor: 'Doctor OPD Roster',
    roleAdmin: 'Metropolis Admin',

    navTriage: 'Triage AI',
    navFacilities: 'Facilities',
    navAppointments: 'Appointments',
    navHospital: 'Hospital',

    welcomeMessage:
      'Hello! Welcome to AfyaConnect. How can we help you today? Please describe what symptoms you are experiencing in English, and I will help you find the right doctor and book an appointment.',
    welcomeOptions: [
      'I have stomach pain for two days',
      'I need to see a doctor tomorrow morning',
      'My child has a high fever',
    ],
    quickPromptsTitle: 'Quick Prompts:',
    quickPrompts: [
      { text: '🩺 I need a doctor today', actionText: 'I need to see a doctor today' },
      { text: '📍 Check nearby hospitals', actionText: 'Check nearby hospitals' },
      { text: '💊 Severe stomach pain', actionText: 'I have severe stomach pain for two days' },
      { text: '👶 Child has high fever', actionText: 'My child has a high fever and is weak' },
    ],
    inputPlaceholder: 'Describe how you feel (e.g. stomach pain, fever)...',
    holdToTalk: 'Hold to Talk',
    listening: 'Listening...',
    langHint: 'English voice input',
    listenAudio: 'Listen',
    bannerTitle: 'English Clinical AI • Active',
    bannerSubtitle: 'Automated clinical triage tuned for Kenyan outpatient navigation',
    smsFallback: 'AfyaConnect SMS / USSD fallback active via *384#',
    viewOptions: 'View Facilities',
    bookThisSlot: 'Book This Slot',

    backToTriage: 'Back to Triage',
    myPasses: 'My Passes',
    facilitiesTitle: 'Nearby Healthcare Facilities',
    facilitiesSubtitle: 'Find verified clinics and hospitals with available duty doctors.',
    searchPlaceholder: 'Search hospital, doctor, or specialty...',
    allFacilities: 'All Facilities',
    generalConsultation: 'General Consultation',
    pediatrics: 'Pediatrics',
    dental: 'Dental',
    maternity: 'Maternity / Linda Mama',
    availableSlots: 'Available Slots (Today & Tomorrow):',
    selectSlot: 'Select This Slot',
    slotFree: 'Free Slot',
    queue: 'Queue:',
    mapTitle: 'Neighborhood Map Preview (Nairobi Westlands)',
    viewMap: 'View Map →',
    readyDoctorsCount: 'Participating clinics ready',
    readyDoctorsDesc: 'Verified healthcare facilities under Kenyan Ministry of Health & SHA guidelines.',

    myAppointmentTitle: 'My Consultation Pass',
    appointmentConfirmed: 'Appointment Confirmed',
    appointmentCancelled: 'Appointment Cancelled',
    dateTimeSlot: 'Date & Time / Slot',
    consultationSuite: 'Consultation Suite',
    shaReference: 'SHA / NHIF Member Reference',
    qrPassTitle: 'Hospital Entry QR Pass (Digital Clinic Pass)',
    qrPassDesc: 'Present this digital pass at the hospital reception desk for priority queue admission.',
    requestReschedule: 'Request Reschedule',
    cancelBooking: 'Cancel This Booking',
    selectNewSlot: 'Select New Time Slot:',
    confirmNewTime: 'Confirm New Time',
    cancel: 'Cancel',
    emergencySupportText: 'Emergency assistance needed? Call 1199 (Red Cross) or 999.',

    bookSlotTitle: 'Confirm Appointment (Book Slot)',
    facilityLabel: 'Facility:',
    doctorLabel: 'Medical Officer:',
    timeLabel: 'Selected Time:',
    phoneLabel: 'Phone Number (for SMS Pass & Notifications)',
    completeBookingBtn: 'Complete Booking',
    bookingNote: 'Instant confirmation SMS and digital QR pass will be issued immediately.',

    emergencyTitle: 'Emergency SOS • Urgent Medical Warning',
    emergencyWarning:
      'This condition requires immediate emergency medical attention! If you or someone you are assisting is experiencing severe chest pain, difficulty breathing, loss of consciousness, or heavy bleeding, do not wait for a routine appointment.',
    callRedCross: 'Call 1199 (Kenya Red Cross Ambulance)',
    call999: 'Call 999 / 112 (National Emergency Hotlines)',
    nearestER: 'Nearest Emergency Trauma Center',
    getDirections: 'Get Directions',
    callERDesk: 'Call ER Desk',
    closeEmergency: 'Close and continue standard consultation',
  },

  swa: {
    brandTagline: 'Moja kwa Moja',
    connected: 'Imeunganishwa • Nairobi Kati',
    switchRole: 'Badili Mwonekano',
    switchRoleTitle: 'Chagua Wajibu',
    rolePatient: 'Mgonjwa / Huduma',
    roleHospital: 'Mapokezi ya Hospitali',
    roleDoctor: 'Ratiba ya Daktari (OPD)',
    roleAdmin: 'Usimamizi wa Afya',

    navTriage: 'Uchunguzi AI',
    navFacilities: 'Vituo',
    navAppointments: 'Miadi',
    navHospital: 'Hospitali',

    welcomeMessage:
      'Habari! Karibu AfyaConnect. Tunawezaje kukusaidia leo? Tafadhali eleza dalili unazopata kwa Kiswahili, nami nitakusaidia kupata daktari anayefaa na kupanga miadi.',
    welcomeOptions: [
      'Nimekuwa na maumivu ya tumbo kwa siku mbili',
      'Nahitaji kuona daktari kesho asubuhi',
      'Mtoto ana homa kali',
    ],
    quickPromptsTitle: 'Majibu ya Haraka:',
    quickPrompts: [
      { text: '🩺 Nahitaji daktari leo', actionText: 'Nahitaji kuona daktari leo' },
      { text: '📍 Vituo vilivyo karibu', actionText: 'Vituo vilivyo karibu' },
      { text: '💊 Maumivu makali ya tumbo', actionText: 'Nimekuwa na maumivu makali ya tumbo kwa siku mbili' },
      { text: '👶 Mtoto ana homa kali', actionText: 'Mtoto ana homa kali na mdhaifu' },
    ],
    inputPlaceholder: 'Eleza unavyohisi (mfano: maumivu ya tumbo, homa)...',
    holdToTalk: 'Shikilia Kuongea',
    listening: 'Inasikiliza...',
    langHint: 'Sauti kwa Kiswahili',
    listenAudio: 'Sikiliza',
    bannerTitle: 'AI ya Kimatibabu • Kiswahili Pekee',
    bannerSubtitle: 'Mfumo wa uchunguzi wa haraka na uelekezaji wa wagonjwa Kenya',
    smsFallback: 'AfyaConnect kupitia SMS na USSD inafanya kazi kwa *384#',
    viewOptions: 'Ona Vituo',
    bookThisSlot: 'Chagua Nafasi Hii',

    backToTriage: 'Rudi kwenye Mazungumzo',
    myPasses: 'Miadi Yangu',
    facilitiesTitle: 'Vituo vya Afya Vilivyo Karibu',
    facilitiesSubtitle: 'Kupata vituo vya afya vilivyo tayari kuhudumia na madaktari wa zamu.',
    searchPlaceholder: 'Tafuta hospitali, daktari au huduma...',
    allFacilities: 'Vituo Vyote',
    generalConsultation: 'Uchunguzi wa Jumla',
    pediatrics: 'Watoto (Pediatrics)',
    dental: 'Meno (Dental)',
    maternity: 'Uzazi (Linda Mama)',
    availableSlots: 'Nafasi za Leo na Kesho:',
    selectSlot: 'Chagua Nafasi Hii',
    slotFree: 'Nafasi Ipo',
    queue: 'Foleni:',
    mapTitle: 'Ramani ya Mtaa (Nairobi Westlands)',
    viewMap: 'Tazama Ramani →',
    readyDoctorsCount: 'Vituo vipo tayari',
    readyDoctorsDesc: 'Vituo vilivyoidhinishwa chini ya miongozo ya Wizara ya Afya na SHA.',

    myAppointmentTitle: 'Pasi Yangu ya Miadi',
    appointmentConfirmed: 'Miadi Imethibitishwa',
    appointmentCancelled: 'Miadi Imeghairiwa',
    dateTimeSlot: 'Tarehe na Saa ya Miadi',
    consultationSuite: 'Chumba cha Uchunguzi',
    shaReference: 'Nambari ya Uanachama wa SHA / NHIF',
    qrPassTitle: 'Msimbo wa QR wa Kuingia Hospitalini',
    qrPassDesc: 'Onyesha msimbo huu kwenye mapokezi ya hospitali kwa ajili ya kuingia bila kuchelewa.',
    requestReschedule: 'Omba Kubadilisha Wakati',
    cancelBooking: 'Ghairi Miadi Hii',
    selectNewSlot: 'Chagua Saa Mpya:',
    confirmNewTime: 'Thibitisha Saa Mpya',
    cancel: 'Ghairi',
    emergencySupportText: 'Usaidizi wa dharura? Piga 1199 (Red Cross) au 999.',

    bookSlotTitle: 'Thibitisha Miadi',
    facilityLabel: 'Kituo cha Afya:',
    doctorLabel: 'Mtoa Huduma / Daktari:',
    timeLabel: 'Saa Iliyochaguliwa:',
    phoneLabel: 'Nambari ya Simu (kwa SMS na Pass)',
    completeBookingBtn: 'Kamilisha Miadi',
    bookingNote: 'SMS ya uthibitisho na msimbo wa QR vitatumwa mara moja.',

    emergencyTitle: 'Onyo la Dharura • Usaidizi wa Haraka',
    emergencyWarning:
      'Hali hii inahitaji uangalizi wa dharura mara moja! Kama wewe au mtu unayemsaidia anapata maumivu makali ya kifua, ugumu wa kupumua, kupoteza fahamu au kuvuja damu nyingi, usisubiri miadi ya kawaida.',
    callRedCross: 'Piga 1199 (Ambulansi ya Red Cross Kenya)',
    call999: 'Piga 999 / 112 (Nambari za Dharura za Kitaifa)',
    nearestER: 'Kituo cha Dharura Kilicho Karibu',
    getDirections: 'Pata Maelekezo',
    callERDesk: 'Piga ER Desk',
    closeEmergency: 'Funga na uendelee na mazungumzo',
  },

  swa_eng: {
    brandTagline: 'Live',
    connected: 'Connected • Nairobi Central',
    switchRole: 'Badili Mwonekano',
    switchRoleTitle: 'Badili Mwonekano (Switch View)',
    rolePatient: 'Mgonjwa / Patient',
    roleHospital: 'Mapokezi / Hospital Intake',
    roleDoctor: 'Daktari / Doctor Roster',
    roleAdmin: 'Usimamizi / Admin',

    navTriage: 'Triage AI',
    navFacilities: 'Vituo',
    navAppointments: 'Miadi',
    navHospital: 'Hospital',

    welcomeMessage:
      'Habari! Karibu AfyaConnect. How can we help you today? You can explain what you are experiencing in English, Kiswahili, or Sheng, and I will help you navigate care and find available doctors.',
    welcomeOptions: [
      'Nimekuwa na maumivu ya tumbo (Stomach pain)',
      'Nahitaji kuona daktari kesho asubuhi',
      'Mtoto ana homa kali (Child fever)',
    ],
    quickPromptsTitle: 'Majibu ya haraka (Quick Prompts):',
    quickPrompts: [
      { text: '🩺 Nahitaji daktari leo', actionText: 'Nahitaji daktari leo' },
      { text: '📍 Check nearby hospitals', actionText: 'Check nearby hospitals' },
      { text: '💊 Maumivu ya tumbo', actionText: 'Nimekuwa na maumivu makali ya tumbo' },
      { text: '👶 Mtoto ana homa kali', actionText: 'Mtoto ana homa kali' },
    ],
    inputPlaceholder: 'Eleza unavyohisi / Describe how you feel...',
    holdToTalk: 'Shikilia Kuongea (Hold to Talk)',
    listening: 'Inasikiliza... (Listening)',
    langHint: 'Sheng, Swahili au English',
    listenAudio: 'Sikiliza (Listen)',
    bannerTitle: 'Bilingual Care AI • Kiswahili + English',
    bannerSubtitle: 'Code-switching engine tuned for Kenyan conversational triage',
    smsFallback: 'AfyaConnect SMS / USSD Fallback active via *384#',
    viewOptions: 'Ona Vituo / Options',
    bookThisSlot: 'Book Slot Hii',

    backToTriage: 'Rudi kwenye Mazungumzo (Back to Triage)',
    myPasses: 'Miadi Yangu (Passes)',
    facilitiesTitle: 'Vituo Vilivyo Karibu',
    facilitiesSubtitle: 'Kupata vituo vya afya vilivyo tayari kuhudumia na madaktari wa zamu.',
    searchPlaceholder: 'Tafuta hospitali, daktari au huduma...',
    allFacilities: 'All Facilities (14)',
    generalConsultation: 'General Consultation',
    pediatrics: 'Pediatrics',
    dental: 'Dental',
    maternity: 'Maternity / Linda Mama',
    availableSlots: 'Nafasi za Leo & Kesho (Available Slots):',
    selectSlot: 'Chagua Slot Hii',
    slotFree: 'Nafasi ipo',
    queue: 'Foleni:',
    mapTitle: 'Onyesha kwenye Ramani ya Mtaa (Nairobi Westlands)',
    viewMap: 'Tazama Ramani →',
    readyDoctorsCount: '3 vituo vina madaktari tayari',
    readyDoctorsDesc: 'You choose the facility you trust best. All verified under Kenyan Ministry of Health & SHA guidelines.',

    myAppointmentTitle: 'My Appointment Pass',
    appointmentConfirmed: 'Miadi Imethibitishwa • Confirmed',
    appointmentCancelled: 'Miadi Imeghairiwa • Cancelled',
    dateTimeSlot: 'Tarehe na Saa / Slot',
    consultationSuite: 'Chumba / Room',
    shaReference: 'Nambari ya Rejea ya SHA / NHIF',
    qrPassTitle: 'Msimbo wa QR wa Kuingia Hospitalini (Digital Clinic Pass)',
    qrPassDesc: 'Onyesha msimbo huu kwenye mapokezi ya hospitali ili kuingia moja kwa moja.',
    requestReschedule: 'Omba Kubadilisha Wakati (Reschedule)',
    cancelBooking: 'Ghairi Miadi Hii (Cancel Booking)',
    selectNewSlot: 'Chagua Muda Mpya (Select New Slot):',
    confirmNewTime: 'Thibitisha Wakati Mpya',
    cancel: 'Ghairi',
    emergencySupportText: 'Usaidizi wa dharura? Piga 1199 (Red Cross) au wasiliana na AfyaConnect Support.',

    bookSlotTitle: 'Thibitisha Miadi (Book Slot)',
    facilityLabel: 'Kituo / Facility:',
    doctorLabel: 'Mtoa Huduma:',
    timeLabel: 'Muda / Selected Time:',
    phoneLabel: 'Nambari ya Simu (M-PESA / SMS Pass)',
    completeBookingBtn: 'Kamilisha Miadi (Book Slot)',
    bookingNote: 'Msimbo wa QR na SMS ya uthibitisho vitatumwa mara moja.',

    emergencyTitle: 'Onyo la Dharura • Emergency SOS',
    emergencyWarning:
      'Hali hii inahitaji uangalizi wa dharura mara moja! Kama wewe au mtu unayemsaidia anapata maumivu makali ya kifua, ugumu wa kupumua, kupoteza fahamu au kuvuja damu nyingi, usisubiri miadi ya kawaida.',
    callRedCross: 'Piga 1199 (Kenya Red Cross Ambulance)',
    call999: 'Piga 999 / 112 (National Emergency Hotlines)',
    nearestER: 'Kituo cha Dharura Kilicho Karibu (Nearest ER)',
    getDirections: 'Pata Maelekezo (Directions)',
    callERDesk: 'Piga ER Desk',
    closeEmergency: 'Funga na uendelee na mazungumzo ya kawaida (Close)',
  },
};
