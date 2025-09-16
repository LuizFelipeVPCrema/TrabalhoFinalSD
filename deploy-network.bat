@echo off
echo ========================================
echo    DEPLOY COM IPs FIXOS - TRABALHO SD
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

echo [1/3] Parando serviços existentes...
docker-compose down >nul 2>&1

echo [2/3] Construindo e iniciando todos os serviços...
docker-compose up --build -d
if %errorlevel% neq 0 (
    echo ERRO: Falha ao iniciar os serviços!
    pause
    exit /b 1
)

echo [3/3] Aguardando serviços estabilizarem...
timeout /t 15 /nobreak >nul

echo.
echo ========================================
echo    TODOS OS SERVIÇOS INICIADOS!
echo ========================================
echo.
echo 🌐 IPs Configurados:
echo - Frontend:     http://172.20.10.2:3000
echo - Backend:      http://172.20.10.3:8081
echo - Auth Service: http://172.20.10.4:8080
echo.
echo 📊 Verificar status:
echo   docker-compose ps
echo.
echo 📋 Ver logs:
echo   docker-compose logs -f
echo.
echo 🛑 Para parar:
echo   docker-compose down
echo.

REM Verificar se os serviços estão rodando
echo Verificando status dos serviços...
docker-compose ps

echo.
echo ✅ Deploy concluído com sucesso!
echo.
pause 