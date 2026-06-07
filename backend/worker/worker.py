import json
import logging
import os
import threading
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import redis as redis_lib

from character import generate_base_attributes, generate_derived_attributes
from openai_img import generate_avatar

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [worker] %(levelname)s %(message)s",
)
log = logging.getLogger(__name__)

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
rdb = redis_lib.from_url(REDIS_URL, decode_responses=True)

AVATARS_DIR = Path("/app/avatars")
AVATARS_DIR.mkdir(parents=True, exist_ok=True)

TASK_TTL = 3600


def _set_status(task_id: str, payload: dict) -> None:
    rdb.set(f"rpg:task:{task_id}", json.dumps(payload), ex=TASK_TTL)


def process_job(job: dict) -> None:
    task_id = job["task_id"]
    char_class = job["class"]
    race = job["race"]
    name = job.get("name") or "Aventureiro"

    log.info("Processando task %s — %s %s", task_id, race, char_class)
    _set_status(task_id, {"status": "processing", "character": None, "error": None})

    try:
        with ThreadPoolExecutor(max_workers=2) as pool:
            future_attrs = pool.submit(generate_base_attributes, race, char_class)
            future_avatar = pool.submit(generate_avatar, task_id, job, AVATARS_DIR)

            base_attributes = future_attrs.result()
            derived_attributes = generate_derived_attributes(base_attributes, char_class)
            avatar_path = future_avatar.result()

        character = {
            "id": task_id,
            "name": name,
            "class": char_class,
            "race": race,
            "base_attributes": base_attributes,
            "derived_attributes": derived_attributes,
            "avatar_path": f"avatars/{task_id}.png",
        }

        _set_status(task_id, {"status": "done", "character": character, "error": None})
        log.info("Task %s concluída", task_id)

    except Exception as exc:
        log.exception("Erro na task %s", task_id)
        _set_status(task_id, {"status": "error", "character": None, "error": str(exc)})


def main() -> None:
    log.info("Worker iniciado. Aguardando tarefas em rpg:queue...")
    while True:
        try:
            _, raw = rdb.brpop("rpg:queue")
            job = json.loads(raw)
            thread = threading.Thread(target=process_job, args=(job,), daemon=True)
            thread.start()
        except Exception:
            log.exception("Erro ao consumir fila")


if __name__ == "__main__":
    main()
