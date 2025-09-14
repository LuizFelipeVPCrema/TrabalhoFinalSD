@echo off
echo ========================================
echo    PARANDO AUTH-SERVICE
echo ========================================
echo.

echo Parando containers...
docker-compose down

echo Removendo containers parados...
docker container prune -f

echo.
echo ========================================
echo    AUTH-SERVICE PARADO COM SUCESSO!
echo ========================================
echo.
pause
