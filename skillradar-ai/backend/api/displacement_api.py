"""
Displacement Early Warning API
GET /api/displacement/watchlist
"""

from fastapi import APIRouter, Query
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/watchlist")
def get_displacement_watchlist(threshold: float = Query(-25, description="Decline threshold %")):
    """Get displacement early warning watchlist."""
    from main import skillradar_data
    from engines.displacement_engine import detect_displacement_risks

    jobs_df = skillradar_data.get("jobs")
    try:
        result = detect_displacement_risks(jobs_df, threshold=threshold)
        return result
    except Exception as e:
        logger.error(f"Displacement warning error: {e}")
        return {"watchlist": [], "alert_count": 0, "error": str(e)}
