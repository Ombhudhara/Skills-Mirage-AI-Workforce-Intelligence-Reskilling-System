# SkillRadar AI - Quick Start (5 Minutes)

## Prerequisites Check
```bash
python --version      # Should be 3.8+
node --version        # Should be 12+
npm --version         # Should be 6+
```

## Installation (2 minutes)

### 1. Navigate to Project
```bash
cd ~/Desktop/Practice/hackmiend/skillradar-ai
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend (in another terminal)
cd frontend
npm install
```

## Run Application (2 minutes)

### Terminal 1: Start Backend
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:root:Loading skills_mirage data pipeline...
INFO:root:Pipeline loaded: 15036 jobs, 34 courses
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm start
```

You should see:
```
Compiled successfully!
You can now view skillradar-ai in the browser.
Local: http://localhost:3000
```

## Access Application (1 minute)

| Component | URL | What to Do |
|-----------|-----|-----------|
| **Frontend** | http://localhost:3000 | Browse dashboard, use chatbot |
| **API Docs** | http://localhost:8000/docs | Test API endpoints |
| **Chatbot** | Chat icon on any page | Ask questions in English/Hindi |

## Test Chatbot Immediately

### In Browser (Easiest)
1. Go to http://localhost:3000
2. Click chat icon (bottom right)
3. Type: "I'm a Data Analyst. What skills should I learn?"

### Via API (cURL)
```bash
curl -X POST http://localhost:8000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What skills should I learn?",
    "user_role": "Data Analyst",
    "current_skills": ["SQL", "Excel"],
    "use_rag": false
  }'
```

## Key Chatbot Queries to Try

```
✓ "My risk score is 75. What should I do?"
✓ "I'm a Data Analyst. What skills should I learn?"
✓ "What are the top skills in Bangalore?"
✓ "Which courses should I take?"
✓ "Is my role safe from automation?"

# Hindi/Hinglish support:
✓ "Mere job mein kaun se skills zaroori hain?"
✓ "Mera automation risk kya hai?"
✓ "Bangalore mein kaun se skills trending hain?"
```

## Dashboard Features

- **Company Hiring Data**: Real jobs from Naukri (15,036 postings)
- **Top Companies**: Coders Brain (243), Accenture (178), Diverse Lynx (154), etc.
- **Salary Benchmarks**: By role and city
- **City Demand Heatmaps**: Which cities have most jobs
- **Trending Skills**: Real market demand data

## Worker Intelligence Features

1. **Skill Extraction**: Paste job description → AI extracts skills
2. **Risk Assessment**: Get automation risk score (6-factor formula)
3. **Risk Breakdown**: 
   - Hiring decline (25%)
   - AI mentions in job posts (20%)
   - Skill redundancy (20%)
   - Industry automation (15%)
   - Salary decline (10%)
   - Task automation (10%)

## Reskilling Paths Features

1. **Timeline Generation**: Week-by-week learning schedule
2. **Course Recommendations**: NPTEL, SWAYAM, PMKVY
3. **Skill Gap Analysis**: What you're missing for target role
4. **Personalized Roadmap**: Based on your current skills

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| Port 8000 in use | Kill process: `lsof -i :8000 \| kill -9 <PID>` |
| "Module not found" | Activate venv: `source venv/bin/activate` |
| Frontend blank | Check backend running: `curl http://localhost:8000/docs` |
| Chatbot slow | Wait for data to load (first request takes ~10s) |
| Data not loading | Check: `ls skills_mirage/data/*.csv` |

## Stop the Servers

```bash
# In each terminal, press:
Ctrl + C
```

## Next: Explore Advanced Features

- **RAG Chatbot**: Uses semantic search on job data
- **Ensemble Model**: XGBoost + Random Forest + Logistic Regression
- **NLP Skill Extraction**: Sentence transformers + keyword matching
- **MongoDB Integration**: Persist worker profiles (optional)
- **6-hour Auto-Refresh**: Scheduler for live data updates

## File Locations for Reference

```
backend/
├── main.py                    ← FastAPI entry point
└── api/
    └── chatbot.py            ← Enhanced chatbot (what we improved!)

frontend/
├── package.json              ← Dependencies
└── src/
    └── pages/Dashboard.jsx   ← Main UI

skills_mirage/
├── engines/                  ← All AI/ML algorithms
│   ├── risk_engine.py
│   ├── skill_recommender.py
│   └── chatbot/rag_chatbot.py
├── data/
│   ├── jobs_processed.csv    ← 15,036 real jobs
│   ├── nptel_courses.csv
│   └── swayam_courses.csv
└── pipeline/
    └── data_pipeline.py      ← Data loading
```

---

## You're All Set! 🚀

**Time to get started:**
1. ✅ Install (Backend + Frontend)
2. ✅ Run Backend (Terminal 1)
3. ✅ Run Frontend (Terminal 2)
4. ✅ Open http://localhost:3000
5. ✅ Chat with AI assistant!

**Questions?** Check RUN_GUIDE.md for detailed setup.
