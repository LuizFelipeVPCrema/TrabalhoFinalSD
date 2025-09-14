@echo off
echo ========================================
echo    STATUS DOS SERVIÇOS
echo ========================================
echo.

echo [1/3] Verificando Auth Service...
cd auth-service
docker-compose ps
cd ..

echo.
echo [2/3] Verificando Backend Service...
cd backend-service
docker-compose ps
cd ..

echo.
echo [3/3] Verificando Frontend...
cd frontend
docker-compose ps
cd ..

echo.
echo ========================================
echo    VERIFICAÇÃO CONCLUÍDA
echo ========================================
echo.
echo Para ver logs de um serviço específico:
echo - Auth Service: cd auth-service ^&^& logs-auth-service.bat
echo - Backend Service: cd backend-service ^&^& logs-backend-service.bat
echo - Frontend: cd frontend ^&^& logs-frontend.bat
echo.

pause
