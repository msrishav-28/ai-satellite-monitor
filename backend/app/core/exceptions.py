"""
Custom exceptions for the Environmental Intelligence Platform.
All external service failures raise typed exceptions — never silently fall back to mock data.
"""


class GEEDataUnavailableError(Exception):
    """Raised when Google Earth Engine is not authenticated or a dataset query fails."""
    def __init__(self, message: str = "GEE credentials not configured or dataset unavailable"):
        self.message = message
        super().__init__(self.message)


class ExternalAPIError(Exception):
    """Raised when a third-party REST API returns an error or is unreachable."""
    def __init__(self, service: str, status_code: int = None, detail: str = ""):
        self.service = service
        self.status_code = status_code
        self.detail = detail
        msg = f"{service} API error"
        if status_code:
            msg += f" (HTTP {status_code})"
        if detail:
            msg += f": {detail}"
        super().__init__(msg)


class ImproperlyConfigured(Exception):
    """Raised at startup when a required environment variable is missing."""
    def __init__(self, var_name: str):
        self.var_name = var_name
        super().__init__(
            f"Required environment variable '{var_name}' is not set. "
            f"Check backend/.env.example for the full list of required variables."
        )


class MLModelError(Exception):
    """Raised when an ML model fails to train or produce a valid prediction."""
    def __init__(self, model_name: str, detail: str = ""):
        self.model_name = model_name
        self.detail = detail
        super().__init__(f"ML model '{model_name}' error: {detail}")


class GEERateLimitError(GEEDataUnavailableError):
    """Raised when GEE quota or concurrent request limit is exceeded."""
    def __init__(self):
        super().__init__(
            "GEE rate limit exceeded. The request will be retried after a backoff period. "
            "Consider adding Redis + Celery for proper async job queuing."
        )
