"""
engines/trend_engine.py
Layer 1 – Job Trend Detection

Formula: GrowthRate = ((J_t - J_{t-1}) / J_{t-1}) * 100
"""

import pandas as pd


def get_growth_rate(current: float, previous: float) -> float:
    """Calculate percentage growth rate between two periods."""
    if previous == 0:
        return 0.0
    return round(((current - previous) / previous) * 100, 2)


def analyze_job_trends(df: pd.DataFrame) -> dict:
    """
    Analyze job count growth by role across months.
    Expected columns: role, month, (row per listing)
    Returns a dict: role -> {'jan': count, 'feb': count, 'growth_rate': %}
    """
    trends = {}
    role_month = df.groupby(["role", "month"]).size().reset_index(name="count")

    for role in role_month["role"].unique():
        role_data = role_month[role_month["role"] == role].sort_values("month")
        counts = role_data["count"].tolist()
        months = role_data["month"].tolist()

        if len(counts) >= 2:
            growth = get_growth_rate(counts[-1], counts[-2])
        else:
            growth = 0.0

        trends[role] = {
            "monthly_counts": dict(zip(months, counts)),
            "growth_rate": growth,
            "trend": "Growing" if growth > 10 else "Stable" if growth >= 0 else "Declining",
        }

    return trends


def get_top_growing_roles(df: pd.DataFrame, top_n: int = 5) -> list:
    """Return top N roles with highest job growth rate."""
    trends = analyze_job_trends(df)
    sorted_roles = sorted(trends.items(), key=lambda x: x[1]["growth_rate"], reverse=True)
    return [
        {"role": role, "growth_rate": data["growth_rate"], "trend": data["trend"]}
        for role, data in sorted_roles[:top_n]
    ]
