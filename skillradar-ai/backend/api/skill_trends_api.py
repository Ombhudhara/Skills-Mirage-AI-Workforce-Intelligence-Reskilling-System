"""
Skill Trends API — Rising vs Declining Skills
GET /api/skills/trends
"""

from fastapi import APIRouter, Query
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/trends")
def get_skill_trends(top_n: int = Query(20, description="Number of top skills")):
    """Get top rising and declining skills based on job postings."""
    from main import skillradar_data
    from engines.skill_trends import get_skill_growth

    jobs_df = skillradar_data.get("jobs")
    try:
        result = get_skill_growth(jobs_df, top_n=top_n)
        return result
    except Exception as e:
        logger.error(f"Skill trends error: {e}")
        return {"rising_skills": [], "declining_skills": [], "error": str(e)}
