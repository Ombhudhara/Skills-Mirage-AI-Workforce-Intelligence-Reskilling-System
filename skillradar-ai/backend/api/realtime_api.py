"""
Real-Time Layer API — Signal streaming and status
GET /api/realtime/status
GET /api/realtime/signals
"""

from fastapi import APIRouter
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory signal store
_last_signals = {
    "last_refresh": None,
    "signal_changes": [],
}


@router.get("/status")
def get_realtime_status():
    """Get current pipeline refresh status."""
    from main import skillradar_data
    jobs_df = skillradar_data.get("jobs")

    return {
        "status": "active" if jobs_df is not None else "loading",
        "last_refresh": _last_signals.get("last_refresh") or datetime.now().isoformat(),
        "next_refresh_in_seconds": 21600,  # 6 hours
        "data_points": len(jobs_df) if jobs_df is not None else 0,
        "engine": "XGBoost v2.1 Ensemble",
    }


@router.get("/signals")
def get_realtime_signals():
    """Get latest market signal changes for real-time updates."""
    from main import skillradar_data
    from engines.displacement_engine import detect_displacement_risks
    from engines.skill_trends import get_skill_growth

    jobs_df = skillradar_data.get("jobs")

    signals = []
    try:
        if jobs_df is not None and not jobs_df.empty:
            # Displacement signals
            disp = detect_displacement_risks(jobs_df)
            for item in disp.get("watchlist", [])[:3]:
                signals.append({
                    "type": "displacement_alert",
                    "severity": item["severity"],
                    "message": f"{item['role']} hiring declined {item['decline']}%",
                    "timestamp": datetime.now().isoformat(),
                })

            # Skill trend signals
            trends = get_skill_growth(jobs_df, top_n=3)
            for item in trends.get("rising_skills", [])[:2]:
                signals.append({
                    "type": "skill_rising",
                    "severity": "info",
                    "message": f"{item['skill']} demand grew {item['growth']}%",
                    "timestamp": datetime.now().isoformat(),
                })

    except Exception as e:
        logger.error(f"Signal generation error: {e}")

    _last_signals["last_refresh"] = datetime.now().isoformat()
    _last_signals["signal_changes"] = signals

    return {
        "signals": signals,
        "total": len(signals),
        "timestamp": datetime.now().isoformat(),
    }
