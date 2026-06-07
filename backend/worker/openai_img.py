import os
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

ELEMENT_MAP = {
    "guerreiro": "warrior energy",
    "mago":      "arcane magic",
    "arqueiro":  "wind and nature",
    "ladino":    "shadow and stealth",
    "clérigo":   "holy light",
}

RACE_TRAIT_MAP = {
    "humano":   "versatile human",
    "elfo":     "elegant elf with pointed ears",
    "anão":     "stocky dwarf with a beard",
    "halfling": "small cheerful halfling",
    "tiefling": "tiefling with horns and a tail",
}

POLLINATIONS_URL = "https://gen.pollinations.ai/image/{prompt}?model=flux&width=1024&height=1024&nologo=true"


def generate_avatar(task_id: str, job: dict, avatars_dir: Path) -> str:
    race = job["race"]
    char_class = job["class"]
    main_color = job["main_color"]
    secondary_color = job["secondary_color"]

    race_desc = RACE_TRAIT_MAP.get(race, race)
    armor = ARMOR_MAP.get(char_class, "leather armor")
    weapon = WEAPON_MAP.get(char_class, "a sword")
    element = ELEMENT_MAP.get(char_class, "magic")

    prompt = (
        f"{race_desc} {char_class}, wearing {armor}, wielding {weapon}, "
        f"infused with {element}, determined expression, "
        f"color palette {main_color} and {secondary_color}, "
        f"fantasy RPG character portrait, detailed illustration, dramatic lighting"
    )

    token = os.environ.get("POLLINATIONS_TOKEN", "")
    url = POLLINATIONS_URL.format(prompt=urllib.parse.quote(prompt))

    headers = {"User-Agent": "rpg-character-generator/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    response = requests.get(url, timeout=60, headers=headers)
    if not response.ok:
        raise RuntimeError(f"{response.status_code} {response.reason}: {response.text[:500]}")
    response.raise_for_status()

    avatar_path = avatars_dir / f"{task_id}.png"
    avatar_path.write_bytes(response.content)

    return str(avatar_path)
