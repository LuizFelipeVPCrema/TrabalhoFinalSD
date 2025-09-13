# Sistema de Estudos - Microserviços

Sistema completo de organização de estudos com arquitetura de microserviços, desenvolvido em Go e React.

## 🏗️ Arquitetura

O sistema é composto por 3 microserviços:

1. **Auth Service** (Porta 8080) - Autenticação e autorização
2. **Backend Service** (Porta 8081) - API para matérias e provas/trabalhos
3. **Frontend** (Porta 3000) - Interface React

## 🔐 Segurança e LGPD

- **Criptografia de Senhas**: SHA-256 + Salt único para cada usuário
- **JWT Tokens**: Autenticação stateless com expiração de 24h
- **Validação de Token**: Middleware de autenticação em todas as rotas protegidas
- **Conformidade LGPD**: Dados criptografados e armazenamento seguro

## 🚀 Como Executar

### Pré-requisitos

- Docker e Docker Compose instalados
- Go 1.21+ (para desenvolvimento local)
- Node.js 18+ (para desenvolvimento local)

### Execução com Docker

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd sistema-estudos

# Execute todos os serviços
docker-compose up --build

# Ou execute em background
docker-compose up -d --build
```

### Execução Local (Desenvolvimento)

#### 1. Auth Service
```bash
cd auth-service
go mod tidy
go run main.go
```

#### 2. Backend Service
```bash
cd backend-service
go mod tidy
go run main.go
```

#### 3. Frontend
```bash
cd frontend
npm install
npm start
```

## 📚 Funcionalidades

### Autenticação
- ✅ Registro de usuários
- ✅ Login com JWT
- ✅ Validação de tokens
- ✅ Criptografia de senhas (SHA-256 + Salt)

### Matérias
- ✅ Criar matéria (Nome, Descrição)
- ✅ Listar matérias do usuário
- ✅ Editar matéria
- ✅ Excluir matéria

### Provas e Trabalhos
- ✅ Criar prova/trabalho
  - Título
  - Conteúdos de Estudo
  - Anexos (lista)
  - Referências (lista)
  - Data de Entrega (opcional)
- ✅ Listar provas/trabalhos do usuário
- ✅ Editar prova/trabalho
- ✅ Excluir prova/trabalho
- ✅ Associação com matérias

### Dashboard
- ✅ Resumo geral
- ✅ Matérias recentes
- ✅ Próximas provas/trabalhos

## 🔌 APIs

### Auth Service (http://localhost:8080)

#### POST /register
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

#### POST /login
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

#### GET /validate
Headers: `Authorization: Bearer <token>`

### Backend Service (http://localhost:8081)

#### Matérias
- `GET /materias` - Listar matérias do usuário
- `POST /materias` - Criar matéria
- `PUT /materias/{id}` - Editar matéria
- `DELETE /materias/{id}` - Excluir matéria

#### Provas/Trabalhos
- `GET /provas-trabalhos` - Listar provas/trabalhos do usuário
- `POST /provas-trabalhos` - Criar prova/trabalho
- `PUT /provas-trabalhos/{id}` - Editar prova/trabalho
- `DELETE /provas-trabalhos/{id}` - Excluir prova/trabalho

**Todas as rotas do Backend Service requerem autenticação via JWT.**

## 🛠️ Tecnologias

### Backend
- **Go 1.21** - Linguagem principal
- **Gorilla Mux** - Router HTTP
- **JWT** - Autenticação
- **SHA-256** - Criptografia de senhas
- **Docker** - Containerização

### Frontend
- **React 18** - Framework JavaScript
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **CSS3** - Estilização

### Infraestrutura
- **Docker Compose** - Orquestração de containers
- **Microserviços** - Arquitetura distribuída

## 📁 Estrutura do Projeto

```
sistema-estudos/
├── auth-service/
│   ├── main.go
│   ├── go.mod
│   ├── Dockerfile
│   └── .dockerignore
├── backend-service/
│   ├── main.go
│   ├── go.mod
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Materias.js
│   │   │   ├── ProvasTrabalhos.js
│   │   │   └── Navbar.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
└── README.md
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Auth Service
- `PORT` - Porta do serviço (padrão: 8080)

#### Backend Service
- `PORT` - Porta do serviço (padrão: 8081)
- `AUTH_SERVICE_URL` - URL do Auth Service (padrão: http://auth-service:8080)

#### Frontend
- `REACT_APP_AUTH_SERVICE_URL` - URL do Auth Service
- `REACT_APP_BACKEND_SERVICE_URL` - URL do Backend Service

## 🚦 Status dos Serviços

- **Auth Service**: http://localhost:8080/health
- **Backend Service**: http://localhost:8081/health
- **Frontend**: http://localhost:3000

## 📝 Exemplos de Uso

### 1. Registrar Usuário
```bash
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"senha123"}'
```

### 2. Fazer Login
```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"senha123"}'
```

### 3. Criar Matéria
```bash
curl -X POST http://localhost:8081/materias \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-token>" \
  -d '{"nome":"Matemática","descricao":"Cálculo I"}'
```

### 4. Criar Prova/Trabalho
```bash
curl -X POST http://localhost:8081/provas-trabalhos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu-token>" \
  -d '{
    "titulo":"Prova de Cálculo",
    "conteudos_estudo":"Limites, Derivadas, Integrais",
    "anexos":["formulario.pdf","exercicios.pdf"],
    "referencias":["Livro: Stewart, Cálculo Vol.1","Site: Khan Academy"],
    "data_entrega":"2024-02-15T00:00:00Z",
    "materia_id":1
  }'
```

## 🔒 Segurança

- Senhas são criptografadas com SHA-256 + Salt único
- Tokens JWT com expiração de 24 horas
- Validação de autenticação em todas as rotas protegidas
- CORS configurado para permitir requisições do frontend
- Headers de segurança implementados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através do email.
