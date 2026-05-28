# RPG Character Generator

Sistema backend + app mobile para geração paralela de personagens de RPG (D&D 5e), desenvolvido para a disciplina de **Sistemas Paralelos e Distribuídos**.

## Arquitetura

```
POST /gerar-personagem
        │
        ▼
   Flask API ──── responde 202 imediatamente
        │
        │  publica task (protocolo Celery)
        ▼
      Redis ◄──────────────── GET /status/{id}
        │
        │  consome task
        ▼
  Celery Worker
        ├── roll_base_attributes()          4d6, descarta menor
        ├── validate_class_eligibility()    pré-requisitos D&D
        ├── calculate_derived_attributes()  multiprocessing.Pool(4)
        │       ├── dano
        │       ├── defesa
        │       ├── crítico
        │       └── velocidade de ataque
        ├── generate_avatar()               Pillow PNG (6 camadas)
        ├── save_character()                SQLAlchemy → PostgreSQL
        └── redis.set status="done"
```

## Stack

| Camada | Tecnologia |
|---|---|
| API REST | Python 3.11 · Flask 3.x |
| Broker / Cache | Redis 7.x |
| Workers | Celery 5.x |
| Banco de dados | PostgreSQL 15.x |
| Paralelismo interno | `multiprocessing.Pool` |
| Avatar | Pillow 10.x |
| Orquestração | Docker Compose |
| Benchmark | Locust 2.x |
| App mobile | React Native · Expo SDK 54 |

## Estrutura

```
rpg-character-generator/
├── api/                    Flask API (produtor)
│   ├── app.py
│   ├── schemas.py
│   ├── requirements.txt
│   └── Dockerfile
├── worker/                 Celery workers (consumidores)
│   ├── tasks.py
│   ├── attributes.py
│   ├── avatar.py
│   ├── db.py
│   ├── requirements.txt
│   └── Dockerfile
├── mobile/                 App React Native (Expo SDK 54)
│   ├── app/
│   ├── components/
│   ├── constants/
│   ├── services/
│   ├── storage/
│   └── package.json
├── benchmark/
│   └── locustfile.py
├── docker-compose.yml
└── .env.example
```

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 18+](https://nodejs.org/) (apenas para o app mobile)
- [Expo Go](https://expo.dev/go) no celular (opcional)

## Rodando o backend

```bash
# 1. Configure as variáveis de ambiente
cp .env.example .env

# 2. Suba todos os serviços
docker-compose up --build

# 3. Em outro terminal — escalar workers
docker-compose up --scale worker=4
```

Serviços disponíveis:

| Serviço | Endereço |
|---|---|
| API Flask | `http://localhost:5000` |
| Redis | `localhost:6379` |
| PostgreSQL | `localhost:5432` |

## Rodando o app mobile

```bash
cd mobile
npm install --legacy-peer-deps
npx expo start --port 8082
```

Edite `mobile/.env` com o IP da sua máquina:

```env
# Android Emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000

# Dispositivo físico (mesmo Wi-Fi)
EXPO_PUBLIC_API_URL=http://192.168.x.x:5000
```

## API

### `POST /gerar-personagem`

```json
{
  "name": "Thordak",
  "class": "guerreiro",
  "race": "anão",
  "main_color": "#8B0000",
  "secondary_color": "#FFD700"
}
```

**Classes:** `guerreiro` · `mago` · `arqueiro` · `ladino` · `clérigo`

**Raças:** `humano` · `elfo` · `anão` · `halfling` · `tiefling`

Resposta `202 Accepted`:
```json
{ "task_id": "uuid" }
```

### `GET /status/{task_id}`

```json
{
  "status": "pending | processing | done | error",
  "character": {
    "id": "uuid",
    "name": "Thordak",
    "class": "guerreiro",
    "race": "anão",
    "base_attributes":    { "FOR": 16, "DES": 12, "INT": 10, "CON": 14, "SAB": 9, "CAR": 11 },
    "derived_attributes": { "dano": 9.2, "defesa": 13.8, "critico": 17.0, "velocidade_ataque": 1.28 },
    "avatar_path": "/avatars/uuid.png"
  }
}
```

### `GET /avatar/{task_id}`

Retorna o avatar PNG do personagem.

## Benchmark

```bash
pip install locust
locust -f benchmark/locustfile.py --host http://localhost:5000
```

Acesse `http://localhost:8089` e simule **10 / 50 / 100 / 500** usuários simultâneos.

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `REDIS_HOST` | `redis` | Host do Redis |
| `REDIS_PORT` | `6379` | Porta do Redis |
| `CELERY_BROKER_URL` | `redis://redis:6379/0` | URL do broker Celery |
| `POSTGRES_USER` | `rpg` | Usuário do banco |
| `POSTGRES_PASSWORD` | `rpgpassword` | Senha do banco |
| `POSTGRES_DB` | `rpgdb` | Nome do banco |
| `DATABASE_URL` | — | URL completa PostgreSQL |
| `AVATAR_DIR` | `/avatars` | Diretório dos avatares PNG |
| `C_FORCE_ROOT` | `true` | Permite Celery rodar como root |

## Pré-requisitos de classe (D&D 5e)

| Classe | Requisito |
|---|---|
| Guerreiro | FOR ≥ 13 |
| Mago | INT ≥ 13 |
| Arqueiro | DES ≥ 13 |
| Ladino | DES ≥ 12 e INT ≥ 11 |
| Clérigo | SAB ≥ 13 |