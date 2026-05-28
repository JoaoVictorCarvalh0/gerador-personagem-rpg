# Parallel RPG Character Generator

Sistema backend para a disciplina de **Sistemas Paralelos e Distribuídos**.

Arquitetura Produtor-Consumidor: **Flask → Redis → Celery Workers → PostgreSQL**

## Stack

| Componente | Tecnologia |
|---|---|
| API REST | Flask 3.x |
| Broker de mensagens | Redis 7.x |
| Workers | Celery 5.x |
| Persistência | PostgreSQL 15.x |
| Paralelismo interno | multiprocessing.Pool |
| Avatar PNG | Pillow 10.x |
| Orquestração | Docker Compose |
| Benchmark | Locust 2.x |

## Como rodar

### Pré-requisitos

- Docker e Docker Compose instalados

### 1. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

### 2. Suba todos os serviços

```bash
docker-compose up --build
```

### 3. Escalar workers (em outro terminal)

```bash
docker-compose up --scale worker=4
```

## Como testar

### Criar personagem

```bash
curl -X POST http://localhost:5000/gerar-personagem \
  -H "Content-Type: application/json" \
  -d '{"name":"Thordak","class":"guerreiro","race":"anão","main_color":"#8B0000","secondary_color":"#FFD700"}'
```

Resposta (HTTP 202):
```json
{ "task_id": "some-uuid-here" }
```

### Consultar status

```bash
curl http://localhost:5000/status/<task_id>
```

Resposta quando concluído:
```json
{
  "status": "done",
  "character": {
    "id": "...",
    "name": "Thordak",
    "class": "guerreiro",
    "race": "anão",
    "base_attributes": { "FOR": 16, "DES": 12, "INT": 10, "CON": 14, "SAB": 9, "CAR": 11 },
    "derived_attributes": { "dano": 9.2, "defesa": 13.8, "critico": 17.0, "velocidade_ataque": 1.28 },
    "avatar_path": "/avatars/<task_id>.png"
  }
}
```

## Benchmark de carga

```bash
pip install locust
locust -f benchmark/locustfile.py --host http://localhost:5000
```

Acesse a UI do Locust em http://localhost:8089 e configure:
- 10 usuários simultâneos (spawn rate 1/s)
- 50 usuários simultâneos
- 100 usuários simultâneos
- 500 usuários simultâneos

## Arquitetura

```
POST /gerar-personagem
        │
        ▼
    Flask API ──── responde 202 imediatamente
        │
        │  envia task (Celery protocol)
        ▼
      Redis ◄──────────── GET /status/{id} lê aqui
        │
        │  consome task
        ▼
   Celery Worker
        ├── roll_base_attributes()        (random)
        ├── validate_class_eligibility()  (regras D&D)
        ├── calculate_derived_attributes() ── multiprocessing.Pool(4)
        │       ├── _calc_damage()
        │       ├── _calc_defense()
        │       ├── _calc_crit()
        │       └── _calc_attack_speed()
        ├── generate_avatar()             (Pillow PNG, 6 camadas)
        ├── save_character()              (SQLAlchemy → PostgreSQL)
        └── redis.set status="done"
```

## Classes e pré-requisitos

| Classe | Atributo mínimo |
|---|---|
| guerreiro | FOR ≥ 13 |
| mago | INT ≥ 13 |
| arqueiro | DES ≥ 13 |
| ladino | DES ≥ 12, INT ≥ 11 |
| clérigo | SAB ≥ 13 |

## Raças disponíveis

`humano`, `elfo`, `anão`, `halfling`, `tiefling`
