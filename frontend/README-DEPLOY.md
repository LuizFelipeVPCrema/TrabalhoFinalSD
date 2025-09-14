# Frontend - Deploy Individual

Este é o frontend React do sistema acadêmico.

## 🚀 Como Iniciar

### Opção 1: Script Automático (Recomendado)
```bash
# Execute o script de inicialização
start-frontend.bat
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

- `start-frontend.bat` - Inicia o frontend
- `stop-frontend.bat` - Para o frontend
- `logs-frontend.bat` - Visualiza os logs

## 🌐 Acesso

- **Frontend**: http://localhost:3000

## ⚙️ Configurações

### Variáveis de Ambiente
- `REACT_APP_AUTH_SERVICE_URL`: URL do auth-service (padrão: http://localhost:8080)
- `REACT_APP_BACKEND_SERVICE_URL`: URL do backend-service (padrão: http://localhost:8081)
- `CHOKIDAR_USEPOLLING`: Habilita polling para hot reload (padrão: true)

### Portas
- **3000**: Frontend React

## 🔧 Comandos Úteis

```bash
# Ver status dos containers
docker-compose ps

# Reconstruir sem cache
docker-compose build --no-cache

# Ver logs em tempo real
docker-compose logs -f frontend

# Entrar no container
docker exec -it frontend sh
```

## 🚨 Troubleshooting

### Erro: "Docker não está rodando"
- Inicie o Docker Desktop
- Verifique se o Docker está funcionando: `docker version`

### Erro: "Porta já em uso"
- Verifique se outro serviço está usando a porta 3000
- Pare outros containers: `docker-compose down`

### Erro: "Falha ao construir"
- Verifique se todos os arquivos estão presentes
- Execute: `docker-compose build --no-cache`

### Erro: "Não consegue conectar com backend"
- Verifique se os serviços backend estão rodando:
  - Auth Service: http://localhost:8080
  - Backend Service: http://localhost:8081
- Verifique as variáveis de ambiente de conexão

### Erro: "Hot reload não funciona"
- Verifique se `CHOKIDAR_USEPOLLING=true` está definido
- Reinicie o container: `docker-compose restart`
