@echo off
echo ========================================
echo    INICIANDO AUTH-SERVICE
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
docker rmi auth-service:latest 2>nul

echo [3/4] Construindo nova imagem...
docker-compose build --no-cache

if %errorlevel% neq 0 (
    echo ERRO: Falha ao construir a imagem!
    pause
    exit /b 1
)

echo [4/4] Iniciando auth-service...
docker-compose up -d

if %errorlevel% neq 0 (
    echo ERRO: Falha ao iniciar o serviço!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    AUTH-SERVICE INICIADO COM SUCESSO!
echo ========================================
echo.
echo Serviço rodando em: http://localhost:8080
echo.
echo Para ver os logs: docker-compose logs -f
echo Para parar: docker-compose down
echo.

REM Aguardar um pouco e verificar se está rodando
timeout /t 3 /nobreak >nul
docker-compose ps

echo.
echo Pressione qualquer tecla para sair...
pause >nul
