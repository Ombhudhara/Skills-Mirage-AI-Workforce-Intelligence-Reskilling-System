"""
main.py – Skills Mirage FastAPI Application

POST /analyze
Takes worker profile → returns risk score, career paths,
skill gap, recommended skills, and courses.
"""

import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from engines.skill_extractor import get_worker_skill_profile
from engines.risk_engine import predict_risk_score
from engines.skill_gap import detect_skill_gap
from engines.career_recommender import recommend_careers
from engines.skill_recommender import recommend_skills
from engines.course_recommender import recommend_courses, estimate_reskilling_weeks
from engines.salary_engine import analyze_salary_feasibility
from engines.city_engine import get_top_cities_for_role, get_top_skills_for_city
from engines.trend_engine import get_top_growing_roles
from engines.skill_demand import get_top_trending_skills

# ── Load data ──────────────────────────────────────────────────────────────
JOBS_PATH = "data/jobs.csv"
COURSES_PATH = "data/courses.csv"

jobs_df = pd.read_csv(JOBS_PATH)
courses_df = pd.read_csv(COURSES_PATH)

app = FastAPI(
    title="Skills Mirage – Intelligence API",
    description="AI-powered workforce intelligence & reskilling system",
    version="1.0.0",
)


# ── Request Schema ──────────────────────────────────────────────────────────
class WorkerProfile(BaseModel):
    current_role: str
    city: str
    experience: int
    career_goal: str
    target_salary: float          # in LPA (e.g., 8.0)
    work_description: str


# ── Response Schemas ────────────────────────────────────────────────────────
class AnalysisResponse(BaseModel):
    worker_skills: list
    risk_score: float
    risk_level: str
    risk_factors: dict
    salary_analysis: dict
    career_paths: list
    skill_gap: list
    skills_to_develop: list
    recommended_courses: list
    reskilling_weeks: int
    city_insights: dict
    market_insights: dict


# ── Endpoints ───────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "message": "Welcome to Skills Mirage Intelligence API",
        "docs": "/docs",
        "analyze_endpoint": "POST /analyze",
    }


@app.post("/analyze", response_model=AnalysisResponse)
def analyze_worker(profile: WorkerProfile):
    """
    Full intelligence pipeline for a worker profile.
    Returns risk score, career paths, skill gap, skills to develop, and courses.
    """
    try:
        # Step 1: Extract worker skills from description
        skill_profile = get_worker_skill_profile(profile.work_description)
        worker_skills = skill_profile["extracted_skills"]

        # Step 2: Automation risk prediction
        risk_data = predict_risk_score(jobs_df, profile.current_role, worker_skills)

        # Step 3: Salary analysis
        salary_analysis = analyze_salary_feasibility(
            jobs_df, profile.current_role, profile.target_salary
        )

        # Step 4: Career recommendations
        career_paths = recommend_careers(
            df=jobs_df,
            worker_skills=worker_skills,
            current_role=profile.current_role,
            career_goal=profile.career_goal,
            current_salary=salary_analysis["current_role_avg_salary"],
            target_salary=profile.target_salary,
            city=profile.city,
        )

        # Step 5: Skill gap for the top career goal
        gap_data = detect_skill_gap(worker_skills, profile.career_goal, jobs_df)
        skill_gap = gap_data["skill_gap"]

        # Step 6: Skills to develop
        skills_to_develop = recommend_skills(
            df=jobs_df,
            worker_skills=worker_skills,
            career_goal=profile.career_goal,
            city=profile.city,
            top_n=5,
        )

        # Step 7: Course recommendations
        recommended_courses = recommend_courses(
            courses_df=courses_df,
            skill_gap=skill_gap,
            available_weeks=12,
            top_n=3,
        )

        reskilling_weeks = estimate_reskilling_weeks(recommended_courses)

        # Step 8: City insights
        top_cities = get_top_cities_for_role(jobs_df, profile.career_goal)
        city_skills = get_top_skills_for_city(jobs_df, profile.city)
        city_insights = {
            "top_cities_for_goal": top_cities,
            "top_skills_in_your_city": city_skills,
        }

        # Step 9: Market insights
        top_roles = get_top_growing_roles(jobs_df, top_n=3)
        top_skills = get_top_trending_skills(jobs_df, top_n=5)
        market_insights = {
            "top_growing_roles": top_roles,
            "top_trending_skills": top_skills,
        }

        return AnalysisResponse(
            worker_skills=worker_skills,
            risk_score=risk_data["risk_score"],
            risk_level=risk_data["risk_level"],
            risk_factors=risk_data["factors"],
            salary_analysis=salary_analysis,
            career_paths=career_paths[:3],     # Top 3 career paths
            skill_gap=skill_gap,
            skills_to_develop=skills_to_develop,
            recommended_courses=recommended_courses,
            reskilling_weeks=reskilling_weeks,
            city_insights=city_insights,
            market_insights=market_insights,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/market/trends")
def get_market_trends():
    """Return current job market trends."""
    return {
        "top_growing_roles": get_top_growing_roles(jobs_df, top_n=5),
        "top_trending_skills": get_top_trending_skills(jobs_df, top_n=10),
    }


@app.get("/city/{city}/skills")
def get_city_skills(city: str):
    """Return top in-demand skills for a specific city."""
    return {
        "city": city,
        "top_skills": get_top_skills_for_city(jobs_df, city, top_n=8),
    }
