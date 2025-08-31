"""
Advanced error handling and retry mechanisms for HANU-YOUTH APIs
"""

import asyncio
import time
import logging
from typing import Any, Callable, Optional, TypeVar, Union
from functools import wraps
from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
import httpx
from datetime import datetime, timedelta

# Type variable for generic functions
T = TypeVar('T')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class APIError(Exception):
    """Base API error class"""
    
    def __init__(self, message: str, error_code: str, status_code: int = 500):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        super().__init__(self.message)

class RetryConfig:
    """Configuration for retry mechanisms"""
    
    def __init__(
        self,
        max_attempts: int = 3,
        base_delay: float = 1.0,
        max_delay: float = 10.0,
        exponential_base: float = 2.0,
        jitter: bool = True,
        retryable_exceptions: tuple = (Exception,)
    ):
        self.max_attempts = max_attempts
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.exponential_base = exponential_base
        self.jitter = jitter
        self.retryable_exceptions = retryable_exceptions

class CircuitBreaker:
    """Circuit breaker pattern for external service calls"""
    
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        expected_exception: tuple = (Exception,)
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
        self.success_count = 0
    
    def call(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with circuit breaker protection"""
        
        if self.state == "OPEN":
            if self._should_attempt_reset():
                self.state = "HALF_OPEN"
                self.success_count = 0
            else:
                raise APIError(
                    "Circuit breaker is OPEN - service unavailable",
                    "CIRCUIT_BREAKER_OPEN",
                    status_code=503
                )
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except self.expected_exception as e:
            self._on_failure()
            raise e
    
    def _should_attempt_reset(self) -> bool:
        """Check if circuit breaker should attempt reset"""
        if self.last_failure_time is None:
            return True
        
        return (datetime.utcnow() - self.last_failure_time).seconds >= self.recovery_timeout
    
    def _on_success(self):
        """Handle successful call"""
        self.failure_count = 0
        if self.state == "HALF_OPEN":
            self.success_count += 1
            if self.success_count >= 3:  # 3 successful calls in HALF_OPEN state
                self.state = "CLOSED"
    
    def _on_failure(self):
        """Handle failed call"""
        self.failure_count += 1
        self.last_failure_time = datetime.utcnow()
        
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"

def retry_with_backoff(config: RetryConfig):
    """Decorator for retry with exponential backoff"""
    
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(config.max_attempts):
                try:
                    return await func(*args, **kwargs)
                except config.retryable_exceptions as e:
                    last_exception = e
                    
                    if attempt == config.max_attempts - 1:
                        # Last attempt failed, re-raise
                        logger.error(f"Function {func.__name__} failed after {config.max_attempts} attempts: {e}")
                        raise
                    
                    # Calculate delay with exponential backoff
                    delay = config.base_delay * (config.exponential_base ** attempt)
                    delay = min(delay, config.max_delay)
                    
                    # Add jitter to prevent thundering herd
                    if config.jitter:
                        delay *= (0.5 + (0.5 * asyncio.get_event_loop().time() % 1))
                    
                    logger.warning(
                        f"Attempt {attempt + 1}/{config.max_attempts} for {func.__name__} "
                        f"failed. Retrying in {delay:.2f} seconds. Error: {e}"
                    )
                    
                    await asyncio.sleep(delay)
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(config.max_attempts):
                try:
                    return func(*args, **kwargs)
                except config.retryable_exceptions as e:
                    last_exception = e
                    
                    if attempt == config.max_attempts - 1:
                        # Last attempt failed, re-raise
                        logger.error(f"Function {func.__name__} failed after {config.max_attempts} attempts: {e}")
                        raise
                    
                    # Calculate delay with exponential backoff
                    delay = config.base_delay * (config.exponential_base ** attempt)
                    delay = min(delay, config.max_delay)
                    
                    # Add jitter
                    if config.jitter:
                        delay *= (0.5 + (time.time() % 1))
                    
                    logger.warning(
                        f"Attempt {attempt + 1}/{config.max_attempts} for {func.__name__} "
                        f"failed. Retrying in {delay:.2f} seconds. Error: {e}"
                    )
                    
                    time.sleep(delay)
        
        # Return appropriate wrapper based on function type
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

def handle_database_errors(func: Callable) -> Callable:
    """Decorator for handling database errors"""
    
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except SQLAlchemyError as e:
            logger.error(f"Database error in {func.__name__}: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service temporarily unavailable"
            )
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except SQLAlchemyError as e:
            logger.error(f"Database error in {func.__name__}: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service temporarily unavailable"
            )
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    else:
        return sync_wrapper

def handle_external_service_errors(service_name: str):
    """Decorator for handling external service errors"""
    
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except httpx.TimeoutException as e:
                logger.error(f"Timeout error calling {service_name}: {e}")
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail=f"{service_name} service timeout"
                )
            except httpx.NetworkError as e:
                logger.error(f"Network error calling {service_name}: {e}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"{service_name} service unavailable"
                )
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error calling {service_name}: {e}")
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"{service_name} service error: {e.response.text}"
                )
            except Exception as e:
                logger.error(f"Unexpected error calling {service_name}: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error calling {service_name} service"
                )
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except httpx.TimeoutException as e:
                logger.error(f"Timeout error calling {service_name}: {e}")
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail=f"{service_name} service timeout"
                )
            except httpx.NetworkError as e:
                logger.error(f"Network error calling {service_name}: {e}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"{service_name} service unavailable"
                )
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error calling {service_name}: {e}")
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"{service_name} service error: {e.response.text}"
                )
            except Exception as e:
                logger.error(f"Unexpected error calling {service_name}: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error calling {service_name} service"
                )
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

class ErrorHandler:
    """Centralized error handler"""
    
    @staticmethod
    def log_error(error: Exception, context: str = ""):
        """Log error with context"""
        logger.error(f"Error in {context}: {type(error).__name__}: {error}")
    
    @staticmethod
    def create_http_exception(error: Exception, default_message: str = "An error occurred") -> HTTPException:
        """Create appropriate HTTP exception from error"""
        
        if isinstance(error, APIError):
            return HTTPException(
                status_code=error.status_code,
                detail=error.message
            )
        elif isinstance(error, SQLAlchemyError):
            return HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service temporarily unavailable"
            )
        elif isinstance(error, httpx.TimeoutException):
            return HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Service timeout"
            )
        elif isinstance(error, httpx.NetworkError):
            return HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Service unavailable"
            )
        elif isinstance(error, ValueError):
            return HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(error)
            )
        else:
            return HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=default_message
            )
    
    @staticmethod
    async def safe_execute(
        func: Callable,
        *args,
        error_message: str = "Operation failed",
        **kwargs
    ) -> tuple[bool, Union[T, None], Union[Exception, None]]:
        """Safely execute function with error handling"""
        try:
            if asyncio.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)
            
            return True, result, None
        
        except Exception as e:
            ErrorHandler.log_error(e, error_message)
            return False, None, e

# Predefined retry configurations
RETRY_CONFIGS = {
    "database": RetryConfig(
        max_attempts=3,
        base_delay=0.1,
        max_delay=5.0,
        retryable_exceptions=(SQLAlchemyError, ConnectionError)
    ),
    "external_service": RetryConfig(
        max_attempts=3,
        base_delay=1.0,
        max_delay=10.0,
        retryable_exceptions=(httpx.TimeoutException, httpx.NetworkError)
    ),
    "ai_service": RetryConfig(
        max_attempts=2,
        base_delay=2.0,
        max_delay=5.0,
        retryable_exceptions=(httpx.HTTPStatusError, httpx.TimeoutException)
    )
}

# Predefined circuit breakers
CIRCUIT_BREAKERS = {
    "database": CircuitBreaker(failure_threshold=5, recovery_timeout=30),
    "ai_service": CircuitBreaker(failure_threshold=3, recovery_timeout=60),
    "external_api": CircuitBreaker(failure_threshold=5, recovery_timeout=120)
}