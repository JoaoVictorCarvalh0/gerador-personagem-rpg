import random
import billiard  # Celery's multiprocessing — works inside daemon workers


# ── Base attributes ──────────────────────────────────────────────────────────

STAT_NAMES = ["FOR", "DES", "INT", "CON", "SAB", "CAR"]

CLASS_REQUIREMENTS: dict[str, dict[str, int]] = {
    "guerreiro": {"FOR": 13},
    "mago":      {"INT": 13},
    "arqueiro":  {"DES": 13},
    "ladino":    {"DES": 12, "INT": 11},
    "clérigo":   {"SAB": 13},
}


def roll_4d6_drop_lowest() -> int:
    rolls = [random.randint(1, 6) for _ in range(4)]
    return sum(sorted(rolls)[1:])


def roll_base_attributes() -> dict[str, int]:
    return {stat: roll_4d6_drop_lowest() for stat in STAT_NAMES}


def validate_class_eligibility(char_class: str, base_attrs: dict[str, int]) -> bool:
    reqs = CLASS_REQUIREMENTS.get(char_class, {})
    return all(base_attrs.get(stat, 0) >= val for stat, val in reqs.items())


# ── Derived attribute calculators (called inside Pool) ───────────────────────

def _calc_damage(attrs: dict) -> tuple[str, float]:
    for_mod = (attrs["FOR"] - 10) / 2
    dex_mod = (attrs["DES"] - 10) / 2
    damage = round(max(for_mod, dex_mod) * 1.5 + attrs["CON"] * 0.3, 2)
    return ("dano", damage)


def _calc_defense(attrs: dict) -> tuple[str, float]:
    con_mod = (attrs["CON"] - 10) / 2
    defense = round(10 + con_mod + attrs["FOR"] * 0.2, 2)
    return ("defesa", defense)


def _calc_crit(attrs: dict) -> tuple[str, float]:
    dex_mod = (attrs["DES"] - 10) / 2
    int_mod = (attrs["INT"] - 10) / 2
    crit = round(min(95, max(5, 15 + dex_mod * 2 + int_mod)), 2)
    return ("critico", crit)


def _calc_attack_speed(attrs: dict) -> tuple[str, float]:
    dex_mod = (attrs["DES"] - 10) / 2
    speed = round(1.0 + dex_mod * 0.1 + attrs["SAB"] * 0.02, 2)
    return ("velocidade_ataque", speed)


def _run_calc(args):
    func, attrs = args
    return func(attrs)


def calculate_derived_attributes(base_attrs: dict[str, int]) -> dict[str, float]:
    tasks = [(_calc_damage, base_attrs), (_calc_defense, base_attrs),
             (_calc_crit, base_attrs), (_calc_attack_speed, base_attrs)]

    with billiard.Pool(processes=4) as pool:
        results = pool.map(_run_calc, tasks)

    return dict(results)
