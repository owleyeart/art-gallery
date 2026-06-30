# Art Gallery Development Servers Launcher
# Opens three tabs in one Windows Terminal window:
#   1. Backend  (Node/Express on port 3001)
#   2. Frontend (Vite on port 5173) + opens browser
#   3. Manual   (PowerShell prompt in project root)

$projectRoot = "E:\WEBSITES\Art Gallery"

$backendCmd = @"
@echo off
title Art Gallery Backend - Starting...
cd /d "E:\WEBSITES\Art Gallery\backend"
echo.
echo  ==========================================
echo   Art Gallery - Backend Server (port 3001)
echo  ==========================================
echo.

if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
    echo.
)

echo Starting Backend Server...
echo.

start /b npm run dev
timeout /t 3 /nobreak >nul

tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I "node.exe" >nul
if %ERRORLEVEL% EQU 0 (
    title Art Gallery Backend - Running on :3001
    echo Backend server started successfully!
    echo API: http://localhost:3001/api/health
) else (
    title Art Gallery Backend - FAILED
    echo Backend server failed to start!
    echo Check the output above for errors.
)

cmd /k
"@

$frontendCmd = @"
@echo off
title Art Gallery Frontend - Starting...
cd /d "E:\WEBSITES\Art Gallery\frontend"
echo.
echo  ==========================================
echo   Art Gallery - Frontend (port 5173)
echo  ==========================================
echo.

if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
    echo.
)

echo Starting Frontend (Vite)...
echo.

start /b npm run dev
timeout /t 5 /nobreak >nul

tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I "node.exe" >nul
if %ERRORLEVEL% EQU 0 (
    title Art Gallery Frontend - Running on :5173
    echo Frontend started successfully!
    echo App: http://localhost:5173
    echo.
    start http://localhost:5173
) else (
    title Art Gallery Frontend - FAILED
    echo Frontend failed to start!
    echo Check the output above for errors.
)

cmd /k
"@

$manualCmd = @"
@echo off
title Art Gallery - Manual Commands
cd /d "E:\WEBSITES\Art Gallery"
echo.
echo  ==========================================
echo   Art Gallery - Manual Commands
echo  ==========================================
echo.
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:3001
echo   Health   : http://localhost:3001/api/health
echo   Admin    : http://localhost:5173/admin
echo.
echo   Useful commands:
echo     git add . ^&^& git commit -m "" ^&^& git push   - Deploy to Vercel
echo     npm run build --workspace=frontend             - Production build
echo.
echo   Live site : https://images.twoseven.art
echo   Supabase  : https://supabase.com/dashboard/project/ytsnunmoqjbfzxjuzbmm
echo.
echo  Ready for commands...
echo.
powershell -NoExit -Command "Set-Location 'E:\WEBSITES\Art Gallery'"
"@

# Write temp batch files
$backendCmd  | Out-File -FilePath "$env:TEMP\ag-backend.bat"  -Encoding ASCII
$frontendCmd | Out-File -FilePath "$env:TEMP\ag-frontend.bat" -Encoding ASCII
$manualCmd   | Out-File -FilePath "$env:TEMP\ag-manual.bat"   -Encoding ASCII

# Launch Windows Terminal with three tabs
wt.exe --title "AG Backend - Starting..." cmd /k "$env:TEMP\ag-backend.bat" `; new-tab --title "AG Frontend - Starting..." cmd /k "$env:TEMP\ag-frontend.bat" `; new-tab --title "AG Manual" cmd /k "$env:TEMP\ag-manual.bat"
