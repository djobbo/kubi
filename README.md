# kubi

## Prerequisites
- Bun
- Docker
- Nixpacks

Install dependencies:
```bash
bun install
```

Start the developement server:
> Create an `.env` file using `.env.example` as a template
```bash
bun dev
```

### Build/Deploy

run `bun web:build` to build the docker image for the frontend

then run `docker compose up`
