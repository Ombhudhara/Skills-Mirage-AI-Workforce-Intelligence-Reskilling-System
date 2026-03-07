"""
engines/course_recommender.py
Layer 2 – Course Recommendation Engine

CourseScore = 0.50*SkillCoverage + 0.30*DurationFit + 0.20*CourseRating
"""

import pandas as pd
from typing import List


def recommend_courses(
    courses_df: pd.DataFrame,
    skill_gap: List[str],
    available_weeks: int = 12,
    top_n: int = 3,
) -> list:
    """
    Recommend best courses to close the worker's skill gap.
    """
    if not skill_gap:
        return []

    gap_set = {s.lower().strip() for s in skill_gap}
    results = []

    for _, course in courses_df.iterrows():
        course_skills = [s.strip() for s in str(course["skills_covered"]).split(",")]
        course_skills_lower = {s.lower() for s in course_skills}

        # 1. Skill Coverage = how many gap skills does this course address?
        covered = len(gap_set & course_skills_lower)
        skill_coverage = round(covered / len(gap_set), 4) if gap_set else 0.0

        # 2. Duration Fit: closer to available_weeks → better fit
        duration = int(course["duration_weeks"])
        if duration <= available_weeks:
            duration_fit = 1.0 - (abs(available_weeks - duration) / available_weeks)
        else:
            duration_fit = max(0.0, 1.0 - ((duration - available_weeks) / available_weeks))
        duration_fit = round(duration_fit, 4)

        # 3. Course Rating normalized to 0-1 (rating scale: 0-5)
        rating_score = round(float(course["rating"]) / 5.0, 4)

        # CourseScore formula
        course_score = (
            0.50 * skill_coverage
            + 0.30 * duration_fit
            + 0.20 * rating_score
        )
        course_score = round(course_score * 100, 1)

        results.append({
            "course_name": course["course_name"],
            "provider": course["provider"],
            "skills_covered": course_skills,
            "duration_weeks": duration,
            "rating": float(course["rating"]),
            "course_score": course_score,
            "gap_skills_covered": [s for s in course_skills if s.lower() in gap_set],
        })

    return sorted(results, key=lambda x: x["course_score"], reverse=True)[:top_n]


def estimate_reskilling_weeks(recommended_courses: list) -> int:
    """Estimate total reskilling duration based on recommended courses (with overlap)."""
    if not recommended_courses:
        return 0
    max_duration = max(c["duration_weeks"] for c in recommended_courses)
    total = sum(c["duration_weeks"] for c in recommended_courses)
    # Assume 40% of courses can be taken in parallel
    return round(max_duration + total * 0.6)
