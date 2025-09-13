@echo off
echo 🚀 Iniciando Sistema de Estudos - Desenvolvimento
echo ==================================================

REM Verificar se Docker está rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente.
    pause
    exit /b 1
)

REM Parar containers existentes
echo 🛑 Parando containers existentes...
docker-compose down

REM Construir e iniciar os serviços
echo 🔨 Construindo e iniciando os serviços...
docker-compose up --build -d

REM Aguardar os serviços iniciarem
echo ⏳ Aguardando os serviços iniciarem...
timeout /t 10 /nobreak >nul

REM Verificar status dos serviços
echo 🔍 Verificando status dos serviços...

REM Auth Service
curl -s http://localhost:8080/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Auth Service: http://localhost:8080
) else (
    echo ❌ Auth Service: Não está respondendo
)

REM Backend Service
curl -s http://localhost:8081/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend Service: http://localhost:8081
) else (
    echo ❌ Backend Service: Não está respondendo
)

REM Frontend
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend: http://localhost:3000
) else (
    echo ❌ Frontend: Não está respondendo
)

echo.
echo 🎉 Sistema iniciado com sucesso!
echo 📱 Acesse: http://localhost:3000
echo 🔧 Para parar: docker-compose down
echo 📊 Para ver logs: docker-compose logs -f
pause
