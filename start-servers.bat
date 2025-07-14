@echo off
echo ========================================
echo   Real-time Todo Board - Server Startup
echo ========================================
echo.

echo [1/3] Killing existing Node.js processes...
taskkill //f //im node.exe >nul 2>&1
echo ✓ Cleaned up existing processes
echo.

echo [2/3] Starting Backend Server (Port 5001)...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo [3/3] Starting Frontend Server...
start "Frontend Server" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo   Servers are starting...
echo ========================================
echo Backend:  http://localhost:5001
echo Frontend: http://localhost:5173 (or next available port)
echo.
echo MongoDB should be running on: mongodb://localhost:27017
echo.
echo Press any key to close this window...
pause > nul 