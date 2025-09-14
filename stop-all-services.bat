@echo off
echo ========================================
echo    PARANDO TODOS OS SERVIÇOS
echo ========================================
echo.

echo [1/3] Parando Frontend...
cd frontend
call stop-frontend.bat
cd ..

echo [2/3] Parando Backend Service...
cd backend-service
call stop-backend-service.bat
cd ..

echo [3/3] Parando Auth Service...
cd auth-service
call stop-auth-service.bat
cd ..

echo.
echo ========================================
echo    TODOS OS SERVIÇOS PARADOS!
echo ========================================
echo.

pause
