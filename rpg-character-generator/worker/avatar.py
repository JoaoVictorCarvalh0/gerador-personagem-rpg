import os
from PIL import Image, ImageDraw, ImageFont

AVATAR_DIR = os.getenv("AVATAR_DIR", "/avatars")
SIZE = (256, 256)

CLASS_SYMBOLS = {
    "guerreiro": "⚔",
    "mago":      "✦",
    "arqueiro":  "↑",
    "ladino":    "◆",
    "clérigo":   "✚",
}

RACE_BODY_SHAPES = {
    "humano":   (60, 80, 196, 220),
    "elfo":     (70, 70, 186, 230),
    "anão":     (50, 100, 206, 210),
    "halfling": (75, 110, 181, 215),
    "tiefling": (60, 75, 196, 225),
}


def _hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def _darken(rgb: tuple, factor: float = 0.6) -> tuple:
    return tuple(int(c * factor) for c in rgb)


def generate_avatar(task_id: str, char_class: str, race: str,
                    main_color: str, secondary_color: str) -> str:
    os.makedirs(AVATAR_DIR, exist_ok=True)

    primary = _hex_to_rgb(main_color)
    secondary = _hex_to_rgb(secondary_color)
    dark_primary = _darken(primary)

    img = Image.new("RGBA", SIZE, (30, 30, 40, 255))
    draw = ImageDraw.Draw(img)

    # Layer 1 — gradient-like background
    for y in range(SIZE[1]):
        ratio = y / SIZE[1]
        r = int(secondary[0] * (1 - ratio) * 0.4)
        g = int(secondary[1] * (1 - ratio) * 0.4)
        b = int(secondary[2] * (1 - ratio) * 0.4 + 30 * ratio)
        draw.line([(0, y), (SIZE[0], y)], fill=(r, g, b, 255))

    # Layer 2 — outer frame
    draw.rectangle([2, 2, SIZE[0] - 3, SIZE[1] - 3], outline=secondary, width=4)

    # Layer 3 — inner frame
    draw.rectangle([10, 10, SIZE[0] - 11, SIZE[1] - 11], outline=dark_primary, width=2)

    # Layer 4 — body silhouette
    body = RACE_BODY_SHAPES.get(race, (60, 80, 196, 220))
    draw.ellipse([body[0] + 30, body[1] - 30, body[2] - 30, body[1] + 30],
                 fill=primary, outline=dark_primary, width=2)  # head
    draw.rectangle([body[0] + 20, body[1], body[2] - 20, body[3]],
                   fill=primary, outline=dark_primary, width=2)  # torso/legs

    # Layer 5 — armor detail (secondary color overlay on chest)
    chest_x0, chest_y0 = body[0] + 30, body[1] + 40
    chest_x1, chest_y1 = body[2] - 30, body[1] + 100
    draw.rectangle([chest_x0, chest_y0, chest_x1, chest_y1],
                   fill=secondary, outline=dark_primary, width=1)

    # Layer 6 — class symbol (text)
    symbol = CLASS_SYMBOLS.get(char_class, "?")
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", 40)
    except (IOError, OSError):
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), symbol, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(
        ((SIZE[0] - tw) // 2, SIZE[1] - th - 20),
        symbol,
        fill=secondary,
        font=font,
    )

    path = os.path.join(AVATAR_DIR, f"{task_id}.png")
    img.save(path, "PNG")
    return path
