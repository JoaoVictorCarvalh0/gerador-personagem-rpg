import random
from locust import HttpUser, task, between

CLASSES = ["guerreiro", "mago", "arqueiro", "ladino", "clérigo"]
RACES = ["humano", "elfo", "anão", "halfling", "tiefling"]
NAMES = ["Thordak", "Aelindra", "Brundar", "Pip", "Zara",
         "Orin", "Lyra", "Goruk", "Sable", "Cedric"]

HEX_COLORS = [
    "#8B0000", "#FFD700", "#0000CD", "#228B22",
    "#800080", "#FF4500", "#00CED1", "#C0C0C0",
]


def random_hex() -> str:
    return random.choice(HEX_COLORS)


class RPGUser(HttpUser):
    wait_time = between(0.5, 2.0)
    task_ids: list[str] = []

    @task(3)
    def create_character(self):
        payload = {
            "name": random.choice(NAMES),
            "class": random.choice(CLASSES),
            "race": random.choice(RACES),
            "main_color": random_hex(),
            "secondary_color": random_hex(),
        }
        with self.client.post("/gerar-personagem", json=payload, catch_response=True) as resp:
            if resp.status_code == 202:
                task_id = resp.json().get("task_id")
                if task_id:
                    self.task_ids.append(task_id)
                resp.success()
            else:
                resp.failure(f"POST /gerar-personagem returned {resp.status_code}")

    @task(1)
    def poll_status(self):
        if not self.task_ids:
            return
        task_id = random.choice(self.task_ids)
        with self.client.get(f"/status/{task_id}", catch_response=True) as resp:
            if resp.status_code == 200:
                resp.success()
            elif resp.status_code == 404:
                resp.failure("Task not found")
            else:
                resp.failure(f"GET /status returned {resp.status_code}")
