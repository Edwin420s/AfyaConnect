from typing import Dict, Any, List


EMERGENCY_KEYWORDS = [
    # Cardiac / Circulatory
    "chest pain",
    "heart attack",
    "crushing chest",
    "left arm pain",
    "maumivu ya kifua",
    "mshtuko wa moyo",
    "kifua kubana",
    "kifua kinabana",
    # Respiratory / Airway
    "cannot breathe",
    "shortness of breath",
    "struggling to breathe",
    "gasping for air",
    "choking",
    "kushindwa kupumua",
    "hawezi kupumua",
    "kupumua kwa shida",
    "pumu kali",
    # Neurological / Stroke / Seizures
    "unconscious",
    "fainted",
    "passed out",
    "stroke",
    "slurred speech",
    "facial drooping",
    "seizure",
    "convulsion",
    "fits",
    "amepoteza fahamu",
    "kuzirai",
    "kupooza",
    "degedege",
    # Hemorrhage / Trauma
    "bleeding heavily",
    "coughing blood",
    "vomiting blood",
    "profuse bleeding",
    "damu nyingi",
    "kutapika damu",
    "kikohozi cha damu",
    # Poisoning
    "poison",
    "overdose",
    "sumu",
    "kunywa sumu",
]

URGENT_KEYWORDS = [
    "homa kali",
    "high fever",
    "severe pain",
    "maumivu makali",
    "severe vomiting",
    "kutapika sana",
    "severe diarrhea",
    "kuhara sana",
    "dehydration",
    "dizzy",
    "kizunguzungu",
]

KENYA_EMERGENCY_HOTLINES = [
    {"name": "Kenya Red Cross Emergency Dispatch", "number": "1199", "description": "Toll-free 24/7 nationwide ambulance & emergency rescue"},
    {"name": "National Emergency Hotline", "number": "999 / 112", "description": "National emergency central police & ambulance dispatch"},
    {"name": "Aga Khan Univ. Hospital Casualty & Trauma", "number": "+254 20 366 2000", "description": "Level 6 24/7 Emergency Department (Parklands)"},
    {"name": "MP Shah Hospital Emergency Response", "number": "+254 20 429 1000", "description": "Level 5 24/7 Emergency & Critical Care (Shivachi Rd)"},
]


def evaluate_clinical_safety(text: str) -> Dict[str, Any]:
    """
    Evaluates patient symptoms against clinical safety guidelines and red flags.
    Short-circuits routine booking immediately if emergency keywords are detected.
    """
    lower = text.lower()

    # 1. Immediate Life-Threatening Emergency (Level 5) - Exact Keywords
    for kw in EMERGENCY_KEYWORDS:
        if kw in lower:
            return {
                "isEmergency": True,
                "triageScore": 5,
                "urgency": "EMERGENCY",
                "redFlagReason": f'Alama kuu ya dharura iliyotambuliwa: "{kw}"',
                "recommendedAction": (
                    "🚨 ONYO LA DHARURA (EMERGENCY RED FLAG): Dalili ulizoeleza zinaashiria "
                    "hali ya dharura inayohitaji msaada wa haraka wa kimatibabu. Tafadhali "
                    "elekea kituo cha dharura (Casualty) mara moja au piga 1199 (Red Cross) bila kuchelewa."
                ),
                "emergencyHotlines": KENYA_EMERGENCY_HOTLINES,
            }

    # Check compound Swahili chest pain / cardiac symptoms (e.g. "maumivu makali ya kifua")
    if ("kifua" in lower and ("maumivu" in lower or "kuuma" in lower or "kubana" in lower)):
        kw = "maumivu ya kifua"
        return {
            "isEmergency": True,
            "triageScore": 5,
            "urgency": "EMERGENCY",
            "redFlagReason": f'Alama kuu ya dharura iliyotambuliwa: "{kw}"',
            "recommendedAction": (
                "🚨 ONYO LA DHARURA (EMERGENCY RED FLAG): Dalili ulizoeleza zinaashiria "
                "hali ya dharura inayohitaji msaada wa haraka wa kimatibabu. Tafadhali "
                "elekea kituo cha dharura (Casualty) mara moja au piga 1199 (Red Cross) bila kuchelewa."
            ),
            "emergencyHotlines": KENYA_EMERGENCY_HOTLINES,
        }

    # 2. Urgent Attention Required (Level 4)
    for kw in URGENT_KEYWORDS:
        if kw in lower:
            return {
                "isEmergency": False,
                "triageScore": 4,
                "urgency": "URGENT",
                "redFlagReason": f'Hali inayohitaji uangalizi wa haraka: "{kw}"',
                "recommendedAction": (
                    "Dalili hizi zinahitaji uchunguzi wa haraka wa daktari leo au mapema kesho asubuhi. "
                    "Mfumo unapendekeza vituo vyenye nafasi za haraka (Priority Consultation)."
                ),
                "emergencyHotlines": KENYA_EMERGENCY_HOTLINES[:2],
            }

    # 3. Standard / Routine Consultation (Level 2 or 3)
    return {
        "isEmergency": False,
        "triageScore": 2,
        "urgency": "STANDARD",
        "redFlagReason": None,
        "recommendedAction": "Uchunguzi wa kawaida unatosha (Routine outpatient consultation).",
        "emergencyHotlines": KENYA_EMERGENCY_HOTLINES[:1],
    }
