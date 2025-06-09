# Corehalla

## Prerequisites
- Bun
- Docker

Install dependencies:
```bash
bun install
```

Start the developement server:
> Create an `.env` file using `.env.example` as a template
```bash
bun dev
```

## Technologies
- Frontend (Typescript)
    - Logic & Templating
        - Typescript
    - Styling
        - TailwindCSS
        - PandaCSS
    - State Management
        - Tanstack Query (Server State)
        - Zustand (Client State)
    - Routing
        - Tanstack Router
    - Internationalization
        - LinguiJS

- Backend (Typescript)
    - Backend for Frontend
        - Tanstack Start (Server Functions)
    - Auth
        - Artic (OAuth2)

- Database (Postgres)
    - ORM
        - Drizzle ORM

- Build Tools
    - Vite
    - Bun
    - Docker

- Linting
    - Biome
    - Knip (Dead Code Elimination)
