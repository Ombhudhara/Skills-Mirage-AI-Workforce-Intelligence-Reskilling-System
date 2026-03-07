import pandas as pd

# Comprehensive skills list for matching
SKILLS = [
    "python",
    "sql",
    "machine learning",
    "excel",
    "power bi",
    "tableau",
    "statistics",
    "deep learning",
    "nlp",
    "data analysis",
    "java",
    "r programming",
    "tensorflow",
    "spark",
    "hadoop",
    "aws",
    "azure",
    "communication",
    "project management",
]

# Skills to infer from job titles (when no explicit skills column exists)
TITLE_SKILL_MAP = {
    "data scientist":       ["python", "sql", "machine learning", "statistics"],
    "data analyst":         ["python", "sql", "excel", "data analysis", "statistics"],
    "machine learning":     ["python", "machine learning", "deep learning", "tensorflow"],
    "financial analyst":    ["excel", "sql", "statistics", "data analysis"],
    "business analyst":     ["excel", "sql", "power bi", "data analysis"],
    "bi analyst":           ["power bi", "tableau", "sql", "data analysis"],
    "data engineer":        ["python", "sql", "spark", "hadoop", "aws"],
    "python":               ["python"],
    "nlp":                  ["nlp", "python", "machine learning"],
    "deep learning":        ["deep learning", "python", "tensorflow"],
}


def analyze_skills():
    """
    Read jobs_processed.csv, extract skill keywords from job titles
    and explicit skills columns, count occurrences, and save to
    data/skill_demand.csv.
    """

    try:
        df = pd.read_csv("data/jobs_processed.csv")
    except FileNotFoundError:
        print("[ERROR] data/jobs_processed.csv not found. Run build_pipeline() first.")
        return pd.DataFrame()

    if df.empty:
        print("[WARNING] jobs_processed.csv is empty. No skills to analyze.")
        skill_df = pd.DataFrame({"skill": SKILLS, "demand": [0] * len(SKILLS)})
        skill_df.to_csv("data/skill_demand.csv", index=False)
        return skill_df

    skill_counts = {skill: 0 for skill in SKILLS}

    for _, row in df.iterrows():
        # --- Method 1: Check explicit 'skills' column if it exists ---
        skills_text = str(row.get("skills", "")).lower()

        if skills_text and skills_text != "nan" and skills_text != "unknown":
            for skill in SKILLS:
                if skill in skills_text:
                    skill_counts[skill] += 1
            continue  # explicit skills found, no need to infer

        # --- Method 2: Infer skills from job title ---
        title = str(row.get("job_title", "")).lower()

        matched = False
        for keyword, inferred_skills in TITLE_SKILL_MAP.items():
            if keyword in title:
                for s in inferred_skills:
                    if s in skill_counts:
                        skill_counts[s] += 1
                matched = True

        # If no keyword matched, still check title for direct skill mentions
        if not matched:
            for skill in SKILLS:
                if skill in title:
                    skill_counts[skill] += 1

    skill_df = pd.DataFrame(
        list(skill_counts.items()),
        columns=["skill", "demand"],
    )

    # Sort by demand descending for better readability
    skill_df = skill_df.sort_values("demand", ascending=False).reset_index(drop=True)

    skill_df.to_csv("data/skill_demand.csv", index=False)
    print(f"[OK] Saved skill demand data ({len(skill_df)} skills) to data/skill_demand.csv")
    return skill_df