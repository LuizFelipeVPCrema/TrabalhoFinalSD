# Auth Service - Deploy Individual

Este é o micro-serviço de autenticação do sistema acadêmico.

## 🚀 Como Iniciar

### Opção 1: Script Automático (Recomendado)
```bash
# Execute o script de inicialização
start-auth-service.bat
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

- `start-auth-service.bat` - Inicia o serviço
- `stop-auth-service.bat` - Para o serviço
- `logs-auth-service.bat` - Visualiza os logs

## 🌐 Acesso

- **URL**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

## ⚙️ Configurações

### Variáveis de Ambiente
- `PORT`: Porta do serviço (padrão: 8080)
- `JWT_SECRET`: Chave secreta para JWT (altere em produção)

### Portas
- **8080**: Serviço principal

## 🔧 Comandos Úteis

```bash
# Ver status dos containers
docker-compose ps

# Reconstruir sem cache
docker-compose build --no-cache

# Ver logs em tempo real
docker-compose logs -f auth-service

# Entrar no container
docker exec -it auth-service sh
```

## 🚨 Troubleshooting

### Erro: "Docker não está rodando"
- Inicie o Docker Desktop
- Verifique se o Docker está funcionando: `docker version`

### Erro: "Porta já em uso"
- Verifique se outro serviço está usando a porta 8080
- Pare outros containers: `docker-compose down`

### Erro: "Falha ao construir"
- Verifique se todos os arquivos estão presentes
- Execute: `docker-compose build --no-cache`
