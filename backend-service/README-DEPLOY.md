# Backend Service - Deploy Individual

Este é o micro-serviço principal do sistema acadêmico.

## 🚀 Como Iniciar

### Opção 1: Script Automático (Recomendado)
```bash
# Execute o script de inicialização
start-backend-service.bat
```

### Opção 2: Comandos Manuais
```bash
# Construir e iniciar
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## 📋 Scripts Disponíveis

- `start-backend-service.bat` - Inicia o serviço
- `stop-backend-service.bat` - Para o serviço
- `logs-backend-service.bat` - Visualiza os logs

## 🌐 Acesso

- **Backend Service**: http://localhost:8081
- **Health Check**: http://localhost:8081/health

## ⚠️ Pré-requisitos

- **Auth Service** deve estar rodando em http://localhost:8080
- Inicie o auth-service primeiro: `cd ../auth-service && start-auth-service.bat`

## ⚙️ Configurações

### Variáveis de Ambiente
- `PORT`: Porta do serviço (padrão: 8081)
- `AUTH_SERVICE_URL`: URL do auth-service (padrão: http://host.docker.internal:8080)

### Porta
- **8081**: Backend Service

## 🔧 Comandos Úteis

```bash
# Ver status dos containers
docker-compose ps

# Reconstruir sem cache
docker-compose build --no-cache

# Ver logs de um serviço específico
docker-compose logs -f backend-service
docker-compose logs -f auth-service

# Entrar no container
docker exec -it backend-service sh
```

## 🚨 Troubleshooting

### Erro: "Docker não está rodando"
- Inicie o Docker Desktop
- Verifique se o Docker está funcionando: `docker version`

### Erro: "Porta já em uso"
- Verifique se outro serviço está usando as portas 8080 ou 8081
- Pare outros containers: `docker-compose down`

### Erro: "Falha ao conectar com auth-service"
- Verifique se o auth-service está rodando em http://localhost:8080
- Inicie o auth-service primeiro: `cd ../auth-service && start-auth-service.bat`
- Verifique a URL de conexão nas variáveis de ambiente
