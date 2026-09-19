from typing import Dict, Any


def determine_care_pathway(text: str) -> Dict[str, Any]:
    """
    Analyzes patient complaints and dynamically maps them to appropriate hospital departments
    without claiming a definitive medical diagnosis.
    Handles any natural language input in English, Kiswahili, or Sheng code-switching.
    """
    lower = text.lower()

    # 1. Pediatrics & Child Health
    if any(w in lower for w in ["mtoto", "child", "children", "baby", "infant", "toddler", "chanjo", "mwanangu", "kid", "kids", "pediatric"]):
        is_fever = any(w in lower for w in ["homa", "fever", "joto", "temperature", "convulsion", "anorexia"])
        return {
            "department": "Pediatrics & Child Health",
            "departmentCode": "PED",
            "suggestedSpecialty": "Pediatrician / Child Health Clinic",
            "urgency": "URGENT" if is_fever else "STANDARD",
            "triageScore": 4 if is_fever else 2,
            "explanationSwahili": "Huduma inayopendekezwa ni idara ya watoto (Pediatrics) kwa ajili ya uchunguzi maalum wa mtoto.",
            "explanationEnglish": "Recommended care pathway is Pediatrics & Child Health for dedicated pediatric evaluation.",
        }

    # 2. Ear, Nose & Throat (ENT)
    if any(w in lower for w in ["masikio", "ear", "ears", "hearing", "koo", "throat", "tonsil", "tonsils", "pua", "nose", "sinus", "sinuses", "mlio", "tinnitus", "hoarse"]):
        return {
            "department": "Ear, Nose & Throat (ENT)",
            "departmentCode": "ENT",
            "suggestedSpecialty": "ENT Specialist / Otorhinolaryngologist",
            "urgency": "STANDARD",
            "triageScore": 3,
            "explanationSwahili": "Idara ya masikio, pua na koo (ENT) inashauriwa kwa uchunguzi wa mlio, koo au masikio.",
            "explanationEnglish": "Ear, Nose & Throat (ENT) department is recommended for hearing, throat, or sinus symptoms.",
        }

    # 3. Dental & Oral Health
    if any(w in lower for w in ["meno", "jino", "tooth", "teeth", "dental", "dentist", "gums", "toothache", "fisi", "cavity"]):
        return {
            "department": "Dental Surgery & Oral Health",
            "departmentCode": "DENT",
            "suggestedSpecialty": "Dental Surgeon / Dentist",
            "urgency": "STANDARD",
            "triageScore": 2,
            "explanationSwahili": "Huduma ya afya ya kinywa na meno (Dental clinic) inashauriwa kwa maumivu ya jino au afya ya kinywa.",
            "explanationEnglish": "Dental clinic evaluation is recommended for toothache or oral health concerns.",
        }

    # 4. Dermatology (Skin)
    if any(w in lower for w in ["ngozi", "skin", "rash", "itching", "vipele", "upele", "eczema", "acne", "spots", "allergy", "allergic", "lesion"]):
        return {
            "department": "Dermatology",
            "departmentCode": "DERM",
            "suggestedSpecialty": "Consultant Dermatologist",
            "urgency": "STANDARD",
            "triageScore": 2,
            "explanationSwahili": "Uchunguzi wa ngozi (Dermatology) unashauriwa kubaini chanzo cha upele au kuwashwa.",
            "explanationEnglish": "Dermatology consultation is recommended for skin rash, itching, or cutaneous concerns.",
        }

    # 5. Orthopedics & Musculoskeletal (Bones, Joints, Sprains, Back)
    if any(w in lower for w in [
        "ankle", "knee", "joint", "joints", "bone", "bones", "fracture", "sprain", "twist",
        "swollen", "swelling", "leg", "arm", "shoulder", "back", "spine", "mgongo", "kiuno",
        "mfupa", "goti", "mguu", "arthritis", "walk", "walking", "limp", "fall", "injury"
    ]):
        is_severe = any(w in lower for w in ["fracture", "cannot walk", "broken", "vunjika", "severe", "deformity"])
        return {
            "department": "Orthopedics & Musculoskeletal",
            "departmentCode": "ORTHO",
            "suggestedSpecialty": "Orthopedic Surgeon / Musculoskeletal Specialist",
            "urgency": "URGENT" if is_severe else "STANDARD",
            "triageScore": 4 if is_severe else 3,
            "explanationSwahili": "Huduma ya mifupa na maungo (Orthopedics) inapendekezwa kwa uchunguzi wa maumivu au majeraha ya viungo.",
            "explanationEnglish": "Orthopedic & Musculoskeletal consultation is recommended for joint, bone, sprain, or back concerns.",
        }

    # 6. Ophthalmology / Eye Care
    if any(w in lower for w in ["eye", "eyes", "vision", "sight", "blurry", "cataract", "redness", "jicho", "macho", "kuona", "glasses", "optic"]):
        return {
            "department": "Ophthalmology (Eye Care)",
            "departmentCode": "EYE",
            "suggestedSpecialty": "Consultant Ophthalmologist / Optometrist",
            "urgency": "STANDARD",
            "triageScore": 2,
            "explanationSwahili": "Uchunguzi wa macho (Ophthalmology) unashauriwa kwa matatizo ya uoni au maumivu ya macho.",
            "explanationEnglish": "Ophthalmology / Eye clinic consultation is recommended for vision or eye discomfort.",
        }

    # 7. Cardiology & Cardiovascular
    if any(w in lower for w in [
        "heart", "chest", "palpitation", "palpitations", "blood pressure", "bp", "hypertension",
        "cholesterol", "moyo", "kifua", "presha"
    ]):
        is_chest_heavy = any(w in lower for w in ["heavy", "tight", "tightness", "pressure", "breath", "hema"])
        return {
            "department": "Cardiology & Cardiovascular",
            "departmentCode": "CARD",
            "suggestedSpecialty": "Consultant Cardiologist",
            "urgency": "URGENT" if is_chest_heavy else "STANDARD",
            "triageScore": 4 if is_chest_heavy else 3,
            "explanationSwahili": "Uchunguzi wa moyo na shinikizo la damu (Cardiology) unashauriwa.",
            "explanationEnglish": "Cardiovascular evaluation is recommended for blood pressure, cardiac, or chest symptoms.",
        }

    # 8. Respiratory & Pulmonology
    if any(w in lower for w in [
        "cough", "coughing", "cold", "flu", "asthma", "wheezing", "congestion", "phlegm", "mucus",
        "kikohozi", "mafua", "pumu", "breathe", "breathing"
    ]):
        return {
            "department": "Pulmonology & Respiratory",
            "departmentCode": "RESP",
            "suggestedSpecialty": "Pulmonologist / Chest Physician",
            "urgency": "STANDARD",
            "triageScore": 3,
            "explanationSwahili": "Huduma ya mfumo wa upumuaji (Respiratory Clinic) inashauriwa kwa kikohozi au mafua.",
            "explanationEnglish": "Respiratory / Pulmonology review is recommended for cough, flu, or airway symptoms.",
        }

    # 9. Gastroenterology & Abdominal
    if any(w in lower for w in [
        "stomach", "tumbo", "nausea", "vomit", "vomiting", "diarrhea", "acid", "heartburn", "ulcer",
        "ulcers", "indigestion", "cramps", "belly", "constipation", "kuendesha", "kutapika", "kinyesi"
    ]):
        return {
            "department": "Gastroenterology & Internal Medicine",
            "departmentCode": "GASTRO",
            "suggestedSpecialty": "Gastroenterologist / Internal Medicine Physician",
            "urgency": "STANDARD",
            "triageScore": 3,
            "explanationSwahili": "Uchunguzi wa tumbo na mfumo wa chakula (Gastroenterology) unashauriwa.",
            "explanationEnglish": "Gastroenterology & Internal Medicine consultation is recommended for abdominal or digestive symptoms.",
        }

    # 10. Maternity & Reproductive Health (Linda Mama)
    if any(w in lower for w in ["ujauzito", "maternity", "mimba", "pregnant", "pregnancy", "uzazi", "antenatal", "anc", "gynecology", "gynae", "period", "cramp"]):
        return {
            "department": "Maternity & Reproductive Health (Linda Mama)",
            "departmentCode": "MAT",
            "suggestedSpecialty": "Obstetrician / Midwife Clinic",
            "urgency": "STANDARD",
            "triageScore": 2,
            "explanationSwahili": "Huduma za uzazi na wajawazito (ANC / Linda Mama) zinashauriwa, zikipatikana pia bila malipo serikalini.",
            "explanationEnglish": "Maternal health services (ANC / Linda Mama) are recommended for prenatal or reproductive care.",
        }

    # 11. Mental Health & Wellness
    if any(w in lower for w in ["stress", "anxiety", "depressed", "depression", "insomnia", "panic", "mental", "counseling", "therapy", "huzuni", "msongo", "usingizi"]):
        return {
            "department": "Mental Health & Wellness",
            "departmentCode": "MNT",
            "suggestedSpecialty": "Clinical Psychologist / Counselor",
            "urgency": "STANDARD",
            "triageScore": 2,
            "explanationSwahili": "Huduma ya ushauri nasaha na afya ya akili (Mental Wellness) inashauriwa kwa usaidizi wa kitaalamu.",
            "explanationEnglish": "Mental Health & Wellness counseling is recommended for professional psychological support.",
        }

    # 12. General Consultation & Outpatient (Catch-all for any user input)
    is_acute = any(w in lower for w in ["homa", "fever", "maumivu makali", "severe", "dizzy", "kizunguzungu", "weak", "fatigue", "pain", "hurt", "sick", "ill"])
    return {
        "department": "General Consultation (OPD)",
        "departmentCode": "OPD",
        "suggestedSpecialty": "General Practitioner (GP) / Medical Officer",
        "urgency": "URGENT" if is_acute else "STANDARD",
        "triageScore": 3 if is_acute else 2,
        "explanationSwahili": "Uchunguzi wa jumla (General Consultation) na daktari wa zamu unapendekezwa kuchunguza dalili zako kwa makini.",
        "explanationEnglish": "General outpatient consultation with the duty medical officer is recommended to thoroughly evaluate your condition.",
    }
