/**
 * AfyaConnect Care Navigation & Pathway Mapping
 * Analyzes conversational complaints and maps them to appropriate hospital departments
 * without claiming a definitive medical diagnosis.
 * Dynamically supports any natural language input in English, Kiswahili, or Sheng.
 */

export interface CarePathwayRecommendation {
  department: string;
  departmentCode: string;
  suggestedSpecialty: string;
  urgency: 'Routine' | 'Standard' | 'Urgent' | 'Emergency';
  triageScore: number;
  explanationSwahili: string;
  explanationEnglish: string;
}

export function determineCarePathway(text: string): CarePathwayRecommendation {
  const lower = text.toLowerCase();

  // 1. Pediatric & Child Health
  if (
    lower.includes('mtoto') ||
    lower.includes('child') ||
    lower.includes('children') ||
    lower.includes('baby') ||
    lower.includes('mwanangu') ||
    lower.includes('infant') ||
    lower.includes('toddler') ||
    lower.includes('chanjo') ||
    lower.includes('kid') ||
    lower.includes('kids') ||
    lower.includes('pediatric') ||
    lower.includes('immunization')
  ) {
    const isFever = lower.includes('homa') || lower.includes('fever') || lower.includes('joto') || lower.includes('temperature');
    return {
      department: 'Pediatrics & Child Health',
      departmentCode: 'PED',
      suggestedSpecialty: 'Pediatrician / Child Health Clinic',
      urgency: isFever ? 'Urgent' : 'Standard',
      triageScore: isFever ? 4 : 2,
      explanationSwahili: 'Huduma inayopendekezwa ni idara ya watoto (Pediatrics) kwa ajili ya uchunguzi maalum wa mtoto.',
      explanationEnglish: 'Recommended care pathway is Pediatrics & Child Health for dedicated pediatric evaluation.',
    };
  }

  // 2. Ear, Nose & Throat (ENT)
  if (
    lower.includes('masikio') ||
    lower.includes('ear') ||
    lower.includes('ears') ||
    lower.includes('hearing') ||
    lower.includes('koo') ||
    lower.includes('throat') ||
    lower.includes('tonsil') ||
    lower.includes('tonsils') ||
    lower.includes('pua') ||
    lower.includes('nose') ||
    lower.includes('sinus') ||
    lower.includes('tinnitus') ||
    lower.includes('mlio')
  ) {
    return {
      department: 'Ear, Nose & Throat (ENT)',
      departmentCode: 'ENT',
      suggestedSpecialty: 'ENT Specialist / Otorhinolaryngologist',
      urgency: 'Standard',
      triageScore: 3,
      explanationSwahili: 'Idara ya masikio, pua na koo (ENT) inashauriwa kwa uchunguzi wa mlio, koo au masikio.',
      explanationEnglish: 'Ear, Nose & Throat (ENT) department is recommended for hearing, throat, or sinus symptoms.',
    };
  }

  // 3. Dental & Oral Health
  if (
    lower.includes('meno') ||
    lower.includes('jino') ||
    lower.includes('tooth') ||
    lower.includes('teeth') ||
    lower.includes('dental') ||
    lower.includes('dentist') ||
    lower.includes('gums') ||
    lower.includes('fisi') ||
    lower.includes('toothache')
  ) {
    return {
      department: 'Dental Surgery & Oral Health',
      departmentCode: 'DENT',
      suggestedSpecialty: 'Dental Surgeon / Dentist',
      urgency: 'Standard',
      triageScore: 2,
      explanationSwahili: 'Huduma ya afya ya kinywa na meno (Dental clinic) inashauriwa kwa maumivu ya jino au afya ya kinywa.',
      explanationEnglish: 'Dental clinic evaluation is recommended for toothache or oral health concerns.',
    };
  }

  // 4. Dermatology (Skin)
  if (
    lower.includes('ngozi') ||
    lower.includes('skin') ||
    lower.includes('rash') ||
    lower.includes('itching') ||
    lower.includes('vipele') ||
    lower.includes('upele') ||
    lower.includes('eczema') ||
    lower.includes('acne') ||
    lower.includes('allergy') ||
    lower.includes('allergic')
  ) {
    return {
      department: 'Dermatology',
      departmentCode: 'DERM',
      suggestedSpecialty: 'Consultant Dermatologist',
      urgency: 'Standard',
      triageScore: 2,
      explanationSwahili: 'Uchunguzi wa ngozi (Dermatology) unashauriwa kubaini chanzo cha upele au kuwashwa.',
      explanationEnglish: 'Dermatology consultation is recommended for skin rash, itching, or cutaneous concerns.',
    };
  }

  // 5. Orthopedics & Musculoskeletal (Bones, Joints, Sprains, Back, Swelling)
  if (
    lower.includes('ankle') ||
    lower.includes('knee') ||
    lower.includes('joint') ||
    lower.includes('bone') ||
    lower.includes('fracture') ||
    lower.includes('sprain') ||
    lower.includes('twist') ||
    lower.includes('swollen') ||
    lower.includes('swelling') ||
    lower.includes('leg') ||
    lower.includes('arm') ||
    lower.includes('shoulder') ||
    lower.includes('back') ||
    lower.includes('spine') ||
    lower.includes('mgongo') ||
    lower.includes('kiuno') ||
    lower.includes('mfupa') ||
    lower.includes('goti') ||
    lower.includes('mguu') ||
    lower.includes('arthritis') ||
    lower.includes('limp')
  ) {
    const isSevere = lower.includes('fracture') || lower.includes('cannot walk') || lower.includes('broken') || lower.includes('vunjika');
    return {
      department: 'Orthopedics & Musculoskeletal',
      departmentCode: 'ORTHO',
      suggestedSpecialty: 'Orthopedic Surgeon / Musculoskeletal Specialist',
      urgency: isSevere ? 'Urgent' : 'Standard',
      triageScore: isSevere ? 4 : 3,
      explanationSwahili: 'Huduma ya mifupa na maungo (Orthopedics) inapendekezwa kwa uchunguzi wa maumivu au majeraha ya viungo.',
      explanationEnglish: 'Orthopedic & Musculoskeletal consultation is recommended for joint, bone, sprain, or back concerns.',
    };
  }

  // 6. Ophthalmology / Eye Care
  if (
    lower.includes('eye') ||
    lower.includes('eyes') ||
    lower.includes('vision') ||
    lower.includes('sight') ||
    lower.includes('blurry') ||
    lower.includes('cataract') ||
    lower.includes('redness') ||
    lower.includes('jicho') ||
    lower.includes('macho') ||
    lower.includes('kuona') ||
    lower.includes('optic')
  ) {
    return {
      department: 'Ophthalmology (Eye Care)',
      departmentCode: 'EYE',
      suggestedSpecialty: 'Consultant Ophthalmologist / Optometrist',
      urgency: 'Standard',
      triageScore: 2,
      explanationSwahili: 'Uchunguzi wa macho (Ophthalmology) unashauriwa kwa matatizo ya uoni au maumivu ya macho.',
      explanationEnglish: 'Ophthalmology / Eye clinic consultation is recommended for vision or eye discomfort.',
    };
  }

  // 7. Cardiology & Cardiovascular
  if (
    lower.includes('heart') ||
    lower.includes('chest') ||
    lower.includes('palpitation') ||
    lower.includes('palpitations') ||
    lower.includes('blood pressure') ||
    lower.includes('bp') ||
    lower.includes('hypertension') ||
    lower.includes('cholesterol') ||
    lower.includes('moyo') ||
    lower.includes('kifua') ||
    lower.includes('presha')
  ) {
    const isChestHeavy = lower.includes('heavy') || lower.includes('tight') || lower.includes('tightness') || lower.includes('pressure');
    return {
      department: 'Cardiology & Cardiovascular',
      departmentCode: 'CARD',
      suggestedSpecialty: 'Consultant Cardiologist',
      urgency: isChestHeavy ? 'Urgent' : 'Standard',
      triageScore: isChestHeavy ? 4 : 3,
      explanationSwahili: 'Uchunguzi wa moyo na shinikizo la damu (Cardiology) unashauriwa.',
      explanationEnglish: 'Cardiovascular evaluation is recommended for blood pressure, cardiac, or chest symptoms.',
    };
  }

  // 8. Respiratory & Pulmonology
  if (
    lower.includes('cough') ||
    lower.includes('coughing') ||
    lower.includes('cold') ||
    lower.includes('flu') ||
    lower.includes('asthma') ||
    lower.includes('wheezing') ||
    lower.includes('congestion') ||
    lower.includes('phlegm') ||
    lower.includes('kikohozi') ||
    lower.includes('mafua') ||
    lower.includes('pumu') ||
    lower.includes('breath')
  ) {
    return {
      department: 'Pulmonology & Respiratory',
      departmentCode: 'RESP',
      suggestedSpecialty: 'Pulmonologist / Chest Physician',
      urgency: 'Standard',
      triageScore: 3,
      explanationSwahili: 'Huduma ya mfumo wa upumuaji (Respiratory Clinic) inashauriwa kwa kikohozi au mafua.',
      explanationEnglish: 'Respiratory / Pulmonology review is recommended for cough, flu, or airway symptoms.',
    };
  }

  // 9. Gastroenterology & Abdominal
  if (
    lower.includes('stomach') ||
    lower.includes('tumbo') ||
    lower.includes('nausea') ||
    lower.includes('vomit') ||
    lower.includes('vomiting') ||
    lower.includes('diarrhea') ||
    lower.includes('acid') ||
    lower.includes('heartburn') ||
    lower.includes('ulcer') ||
    lower.includes('ulcers') ||
    lower.includes('indigestion') ||
    lower.includes('cramps') ||
    lower.includes('belly') ||
    lower.includes('constipation') ||
    lower.includes('kuendesha') ||
    lower.includes('kutapika')
  ) {
    return {
      department: 'Gastroenterology & Internal Medicine',
      departmentCode: 'GASTRO',
      suggestedSpecialty: 'Gastroenterologist / Internal Medicine Physician',
      urgency: 'Standard',
      triageScore: 3,
      explanationSwahili: 'Uchunguzi wa tumbo na mfumo wa chakula (Gastroenterology) unashauriwa.',
      explanationEnglish: 'Gastroenterology & Internal Medicine consultation is recommended for abdominal or digestive symptoms.',
    };
  }

  // 10. Maternity & Reproductive Health (Linda Mama)
  if (
    lower.includes('ujauzito') ||
    lower.includes('maternity') ||
    lower.includes('mimba') ||
    lower.includes('pregnant') ||
    lower.includes('pregnancy') ||
    lower.includes('uzazi') ||
    lower.includes('antenatal') ||
    lower.includes('anc') ||
    lower.includes('gynecology') ||
    lower.includes('gynae') ||
    lower.includes('period') ||
    lower.includes('cramp')
  ) {
    return {
      department: 'Maternity & Reproductive Health (Linda Mama)',
      departmentCode: 'MAT',
      suggestedSpecialty: 'Obstetrician / Midwife Clinic',
      urgency: 'Standard',
      triageScore: 2,
      explanationSwahili: 'Huduma za uzazi na wajawazito (ANC / Linda Mama) zinashauriwa, zikipatikana pia bila malipo serikalini.',
      explanationEnglish: 'Maternal health services (ANC / Linda Mama) are recommended for prenatal or reproductive care.',
    };
  }

  // 11. Mental Health & Wellness
  if (
    lower.includes('stress') ||
    lower.includes('anxiety') ||
    lower.includes('depressed') ||
    lower.includes('depression') ||
    lower.includes('insomnia') ||
    lower.includes('panic') ||
    lower.includes('mental') ||
    lower.includes('counseling') ||
    lower.includes('therapy') ||
    lower.includes('huzuni') ||
    lower.includes('msongo') ||
    lower.includes('usingizi')
  ) {
    return {
      department: 'Mental Health & Wellness',
      departmentCode: 'MNT',
      suggestedSpecialty: 'Clinical Psychologist / Counselor',
      urgency: 'Standard',
      triageScore: 2,
      explanationSwahili: 'Huduma ya ushauri nasaha na afya ya akili (Mental Wellness) inashauriwa kwa usaidizi wa kitaalamu.',
      explanationEnglish: 'Mental Health & Wellness counseling is recommended for professional psychological support.',
    };
  }

  // 12. General Consultation & Outpatient (Catch-all for any user input)
  const isAcute =
    lower.includes('homa') ||
    lower.includes('fever') ||
    lower.includes('severe') ||
    lower.includes('dizzy') ||
    lower.includes('kizunguzungu') ||
    lower.includes('pain') ||
    lower.includes('hurt') ||
    lower.includes('sick') ||
    lower.includes('weak') ||
    lower.includes('fatigue');

  return {
    department: 'General Consultation (OPD)',
    departmentCode: 'OPD',
    suggestedSpecialty: 'General Practitioner (GP) / Medical Officer',
    urgency: isAcute ? 'Urgent' : 'Standard',
    triageScore: isAcute ? 3 : 2,
    explanationSwahili: 'Uchunguzi wa jumla (General Consultation) na daktari wa zamu unapendekezwa kuchunguza dalili zako kwa makini.',
    explanationEnglish: 'General outpatient consultation with the duty medical officer is recommended to evaluate your health concern.',
  };
}

export interface SpecialistInfo {
  specialist: string;
  doctorName: string;
  department: string;
  facilityId: string;
}

export const SPECIALIST_ROSTER: Record<string, SpecialistInfo> = {
  PED: {
    specialist: 'Pediatrician / Child Health Clinic',
    doctorName: 'Dr. Achieng',
    department: 'Pediatrics & Child Health',
    facilityId: 'f-agakhan',
  },
  ENT: {
    specialist: 'ENT Specialist / Otorhinolaryngologist',
    doctorName: 'Dr. Achieng',
    department: 'Ear, Nose & Throat (ENT)',
    facilityId: 'f-agakhan',
  },
  DERM: {
    specialist: 'Consultant Dermatologist',
    doctorName: 'Dr. Mwangi',
    department: 'Dermatology',
    facilityId: 'f-mpshah',
  },
  DENT: {
    specialist: 'Dental Surgeon / Dentist',
    doctorName: 'Dr. Kibet',
    department: 'Dental Surgery & Oral Health',
    facilityId: 'f-avenue',
  },
  EYE: {
    specialist: 'Consultant Ophthalmologist',
    doctorName: 'Dr. Omondi',
    department: 'Ophthalmology (Eye Care)',
    facilityId: 'f-agakhan',
  },
  ORTHO: {
    specialist: 'Orthopedic Surgeon',
    doctorName: 'Dr. Wanjiku Kamau',
    department: 'Orthopedics & Musculoskeletal',
    facilityId: 'f-agakhan',
  },
  MAT: {
    specialist: 'Obstetrician / Linda Mama Clinic',
    doctorName: 'Dr. Wanjiku Kamau',
    department: 'Maternity & Reproductive Health (Linda Mama)',
    facilityId: 'f-westlands',
  },
  GASTRO: {
    specialist: 'Gastroenterologist & Internal Medicine',
    doctorName: 'Dr. Wanjiku Kamau',
    department: 'Gastroenterology & Internal Medicine',
    facilityId: 'f-agakhan',
  },
  CARD: {
    specialist: 'Consultant Cardiologist',
    doctorName: 'Dr. Wanjiku Kamau',
    department: 'Cardiology & Cardiovascular',
    facilityId: 'f-agakhan',
  },
  RESP: {
    specialist: 'Pulmonologist & Chest Physician',
    doctorName: 'Dr. Achieng',
    department: 'Pulmonology & Respiratory',
    facilityId: 'f-agakhan',
  },
  MNT: {
    specialist: 'Clinical Psychologist / Counselor',
    doctorName: 'Dr. Omondi',
    department: 'Mental Health & Wellness',
    facilityId: 'f-agakhan',
  },
  OPD: {
    specialist: 'General Practitioner / Medical Officer',
    doctorName: 'Dr. Wanjiku Kamau',
    department: 'General Consultation (OPD)',
    facilityId: 'f-agakhan',
  },
};

export interface ClinicalIntakeAnalysis {
  needsClarification: boolean;
  clarificationMessage: string;
  clarificationOptions: string[];
  pathway: CarePathwayRecommendation;
  specialist: SpecialistInfo;
}

export function analyzeClinicalIntake(
  patientMessage: string,
  history: Array<{ sender: string; text: string }> = [],
  languagePreference: 'swa_eng' | 'swa' | 'eng' = 'swa_eng'
): ClinicalIntakeAnalysis {
  const patientTurns = history
    .filter(h => (h.sender === 'patient' || h.sender === 'user') && h.text && h.text.trim())
    .map(h => h.text.trim());
  const allPatientText = [...patientTurns, patientMessage.trim()].join(' ').toLowerCase();
  const currText = patientMessage.trim().toLowerCase();
  const words = currText.split(/\s+/).filter(Boolean);

  // 1. Pure Greetings
  const greetings = [
    'hi', 'hello', 'habari', 'sasa', 'mambo', 'niaje', 'hey', 'jambo',
    'good morning', 'good afternoon', 'good evening', 'how are you', 'hujambo',
    'salama', 'oya', 'vipi', 'morning', 'afternoon'
  ];
  const isGreeting = greetings.includes(currText) || (words.length <= 2 && greetings.some(g => currText === g));

  // 2. Vague 1-3 word queries without clinical context
  const vaguePhrases = [
    'homa', 'fever', 'pain', 'maumivu', 'kichwa', 'headache', 'sick', 'ill',
    'mgonjwa', 'daktari', 'doctor', 'nisaidie', 'help', 'need a doctor',
    'nahitaji daktari', 'nataka daktari', 'tumbo', 'stomach', 'kuumwa',
    'hospitali', 'clinic', 'treatment', 'matibabu'
  ];
  const isVagueShort = words.length <= 3 && vaguePhrases.some(
    vp => currText === vp || currText.startsWith(vp + ' ') || currText.endsWith(' ' + vp)
  );

  // 3. Clinical details present in combined history
  const durationKeywords = [
    'day', 'days', 'siku', 'hour', 'hours', 'masaa', 'week', 'weeks', 'wiki',
    'since', 'tangu', 'yesterday', 'jana', 'leo', 'today', 'night', 'usiku',
    'asubuhi', 'morning', 'month', 'miezi', 'ongoing', 'kwa siku', 'tangu jana',
    'for two', 'for 2', 'for 3', 'for a week'
  ];
  const hasDuration = durationKeywords.some(w => allPatientText.includes(w));

  const specialtyKeywords = [
    'mtoto', 'child', 'children', 'baby', 'infant', 'toddler', 'mwanangu', 'kid', 'kids', 'pediatric',
    'meno', 'jino', 'tooth', 'teeth', 'dental', 'dentist', 'gums', 'toothache',
    'ngozi', 'skin', 'rash', 'vipele', 'upele', 'eczema', 'acne', 'itching', 'kuwasha',
    'macho', 'jicho', 'eye', 'eyes', 'vision', 'blurry', 'cataract', 'redness', 'kuona',
    'ankle', 'knee', 'joint', 'bone', 'fracture', 'sprain', 'twist', 'goti', 'mguu', 'mgongo', 'kiuno', 'mfupa',
    'masikio', 'ear', 'ears', 'hearing', 'koo', 'throat', 'tonsil', 'tonsils', 'pua', 'sinus',
    'mimba', 'ujauzito', 'pregnant', 'pregnancy', 'uzazi', 'linda mama', 'antenatal'
  ];
  const hasSpecificSpecialty = specialtyKeywords.some(w => allPatientText.includes(w));

  const symptomKeywords = [
    'tumbo', 'stomach', 'fever', 'homa', 'migraine', 'dizziness', 'vomiting', 'cough',
    'breath', 'pain', 'swollen', 'injured', 'headache', 'kichwa'
  ];
  const hasDetailedExplanation = words.length >= 6 && (hasDuration || symptomKeywords.some(s => currText.includes(s)));

  let needsClarification = false;
  if (isGreeting || (isVagueShort && !hasDuration && !hasSpecificSpecialty)) {
    needsClarification = true;
  } else if (hasSpecificSpecialty || hasDetailedExplanation || (hasDuration && words.length >= 4)) {
    needsClarification = false;
  } else if (patientTurns.length >= 1 && (hasDuration || hasSpecificSpecialty || words.length >= 3)) {
    needsClarification = false;
  } else {
    needsClarification = true;
  }

  let clarificationMessage = '';
  let clarificationOptions: string[] = [];

  if (needsClarification) {
    let symptomFocus: 'headache' | 'stomach' | 'fever' | 'skin' | null = null;
    if (currText.includes('kichwa') || currText.includes('headache') || currText.includes('migraine')) {
      symptomFocus = 'headache';
    } else if (currText.includes('tumbo') || currText.includes('stomach')) {
      symptomFocus = 'stomach';
    } else if (currText.includes('homa') || currText.includes('fever')) {
      symptomFocus = 'fever';
    } else if (currText.includes('ngozi') || currText.includes('skin')) {
      symptomFocus = 'skin';
    }

    if (languagePreference === 'eng') {
      if (symptomFocus === 'headache') {
        clarificationMessage =
          'I understand you are experiencing a headache. To connect you with the right specialist and check doctor availability:\n' +
          '1. How long has the headache lasted, and is it mild, moderate, or severe?\n' +
          '2. Are you experiencing any other symptoms like fever, dizziness, or nausea?\n' +
          '3. Is this consultation for yourself (adult) or a child?';
      } else if (symptomFocus === 'stomach') {
        clarificationMessage =
          'I understand you are experiencing stomach discomfort. To connect you with the right specialist:\n' +
          '1. How long have you had this stomach pain (e.g. today, 2 days)?\n' +
          '2. Are you experiencing any nausea, vomiting, fever, or diarrhea?\n' +
          '3. Is this consultation for an adult or a child?';
      } else if (symptomFocus === 'fever') {
        clarificationMessage =
          'I understand you have a fever. To help evaluate your condition:\n' +
          '1. How high is the fever, and how long has it lasted?\n' +
          '2. Is this consultation for an adult or a child?\n' +
          '3. Are there any other symptoms like chills, body weakness, or rash?';
      } else {
        clarificationMessage =
          'Hello! Welcome to AfyaConnect. To help you connect with the right specialist (such as Pediatrics for children, ENT for ear/throat, Dermatology for skin, Dental for teeth, or Internal Medicine) and check real doctor availability, could you please tell me:\n' +
          '1. What specific symptoms are you experiencing, and in which part of your body?\n' +
          '2. How long have you had them (e.g. today, 2 days, a week)?\n' +
          '3. Is this consultation for an adult or a child?';
      }
      clarificationOptions = [
        "👶 It's for a child (Fever / Cough)",
        '🩺 Severe stomach pain (2 days)',
        '🦷 Toothache / Dental issue',
        '👁 Eye redness or blurry vision',
        '🩹 Skin rash or itching',
        '🦴 Joint, knee or back pain',
      ];
    } else if (languagePreference === 'swa') {
      if (symptomFocus === 'headache') {
        clarificationMessage =
          'Pole sana kwa maumivu ya kichwa. Ili kukuunganisha na daktari sahihi na kuangalia nafasi:\n' +
          '1. Maumivu haya yameanza lini, na ni ya kawaida au makali sana?\n' +
          '2. Je, una dalili zingine kama homa, kizunguzungu, au kichefuchefu?\n' +
          '3. Je, mashauriano haya ni ya mtu mzima au mtoto?';
      } else if (symptomFocus === 'stomach') {
        clarificationMessage =
          'Pole sana kwa maumivu ya tumbo. Ili kupata daktari sahihi anayefaa:\n' +
          '1. Maumivu haya ya tumbo yameanza lini (kwa mfano leo, siku 2)?\n' +
          '2. Je, unahisi kichefuchefu, kutapika, homa au kuendesha?\n' +
          '3. Je, ni yako au ya mtoto?';
      } else if (symptomFocus === 'fever') {
        clarificationMessage =
          'Pole sana kwa homa. Ili kusaidia kutathmini hali yako:\n' +
          '1. Homa hii imeanza lini, na ni kali kiasi gani?\n' +
          '2. Je, mashauriano haya ni ya mtu mzima au mtoto?\n' +
          '3. Je, una dalili zingine kama kutetemeka, kuishiwa nguvu, au upele?';
      } else {
        clarificationMessage =
          'Jambo! Karibu AfyaConnect. Ili kukuunganisha na daktari bingwa anayefaa (kama vile Daktari wa Watoto, Masikio na Koo, Ngozi, Meno, au Uchunguzi wa Jumla) na kuangalia nafasi za miadi:\n' +
          '1. Je, unapata dalili zipi hasa, na katika sehemu gani ya mwili?\n' +
          '2. Zimeanza lini (kwa mfano leo, siku 2, au wiki)?\n' +
          '3. Je, mashauriano haya ni ya mtu mzima au mtoto?';
      }
      clarificationOptions = [
        '👶 Ni ya mtoto (Homa / Kikohozi)',
        '🩺 Maumivu ya tumbo (Siku 2)',
        '🦷 Maumivu ya jino / Meno',
        '👁 Macho mekundu / Uoni hafifu',
        '🩹 Upele au kuwashwa ngozi',
        '🦴 Maumivu ya viungo au mgongo',
      ];
    } else {
      // Sheng / Code-switch
      if (symptomFocus === 'headache') {
        clarificationMessage =
          'Pole sana kwa hiyo headache. Before tuchague daktari na slot:\n' +
          '1. Imeanza lini (duration) na ni kali aje?\n' +
          '2. Kuna dalili zingine kama fever, kizunguzungu ama nausea?\n' +
          '3. Consultation ni ya mtu mzima ama mtoi/child?';
      } else if (symptomFocus === 'stomach') {
        clarificationMessage =
          'Pole sana kwa maumivu ya tumbo. Before tu-book slot:\n' +
          '1. Tumbo imeanza kuuma lini (e.g. leo, 2 days)?\n' +
          '2. Kuna kutapika, diarrhea, au homa?\n' +
          '3. Ni ya mtu mzima ama mtoto?';
      } else if (symptomFocus === 'fever') {
        clarificationMessage =
          'Pole sana kwa hiyo homa. Before tu-route kwa doctor:\n' +
          '1. Homa imeanza lini na ni kali aje?\n' +
          '2. Ni ya mtu mzima ama mtoi/child?\n' +
          '3. Kuna baridi kali, kuishiwa nguvu ama vipele?';
      } else {
        clarificationMessage =
          'Niaje! Welcome to AfyaConnect. To help you connect na specialist anayefaa (kama Daktari wa Watoto, ENT, Ngozi, Meno, ama General OPD):\n' +
          '1. Ni dalili gani haswa unahisi na ziko sehemu gani ya mwili?\n' +
          '2. Zimeanza lini (duration - leo, siku 2, ama wiki)?\n' +
          '3. Consultation ni ya mtu mzima ama mtoi/child?';
      }
      clarificationOptions = [
        '👶 Ni ya mtoi (Homa kali)',
        '🩺 Maumivu ya tumbo for 2 days',
        '🦷 Jino linaniuma sana',
        '👁 Macho mekundu / Blurry vision',
        '🩹 Vipele na allergy kwa ngozi',
        '🦴 Nimeumia goti / Mgongo unauma',
      ];
    }
  }

  const pathway = determineCarePathway(allPatientText);
  const specialist = SPECIALIST_ROSTER[pathway.departmentCode] || SPECIALIST_ROSTER['OPD'];

  return {
    needsClarification,
    clarificationMessage,
    clarificationOptions,
    pathway,
    specialist,
  };
}
