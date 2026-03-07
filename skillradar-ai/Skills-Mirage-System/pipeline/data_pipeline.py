"""
pipeline/data_pipeline.py
Unified data pipeline for Skills Mirage.
Integrates:
  1. Real Naukri CSV datasets (datasets/ from Skills-Mirage-AI-Workforce-Intelligence-Reskilling-System-main)
  2. Live Naukri scraper (optional, graceful fallback)
  3. Fallback mock data (data/jobs.csv)
  4. Real NPTEL + SWAYAM course CSVs + PMKVY fallback from data/courses.csv
Outputs:
  - data/jobs_processed.csv  (normalized jobs)
  - data/courses_processed.csv (normalized courses)
Returns (jobs_df, courses_df) ready for engine consumption.
"""

import os
import logging
import pandas as pd
from datetime import datetime, timedelta

from pipeline.preprocessor import normalize_naukri_df

logger = logging.getLogger(__name__)

# ── Paths ──────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Real datasets moved to our local data/ folder
NAUKRI_DS1 = os.path.join(BASE_DIR, "data", "NaukriData_Data Science.csv")
NAUKRI_DS2 = os.path.join(BASE_DIR, "data", "NaukriData_data analytics.csv")
NAUKRI_DS3 = os.path.join(BASE_DIR, "data", "Naukri_Data_Scientist_and_Data_Analytics_Jobs_Data.csv")
NPTEL_CSV  = os.path.join(BASE_DIR, "data", "nptel_courses.csv")
SWAYAM_CSV = os.path.join(BASE_DIR, "data", "swayam_courses.csv")

# Fallback / local files
LOCAL_JOBS_CSV    = os.path.join(BASE_DIR, "data", "jobs.csv")
LOCAL_COURSES_CSV = os.path.join(BASE_DIR, "data", "courses.csv")

# Outputs
PROCESSED_JOBS_CSV    = os.path.join(BASE_DIR, "data", "jobs_processed.csv")
PROCESSED_COURSES_CSV = os.path.join(BASE_DIR, "data", "courses_processed.csv")

# Cache: regenerate processed files if older than this
CACHE_TTL_HOURS = 24


# ── Helpers ────────────────────────────────────────────────────────────────
def _is_stale(path: str, ttl_hours: int = CACHE_TTL_HOURS) -> bool:
    """Return True if file doesn't exist or is older than ttl_hours."""
    if not os.path.exists(path):
        return True
    age = datetime.now() - datetime.fromtimestamp(os.path.getmtime(path))
    return age > timedelta(hours=ttl_hours)


def _load_naukri_csv(path: str, sample_rows: int = 5000) -> pd.DataFrame:
    """Load a Naukri CSV with encoding fallback and row sampling."""
    for enc in ("utf-8", "latin1", "cp1252"):
        try:
            df = pd.read_csv(path, nrows=sample_rows, encoding=enc)
            logger.info(f"Loaded {len(df)} rows from {os.path.basename(path)} (enc={enc})")
            return df
        except Exception:
            continue
    logger.warning(f"Could not load {path}")
    return pd.DataFrame()


# ── Course pipeline ────────────────────────────────────────────────────────
def _build_courses_df() -> pd.DataFrame:
    """
    Merge NPTEL + SWAYAM (real CSVs) with the local PMKVY/mock courses.csv.
    Normalizes to: course_name, provider, skills_covered, duration_weeks, rating
    """
    dfs = []

    # 1. Load NPTEL
    if os.path.exists(NPTEL_CSV):
        nptel = pd.read_csv(NPTEL_CSV)
        nptel = nptel.rename(columns={"platform": "provider"})
        nptel["skills_covered"] = nptel.get("skill_category", "General")
        nptel["rating"] = 4.5
        dfs.append(nptel[["course_name", "provider", "skills_covered", "duration_weeks", "rating"]])
        logger.info(f"Loaded {len(nptel)} NPTEL courses")

    # 2. Load SWAYAM
    if os.path.exists(SWAYAM_CSV):
        swayam = pd.read_csv(SWAYAM_CSV)
        swayam = swayam.rename(columns={"platform": "provider"})
        swayam["skills_covered"] = swayam.get("skill_category", "General")
        swayam["rating"] = 4.3
        dfs.append(swayam[["course_name", "provider", "skills_covered", "duration_weeks", "rating"]])
        logger.info(f"Loaded {len(swayam)} SWAYAM courses")

    # 3. Load local PMKVY / mock courses (fallback / supplement)
    if os.path.exists(LOCAL_COURSES_CSV):
        local = pd.read_csv(LOCAL_COURSES_CSV)
        if "provider" not in local.columns and "provider" not in local.columns:
            local["provider"] = "PMKVY"
        dfs.append(local[["course_name", "provider", "skills_covered", "duration_weeks", "rating"]])

    if not dfs:
        logger.warning("No course data found – returning empty DataFrame")
        return pd.DataFrame(columns=["course_name", "provider", "skills_covered", "duration_weeks", "rating"])

    courses_df = pd.concat(dfs, ignore_index=True).drop_duplicates(subset=["course_name"])
    courses_df["duration_weeks"] = pd.to_numeric(courses_df["duration_weeks"], errors="coerce").fillna(8).astype(int)
    courses_df["rating"] = pd.to_numeric(courses_df["rating"], errors="coerce").fillna(4.3)
    return courses_df


# ── Jobs pipeline ──────────────────────────────────────────────────────────
# Additional Dataset Paths
PLFS_CSV = os.path.join(BASE_DIR, "data", "plfs_workforce.csv")
WEF_CSV  = os.path.join(BASE_DIR, "data", "wef_future_jobs.csv")

def _build_jobs_df(enable_scraping: bool = False) -> pd.DataFrame:
    """
    Build unified job market dataset using the TWO-LAYER processing order:
    offline_datasets + live_scraped_jobs -> clean -> merged_job_market_dataset.
    """
    dfs = []

    # 1. Load historical/offline Naukri CSVs
    for naukri_path in [NAUKRI_DS1, NAUKRI_DS2, NAUKRI_DS3]:
        if os.path.exists(naukri_path):
            raw = _load_naukri_csv(naukri_path, sample_rows=5000)
            if not raw.empty:
                normed = normalize_naukri_df(raw)
                dfs.append(normed)

    # 2. Load workforce signals (PLFS, WEF)
    if os.path.exists(PLFS_CSV):
        plfs = pd.read_csv(PLFS_CSV)
        logger.info(f"Loaded PLFS workforce signals: {len(plfs)} sectors")
        # We use PLFS for sector-level baseline analysis

    if os.path.exists(WEF_CSV):
        wef = pd.read_csv(WEF_CSV)
        logger.info(f"Loaded WEF Future of Jobs signals: {len(wef)} roles")

    # 3. Live Scraping (Naukri + LinkedIn)
    if enable_scraping:
        try:
            from pipeline.naukri_scraper import scrape_naukri
            scraped_jobs = scrape_naukri()
            if scraped_jobs:
                sdf = pd.DataFrame(scraped_jobs)
                sdf = sdf.rename(columns={"job_title": "Job_Titles", "skills_text": "Skills", "experience_text": "Experience_Required"})
                sdf["Post_Time"] = "1 Day Ago"
                dfs.append(normalize_naukri_df(sdf))
                logger.info(f"Merged {len(scraped_jobs)} live jobs from scraper")
        except Exception as e:
            logger.warning(f"Scraping failed: {e}")

    # 4. Mandatory Merge & Clean
    if not dfs:
        return pd.DataFrame()

    jobs_df = pd.concat(dfs, ignore_index=True)
    
    # SPECS: Deduplication
    jobs_df = jobs_df.drop_duplicates(subset=["role", "company", "city"], keep="first")

    # SPECS Cleaning: Remove invalid cities and 'Other'
    jobs_df = jobs_df.dropna(subset=["city"])
    invalid_cities = ["Other", "N/A", "nan", "Anywhere", "Remote"]
    jobs_df = jobs_df[~jobs_df["city"].str.lower().isin([c.lower() for c in invalid_cities])]

    # SPECS Analysis Pre-load: Pre-calculate salary_avg
    jobs_df["salary_min"] = pd.to_numeric(jobs_df["salary_min"], errors="coerce").fillna(5).astype(float)
    jobs_df["salary_max"] = pd.to_numeric(jobs_df["salary_max"], errors="coerce").fillna(10).astype(float)
    jobs_df["salary_avg"] = (jobs_df["salary_min"] + jobs_df["salary_max"]) / 2

    # Map WEF risk signals into the jobs dataframe for specific roles
    if os.path.exists(WEF_CSV):
        wef_map = wef.set_index("role")["automation_risk_2027"].to_dict()
        jobs_df["wef_risk"] = jobs_df["role"].map(wef_map).fillna(0.5)

    logger.info(f"Merged Job Market Dataset created: {len(jobs_df)} unique records")
    return jobs_df


# ── Public API ─────────────────────────────────────────────────────────────
def build_pipeline(force: bool = False, enable_scraping: bool = False):
    """
    Build or load cached jobs + courses dataframes.

    Args:
        force: If True, rebuild even if cache is fresh.
        enable_scraping: If True, attempt live Naukri scraping.

    Returns:
        (jobs_df, courses_df)
    """
    jobs_stale    = force or _is_stale(PROCESSED_JOBS_CSV)
    courses_stale = force or _is_stale(PROCESSED_COURSES_CSV)

    if jobs_stale:
        logger.info("Building jobs pipeline from source data...")
        jobs_df = _build_jobs_df(enable_scraping=enable_scraping)
        os.makedirs(os.path.dirname(PROCESSED_JOBS_CSV), exist_ok=True)
        jobs_df.to_csv(PROCESSED_JOBS_CSV, index=False)
        logger.info(f"Saved {len(jobs_df)} jobs → {PROCESSED_JOBS_CSV}")
    else:
        logger.info("Loading cached jobs_processed.csv...")
        jobs_df = pd.read_csv(PROCESSED_JOBS_CSV)

    if courses_stale:
        logger.info("Building courses pipeline from source data...")
        courses_df = _build_courses_df()
        courses_df.to_csv(PROCESSED_COURSES_CSV, index=False)
        logger.info(f"Saved {len(courses_df)} courses → {PROCESSED_COURSES_CSV}")
    else:
        logger.info("Loading cached courses_processed.csv...")
        courses_df = pd.read_csv(PROCESSED_COURSES_CSV)

    return jobs_df, courses_df
