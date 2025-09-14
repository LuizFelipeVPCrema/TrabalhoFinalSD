@echo off
echo ========================================
echo    LOGS DO BACKEND-SERVICE
echo ========================================
echo.
echo Pressione Ctrl+C para sair dos logs
echo.

docker-compose logs -f
