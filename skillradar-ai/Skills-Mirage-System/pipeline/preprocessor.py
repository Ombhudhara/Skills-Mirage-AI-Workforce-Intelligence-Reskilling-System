"""
pipeline/preprocessor.py
Normalizes raw Naukri CSV data into the standard schema used by all engines:
  role, city, salary_min, salary_max, skills, experience, description,
  industry, posting_date, month
"""

import re
import pandas as pd
import numpy as np


# --- Column name mappings from Naukri CSVs ---
NAUKRI_COL_MAP = {
    "Job_Titles":           "role",
    "Company_Names":        "company",
    "Experience_Required":  "experience_raw",
    "Skills":               "skills",
    "Post_Url":             "url",
    "Post_Time":            "posting_date_raw",
    # data analytics CSV sometimes has these
    "Job Title":            "role",
    "Company Names":        "company",
    "Experience":           "experience_raw",
    "Key Skills":           "skills",
}

# Role classification → industry mapping
ROLE_INDUSTRY_MAP = {
    "data scientist":           "IT",
    "data analyst":             "IT",
    "data analytics":           "IT",
    "machine learning":         "IT",
    "ai engineer":              "IT",
    "business analyst":         "IT",
    "software engineer":        "IT",
    "digital marketing":        "Marketing",
    "marketing":                "Marketing",
    "customer support":         "BPO",
    "bpo":                      "BPO",
    "customer success":         "IT",
    "sales":                    "Sales",
    "hr":                       "HR",
    "finance":                  "Finance",
}

# City extraction keywords
MAJOR_CITIES = [
    "Bangalore", "Bengaluru", "Mumbai", "Delhi", "Hyderabad",
    "Pune", "Chennai", "Kolkata", "Ahmedabad", "Noida",
    "Gurgaon", "Gurugram", "Indore", "Jaipur", "Chandigarh",
    "Lucknow", "Kochi", "Visakhapatnam", "Surat", "Vadodara",
    "Nagpur", "Ranchi", "Thiruvananthapuram", "Bhopal", "Coimbatore",
    "Nashik", "Aurangabad", "Amritsar", "Ludhiana", "Guwahati",
]


def _extract_experience_years(exp_str: str) -> tuple:
    """Parse '4-8 Yrs' or '2 Yrs' → (min_exp, max_exp)."""
    if pd.isna(exp_str):
        return (0, 5)
    nums = re.findall(r"\d+", str(exp_str))
    if len(nums) >= 2:
        return (int(nums[0]), int(nums[1]))
    elif len(nums) == 1:
        v = int(nums[0])
        return (v, v)
    return (0, 5)


def _extract_city(text: str) -> str:
    """Try to find a major Indian city in a text string."""
    if pd.isna(text):
        return "Unknown"
    text_lower = str(text).lower()
    for city in MAJOR_CITIES:
        if city.lower() in text_lower:
            return city
    return "Other"


def _classify_industry(role: str) -> str:
    """Map role name to industry."""
    role_lower = str(role).lower()
    for key, industry in ROLE_INDUSTRY_MAP.items():
        if key in role_lower:
            return industry
    return "IT"


def _normalize_posting_date(date_str: str) -> tuple:
    """Parse '1 Day Ago', '7 Days Ago' → (posting_date_str, month_str)."""
    if pd.isna(date_str):
        return ("2026-02-01", "Feb")
    s = str(date_str).lower()
    if "day" in s:
        return ("2026-02-15", "Feb")
    if "week" in s:
        return ("2026-02-01", "Feb")
    if "month" in s:
        return ("2026-01-15", "Jan")
    return ("2026-02-01", "Feb")


def normalize_naukri_df(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize a raw Naukri CSV dataframe into our standard schema.
    """
    # Rename known columns
    df = df.rename(columns={k: v for k, v in NAUKRI_COL_MAP.items() if k in df.columns})

    # Ensure 'role' column exists
    if "role" not in df.columns:
        df["role"] = "Data Analyst"

    # Extract experience
    if "experience_raw" in df.columns:
        exp_parsed = df["experience_raw"].apply(_extract_experience_years)
        df["experience"] = exp_parsed.apply(lambda x: int((x[0] + x[1]) / 2))
    else:
        df["experience"] = 2

    # City detection (check url, role, description)
    url_col = "url" if "url" in df.columns else None
    if url_col:
        df["city"] = df[url_col].apply(_extract_city)
        # Fallback: check role string
        no_city_mask = df["city"] == "Other"
        df.loc[no_city_mask, "city"] = df.loc[no_city_mask, "role"].apply(_extract_city)
    else:
        df["city"] = "Bangalore"  # Sensible default for Data Science jobs

    # Skills: keep as-is if present, else empty
    if "skills" not in df.columns:
        df["skills"] = ""
    df["skills"] = df["skills"].fillna("").astype(str)

    # Industry
    df["industry"] = df["role"].apply(_classify_industry)

    # Salary (not in Naukri CSV → estimate from experience)
    df["salary_min"] = df["experience"].apply(lambda e: max(4, e * 1.5))
    df["salary_max"] = df["experience"].apply(lambda e: max(8, e * 2.5))

    # Posting date & month
    date_col = "posting_date_raw" if "posting_date_raw" in df.columns else None
    if date_col:
        parsed_dates = df[date_col].apply(_normalize_posting_date)
        df["posting_date"] = parsed_dates.apply(lambda x: x[0])
        df["month"] = parsed_dates.apply(lambda x: x[1])
    else:
        df["posting_date"] = "2026-02-01"
        df["month"] = "Feb"

    # Description: use skills text as description proxy
    df["description"] = df["skills"]

    # Keep only standard columns
    standard_cols = [
        "role", "city", "salary_min", "salary_max",
        "skills", "experience", "description",
        "industry", "posting_date", "month", "company"
    ]
    return df[[c for c in standard_cols if c in df.columns]].copy()
