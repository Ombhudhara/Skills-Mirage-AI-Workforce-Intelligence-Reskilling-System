"""
engines/skill_extractor.py
Layer 2 – Worker Skill Extraction via NLP

Uses keyword matching + Sentence Transformers cosine similarity
to extract skills from worker's work description.
"""

import re
from typing import List

# Master skill library (known skills the system recognizes)
SKILL_LIBRARY = [
    "Python", "SQL", "Excel", "PowerBI", "Tableau", "Machine Learning",
    "Data Analytics", "Statistics", "R", "Spark", "Azure", "AWS",
    "SEO", "Google Analytics", "Social Media", "Content Marketing",
    "Email Marketing", "Marketing Strategy", "PPC", "CRM Automation",
    "Digital Marketing", "CRM", "Communication", "Customer Support",
    "Problem Solving", "Account Management", "Technical Support",
    "Data Entry", "Email Support", "Sales Analytics", "AI Chatbot Management",
    "Salesforce", "Automation", "PowerPoint", "Reporting",
]

# Keyword aliases → canonical skill names
SKILL_ALIASES = {
    "crm": "CRM",
    "customer relationship management": "CRM",
    "call handling": "Communication",
    "calls": "Communication",
    "customer complaints": "Customer Support",
    "complaint": "Customer Support",
    "data entry": "Data Entry",
    "email": "Email Support",
    "excel": "Excel",
    "reports": "Reporting",
    "reporting": "Reporting",
    "seo": "SEO",
    "social media": "Social Media",
    "google analytics": "Google Analytics",
    "analytics": "Data Analytics",
    "python": "Python",
    "sql": "SQL",
    "marketing": "Digital Marketing",
    "communication": "Communication",
    "powerbi": "PowerBI",
    "power bi": "PowerBI",
    "sales": "Sales Analytics",
    "chatbot": "AI Chatbot Management",
    "automation": "Automation",
    "account management": "Account Management",
}


def extract_skills_from_text(description: str) -> List[str]:
    """
    Extract skills from free-text work description using keyword matching.
    Falls back gracefully if sentence-transformers is not installed.
    """
    description_lower = description.lower()
    extracted = set()

    # 1. Direct alias matching
    for alias, canonical in SKILL_ALIASES.items():
        if alias in description_lower:
            extracted.add(canonical)

    # 2. Direct skill library matching
    for skill in SKILL_LIBRARY:
        if skill.lower() in description_lower:
            extracted.add(skill)

    # 3. Try sentence-transformer semantic matching if available
    try:
        from sentence_transformers import SentenceTransformer, util
        model = SentenceTransformer("all-MiniLM-L6-v2")
        desc_embedding = model.encode(description, convert_to_tensor=True)
        skill_embeddings = model.encode(SKILL_LIBRARY, convert_to_tensor=True)
        cosine_scores = util.cos_sim(desc_embedding, skill_embeddings)[0]

        for idx, score in enumerate(cosine_scores):
            if float(score) > 0.45:  # Similarity threshold
                extracted.add(SKILL_LIBRARY[idx])
    except ImportError:
        pass  # Gracefully use keyword-only extraction

    return sorted(list(extracted))


def get_worker_skill_profile(description: str) -> dict:
    """
    Returns extracted skills with confidence and description.
    """
    skills = extract_skills_from_text(description)
    return {
        "extracted_skills": skills,
        "skill_count": len(skills),
        "extraction_method": "keyword_matching + semantic_similarity",
    }
