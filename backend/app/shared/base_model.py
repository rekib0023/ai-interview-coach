"""Base SQLAlchemy model."""

from sqlalchemy.orm import declarative_base, declared_attr


class Base:
    """Base class with common attributes."""

    # Generate __tablename__ automatically
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()


Base = declarative_base(cls=Base)
