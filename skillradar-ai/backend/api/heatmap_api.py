"""
AI Vulnerability Heatmap API
GET /api/vulnerability/heatmap
"""

from fastapi import APIRouter
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/heatmap")
def get_vulnerability_heatmap():
    """Get AI vulnerability heatmap data for role × city matrix."""
    from main import skillradar_data
    from engines.vulnerability_heatmap import generate_heatmap_data

    jobs_df = skillradar_data.get("jobs")
    try:
        result = generate_heatmap_data(jobs_df)
        return result
    except Exception as e:
        logger.error(f"Heatmap error: {e}")
        return {"heatmap": [], "roles": [], "cities": [], "error": str(e)}
