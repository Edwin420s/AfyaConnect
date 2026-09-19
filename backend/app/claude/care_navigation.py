from typing import Dict, Any


def determine_care_pathway(text: str) -> Dict[str, Any]:
    """
    Analyzes patient complaints and maps them to appropriate hospital departments
    without claiming a definitive medical diagnosis.
    """
    lower = text.lower()

    # 1. Pediatrics
    if any(w in lower for w in ["mtoto", "child", "baby", "infant", "toddler", "chanjo", "mwanangu"]):
        is_fever = any(w in lower for w in ["homa", "fever", "joto"])
        return {
            "department": "Pediatrics & Child Health",
            "departmentCode": "PED",
            "suggestedSpecialty": "Pediatrician / Child Health Clinic",
            "urgency": "URGENT" if is_fever else "STANDARD",
            "triageScore": 4 if is_fever else 2,
            "explanationSwahili": "Huduma inayopendekezwa ni idara ya watoto (Pediatrics) kwa ajili ya uchunguzi maalum wa mtoto.",
            "explanationEnglish": "Recommended care pathway is Pediatrics & Child Health for dedicated pediatric evaluation.",
        }

    # 2. ENT
    if any(w in lower for w in ["masikio", "ear", "hearing", "koo", "throat", "tonsil", "pua", "sinus", "mlio", "tinnitus"]):
        return {
            "department": "Ear, Nose & Throat (ENT)",
            "departmentCode": "ENT",
            "suggestedSpecialty": "ENT Specialist / Otorhinolaryngologist",
            "urgency": "STANDARD",
            "triageScore": 3,
            "explanationSwahili": "Idara ya masikio, pua na koo (ENT) inashauriwa kwa uchunguzi wa mlio, koo au masikio.",
            "explanationEnglish": "Ear, Nose & Throat (ENT) department is recommended for hearing, throat, or sinus symptoms.",
        }

    # 3. Dental
    if any(w in lower for w in ["meno", "jino", "tooth", "teeth", "dental", "gums"]):
        return {
            "department": "Dental Surgery & Oral Health",
            "departmentCode": "DENT",
            "suggestedSpecialty": "Dental Surgeon / Dentist",
            "urgency": "STANDARD",
            "triageScore": 2,
            "explanationSwahili": "Huduma ya afya ya kinywa na meno (Dental clinic) inashauriwa kwa maumivu ya jino.",
            "explanationEnglish": "Dental clinic evaluation is recommended for toothache or oral health concerns.",
        }

    # 4. Dermatology
    if any(w in lower for w in ["ngozi", "skin", "rash", "itching", "vipele", "upele", "eczema"]):
        return {
            "department": "Dermatology",
            "departmentCode": "DERM",
            "suggestedSpecialty": "Consultant Dermatologist",
            "urgency": "STANDARD",
            "triageScore": 2,
            "explanationSwahili": "Uchunguzi wa ngozi (Dermatology) unashauriwa kubaini chanzo cha upele au kuwashwa.",
            "explanationEnglish": "Dermatology consultation is recommended for skin rash or irritation.",
        }

    # 5. Maternity / Linda Mama
    if any(w in lower for w in ["ujauzito", "maternity", "mimba", "pregnant", "pregnancy", "uzazi", "antenatal"]):
        return {
            "department": "Maternity & Reproductive Health (Linda Mama)",
            "departmentCode": "MAT",
            "suggestedSpecialty": "Obstetrician / Midwife Clinic",
            "urgency": "STANDARD",
            "triageScore": 2,
            "explanationSwahili": "Huduma za uzazi na wajawazito (ANC / Linda Mama) zinashauriwa, zikipatikana pia bila malipo serikalini.",
            "explanationEnglish": "Maternal health services (ANC / Linda Mama) are recommended for prenatal care.",
        }

    # 6. General Internal Medicine (Default)
    is_acute = any(w in lower for w in ["homa", "fever", "maumivu makali", "severe", "dizzy", "kizunguzungu"])
    return {
        "department": "General Consultation (OPD)",
        "departmentCode": "OPD",
        "suggestedSpecialty": "General Practitioner (GP) / Medical Officer",
        "urgency": "URGENT" if is_acute else "STANDARD",
        "triageScore": 4 if is_acute else 2,
        "explanationSwahili": "Uchunguzi wa jumla (General Consultation) na daktari wa zamu unapendekezwa.",
        "explanationEnglish": "General outpatient consultation with the duty medical officer is recommended.",
    }
