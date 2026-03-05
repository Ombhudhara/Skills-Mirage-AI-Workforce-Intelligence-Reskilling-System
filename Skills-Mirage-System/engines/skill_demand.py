"""
engines/skill_demand.py
Layer 1 – Skill Demand Detection

Formula: SkillGrowth = ((S_t - S_{t-1}) / S_{t-1}) * 100
"""

import pandas as pd
from collections import defaultdict


def extract_skill_counts(df: pd.DataFrame, month: str) -> dict:
    """Count occurrences of each skill in job listings for a given month."""
    month_df = df[df["month"] == month]
    skill_counts = defaultdict(int)
    for skills_str in month_df["skills"].dropna():
        for skill in skills_str.split(","):
            skill_counts[skill.strip()] += 1
    return dict(skill_counts)


def get_skill_growth(current_count: float, previous_count: float) -> float:
    """Calculate skill demand growth rate."""
    if previous_count == 0:
        return 0.0
    return round(((current_count - previous_count) / previous_count) * 100, 2)


def analyze_skill_demand(df: pd.DataFrame) -> dict:
    """
    Analyze skill demand growth month-over-month.
    Returns dict: skill -> {'last_month': count, 'this_month': count, 'growth_rate': %}
    """
    months = sorted(df["month"].unique().tolist())
    if len(months) < 2:
        return {}

    prev_month, curr_month = months[-2], months[-1]
    prev_counts = extract_skill_counts(df, prev_month)
    curr_counts = extract_skill_counts(df, curr_month)

    all_skills = set(prev_counts.keys()) | set(curr_counts.keys())
    results = {}
    for skill in all_skills:
        prev = prev_counts.get(skill, 0)
        curr = curr_counts.get(skill, 0)
        results[skill] = {
            "last_month": prev,
            "this_month": curr,
            "growth_rate": get_skill_growth(curr, prev),
        }

    return results


def get_top_trending_skills(df: pd.DataFrame, top_n: int = 10) -> list:
    """Return top N skills with highest growth rate."""
    demand = analyze_skill_demand(df)
    sorted_skills = sorted(demand.items(), key=lambda x: x[1]["growth_rate"], reverse=True)
    return [
        {
            "skill": skill,
            "growth_rate": data["growth_rate"],
            "this_month": data["this_month"],
        }
        for skill, data in sorted_skills[:top_n]
    ]


def get_skill_trend_score(skill: str, df: pd.DataFrame) -> float:
    """Return normalized trend score (0-1) for a specific skill."""
    demand = analyze_skill_demand(df)
    if skill not in demand:
        return 0.0
    growth = demand[skill]["growth_rate"]
    # Normalize: cap at 100% growth = score 1.0
    return min(max(growth / 100.0, 0.0), 1.0)
