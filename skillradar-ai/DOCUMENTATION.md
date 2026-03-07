# Skills Mirage – AI Workforce Intelligence & Reskilling Platform

## Complete Technical Documentation

> **Version:** 1.0  
> **Last Updated:** March 7, 2026  
> **Authors:** Skills Mirage Development Team  
> **License:** MIT

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Data Sources](#4-data-sources)
5. [Installation Instructions](#5-installation-instructions)
6. [Dependencies](#6-dependencies)
7. [Running the Project](#7-running-the-project)
8. [Workflow of the System](#8-workflow-of-the-system)
9. [Models Used](#9-models-used)
10. [Formulas Used](#10-formulas-used)
11. [Features](#11-features)
12. [Data Update Frequency](#12-data-update-frequency)
13. [Output Dashboard](#13-output-dashboard)
14. [Verification](#14-verification)
15. [Future Improvements](#15-future-improvements)

---

## 1. Project Overview

### Purpose

**Skills Mirage** is an AI-driven workforce intelligence and reskilling platform purpose-built for India's rapidly evolving digital economy. The system analyzes labour market data and individual worker profiles to deliver four core capabilities:

| Capability | Description |
|---|---|
| **Automation Risk Detection** | Quantifies the probability that a given role or skill set will be displaced by automation within a defined time horizon |
| **Skill Gap Identification** | Compares a worker's current competencies against real-time market demand to surface critical missing skills |
| **Reskilling Pathway Recommendation** | Generates day-by-day learning roadmaps using curated NPTEL and SWAYAM courses mapped to identified skill gaps |
| **Real-Time Labour Market Intelligence** | Provides live dashboards for hiring trends, salary benchmarks, city-level demand, and AI vulnerability scoring |

The platform processes both **offline government datasets** (PLFS, PMKVY) and **live job postings** scraped from major Indian job portals (Naukri, LinkedIn) to produce a unified, continuously updated intelligence database.

### Two-Layer Architecture

Skills Mirage operates on a dual-intelligence architecture:

#### Layer 1 – Labour Market Intelligence (Macro-Level)

This layer processes aggregate job market data to answer questions about the broader economy:

- Which skills are trending upward or declining?
- Which cities have the highest demand for specific roles?
- What is the average salary for a given role in a given city?
- Which industries are most vulnerable to AI automation?

**Data sources:** 50,000+ scraped Naukri postings, PLFS workforce surveys, historical employment datasets.

#### Layer 2 – Worker Intelligence (Micro-Level)

This layer processes an individual worker's profile to deliver personalized insights:

- What skills does this worker currently possess?
- What is their personal automation risk score?
- What skills are they missing relative to market demand?
- What career transitions would reduce their risk and increase their earning potential?
- What specific courses should they complete, in what order, and by when?

**Data sources:** User-uploaded resumes, manual profile entries, NLP-extracted skill vectors.

> [!IMPORTANT]
> The two layers are deeply interconnected. Worker Intelligence relies on Labour Market Intelligence signals to score risk, identify gaps, and generate recommendations. Neither layer operates in isolation.

---

## 2. System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                       │
│              React + TailwindCSS + Recharts                 │
│    ┌──────────┬──────────┬────────────┬────────────────┐    │
│    │  Market  │  Worker  │  Reskill   │    Chatbot     │    │
│    │Dashboard │  Intel   │  Paths     │    Widget      │    │
│    └──────────┴──────────┴────────────┴────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (FastAPI)                       │
│    ┌──────────┬──────────┬────────────┬────────────────┐    │
│    │Dashboard │ Chatbot  │   Auth     │   Analytics    │    │
│    │  API     │   API    │   API      │     API        │    │
│    └──────────┴──────────┴────────────┴────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│   Worker     │  │   Labour     │  │    Chatbot       │
│ Intelligence │  │   Market     │  │    Engine         │
│   Engine     │  │ Intelligence │  │  (LangChain +    │
│              │  │   Engine     │  │   Groq Llama-3)  │
│ • Skill NLP  │  │ • Trends     │  │                  │
│ • Risk Model │  │ • Salary     │  │ • RAG Pipeline   │
│ • Gap Calc   │  │ • Demand     │  │ • FAISS Vectors  │
│ • Career Rec │  │ • Scraping   │  │ • Context Memory │
└──────┬───────┘  └──────┬───────┘  └────────┬─────────┘
       │                 │                    │
       └────────────────┬┘                    │
                        ▼                     │
         ┌──────────────────────────┐         │
         │     DATA LAYER           │         │
         │  ┌────────┐ ┌────────┐   │         │
         │  │MongoDB │ │ FAISS  │◄──┼─────────┘
         │  │        │ │ Vector │   │
         │  │ • Jobs │ │ Store  │   │
         │  │ • Users│ │        │   │
         │  │ • PLFS │ │ • Skill│   │
         │  │ • PMKVY│ │   Embs │   │
         │  └────────┘ └────────┘   │
         └──────────────────────────┘
                    ▲
                    │
         ┌──────────────────────────┐
         │    DATA INGESTION        │
         │  ┌────────┐ ┌────────┐   │
         │  │Offline │ │ Live   │   │
         │  │Datasets│ │Scraper │   │
         │  │        │ │        │   │
         │  │ • PLFS │ │• Naukri│   │
         │  │ • PMKVY│ │• Linke-│   │
         │  │ • NPTEL│ │  dIn   │   │
         │  │ • SWAYAM│ │       │   │
         │  └────────┘ └────────┘   │
         └──────────────────────────┘
```

### Component Responsibilities

| Component | Technology | Responsibility |
|---|---|---|
| **Frontend** | React, TailwindCSS, Recharts | Renders all UI pages: dashboard, analytics, worker profile, reskilling paths, chatbot |
| **API Layer** | FastAPI, Uvicorn | Exposes REST endpoints for all frontend operations; handles request validation and routing |
| **Worker Intelligence Engine** | Scikit-learn, Sentence Transformers | Processes individual profiles: skill extraction, risk scoring, gap analysis, career recommendations |
| **Labour Market Intelligence Engine** | Pandas, NumPy, XGBoost | Aggregates and analyzes macro-level job market data: trends, salary, demand, vulnerability |
| **Chatbot Engine** | LangChain, Groq Llama-3, FAISS | Provides conversational AI for career guidance using Retrieval Augmented Generation (RAG) |
| **Database** | MongoDB | Stores structured job data, user profiles, workforce survey data, and course metadata |
| **Vector Store** | FAISS | Stores and retrieves skill embedding vectors for similarity search and RAG context retrieval |
| **Data Ingestion** | Requests, BeautifulSoup, Selenium | Scrapes live job postings and merges them with offline government datasets |

### Request Flow

A typical user interaction follows this path:

```
1. User opens dashboard → Frontend sends GET /api/dashboard/data
2. FastAPI receives request → Queries MongoDB for cached analytics
3. If cache is stale → Triggers Labour Market Intelligence Engine
4. Engine fetches latest scraped data + offline datasets
5. Computes trends, salary benchmarks, demand scores
6. Returns aggregated JSON to FastAPI
7. FastAPI responds to Frontend
8. React renders charts, tables, and stat cards
```

---

## 3. Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.x | Component-based UI framework for building interactive single-page applications |
| **Vite** | 5.x | Fast build tool and development server with hot module replacement (HMR) |
| **TailwindCSS** | 3.x | Utility-first CSS framework for rapid, consistent, responsive styling |
| **Recharts** | 2.x | Declarative charting library built on D3 for rendering data visualizations |
| **Lucide Icons** | Latest | Open-source icon set providing consistent, customizable SVG icons |
| **React Router** | 6.x | Client-side routing for navigation between dashboard pages |
| **Axios** | 1.x | Promise-based HTTP client for making API requests to the backend |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **FastAPI** | 0.100+ | High-performance async Python web framework for building REST APIs |
| **Uvicorn** | 0.23+ | ASGI server that runs FastAPI with high concurrency support |
| **Python** | 3.10+ | Core programming language for all backend logic, ML models, and data processing |

### AI / Machine Learning

| Technology | Purpose |
|---|---|
| **Scikit-learn** | Classical ML algorithms for risk prediction (Random Forest, Gradient Boosting) |
| **Sentence Transformers** | Pre-trained transformer models for converting text into dense vector embeddings |
| **XGBoost** | Gradient boosting framework used for high-accuracy automation risk prediction |

### Data Processing

| Technology | Purpose |
|---|---|
| **Pandas** | Tabular data manipulation, cleaning, merging, and aggregation |
| **NumPy** | Numerical computing for statistical calculations and matrix operations |

### Chatbot

| Technology | Purpose |
|---|---|
| **LangChain** | Framework for building LLM-powered applications with chains, agents, and memory |
| **Groq Llama-3** | Large language model accessed via Groq's inference API for fast response generation |

### Vector Search

| Technology | Purpose |
|---|---|
| **FAISS** | Facebook AI Similarity Search – efficient vector similarity search for RAG pipelines |

### Web Scraping

| Technology | Purpose |
|---|---|
| **Requests** | HTTP library for fetching web pages and API responses |
| **BeautifulSoup** | HTML/XML parser for extracting structured data from web pages |
| **Selenium** | Browser automation for scraping JavaScript-rendered content |

### Database

| Technology | Purpose |
|---|---|
| **MongoDB** | NoSQL document database for storing semi-structured job, user, and course data |

---

## 4. Data Sources

### Offline Datasets

The system ingests the following government and educational datasets:

| Dataset | Description | Records | Update Frequency |
|---|---|---|---|
| **PLFS (Periodic Labour Force Survey)** | National workforce survey data from the Ministry of Statistics; contains employment rates, sector distribution, and demographic breakdowns | ~150,000 records | Annual |
| **PMKVY (Pradhan Mantri Kaushal Vikas Yojana)** | Training and certification data from India's flagship skill development programme | ~80,000 records | Quarterly |
| **Historical Naukri Job Dataset** | Pre-scraped dataset of job postings from Naukri.com spanning 2019–2025 | ~50,000 records | One-time import |
| **NPTEL Course Dataset** | Metadata for all courses offered through the National Programme on Technology Enhanced Learning | ~2,800 courses | Semester-based |
| **SWAYAM Course Dataset** | Metadata for courses available on India's national online education platform | ~4,500 courses | Semester-based |

### Live Scraping Sources

| Source | Data Captured | Method |
|---|---|---|
| **Naukri.com** | Job title, company, city, salary range, required skills, experience level, posting date | Requests + BeautifulSoup |
| **LinkedIn Jobs** | Job title, company, location, skills, seniority level | Selenium (JS-rendered pages) |

### Data Merging Pipeline

The system unifies offline and live data through a multi-stage ETL pipeline:

```
┌──────────────────┐    ┌──────────────────┐
│  Offline Datasets│    │  Live Scraper    │
│                  │    │                  │
│  • PLFS          │    │  • Naukri Jobs   │
│  • PMKVY         │    │  • LinkedIn Jobs │
│  • Historical    │    │                  │
│    Naukri         │    │  Runs every      │
│  • NPTEL Courses │    │  6 hours          │
│  • SWAYAM Courses│    │                  │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
         ┌───────────────────────┐
         │   Data Cleaning       │
         │                       │
         │  • Remove duplicates  │
         │  • Normalize titles   │
         │  • Standardize skills │
         │  • Parse salary ranges│
         │  • Validate locations │
         └───────────┬───────────┘
                     ▼
         ┌───────────────────────┐
         │   Merged Dataset      │
         │                       │
         │  Unified schema with: │
         │  • job_title          │
         │  • company            │
         │  • city               │
         │  • skills[]           │
         │  • salary_min/max     │
         │  • experience_range   │
         │  • source             │
         │  • timestamp          │
         └───────────┬───────────┘
                     ▼
         ┌───────────────────────┐
         │   Analytics Engine    │
         │                       │
         │  • Trend computation  │
         │  • Demand scoring     │
         │  • Salary aggregation │
         │  • Risk calculation   │
         │  • Skill gap mapping  │
         └───────────────────────┘
```

> [!NOTE]
> The merging process uses fuzzy matching on job titles and skill names to reconcile naming differences across sources. For example, "ML Engineer", "Machine Learning Engineer", and "ML Eng" are all normalized to "ML Engineer".

---

## 5. Installation Instructions

### Prerequisites

Before installing Skills Mirage, ensure the following software is available on your system:

| Software | Minimum Version | Download Link |
|---|---|---|
| **Python** | 3.10+ | [python.org](https://python.org) |
| **Node.js** | 18.x+ | [nodejs.org](https://nodejs.org) |
| **npm** | 9.x+ | Bundled with Node.js |
| **MongoDB** | 6.0+ | [mongodb.com](https://mongodb.com) |
| **Git** | 2.x+ | [git-scm.com](https://git-scm.com) |

### Step 1 – Clone the Repository

```bash
git clone <repository_url>
```

### Step 2 – Navigate to Project Folder

```bash
cd skillradar-ai
```

### Step 3 – Backend Setup

#### 3a – Create and Activate Python Virtual Environment

**Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate.bat
```

**macOS / Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

#### 3b – Install Python Dependencies

```bash
pip install -r requirements.txt
```

> [!TIP]
> If you encounter build errors with `faiss-cpu`, ensure you have a C++ compiler installed. On Windows, install Visual Studio Build Tools. On Linux, install `build-essential`.

### Step 4 – Frontend Setup

Open a new terminal window:

```bash
cd frontend
npm install
```

### Step 5 – Database Setup

**Option A – Local MongoDB:**
```bash
# Start MongoDB service
mongod --dbpath /data/db
```

**Option B – MongoDB Atlas (Cloud):**
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Get your connection string
3. Set the connection string in the backend environment configuration

### Step 6 – Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/skills_mirage

# Groq API (for Chatbot)
GROQ_API_KEY=your_groq_api_key_here

# Server
HOST=0.0.0.0
PORT=8000
```

> [!IMPORTANT]
> The `GROQ_API_KEY` is required for the AI chatbot to function. You can obtain a free API key from [console.groq.com](https://console.groq.com).

---

## 6. Dependencies

### Python Backend Dependencies

| Package | Version | Purpose |
|---|---|---|
| `fastapi` | ≥0.100.0 | Web framework for building the REST API layer |
| `uvicorn` | ≥0.23.0 | ASGI web server that runs FastAPI with async support |
| `pandas` | ≥2.0.0 | Data manipulation and analysis for processing job datasets and survey data |
| `numpy` | ≥1.24.0 | Numerical computation for statistical calculations in trend analysis and risk scoring |
| `scikit-learn` | ≥1.3.0 | Machine learning library for training Random Forest and Gradient Boosting risk prediction models |
| `sentence-transformers` | ≥2.2.0 | Pre-trained NLP models for converting job descriptions and skills into vector embeddings |
| `xgboost` | ≥1.7.0 | Gradient boosting framework for high-accuracy automation vulnerability prediction |
| `langchain` | ≥0.1.0 | Framework for building the RAG-powered chatbot with chain composition and memory |
| `faiss-cpu` | ≥1.7.0 | Efficient similarity search for retrieving relevant context vectors in the chatbot pipeline |
| `pymongo` | ≥4.5.0 | MongoDB driver for Python; handles all database read/write operations |
| `requests` | ≥2.31.0 | HTTP client for fetching web pages during live job scraping |
| `beautifulsoup4` | ≥4.12.0 | HTML parser for extracting structured job data from scraped web pages |
| `selenium` | ≥4.12.0 | Browser automation for scraping JavaScript-rendered pages (LinkedIn) |
| `python-dotenv` | ≥1.0.0 | Loads environment variables from `.env` files for configuration management |
| `pydantic` | ≥2.0.0 | Data validation and settings management used by FastAPI for request/response models |

### Frontend Dependencies

| Package | Purpose |
|---|---|
| `react` | Core UI framework |
| `react-dom` | DOM rendering for React components |
| `react-router-dom` | Client-side page routing and navigation |
| `axios` | HTTP client for API communication |
| `recharts` | Chart rendering (bar, line, pie, radar) |
| `lucide-react` | Icon library |
| `tailwindcss` | Utility-first CSS framework |
| `vite` | Build tool and development server |

---

## 7. Running the Project

### Starting the Backend

```bash
cd backend
# Activate virtual environment first (see Installation Step 3a)
python -m uvicorn main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

> [!TIP]
> The `--reload` flag enables auto-restart on code changes. Remove it in production for better performance.

### Starting the Chatbot Service (Optional)

If the chatbot system runs as a separate process:

```bash
cd Skills-Mirage-System
python chatbot.py
```

### Starting the Frontend

Open a **new terminal window**:

```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in 500ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### Starting MongoDB

If running locally:

```bash
mongod
```

Or ensure your MongoDB Atlas cluster is accessible and the connection string in `.env` is correct.

### Quick-Start Summary

| Service | Command | Port | Terminal |
|---|---|---|---|
| Backend API | `uvicorn main:app --reload --port 8000` | `8000` | Terminal 1 |
| Chatbot | `python chatbot.py` | `5001` | Terminal 2 |
| Frontend | `npm run dev` | `5173` | Terminal 3 |
| MongoDB | `mongod` | `27017` | Terminal 4 |

### Accessing the Application

Once all services are running, open your browser and navigate to:

```
http://localhost:5173
```

You will see the Skills Mirage landing page. Click **"Enter Platform"** or **"Get Started"** to access the dashboard directly.

---

## 8. Workflow of the System

### End-to-End Pipeline

The following describes the complete data flow from user input to actionable output:

```
┌──────────────────────────────────────────────────────────────┐
│  STEP 1: User Profile Entry                                  │
│                                                              │
│  User provides:                                              │
│  • Current Role (e.g., "Data Analyst")                       │
│  • City (e.g., "Bangalore")                                  │
│  • Years of Experience (e.g., 3)                              │
│  • Work Description / Resume Upload                          │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 2: NLP Skill Extraction                                │
│                                                              │
│  Sentence Transformers model processes the work description: │
│  • Tokenizes input text                                      │
│  • Generates 384-dimensional embedding vector                │
│  • Cosine similarity against 450+ known skill vectors        │
│  • Extracts matched skills with confidence scores            │
│                                                              │
│  Output: ["Python", "SQL", "Pandas", "Excel", "Tableau"]     │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 3: Labour Market Signal Retrieval                      │
│                                                              │
│  System queries the merged dataset for:                      │
│  • Hiring trends for the user's role and city                │
│  • Current skill demand rankings                             │
│  • Salary benchmarks (city + role + experience)              │
│  • Industry-level automation signals                         │
│                                                              │
│  Output: Market context vector for risk calculation          │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 4: Risk Prediction                                     │
│                                                              │
│  Random Forest / Gradient Boosting model calculates:         │
│  • Automation risk score (0-100)                             │
│  • Contributing factors breakdown                            │
│  • Historical trend comparison                               │
│                                                              │
│  Inputs: skill vector, market signals, role metadata         │
│  Output: Risk Score = 62 (Moderate-High)                     │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 5: Skill Gap Analysis                                  │
│                                                              │
│  Engine compares:                                            │
│  • User's extracted skills vs. market-demanded skills        │
│  • Calculates gap severity for each missing skill            │
│  • Ranks gaps by impact on employability                     │
│                                                              │
│  Output:                                                     │
│  Missing: ["Docker", "Kubernetes", "MLOps", "Spark"]         │
│  Gap Severity: [High, High, Critical, Medium]                │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 6: Career Recommendation                               │
│                                                              │
│  Role similarity scoring identifies safer career pivots:     │
│  • Computes skill transferability percentages                │
│  • Evaluates automation safety of target roles               │
│  • Factors in salary growth potential                        │
│                                                              │
│  Output:                                                     │
│  1. Data Engineer (82% transferability, Low risk)            │
│  2. ML Engineer (68% transferability, Very Low risk)         │
│  3. Cloud Architect (55% transferability, Low risk)          │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 7: Learning Roadmap Generation                         │
│                                                              │
│  For each identified skill gap:                              │
│  • Searches NPTEL and SWAYAM course databases                │
│  • Ranks courses by relevance, rating, and duration          │
│  • Generates a day-by-day study schedule                     │
│  • Estimates completion timeline                             │
│                                                              │
│  Output:                                                     │
│  Week 1-2: "Introduction to Docker" (NPTEL)                  │
│  Week 3-4: "Kubernetes for Developers" (SWAYAM)              │
│  Week 5-8: "MLOps Fundamentals" (NPTEL)                      │
│  Week 9-12: "Apache Spark with Python" (SWAYAM)              │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Models Used

### 9.1 Skill Extraction Model

| Property | Detail |
|---|---|
| **Model Type** | Sentence Transformers (all-MiniLM-L6-v2) |
| **Embedding Dimension** | 384 |
| **Approach** | Converts user's work description into a dense vector. Performs cosine similarity search against a pre-built index of 450+ known skill vectors. Skills with similarity > 0.7 threshold are extracted. |
| **Input** | Free-text job description or resume content |
| **Output** | List of extracted skills with confidence scores |

### 9.2 Risk Prediction Model

| Property | Detail |
|---|---|
| **Model Type** | Ensemble: Random Forest + Gradient Boosting (XGBoost) |
| **Training Data** | Historical employment trends, automation impact studies, O*NET task analysis data |
| **Features** | Hiring trend slope, automation exposure index, skill redundancy ratio, salary pressure indicator, routine task density |
| **Output** | Risk score (0–100) with factor-level breakdown |
| **Accuracy** | 85%+ on validation set |

### 9.3 Career Recommendation Model

| Property | Detail |
|---|---|
| **Model Type** | Role similarity scoring using cosine distance in skill-embedding space |
| **Approach** | Each role is represented as a weighted average of its required skill embeddings. The model computes pairwise similarity between the user's current role vector and all potential target role vectors. Roles are ranked by a composite score incorporating transferability, safety, and growth. |
| **Output** | Ranked list of recommended career pivots with transferability percentages |

### 9.4 Chatbot – Retrieval Augmented Generation (RAG)

| Property | Detail |
|---|---|
| **LLM** | Groq Llama-3 (70B parameter model via Groq inference API) |
| **Retrieval** | FAISS vector store indexed with job market data, skill descriptions, and course metadata |
| **Framework** | LangChain with ConversationalRetrievalChain |
| **Approach** | User query is embedded → top-k relevant documents are retrieved from FAISS → documents are injected into the LLM prompt as context → LLM generates a grounded, factual response |
| **Memory** | Sliding window conversation buffer (last 10 exchanges) |

---

## 10. Formulas Used

### 10.1 Skill Demand Growth

Measures how a skill's market demand is changing over a defined time period.

```
                    CurrentMentions − PreviousMentions
SkillGrowth (%) = ─────────────────────────────────── × 100
                         PreviousMentions
```

| Variable | Definition |
|---|---|
| `CurrentMentions` | Number of job postings mentioning the skill in the current period |
| `PreviousMentions` | Number of job postings mentioning the skill in the previous period |

**Example:** If Python was mentioned in 4,200 postings this month and 3,800 last month:

```
SkillGrowth = (4200 − 3800) / 3800 × 100 = 10.5%
```

---

### 10.2 Risk Score

Composite score quantifying a role's vulnerability to automation displacement.

```
RiskScore = 0.30 × HiringDecline
          + 0.25 × AutomationExposure
          + 0.20 × SkillRedundancy
          + 0.15 × SalaryPressure
          + 0.10 × RoutineTaskDensity
```

| Factor | Weight | Definition |
|---|---|---|
| `HiringDecline` | 30% | Rate of decrease in job postings for this role over 12 months |
| `AutomationExposure` | 25% | Percentage of role's tasks that can be performed by current AI/automation technology |
| `SkillRedundancy` | 20% | Proportion of the role's required skills that are declining in market demand |
| `SalaryPressure` | 15% | Downward trend in salary offerings for this role (indicates oversupply) |
| `RoutineTaskDensity` | 10% | Percentage of the role's tasks classified as routine/repetitive |

**Interpretation:**

| Score Range | Risk Level | Action |
|---|---|---|
| 0–25 | Low | Monitor |
| 26–50 | Moderate | Plan reskilling |
| 51–75 | High | Begin reskilling immediately |
| 76–100 | Critical | Urgent career transition needed |

---

### 10.3 Average Salary Calculation

```
                   Σ ((salary_min_i + salary_max_i) / 2)
avg_salary (₹) = ─────────────────────────────────────────
                              n
```

Where `i` iterates over all job postings matching the selected role and city, and `n` is the total count of matching postings.

---

### 10.4 Role Recommendation Score

Composite score used to rank suggested career transitions.

```
RoleScore = 0.40 × HiringDemand
          + 0.30 × SkillTransferability
          + 0.20 × AutomationSafety
          + 0.10 × SalaryGrowth
```

| Factor | Weight | Definition |
|---|---|---|
| `HiringDemand` | 40% | Normalized demand score for the target role (0–100) |
| `SkillTransferability` | 30% | Percentage of user's current skills that are relevant to the target role |
| `AutomationSafety` | 20% | Inverse of target role's risk score (100 − RiskScore) |
| `SalaryGrowth` | 10% | Expected salary increase from current role to target role |

---

### 10.5 Skill Ranking Score

Used to prioritize which skills a user should learn first.

```
SkillScore = 0.40 × MarketDemand
           + 0.30 × SkillGap
           + 0.20 × SalaryImpact
           + 0.10 × SkillGraphCentrality
```

| Factor | Weight | Definition |
|---|---|---|
| `MarketDemand` | 40% | Current demand score for this skill across all job postings |
| `SkillGap` | 30% | Severity of the gap (how far the user is from competency) |
| `SalaryImpact` | 20% | Average salary premium associated with possessing this skill |
| `SkillGraphCentrality` | 10% | How connected this skill is to other in-demand skills (network centrality) |

---

## 11. Features

### Labour Market Intelligence Features

| Feature | Description | Dashboard Location |
|---|---|---|
| **Hiring Trends** | Visualizes job posting volume over time, segmented by role, city, and industry. Supports 7-day, 1-month, 6-month, and 1-year time windows. | Market Center → Overview |
| **Skill Demand Analytics** | Ranks skills by current market demand. Shows rising skills (e.g., Generative AI +142%) and declining skills (e.g., Manual Testing −30%). | Market Center → Skills Intelligence |
| **City Demand Index** | Heat-map style view of hiring activity across Indian cities. Identifies demand hotspots and emerging tech hubs. | Market Center → Hiring Trends |
| **AI Vulnerability Index** | Scores roles and industries by automation risk. Includes role-level vulnerability, city-level vulnerability, and industry risk matrix. | Market Center → AI Vulnerability |
| **Salary Intelligence** | Average, median, and range salary data filtered by role, city, and experience level. Includes top paying companies ranking and tracks salary trends over time. | Salary Nexus |

### Worker Intelligence Features

| Feature | Description | Dashboard Location |
|---|---|---|
| **Skill Extraction** | NLP-powered extraction of skills from free-text job descriptions or uploaded resumes. | Neural Profile |
| **Risk Scoring** | Real-time automation risk score with factor-level breakdown. | Worker Signal |
| **Skill Gap Analysis** | Side-by-side comparison of user skills vs. market-demanded skills with gap severity indicators. | Worker Signal |
| **Career Recommendations** | AI-generated list of safer career transitions ranked by transferability and growth potential. | Worker Signal |
| **Reskilling Roadmap** | Day-by-day learning plan using NPTEL and SWAYAM courses, mapped to identified skill gaps. | Reskill Path |

### AI Chatbot Features

| Feature | Description | Access |
|---|---|---|
| **Career Assistant** | Conversational AI that answers questions about career planning, skill development, and industry trends. | Floating widget (all pages) |
| **Job Market Queries** | Ask natural-language questions like "What are the top paying skills in Bangalore?" and receive data-backed answers. | Floating widget |
| **Skill Advice** | Personalized guidance on which skills to learn based on user profile and market context. | Worker Signal page |

---

## 12. Data Update Frequency

| Data Type | Update Frequency | Mechanism |
|---|---|---|
| **Skill Extraction** | Real-time | Computed on each user profile submission |
| **Risk Score** | Real-time | Recalculated whenever user profile or market data changes |
| **Job Scraping (Naukri)** | Every 6 hours | Scheduled Python scraper with deduplication |
| **Job Scraping (LinkedIn)** | Every 6 hours | Scheduled Selenium-based scraper |
| **Salary Intelligence** | Every 6 hours | Recomputed from latest scraped salary data |
| **Market Dashboards** | Every 6 hours | Cached analytics refreshed after each scraping cycle |
| **Chatbot Responses** | Instant | LLM generates responses in real-time; knowledge base updated every 6 hours |
| **NPTEL/SWAYAM Courses** | Semester-based | Manual import at the start of each academic semester |
| **PLFS Workforce Data** | Annual | Updated when new government survey data is released |
| **PMKVY Training Data** | Quarterly | Updated when new training programme data is published |

---

## 13. Output Dashboard

The Skills Mirage dashboard presents the following output categories to the user:

### Summary Stat Cards

| Metric | Description | Example Value |
|---|---|---|
| **Live Openings** | Total active job postings matching current filters (period + city + role) | 1,353 |
| **Risk Level** | Number of critical automation risk signals detected | 3 Critical Found |
| **Avg Growth** | Average demand growth percentage across tracked roles | 12% |
| **Safe Horizon** | The role with the lowest automation risk in the selected context | Data Engineer |
| **Avg Salary** | Average salary for the selected role and city | ₹14.9 LPA |

### Detailed Outputs

| Output | Description |
|---|---|
| **Risk Score** | Individual automation risk score on a 0–100 scale with a colored severity badge |
| **Safe Roles** | List of roles with the lowest automation exposure, ranked by hiring demand |
| **At-Risk Roles** | List of roles showing declining demand and high automation signals |
| **Skill Gap Analysis** | Visual comparison of user skills vs. market demand with gap severity indicators |
| **Recommended Skills** | Prioritized list of skills the user should learn, ranked by SkillScore formula |
| **Salary Insights** | Average, min, max salary data with historical trends and city comparisons |
| **Career Transition Options** | Ranked list of career pivots with skill transferability and growth potential scores |
| **Learning Roadmap** | Week-by-week study plan with specific NPTEL/SWAYAM courses, durations, and links |

### Charts and Visualizations

| Chart | Type | Data Source |
|---|---|---|
| Hiring Trends | Line chart | Time-series job posting counts |
| Role Demand | Horizontal bar chart | Demand scores by role |
| Skill Gap Map | Grouped bar chart | Demand vs. supply per skill |
| Industry Risk Matrix | Table with severity badges | Risk score per industry sector |
| Salary Distribution | Area chart | Salary range distribution by city |
| City Demand Heatmap | Geographic visualization | Job count by city |
| Sector Growth | Pie/donut chart | Hiring growth by industry sector |

---

## 14. Verification

Use the following procedures to verify that Skills Mirage is functioning correctly after installation:

### Test 1: Live Job Counts Update

1. Open the dashboard at `http://localhost:5173/dashboard`
2. Note the "Live Openings" count
3. Change the time period filter from "7 Days" to "1 Year"
4. **Expected:** The Live Openings count should increase significantly (roughly 8–10×)
5. Change the city filter from "All India" to "Bangalore"
6. **Expected:** The count should decrease to approximately 22% of the All India total
7. Change the role filter from "All Roles" to "Software Engineer"
8. **Expected:** The count should further decrease to the role's market share proportion

> [!TIP]
> If the counts remain static across filter changes, check the browser console for JavaScript errors and verify the backend is running.

### Test 2: Skill Extraction

1. Navigate to the Worker Signal page
2. Enter the following work description:
   ```
   I work as a data analyst using Python, SQL, and Tableau
   to create dashboards and analyze customer behaviour data.
   ```
3. Submit the profile
4. **Expected:** The system should extract skills including: `Python`, `SQL`, `Tableau`, `Data Analysis`

### Test 3: Salary Responsiveness

1. Open the Salary Nexus page or observe the "Avg Salary" stat card on the dashboard
2. Set city to "Bangalore" and role to "Data Engineer"
3. Note the salary value
4. Change city to "Chennai"
5. **Expected:** The salary value should decrease (Chennai typically has lower salary benchmarks than Bangalore for the same role)
6. Change role to "AI Engineer"
7. **Expected:** The salary value should change to reflect the different market rate for AI Engineers

### Test 4: Vulnerability Index

1. Open Market Center → AI Vulnerability tab
2. Observe the role vulnerability table
3. Change city filter to different cities
4. **Expected:** Risk scores should adjust based on city-specific employment patterns
5. Look for "Data Entry Clerk" or similar roles
6. **Expected:** These should have high risk scores (>70) due to high automation exposure

### Test 5: Chatbot Functionality

1. Click the chatbot widget icon (bottom-right corner on any page)
2. Type: "What are the top skills for data engineers in 2026?"
3. **Expected:** The chatbot should respond with a relevant, data-backed answer mentioning skills like Python, SQL, Spark, etc.
4. Type: "What is the average salary for this role in Bangalore?"
5. **Expected:** The chatbot should maintain conversation context and respond with salary data for data engineers in Bangalore

### Test 6: API Health Check

```bash
curl http://localhost:8000/
```

**Expected response:**
```json
{"status": "ok", "message": "Skills Mirage API is running"}
```

---

## 15. Future Improvements

### Planned Enhancements

| Feature | Description | Priority | Status |
|---|---|---|---|
| **Skill Knowledge Graph** | Build a graph database (Neo4j) mapping skill dependencies, prerequisites, and co-occurrence patterns. Enables "if you know X, you should learn Y" recommendations. | High | Planned |
| **AI Skill Demand Forecasting** | Time-series forecasting models (LSTM/Prophet) to predict skill demand 6–12 months in advance, enabling proactive reskilling. | High | Research |
| **Advanced Salary Prediction** | ML model trained on job posting salary data with features including role, city, experience, company size, and skill set to predict individual salary ranges. | Medium | Planned |
| **Expanded Global Datasets** | Integration with international job portals (Indeed, Glassdoor, AngelList) to provide global market intelligence beyond India. | Medium | Backlog |
| **Resume Parser V2** | Deep learning-based resume parser supporting multiple formats (PDF, DOCX, images via OCR) with improved accuracy on Indian resume formats. | Medium | Planned |
| **Employer Intelligence Dashboard** | Analytics for employers showing talent supply, competitive salary benchmarking, and optimal job posting strategies. | Low | Backlog |
| **Mobile Application** | React Native companion app for push notifications on market changes and on-the-go chatbot access. | Low | Backlog |
| **Multi-Language Support** | Hindi, Tamil, Telugu, Bengali interfaces and chatbot support for broader regional access. | Medium | Research |

---

## Appendix A: Project Structure

```
skillradar-ai/
├── backend/
│   ├── main.py                    # FastAPI application entry point
│   ├── api/
│   │   ├── dashboard.py           # Dashboard data endpoints
│   │   ├── chatbot_api.py         # Chatbot message endpoints
│   │   ├── analytics.py           # Analytics endpoints
│   │   └── auth.py                # Authentication endpoints
│   ├── models/                    # ML model files and loaders
│   ├── scrapers/                  # Web scraping scripts
│   ├── data/                      # Offline datasets (CSV/JSON)
│   ├── requirements.txt           # Python dependencies
│   └── .env                       # Environment configuration
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Root application component
│   │   ├── App.css                # Global styles
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Landing page
│   │   │   ├── Dashboard.jsx      # Market intelligence dashboard
│   │   │   ├── Analytics.jsx      # Advanced analytics page
│   │   │   ├── WorkerIntelligence.jsx  # Worker profile analysis
│   │   │   ├── ReskillingPaths.jsx     # Learning roadmap generator
│   │   │   ├── SalaryExplorer.jsx      # Salary intelligence
│   │   │   ├── SkillsIntelligence.jsx  # Skills trend analysis
│   │   │   ├── VulnerabilityHeatmap.jsx # AI vulnerability maps
│   │   │   ├── EmployerDashboard.jsx   # Employer-facing analytics
│   │   │   ├── UserProfile.jsx         # User profile management
│   │   │   ├── Login.jsx               # Login page
│   │   │   └── Register.jsx            # Registration page
│   │   ├── components/
│   │   │   ├── ChatbotWidget.jsx       # Global chatbot overlay
│   │   │   └── BackgroundEffect.jsx    # Animated background
│   │   └── api/
│   │       └── client.js               # Axios API client
│   ├── package.json               # Node.js dependencies
│   └── vite.config.js             # Vite configuration
│
├── Skills-Mirage-System/
│   ├── chatbot.py                 # Standalone chatbot service
│   ├── analysis.py                # Data analysis scripts
│   └── data/                      # Additional datasets
│
└── README.md                      # Project readme
```

---

## Appendix B: API Reference

### Dashboard API

| Endpoint | Method | Description |
|---|---|---|
| `GET /api/dashboard/data` | GET | Returns aggregated dashboard data including trends, skills, and vulnerability metrics |
| `GET /api/dashboard/data?city=Bangalore&role=Data+Engineer` | GET | Filtered dashboard data by city and role |

### Chatbot API

| Endpoint | Method | Description |
|---|---|---|
| `POST /api/chatbot/message` | POST | Send a message to the AI chatbot and receive a response |

**Request body:**
```json
{
    "message": "What skills should I learn?",
    "context": {
        "role": "Data Analyst",
        "city": "Bangalore"
    }
}
```

**Response:**
```json
{
    "response": "Based on current market trends in Bangalore...",
    "sources": ["naukri_data", "nptel_courses"]
}
```

### Analytics API

| Endpoint | Method | Description |
|---|---|---|
| `GET /api/analytics/forecast` | GET | Returns skill demand forecast data |
| `GET /api/analytics/correlations` | GET | Returns skill correlation analysis |
| `GET /api/analytics/anomalies` | GET | Returns anomaly detection results |
| `GET /api/analytics/patterns` | GET | Returns market pattern analysis |

---

> **Document End**
>
> For questions, issues, or contributions, please open an issue on the project repository or contact the development team.
