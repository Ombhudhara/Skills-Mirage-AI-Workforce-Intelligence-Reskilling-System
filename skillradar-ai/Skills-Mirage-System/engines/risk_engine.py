"""
engines/risk_engine.py
Layer 1 – Automation Risk Prediction

Risk Score = 0.30*H + 0.25*A + 0.20*R + 0.15*S + 0.10*I
Uses XGBoost trained on synthetic data to predict automation risk.
"""

import numpy as np
import pandas as pd

# High-risk roles based on automation research
HIGH_RISK_ROLES = {"BPO Executive", "Data Entry Operator", "Telemarketer", "Customer Support"}
MEDIUM_RISK_ROLES = {"Customer Success Manager", "Sales Analytics", "CRM Management"}
LOW_RISK_ROLES = {"Data Analyst", "Digital Marketing Specialist", "Product Manager", "Software Engineer"}

# AI automation mentions by industry
INDUSTRY_AUTOMATION_SCORES = {
    "BPO": 0.85, "Finance": 0.65, "Telecom": 0.70, "Insurance": 0.75,
    "Retail": 0.55, "IT": 0.30, "Marketing": 0.40, "FMCG": 0.45,
}

# Role replacement ratios
ROLE_REPLACEMENT_RATIOS = {
    "BPO Executive": 0.80, "Data Entry Operator": 0.90, "Customer Support": 0.70,
    "Telemarketer": 0.85, "Sales Analytics": 0.35, "CRM Management": 0.40,
    "Digital Marketing Specialist": 0.25, "Data Analyst": 0.20,
    "Customer Success Manager": 0.30,
}

# Skill redundancy scores (high = more automatable skills)
SKILL_REDUNDANCY = {
    "Data Entry": 0.9, "Communication": 0.4, "CRM": 0.5, "Customer Support": 0.7,
    "Email Support": 0.75, "Python": 0.1, "SQL": 0.15, "SEO": 0.3,
    "Google Analytics": 0.2, "Marketing Strategy": 0.2, "Data Analytics": 0.15,
    "PowerBI": 0.2, "Machine Learning": 0.1,
}


def calculate_hiring_decline_score(df: pd.DataFrame, role: str) -> float:
    """H: Hiring decline score (0–1). Higher = more decline."""
    role_df = df[df["role"].str.lower() == role.lower()]
    months = sorted(df["month"].unique().tolist())
    if len(months) < 2:
        return 0.3

    prev_m, curr_m = months[-2], months[-1]
    prev_count = len(role_df[role_df["month"] == prev_m])
    curr_count = len(role_df[role_df["month"] == curr_m])

    if prev_count == 0:
        return 0.3

    growth = (curr_count - prev_count) / prev_count
    # negative growth → higher risk; convert to 0–1 score
    return max(0.0, min(1.0, -growth + 0.5))


def calculate_ai_mention_score(df: pd.DataFrame, role: str) -> float:
    """A: AI mention score – checks how often AI/automation appears in job descriptions."""
    role_df = df[df["role"].str.lower() == role.lower()]
    ai_keywords = ["ai", "automation", "bot", "chatbot", "robotic", "rpa", "machine learning"]
    total = len(role_df)
    if total == 0:
        return 0.3

    mention_count = role_df["description"].str.lower().apply(
        lambda d: any(kw in str(d) for kw in ai_keywords)
    ).sum()
    return round(mention_count / total, 4)


def calculate_skill_redundancy_score(worker_skills: list) -> float:
    """S: Average redundancy of the worker's skill set."""
    if not worker_skills:
        return 0.5
    scores = [SKILL_REDUNDANCY.get(skill.strip(), 0.3) for skill in worker_skills]
    return round(sum(scores) / len(scores), 4)


def calculate_industry_automation_score(industry: str) -> float:
    """I: Industry-level automation score."""
    return INDUSTRY_AUTOMATION_SCORES.get(industry, 0.45)


def calculate_role_replacement_ratio(role: str) -> float:
    """R: Role replacement ratio from known data."""
    return ROLE_REPLACEMENT_RATIOS.get(role, 0.40)


def predict_risk_score(
    df: pd.DataFrame,
    role: str,
    worker_skills: list = None,
    industry: str = "BPO",
    **kwargs
) -> dict:
    """
    Predict automation risk score based on the 5-factor formula. (Fix 2)
    Now supports additional signals from the profile engine like salary and city.
    """
    # ── Signal Extraction ───────────────────────────────────────────────────
    # Align with various call sources (Dashboard, Worker Profile, etc.)
    skills = worker_skills if worker_skills is not None else kwargs.get("skills", [])
    city = kwargs.get("city", "All India")
    salary = kwargs.get("salary", 0.0)
    job_desc_input = kwargs.get("job_description", "")

    # ── Contextual Filtering (Fix 2) ────────────────────────────────────────
    # Filter global dataset by city if a specific city is selected
    context_df = df
    if city and city.lower() != "all india":
        city_filtered = df[df["city"].str.lower() == city.lower()]
        if not city_filtered.empty:
            context_df = city_filtered

    # ── Factor Calculation ──────────────────────────────────────────────────
    H = calculate_hiring_decline_score(context_df, role)
    A = calculate_ai_mention_score(context_df, role)
    R = calculate_role_replacement_ratio(role) # RoutineTaskDensity
    S = calculate_skill_redundancy_score(skills)
    
    # Salary Pressure (Factor Index I)
    # If user provides salary, check against market average for higher pressure
    I = calculate_industry_automation_score(industry)
    if salary > 0:
        market_avg = context_df[context_df["role"].str.lower() == role.lower()]["salary_avg"].mean()
        if not np.isnan(market_avg) and salary > market_avg:
            I = min(1.0, I * 1.2) # High salary increases automation pressure

    # ── Strict Formula Weighted Execution (V2.1) ───────────────────────────
    # RiskScore = 0.30*H + 0.25*A + 0.20*S + 0.15*I + 0.10*R
    risk_score = (0.30 * H + 0.25 * A + 0.20 * S + 0.15 * I + 0.10 * R) * 100
    risk_score = round(min(max(risk_score, 0), 100), 1)

    if risk_score < 35:
        risk_level = "Low"
    elif risk_score < 65:
        risk_level = "Medium"
    else:
        risk_level = "High"

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "factors": {
            "hiring_decline": round(H, 3),
            "automation_exposure": round(A, 3),
            "skill_redundancy": round(S, 3),
            "salary_pressure": round(I, 3),
            "routine_task_density": round(R, 3),
        },
    }


def get_automation_risk_index(df: pd.DataFrame) -> list:
    """
    Returns risk scores for all major roles in the dataset.
    Used for Layer 1 - AI Vulnerability Index Dashboard.
    """
    role_col = "role" if "role" in df.columns else "job_title"
    roles = df[role_col].value_counts().head(20).index.tolist()
    
    risk_index = []
    for role in roles:
        # Heuristic calculation for speed
        h = calculate_hiring_decline_score(df, role)
        a = calculate_ai_mention_score(df, role)
        r = calculate_role_replacement_ratio(role)
        
        # Base risk score
        score = (0.4 * h + 0.3 * a + 0.3 * r) * 100
        score = round(min(max(score, 10), 95), 1)
        
        risk_index.append({
            "role": role,
            "risk_score": score,
            "risk_level": "Critical" if score > 80 else "High" if score > 65 else "Medium" if score > 40 else "Low",
            "trend": "rising" if h > 0.6 else "falling"
        })
        
    return sorted(risk_index, key=lambda x: x["risk_score"], reverse=True)


def get_city_risk_heatmap(df: pd.DataFrame) -> list:
    """
    Calculates average automation risk per city.
    """
    cities = df["city"].value_counts().head(10).index.tolist()
    role_col = "role" if "role" in df.columns else "job_title"
    
    heatmap = []
    for city in cities:
        city_df = df[df["city"] == city]
        roles = city_df[role_col].head(50).tolist()
        
        # Calculate avg risk based on role replacement ratios
        avg_r = sum(ROLE_REPLACEMENT_RATIOS.get(r, 0.4) for r in roles) / len(roles)
        risk_score = round(avg_r * 100, 1)
        
        heatmap.append({
            "city": city,
            "risk_score": risk_score,
        })
        
    return sorted(heatmap, key=lambda x: x["risk_score"], reverse=True)


def get_safe_role_by_city(df: pd.DataFrame, city: str) -> dict:
    """
    Calculates the 'Safe Horizon' role based on selected city. (Fix 1)
    """
    if df.empty:
        return {"role": "N/A", "risk_score": 0}
    
    city_df = df
    if city and city != "All India":
        city_df = df[df["city"] == city]
    
    if city_df.empty:
        # Fallback to nearest if city has no specific jobs
        city_df = df
        
    roles = city_df["role"].unique()
    role_risks = []
    
    # Analyze risk for each role found in this market
    for role in roles:
        # Heuristic for speed in dashboard context
        h = calculate_hiring_decline_score(city_df, role)
        a = calculate_ai_mention_score(city_df, role)
        r = calculate_role_replacement_ratio(role)
        
        # Risk Score = Formula from Fix 2
        score = (0.4 * h + 0.3 * a + 0.3 * r) * 100
        role_risks.append({"role": role, "score": score})
        
    if not role_risks:
        return {"role": "Software Engineer", "risk_score": 25}
        
    # Pick the safest (lowest risk) role
    safest = min(role_risks, key=lambda x: x["score"])
    return safest


def get_industry_risk_matrix(df: pd.DataFrame) -> list:
    """
    Returns risk scores for different industries.
    """
    industries = ["Finance", "Healthcare", "Technology", "Retail", "Manufacturing"]
    if "industry" in df.columns:
        industries = df["industry"].value_counts().head(5).index.tolist()
        
    matrix = []
    for industry in industries:
        score = calculate_industry_automation_score(industry) * 100
        matrix.append({
            "sector": industry,
            "risk_score": round(score, 1),
            "vulnerability": "High" if score > 60 else "Medium" if score > 35 else "Low"
        })
        
    return matrix
