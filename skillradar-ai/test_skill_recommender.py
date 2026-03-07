#!/usr/bin/env python
"""Test skill recommender directly"""
import sys
import os

# Add skills_mirage to path
SKILLS_MIRAGE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "skills_mirage")
sys.path.insert(0, SKILLS_MIRAGE_DIR)

from pipeline.data_pipeline import build_pipeline
from engines.skill_recommender import recommend_skills

jobs_df, courses_df = build_pipeline(force=False, enable_scraping=False)

print(f"Jobs loaded: {len(jobs_df)} records")
print(f"Data Analyst role count: {len(jobs_df[jobs_df['role'].str.lower().str.contains('data analyst', na=False)])}")

recommendations = recommend_skills(
    df=jobs_df,
    worker_skills=['SQL', 'Excel', 'PowerBI'],
    career_goal='Data Analyst',
    city='Bangalore',
    top_n=5
)

print(f"\nSkill Recommendations for Data Analyst:")
for rec in recommendations[:5]:
    print(f"  - {rec['skill']}: {rec['skill_score']} (Priority: {rec['priority']})")
