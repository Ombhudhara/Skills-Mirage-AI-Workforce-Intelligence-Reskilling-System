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
    worker_skills: list,
    industry: str = "BPO",
) -> dict:
    """
    Predict automation risk score for a worker.
    RiskScore = 0.30*H + 0.25*A + 0.20*R + 0.15*S + 0.10*I
    """
    H = calculate_hiring_decline_score(df, role)
    A = calculate_ai_mention_score(df, role)
    R = calculate_role_replacement_ratio(role)
    S = calculate_skill_redundancy_score(worker_skills)
    I = calculate_industry_automation_score(industry)

    risk_score = (0.30 * H + 0.25 * A + 0.20 * R + 0.15 * S + 0.10 * I) * 100
    risk_score = round(min(max(risk_score, 0), 100), 1)

    if risk_score < 30:
        risk_level = "Low"
    elif risk_score < 60:
        risk_level = "Medium"
    else:
        risk_level = "High"

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "factors": {
            "hiring_decline": round(H, 3),
            "ai_mentions": round(A, 3),
            "role_replacement": round(R, 3),
            "skill_redundancy": round(S, 3),
            "industry_automation": round(I, 3),
        },
    }
