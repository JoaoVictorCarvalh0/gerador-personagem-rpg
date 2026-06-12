# Testes de Benchmark — Gerador Paralelo de Personagens RPG

Este documento descreve como executar os testes de carga do projeto usando o [Locust](https://locust.io/), comparando o desempenho da API sob diferentes quantidades de workers e usuários simultâneos.

---

## Pré-requisitos

### 1. Instalar as dependências

```bash
pip install locust pandas matplotlib
```

### 2. Criar as pastas de saída

```bash
mkdir resultados graficos
```

### 3. Confirmar que o projeto está rodando

Dentro da pasta `backend/`:

```bash
docker compose ps
```

Todos os serviços devem estar com status `Up` antes de iniciar os testes.

---

## Como executar

Cada cenário envolve dois comandos: escalar os workers via Docker e rodar o Locust a partir da raiz do projeto.

> **Dica:** rode o Cenário 1 primeiro para confirmar que o Locust consegue se comunicar com a API antes de executar todos os cenários.

### Cenário 1 — 1 worker, 10 usuários (baseline)

```bash
# Na pasta backend/
docker compose up -d --scale worker=1

# Na raiz do projeto
python -m locust -f locustfile.py --host=http://localhost:5001 --users=10 --spawn-rate=1 --run-time=2m --headless --csv=resultados/C1_1worker_10users
```

### Cenário 2 — 2 workers, 10 usuários

```bash
docker compose up -d --scale worker=2

python -m locust -f locustfile.py --host=http://localhost:5001 --users=10 --spawn-rate=1 --run-time=2m --headless --csv=resultados/C2_2workers_10users
```

### Cenário 3 — 4 workers, 10 usuários

```bash
docker compose up -d --scale worker=4

python -m locust -f locustfile.py --host=http://localhost:5001 --users=10 --spawn-rate=1 --run-time=2m --headless --csv=resultados/C3_4workers_10users
```

### Cenário 4 — 1 worker, 20 usuários

```bash
docker compose up -d --scale worker=1

python -m locust -f locustfile.py --host=http://localhost:5001 --users=20 --spawn-rate=2 --run-time=2m --headless --csv=resultados/C4_1worker_20users
```

### Cenário 5 — 2 workers, 20 usuários

```bash
docker compose up -d --scale worker=2

python -m locust -f locustfile.py --host=http://localhost:5001 --users=20 --spawn-rate=2 --run-time=2m --headless --csv=resultados/C5_2workers_20users
```

### Cenário 6 — 4 workers, 20 usuários

```bash
docker compose up -d --scale worker=4

python -m locust -f locustfile.py --host=http://localhost:5001 --users=20 --spawn-rate=2 --run-time=2m --headless --csv=resultados/C6_4workers_20users
```

---

## Analisar os resultados

Após rodar todos os cenários, execute o script de análise para gerar os gráficos:

```bash
python analisar_resultados.py
```

Os gráficos serão salvos na pasta `graficos/`.

---

## Estrutura de saída

```
resultados/
  C1_1worker_10users_stats.csv
  C1_1worker_10users_stats_history.csv
  ...

graficos/
  (imagens geradas pelo analisar_resultados.py)
```
