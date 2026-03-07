def get_chatbot_response(message: str, risk_score: float = None, role: str = None) -> dict:
    """
    Context-aware chatbot logic with Hindi support.
    For this MVP, it uses rule-based matching. In production, this would call an LLM API.
    """
    msg_lower = message.lower()
    
    # Simple Hindi detection (looking for common transliterated words or devanagari)
    is_hindi = any(word in msg_lower for word in ["kya", "hai", "kaise", "kyun", "risk", "mera"]) or any('\u0900' <= c <= '\u097F' for c in message)

    if is_hindi:
        if "risk" in msg_lower or "high" in msg_lower or "jo" in msg_lower: # 'jo' for jokhim
            return {
                "reply": f"आपका जोखिम स्कोर {risk_score if risk_score else 'उच्च'} इसलिए है क्योंकि एआई आपके दैनिक कार्यों को स्वचालित कर सकता है। आपको भविष्य के लिए नए कौशल सीखने की आवश्यकता है।",
                "language": "hi"
            }
        elif "saf" in msg_lower or "job" in msg_lower or "ka" in msg_lower: # 'ka' for kaam/kaise
            return {
                "reply": "भविष्य के सुरक्षित व्यवसायों में डेटा साइंस, स्वास्थ्य सेवा (नर्सिंग), और सॉफ्टवेयर विकास शामिल हैं जहां मानवीय निर्णय अत्यंत आवश्यक है।",
                "language": "hi"
            }
        else:
            return {
                "reply": "मैं स्किलमिराज (SkillMirage) सहायक हूँ। आप मुझसे अपने करियर जोखिम और सीखने के रास्तों के बारे में पूछ सकते हैं।",
                "language": "hi"
            }
    
    # English responses
    if "why" in msg_lower and "risk" in msg_lower:
        return {
            "reply": f"Your risk score of {risk_score if risk_score else 'N/A'} is high primarily because your role ({role if role else 'your job'}) involves routine, repetitive tasks that are highly susceptible to automation by GenAI and RPA.",
            "language": "en"
        }
    elif "safe" in msg_lower or "job" in msg_lower:
        return {
            "reply": "Safer jobs generally require high emotional intelligence, complex physical manipulation, or advanced strategic planning. Examples: Software Architecture, Nursing, Counseling.",
            "language": "en"
        }
    elif "3 months" in msg_lower or "path" in msg_lower:
        return {
            "reply": "To transition within 3 months, I recommend focusing on our intensive 12-week Data Engineering path using SWAYAM and NPTEL. It focuses heavily on practical SQL and Python.",
            "language": "en"
        }
    else:
        return {
            "reply": "I am the SkillRadar Assistant. I can explain your AI risk score, suggest safer career paths, and map out training courses from SWAYAM/NPTEL for you.",
            "language": "en"
        }
