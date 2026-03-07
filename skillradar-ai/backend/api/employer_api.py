"""
Employer Skill Gap API
GET /api/employer/skill-gap?city=Ahmedabad
"""

from fastapi import APIRouter, Query
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/skill-gap")
def get_employer_skill_gap(city: str = Query("All India", description="City name")):
    """Get employer skill gap intelligence for a city."""
    from main import skillradar_data
    from engines.employer_intelligence import compute_employer_gap

    jobs_df = skillradar_data.get("jobs")
    courses_df = skillradar_data.get("courses")
    try:
        result = compute_employer_gap(jobs_df, courses_df, city=city)
        return result
    except Exception as e:
        logger.error(f"Employer gap error: {e}")
        return {"city": city, "skills": [], "error": str(e)}
