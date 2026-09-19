/**
 * AfyaConnect Clinical Safety & Emergency Detection
 * Identifies high-risk clinical red flags and routes directly to emergency triage.
 * Tuned for Kenyan conversational contexts (English, Kiswahili, Sheng).
 */

export interface EmergencyCheckResult {
  isEmergency: boolean;
  triageScore: number; // 1 to 5
  urgency: 'Routine' | 'Standard' | 'Urgent' | 'Emergency';
  redFlagReason?: string;
  recommendedAction: string;
  emergencyHotlines: { name: string; number: string; description: string }[];
}

export const EMERGENCY_KEYWORDS = [
  // Cardiac / Circulatory
  'chest pain',
  'heart attack',
  'crushing chest',
  'left arm pain',
  'maumivu ya kifua',
  'mshtuko wa moyo',
  'kifua kubana',
  'kifua kinabana',

  // Respiratory / Airway
  'cannot breathe',
  'shortness of breath',
  'struggling to breathe',
  'gasping for air',
  'choking',
  'kushindwa kupumua',
  'hawezi kupumua',
  'kupumua kwa shida',
  'pumu kali',

  // Neurological / Stroke / Seizures
  'unconscious',
  'fainted',
  'passed out',
  'stroke',
  'slurred speech',
  'facial drooping',
  'one sided weakness',
  'seizure',
  'convulsion',
  'fits',
  'amepoteza fahamu',
  'kuzirai',
  'kupooza',
  'kifafa',
  'degedege',
  'kuanguka ghafla',

  // Hemorrhage / Severe Trauma
  'bleeding heavily',
  'coughing blood',
  'vomiting blood',
  'blood in vomit',
  'severe bleeding',
  'profuse bleeding',
  'head injury',
  'stab wound',
  'gunshot',
  'damu nyingi',
  'kutapika damu',
  'kikohozi cha damu',
  'jeraha kubwa',
  'kuvuja damu mfululizo',

  // Allergic / Anaphylaxis
  'severe allergic reaction',
  'anaphylaxis',
  'throat closing',
  'swollen tongue',
  'uvimbe wa ghafla',
  'kushindwa kumeza na kupumua',

  // Pediatric Red Flags (< 3 months fever, lethargy)
  'infant fever',
  'neonate fever',
  'baby unresponsive',
  'mtoto mchanga ana homa kali',
  'mtoto haamki',
  'mtoto anakataa kunyonya kabisa',

  // Poisoning / Overdose
  'poison',
  'overdose',
  'sumu',
  'kunywa sumu',
];

export const URGENT_KEYWORDS = [
  'homa kali',
  'high fever',
  'severe pain',
  'maumivu makali',
  'severe vomiting',
  'kutapika sana',
  'severe diarrhea',
  'kuhara sana',
  'dehydration',
  'mtoto mchanga',
  'infant',
  'dizzy',
  'kizunguzungu',
  'burn',
  'kuungua',
  'fracture',
  'kuvunjika mfupa',
];

export const KENYA_EMERGENCY_HOTLINES = [
  { name: 'Kenya Red Cross Emergency Dispatch', number: '1199', description: 'Toll-free 24/7 nationwide ambulance & emergency rescue' },
  { name: 'National Emergency / Police & Ambulance', number: '999 / 112', description: 'National emergency central dispatch' },
  { name: 'Aga Khan Univ. Hospital Casualty & Trauma', number: '+254 20 366 2000', description: 'Level 6 24/7 Emergency Department (Parklands)' },
  { name: 'MP Shah Hospital Emergency Response', number: '+254 20 429 1000', description: 'Level 5 24/7 Emergency & Critical Care (Shivachi Rd)' },
  { name: 'Kenyatta National Hospital (KNH) Disaster Center', number: '+254 20 272 6300', description: 'National Referral Hospital Emergency Wing' },
];

/**
 * Evaluates patient symptoms against clinical safety guidelines and red flags.
 */
export function evaluateClinicalSafety(text: string): EmergencyCheckResult {
  const lower = text.toLowerCase();

  // 1. Immediate Life-Threatening Emergency (Level 5)
  for (const keyword of EMERGENCY_KEYWORDS) {
    if (lower.includes(keyword)) {
      return {
        isEmergency: true,
        triageScore: 5,
        urgency: 'Emergency',
        redFlagReason: `Alama kuu ya dharura iliyotambuliwa: "${keyword}"`,
        recommendedAction:
          '🚨 ONYO LA DHARURA (EMERGENCY RED FLAG): Dalili ulizoeleza zinaashiria hali ya dharura inayohitaji msaada wa haraka wa kimatibabu. Tafadhali elekea kituo cha dharura (Casualty) mara moja au piga nambari ya dharura 1199 (Red Cross) bila kuchelewa.',
        emergencyHotlines: KENYA_EMERGENCY_HOTLINES,
      };
    }
  }

  // 2. Urgent Attention Required (Level 4)
  for (const keyword of URGENT_KEYWORDS) {
    if (lower.includes(keyword)) {
      return {
        isEmergency: false,
        triageScore: 4,
        urgency: 'Urgent',
        redFlagReason: `Hali inayohitaji uangalizi wa haraka: "${keyword}"`,
        recommendedAction:
          'Dalili hizi zinahitaji uchunguzi wa haraka wa daktari leo au mapema kesho asubuhi. Mfumo unapendekeza vituo vyenye nafasi za haraka (Priority Consultation).',
        emergencyHotlines: KENYA_EMERGENCY_HOTLINES.slice(0, 2),
      };
    }
  }

  // 3. Moderate / Standard Care (Level 2 or 3)
  if (lower.includes('wiki') || lower.includes('week') || lower.includes('siku kadhaa') || lower.includes('days')) {
    return {
      isEmergency: false,
      triageScore: 3,
      urgency: 'Standard',
      recommendedAction: 'Dalili zinahitaji uchunguzi wa kawaida wa kliniki (Outpatient Consultation).',
      emergencyHotlines: KENYA_EMERGENCY_HOTLINES.slice(0, 1),
    };
  }

  // 4. Routine / Preventive Consultation (Level 1 or 2)
  return {
    isEmergency: false,
    triageScore: 2,
    urgency: 'Routine',
    recommendedAction: 'Uchunguzi wa kawaida unatosha (Routine outpatient consultation).',
    emergencyHotlines: KENYA_EMERGENCY_HOTLINES.slice(0, 1),
  };
}
