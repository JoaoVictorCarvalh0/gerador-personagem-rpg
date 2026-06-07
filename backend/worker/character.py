import random

from dnd5e import fetch_class_hit_die, fetch_race_bonuses

ATTRS = ["FOR", "DES", "INT", "CON", "SAB", "CAR"]

CLASS_PREREQS = {
    "guerreiro": {"FOR": 13},
    "mago":      {"INT": 13},
    "arqueiro":  {"DES": 13},
    "ladino":    {"DES": 12, "INT": 11},
    "clérigo":   {"SAB": 13},
}


def _roll_4d6_drop_lowest() -> int:
    rolls = [random.randint(1, 6) for _ in range(4)]
    return sum(sorted(rolls)[1:])


def _modifier(score: int) -> float:
    return (score - 10) / 2


def _ensure_prereqs(attrs: dict[str, int], char_class: str) -> dict[str, int]:
    prereqs = CLASS_PREREQS.get(char_class, {})
    for stat, minimum in prereqs.items():
        if attrs[stat] < minimum:
            attrs[stat] = minimum
    return attrs


def generate_base_attributes(race: str, char_class: str) -> dict[str, int]:
    attrs = {attr: _roll_4d6_drop_lowest() for attr in ATTRS}
    bonuses = fetch_race_bonuses(race)
    for stat, bonus in bonuses.items():
        attrs[stat] = min(20, attrs[stat] + bonus)
    attrs = _ensure_prereqs(attrs, char_class)
    return attrs


def generate_derived_attributes(base: dict[str, int], char_class: str) -> dict[str, float]:
    hit_die = fetch_class_hit_die(char_class)
    dano = round((base["FOR"] + base["DES"]) / 2 * hit_die / 10, 1)
    defesa = round(10 + _modifier(base["CON"]) + _modifier(base["DES"]), 1)
    critico = round(5.0 + _modifier(base["DES"]) * 2, 1)
    velocidade_ataque = round(1.0 + _modifier(base["DES"]) * 0.1, 2)
    return {
        "dano": dano,
        "defesa": defesa,
        "critico": critico,
        "velocidade_ataque": velocidade_ataque,
    }
