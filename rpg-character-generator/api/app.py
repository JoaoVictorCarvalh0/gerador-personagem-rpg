import os
import uuid
import json
from flask import Flask, request, jsonify, send_from_directory
from celery import Celery
import redis
from schemas import CharacterRequest, ValidationError

app = Flask(__name__)

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "redis"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=0,
    decode_responses=True,
)

celery_app = Celery(
    "worker",
    broker=os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0"),
)


@app.post("/gerar-personagem")
def gerar_personagem():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    try:
        char_req = CharacterRequest(**data)
    except (TypeError, ValidationError) as e:
        return jsonify({"error": str(e)}), 422

    task_id = str(uuid.uuid4())
    redis_client.set(f"status:{task_id}", json.dumps({"status": "pending", "character": None}))
    celery_app.send_task(
        "worker.tasks.generate_character",
        args=[task_id, char_req.to_dict()],
        task_id=task_id,
    )
    return jsonify({"task_id": task_id}), 202


@app.get("/status/<task_id>")
def get_status(task_id):
    raw = redis_client.get(f"status:{task_id}")
    if raw is None:
        return jsonify({"error": "Task not found"}), 404
    return jsonify(json.loads(raw)), 200


@app.get("/avatar/<task_id>")
def get_avatar(task_id):
    avatar_dir = os.getenv("AVATAR_DIR", "/avatars")
    try:
        return send_from_directory(avatar_dir, f"{task_id}.png")
    except FileNotFoundError:
        return jsonify({"error": "Avatar not found"}), 404


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
