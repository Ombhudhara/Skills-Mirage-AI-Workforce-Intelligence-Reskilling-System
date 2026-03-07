"""
Intelligence API – Uses skills_mirage engines for real NLP skill extraction and risk scoring.
Supports both basic and ensemble risk prediction models.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from engines.skill_extractor import get_worker_skill_profile
from engines.risk_engine import predict_risk_score
from engines.skill_gap import detect_skill_gap
from engines.salary_engine import analyze_salary_feasibility

import sys
import os

SKILLS_MIRAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "Skills-Mirage-System")
sys.path.insert(0, SKILLS_MIRAGE_DIR)

try:
    from engines.ensemble_risk_model import EnsembleRiskModel
    ENSEMBLE_AVAILABLE = True
except ImportError:
    ENSEMBLE_AVAILABLE = False

router = APIRouter()


class WorkerProfileRequest(BaseModel):
    job_title: str
    city: str
    experience_years: float
    write_up: str
    use_ensemble: bool = False


@router.post("/evaluate")
def evaluate_worker_profile(profile: WorkerProfileRequest):
    """Evaluate a worker's AI vulnerability using real data engines."""
    from main import skillradar_data

    jobs_df = skillradar_data.get("jobs")

    try:
        # Step 1: Extract skills using NLP engine
        skill_profile = get_worker_skill_profile(profile.write_up)
        extracted_skills = skill_profile.get("extracted_skills", [])

        # Step 2: Predict automation risk
        ensemble_data = None
        if profile.use_ensemble and ENSEMBLE_AVAILABLE and jobs_df is not None and not jobs_df.empty:
            try:
                ensemble_model = EnsembleRiskModel()
                city_cdi = 50.0
                ensemble_result = ensemble_model.predict(
                    job_title=profile.job_title,
                    city=profile.city,
                    experience_years=profile.experience_years,
                    skills=extracted_skills,
                    city_cdi=city_cdi,
                )
                risk_score = ensemble_result.risk_score
                risk_level = ensemble_result.risk_level
                risk_factors = ensemble_result.feature_importance
                ensemble_data = {
                    "confidence": ensemble_result.confidence,
                    "model_predictions": ensemble_result.model_predictions,
                    "model_weights": ensemble_result.model_weights,
                }
            except Exception:
                pass
        
        if ensemble_data is None:
            if jobs_df is not None and not jobs_df.empty:
                risk_data = predict_risk_score(jobs_df, profile.job_title, extracted_skills)
                risk_score = risk_data["risk_score"]
                risk_level = risk_data["risk_level"]
                risk_factors = risk_data.get("factors", {})
            else:
                risk_score = 50
                risk_level = "Medium"
                risk_factors = {"note": "Pipeline data not loaded, using estimate"}

        # Step 3: Determine risk category label
        if risk_score > 70:
            risk_category = "Critical Risk"
        elif risk_score > 40:
            risk_category = "Moderate Risk"
        else:
            risk_category = "Low Risk"

        # Step 4: Primary factor
        primary_factor = "Routine task density in job role"
        if risk_factors:
            top_factor = max(risk_factors, key=risk_factors.get) if isinstance(risk_factors, dict) else ""
            if top_factor:
                primary_factor = f"{top_factor.replace('_', ' ').title()} ({risk_factors[top_factor]:.0f}%)"

        # Step 5: Skill gap analysis (optional)
        skill_gap = []
        if jobs_df is not None and not jobs_df.empty:
            try:
                gap_data = detect_skill_gap(extracted_skills, profile.job_title, jobs_df)
                skill_gap = gap_data.get("skill_gap", [])
            except Exception:
                pass

        # Step 6: Peer Risk Comparison
        from engines.risk_engine import get_automation_risk_index
        all_risks = get_automation_risk_index(jobs_df) if jobs_df is not None else []
        role_risk_data = next((r for r in all_risks if r["role"].lower() in profile.job_title.lower()), None)
        avg_peer_risk = role_risk_data["risk_score"] if role_risk_data else 45.0
        
        percentile = round((risk_score / max(avg_peer_risk * 1.5, 1)) * 100)
        percentile = min(99, max(1, percentile))

        return {
            "extracted_skills": extracted_skills,
            "risk_score": round(risk_score),
            "risk_category": risk_category,
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "primary_factor": primary_factor,
            "skill_gap": skill_gap,
            "ensemble_risk": ensemble_data,
            "model_type": "ensemble" if ensemble_data else "basic",
            "peer_comparison": {
                "avg_peer_risk": round(avg_peer_risk),
                "percentile": percentile,
                "status": "higher_than_peers" if risk_score > avg_peer_risk else "lower_than_peers"
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
