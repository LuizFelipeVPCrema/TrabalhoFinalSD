# Script para iniciar todos os serviços localmente (sem Docker)
Write-Host "🚀 Iniciando Sistema de Estudos - Desenvolvimento Local" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

# Função para iniciar serviço em nova janela
function Start-ServiceInNewWindow {
    param(
        [string]$ServiceName,
        [string]$WorkingDirectory,
        [string]$Command
    )
    
    Write-Host "🔧 Iniciando $ServiceName..." -ForegroundColor Yellow
    
    # Criar comando para nova janela
    $cmd = "cd '$WorkingDirectory'; $Command; Write-Host 'Pressione qualquer tecla para fechar...' -ForegroundColor Gray; `$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')"
    
    # Iniciar em nova janela do PowerShell
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd
}

# Verificar se Go está instalado
try {
    go version | Out-Null
    Write-Host "✅ Go está instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Go não está instalado. Por favor, instale o Go primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se Node.js está instalado
try {
    node --version | Out-Null
    Write-Host "✅ Node.js está instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não está instalado. Por favor, instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Iniciar Auth Service
Start-ServiceInNewWindow -ServiceName "Auth Service" -WorkingDirectory "auth-service" -Command "go run main.go"

# Aguardar um pouco
Start-Sleep -Seconds 3

# Iniciar Backend Service
Start-ServiceInNewWindow -ServiceName "Backend Service" -WorkingDirectory "backend-service" -Command "go run main.go"

# Aguardar um pouco
Start-Sleep -Seconds 3

# Iniciar Frontend
Start-ServiceInNewWindow -ServiceName "Frontend" -WorkingDirectory "frontend" -Command "npm start"

Write-Host ""
Write-Host "🎉 Todos os serviços foram iniciados em janelas separadas!" -ForegroundColor Green
Write-Host "📱 Acesse: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Auth Service: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🔧 Backend Service: http://localhost:8081" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
