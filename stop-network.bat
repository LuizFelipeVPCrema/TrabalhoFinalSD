@echo off
echo ========================================
echo    PARANDO SERVIÇOS COM IPs FIXOS
echo ========================================
echo.

echo Parando todos os serviços...
docker-compose down

echo.
echo ✅ Todos os serviços foram parados!
echo.
pause 