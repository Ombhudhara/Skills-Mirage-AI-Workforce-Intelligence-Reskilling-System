# Skills Mirage – AI Workforce Intelligence & Reskilling System

A Python-based AI system that analyzes job market data and generates personalized career recommendations for workers.

## Features
- **Layer 1 (Labour Market Engine):** Job trend detection, skill demand analysis, city intelligence, salary benchmarks, automation risk prediction
- **Layer 2 (Worker Intelligence Engine):** NLP skill extraction, skill gap detection, career recommendations, skill & course suggestions

## Project Structure
```
skills_mirage/
├── data/
│   ├── jobs.csv          ← Mock job listings (LinkedIn/Naukri style)
│   └── courses.csv       ← Course catalog (NPTEL, SWAYAM, PMKVY)
├── engines/
│   ├── trend_engine.py       ← Job Trend Detection
│   ├── skill_demand.py       ← Skill Demand Analysis
│   ├── city_engine.py        ← City Intelligence (CDI)
│   ├── salary_engine.py      ← Salary Benchmarks
│   ├── risk_engine.py        ← Automation Risk Prediction
│   ├── skill_extractor.py    ← NLP Skill Extraction
│   ├── skill_gap.py          ← Skill Gap + Transferability
│   ├── career_recommender.py ← Career Recommendations
│   ├── skill_recommender.py  ← Skill Recommendations
│   └── course_recommender.py ← Course Recommendations
├── main.py               ← FastAPI Application
├── requirements.txt
└── README.md
```

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the API
```bash
uvicorn main:app --reload
```

### 3. Open API Docs
Visit: http://127.0.0.1:8000/docs

## API Endpoints

### `POST /analyze`
Analyzes a worker profile and returns full intelligence report.

**Request Body:**
```json
{
  "current_role": "BPO Executive",
  "city": "Pune",
  "experience": 4,
  "career_goal": "Digital Marketing Specialist",
  "target_salary": 8.0,
  "work_description": "Handle customer calls and manage CRM systems"
}
```

**Response includes:**
- `worker_skills` – Extracted skills from description
- `risk_score` + `risk_level` – Automation risk (0–100, Low/Medium/High)
- `risk_factors` – Breakdown of risk components
- `salary_analysis` – Current vs target salary feasibility
- `career_paths` – Top 3 recommended career paths with scores
- `skill_gap` – Skills needed for the target role
- `skills_to_develop` – Prioritized skill recommendations
- `recommended_courses` – Best courses from NPTEL/SWAYAM/PMKVY
- `reskilling_weeks` – Estimated reskilling duration
- `city_insights` – Top cities and skills for your area
- `market_insights` – Trending roles and skills

### `GET /market/trends`
Returns trending job roles and skills across the market.

### `GET /city/{city}/skills`
Returns top in-demand skills for a specific city.

## Formulas Used
| Component | Formula |
|---|---|
| Job Growth | `(J_t - J_{t-1}) / J_{t-1} * 100` |
| Skill Growth | `(S_t - S_{t-1}) / S_{t-1} * 100` |
| City Demand Index | `Jobs(city, role) / TotalJobs(role)` |
| Risk Score | `0.30H + 0.25A + 0.20R + 0.15S + 0.10I` |
| Career Score | `0.35*SkillMatch + 0.25*Demand + 0.20*Salary + 0.20*Safety` |
| Skill Score | `0.40*Trend + 0.35*SkillGap + 0.25*Transferability` |
| Course Score | `0.50*Coverage + 0.30*Duration + 0.20*Rating` |
