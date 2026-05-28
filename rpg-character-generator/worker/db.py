import os
import uuid
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, String, DateTime, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import DeclarativeBase, Session

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://rpg:rpgpassword@postgres:5432/rpgdb",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)


class Base(DeclarativeBase):
    pass


class Character(Base):
    __tablename__ = "characters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(120), nullable=False)
    char_class = Column("class", String(50), nullable=False)
    race = Column(String(50), nullable=False)
    base_attributes = Column(JSONB, nullable=False)
    derived_attributes = Column(JSONB, nullable=False)
    avatar_path = Column(String(512))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    status = Column(String(20), default="pending")


def init_db():
    Base.metadata.create_all(engine)


def save_character(
    task_id: str,
    name: str,
    char_class: str,
    race: str,
    base_attributes: dict,
    derived_attributes: dict,
    avatar_path: str,
) -> None:
    with Session(engine) as session:
        char = Character(
            id=uuid.UUID(task_id),
            name=name,
            char_class=char_class,
            race=race,
            base_attributes=base_attributes,
            derived_attributes=derived_attributes,
            avatar_path=avatar_path,
            status="done",
        )
        session.add(char)
        session.commit()
