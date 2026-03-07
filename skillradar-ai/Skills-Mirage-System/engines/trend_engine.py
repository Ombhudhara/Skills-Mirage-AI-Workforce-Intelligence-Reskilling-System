from datetime import datetime, timedelta
import pandas as pd
import numpy as np

def calculate_growth(current: int, previous: int) -> float:
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return round(((current - previous) / previous) * 100, 1)

def get_filtered_df(df: pd.DataFrame, days: int) -> pd.DataFrame:
    if "posting_date" not in df.columns:
        return df
    
    # Use 2026-03-06 as today based on current state
    today = datetime(2026, 3, 6)
    cutoff = today - timedelta(days=days)
    
    df["posting_date"] = pd.to_datetime(df["posting_date"], errors="coerce")
    return df[df["posting_date"] >= cutoff]

def get_hiring_trends(df: pd.DataFrame, days: int = 30) -> dict:
    """
    Calculates GrowthRate = (CurrentJobs − PreviousJobs) / PreviousJobs
    across City, Role, and Sector.
    """
    current_df = get_filtered_df(df, days)
    # Define previous window
    prev_cutoff_start = datetime(2026, 3, 6) - timedelta(days=days*2)
    prev_cutoff_end = datetime(2026, 3, 6) - timedelta(days=days)
    
    df["posting_date"] = pd.to_datetime(df["posting_date"], errors="coerce")
    previous_df = df[(df["posting_date"] >= prev_cutoff_start) & (df["posting_date"] < prev_cutoff_end)]

    trends = {
        "city_trends": [],
        "role_trends": [],
        "sector_trends": []
    }

    # City Trends
    cities = df["city"].unique()
    for city in cities:
        curr = len(current_df[current_df["city"] == city])
        prev = len(previous_df[previous_df["city"] == city])
        growth = calculate_growth(curr, prev)
        trends["city_trends"].append({
            "name": city,
            "growth": growth,
            "count": curr,
            "status": "up" if growth > 0 else "down"
        })

    # Role Trends
    roles = df["role"].unique()
    for role in roles:
        curr = len(current_df[current_df["role"] == role])
        prev = len(previous_df[previous_df["role"] == role])
        growth = calculate_growth(curr, prev)
        trends["role_trends"].append({
            "name": role,
            "growth": growth,
            "count": curr,
            "status": "up" if growth > 0 else "down"
        })

    # Sector Trends
    if "industry" in df.columns:
        sectors = df["industry"].unique()
        for sector in sectors:
            curr = len(current_df[current_df["industry"] == sector])
            prev = len(previous_df[previous_df["industry"] == sector])
            growth = calculate_growth(curr, prev)
            trends["sector_trends"].append({
                "name": str(sector),
                "growth": growth,
                "count": curr,
                "status": "up" if growth > 0 else "down"
            })

    # Sort each by growth
    for key in trends:
        trends[key] = sorted(trends[key], key=lambda x: abs(x["growth"]), reverse=True)[:10]

    return trends


def get_top_growing_roles(df: pd.DataFrame, top_n: int = 5) -> list:
    """
    Identifies roles with the highest month-over-month growth.
    """
    months = sorted(df["month"].dropna().unique().tolist())
    if len(months) < 2:
        # Fallback to simple counts if only 1 month
        counts = df["role"].value_counts().head(top_n).to_dict()
        return [{"role": k.title(), "growth": "0%", "count": int(v)} for k, v in counts.items()]

    prev_month, curr_month = months[-2], months[-1]
    
    curr_counts = df[df["month"] == curr_month]["role"].value_counts()
    prev_counts = df[df["month"] == prev_month]["role"].value_counts()
    
    growth_data = []
    for role in curr_counts.index:
        curr = curr_counts[role]
        prev = prev_counts.get(role, 0)
        
        if prev > 0:
            growth = ((curr - prev) / prev) * 100
        else:
            growth = 100.0 if curr > 0 else 0.0
            
        growth_data.append({
            "role": role.title(),
            "growth": f"{round(growth, 1)}%",
            "growth_val": growth,
            "count": int(curr)
        })
        
    growth_data.sort(key=lambda x: x["growth_val"], reverse=True)
    return growth_data[:top_n]
