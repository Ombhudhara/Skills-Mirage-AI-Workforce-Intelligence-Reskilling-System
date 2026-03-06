import os
import pandas as pd
from scraping.naukri_scraper import scrape_jobs


def _load_local_datasets():
    """
    Load all Naukri CSV datasets from the datasets/ folder
    and normalize them into a unified format.
    """
    datasets_dir = "datasets"
    all_jobs = []

    if not os.path.isdir(datasets_dir):
        print("[WARNING] datasets/ folder not found. Skipping local data.")
        return []

    for filename in os.listdir(datasets_dir):
        if not filename.endswith(".csv"):
            continue

        filepath = os.path.join(datasets_dir, filename)
        try:
            df = pd.read_csv(filepath)
        except Exception as e:
            print(f"[WARNING] Could not read {filename}: {e}")
            continue

        # Normalize column names (different CSVs use different naming)
        col_map = {}
        for col in df.columns:
            lower = col.lower().strip()
            if "title" in lower and "job" in lower:
                col_map[col] = "job_title"
            elif "company" in lower:
                col_map[col] = "company"
            elif "location" in lower:
                col_map[col] = "location"
            elif "skill" in lower:
                col_map[col] = "skills"

        df = df.rename(columns=col_map)

        # Keep only relevant columns that exist
        keep_cols = [c for c in ["job_title", "company", "location", "skills"] if c in df.columns]
        if not keep_cols or "job_title" not in keep_cols:
            continue

        df = df[keep_cols].copy()
        df["source"] = f"Naukri ({filename})"

        all_jobs.append(df)
        print(f"[OK] Loaded {len(df)} jobs from {filename}")

    if all_jobs:
        return pd.concat(all_jobs, ignore_index=True)
    return pd.DataFrame()


def build_pipeline():
    """
    Build the jobs pipeline:
    1. Load local Naukri datasets (Indian job data)
    2. Fetch additional jobs from Apify (Indeed)
    3. Merge everything into data/jobs_processed.csv
    """

    os.makedirs("data", exist_ok=True)

    # --- Part 1: Load local Indian datasets ---
    print("[INFO] Loading local Naukri datasets...")
    local_df = _load_local_datasets()

    # --- Part 2: Fetch from Apify API ---
    print("[INFO] Fetching jobs from Apify API...")
    try:
        api_jobs = scrape_jobs()
    except Exception as e:
        print(f"[WARNING] Apify scraper failed: {e}")
        api_jobs = []

    api_df = pd.DataFrame(api_jobs) if api_jobs else pd.DataFrame()

    # --- Part 3: Merge ---
    frames = [f for f in [local_df, api_df] if isinstance(f, pd.DataFrame) and not f.empty]

    if frames:
        df = pd.concat(frames, ignore_index=True)
    else:
        print("[WARNING] No job data from any source!")
        df = pd.DataFrame(columns=["job_title", "company", "location", "source"])

    # Fill missing values
    df = df.fillna("Unknown")

    df.to_csv("data/jobs_processed.csv", index=False)
    print(f"[OK] Saved {len(df)} total jobs to data/jobs_processed.csv")
    return df