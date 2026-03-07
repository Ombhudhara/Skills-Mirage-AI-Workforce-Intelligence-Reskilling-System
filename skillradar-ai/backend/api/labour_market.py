"""
Labour Market Intelligence API - Layer 1
Exposes labour market insights: hiring trends, skill demand, city demand, salary benchmarks
"""

from fastapi import APIRouter, Query
from typing import Optional, List
from pydantic import BaseModel
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/hiring-trends")
def get_hiring_trends(
    role: Optional[str] = Query(None, description="Filter by job role"),
    city: Optional[str] = Query(None, description="Filter by city"),
    months: int = Query(6, description="Number of months to analyze")
):
    """
    Layer 1 - Hiring Trend Detection
    Formula: GrowthRate = (CurrentJobs - PreviousJobs) / PreviousJobs × 100
    """
    from main import skillradar_data
    jobs_df = skillradar_data.get("jobs")
    
    if jobs_df is None or jobs_df.empty:
        return {"error": "No job data available"}
    
    df = jobs_df.copy()
    
    if role:
        df = df[df["role"].str.contains(role, case=False, na=False)]
    if city:
        df = df[df["city"].str.contains(city, case=False, na=False)]
    
    months_list = sorted(df["month"].dropna().unique().tolist())
    if len(months_list) < 2:
        return {"error": "Insufficient months of data"}
    
    months_list = months_list[-months:]
    
    trends = []
    for i, month in enumerate(months_list):
        count = len(df[df["month"] == month])
        growth = 0
        if i > 0:
            prev_count = len(df[df["month"] == months_list[i-1]])
            if prev_count > 0:
                growth = round(((count - prev_count) / prev_count) * 100, 2)
        trends.append({
            "month": month,
            "job_count": count,
            "growth_rate": growth
        })
    
    if len(trends) >= 2:
        overall_growth = round(((trends[-1]["job_count"] - trends[0]["job_count"]) / max(trends[0]["job_count"], 1)) * 100, 2)
    else:
        overall_growth = 0
    
    role_counts = df["role"].value_counts().head(10).to_dict()
    
    return {
        "period": f"Last {len(months_list)} months",
        "overall_growth_rate": overall_growth,
        "total_jobs": len(df),
        "monthly_trends": trends,
        "top_roles": role_counts,
        "formula": "GrowthRate = (CurrentJobs - PreviousJobs) / PreviousJobs × 100"
    }


@router.get("/skill-demand")
def get_skill_demand(
    role: Optional[str] = Query(None, description="Filter by job role"),
    city: Optional[str] = Query(None, description="Filter by city"),
    top_n: int = Query(10, description="Number of top skills to return")
):
    """
    Layer 1 - Skill Demand Analysis
    Formula: SkillGrowth = (CurrentMentions - PreviousMentions) / PreviousMentions × 100
    """
    from main import skillradar_data
    from engines.skill_demand import get_top_trending_skills
    
    jobs_df = skillradar_data.get("jobs")
    
    if jobs_df is None or jobs_df.empty:
        return {"error": "No job data available"}
    
    df = jobs_df.copy()
    
    if role:
        df = df[df["role"].str.contains(role, case=False, na=False)]
    if city:
        df = df[df["city"].str.contains(city, case=False, na=False)]
    
    skills_data = get_top_trending_skills(df, top_n=top_n)
    
    months_list = sorted(df["month"].dropna().unique().tolist())
    if len(months_list) >= 2:
        curr_month = months_list[-1]
        prev_month = months_list[-2]
        
        curr_skills = {}
        prev_skills = {}
        
        for _, row in df[df["month"] == curr_month].iterrows():
            if isinstance(row.get("skills"), str):
                for s in row["skills"].split(","):
                    s = s.strip().lower()
                    if s:
                        curr_skills[s] = curr_skills.get(s, 0) + 1
        
        for _, row in df[df["month"] == prev_month].iterrows():
            if isinstance(row.get("skills"), str):
                for s in row["skills"].split(","):
                    s = s.strip().lower()
                    if s:
                        prev_skills[s] = prev_skills.get(s, 0) + 1
        
        skill_growth = []
        for skill in list(curr_skills.keys())[:top_n]:
            curr_count = curr_skills.get(skill, 0)
            prev_count = prev_skills.get(skill, 0)
            if prev_count > 0:
                growth = round(((curr_count - prev_count) / prev_count) * 100, 2)
            else:
                growth = 100 if curr_count > 0 else 0
            skill_growth.append({
                "skill": skill.title(),
                "current_mentions": curr_count,
                "previous_mentions": prev_count,
                "growth_rate": growth
            })
        
        skill_growth.sort(key=lambda x: x["growth_rate"], reverse=True)
    else:
        skill_growth = []
    
    return {
        "period": f"Month-over-month analysis",
        "top_skills": skills_data,
        "skill_growth": skill_growth,
        "total_jobs_analyzed": len(df),
        "formula": "SkillGrowth = (CurrentMentions - PreviousMentions) / PreviousMentions × 100"
    }


@router.get("/city-demand")
def get_city_demand(
    role: Optional[str] = Query(None, description="Filter by job role"),
    top_n: int = Query(10, description="Number of top cities to return")
):
    """
    Layer 1 - City Demand Intelligence
    Formula: CDI = Jobs(city, role) / TotalJobs(role)
    """
    from main import skillradar_data
    from engines.city_engine import get_top_cities_for_role, get_cdi
    
    jobs_df = skillradar_data.get("jobs")
    
    if jobs_df is None or jobs_df.empty:
        return {"error": "No job data available"}
    
    df = jobs_df.copy()
    
    if role:
        df = df[df["role"].str.contains(role, case=False, na=False)]
    
    total_jobs = len(df)
    city_counts = df["city"].value_counts().head(top_n).to_dict()
    
    city_demand = []
    for city, count in city_counts.items():
        cdi = round(count / total_jobs, 4) if total_jobs > 0 else 0
        city_demand.append({
            "city": city,
            "job_count": int(count),
            "cdi": cdi,
            "demand_percentage": round(cdi * 100, 2)
        })
    
    top_cities = get_top_cities_for_role(jobs_df, role or "Data Analyst")
    
    return {
        "role_filter": role or "All Roles",
        "total_jobs": total_jobs,
        "city_demand": city_demand,
        "top_cities": top_cities,
        "formula": "CDI = Jobs(city, role) / TotalJobs(role)"
    }


@router.get("/salary-intelligence")
def get_salary_intelligence_report(role: Optional[str] = Query("All Roles"), city: Optional[str] = Query("All India")):
    """
    Layer 1 - Advanced Salary Intelligence.
    Returns dynamic salary metrics and chart data from the live dataset.
    """
    from main import skillradar_data
    from engines.salary_engine import get_salary_intelligence
    
    jobs_df = skillradar_data.get("jobs")
    if jobs_df is None or jobs_df.empty:
        return {"error": "No job data available"}
    
    return get_salary_intelligence(jobs_df, role, city)


@router.get("/automation-risk")
def get_automation_risk(
    role: Optional[str] = Query(None, description="Filter by job role"),
    city: Optional[str] = Query(None, description="Filter by city")
):
    """
    Layer 1 - Automation Risk Overview
    Returns aggregated risk metrics for roles
    """
    from main import skillradar_data
    from engines.risk_engine import calculate_hiring_decline_score, calculate_ai_mention_score, calculate_industry_automation_index
    
    jobs_df = skillradar_data.get("jobs")
    
    if jobs_df is None or jobs_df.empty:
        return {"error": "No job data available"}
    
    df = jobs_df.copy()
    
    if role:
        df = df[df["role"].str.contains(role, case=False, na=False)]
    if city:
        df = df[df["city"].str.contains(city, case=False, na=False)]
    
    roles = df["role"].value_counts().head(10).index.tolist()
    
    risk_data = []
    for r in roles:
        h = calculate_hiring_decline_score(df, r)
        a = calculate_ai_mention_score(df, r)
        i = calculate_industry_automation_index(r)
        
        risk_score = (0.25 * h + 0.20 * a + 0.20 * 0.5 + 0.15 * i + 0.10 * 0.5 + 0.10 * 0.5) * 100
        
        risk_data.append({
            "role": r,
            "risk_score": round(risk_score, 1),
            "hiring_decline": round(h * 100, 1),
            "ai_mentions": round(a * 100, 1),
            "industry_automation": round(i * 100, 1)
        })
    
    risk_data.sort(key=lambda x: x["risk_score"], reverse=True)
    
    return {
        "period": "Current",
        "roles_analyzed": len(roles),
        "risk_analysis": risk_data,
        "formula": "RiskScore = 0.25*H + 0.20*A + 0.20*SR + 0.15*I + 0.10*SL + 0.10*TA"
    }


@router.get("/market-summary")
def get_market_summary():
    """
    Layer 1 - Complete Market Summary
    Returns all labour market intelligence in one call
    """
    from main import skillradar_data
    from engines.trend_engine import get_top_growing_roles
    from engines.skill_demand import get_top_trending_skills
    from engines.city_engine import get_top_cities_for_role
    
    jobs_df = skillradar_data.get("jobs")
    
    if jobs_df is None or jobs_df.empty:
        return {"error": "No job data available"}
    
    return {
        "total_jobs": len(jobs_df),
        "unique_roles": int(jobs_df["role"].nunique()),
        "unique_cities": int(jobs_df["city"].nunique()),
        "top_growing_roles": get_top_growing_roles(jobs_df, top_n=5),
        "top_trending_skills": get_top_trending_skills(jobs_df, top_n=10),
        "top_cities": get_top_cities_for_role(jobs_df, "Data Analyst")[:5]
    }
