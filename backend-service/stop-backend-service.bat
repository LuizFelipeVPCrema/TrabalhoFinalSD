@echo off
echo ========================================
echo    PARANDO BACKEND-SERVICE
echo ========================================
echo.

echo Parando containers...
docker-compose down

echo Removendo containers parados...
docker container prune -f

echo.
echo ========================================
echo    BACKEND-SERVICE PARADO COM SUCESSO!
echo ========================================
echo.
pause
