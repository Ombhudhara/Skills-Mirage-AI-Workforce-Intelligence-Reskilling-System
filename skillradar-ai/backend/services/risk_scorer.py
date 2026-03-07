import random

def calculate_ai_risk_score(job_title: str, skills: list[str], city: str, experience: float) -> dict:
    """
    Calculate AI Vulnerability Index (0-100) based on job title and skills.
    In a real app, this would query a database of automation probability by job code (e.g. O*NET).
    """
    score = 50.0  # Base score
    job_title_lower = job_title.lower()

    # Highly automatable roles
    high_risk_keywords = ["data entry", "clerk", "accounting", "telemarketer", "cashier", "transcription"]
    # Low automatable roles
    low_risk_keywords = ["nurse", "plumber", "surgeon", "therapist", "teacher", "software engineer", "manager"]

    if any(k in job_title_lower for k in high_risk_keywords):
        score += 30.0
    elif any(k in job_title_lower for k in low_risk_keywords):
        score -= 20.0
    
    # Skills adjustment (if you have AI skills, risk of being replaced by AI drops, or rather you become the automator)
    tech_skills = ["python", "machine learning", "ai", "cloud", "data science"]
    if any(s.lower() in tech_skills for s in skills):
        score -= 15.0

    # Experience buffer (senior roles are harder to automate)
    if experience > 10:
        score -= 10.0
    elif experience > 5:
        score -= 5.0

    score = max(0.0, min(100.0, score)) # Clamp between 0 and 100

    # Determine risk category
    category = "Low"
    if score > 75:
        category = "Critical Risk"
    elif score > 50:
        category = "Moderate Risk"
    
    return {
        "risk_score": round(score, 1),
        "category": category,
        "primary_factor": "Routine task density in job role" if score > 50 else "High requirement for human judgment"
    }
