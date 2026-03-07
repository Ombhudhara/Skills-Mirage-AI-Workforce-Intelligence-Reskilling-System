import pandas as pd


def calculate_risk():
    """
    Read skill_demand.csv and assign AI risk levels using RELATIVE thresholds.

    Logic (percentile-based):
      - Top 25% demand  → Low AI Risk    (skills in strong demand)
      - 25th–75th pctile → Medium AI Risk (moderate demand)
      - Bottom 25%       → High AI Risk   (low demand = high automation risk)

    Also adds demand_pct (% of total jobs mentioning this skill).
    """

    try:
        df = pd.read_csv("data/skill_demand.csv")
    except FileNotFoundError:
        print("[ERROR] data/skill_demand.csv not found. Run analyze_skills() first.")
        return pd.DataFrame()

    if df.empty:
        print("[WARNING] skill_demand.csv is empty. No risk to calculate.")
        return pd.DataFrame()

    # Calculate percentile thresholds from the actual data
    q75 = df["demand"].quantile(0.75)
    q25 = df["demand"].quantile(0.25)

    # Calculate demand as % of total jobs
    try:
        jobs_df = pd.read_csv("data/jobs_processed.csv")
        total_jobs = len(jobs_df)
    except Exception:
        total_jobs = df["demand"].max()  # fallback

    risk = []

    for _, row in df.iterrows():
        demand = row["demand"]

        if demand >= q75:
            level = "Low AI Risk"
        elif demand >= q25:
            level = "Medium AI Risk"
        else:
            level = "High AI Risk"

        demand_pct = round((demand / total_jobs) * 100, 2) if total_jobs > 0 else 0

        risk.append({
            "skill": row["skill"],
            "demand": demand,
            "demand_pct": demand_pct,
            "risk_level": level,
        })

    risk_df = pd.DataFrame(risk)
    risk_df.to_csv("data/risk_scores.csv", index=False)

    # Print summary
    high = risk_df[risk_df["risk_level"] == "High AI Risk"]["skill"].tolist()
    med = risk_df[risk_df["risk_level"] == "Medium AI Risk"]["skill"].tolist()
    low = risk_df[risk_df["risk_level"] == "Low AI Risk"]["skill"].tolist()

    print(f"[OK] Risk scores saved — Low: {len(low)}, Medium: {len(med)}, High: {len(high)}")
    return risk_df