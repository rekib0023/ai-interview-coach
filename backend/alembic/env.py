import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Add the project root directory to python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

# Import the app config and models
from app.core.config import settings
from app.db.base import Base

# Import models package to register all models with Base
from app import models  # noqa: F401

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Overwrite the sqlalchemy.url in the config object with the one from settings
# This ensures we use the environment variables
# Check if DATABASE_URL is set in settings, otherwise construct it
if settings.DATABASE_URL:
    url = settings.DATABASE_URL
else:
    url = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@localhost:5432/{settings.POSTGRES_DB}"

section = config.config_ini_section
config.set_section_option(section, "sqlalchemy.url", url)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
