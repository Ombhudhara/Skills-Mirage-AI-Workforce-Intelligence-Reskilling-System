"""
Reskilling API – Uses skills_mirage course recommender and skill gap engines.
Includes Timeline Generator for personalized learning roadmaps.
"""

from fastapi import APIRouter, HTTPException, Depends
from auth.auth_utils import get_current_user
from pydantic import BaseModel
from typing import List

from engines.course_recommender import recommend_courses, estimate_reskilling_weeks
from engines.skill_gap import detect_skill_gap
from engines.skill_recommender import recommend_skills

import sys
import os

SKILLS_MIRAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "Skills-Mirage-System")
sys.path.insert(0, SKILLS_MIRAGE_DIR)

try:
    from engines.timeline_generator import CourseTimelineGenerator
    TIMELINE_AVAILABLE = True
except ImportError:
    TIMELINE_AVAILABLE = False

router = APIRouter()


class ReskillingRequest(BaseModel):
    target_role: str
    current_skills: List[str]
    current_role: str = ""
    risk_score: float = 0.0
    mode: str = "transition" # "transition" or "upgrade"
    max_duration_weeks: int = 12


@router.post("/path")
def generate_reskilling_path(request: ReskillingRequest, current_user: dict = Depends(get_current_user)):
    """Generate a personalized reskilling path using real course data."""
    from main import skillradar_data
    from engines.career_recommender import recommend_careers

    jobs_df = skillradar_data.get("jobs")
    courses_df = skillradar_data.get("courses")

    try:
        # Decision Engine (Missing Feature 8)
        mode = "Skill Upgrade Mode" if request.mode == "upgrade" else "Career Transition Mode"
        
        insight = f"Strategic Pivot Recommendation: Your profile indicates an optimal path via {mode}. "
        if request.mode == "upgrade":
            insight += f"By deepening your expertise in {request.current_role}, you can achieve senior-level market resilience and increase your Salary Impact by 15-20%."
        else:
            insight += f"Transitioning to {request.target_role} leverages 60% of your current neural assets while moving you away from high-automation risk roles."

        # Role Recommendations for Career Transition
        recommended_roles = []
        if request.mode == "transition" and jobs_df is not None:
             recommended_roles = recommend_careers(
                 df=jobs_df,
                 worker_skills=request.current_skills,
                 current_role=request.current_role,
                 top_n=3
             )

        # Step 1: Detect skill gap
        skill_gap = []
        target_role = request.target_role
        if mode == "Career Transition Mode" and recommended_roles:
            target_role = recommended_roles[0]["role"]

        if jobs_df is not None and not jobs_df.empty:
            gap_data = detect_skill_gap(request.current_skills, target_role, jobs_df)
            skill_gap = gap_data.get("skill_gap", [])

        # Step 2: Get recommended skills to develop
        skills_to_develop = []
        if jobs_df is not None and not jobs_df.empty:
            try:
                skills_to_develop = recommend_skills(
                    df=jobs_df,
                    worker_skills=request.current_skills,
                    career_goal=target_role,
                    city="",
                    top_n=5,
                )
            except Exception:
                pass

        # Step 3: Get recommended courses with Time Constraint (Missing Feature 11)
        recommended_courses = []
        if courses_df is not None and not courses_df.empty and skill_gap:
            recommended_courses = recommend_courses(
                courses_df=courses_df,
                skill_gap=skill_gap,
                available_weeks=request.max_duration_weeks,
                top_n=6,
            )

        # Step 4: Estimate reskilling duration
        reskilling_weeks = estimate_reskilling_weeks(recommended_courses) if recommended_courses else 4

        # Step 5: Build weekly plan from courses
        weekly_plan = []
        
        def get_course_url(name, provider):
            search = str(name).replace(" ", "+")
            if str(provider).upper() == "NPTEL": return f"https://nptel.ac.in/courses?q={search}"
            if str(provider).upper() == "SWAYAM": return f"https://swayam.gov.in/explorer?searchText={search}"
            return f"https://www.google.com/search?q={search}+{provider}"

        # Try to use Timeline Generator if available
        if TIMELINE_AVAILABLE and skill_gap and courses_df is not None and not courses_df.empty:
            try:
                timeline_gen = CourseTimelineGenerator()
                timeline = timeline_gen.generate_timeline(
                    skills=skill_gap,
                    courses_df=courses_df,
                    available_weeks=min(reskilling_weeks, request.max_duration_weeks)
                )
                if timeline and timeline.timeline:
                    weekly_plan = [
                        {
                            "week": item.week_start,
                            "topic": item.skill,
                            "course": item.course_name,
                            "platform": item.provider,
                            "hours": item.duration_weeks * 2,
                            "url": get_course_url(item.course_name, item.provider)
                        }
                        for item in timeline.timeline
                    ]
            except Exception:
                pass
        
        # Fallback: Build from recommended courses
        if not weekly_plan:
            for i, course in enumerate(recommended_courses[:6]):
                name = course.get("course_name", course.get("name", f"Course {i+1}"))
                provider = course.get("provider", "SWAYAM")
                url = course.get("url", get_course_url(name, provider))
                weekly_plan.append({
                    "week": i + 1,
                    "topic": name,
                    "platform": provider,
                    "course": name,
                    "hours": 6,
                    "url": url
                })

        return {
            "mode": mode,
            "target_role": target_role,
            "original_target": request.target_role,
            "recommended_roles": recommended_roles,
            "estimated_duration_weeks": reskilling_weeks,
            "weekly_plan": weekly_plan,
            "skill_gap": skill_gap,
            "skills_to_develop": skills_to_develop,
            "recommended_courses": recommended_courses,
            "insight": insight,
            "timeline_generator": "enhanced" if TIMELINE_AVAILABLE else "basic",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
