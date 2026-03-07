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
    Recommend the best skills for a worker to develop.
    """
    # Get skill gap for the target role
    gap_data = detect_skill_gap(worker_skills, career_goal, df)
    gap_skills = gap_data["skill_gap"]  # Skills the worker is missing

    # Also consider top trending skills from the market
    from engines.skill_demand import get_top_trending_skills
    trending = [item["skill"] for item in get_top_trending_skills(df, top_n=10)]

    # Combine: gap skills + trending skills the worker doesn't have
    worker_set = {s.lower().strip() for s in worker_skills}
    candidate_skills = list(set(gap_skills + [s for s in trending if s.lower().strip() not in worker_set]))

    # Score each candidate skill
    results = []
    total_target = len(gap_data["required_skills"])
    for skill in candidate_skills:
        # 1. Trend Score (0-1)
        trend_score = get_skill_trend_score(skill, df)

        # 2. Skill Gap relevance: is it in the gap? (1 = in gap, 0 = not)
        skill_gap_flag = 1.0 if skill in gap_skills else 0.0

        # 3. Transferability contribution: after learning this skill,
        #    how much does it improve transfer score?
        new_skills = list(set(worker_skills + [skill]))
        new_gap = detect_skill_gap(new_skills, career_goal, df)
        transferability = new_gap["transfer_score"]

        # SkillScore formula
        skill_score = (
            0.40 * trend_score
            + 0.35 * skill_gap_flag
            + 0.25 * transferability
        )
        skill_score = round(skill_score * 100, 1)

        results.append({
            "skill": skill,
            "skill_score": skill_score,
            "trend_growth_pct": round(trend_score * 100, 1),
            "in_skill_gap": bool(skill_gap_flag),
            "transfer_score_after": round(transferability * 100, 1),
            "priority": "High" if skill_score >= 50 else "Medium" if skill_score >= 25 else "Low",
        })

    return sorted(results, key=lambda x: x["skill_score"], reverse=True)[:top_n]
