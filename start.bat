@echo off
echo ========================================
echo   Honeypot Security Monitor Launcher
echo ========================================
echo.

:: Start the Backend (FastAPI)
echo Starting Backend API on http://127.0.0.1:8000 ...
start "Honeypot Backend" cmd /k "cd /d "%~dp0backend" && py app.py"

:: Wait a moment for backend to initialize before starting frontend
echo Waiting for backend to initialize...
timeout /t 3 /nobreak > nul

:: Start the Frontend (Vite + React)
echo Starting Frontend Dashboard on http://localhost:5173 ...
start "Honeypot Frontend" cmd /k "cd /d "%~dp0honeypot-dashboard" && npm run dev"

echo.
echo ========================================
echo   Both services are starting...
echo ========================================
echo.
echo   Backend API:    http://127.0.0.1:8000
echo   API Docs:       http://127.0.0.1:8000/docs
echo   Frontend:       http://localhost:5173
echo.
echo   Close this window or press any key to exit.
echo   (The backend and frontend will keep running)
echo ========================================
pause > nul
