# SkillRadar AI - Backend Reskilling & Worker Intelligence System Analysis

## Executive Summary

The SkillRadar AI system is a sophisticated **multi-layer worker intelligence and reskilling platform** that:
1. **Analyzes worker profiles** via NLP skill extraction and risk scoring
2. **Detects skill gaps** between current and target roles
3. **Recommends personalized courses** using multi-factor scoring
4. **Predicts automation risk** using ensemble ML models
5. **Generates learning timelines** with week-by-week course plans

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SkillRadar AI Backend                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  API Layer (FastAPI Routers)                           │   │
│  │  ├── /api/profile          (User Profile Management)   │   │
│  │  ├── /api/dashboard        (Market Intelligence)       │   │
│  │  ├── /api/intelligence     (Risk Evaluation)          │   │
│  │  ├── /api/reskilling       (Course Recommendations)   │   │
│  │  ├── /api/labour_market    (Job Market Analysis)      │   │
│  │  └── /api/chatbot          (Conversational UI)        │   │
│  └─────────────────────────────────────────────────────────┘   │
│         ↓                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Skills Mirage Engine Layer                            │   │
│  │  (13 specialized intelligence engines)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│         ↓                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Data Pipeline Layer                                    │   │
│  │  ├── Real Naukri job data (CSV)                        │   │
│  │  ├── NPTEL/SWAYAM course data                          │   │
│  │  └── Data normalization & caching                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│         ↓                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Data Storage (SQLite/File-based)                      │   │
│  │  ├── User Profiles                                      │   │
│  │  ├── User Skills & Risk Scores                          │   │
│  │  ├── Job Market Trends                                  │   │
│  │  └── Course Catalog                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. The 13 Reskilling & Intelligence Engines

### 2.1 Layer 1: Data Analysis Engines

#### A. **Skill Demand Engine** (`skill_demand.py`)
**Purpose:** Detect trending skills in the job market

**Formula:**
```
SkillGrowth = ((S_t - S_{t-1}) / S_{t-1}) * 100
```

**Inputs:**
- Job listings DataFrame with `month` and `skills` columns
- Skill occurrence counts by month

**Outputs:**
```python
{
  "skill": "Python",
  "growth_rate": 45.2,        # % month-over-month growth
  "this_month": 1250,         # Current month occurrences
  "last_month": 861           # Previous month occurrences
}
```

**Key Functions:**
- `get_skill_trend_score(skill, df)` → normalized 0-1 score
- `get_top_trending_skills(df, top_n=10)` → list of trending skills

---

#### B. **Job Trend Engine** (`trend_engine.py`)
**Purpose:** Analyze hiring trends across roles and time periods

**Formula:**
```
GrowthRate = ((J_t - J_{t-1}) / J_{t-1}) * 100
```

**Outputs:**
```python
{
  "role": "Data Analyst",
  "growth_rate": 32.5,
  "trend": "Growing",
  "monthly_counts": {"Jan": 450, "Feb": 595}
}
```

---

#### C. **Salary Engine** (`salary_engine.py`)
**Purpose:** Salary benchmarking and feasibility analysis

**Formula:**
```
SalaryGrowth = (TargetSalary - CurrentSalary) / CurrentSalary
```

**Outputs:**
```python
{
  "role": "Data Scientist",
  "avg_min": 8.5,             # Lakhs (LPA)
  "avg_max": 20.0,
  "avg_mid": 14.25,
  "salary_range": "₹8.5–20 LPA"
}
```

---

#### D. **City Intelligence Engine** (`city_engine.py`)
**Purpose:** City-level job demand analysis

**Formula:**
```
CDI = Jobs(city, role) / TotalJobs(role)
CityGrowth = ((C_t - C_{t-1}) / C_{t-1}) * 100
```

**Outputs:**
```python
{
  "city": "Bangalore",
  "cdi": 0.45,                # City Demand Index
  "total_jobs": 1200,
  "demand_level": "High"
}
```

---

### 2.2 Layer 2: Worker Intelligence Engines

#### A. **Skill Extractor Engine** (`skill_extractor.py`)
**Purpose:** Extract skills from worker's job description using NLP

**Method:** Hybrid approach
- Keyword matching against known skill library
- Semantic similarity using Sentence Transformers
- Skill aliases mapping (e.g., "CRM" ← "Customer Relationship Management")

**Inputs:**
```
"I handle customer support calls, manage CRM systems, 
analyze data with Excel and PowerBI reports"
```

**Outputs:**
```python
{
  "extracted_skills": ["Communication", "CRM", "Excel", "PowerBI", "Data Analytics"],
  "skill_count": 5,
  "extraction_method": "keyword_matching + semantic_similarity"
}
```

**Skill Library:**
- 30+ known skills (Python, SQL, Excel, CRM, SEO, etc.)
- Flexible alias system for variations

---

#### B. **Skill Gap Engine** (`skill_gap.py`)
**Purpose:** Identify missing skills between current and target role

**Formula:**
```
SkillGap = TargetSkills - WorkerSkills
TransferScore = SharedSkills / TotalTargetSkills
```

**Inputs:**
```python
worker_skills = ["Excel", "Communication", "CRM"]
target_role = "Data Analyst"
```

**Outputs:**
```python
{
  "target_role": "Data Analyst",
  "required_skills": ["Python", "SQL", "Excel", "PowerBI", "Data Analytics"],
  "matched_skills": ["Excel"],
  "skill_gap": ["Python", "SQL", "PowerBI", "Data Analytics"],
  "transfer_score": 0.20,     # 20% skills already match
  "recommendation": "Significant Upskilling Needed"
}
```

**Transfer Score Interpretation:**
- `0.4+` → Recommended transition (easier path)
- `<0.4` → Significant upskilling needed (harder path)

---

#### C. **Risk Engine** (`risk_engine.py`)
**Purpose:** Predict automation risk for worker's current role

**Formula (6-Factor Weighted Model):**
```
RiskScore = 0.25*H + 0.20*A + 0.20*SR + 0.15*I + 0.10*SL + 0.10*TA
```

Where:
- **H** (25%): Hiring Decline Score
- **A** (20%): AI Mention Score (how often automation appears in job postings)
- **SR** (20%): Skill Redundancy (average automation potential of worker's skills)
- **I** (15%): Industry Automation Index
- **SL** (10%): Salary Decline Score
- **TA** (10%): Task Automation Potential

**Skill Redundancy Scores (examples):**
```
Data Entry: 0.90         (highly automatable)
Communication: 0.40     (moderately automatable)
Python: 0.10            (not automatable)
Machine Learning: 0.10  (not automatable)
```

**Outputs:**
```python
{
  "risk_score": 72.5,           # 0-100
  "risk_level": "High",
  "factors": {
    "hiring_decline": 0.45,
    "ai_mentions": 0.35,
    "skill_redundancy": 0.65,
    "industry_automation": 0.75,
    "salary_decline": 0.60,
    "task_automation": 0.80
  }
}
```

---

#### D. **Ensemble Risk Model** (`ensemble_risk_model.py`)
**Purpose:** Advanced ML ensemble for more accurate risk prediction

**Components:**
1. XGBoost (35% weight)
2. Random Forest (35% weight)
3. Logistic Regression (30% weight)

**Training:** Synthetic data (1000 samples) based on domain knowledge

**Outputs:**
```python
{
  "risk_score": 68.3,
  "risk_level": "Moderate Risk",
  "confidence": 0.85,
  "model_predictions": {
    "xgboost": 72.1,
    "random_forest": 68.5,
    "logistic_regression": 64.2
  },
  "feature_importance": {
    "hiring_decline": 12.5,
    "ai_mentions": 8.0,
    "skill_redundancy": 13.0,
    ...
  }
}
```

---

### 2.3 Layer 2: Recommendation
