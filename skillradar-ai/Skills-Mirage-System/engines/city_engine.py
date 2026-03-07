"""
engines/city_engine.py
Layer 1 – City Intelligence Engine

CDI = Jobs(city, role) / TotalJobs(role)
CityGrowth = ((C_t - C_{t-1}) / C_{t-1}) * 100
"""

import pandas as pd


def get_cdi(city_jobs: float, total_jobs: float) -> float:
    """City Demand Index = jobs in city / total jobs for that role."""
    if total_jobs == 0:
        return 0.0
    return round(city_jobs / total_jobs, 4)


def get_city_growth(current: float, previous: float) -> float:
    """City growth rate between two periods."""
    if previous == 0:
        return 0.0
    return round(((current - previous) / previous) * 100, 2)


def analyze_city_demand(df: pd.DataFrame, role: str) -> dict:
    """
    Returns CDI and city growth rate for all cities for a given role.
    """
    role_df = df[df["role"].str.lower() == role.lower()]
    total_jobs = len(role_df)

    city_stats = {}
    for city in role_df["city"].unique():
        city_df = role_df[role_df["city"] == city]
        city_job_count = len(city_df)
        cdi = get_cdi(city_job_count, total_jobs)

        # City growth across months
        months = sorted(df["month"].unique().tolist())
        if len(months) >= 2:
            prev_m, curr_m = months[-2], months[-1]
            prev_count = len(city_df[city_df["month"] == prev_m])
            curr_count = len(city_df[city_df["month"] == curr_m])
            city_growth = get_city_growth(curr_count, prev_count)
        else:
            city_growth = 0.0

        city_stats[city] = {
            "total_jobs": city_job_count,
            "cdi": cdi,
            "city_growth_rate": city_growth,
            "demand_level": "High" if cdi > 0.3 else "Medium" if cdi > 0.1 else "Low",
        }

    return city_stats


def get_top_cities_for_role(df: pd.DataFrame, role: str, top_n: int = 3) -> list:
    """Return top N cities by CDI for a given role."""
    city_data = analyze_city_demand(df, role)
    sorted_cities = sorted(city_data.items(), key=lambda x: x[1]["cdi"], reverse=True)
    return [
        {"city": city, "cdi": data["cdi"], "total_jobs": data["total_jobs"], "demand": data["demand_level"]}
        for city, data in sorted_cities[:top_n]
    ]


def get_top_skills_for_city(df: pd.DataFrame, city: str, top_n: int = 5) -> list:
    """Return top skills demanded in a specific city."""
    city_df = df[df["city"].str.lower() == city.lower()]
    from collections import Counter
    skill_counter = Counter()
    for skills_str in city_df["skills"].dropna():
        for skill in skills_str.split(","):
            skill_counter[skill.strip()] += 1
    return [{"skill": s, "count": c} for s, c in skill_counter.most_common(top_n)]
