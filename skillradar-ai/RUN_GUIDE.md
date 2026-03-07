# SkillRadar AI - Complete Setup & Run Guide

## Prerequisites

- **Python 3.8+** (tested with Python 3.10+)
- **Node.js 14+** (for frontend)
- **npm** or **yarn** (package manager)
- **MongoDB** (optional, for persistence - currently using local CSV storage)
- **Git** (for cloning the repository)

---

## Directory Structure

```
skillradar-ai/
├── backend/                          # FastAPI backend (port 8000)
│   ├── main.py                      # FastAPI app entry point
│   ├── api/
│   │   ├── chatbot.py              # Enhanced chatbot API
│   │   ├── dashboard.py            # Dashboard data API
│   │   ├── intelligence.py         # Risk & intelligence API
│   │   ├── reskilling.py           # Timeline & courses API
│   │   └── labour_market.py        # Market trends API
│   └── requirements.txt            # Backend dependencies
│
├── frontend/                         # React frontend (port 3000)
│   ├── package.json                # Frontend dependencies
│   ├── src/
│   │   ├── pages/Dashboard.jsx     # Main dashboard
│   │   ├── pages/WorkerIntelligence.jsx
│   │   └── pages/ReskillingPaths.jsx
│   └── public/
│
└── skills_mirage/                   # Core ML/AI engines
    ├── engines/                     # Intelligence engines
    │   ├── risk_engine.py          # 6-factor risk scoring
    │   ├── skill_recommender.py    # Skill recommendations
    │   ├── skill_gap.py            # Skill gap detection
    │   ├── timeline_generator.py   # Learning roadmaps
    │   └── ... (10+ engines)
    ├── chatbot/
    │   └── rag_chatbot.py          # RAG-based chatbot
    ├── pipeline/
    │   ├── data_pipeline.py        # Data processing pipeline
    │   └── naukri_scraper.py       # Naukri job scraper
    ├── data/
    │   ├── jobs_processed.csv      # 15,036 real Naukri jobs
    │   ├── nptel_courses.csv       # Real NPTEL courses
    │   └── swayam_courses.csv      # Real SWAYAM courses
    └── database/
        └── mongodb_manager.py      # MongoDB integration
```

---

## Step 1: Clone & Setup the Repository

```bash
# Navigate to your projects directory
cd ~/Desktop/Practice/hackmiend

# Clone or enter the repository
cd skillradar-ai

# Create a Python virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

---

## Step 2: Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Or install manually:
pip install fastapi uvicorn pandas numpy scikit-learn xgboost sentence-transformers
```

### Key Python Dependencies:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `pandas` - Data processing
- `scikit-learn` - Machine learning
- `xgboost` - Gradient boosting
- `sentence-transformers` - NLP embeddings
- `pymongo` - MongoDB (optional)

---

## Step 3: Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install

# Key packages will include:
# - react, react-dom
# - axios (for API calls)
# - chart.js, recharts (for visualizations)
# - tailwindcss (styling)
```

---

## Step 4: Verify Data Files

Ensure these data files exist in `skills_mirage/data/`:

```bash
cd skills_mirage/data

# Check file sizes (should be non-empty)
ls -lh *.csv

# Expected files:
# - jobs_processed.csv         (~5-10 MB, 15,036 jobs)
# - nptel_courses.csv          (~500 KB, 200+ courses)
# - swayam_courses.csv         (~300 KB, 150+ courses)
```

If files are missing, the pipeline will attempt to load from source CSV files in the data directory.

---

## Step 5: Run the Backend Server

### Option A: Run with Uvicorn (Production)

```bash
cd backend

# Start the backend server on port 8000
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# You should see:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete
```

### Option B: Run Directly with Python

```bash
cd backend
python main.py
```

### Check if Backend is Running

```bash
# In another terminal, test the API:
curl http://localhost:8000/docs

# You should see the Swagger UI documentation
```

### Important: Backend Startup Messages

When the backend starts, you'll see:
```
INFO:root:Loading skills_mirage data pipeline...
INFO:root:Pipeline loaded: 15036 jobs, 34 courses
INFO:root:Available endpoints:
  - POST /api/chatbot/message (AI chat assistant)
  - GET  /api/dashboard/data (dashboard visualizations)
  - POST /api/intelligence/analyze (worker risk assessment)
  - GET  /api/reskilling/timeline (learning paths)
  - GET  /api/labour-market/trends (market intelligence)
```

---

## Step 6: Run the Frontend Server

### In a New Terminal:

```bash
# Navigate to frontend
cd frontend

# Start development server
npm start
# or
yarn start

# You should see:
# webpack compiled successfully
# Compiled successfully!
# 
# You can now view skillradar-ai in the browser.
# Local:            http://localhost:3000
```

The frontend will automatically open at `http://localhost:3000`

---

## Step 7: Test the Application

### Frontend Pages:

1. **Dashboard** (`http://localhost:3000`)
   - View top companies hiring (real Naukri data)
   - See salary trends and city demand heatmaps
   - Market intelligence visualizations

2. **Worker Intelligence** (`http://localhost:3000/worker-intelligence`)
   - Input job description → Extract skills (NLP)
   - Get automation risk score (6-factor formula)
   - See risk mitigation strategies

3. **Reskilling Paths** (`http://localhost:3000/reskilling-paths`)
   - Input current role & skills
   - Get personalized learning timeline
   - See NPTEL/SWAYAM course recommendations

4. **Chatbot** (Available on all pages)
   - Click the chat icon
   - Ask: "What skills should I learn?" / "Is my role safe?" / "What courses for Python?"
   - Hindi/Hinglish supported: "Mere role mein risk kitna hai?"

---

## Step 8: Test the Chatbot API Directly

### Using cURL:

```bash
# Risk Assessment Query
curl -X POST http://localhost:8000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "My risk score is 75. What should I do?",
    "user_role": "Data Entry Operator",
    "user_city": "Bangalore",
    "risk_score": 75,
    "current_skills": ["Excel", "Data Entry"],
    "use_rag": false
  }'

# Skill Recommendation Query
curl -X POST http://localhost:8000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am a Data Analyst. What skills should I learn?",
    "user_role": "Data Analyst",
    "user_city": "Bangalore",
    "current_skills": ["SQL", "Excel", "PowerBI"],
    "career_goal": "Data Analyst",
    "use_rag": false
  }'

# City Intelligence Query
curl -X POST http://localhost:8000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the top skills in Bangalore?",
    "user_city": "Bangalore"
  }'

# Hindi Query
curl -X POST http://localhost:8000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mere liye kaun sa skill seekhna chahiye?",
    "user_role": "Software Engineer",
    "risk_score": 45
  }'
```

### Using Python Requests:

```python
import requests
import json

BASE_URL = "http://localhost:8000/api/chatbot/message"

payload = {
    "message": "I'm a Data Analyst. What skills should I learn?",
    "user_role": "Data Analyst",
    "user_city": "Bangalore",
    "current_skills": ["SQL", "Excel", "PowerBI"],
    "career_goal": "Data Analyst",
    "use_rag": False
}

response = requests.post(BASE_URL, json=payload)
result = response.json()

print(f"Intent: {result['intent']}")
print(f"Reply: {result['reply']}")
if result.get('data'):
    print(f"Recommendations: {result['data']}")
```

---

## Step 9: Run Individual Test Scripts

The project includes test scripts for validation:

```bash
# Test chatbot with all scenarios
cd skillradar-ai
python test_chatbot.py

# Test skill recommender engine directly
python test_skill_recommender.py

# Debug chatbot data loading
python debug_chatbot.py
```

---

## Step 10: (Optional) Run with Docker

### Backend Dockerfile:

```bash
cd backend
docker build -t skillradar-backend .
docker run -p 8000:8000 skillradar-backend
```

### Frontend Dockerfile:

```bash
cd frontend
docker build -t skillradar-frontend .
docker run -p 3000:3000 skillradar-frontend
```

### Docker Compose (Run Both):

```bash
# From root directory
docker-compose up

# Both services will start:
# - Backend on http://localhost:8000
# - Frontend on http://localhost:3000
```

---

## Troubleshooting

### Issue: "Module not found" error

```bash
# Solution: Ensure you're in the correct directory
cd skillradar-ai/backend
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
python -m uvicorn main:app --reload
```

### Issue: Port 8000 or 3000 already in use

```bash
# Kill process on port 8000 (backend)
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :8000
kill -9 <PID>

# Or use different ports:
python -m uvicorn main:app --port 8001
npm start -- --port 3001
```

### Issue: Data files not loading

```bash
# Regenerate processed data
cd backend
python -c "from pipeline.data_pipeline import build_pipeline; build_pipeline(force=True, enable_scraping=False)"
```

### Issue: Chatbot returning generic responses

```bash
# Ensure data is loaded by checking logs
# You should see: "Pipeline loaded: 15036 jobs, 34 courses"

# If not, manually load data:
cd backend
python -c "from main import load_pipeline; load_pipeline()"
```

### Issue: CORS errors in frontend

The backend has CORS enabled. If you still get errors, update `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Quick Start Summary (All in One)

```bash
# 1. Setup and navigate
cd ~/Desktop/Practice/hackmiend/skillradar-ai
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
cd backend && pip install -r requirements.txt && cd ..
cd frontend && npm install && cd ..

# 3. Start backend (Terminal 1)
cd backend
python -m uvicorn main:app --reload

# 4. Start frontend (Terminal 2)
cd frontend
npm start

# 5. Open browser
# Frontend: http://localhost:3000
# Backend Docs: http://localhost:8000/docs
```

---

## Verify Everything is Running

### Checklist:

- [ ] Backend running on `http://localhost:8000` (see Swagger docs)
- [ ] Frontend running on `http://localhost:3000` (opens in browser)
- [ ] Dashboard loads (shows company hiring data)
- [ ] Chatbot responds to messages
- [ ] Worker Intelligence extracts skills from job descriptions
- [ ] Reskilling Paths generates learning timeline

### Check Logs:

```bash
# Backend should show:
# INFO:pipeline.data_pipeline:Pipeline loaded: 15036 jobs, 34 courses
# INFO:     Application startup complete

# Frontend should show:
# Compiled successfully!
# You can now view skillradar-ai in the browser.
```

---

## Next Steps

1. **Add your worker profile**: Go to Worker Intelligence → Enter your job description
2. **Check your risk score**: Based on 6-factor formula
3. **Get skill recommendations**: Personalized to your role
4. **View learning paths**: NPTEL/SWAYAM courses with timeline
5. **Chat with AI assistant**: Ask in English or Hindi!

---

## Useful Commands

```bash
# Stop the servers
Ctrl + C  # In each terminal

# View API documentation
http://localhost:8000/docs  # Swagger UI
http://localhost:8000/redoc # ReDoc

# Check available endpoints
curl http://localhost:8000/api/

# Rebuild data pipeline
python -c "from pipeline.data_pipeline import build_pipeline; build_pipeline(force=True)"

# Run tests
python -m pytest tests/

# Check Python version
python --version
```

---

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 2 GB | 4+ GB |
| Storage | 500 MB | 2+ GB |
| Python | 3.8 | 3.10+ |
| Node.js | 12 | 16+ |
| Network | Broadband | Broadband |

---

## Support & Issues

- **Frontend issues**: Check browser console (F12 → Console tab)
- **Backend errors**: Check terminal where you ran `uvicorn`
- **Data not loading**: Check `skills_mirage/data/` directory exists
- **Chatbot unresponsive**: Verify backend is running (`http://localhost:8000/docs`)

---

**Now you're ready to run SkillRadar AI!** 🚀
