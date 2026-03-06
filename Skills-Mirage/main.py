import os

from scraping.data_pipeline import build_pipeline
from analysis.skill_analysis import analyze_skills
from analysis.risk_engine import calculate_risk


def main():
    # Ensure output directory exists
    os.makedirs("data", exist_ok=True)

    print("=" * 50)
    print("Skills Mirage — AI Workforce Intelligence System")
    print("=" * 50)

    # Stage 1: Scrape jobs
    print("\n[Stage 1] Scraping job data...")
    try:
        build_pipeline()
    except Exception as e:
        print(f"[ERROR] Data pipeline failed: {e}")
        return

    # Stage 2: Analyze skills
    print("\n[Stage 2] Analyzing skill demand...")
    try:
        analyze_skills()
    except Exception as e:
        print(f"[ERROR] Skill analysis failed: {e}")
        return

    # Stage 3: Calculate risk
    print("\n[Stage 3] Calculating AI risk levels...")
    try:
        calculate_risk()
    except Exception as e:
        print(f"[ERROR] Risk engine failed: {e}")
        return

    print("\n" + "=" * 50)
    print("Pipeline completed successfully")
    print("=" * 50)


if __name__ == "__main__":
    main()