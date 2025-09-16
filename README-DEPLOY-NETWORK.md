# Deploy com IPs Fixos - Trabalho Final SD

Este documento descreve como executar os serviços em computadores diferentes com IPs específicos.

## Configuração dos Serviços

### IPs Configurados:
- **Frontend**: 172.20.10.2:3000
- **Backend Service**: 172.20.10.3:8081  
- **Auth Service**: 172.20.10.4:8080

## Deploy com Docker Compose (Recomendado)

### Executar todos os serviços
```bash
docker-compose up --build -d
```

### Verificar status
```bash
docker-compose ps
docker-compose logs -f
```

### Parar serviços
```bash
docker-compose down
```

## Verificação da Comunicação

### Health Checks
- Auth Service: `curl http://172.20.10.4:8080/health`
- Backend Service: `curl http://172.20.10.3:8081/health`
- Frontend: `curl http://172.20.10.2:3000`

## Variáveis de Ambiente Configuradas

### Auth Service
- `PORT=8080`
- `JWT_SECRET=your-secret-key-here-change-in-production`

### Backend Service  
- `PORT=8081`
- `AUTH_SERVICE_URL=http://172.20.10.4:8080`

### Frontend
- `REACT_APP_AUTH_SERVICE_URL=http://172.20.10.4:8080`
- `REACT_APP_BACKEND_SERVICE_URL=http://172.20.10.3:8081` 