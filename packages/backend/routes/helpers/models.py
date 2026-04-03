from pydantic import BaseModel


class ErrorResponse(BaseModel):
    detail: str


swaggerErrorResponses = {
    400: {
        "model": ErrorResponse,
        "description": "Bad Request",
    },
    401: {
        "model": ErrorResponse,
        "description": "Authorization Error",
    },
    403: {
        "model": ErrorResponse,
        "description": "Forbidden",
    },
    404: {
        "model": ErrorResponse,
        "description": "Not Found Error",
    },
    422: {
        "model": ErrorResponse,
        "description": "Validation Error",
    },
    500: {
        "description": "Internal Server Error",
        "content": {
            "application/json": {
                "schema": {"type": "string"},
                "example": "Internal Server Error",
            }
        },
    },
}
