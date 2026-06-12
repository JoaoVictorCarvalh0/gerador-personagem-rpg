"""
locustfile.py — Testes de desempenho: Gerador Paralelo de Personagens RPG
=========================================================================
Cenários cobertos:
  1. CargaLeve     —  5 usuários, ramp 1/s   → baseline
  2. CargaMedia    — 20 usuários, ramp 2/s   → uso normal
  3. CargaPesada   — 50 usuários, ramp 5/s   → estresse
  4. PicoRepentino — 50 usuários, ramp 50/s  → spike test
  5. Resistencia   — 20 usuários, ramp 2/s, duração longa → soak test

Uso rápido (rode em terminais separados, um por cenário):

  # 1. Sobe o projeto com N workers
  docker compose up -d --scale worker=1   # baseline sequencial

  # 2. Instala o Locust
  pip install locust

  # 3. Roda o teste
  locust -f locustfile.py --host=http://localhost:5001 \
         --users=20 --spawn-rate=2 --run-time=2m --headless \
         --csv=resultados/cenario_1worker_20users

  # 4. Troca workers e repete
  docker compose up -d --scale worker=2
  locust -f locustfile.py --host=http://localhost:5001 \
         --users=20 --spawn-rate=2 --run-time=2m --headless \
         --csv=resultados/cenario_2workers_20users

  # 5. Repete para 4 workers
  docker compose up -d --scale worker=4
  locust -f locustfile.py --host=http://localhost:5001 \
         --users=20 --spawn-rate=2 --run-time=2m --headless \
         --csv=resultados/cenario_4workers_20users
"""

import random
import time
import uuid

from locust import HttpUser, TaskSet, between, events, task
from locust.exception import StopUser

# ── Dados de teste ────────────────────────────────────────────────────────────

CLASSES = ["guerreiro", "mago", "arqueiro", "ladino", "clérigo"]
RACES   = ["humano", "elfo", "anão", "halfling", "tiefling"]
COLORS  = ["#8B0000", "#1a237e", "#1b5e20", "#4a148c", "#e65100"]

# Usuário de teste fixo — crie antes de rodar ou deixa o Locust criar
TEST_USER     = "locust_test"
TEST_PASSWORD = "locust123"


# ── Comportamento do usuário ──────────────────────────────────────────────────

class RPGUserBehavior(TaskSet):
    """
    Fluxo completo de um usuário:
      1. Registra (se não existir)
      2. Faz login e guarda o JWT
      3. Gera um personagem (enfileira)
      4. Faz polling até o personagem ficar pronto
      5. Repete a geração (simula usuário gerando múltiplos personagens)
    """

    token: str = None

    def on_start(self):
        """Executado uma vez por usuário virtual ao iniciar."""
        # Cria um usuário único por worker do Locust para evitar conflitos
        self.username = f"locust_{uuid.uuid4().hex[:8]}"
        self.password = "locust123"
        self._register()
        self._login()

    def on_stop(self):
        pass

    # ── Auth ──────────────────────────────────────────────────────────────────

    def _register(self):
        self.client.post(
            "/register",
            json={"username": self.username, "password": self.password},
            name="/register",
        )
        # ignora erro 409 (usuário já existe) — normal em reruns

    def _login(self):
        with self.client.post(
            "/login",
            json={"username": self.username, "password": self.password},
            name="/login",
            catch_response=True,
        ) as resp:
            if resp.status_code == 200:
                self.token = resp.json().get("token")
                resp.success()
            else:
                resp.failure(f"Login falhou: {resp.status_code} {resp.text}")
                raise StopUser()

    def _headers(self):
        return {"Authorization": f"Bearer {self.token}"}

    # ── Tarefas ───────────────────────────────────────────────────────────────

    @task(10)
    def gerar_e_aguardar(self):
        """
        Tarefa principal (peso 10):
        Gera um personagem e faz polling até concluir.
        Mede o tempo total de resposta ponta-a-ponta.
        """
        payload = {
            "name":             f"Herói {random.randint(1, 9999)}",
            "class":            random.choice(CLASSES),
            "race":             random.choice(RACES),
            "main_color":       random.choice(COLORS),
            "secondary_color":  random.choice(COLORS),
        }

        # Enfileira a tarefa
        with self.client.post(
            "/gerar-personagem",
            json=payload,
            headers=self._headers(),
            name="/gerar-personagem",
            catch_response=True,
        ) as resp:
            if resp.status_code != 202:
                resp.failure(f"Esperado 202, recebeu {resp.status_code}")
                return
            task_id = resp.json().get("task_id")
            resp.success()

        if not task_id:
            return

        # Polling — aguarda até status=done ou timeout 60s
        inicio    = time.time()
        tentativas = 0
        while time.time() - inicio < 60:
            tentativas += 1
            with self.client.get(
                f"/status/{task_id}",
                headers=self._headers(),
                name="/status/[task_id]",
                catch_response=True,
            ) as status_resp:
                if status_resp.status_code != 200:
                    status_resp.failure(f"Status HTTP {status_resp.status_code}")
                    break

                data   = status_resp.json()
                status = data.get("status", "")

                if status in ("done", "concluido", "concluída", "completed"):
                    status_resp.success()
                    break
                elif status in ("error", "erro"):
                    status_resp.failure(f"Worker reportou erro: {data.get('error')}")
                    break
                else:
                    status_resp.success()  # ainda processando — ok

            time.sleep(0.5)

    @task(3)
    def listar_personagens(self):
        """Tarefa secundária (peso 3): lista personagens do usuário."""
        with self.client.get(
            "/personagens",
            headers=self._headers(),
            name="/personagens",
            catch_response=True,
        ) as resp:
            if resp.status_code == 200:
                resp.success()
            else:
                resp.failure(f"HTTP {resp.status_code}")

    @task(1)
    def gerar_sem_aguardar(self):
        """
        Tarefa de stress (peso 1):
        Enfileira sem fazer polling — simula usuários que
        abandonam a requisição, testando acúmulo de fila.
        """
        self.client.post(
            "/gerar-personagem",
            json={
                "name":  f"NPC {random.randint(1, 999)}",
                "class": random.choice(CLASSES),
                "race":  random.choice(RACES),
            },
            headers=self._headers(),
            name="/gerar-personagem [fire-and-forget]",
        )


# ── Classes de usuário por cenário ────────────────────────────────────────────

class UsuarioRPG(HttpUser):
    """
    Usuário padrão para todos os cenários.
    Ajuste --users e --spawn-rate na linha de comando.
    """
    tasks      = [RPGUserBehavior]
    wait_time  = between(1, 3)   # espera 1-3s entre tarefas (comportamento realista)
    host       = "http://localhost:5001"


# ── Hook: imprime resumo ao final ─────────────────────────────────────────────

@events.quitting.add_listener
def on_quitting(environment, **kwargs):
    stats = environment.stats
    print("\n" + "═" * 60)
    print("  RESUMO DO TESTE")
    print("═" * 60)

    for name, entry in stats.entries.items():
        if entry.num_requests == 0:
            continue
        print(f"\n  {name[1]}")
        print(f"    Requisições  : {entry.num_requests}")
        print(f"    Falhas       : {entry.num_failures}")
        print(f"    Mediana (ms) : {entry.median_response_time:.0f}")
        print(f"    P95 (ms)     : {entry.get_response_time_percentile(0.95):.0f}")
        print(f"    P99 (ms)     : {entry.get_response_time_percentile(0.99):.0f}")
        print(f"    RPS          : {entry.current_rps:.1f}")

    total = stats.total
    print(f"\n  TOTAL")
    print(f"    Requisições  : {total.num_requests}")
    print(f"    Falhas       : {total.num_failures} ({total.fail_ratio*100:.1f}%)")
    print(f"    Mediana (ms) : {total.median_response_time:.0f}")
    print(f"    P95 (ms)     : {total.get_response_time_percentile(0.95):.0f}")
    print(f"    RPS máx      : {total.total_rps:.1f}")
    print("═" * 60 + "\n")