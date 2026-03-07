"""Database configuration and session management."""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from typing import AsyncGenerator
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.types import TypeDecorator, CHAR
import uuid
from sqlalchemy import MetaData
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def get_async_database_url() -> str:
    """Return the configured database URL in async-driver form."""
    if settings.DATABASE_URL.startswith("sqlite:///"):
        return settings.DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")
    if settings.DATABASE_URL.startswith("postgresql://"):
        return settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    return settings.DATABASE_URL


def get_sync_database_url() -> str:
    """Return the configured database URL in sync-driver form for Alembic."""
    if settings.DATABASE_URL.startswith("sqlite+aiosqlite:///"):
        return settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "sqlite:///", 1)
    if settings.DATABASE_URL.startswith("postgresql+asyncpg://"):
        return settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://", 1)
    return settings.DATABASE_URL


database_url = get_async_database_url()

# Handle different database types
if settings.DATABASE_URL.startswith("sqlite"):
    # Convert SQLite URL to async format and ensure directory exists
    import os
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir)

    # Create async engine for SQLite
    engine = create_async_engine(
        database_url,
        echo=settings.DEBUG,
        connect_args={"check_same_thread": False}
    )
elif settings.DATABASE_URL.startswith("postgresql"):
    # Create async engine for PostgreSQL
    engine = create_async_engine(
        database_url,
        echo=settings.DEBUG,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
else:
    # Default fallback
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG
    )

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Metadata for table creation
metadata = MetaData()


class Base(DeclarativeBase):
    """Base class for all database models"""
    metadata = metadata


class GUID(TypeDecorator):
    """
    Platform-independent GUID/UUID type.
    Uses PostgreSQL's UUID type, otherwise stores as CHAR(36) for SQLite.
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            from sqlalchemy.dialects.postgresql import UUID as PG_UUID
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == 'postgresql':
            return value if isinstance(value, uuid.UUID) else uuid.UUID(str(value))
        # SQLite: store as string
        if isinstance(value, uuid.UUID):
            return str(value)
        return str(uuid.UUID(str(value)))

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        return value if isinstance(value, uuid.UUID) else uuid.UUID(str(value))


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Database session error: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()


def import_model_modules():
    """Import model modules so Alembic can discover metadata."""
    from app.models import analytics, environmental, hazards, impact, timelapse

    logger.info(
        "Database model metadata initialized",
        extra={"models": [analytics, environmental, hazards, impact, timelapse]},
    )


async def init_db():
    """Backward-compatible alias for metadata import."""
    import_model_modules()
