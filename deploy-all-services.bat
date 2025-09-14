@echo off
echo ========================================
echo    DEPLOY DE TODOS OS SERVIÇOS
echo ========================================
echo.

REM Verificar se o Docker está rodando
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Docker não está rodando ou não está instalado!
    echo Por favor, inicie o Docker Desktop e tente novamente.
    pause
    exit /b 1
)

echo [1/4] Iniciando Auth Service...
cd auth-service
call start-auth-service.bat
if %errorlevel% neq 0 (
    echo ERRO: Falha ao iniciar Auth Service!
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Aguardando Auth Service estabilizar...
timeout /t 10 /nobreak >nul

echo [3/4] Iniciando Backend Service...
cd backend-service
call start-backend-service.bat
if %errorlevel% neq 0 (
    echo ERRO: Falha ao iniciar Backend Service!
    pause
    exit /b 1
)
cd ..

echo.
echo [4/4] Aguardando Backend Service estabilizar...
timeout /t 10 /nobreak >nul

echo [5/5] Iniciando Frontend...
cd frontend
call start-frontend.bat
if %errorlevel% neq 0 (
    echo ERRO: Falha ao iniciar Frontend!
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo    TODOS OS SERVIÇOS INICIADOS!
echo ========================================
echo.
echo 🌐 Acesse o sistema em: http://localhost:3000
echo.
echo 📊 Status dos serviços:
echo - Auth Service: http://localhost:8080
echo - Backend Service: http://localhost:8081
echo - Frontend: http://localhost:3000
echo.
echo Para parar todos os serviços, execute: stop-all-services.bat
echo.

pause
