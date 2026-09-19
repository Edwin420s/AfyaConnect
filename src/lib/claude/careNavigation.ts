/**
 * AfyaConnect Care Navigation & Pathway Mapping
 * Analyzes conversational complaints and maps them to appropriate hospital departments
 * without claiming a definitive medical diagnosis.
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
    lower.includes('baby') ||
    lower.includes('mwanangu') ||
    lower.includes('infant') ||
    lower.includes('toddler') ||
    lower.includes('chanjo') ||
    lower.includes('immunization')
  ) {
    const isFever = lower.includes('homa') || lower.includes('fever') || lower.includes('joto');
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
    lower.includes('hearing') ||
    lower.includes('koo') ||
    lower.includes('throat') ||
    lower.includes('tonsil') ||
    lower.includes('pua') ||
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
    lower.includes('gums') ||
    lower.includes('fisi')
  ) {
    return {
      department: 'Dental Surgery & Oral Health',
      departmentCode: 'DENT',
      suggestedSpecialty: 'Dental Surgeon / Dentist',
      urgency: 'Standard',
      triageScore: 2,
      explanationSwahili: 'Huduma ya afya ya kinywa na meno (Dental clinic) inashauriwa kwa maumivu ya jino.',
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
    lower.includes('eczema')
  ) {
    return {
      department: 'Dermatology',
      departmentCode: 'DERM',
      suggestedSpecialty: 'Consultant Dermatologist',
      urgency: 'Standard',
      triageScore: 2,
      explanationSwahili: 'Uchunguzi wa ngozi (Dermatology) unashauriwa kubaini chanzo cha upele au kuwashwa.',
      explanationEnglish: 'Dermatology consultation is recommended for skin rash or irritation.',
    };
  }

  // 5. Maternal / Reproductive / Linda Mama
  if (
    lower.includes('ujauzito') ||
    lower.includes('maternity') ||
    lower.includes('mimba') ||
    lower.includes('pregnant') ||
    lower.includes('pregnancy') ||
    lower.includes('antenatal') ||
    lower.includes('anc') ||
    lower.includes('uzazi')
  ) {
    return {
      department: 'Maternity & Reproductive Health (Linda Mama)',
      departmentCode: 'MAT',
      suggestedSpecialty: 'Obstetrician / Midwife Clinic',
      urgency: 'Standard',
      triageScore: 2,
      explanationSwahili: 'Huduma za uzazi na wajawazito (ANC / Linda Mama) zinashauriwa, zikipatikana pia bila malipo serikalini.',
      explanationEnglish: 'Maternal health services (ANC / Linda Mama) are recommended for prenatal care.',
    };
  }

  // 6. Ophthalmology / Eye Care
  if (
    lower.includes('macho') ||
    lower.includes('eye') ||
    lower.includes('vision') ||
    lower.includes('kuona') ||
    lower.includes('kutoona vizuri') ||
    lower.includes('blurred')
  ) {
    return {
      department: 'Ophthalmology & Eye Care',
      departmentCode: 'EYE',
      suggestedSpecialty: 'Ophthalmologist / Optometrist',
      urgency: 'Standard',
      triageScore: 3,
      explanationSwahili: 'Idara ya macho (Eye Clinic) inashauriwa kwa ukaguzi wa uoni na maumivu ya macho.',
      explanationEnglish: 'Ophthalmology clinic is recommended for vision or eye discomfort evaluation.',
    };
  }

  // 7. Orthopedics & Musculoskeletal
  if (
    lower.includes('mfupa') ||
    lower.includes('bone') ||
    lower.includes('joint') ||
    lower.includes('goti') ||
    lower.includes('knee') ||
    lower.includes('mgongo') ||
    lower.includes('back pain') ||
    lower.includes('sprain') ||
    lower.includes('tegu')
  ) {
    return {
      department: 'Orthopedics & Joint Care',
      departmentCode: 'ORTHO',
      suggestedSpecialty: 'Orthopedic Surgeon / Physiotherapist',
      urgency: 'Standard',
      triageScore: 3,
      explanationSwahili: 'Idara ya mifupa na viungo (Orthopedics) inapendekezwa kwa uchunguzi wa maumivu ya viungo au mgongo.',
      explanationEnglish: 'Orthopedics consultation is recommended for joint or back pain assessment.',
    };
  }

  // 8. Cardiology / Blood Pressure
  if (
    lower.includes('blood pressure') ||
    lower.includes('shinikizo') ||
    lower.includes('hypertension') ||
    lower.includes('palpitations') ||
    lower.includes('mapigo ya moyo')
  ) {
    return {
      department: 'Cardiology & Cardiovascular Care',
      departmentCode: 'CARD',
      suggestedSpecialty: 'Cardiologist / Physician',
      urgency: 'Standard',
      triageScore: 3,
      explanationSwahili: 'Idara ya magonjwa ya moyo na shinikizo la damu (Cardiology) inashauriwa.',
      explanationEnglish: 'Cardiology consultation recommended for cardiovascular evaluation and blood pressure check.',
    };
  }

  // 9. Mental Health & Counseling
  if (
    lower.includes('msongo') ||
    lower.includes('stress') ||
    lower.includes('depression') ||
    lower.includes('wasiwasi') ||
    lower.includes('anxiety') ||
    lower.includes('usingizi') ||
    lower.includes('insomnia')
  ) {
    return {
      department: 'Mental Health & Psychological Counseling',
      departmentCode: 'PSYCH',
      suggestedSpecialty: 'Clinical Psychologist / Psychiatrist',
      urgency: 'Standard',
      triageScore: 2,
      explanationSwahili: 'Huduma ya ushauri nasaha na afya ya akili (Psychology / Counseling) inapatikana kwa usiri kamili.',
      explanationEnglish: 'Mental health and psychological counseling is available with strict confidentiality.',
    };
  }

  // 10. General Internal Medicine (Default / Common)
  const isAcute =
    lower.includes('homa') ||
    lower.includes('fever') ||
    lower.includes('maumivu makali') ||
    lower.includes('severe') ||
    lower.includes('dizzy') ||
    lower.includes('kizunguzungu');

  return {
    department: 'General Internal Medicine / OPD',
    departmentCode: 'OPD',
    suggestedSpecialty: 'General Practitioner (GP) / Medical Officer',
    urgency: isAcute ? 'Urgent' : 'Standard',
    triageScore: isAcute ? 4 : 2,
    explanationSwahili: 'Uchunguzi wa jumla (General Consultation) na daktari wa zamu unapendekezwa.',
    explanationEnglish: 'General outpatient consultation with the duty medical officer is recommended.',
  };
}
