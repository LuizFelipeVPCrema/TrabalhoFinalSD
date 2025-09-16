@echo off
echo ========================================
echo    STATUS DOS SERVIÇOS COM IPs FIXOS
echo ========================================
echo.

echo 📊 Status dos containers:
docker-compose ps

echo.
echo 🌐 Testando conectividade:
echo.

echo Testando Auth Service (172.20.10.4:8080)...
curl -s http://172.20.10.4:8080/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Auth Service: ONLINE
) else (
    echo ❌ Auth Service: OFFLINE
)

echo Testando Backend Service (172.20.10.3:8081)...
curl -s http://172.20.10.3:8081/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend Service: ONLINE
) else (
    echo ❌ Backend Service: OFFLINE
)

echo Testando Frontend (172.20.10.2:3000)...
curl -s http://172.20.10.2:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend: ONLINE
) else (
    echo ❌ Frontend: OFFLINE
)

echo.
echo 📋 Para ver logs detalhados:
echo   docker-compose logs -f [service-name]
echo.
pause 