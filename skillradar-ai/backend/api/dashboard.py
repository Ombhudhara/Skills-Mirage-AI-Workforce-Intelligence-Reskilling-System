"""
Dashboard API – Uses real skills_mirage data pipeline.
"""

import logging
from fastapi import APIRouter
from engines.trend_engine import get_top_growing_roles
from engines.skill_demand import get_top_trending_skills
from engines.city_engine import get_top_cities_for_role, get_top_skills_for_city
from engines.course_recommender import recommend_courses, estimate_reskilling_weeks

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/timeline")
def get_reskilling_timeline(city: str = "All India", target_role: str = "Data Scientist"):
    """Get week-by-week reskilling timeline for a city and role."""
    from main import skillradar_data
    from engines.course_recommender import recommend_courses, estimate_reskilling_weeks

    jobs_df = skillradar_data.get("jobs")
    courses_df = skillradar_data.get("courses")

    if jobs_df is None or courses_df is None:
        return {"error": "Pipeline data not loaded"}

    # Filter by city if specified
    df_filtered = jobs_df
    if city and city != "All India":
        df_filtered = df_filtered[df_filtered["city"].str.contains(city, case=False, na=False)]

    # Get required skills for target role
    role_jobs = df_filtered[df_filtered["role"].str.contains(target_role, case=False, na=False)]
    if role_jobs.empty:
        role_jobs = df_filtered[df_filtered["role"].str.contains("Engineer", case=False, na=False)]

    # Extract key skills
    all_role_skills = role_jobs["skills"].dropna().str.split(",").explode().str.strip().str.lower()
    required_skills = all_role_skills.value_counts().head(8).index.tolist()

    # Get courses for these skills
    weekly_timeline = []
    weeks_allocated = 2

    for skill in required_skills[:6]:
        skill_courses = courses_df[
            (courses_df["course_name"].str.contains(skill, case=False, na=False)) |
            (courses_df.get("skills_covered", "").astype(str).str.contains(skill, case=False, na=False))
        ].head(2)

        if not skill_courses.empty:
            for _, course in skill_courses.iterrows():
                weekly_timeline.append({
                    "week": weeks_allocated,
                    "skill": skill.title(),
                    "course_name": str(course.get("course_name", "Unknown")),
                    "provider": str(course.get("provider", "Online")),
                    "duration_weeks": int(course.get("duration_weeks", 4)),
                    "status": "recommended" if weeks_allocated <= 12 else "advanced"
                })
                weeks_allocated += int(course.get("duration_weeks", 4))

                if weeks_allocated > 16:
                    break
        
        if weeks_allocated > 16:
            break

    return {
        "city": city,
        "target_role": target_role,
        "timeline": weekly_timeline,
        "total_weeks": weeks_allocated,
        "required_skills": required_skills,
        "job_count": len(role_jobs)
    }


@router.post("/scrape")
def trigger_live_scrape():
    """Trigger the live Naukri scraper to fetch latest data."""
    try:
        from pipeline.data_pipeline import build_pipeline
        jobs_df, courses_df = build_pipeline(force=True, enable_scraping=True)
        
        # update global store
        from main import skillradar_data
        skillradar_data["jobs"] = jobs_df
        skillradar_data["courses"] = courses_df
        
        return {
            "success": True, 
            "message": "Live scraping completed. Models updated.",
            "data_stats": {
                "total_jobs": len(jobs_df),
                "unique_roles": int(jobs_df["role"].nunique())
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.get("/data")
def get_dashboard_data(city: str = None, role: str = None, time_period: str = "6 Months"):
    """Return dashboard data using real Naukri job data."""
    from main import skillradar_data

    jobs_df = skillradar_data.get("jobs")
    courses_df = skillradar_data.get("courses")

    if jobs_df is None or jobs_df.empty:
        return {"error": "Pipeline data not loaded"}

    # ── Available Filters ─────────────────────────────────────────────
    available_cities = sorted([c for c in jobs_df["city"].unique() if c and str(c) != 'nan'])
    available_roles = sorted([r for r in jobs_df["role"].unique() if r and str(r) != 'nan'])

    # ── Apply Filters ─────────────────────────────────────────────────
    df_filtered = jobs_df
    if city and city != "All India":
        df_filtered = df_filtered[df_filtered["city"].str.contains(city, case=False, na=False)]
    if role and role != "All Roles":
        df_filtered = df_filtered[df_filtered["role"].str.contains(role, case=False, na=False)]
    # ── Hiring trends by Job Role (for the Risk vs Demand chart) ────────
    role_counts = df_filtered.groupby("role").size().nlargest(10).reset_index(name="job_count")
    trends_raw = []
    
    for _, row in role_counts.iterrows():
        role_name = row["role"].title()
        
        # Build direct Naukri search link
        search_city = city if (city and city != "All India") else ""
        query = role_name.lower().replace(" ", "-")
        if search_city:
            job_link = f"https://www.naukri.com/{query}-jobs-in-{search_city.lower().replace(' ', '-')}"
        else:
            job_link = f"https://www.naukri.com/{query}-jobs"

        trends_raw.append({
            "job_title": role_name,
            "demand_score": min(int(row["job_count"] / max(role_counts["job_count"].max(), 1) * 100), 100),
            "ai_automation_signal": _estimate_automation(role_name),
            "job_link": job_link
        })
    
    unique_trends = {}
    for t in trends_raw:
        if t["job_title"] not in unique_trends:
            unique_trends[t["job_title"]] = t
    trends = list(unique_trends.values())

    # ── Smart Hiring Chart Logic ──────────────────────────────────────
    # If a city is picked, show roles. If a role is picked, show cities.
    # Otherwise, default to city view.
    hiring_chart_data = []
    hiring_chart_label = "Hiring by City"
    hiring_chart_key = "city"

    if city and city != "All India":
        # Specific City picked -> show top roles in that city
        temp_counts = df_filtered.groupby("role").size().nlargest(7).reset_index(name="job_count")
        hiring_chart_data = [{"label": row["role"].title(), "openings": int(row["job_count"])} for _, row in temp_counts.iterrows()]
        hiring_chart_label = f"Top Roles in {city}"
        hiring_chart_key = "role"
    elif role and role != "All Roles":
        # Specific Role picked -> show top cities for that role
        temp_counts = df_filtered.groupby("city").size().nlargest(7).reset_index(name="job_count")
        hiring_chart_data = [{"label": row["city"], "openings": int(row["job_count"])} for _, row in temp_counts.iterrows()]
        hiring_chart_label = f"Top Cities for {role}"
        hiring_chart_key = "city"
    else:
        # Global view -> show top cities overall
        city_counts = df_filtered.groupby("city").size().nlargest(7).reset_index(name="job_count")
        hiring_chart_data = [{"label": row["city"], "openings": int(row["job_count"])} for _, row in city_counts.iterrows()]

    # ── Top vulnerable cities (Always based on filtered context) ──────
    city_counts_full = df_filtered.groupby("city").size().nlargest(10).reset_index(name="job_count")
    city_risk = []
    for _, row in city_counts_full.iterrows():
        city_roles = df_filtered[df_filtered["city"] == row["city"]]
        if not city_roles.empty:
            avg_risk = sum(_estimate_automation(r) for r in city_roles["role"].head(50)) / min(len(city_roles), 50)
            city_risk.append({"city": row["city"], "risk": avg_risk})
    
    top_vulnerable_cities = [c["city"] for c in sorted(city_risk, key=lambda x: x["risk"], reverse=True)[:3]]

    # ── Top safe jobs ──────────────────────────────────────────────────
    top_safe_jobs = [t["job_title"] for t in sorted(trends, key=lambda x: x["ai_automation_signal"])[:2]]

    # ── Market insights from engines ───────────────────────────────────
    top_roles = get_top_growing_roles(df_filtered, top_n=5)
    top_skills = get_top_trending_skills(df_filtered, top_n=10)

    # ── Skill demand data ──────────────────────────────────────────────
    all_skills_raw = df_filtered["skills"].dropna().str.split(",").explode().str.strip().str.lower()
    all_skills_raw = all_skills_raw[all_skills_raw.str.len() > 1]
    skill_counts = all_skills_raw.value_counts().head(10)
    
    max_skill_count = skill_counts.max() if not skill_counts.empty else 1
    skills_demand = [{"skill": s.title(), "demand": int(c / max_skill_count * 100)}
                     for s, c in skill_counts.items()]

    # ── Company hiring data ────────────────────────────────────────────────
    company_counts = df_filtered[df_filtered["company"] != "Unknown"]["company"].value_counts().head(10)
    company_data = [
        {"company": company, "postings": int(count)}
        for company, count in company_counts.items()
    ]

    # ── Data stats ─────────────────────────────────────────────────────
    from engines.salary_engine import get_salary_intelligence
    sal_intel = get_salary_intelligence(df_filtered, role, city)
    avg_salary = sal_intel.get("avg_salary", 0) if "error" not in sal_intel else 14.5

    data_stats = {
        "total_jobs": len(df_filtered),
        "total_courses": len(courses_df) if courses_df is not None else 0,
        "unique_roles": int(df_filtered["role"].nunique()),
        "unique_cities": int(df_filtered["city"].nunique()),
        "avg_salary": avg_salary
    }

    # ── Recommended courses based on top roles and city ──────────────────────
    recommended_courses = []
    try:
        if courses_df is not None and not courses_df.empty and trends:
            # Get the top trending role for this city/filter
            top_role = trends[0]["job_title"] if trends else "Data Scientist"
            
            # Get skills needed for the top role in this city
            role_jobs = df_filtered[df_filtered["role"].str.contains(top_role, case=False, na=False)]
            
            if not role_jobs.empty:
                # Extract key skills from role
                all_role_skills = role_jobs["skills"].dropna().str.split(",").explode().str.strip().str.lower()
                top_skills = all_role_skills.value_counts().head(5).index.tolist()
                
                if top_skills:
                    # Use the course recommender engine to get actual courses
                    try:
                        recommended = recommend_courses(
                            courses_df=courses_df,
                            skill_gap=top_skills[:3],
                            available_weeks=12,
                            top_n=6
                        )
                        
                        if recommended:
                            for course in recommended:
                                course_entry = {
                                    "course_name": str(course.get("course_name", "Unknown Course")) if isinstance(course, dict) else str(course),
                                    "platform": str(course.get("provider", "Online")) if isinstance(course, dict) else "Online",
                                    "skill": ", ".join(top_skills[:2]).title() if top_skills else "General",
                                    "duration": f"{course.get('duration_weeks', 4)} weeks" if isinstance(course, dict) else "Self-paced",
                                    "relevance_score": course.get("relevance_score", 85) if isinstance(course, dict) else 85,
                                    "city_specific": f"Trending in {city}" if city and city != "All India" else "Trending Nationally"
                                }
                                recommended_courses.append(course_entry)
                    except Exception as e:
                        logger.warning(f"Course recommender failed: {e}")
                        pass
                        
                # Fallback: Manual course matching
                if not recommended_courses:
                    for skill in top_skills[:3]:
                        skill_courses = courses_df[
                            courses_df["course_name"].str.contains(skill, case=False, na=False) |
                            courses_df.get("skills_covered", "").str.contains(skill, case=False, na=False)
                        ].head(2)
                        
                        for _, course in skill_courses.iterrows():
                            if len(recommended_courses) < 6:
                                recommended_courses.append({
                                    "course_name": str(course.get("course_name", "Unknown Course")),
                                    "platform": str(course.get("provider", "Online")),
                                    "skill": skill.title(),
                                    "duration": f"{int(course.get('duration_weeks', 4))} weeks" if "duration_weeks" in course else "Self-paced",
                                    "relevance_score": 80,
                                    "city_specific": f"Trending in {city}" if city and city != "All India" else "Trending Nationally"
                                })
    except Exception as e:
        logger.warning(f"Course recommendation section failed: {e}")
        pass

    # ── TAB A: Hiring Trends Data ─────────────────────────────────────
    from engines.trend_engine import get_hiring_trends
    hiring_trends = get_hiring_trends(jobs_df, days=int(time_period) if str(time_period).isdigit() else 30)
    
    # ── TAB B: Skills Intelligence Data ────────────────────────────────
    from engines.skill_demand import get_top_rising_skills, get_top_declining_skills, get_skill_gap_map
    rising_skills_data = get_top_rising_skills(df_filtered)
    declining_skills_data = get_top_declining_skills(df_filtered)
    skill_gap_map = get_skill_gap_map(df_filtered, courses_df) if courses_df is not None else []
    
    # ── TAB C: AI Vulnerability Index (Fix 1, 2, 6) ─────────────────────
    from engines.risk_engine import get_automation_risk_index, get_city_risk_heatmap, get_industry_risk_matrix, get_safe_role_by_city
    
    # Calculate Safe Role for selected city (Fix 1)
    safe_market_data = get_safe_role_by_city(jobs_df, city)
    safe_role = safe_market_data["role"]
    safe_score = safe_market_data["score"]

    role_vulnerability = get_automation_risk_index(df_filtered)
    city_vulnerability = get_city_risk_heatmap(df_filtered)
    
    # Calculate overall risk score based on filters (Fix 2)
    risk_level = "Medium"
    if not role_vulnerability:
        risk_level = "Low"
    else:
        avg_risk = sum(r["risk_score"] for r in role_vulnerability[:5]) / min(len(role_vulnerability), 5)
        risk_level = "Critical" if avg_risk > 80 else "High" if avg_risk > 65 else "Medium" if avg_risk > 35 else "Low"

    return {
        "trends": trends[:5],
        "top_vulnerable_cities": top_vulnerable_cities,
        "top_safe_jobs": [safe_role] + top_safe_jobs[:1], # Safe Horizon (Fix 1)
        "top_growing_roles": top_roles,
        "top_trending_skills": top_skills,
        "skills_demand": skills_demand,
        "company_data": company_data,
        "hiring_chart_data": hiring_chart_data,
        "hiring_chart_label": hiring_chart_label,
        "hiring_chart_key": hiring_chart_key,
        "data_stats": data_stats,
        "available_cities": available_cities,
        "available_roles": available_roles,
        "filtered_city": city if city else "All India",
        "filtered_role": role if role else "All Roles",
        "recommended_courses": recommended_courses,
        "time_period": time_period,
        "tab_a_hiring_trends": {
            "city_trends": hiring_trends["city_trends"],
            "role_trends": hiring_trends["role_trends"],
            "sector_trends": hiring_trends["sector_trends"],
            "time_period": time_period
        },
        "tab_b_skills_intelligence": {
            "rising_skills": rising_skills_data,
            "declining_skills": declining_skills_data,
            "skill_gap_map": skill_gap_map
        },
        "tab_c_vulnerability_index": {
            "safe_role": safe_role,
            "safe_score": safe_score,
            "role_vulnerability": role_vulnerability,
            "city_vulnerability": city_vulnerability,
            "industry_risk_matrix": get_industry_risk_matrix(df_filtered),
            "overall_risk": risk_level
        },
        "avg_salary": avg_salary,
        "top_role": trends[0]["job_title"] if trends else "Data Scientist"
    }


def _estimate_automation(role: str) -> int:
    """Simple heuristic automation risk estimate for dashboard display."""
    role_lower = role.lower()
    high_risk = ["data entry", "clerk", "tele", "cashier", "accountant", "receptionist", "typist"]
    medium_risk = ["analyst", "support", "executive", "admin", "assistant"]
    low_risk = ["engineer", "developer", "manager", "architect", "scientist", "doctor", "nurse"]

    for kw in high_risk:
        if kw in role_lower:
            return 85
    for kw in medium_risk:
        if kw in role_lower:
            return 55
    for kw in low_risk:
        if kw in role_lower:
            return 25
    return 50
