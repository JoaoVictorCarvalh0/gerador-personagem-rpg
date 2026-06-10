import json
import os
import uuid
from datetime import datetime, timezone, timedelta
from functools import wraps
from pathlib import Path

import bcrypt
import jwt
import redis as redis_lib
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
rdb = redis_lib.from_url(REDIS_URL, decode_responses=True)

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017/rpg")
mongo = MongoClient(MONGO_URL)
db = mongo.get_default_database()
users_col = db["users"]
users_col.create_index("username", unique=True)

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
JWT_EXPIRY_HOURS = 24

AVATARS_DIR = Path("/app/avatars")
AVATARS_DIR.mkdir(parents=True, exist_ok=True)

VALID_CLASSES = {"guerreiro", "mago", "arqueiro", "ladino", "clérigo"}
VALID_RACES = {"humano", "elfo", "anão", "halfling", "tiefling"}
TASK_TTL = 3600


def _decode_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, ("Token ausente", 401)
    token = auth.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload["sub"], None
    except jwt.ExpiredSignatureError:
        return None, ("Token expirado", 401)
    except jwt.InvalidTokenError:
        return None, ("Token inválido", 401)


def jwt_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        _, err = _decode_token()
        if err:
            return jsonify({"error": err[0]}), err[1]
        return f(*args, **kwargs)
    return wrapper


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()[:60]
    password = str(data.get("password", ""))

    if not username or not password:
        return jsonify({"error": "username e password são obrigatórios"}), 400
    if len(password) < 6:
        return jsonify({"error": "password deve ter no mínimo 6 caracteres"}), 400

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    try:
        users_col.insert_one({"username": username, "password": hashed})
    except Exception:
        return jsonify({"error": "Usuário já existe"}), 409

    return jsonify({"message": "Usuário criado com sucesso"}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))

    user = users_col.find_one({"username": username})
    if not user or not bcrypt.checkpw(password.encode(), user["password"]):
        return jsonify({"error": "Credenciais inválidas"}), 401

    payload = {
        "sub": username,
        "exp": datetime.now(tz=timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return jsonify({"token": token}), 200


@app.route("/gerar-personagem", methods=["POST"])
@jwt_required
def gerar_personagem():
    username, _ = _decode_token()
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
        "username": username,
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


@app.route("/personagens", methods=["GET"])
@jwt_required
def listar_personagens():
    username, _ = _decode_token()
    limit  = min(int(request.args.get("limit", 15)), 50)
    offset = max(int(request.args.get("offset", 0)), 0)

    query = {"username": username}
    total = db["characters"].count_documents(query)
    docs  = list(
        db["characters"].find(
            query, {"_id": 0},
            sort=[("created_at", -1)],
            skip=offset,
            limit=limit,
        )
    )
    return jsonify({"items": docs, "total": total, "has_more": offset + limit < total}), 200


@app.route("/status/<task_id>", methods=["GET"])
@jwt_required
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
