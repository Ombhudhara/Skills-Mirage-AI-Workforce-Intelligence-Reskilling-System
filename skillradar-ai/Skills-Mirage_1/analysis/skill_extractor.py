import pandas as pd

# skill dictionary
SKILLS = [
    "python",
    "sql",
    "machine learning",
    "excel",
    "power bi",
    "tableau",
    "deep learning",
    "nlp",
    "statistics",
    "data analysis"
]

def extract_skills():

    df = pd.read_csv("data/jobs_processed.csv")

    skill_counts = {skill: 0 for skill in SKILLS}

    for _, row in df.iterrows():

        text = str(row.get("job_title", "")).lower()

        for skill in SKILLS:

            if skill in text:
                skill_counts[skill] += 1

    skill_df = pd.DataFrame(
        skill_counts.items(),
        columns=["skill", "demand"]
    )

    skill_df.to_csv("data/skill_demand.csv", index=False)

    return skill_df