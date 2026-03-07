"""
engines/salary_engine.py
Layer 1 – Salary Benchmark Analysis

SalaryGrowth = (TargetSalary - CurrentSalary) / CurrentSalary
"""

import pandas as pd


def get_salary_growth(target_salary: float, current_salary: float) -> float:
    """Calculate salary growth ratio."""
    if current_salary == 0:
        return 0.0
    return round((target_salary - current_salary) / current_salary, 4)


def get_average_salary(df: pd.DataFrame, role: str) -> dict:
    """Calculate average salary min and max for a given role."""
    role_df = df[df["role"].str.lower() == role.lower()]
    if role_df.empty:
        return {"avg_min": 0, "avg_max": 0, "avg_mid": 0}

    avg_min = round(role_df["salary_min"].mean(), 2)
    avg_max = round(role_df["salary_max"].mean(), 2)
    avg_mid = round((avg_min + avg_max) / 2, 2)

    return {
        "role": role,
        "avg_min": avg_min,
        "avg_max": avg_max,
        "avg_mid": avg_mid,
        "salary_range": f"₹{avg_min}–{avg_max} LPA",
    }


def get_salary_benchmarks(df: pd.DataFrame) -> list:
    """Return salary benchmarks for all roles."""
    benchmarks = []
    for role in df["role"].unique():
        benchmarks.append(get_average_salary(df, role))
    return sorted(benchmarks, key=lambda x: x["avg_mid"], reverse=True)


def analyze_salary_feasibility(
    df: pd.DataFrame,
    current_role: str,
    target_salary: float,
) -> dict:
    """
    Compares target salary vs. current role average and market benchmark.
    """
    current_bench = get_average_salary(df, current_role)
    current_avg = current_bench["avg_mid"]
    growth = get_salary_growth(target_salary, current_avg)

    feasibility = "Achievable" if growth <= 1.0 else "Stretch Goal" if growth <= 2.0 else "Very Ambitious"

    return {
        "current_role_avg_salary": current_avg,
        "target_salary": target_salary,
        "salary_growth_ratio": growth,
        "salary_growth_pct": round(growth * 100, 1),
        "feasibility": feasibility,
    }
