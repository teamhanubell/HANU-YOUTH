"""
Simple caching system for optimizing API performance
"""

from typing import Any, Dict, Optional, Callable
import time
from functools import wraps
import asyncio

class SimpleCache:
    """Simple in-memory cache with TTL support"""
    
    def __init__(self, default_ttl: int = 300):  # 5 minutes default
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = default_ttl
        self.cleanup_task: Optional[asyncio.Task] = None
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if key in self.cache:
            item = self.cache[key]
            if time.time() < item['expires']:
                return item['value']
            else:
                # Remove expired item
                del self.cache[key]
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache with TTL"""
        expires = time.time() + (ttl or self.default_ttl)
        self.cache[key] = {
            'value': value,
            'expires': expires
        }
    
    def delete(self, key: str) -> bool:
        """Delete item from cache"""
        if key in self.cache:
            del self.cache[key]
            return True
        return False
    
    def clear(self) -> None:
        """Clear all cache items"""
        self.cache.clear()
    
    def cleanup_expired(self) -> None:
        """Clean up expired items"""
        current_time = time.time()
        expired_keys = [
            key for key, item in self.cache.items()
            if current_time >= item['expires']
        ]
        for key in expired_keys:
            del self.cache[key]
    
    async def start_cleanup_task(self, interval: int = 60) -> None:
        """Start background cleanup task"""
        if self.cleanup_task and not self.cleanup_task.done():
            return
        
        async def cleanup():
            while True:
                await asyncio.sleep(interval)
                self.cleanup_expired()
        
        self.cleanup_task = asyncio.create_task(cleanup())

def cache_response(ttl: int = 300):
    """Decorator for caching API responses"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create cache key from function name and arguments
            cache_key = f"{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"
            
            # Try to get from cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            return result
        
        return wrapper
    return decorator

# Global cache instance
cache = SimpleCache()

# Cache keys
CACHE_KEYS = {
    'LEADERBOARD': 'leaderboard:{type}',
    'USER_PROFILE': 'user_profile:{user_id}',
    'RESEARCH_ITEMS': 'research_items:{filters}',
    'USER_STATS': 'user_stats:{user_id}',
    'CONVERSATIONS': 'conversations:{user_id}',
    'RECENT_RESEARCH': 'recent_research:{user_id}'
}