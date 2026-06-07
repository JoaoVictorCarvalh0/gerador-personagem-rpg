# Backend — Gerador de Personagens RPG

Stack: Flask → Redis → Workers Python (Producer-Consumer)

## Pré-requisitos

- Docker e Docker Compose instalados

## Configuração

```bash
cp .env.example .env
# editar .env e preencher POLLINATIONS_TOKEN
```

## Subir o backend

```bash
docker compose up --build
```

## Escalar workers

```bash
docker compose up --scale worker=4
```

## Endpoints

| Método | Path | Descrição |
|--------|------|-----------|
| POST | `/gerar-personagem` | Enfileira tarefa, retorna `{ task_id }` |
| GET | `/status/{task_id}` | Retorna `{ status, character }` |
| GET | `/avatar/{task_id}` | Serve o PNG gerado |

## Parar

```bash
docker compose down
```
