"""
Database configuration and session management
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Handle different database types
if settings.DATABASE_URL.startswith("sqlite"):
    # Convert SQLite URL to async format and ensure directory exists
    import os
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir)

    database_url = settings.DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")
    # Create async engine for SQLite
    engine = create_async_engine(
        database_url,
        echo=settings.DEBUG,
        connect_args={"check_same_thread": False}
    )
elif settings.DATABASE_URL.startswith("postgresql"):
    # Convert PostgreSQL URL to async version
    database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
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


async def get_db() -> AsyncSession:
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


async def init_db():
    """Initialize database tables"""
    # Import all models to ensure they are registered with Base
    from app.models import environmental, hazards, analytics, impact, timelapse

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database initialized successfully")
