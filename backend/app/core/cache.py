"""
Simple in-memory cache implementation to replace Redis
"""

import asyncio
import time
from typing import Any, Dict, Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class InMemoryCache:
    """Simple in-memory cache with TTL support"""
    
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._cleanup_task: Optional[asyncio.Task] = None
        
    async def start(self):
        """Start the cache cleanup task"""
        if settings.ENABLE_CACHING and not self._cleanup_task:
            self._cleanup_task = asyncio.create_task(self._cleanup_expired())
            logger.info("In-memory cache started")
    
    async def stop(self):
        """Stop the cache cleanup task"""
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass
            self._cleanup_task = None
            logger.info("In-memory cache stopped")
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not settings.ENABLE_CACHING:
            return None
            
        if key in self._cache:
            entry = self._cache[key]
            if entry['expires_at'] > time.time():
                return entry['value']
            else:
                # Expired, remove it
                del self._cache[key]
        return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache with optional TTL"""
        if not settings.ENABLE_CACHING:
            return
            
        ttl = ttl or settings.CACHE_TTL
        expires_at = time.time() + ttl
        
        self._cache[key] = {
            'value': value,
            'expires_at': expires_at
        }
    
    async def delete(self, key: str) -> None:
        """Delete key from cache"""
        if key in self._cache:
            del self._cache[key]
    
    async def clear(self) -> None:
        """Clear all cache entries"""
        self._cache.clear()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        current_time = time.time()
        active_entries = sum(
            1 for entry in self._cache.values() 
            if entry['expires_at'] > current_time
        )
        
        return {
            'total_entries': len(self._cache),
            'active_entries': active_entries,
            'expired_entries': len(self._cache) - active_entries,
            'cache_enabled': settings.ENABLE_CACHING
        }
    
    async def _cleanup_expired(self):
        """Background task to clean up expired entries"""
        while True:
            try:
                current_time = time.time()
                expired_keys = [
                    key for key, entry in self._cache.items()
                    if entry['expires_at'] <= current_time
                ]
                
                for key in expired_keys:
                    del self._cache[key]
                
                if expired_keys:
                    logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")
                
                # Run cleanup every minute
                await asyncio.sleep(60)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in cache cleanup: {e}")
                await asyncio.sleep(60)


# Global cache instance
cache = InMemoryCache()


async def get_cache() -> InMemoryCache:
    """Dependency to get cache instance"""
    return cache


# Convenience functions for backward compatibility
async def get_cached(key: str) -> Optional[Any]:
    """Get value from cache"""
    return await cache.get(key)


async def set_cached(key: str, value: Any, ttl: Optional[int] = None) -> None:
    """Set value in cache"""
    await cache.set(key, value, ttl)


async def delete_cached(key: str) -> None:
    """Delete key from cache"""
    await cache.delete(key)


async def clear_cache() -> None:
    """Clear all cache"""
    await cache.clear()
