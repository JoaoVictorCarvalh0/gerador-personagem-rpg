import requests

BASE_URL = "https://www.dnd5eapi.co/api"

CLASS_MAP = {
    "guerreiro": "fighter",
    "mago": "wizard",
    "arqueiro": "ranger",
    "ladino": "rogue",
    "clérigo": "cleric",
}

RACE_MAP = {
    "humano": "human",
    "elfo": "elf",
    "anão": "dwarf",
    "halfling": "halfling",
    "tiefling": "tiefling",
}

ABILITY_MAP = {
    "str": "FOR",
    "dex": "DES",
    "int": "INT",
    "con": "CON",
    "wis": "SAB",
    "cha": "CAR",
}


def fetch_race_bonuses(race_pt: str) -> dict[str, int]:
    slug = RACE_MAP.get(race_pt, "human")
    try:
        resp = requests.get(f"{BASE_URL}/races/{slug}", timeout=10)
        resp.raise_for_status()
        bonuses = {}
        for entry in resp.json().get("ability_bonuses", []):
            abbr = entry["ability_score"]["index"]
            key = ABILITY_MAP.get(abbr)
            if key:
                bonuses[key] = entry["bonus"]
        return bonuses
    except Exception:
        return {}


def fetch_class_hit_die(class_pt: str) -> int:
    slug = CLASS_MAP.get(class_pt, "fighter")
    try:
        resp = requests.get(f"{BASE_URL}/classes/{slug}", timeout=10)
        resp.raise_for_status()
        return resp.json().get("hit_die", 8)
    except Exception:
        return 8
