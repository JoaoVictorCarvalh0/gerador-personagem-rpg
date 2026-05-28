from dataclasses import dataclass, asdict
import re

VALID_CLASSES = {"guerreiro", "mago", "arqueiro", "ladino", "clérigo"}
VALID_RACES = {"humano", "elfo", "anão", "halfling", "tiefling"}
HEX_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")


class ValidationError(Exception):
    pass


@dataclass
class CharacterRequest:
    name: str
    race: str
    main_color: str
    secondary_color: str
    # 'class' is a reserved keyword; accept via __init__ override
    _class: str = ""

    def __init__(self, name: str, race: str, main_color: str, secondary_color: str, **kwargs):
        char_class = kwargs.get("class", "")
        if not name or not isinstance(name, str):
            raise ValidationError("'name' must be a non-empty string")
        if char_class not in VALID_CLASSES:
            raise ValidationError(f"'class' must be one of {sorted(VALID_CLASSES)}")
        if race not in VALID_RACES:
            raise ValidationError(f"'race' must be one of {sorted(VALID_RACES)}")
        if not HEX_RE.match(main_color):
            raise ValidationError("'main_color' must be a valid hex color (#RRGGBB)")
        if not HEX_RE.match(secondary_color):
            raise ValidationError("'secondary_color' must be a valid hex color (#RRGGBB)")

        self.name = name
        self._class = char_class
        self.race = race
        self.main_color = main_color
        self.secondary_color = secondary_color

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "class": self._class,
            "race": self.race,
            "main_color": self.main_color,
            "secondary_color": self.secondary_color,
        }
