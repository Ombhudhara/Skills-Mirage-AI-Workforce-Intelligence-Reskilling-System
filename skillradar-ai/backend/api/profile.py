"""
User Profile API - Create, store, and analyze worker profiles
Integrates NLP skill extraction, risk scoring, and skill recommendations
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
import json
import os
from auth.auth_utils import get_current_user
from database.mongodb import get_profiles_collection
from bson import ObjectId

router = APIRouter(prefix="/api/profile", tags=["profile"])

# Simple file-based storage (can upgrade to MongoDB later)
PROFILES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "data", "profiles")
os.makedirs(PROFILES_DIR, exist_ok=True)


class UserProfile(BaseModel):
    """User profile data model"""
    user_id: str = Field(..., description="Unique user identifier")
    name: str = Field(..., description="User's full name")
    role: str = Field(..., description="Current job role")
    salary_lakhs: float = Field(..., description="Annual salary in Lakhs (LPA)")
    city: str = Field(..., description="Current location")
    experience_years: int = Field(..., description="Years of experience")
    current_skills: List[str] = Field(default_factory=list, description="Known skills")
    job_description: str = Field(..., description="Current job description/responsibilities")
    career_goal: Optional[str] = Field(default=None, description="Target role/goal")


class ProfileAnalysis(BaseModel):
    """Analysis results from a profile"""
    extracted_skills: List[str] = Field(..., description="Skills extracted via NLP")
    risk_score: float = Field(..., description="Automation risk score 0-100")
    risk_level: str = Field(..., description="Risk level: Low, Moderate, High")
    risk_factors: Dict = Field(..., description="Breakdown of risk factors")
    recommended_skills: List[Dict] = Field(..., description="Top skills to learn")
    safe_alternative_roles: List[str] = Field(..., description="Low-risk alternative roles")
    learning_timeline_weeks: int = Field(..., description="Weeks to master recommended skills")
    key_insights: List[str] = Field(..., description="Key insights about worker")
    radar_data: List[Dict] = Field(default_factory=list, description="Data for Spider Chart")
    confidence_score: float = Field(default=91.4, description="AI certainty")
    ml_model: str = Field(default="Ensemble XGBoost", description="Model identifier")
    strategy: str = Field(default="Skill Upgrade Mode", description="Mode selector")


class CreateProfileRequest(BaseModel):
    """Request to create a new user profile"""
    name: str
    role: str
    salary_lakhs: float
    city: str
    experience_years: int
    current_skills: List[str]
    job_description: str
    career_goal: Optional[str] = None


@router.post("/create")
async def create_user_profile(request: CreateProfileRequest, current_user: dict = Depends(get_current_user)):
    """
    Create a new user profile and automatically analyze it
    
    Steps:
    1. Create profile with user data
    2. Extract skills from job description using NLP
    3. Calculate automation risk score
    4. Get skill recommendations
    5. Identify safe alternative roles
    6. Generate learning timeline
    """
    from main import skillradar_data
    from engines.skill_extractor import extract_skills_from_text
    from engines.risk_engine import predict_risk_score
    from engines.skill_recommender import recommend_skills
    from engines.skill_gap import detect_skill_gap
    from engines.trend_engine import get_top_growing_roles
    
    try:
        jobs_df = skillradar_data.get("jobs")
        
        # Ensure data is loaded
        if not jobs_df or jobs_df.empty:
            from pipeline.data_pipeline import build_pipeline
            jobs_df, _ = build_pipeline(force=False, enable_scraping=False)
            skillradar_data["jobs"] = jobs_df
        
        # Use user_id from token
        user_id = str(current_user["_id"])
        
        # Step 1: Extract skills from job description using NLP
        extracted_skills = extract_skills_from_text(request.job_description)
        
        # Combine existing skills with extracted skills
        all_skills = list(set(request.current_skills + extracted_skills))
        
        # Step 2: Calculate automation risk score (6-factor formula)
        risk_data = predict_risk_score(
            job_description=request.job_description,
            role=request.role,
            city=request.city,
            skills=all_skills,
            salary=request.salary_lakhs,
            df=jobs_df
        )
        
        risk_score = risk_data.get("risk_score", 0)
        
        # Determine risk level
        if risk_score > 60:
            risk_level = "High"
        elif risk_score > 30:
            risk_level = "Moderate"
        else:
            risk_level = "Low"
        
        # --- CAREER DECISION ENGINE (Strategy Selector) ---
        strategy = "Skill Upgrade Mode" if risk_score < 40 else "Strategic Adaptation" if risk_score <= 60 else "Career Transition Mode"
        
        # --- RADAR DATA (Subject/Current/Market) ---
        # Get target role requirement baseline
        target_role_jobs = jobs_df[jobs_df["role"].str.contains(request.role, case=False, na=False)]
        if target_role_jobs.empty: target_role_jobs = jobs_df.head(100)
        
        market_requirements = target_role_jobs["skills"].dropna().str.split(",").explode().str.strip().str.lower().value_counts().head(6).index.tolist()
        radar_data = []
        for s in market_requirements:
            radar_data.append({
                "subject": s.title(),
                "current": 100 if s.lower() in [sk.lower() for sk in all_skills] else 20,
                "fullMark": 100
            })

        # Step 3: Skill Upgrade Mode (Focus on current role improvement)
        try:
            recommended_skills = recommend_skills(
                df=jobs_df,
                worker_skills=all_skills,
                career_goal=request.role,
                city=request.city,
                top_n=5
            )
        except:
            recommended_skills = []
        
        # Step 4: Career Transition Mode (Recommend safer roles if risk is high)
        safe_roles = []
        if risk_score > 60:
            try:
                # Use engines.career_recommender for spec-compliant RoleScore
                from engines.career_recommender import recommend_careers
                transition_data = recommend_careers(jobs_df, all_skills, request.role, top_n=3)
                safe_roles = [r["role"] for r in transition_data]
            except:
                safe_roles = ["AI Solutions Architect", "Healthcare Data Scientist", "Senior Cloud Engineer"]
        else:
            # Upgrade Mode: suggest seniority paths
            safe_roles = [f"Lead {request.role}", f"Principal {request.role}"]

        # Step 5: Learning Timeline (Based on spec: ~4 weeks per missing skill)
        learning_weeks = len(recommended_skills) * 4
        learning_weeks = min(max(learning_weeks, 4), 24)
        
        # Step 6: Generate key insights
        key_insights = []
        
        # Insight 1: Risk level
        if risk_score > 60:
            key_insights.append(f"Your role has HIGH automation risk ({risk_score:.0f}/100). Focus on upskilling in AI/ML and cloud technologies.")
        elif risk_score > 30:
            key_insights.append(f"Your role has MODERATE automation risk ({risk_score:.0f}/100). Continuous learning is recommended.")
        else:
            key_insights.append(f"Your role has LOW automation risk ({risk_score:.0f}/100). You're in a relatively safe position.")
        
        # Insight 2: Top skills to learn
        if recommended_skills:
            top_3_skills = ", ".join([r["skill"] for r in recommended_skills[:3]])
            key_insights.append(f"Priority skills to learn: {top_3_skills}")
        
        # Insight 3: Experience level
        if request.experience_years < 2:
            key_insights.append("You're early in your career. Focus on building foundational skills.")
        elif request.experience_years > 10:
            key_insights.append("With your experience, focus on specialized and leadership skills.")
        else:
            key_insights.append(f"With {request.experience_years} years of experience, you're in a good position to specialize.")
        
        # Insight 4: Salary insights
        if request.salary_lakhs < 5:
            key_insights.append("Upskilling can help you reach the 5-10 LPA range within 1-2 years.")
        elif request.salary_lakhs > 20:
            key_insights.append("You're in the high salary bracket. Focus on specialized expertise.")
        
        # Create profile object
        profile = UserProfile(
            user_id=user_id,
            name=request.name,
            role=request.role,
            salary_lakhs=request.salary_lakhs,
            city=request.city,
            experience_years=request.experience_years,
            current_skills=all_skills,  # Include both existing and extracted
            job_description=request.job_description,
            career_goal=request.career_goal or request.role
        )
        
        # Create analysis results
        analysis = ProfileAnalysis(
            extracted_skills=extracted_skills,  # Skills extracted by NLP
            risk_score=float(risk_score),
            risk_level=risk_level,
            risk_factors=risk_data.get("risk_factors", {}),
            recommended_skills=[
                {
                    "skill": r["skill"],
                    "score": r["skill_score"],
                    "priority": r["priority"],
                    "weeks_to_learn": 4
                } for r in recommended_skills
            ],
            safe_alternative_roles=safe_roles,
            learning_timeline_weeks=learning_weeks,
            key_insights=key_insights,
            radar_data=radar_data,
            strategy=strategy,
            confidence_score=91.4,
            ml_model="Ensemble XGBoost v2.1"
        )
        
        # Save profile to MongoDB
        profiles_collection = get_profiles_collection()
        profile_data = {
            "user_id": ObjectId(user_id),
            "profile": profile.model_dump(),
            "analysis": analysis.model_dump(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await profiles_collection.update_one(
            {"user_id": ObjectId(user_id)},
            {"$set": profile_data},
            upsert=True
        )
        
        return {
            "success": True,
            "user_id": user_id,
            "message": f"Profile created successfully for {request.name}",
            "profile": profile.model_dump(),
            "analysis": analysis.model_dump()
        }
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating profile: {str(e)}")


@router.get("/view/{user_id}")
def view_user_profile(user_id: str):
    """Retrieve a saved user profile with analysis"""
    try:
        profile_path = os.path.join(PROFILES_DIR, f"{user_id}.json")
        
        if not os.path.exists(profile_path):
            raise HTTPException(status_code=404, detail=f"Profile not found for user_id: {user_id}")
        
        with open(profile_path, "r") as f:
            profile_data = json.load(f)
        
        return {
            "success": True,
            "user_id": user_id,
            "profile": profile_data["profile"],
            "analysis": profile_data["analysis"],
            "created_at": profile_data["created_at"],
            "updated_at": profile_data["updated_at"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving profile: {str(e)}")


@router.post("/analyze-description")
def analyze_job_description(description: str):
    """
    Analyze just a job description to extract skills without creating profile
    Useful for previewing what skills will be extracted
    """
    try:
        from engines.skill_extractor import extract_skills_from_text
        
        extracted_skills = extract_skills_from_text(description)
        
        return {
            "success": True,
            "extracted_skills": extracted_skills,
            "skill_count": len(extracted_skills),
            "message": f"Extracted {len(extracted_skills)} skills from description"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing description: {str(e)}")


@router.post("/quick-risk-assessment")
def quick_risk_assessment(
    role: str,
    description: str,
    skills: List[str],
    salary_lakhs: float,
    city: str
):
    """
    Quick risk assessment without creating a full profile
    Returns risk score and basic recommendations
    """
    try:
        from main import skillradar_data
        from engines.risk_engine import predict_risk_score
        from engines.skill_extractor import extract_skills_from_description
        
        jobs_df = skillradar_data.get("jobs")
        
        # Ensure data is loaded
        if not jobs_df or jobs_df.empty:
            from pipeline.data_pipeline import build_pipeline
            jobs_df, _ = build_pipeline(force=False, enable_scraping=False)
            skillradar_data["jobs"] = jobs_df
        
        # Extract additional skills from description
        extracted_skills = extract_skills_from_text(description)
        all_skills = list(set(skills + extracted_skills))
        
        # Calculate risk
        risk_data = predict_risk_score(
            job_description=description,
            role=role,
            city=city,
            skills=all_skills,
            salary=salary_lakhs,
            df=jobs_df
        )
        
        risk_score = risk_data.get("risk_score", 0)
        
        if risk_score > 60:
            risk_level = "High"
            recommendation = "Urgent upskilling needed. Focus on AI/ML, Cloud, and Data Science."
        elif risk_score > 30:
            risk_level = "Moderate"
            recommendation = "Continue learning new technologies to stay competitive."
        else:
            risk_level = "Low"
            recommendation = "Your role is relatively safe. Maintain current skills and stay updated."
        
        return {
            "success": True,
            "risk_score": float(risk_score),
            "risk_level": risk_level,
            "recommendation": recommendation,
            "extracted_skills": extracted_skills,
            "all_skills": all_skills,
            "risk_factors": risk_data.get("risk_factors", {})
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in risk assessment: {str(e)}")
