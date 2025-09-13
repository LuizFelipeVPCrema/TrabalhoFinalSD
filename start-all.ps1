# Script para iniciar todos os serviços do Sistema de Estudos
Write-Host "🚀 Iniciando Sistema de Estudos - Todos os Serviços" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Verificar se Docker está rodando
try {
    docker info | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente." -ForegroundColor Red
    exit 1
}

# Parar containers existentes
Write-Host "🛑 Parando containers existentes..." -ForegroundColor Yellow
docker-compose down

# Construir e iniciar os serviços
Write-Host "🔨 Construindo e iniciando os serviços..." -ForegroundColor Yellow
docker-compose up --build -d

# Aguardar os serviços iniciarem
Write-Host "⏳ Aguardando os serviços iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verificar status dos serviços
Write-Host "🔍 Verificando status dos serviços..." -ForegroundColor Yellow

# Auth Service
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Auth Service: http://localhost:8080" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Auth Service: Não está respondendo" -ForegroundColor Red
}

# Backend Service
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/health" -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend Service: http://localhost:8081" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend Service: Não está respondendo" -ForegroundColor Red
}

# Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend: http://localhost:3000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend: Não está respondendo" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Sistema iniciado com sucesso!" -ForegroundColor Green
Write-Host "📱 Acesse: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Para parar: docker-compose down" -ForegroundColor Yellow
Write-Host "📊 Para ver logs: docker-compose logs -f" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
