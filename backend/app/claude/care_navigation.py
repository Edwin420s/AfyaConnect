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


SPECIALIST_ROSTER = {
    "PED": {
        "specialist": "Pediatrician / Child Health Clinic",
        "doctorName": "Dr. Achieng",
        "department": "Pediatrics & Child Health",
        "facilityId": "f-agakhan",
    },
    "ENT": {
        "specialist": "ENT Specialist / Otorhinolaryngologist",
        "doctorName": "Dr. Achieng",
        "department": "Ear, Nose & Throat (ENT)",
        "facilityId": "f-agakhan",
    },
    "DERM": {
        "specialist": "Consultant Dermatologist",
        "doctorName": "Dr. Mwangi",
        "department": "Dermatology",
        "facilityId": "f-mpshah",
    },
    "DENT": {
        "specialist": "Dental Surgeon / Dentist",
        "doctorName": "Dr. Kibet",
        "department": "Dental Surgery & Oral Health",
        "facilityId": "f-avenue",
    },
    "EYE": {
        "specialist": "Consultant Ophthalmologist",
        "doctorName": "Dr. Omondi",
        "department": "Ophthalmology (Eye Care)",
        "facilityId": "f-agakhan",
    },
    "ORTHO": {
        "specialist": "Orthopedic Surgeon",
        "doctorName": "Dr. Wanjiku Kamau",
        "department": "Orthopedics & Musculoskeletal",
        "facilityId": "f-agakhan",
    },
    "MAT": {
        "specialist": "Obstetrician / Linda Mama Clinic",
        "doctorName": "Dr. Wanjiku Kamau",
        "department": "Maternity & Reproductive Health (Linda Mama)",
        "facilityId": "f-westlands",
    },
    "GASTRO": {
        "specialist": "Gastroenterologist & Internal Medicine",
        "doctorName": "Dr. Wanjiku Kamau",
        "department": "Gastroenterology & Internal Medicine",
        "facilityId": "f-agakhan",
    },
    "CARD": {
        "specialist": "Consultant Cardiologist",
        "doctorName": "Dr. Wanjiku Kamau",
        "department": "Cardiology & Cardiovascular",
        "facilityId": "f-agakhan",
    },
    "RESP": {
        "specialist": "Pulmonologist & Chest Physician",
        "doctorName": "Dr. Achieng",
        "department": "Pulmonology & Respiratory",
        "facilityId": "f-agakhan",
    },
    "MNT": {
        "specialist": "Clinical Psychologist / Counselor",
        "doctorName": "Dr. Omondi",
        "department": "Mental Health & Wellness",
        "facilityId": "f-agakhan",
    },
    "OPD": {
        "specialist": "General Practitioner / Medical Officer",
        "doctorName": "Dr. Wanjiku Kamau",
        "department": "General Consultation (OPD)",
        "facilityId": "f-agakhan",
    },
}


def analyze_clinical_intake(
    patient_message: str,
    history: Optional[List[Dict[str, Any]]] = None,
    language_preference: str = "swa_eng",
) -> Dict[str, Any]:
    """
    Intelligently evaluates whether the patient has provided enough clinical data
    (symptoms, location, duration, and patient context like adult vs child)
    before recommending a specific specialist or proposing an appointment.
    Prevents premature booking on single-word or vague initial messages.
    """
    history = history or []
    patient_turns = [
        h.get("text", "").strip()
        for h in history
        if h.get("sender") in ["patient", "user"] and h.get("text", "").strip()
    ]
    all_patient_text = " ".join(patient_turns + [patient_message.strip()]).lower()
    curr_text = patient_message.strip().lower()
    words = curr_text.split()

    # 1. Pure Greetings
    greetings = [
        "hi", "hello", "habari", "sasa", "mambo", "niaje", "hey", "jambo",
        "good morning", "good afternoon", "good evening", "how are you", "hujambo",
        "salama", "oya", "vipi", "morning", "afternoon"
    ]
    is_greeting = curr_text in greetings or (len(words) <= 2 and any(g == curr_text for g in greetings))

    # 2. Vague 1-3 word queries without clinical context
    vague_phrases = [
        "homa", "fever", "pain", "maumivu", "kichwa", "headache", "sick", "ill",
        "mgonjwa", "daktari", "doctor", "nisaidie", "help", "need a doctor",
        "nahitaji daktari", "nataka daktari", "tumbo", "stomach", "kuumwa",
        "hospitali", "clinic", "treatment", "matibabu"
    ]
    is_vague_short = (len(words) <= 3) and any(
        curr_text == vp or curr_text.startswith(vp) or curr_text.endswith(vp)
        for vp in vague_phrases
    )

    # 3. Clinical details present in combined history
    has_duration = any(
        w in all_patient_text
        for w in [
            "day", "days", "siku", "hour", "hours", "masaa", "week", "weeks", "wiki",
            "since", "tangu", "yesterday", "jana", "leo", "today", "night", "usiku",
            "asubuhi", "morning", "month", "miezi", "ongoing", "kwa siku", "tangu jana",
            "for two", "for 2", "for 3", "for a week"
        ]
    )

    has_specific_specialty = any(
        w in all_patient_text
        for w in [
            "mtoto", "child", "children", "baby", "infant", "toddler", "mwanangu", "kid", "kids", "pediatric",
            "meno", "jino", "tooth", "teeth", "dental", "dentist", "gums", "toothache",
            "ngozi", "skin", "rash", "vipele", "upele", "eczema", "acne", "itching", "kuwasha",
            "macho", "jicho", "eye", "eyes", "vision", "blurry", "cataract", "redness", "kuona",
            "ankle", "knee", "joint", "bone", "fracture", "sprain", "twist", "goti", "mguu", "mgongo", "kiuno", "mfupa",
            "masikio", "ear", "ears", "hearing", "koo", "throat", "tonsil", "tonsils", "pua", "sinus",
            "mimba", "ujauzito", "pregnant", "pregnancy", "uzazi", "linda mama", "antenatal"
        ]
    )

    has_detailed_explanation = len(words) >= 6 and (has_duration or any(
        s in curr_text for s in [
            "tumbo", "stomach", "fever", "homa", "migraine", "dizziness", "vomiting", "cough",
            "breath", "pain", "swollen", "injured", "headache", "kichwa"
        ]
    ))

    # Evaluate if clarification is needed
    if is_greeting or (is_vague_short and not has_duration and not has_specific_specialty):
        needs_clarification = True
    elif has_specific_specialty or has_detailed_explanation or (has_duration and len(words) >= 4):
        needs_clarification = False
    elif len(patient_turns) >= 1 and (has_duration or has_specific_specialty or len(words) >= 3):
        needs_clarification = False
    else:
        needs_clarification = True

    # Generate tailored clarifying intake question
    if needs_clarification:
        symptom_focus = None
        if "kichwa" in curr_text or "headache" in curr_text or "migraine" in curr_text:
            symptom_focus = "headache"
        elif "tumbo" in curr_text or "stomach" in curr_text:
            symptom_focus = "stomach"
        elif "homa" in curr_text or "fever" in curr_text:
            symptom_focus = "fever"
        elif "ngozi" in curr_text or "skin" in curr_text:
            symptom_focus = "skin"

        if language_preference == "eng":
            if symptom_focus == "headache":
                clarification_message = (
                    "I understand you are experiencing a headache. To connect you with the right specialist and check doctor availability:\n"
                    "1. How long has the headache lasted, and is it mild, moderate, or severe?\n"
                    "2. Are you experiencing any other symptoms like fever, dizziness, or nausea?\n"
                    "3. Is this consultation for yourself (adult) or a child?"
                )
            elif symptom_focus == "stomach":
                clarification_message = (
                    "I understand you are experiencing stomach discomfort. To connect you with the right specialist:\n"
                    "1. How long have you had this stomach pain (e.g. today, 2 days)?\n"
                    "2. Are you experiencing any nausea, vomiting, fever, or diarrhea?\n"
                    "3. Is this consultation for an adult or a child?"
                )
            elif symptom_focus == "fever":
                clarification_message = (
                    "I understand you have a fever. To help evaluate your condition:\n"
                    "1. How high is the fever, and how long has it lasted?\n"
                    "2. Is this consultation for an adult or a child?\n"
                    "3. Are there any other symptoms like chills, body weakness, or rash?"
                )
            else:
                clarification_message = (
                    "Hello! Welcome to AfyaConnect. To help you connect with the right specialist (such as Pediatrics for children, ENT for ear/throat, Dermatology for skin, Dental for teeth, or Internal Medicine) and check real doctor availability, could you please tell me:\n"
                    "1. What specific symptoms are you experiencing, and in which part of your body?\n"
                    "2. How long have you had them (e.g. today, 2 days, a week)?\n"
                    "3. Is this consultation for an adult or a child?"
                )
            clarification_options = [
                "👶 It's for a child (Fever / Cough)",
                "🩺 Severe stomach pain (2 days)",
                "🦷 Toothache / Dental issue",
                "👁 Eye redness or blurry vision",
                "🩹 Skin rash or itching",
                "🦴 Joint, knee or back pain",
            ]
        elif language_preference == "swa":
            if symptom_focus == "headache":
                clarification_message = (
                    "Pole sana kwa maumivu ya kichwa. Ili kukuunganisha na daktari sahihi na kuangalia nafasi:\n"
                    "1. Maumivu haya yameanza lini, na ni ya kawaida au makali sana?\n"
                    "2. Je, una dalili zingine kama homa, kizunguzungu, au kichefuchefu?\n"
                    "3. Je, mashauriano haya ni ya mtu mzima au mtoto?"
                )
            elif symptom_focus == "stomach":
                clarification_message = (
                    "Pole sana kwa maumivu ya tumbo. Ili kupata daktari sahihi anayefaa:\n"
                    "1. Maumivu haya ya tumbo yameanza lini (kwa mfano leo, siku 2)?\n"
                    "2. Je, unahisi kichefuchefu, kutapika, homa au kuendesha?\n"
                    "3. Je, ni yako au ya mtoto?"
                )
            elif symptom_focus == "fever":
                clarification_message = (
                    "Pole sana kwa homa. Ili kusaidia kutathmini hali yako:\n"
                    "1. Homa hii imeanza lini, na ni kali kiasi gani?\n"
                    "2. Je, mashauriano haya ni ya mtu mzima au mtoto?\n"
                    "3. Je, una dalili zingine kama kutetemeka, kuishiwa nguvu, au upele?"
                )
            else:
                clarification_message = (
                    "Jambo! Karibu AfyaConnect. Ili kukuunganisha na daktari bingwa anayefaa (kama vile Daktari wa Watoto, Masikio na Koo, Ngozi, Meno, au Uchunguzi wa Jumla) na kuangalia nafasi za miadi:\n"
                    "1. Je, unapata dalili zipi hasa, na katika sehemu gani ya mwili?\n"
                    "2. Zimeanza lini (kwa mfano leo, siku 2, au wiki)?\n"
                    "3. Je, mashauriano haya ni ya mtu mzima au mtoto?"
                )
            clarification_options = [
                "👶 Ni ya mtoto (Homa / Kikohozi)",
                "🩺 Maumivu ya tumbo (Siku 2)",
                "🦷 Maumivu ya jino / Meno",
                "👁 Macho mekundu / Uoni hafifu",
                "🩹 Upele au kuwashwa ngozi",
                "🦴 Maumivu ya viungo au mgongo",
            ]
        else:
            # Sheng / Code-switch
            if symptom_focus == "headache":
                clarification_message = (
                    "Pole sana kwa hiyo headache. Before tuchague daktari na slot:\n"
                    "1. Imeanza lini (duration) na ni kali aje?\n"
                    "2. Kuna dalili zingine kama fever, kizunguzungu ama nausea?\n"
                    "3. Consultation ni ya mtu mzima ama mtoi/child?"
                )
            elif symptom_focus == "stomach":
                clarification_message = (
                    "Pole sana kwa maumivu ya tumbo. Before tu-book slot:\n"
                    "1. Tumbo imeanza kuuma lini (e.g. leo, 2 days)?\n"
                    "2. Kuna kutapika, diarrhea, au homa?\n"
                    "3. Ni ya mtu mzima ama mtoto?"
                )
            elif symptom_focus == "fever":
                clarification_message = (
                    "Pole sana kwa hiyo homa. Before tu-route kwa doctor:\n"
                    "1. Homa imeanza lini na ni kali aje?\n"
                    "2. Ni ya mtu mzima ama mtoi/child?\n"
                    "3. Kuna baridi kali, kuishiwa nguvu ama vipele?"
                )
            else:
                clarification_message = (
                    "Niaje! Welcome to AfyaConnect. To help you connect na specialist anayefaa (kama Daktari wa Watoto, ENT, Ngozi, Meno, ama General OPD):\n"
                    "1. Ni dalili gani haswa unahisi na ziko sehemu gani ya mwili?\n"
                    "2. Zimeanza lini (duration - leo, siku 2, ama wiki)?\n"
                    "3. Consultation ni ya mtu mzima ama mtoi/child?"
                )
            clarification_options = [
                "👶 Ni ya mtoi (Homa kali)",
                "🩺 Maumivu ya tumbo for 2 days",
                "🦷 Jino linaniuma sana",
                "👁 Macho mekundu / Blurry vision",
                "🩹 Vipele na allergy kwa ngozi",
                "🦴 Nimeumia goti / Mgongo unauma",
            ]
    else:
        clarification_message = ""
        clarification_options = []

    pathway = determine_care_pathway(all_patient_text)
    specialist_info = SPECIALIST_ROSTER.get(pathway["departmentCode"], SPECIALIST_ROSTER["OPD"])

    return {
        "needsClarification": needs_clarification,
        "clarificationMessage": clarification_message,
        "clarificationOptions": clarification_options,
        "pathway": pathway,
        "specialist": specialist_info,
    }
