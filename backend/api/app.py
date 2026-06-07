import json
import os
import uuid
from pathlib import Path

import redis as redis_lib
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
rdb = redis_lib.from_url(REDIS_URL, decode_responses=True)

AVATARS_DIR = Path("/app/avatars")
AVATARS_DIR.mkdir(parents=True, exist_ok=True)

VALID_CLASSES = {"guerreiro", "mago", "arqueiro", "ladino", "clérigo"}
VALID_RACES = {"humano", "elfo", "anão", "halfling", "tiefling"}
TASK_TTL = 3600


@app.route("/gerar-personagem", methods=["POST"])
def gerar_personagem():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()[:60]
    char_class = data.get("class", "")
    race = data.get("race", "")
    main_color = data.get("main_color", "#8B0000")
    secondary_color = data.get("secondary_color", "#FFD700")

    if char_class not in VALID_CLASSES:
        return jsonify({"error": f"Classe inválida: {char_class}"}), 400
    if race not in VALID_RACES:
        return jsonify({"error": f"Raça inválida: {race}"}), 400

    task_id = str(uuid.uuid4())

    job = {
        "task_id": task_id,
        "name": name,
        "class": char_class,
        "race": race,
        "main_color": main_color,
        "secondary_color": secondary_color,
    }

    initial_status = json.dumps({"status": "pending", "character": None, "error": None})
    rdb.set(f"rpg:task:{task_id}", initial_status, ex=TASK_TTL)
    rdb.lpush("rpg:queue", json.dumps(job))

    return jsonify({"task_id": task_id}), 202


@app.route("/status/<task_id>", methods=["GET"])
def get_status(task_id):
    raw = rdb.get(f"rpg:task:{task_id}")
    if raw is None:
        return jsonify({"error": "Tarefa não encontrada"}), 404
    return jsonify(json.loads(raw)), 200


@app.route("/avatar/<task_id>", methods=["GET"])
def get_avatar(task_id):
    avatar_path = AVATARS_DIR / f"{task_id}.png"
    if not avatar_path.exists():
        return jsonify({"error": "Avatar não encontrado"}), 404
    return send_file(str(avatar_path), mimetype="image/png")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
