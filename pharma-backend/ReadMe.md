# Pharma Backend

API REST para gestão de farmácia com autenticação JWT, CRUD de medicamentos, vendas e administração de utilizadores. Desenvolvido com **FastAPI**, **SQLModel** e **SQLite**.

## Stack

| Tecnologia   | Finalidade                          |
|--------------|-------------------------------------|
| FastAPI      | Framework web assíncrono           |
| SQLModel     | ORM baseado em SQLAlchemy + Pydantic|
| SQLite       | Base de dados local (desenvolvimento)|
| Passlib      | Hashing de passwords (SHA256-Crypt) |
| python-jose  | Geração e validação de tokens JWT  |
| Uvicorn      | Servidor ASGI                       |

## Estrutura
pharma-backend/
├── app/
│ ├── main.py # Ponto de entrada da aplicação
│ ├── database.py # Configuração do SQLite + Sessão
│ ├── dependencies.py # Dependência de autenticação (get_current_user)
│ ├── models/
│ │ └── models.py # Modelos: User, Product, Sale
│ ├── schemas/
│ │ └── schemas.py # Schemas Pydantic para request/response
│ ├── routers/
│ │ ├── auth.py # Rotas de autenticação (login, me)
│ │ ├── products.py # CRUD de medicamentos
│ │ ├── sales.py # Registo e listagem de vendas
│ │ └── users.py # Gestão de utilizadores (admin)
│ ├── services/
│ │ └── mock_data.py # Seed de dados mock (executado no arranque)
│ └── utils/
│ └── security.py # Hash de passwords, criação/verificação de tokens
├── requirements.txt
└── README.md

text

## Como executar

### 1. Criar e ativar ambiente virtual (PowerShell)


python -m venv venv
.\venv\Scripts\activate

2. Instalar dependências

pip install -r requirements.txt

3. Iniciar o servidor

uvicorn app.main:app --reload --port 8000

A API ficará disponível em http://localhost:8000.

4. Documentação interativa (Swagger)
Swagger UI: http://localhost:8000/docs

ReDoc: http://localhost:8000/redoc

## Autenticação
A API utiliza tokens JWT. Para obter um token:

POST /auth/login
Body (form-data):

text
username: admin
password: admin123
Credenciais disponíveis (criadas pelo seed):

Utilizador	Password	Papel
admin	admin123	admin
farmacia	farma123	pharmacist
Inclua o token nas requisições protegidas:

text
Authorization: Bearer <token>

## Endpoints principais
Auth
POST /auth/login → Login

GET /auth/me → Dados do utilizador autenticado

Produtos
GET /products/ → Listar todos os produtos

POST /products/ → Criar produto (apenas admin)

PUT /products/{id} → Actualizar produto (apenas admin)

Vendas
GET /sales/ → Listar todas as vendas

POST /sales/ → Registar uma venda

Utilizadores (admin)
GET /users/ → Listar todos os utilizadores

PUT /users/{id}/toggle-active → Activar/desactivar utilizador

## Dados Mock
Na primeira execução, o sistema popula automaticamente a base de dados com:

8 medicamentos de categorias variadas

2 utilizadores (admin + farmacêutico)

50 vendas geradas aleatoriamente nos últimos 30 dias

A base de dados é guardada no ficheiro pharma.db (SQLite).