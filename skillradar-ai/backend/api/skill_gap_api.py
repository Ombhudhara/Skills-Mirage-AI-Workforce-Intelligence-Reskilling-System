"""
Skill Gap API — Demand vs Training Supply
GET /api/skills/gap
"""

from fastapi import APIRouter, Query
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/gap")
def get_skill_gap(top_n: int = Query(30, description="Number of skills to return")):
    """Get skill demand vs training supply gap analysis."""
    from main import skillradar_data
    from engines.skill_gap_intelligence import compute_demand_supply_gap

    jobs_df = skillradar_data.get("jobs")
    courses_df = skillradar_data.get("courses")
    try:
        result = compute_demand_supply_gap(jobs_df, courses_df, top_n=top_n)
        return {"skill_gap": result}
    except Exception as e:
        logger.error(f"Skill gap error: {e}")
        return {"skill_gap": [], "error": str(e)}
