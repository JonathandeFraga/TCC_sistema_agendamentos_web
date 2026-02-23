# TCC_sistema_agendamentos_web
Trabalho de conclusão do curso de pós graduação Desenvolvimento Full Stack pela PUCRS.

Para avaliação, rodar com Docker Compose (evita instalar dependências localmente e conflito de versões)
- Pré-requisitos:
    - Docker + Docker Compose
    - Portas livres:
        - 8080 (frontend)
        - 3000 (API)
        - 5432 (PostgreSQL)

- Serviços:
    - O docker-compose.yml irá subir 3 containers:
        - db: PostgreSQL 16 (porta 5432)
        - server: NestJS API (porta 3000)
        - web: Vite build (SPA React) + Nginx (porta 8080)

- Subindo a aplicação web:
    - Na raiz do repositório (no local do arquivo docker-compose.yml) abra o Windows PowerShell e rode:
        - docker compose build --no-cache
        - docker compose up -d

- Acesso:
    - Frontend: http://localhost:8080
    - API: http://localhost:3000
    - Para acessar o db, ex via pgAdmin:
        - Host: localhost
        - Port: 5432
        - DB: tcc_agendamentos
        - User: tcc
        - Pass: tcc

- Seed do db (dados para testar funcionalidades):
    - O container do server executa automaticamente:
        - prima migrate deploy
        - prisma db seed
        - inicia a API
    - O seed irá criar serviços, feriados, usuários demo e agendamentos para avaliação do app web.

- Credenciais para testes (seed):
    - Profissional:
        - fone: +5551999990005
        - senha: 123456
    - Cliente (exemplo):
        - fone: +5551999999999
        - senha: 123456

- Variáveis importantes:
    - Variáveis vitais para funcionamento do app já são definidas no docker-compose.yml. As principais:
        - DATABASE_URL=postgresql://tcc:tcc@db:5432/tcc_agendamentos?schema=public
        - JWT_ACCESS_SECRET=...
        - JWT_ACCESS_TTL=900 (segundos)
    - No frontend, a URL da API é injetada no build via build-arg:
        - VITE_API_URL=http://localhost:3000

- Parando o container da aplicação web:
    - Na raiz do repositório (no local do arquivo docker-compose.yml) abra o Windows PowerShell e rode:
        - docker compose down
    - Para resetar completamente (⚠️ apaga todos os dados do db):
        - docker compose down -v --remove-orphans
        - docker compose up -d --build
    - Logs úteis para avaliação:
        - docker logs -f tcc_server
        - docker logs -f tcc_db
        - docker logs -f tcc_web