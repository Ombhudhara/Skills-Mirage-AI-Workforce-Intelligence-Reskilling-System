"""
engines/career_recommender.py
Layer 2 – Career Recommendation Model

CareerScore = 0.35*SkillMatch + 0.25*DemandGrowth + 0.20*SalaryGrowth + 0.20*AutomationSafety
"""

import pandas as pd
from typing import List
from engines.skill_gap import detect_skill_gap
from engines.trend_engine import analyze_job_trends
from engines.salary_engine import get_average_salary, get_salary_growth
from engines.risk_engine import predict_risk_score


# Candidate career paths the system evaluates
CANDIDATE_CAREERS = [
    "Data Analyst",
    "Digital Marketing Specialist",
    "Customer Success Manager",
    "Sales Analytics",
    "CRM Management",
]


def recommend_careers(
    df: pd.DataFrame,
    worker_skills: List[str],
    current_role: str,
    career_goal: str,
    current_salary: float,
    target_salary: float,
    city: str,
) -> list:
    """
    Score and rank candidate career paths for a worker.
    Ensures the worker's career_goal appears in candidates.
    """
    # Build candidate list (always include goal)
    candidates = list(CANDIDATE_CAREERS)
    if career_goal not in candidates:
        candidates.append(career_goal)

    job_trends = analyze_job_trends(df)
    results = []

    for role in candidates:
        # 1. Skill Match (TransferScore as proxy for cosine similarity)
        gap_data = detect_skill_gap(worker_skills, role, df)
        skill_match = gap_data["transfer_score"]

        # 2. Demand Growth (normalized 0-1)
        trend = job_trends.get(role, {})
        demand_growth = min(max(trend.get("growth_rate", 0) / 100.0, 0), 1.0)

        # 3. Salary Growth (normalized 0–1, capped at 2x = score 1.0)
        role_salary = get_average_salary(df, role)["avg_mid"]
        if role_salary == 0:
            role_salary = current_salary * 1.5  # Estimate if no data
        sal_growth = get_salary_growth(role_salary, current_salary)
        salary_growth_score = min(max(sal_growth, 0), 1.0)

        # 4. Automation Safety = 1 - (risk / 100)
        risk_data = predict_risk_score(df, role, worker_skills)
        automation_safety = 1.0 - (risk_data["risk_score"] / 100.0)

        # Career Score formula
        career_score = (
            0.35 * skill_match
            + 0.25 * demand_growth
            + 0.20 * salary_growth_score
            + 0.20 * automation_safety
        )
        career_score = round(career_score * 100, 1)

        results.append({
            "role": role,
            "career_score": career_score,
            "skill_match_pct": round(skill_match * 100, 1),
            "demand_growth_pct": round(demand_growth * 100, 1),
            "expected_salary_lpa": role_salary,
            "automation_safety_pct": round(automation_safety * 100, 1),
            "skill_gap": gap_data["skill_gap"],
        })

    return sorted(results, key=lambda x: x["career_score"], reverse=True)
