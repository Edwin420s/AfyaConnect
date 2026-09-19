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
