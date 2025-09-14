@echo off
echo ========================================
echo    INICIANDO BACKEND-SERVICE
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

echo [1/4] Parando containers existentes...
docker-compose down

echo [2/4] Removendo imagens antigas...
docker rmi backend-service:latest 2>nul

echo [3/4] Construindo backend-service...
docker-compose build --no-cache

if %errorlevel% neq 0 (
    echo ERRO: Falha ao construir backend-service!
    pause
    exit /b 1
)

echo [4/4] Iniciando backend-service...
docker-compose up -d

if %errorlevel% neq 0 (
    echo ERRO: Falha ao iniciar os serviços!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    BACKEND-SERVICE INICIADO COM SUCESSO!
echo ========================================
echo.
echo Backend Service: http://localhost:8081
echo.
echo IMPORTANTE: O Auth Service deve estar rodando em http://localhost:8080
echo.
echo Para ver os logs: docker-compose logs -f
echo Para parar: docker-compose down
echo.

REM Aguardar um pouco e verificar se está rodando
timeout /t 5 /nobreak >nul
docker-compose ps

echo.
echo Pressione qualquer tecla para sair...
pause >nul
