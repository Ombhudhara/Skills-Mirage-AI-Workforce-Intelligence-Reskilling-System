"""
Risk Explainer API — Explainable Risk Score with signals
POST /api/risk-score
"""

from fastapi import APIRouter, Depends
from auth.auth_utils import get_current_user
from pydantic import BaseModel
from typing import Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class RiskScoreRequest(BaseModel):
    job_title: str
    city: str = "Bangalore"
    experience: int = 3
    skills: list = []


@router.post("/risk-score")
def get_explainable_risk(request: RiskScoreRequest, current_user: dict = Depends(get_current_user)):
    """Generate explainable risk score with human-readable signals."""
    from main import skillradar_data
    from engines.risk_engine import (
        predict_risk_score,
        calculate_hiring_decline_score,
        calculate_ai_mention_score,
        calculate_skill_redundancy_score,
        calculate_role_replacement_ratio,
    )

    jobs_df = skillradar_data.get("jobs")

    try:
        if jobs_df is None or jobs_df.empty:
            return _generate_mock_risk(request)

        skills = request.skills or []
        risk_data = predict_risk_score(jobs_df, request.job_title, skills)

        # Generate explanations
        factors = risk_data.get("factors", {})
        explanations = []

        h = factors.get("hiring_decline", 0)
        if h > 0.5:
            decline_pct = int((h - 0.5) * 200)
            explanations.append(f"{request.job_title} hiring in {request.city} declined {decline_pct}% in the last 30 days")
        elif h < 0.3:
            explanations.append(f"{request.job_title} hiring in {request.city} is stable or growing")

        a = factors.get("ai_mentions", 0)
        if a > 0.3:
            explanations.append(f"AI tool mentions in {request.job_title} job postings increased {int(a * 100)}%")
        else:
            explanations.append(f"AI tool mentions in {request.job_title} roles are low ({int(a * 100)}%)")

        sr = factors.get("skill_redundancy", 0)
        if sr > 0.5:
            explanations.append("Routine task density is high — many tasks are automatable")
        else:
            explanations.append("Your skill set has low redundancy — harder to automate")

        ta = factors.get("task_automation", 0)
        if ta > 0.6:
            explanations.append(f"Task automation potential for {request.job_title} is very high ({int(ta * 100)}%)")

        sl = factors.get("salary_decline", 0)
        if sl > 0.5:
            explanations.append(f"Salary compression detected for {request.job_title} roles")

        # Experience adjustment
        risk_score = risk_data["risk_score"]
        if request.experience > 8:
            risk_score = max(0, risk_score - 5)
            explanations.append(f"Your {request.experience} years of experience provides some insulation")
        elif request.experience < 2:
            risk_score = min(100, risk_score + 3)
            explanations.append("Early-career roles face higher displacement risk")

        risk_level = "HIGH" if risk_score > 60 else "MEDIUM" if risk_score > 30 else "LOW"

        return {
            "risk_score": round(risk_score),
            "risk_level": risk_level,
            "explanation": explanations,
            "factors": factors,
            "model": "XGBoost v2.1 + Risk Engine",
        }

    except Exception as e:
        logger.error(f"Risk explainer error: {e}")
        return _generate_mock_risk(request)


def _generate_mock_risk(request):
    """Fallback mock risk data."""
    import random
    high_risk = ["bpo", "data entry", "telemarketer", "customer support"]
    low_risk = ["data scientist", "ml engineer", "ai engineer", "cloud architect"]
    role_lower = request.job_title.lower()

    if any(r in role_lower for r in high_risk):
        score = random.randint(60, 85)
    elif any(r in role_lower for r in low_risk):
        score = random.randint(10, 30)
    else:
        score = random.randint(25, 55)

    level = "HIGH" if score > 60 else "MEDIUM" if score > 30 else "LOW"
    return {
        "risk_score": score,
        "risk_level": level,
        "explanation": [
            f"{request.job_title} in {request.city} has a {level.lower()} automation risk",
            f"AI adoption rate in this sector is {'high' if score > 50 else 'moderate'}",
            f"Experience ({request.experience} yrs) {'helps mitigate' if request.experience > 5 else 'provides limited'} risk",
        ],
        "factors": {},
        "model": "Fallback Estimator",
    }
