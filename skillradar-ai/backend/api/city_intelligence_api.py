"""
City Intelligence API — Labour market analysis for 20+ cities
GET /api/city/intelligence?city=Pune
GET /api/city/list
"""

from fastapi import APIRouter, Query
from typing import Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

TIER1 = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai"]
TIER2 = ["Pune", "Ahmedabad", "Jaipur", "Kochi", "Chandigarh"]
TIER3 = ["Indore", "Nagpur", "Surat", "Bhopal", "Lucknow", "Patna", "Coimbatore", "Vadodara", "Visakhapatnam", "Nashik"]
ALL_CITIES = TIER1 + TIER2 + TIER3


@router.get("/list")
def get_city_list():
    """Return all supported cities with tier info."""
    return {
        "cities": [
            *[{"city": c, "tier": 1} for c in TIER1],
            *[{"city": c, "tier": 2} for c in TIER2],
            *[{"city": c, "tier": 3} for c in TIER3],
        ],
        "total": len(ALL_CITIES),
    }


@router.get("/intelligence")
def get_city_intelligence(city: str = Query("Bangalore", description="City name")):
    """Get full labour market intelligence for a city."""
    from main import skillradar_data
    from engines.risk_engine import predict_risk_score

    jobs_df = skillradar_data.get("jobs")

    if jobs_df is None or jobs_df.empty:
        return {"city": city, "error": "Data not loaded"}

    try:
        # Filter by city
        if "city" in jobs_df.columns:
            city_df = jobs_df[jobs_df["city"].str.lower().str.contains(city.lower(), na=False)]
        else:
            city_df = jobs_df

        if city_df.empty:
            city_df = jobs_df  # Fallback to all data

        # Top roles
        top_roles = city_df["role"].value_counts().head(10).to_dict()
        top_roles_list = [{"role": r, "count": int(c)} for r, c in top_roles.items()]

        # Top skills
        skills = city_df["skills"].dropna().str.split(",").explode().str.strip().str.lower()
        top_skills = skills.value_counts().head(15).to_dict()
        top_skills_list = [{"skill": s.title(), "count": int(c)} for s, c in top_skills.items()]

        # Hiring trend
        months = sorted(city_df["month"].dropna().unique().tolist())
        hiring_trend = {}
        for m in months[-6:]:
            hiring_trend[m] = int(len(city_df[city_df["month"] == m]))

        # Risk levels by role
        risk_levels = []
        for role in list(top_roles.keys())[:8]:
            role_skills = city_df[city_df["role"] == role]["skills"].dropna().str.split(",").explode().str.strip().tolist()[:5]
            try:
                risk = predict_risk_score(jobs_df, role, role_skills)
                risk_levels.append({"role": role, "risk_score": risk["risk_score"], "risk_level": risk["risk_level"]})
            except Exception:
                risk_levels.append({"role": role, "risk_score": 40, "risk_level": "Medium"})

        tier = 1 if city in TIER1 else 2 if city in TIER2 else 3

        return {
            "city": city,
            "tier": tier,
            "total_jobs": len(city_df),
            "top_roles": top_roles_list,
            "top_skills": top_skills_list,
            "hiring_trend": hiring_trend,
            "risk_levels": risk_levels,
        }

    except Exception as e:
        logger.error(f"City intelligence error: {e}")
        return {"city": city, "error": str(e)}
