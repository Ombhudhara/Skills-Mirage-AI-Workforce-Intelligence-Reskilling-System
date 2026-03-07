"""
engines/skill_gap.py
Layer 2 – Skill Gap Detection & Transferability Score

SkillGap = TargetSkills - WorkerSkills
TransferScore = SharedSkills / TotalTargetSkills
"""

import pandas as pd
from typing import List


# Known required skills per role (from job market data)
ROLE_REQUIRED_SKILLS = {
    "Data Analyst": ["Python", "SQL", "Excel", "PowerBI", "Data Analytics", "Statistics"],
    "Digital Marketing Specialist": ["SEO", "Google Analytics", "Marketing Strategy", "Content Marketing", "Social Media"],
    "Customer Success Manager": ["CRM", "Account Management", "Communication", "Data Analytics"],
    "Customer Support": ["Communication", "CRM", "Problem Solving"],
    "BPO Executive": ["Communication", "CRM", "Data Entry"],
    "Sales Analytics": ["CRM", "Sales Analytics", "Excel", "PowerBI"],
    "CRM Management": ["CRM", "Email Marketing", "Marketing Strategy"],
}


def get_required_skills(role: str, df: pd.DataFrame = None) -> List[str]:
    """Get required skills for a role from static map or job data."""
    # Try to get from live data first
    if df is not None:
        role_df = df[df["role"].str.lower() == role.lower()]
        if not role_df.empty:
            skill_counts = {}
            for skills_str in role_df["skills"].dropna():
                for skill in skills_str.split(","):
                    s = skill.strip()
                    skill_counts[s] = skill_counts.get(s, 0) + 1
            # Return top skills (those appearing in >30% of listings)
            threshold = max(1, len(role_df) * 0.3)
            top_skills = [s for s, c in skill_counts.items() if c >= threshold]
            if top_skills:
                return top_skills

    # Fallback to static map
    role_title = role.title()
    for key in ROLE_REQUIRED_SKILLS:
        if key.lower() == role.lower():
            return ROLE_REQUIRED_SKILLS[key]
    return ROLE_REQUIRED_SKILLS.get(role_title, [])


def detect_skill_gap(worker_skills: List[str], target_role: str, df: pd.DataFrame = None) -> dict:
    """
    Returns:
    - required_skills: what the target role needs
    - matched_skills: skills worker already has
    - skill_gap: skills the worker is missing
    - transfer_score: SharedSkills / TotalTargetSkills
    """
    required = get_required_skills(target_role, df)
    worker_set = {s.lower().strip() for s in worker_skills}
    required_set = {s.lower().strip() for s in required}

    matched = [s for s in required if s.lower().strip() in worker_set]
    gap = [s for s in required if s.lower().strip() not in worker_set]

    total_required = len(required)
    shared = len(matched)
    transfer_score = round(shared / total_required, 4) if total_required > 0 else 0.0

    recommendation = "Recommended Transition" if transfer_score >= 0.4 else "Significant Upskilling Needed"

    return {
        "target_role": target_role,
        "required_skills": required,
        "matched_skills": matched,
        "skill_gap": gap,
        "transfer_score": transfer_score,
        "recommendation": recommendation,
    }
