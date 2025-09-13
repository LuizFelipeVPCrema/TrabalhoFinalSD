#!/bin/bash

echo "🚀 Iniciando Sistema de Estudos - Desenvolvimento"
echo "=================================================="

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente."
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Construir e iniciar os serviços
echo "🔨 Construindo e iniciando os serviços..."
docker-compose up --build -d

# Aguardar os serviços iniciarem
echo "⏳ Aguardando os serviços iniciarem..."
sleep 10

# Verificar status dos serviços
echo "🔍 Verificando status dos serviços..."

# Auth Service
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Auth Service: http://localhost:8080"
else
    echo "❌ Auth Service: Não está respondendo"
fi

# Backend Service
if curl -s http://localhost:8081/health > /dev/null; then
    echo "✅ Backend Service: http://localhost:8081"
else
    echo "❌ Backend Service: Não está respondendo"
fi

# Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: http://localhost:3000"
else
    echo "❌ Frontend: Não está respondendo"
fi

echo ""
echo "🎉 Sistema iniciado com sucesso!"
echo "📱 Acesse: http://localhost:3000"
echo "🔧 Para parar: docker-compose down"
echo "📊 Para ver logs: docker-compose logs -f"
