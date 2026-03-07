"""
SkillRadar AI Backend – main.py
Integrates Skills-Mirage-System engines for real Naukri/NPTEL/SWAYAM data processing.
"""

import sys
import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- IMPORTANT: Point to the Consolidated Skills-Mirage-System folder ---
SKILLS_MIRAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Skills-Mirage-System")
sys.path.insert(0, SKILLS_MIRAGE_DIR)

# Now engines/pipeline can be imported correctly from Skills-Mirage-System
from pipeline.data_pipeline import build_pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Global data store (shared with API routes) ─────────────────────────────
skillradar_data = {"jobs": None, "courses": None}


def load_pipeline():
    """Load the skills_mirage data pipeline (Naukri CSVs + courses)."""
    logger.info("Loading Skills-Mirage-System data pipeline...")
    jobs_df, courses_df = build_pipeline(force=False, enable_scraping=False)
    skillradar_data["jobs"] = jobs_df
    skillradar_data["courses"] = courses_df
    logger.info(f"Pipeline loaded: {len(jobs_df) if jobs_df is not None else 0} jobs, {len(courses_df) if courses_df is not None else 0} courses")


import asyncio

async def scheduled_refresh():
    """Background task to refresh data every 6 hours."""
    while True:
        await asyncio.sleep(6 * 3600)  # 6 hours
        logger.info("Executing scheduled pipeline refresh...")
        load_pipeline()

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_pipeline()
    # Start background refresh task
    refresh_task = asyncio.create_task(scheduled_refresh())
    yield
    refresh_task.cancel()
    logger.info("SkillRadar AI API shutting down.")


app = FastAPI(
    title="SkillRadar AI API (Skills-Mirage-System)",
    description="AI-powered workforce intelligence & reskilling system.",
    version="2.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include API routes
from api import dashboard, intelligence, reskilling, chatbot_api, labour_market, profile, analytics
from api import skill_trends_api, skill_gap_api, city_intelligence_api, risk_explainer_api
from api import heatmap_api, displacement_api, employer_api, realtime_api
from auth import auth_routes

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(intelligence.router, prefix="/api/intelligence", tags=["intelligence"])
app.include_router(reskilling.router, prefix="/api/reskilling", tags=["reskilling"])
app.include_router(chatbot_api.router, prefix="/api/chatbot", tags=["chatbot"])
app.include_router(labour_market.router, prefix="/api/labour_market", tags=["labour_market"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(profile.router, tags=["profile"])
app.include_router(auth_routes.router, prefix="/api", tags=["auth"])

# New hackathon module routes
app.include_router(skill_trends_api.router, prefix="/api/skills", tags=["skills"])
app.include_router(skill_gap_api.router, prefix="/api/skills", tags=["skills"])
app.include_router(city_intelligence_api.router, prefix="/api/city", tags=["city"])
app.include_router(risk_explainer_api.router, prefix="/api", tags=["risk"])
app.include_router(heatmap_api.router, prefix="/api/vulnerability", tags=["vulnerability"])
app.include_router(displacement_api.router, prefix="/api/displacement", tags=["displacement"])
app.include_router(employer_api.router, prefix="/api/employer", tags=["employer"])
app.include_router(realtime_api.router, prefix="/api/realtime", tags=["realtime"])


@app.get("/")
def read_root():
    jobs = skillradar_data.get("jobs")
    courses = skillradar_data.get("courses")
    return {
        "message": "SkillRadar AI API v2 – Unified with Skills-Mirage-System",
        "data": {
            "total_jobs": len(jobs) if jobs is not None else 0,
            "total_courses": len(courses) if courses is not None else 0,
        }
    }

# Trigger reload
