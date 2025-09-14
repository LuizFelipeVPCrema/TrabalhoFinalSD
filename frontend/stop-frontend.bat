@echo off
echo ========================================
echo    PARANDO FRONTEND
echo ========================================
echo.

echo Parando containers...
docker-compose down

echo Removendo containers parados...
docker container prune -f

echo.
echo ========================================
echo    FRONTEND PARADO COM SUCESSO!
echo ========================================
echo.
pause
