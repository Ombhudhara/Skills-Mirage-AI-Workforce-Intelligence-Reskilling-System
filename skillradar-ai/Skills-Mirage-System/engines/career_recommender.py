"""
engines/career_recommender.py
Layer 2 – Career Recommendation Model
Formula: RoleScore = 0.40*HiringDemand + 0.30*SkillTransferability + 0.20*AutomationSafety + 0.10*SalaryGrowth
"""

import pandas as pd
from typing import List

def get_skill_overlap(skills_a: List[str], skills_b: List[str]) -> float:
    """Calculate Jaccard similarity between two skill sets."""
    if not skills_a or not skills_b:
        return 0.0
    set_a = set(s.lower().strip() for s in skills_a)
    set_b = set(s.lower().strip() for s in skills_b)
    intersection = set_a.intersection(set_b)
    union = set_a.union(set_b)
    return len(intersection) / len(union)

def recommend_careers(
    df: pd.DataFrame,
    worker_skills: List[str],
    current_role: str,
    top_n: int = 5
) -> list:
    """
    Score and rank candidate career paths for a worker.
    Formula: 0.40 HiringDemand + 0.30 SkillTransferability + 0.20 AutomationSafety + 0.10 SalaryGrowth
    """
    # Dynamic candidate list from dataset
    candidates = df["role"].value_counts().head(20).index.tolist()
    if current_role in candidates:
        candidates.remove(current_role)

    results = []
    for role in candidates:
        # 1. Skill Transferability (Similarity between current role skills and target role skills)
        role_jobs = df[df["role"] == role]
        target_skills_str = role_jobs["skills"].dropna().str.cat(sep=",")
        target_skills = list(set(s.strip() for s in target_skills_str.split(",") if s.strip()))
        
        transferability = get_skill_overlap(worker_skills, target_skills)

        # 2. Hiring Demand (Job count normalized)
        demand_score = min(len(role_jobs) / 50.0, 1.0)

        # 3. Automation Safety
        from engines.risk_engine import predict_risk_score
        risk_data = predict_risk_score(df, role, worker_skills)
        safety_score = 1.0 - (risk_data["risk_score"] / 100.0)

        # 4. Salary Growth
        from engines.salary_engine import get_average_salary
        role_sal = get_average_salary(df, role)["avg_mid"]
        current_sal = get_average_salary(df, current_role)["avg_mid"] or 5.0
        sal_growth = min(max((role_sal - current_sal) / current_sal, 0), 1.0)

        # RoleScore Formula
        score = (0.40 * demand_score + 0.30 * transferability + 0.20 * safety_score + 0.10 * sal_growth) * 100
        
        results.append({
            "role": role,
            "score": round(score, 1),
            "demand": round(demand_score * 100, 1),
            "transferability": round(transferability * 100, 1),
            "safety": round(safety_score * 100, 1),
            "salary_growth": round(sal_growth * 100, 1),
            "avg_salary": role_sal
        })

    return sorted(results, key=lambda x: x["score"], reverse=True)[:top_n]
