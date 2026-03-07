@echo off
echo ========================================================
echo Starting Skills Mirage Platform
echo AI Workforce Intelligence & Reskilling System
echo ========================================================

echo Starting Python AI Engine (Port 8000)...
start "Skills Mirage Backend" cmd /k "cd skillradar-ai\backend && call env\Scripts\activate && uvicorn main:app --reload --port 8000"

echo Starting Skills Mirage Next.js Frontend (Port 3000)...
start "Skills Mirage Frontend" cmd /k "cd nexusai && npm run dev"

echo.
echo ========================================================
echo All services are starting up in separate windows!
echo It might take 10-15 seconds for the frontend to be ready.
echo Open: http://localhost:3000
echo ========================================================
pause
