#!/usr/bin/env python
"""Debug chatbot data loading"""
import sys
import os

SKILLS_MIRAGE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "skills_mirage")
sys.path.insert(0, SKILLS_MIRAGE_DIR)

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))
sys.path.insert(0, os.getcwd())

# Load data the way the backend does
from pipeline.data_pipeline import build_pipeline
jobs_df, courses_df = build_pipeline(force=False, enable_scraping=False)

# Now test skillradar_data
try:
    import importlib.util
    backend_main_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "main.py")
    spec = importlib.util.spec_from_file_location("backend_main", backend_main_path)
    backend_main = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(backend_main)
    skillradar_data = backend_main.skillradar_data
    print(f"skillradar_data keys: {skillradar_data.keys()}")
    print(f"skillradar_data['jobs'] is None: {skillradar_data['jobs'] is None}")
except Exception as e:
    print(f"Error loading skillradar_data: {e}")
    import traceback
    traceback.print_exc()

# Test the actual recommendation flow
from engines.skill_recommender import recommend_skills
from engines.skill_gap import detect_skill_gap

print("\nTesting skill gap detection...")
gap = detect_skill_gap(
    ["SQL", "Excel", "PowerBI"],
    "Data Analyst",
    jobs_df
)
print(f"Skill gap detected: {gap['skill_gap'][:3]}")

print("\nTesting skill recommender...")
recs = recommend_skills(
    df=jobs_df,
    worker_skills=["SQL", "Excel", "PowerBI"],
    career_goal="Data Analyst",
    city="Bangalore",
    top_n=5
)
print(f"Recommendations: {len(recs)}")
for r in recs[:3]:
    print(f"  - {r['skill']}: {r['skill_score']}")
