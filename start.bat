@echo off
echo Starting Clinic Appointment System...
echo.
echo Starting Express API Server on http://127.0.0.1:5000 ...
start "Clinic Backend Server" cmd /k "cd server && npm run dev"
timeout /t 2 /nobreak >nul
echo Starting React Vite Frontend on http://localhost:5173 ...
start "Clinic Frontend Client" cmd /k "cd client && npm run dev"
echo.
echo Both servers are starting in separate windows.
echo Frontend will be accessible at: http://localhost:5173
echo Backend API will be accessible at: http://127.0.0.1:5000/api
echo.
pause

