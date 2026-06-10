import colorsys
import os
import random
import urllib.parse
from pathlib import Path

import requests

ARMOR_MAP = {
    "guerreiro": "heavy plate armor",
    "mago":      "flowing arcane robes",
    "arqueiro":  "leather ranger armor",
    "ladino":    "dark leather armor",
    "clérigo":   "holy chainmail and robes",
}

WEAPON_MAP = {
    "guerreiro": "a greatsword",
    "mago":      "a glowing staff",
    "arqueiro":  "a longbow",
    "ladino":    "twin daggers",
    "clérigo":   "a divine mace and shield",
}

RACE_TRAIT_MAP = {
    "humano":   "versatile human",
    "elfo":     "elegant elf with pointed ears",
    "anão":     "stocky dwarf with a beard",
    "halfling": "small cheerful halfling",
    "tiefling": "tiefling with horns and a tail",
}

POLLINATIONS_URL = (
    "https://gen.pollinations.ai/image/{prompt}"
    "?model=flux&width=1024&height=1024&nologo=true&seed={seed}"
)


def _hue_name(h_deg: float) -> str:
    if h_deg < 15:   return "red"
    if h_deg < 40:   return "orange"
    if h_deg < 70:   return "yellow"
    if h_deg < 150:  return "green"
    if h_deg < 195:  return "cyan"
    if h_deg < 255:  return "blue"
    if h_deg < 285:  return "indigo"
    if h_deg < 330:  return "purple"
    return "red"


def hex_to_color_name(hex_color: str) -> str:
    hex_color = hex_color.lstrip("#")
    if len(hex_color) != 6:
        return "neutral"
    r = int(hex_color[0:2], 16) / 255
    g = int(hex_color[2:4], 16) / 255
    b = int(hex_color[4:6], 16) / 255
    h, l, s = colorsys.rgb_to_hls(r, g, b)  # noqa: E741

    if s < 0.12:
        if l < 0.15: return "black"
        if l > 0.85: return "white"
        return "gray"

    hue = _hue_name(h * 360)

    if l < 0.18:   return f"very dark {hue}"
    if l < 0.35:   return f"dark {hue}"
    if l > 0.82:   return f"very light {hue}"
    if l > 0.65:   return f"light {hue}"
    return hue


def generate_avatar(task_id: str, job: dict, avatars_dir: Path) -> str:
    race       = job["race"]
    char_class = job["class"]
    main_color = job.get("main_color", "#2f3a63")
    sec_color  = job.get("secondary_color", "#9e2b25")

    race_desc    = RACE_TRAIT_MAP.get(race, race)
    armor        = ARMOR_MAP.get(char_class, "leather armor")
    weapon       = WEAPON_MAP.get(char_class, "a sword")
    main_name    = hex_to_color_name(main_color)
    sec_name     = hex_to_color_name(sec_color)

    prompt = (
        f"{race_desc} {char_class}, "
        f"wearing {armor} colored in {main_name}, "
        f"wielding {weapon} with {sec_name} glow and accents, "
        f"magical energy and effects in {sec_name}, "
        f"determined expression, "
        f"fantasy RPG character portrait, detailed illustration, dramatic lighting, "
        f"color scheme: {main_name} and {sec_name}"
    )

    token = os.environ.get("POLLINATIONS_TOKEN", "")
    seed  = random.randint(1, 2**31)
    url   = POLLINATIONS_URL.format(prompt=urllib.parse.quote(prompt), seed=seed)

    headers = {"User-Agent": "rpg-character-generator/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    response = requests.get(url, timeout=60, headers=headers)
    if not response.ok:
        raise RuntimeError(f"{response.status_code} {response.reason}: {response.text[:500]}")

    avatar_path = avatars_dir / f"{task_id}.png"
    avatar_path.write_bytes(response.content)
    return str(avatar_path)
