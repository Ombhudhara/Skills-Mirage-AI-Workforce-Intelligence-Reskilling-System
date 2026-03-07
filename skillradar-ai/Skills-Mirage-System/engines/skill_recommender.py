"""
engines/skill_recommender.py
Layer 2 – Skill Recommendation Engine

SkillScore = 0.40*TrendScore + 0.35*SkillGap + 0.25*Transferability
"""

import pandas as pd
from typing import List
from engines.skill_demand import get_skill_trend_score
from engines.skill_gap import detect_skill_gap


def recommend_skills(
    df: pd.DataFrame,
    worker_skills: List[str],
    career_goal: str,
    city: str,
    top_n: int = 5,
) -> list:
    """
    Recommend best skills using the weighted formula:
    SkillScore = 0.40*MarketDemand + 0.30*SkillGap + 0.20*SalaryImpact + 0.10*SkillGraphCentrality
    """
    # 1. Market Demand (Frequency of skill in jobs)
    all_skills_series = df["skills"].dropna().str.split(",").explode().str.strip().str.lower()
    skill_counts = all_skills_series.value_counts()
    max_count = skill_counts.max() if not skill_counts.empty else 1

    # Get skill gap for target role
    gap_data = detect_skill_gap(worker_skills, career_goal, df)
    gap_skills = [s.lower() for s in gap_data["skill_gap"]]
    required_skills = [s.lower() for s in gap_data["required_skills"]]

    # Potential candidates: missing skills from target role OR top trending skills
    from engines.skill_demand import get_top_trending_skills
    trending = [item["skill"].lower() for item in get_top_trending_skills(df, top_n=15)]
    worker_set = {s.lower().strip() for s in worker_skills}
    
    candidate_skills = list(set(gap_skills + [s for s in trending if s not in worker_set]))
    
    results = []
    for skill in candidate_skills:
        # A. Market Demand (0-1)
        market_demand = skill_counts.get(skill, 0) / max_count

        # B. Skill Gap (1.0 if in target role's required skills but missing, 0.5 if just trending)
        skill_gap_score = 1.0 if skill in gap_skills else 0.5

        # C. Salary Impact (Average salary of jobs containing this skill vs baseline)
        avg_sal_with_skill = df[df["skills"].str.lower().str.contains(skill, na=False)]["salary_avg"].mean()
        avg_sal_overall = df["salary_avg"].mean()
        salary_impact = min(max((avg_sal_with_skill - avg_sal_overall) / max(avg_sal_overall, 1), 0), 1) if not pd.isna(avg_sal_with_skill) else 0.2

        # D. Skill Graph Centrality (How many unique roles require this skill / Total unique roles)
        roles_with_skill = df[df["skills"].str.lower().str.contains(skill, na=False)]["role"].nunique()
        total_roles = df["role"].nunique()
        centrality = roles_with_skill / total_roles if total_roles > 0 else 0

        # SkillScore Formula
        skill_score = (
            0.40 * market_demand +
            0.30 * skill_gap_score +
            0.20 * salary_impact +
            0.10 * centrality
        ) * 100

        results.append({
            "skill": skill.title(),
            "skill_score": round(skill_score, 1),
            "market_demand": round(market_demand * 100, 1),
            "salary_impact": round(salary_impact * 100, 1),
            "centrality": round(centrality * 100, 1),
            "priority": "High" if skill_score >= 60 else "Medium" if skill_score >= 35 else "Low"
        })

    return sorted(results, key=lambda x: x["skill_score"], reverse=True)[:top_n]
