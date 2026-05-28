import os
import json
import redis
from celery import Celery
from attributes import roll_base_attributes, validate_class_eligibility, calculate_derived_attributes
from avatar import generate_avatar
from db import init_db, save_character

BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

celery_app = Celery("worker", broker=BROKER_URL)
celery_app.conf.task_serializer = "json"
celery_app.conf.accept_content = ["json"]
celery_app.conf.broker_connection_retry_on_startup = True

redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)


def _set_status(task_id: str, status: str, character: dict | None = None):
    redis_client.set(
        f"status:{task_id}",
        json.dumps({"status": status, "character": character}),
    )


@celery_app.task(name="worker.tasks.generate_character", bind=True, max_retries=3)
def generate_character(self, task_id: str, data: dict):
    try:
        _set_status(task_id, "processing")

        # Step 1 — deserialize (already done; data is a plain dict)
        name = data["name"]
        char_class = data["class"]
        race = data["race"]
        main_color = data["main_color"]
        secondary_color = data["secondary_color"]

        # Step 2 — roll base attributes (4d6 drop lowest)
        base_attrs = roll_base_attributes()

        # Step 3 — validate class eligibility (reroll once on failure)
        if not validate_class_eligibility(char_class, base_attrs):
            base_attrs = roll_base_attributes()

        # Step 4 — calculate derived attributes using multiprocessing.Pool
        derived_attrs = calculate_derived_attributes(base_attrs)

        # Step 5 — generate avatar PNG with Pillow
        avatar_path = generate_avatar(task_id, char_class, race, main_color, secondary_color)

        # Step 6 — persist to PostgreSQL
        init_db()
        save_character(
            task_id=task_id,
            name=name,
            char_class=char_class,
            race=race,
            base_attributes=base_attrs,
            derived_attributes=derived_attrs,
            avatar_path=avatar_path,
        )

        # Step 7 — update Redis status to done
        character_payload = {
            "id": task_id,
            "name": name,
            "class": char_class,
            "race": race,
            "base_attributes": base_attrs,
            "derived_attributes": derived_attrs,
            "avatar_path": avatar_path,
        }
        _set_status(task_id, "done", character_payload)

    except Exception as exc:
        _set_status(task_id, "error")
        raise self.retry(exc=exc, countdown=5)
