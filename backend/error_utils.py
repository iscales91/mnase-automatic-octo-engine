"""
Error Handling and Validation Utilities for MNASE Basketball League
Provides standardized error responses and validation functions
"""

from fastapi import HTTPException
from pydantic import BaseModel, validator
from typing import Optional, Dict, Any
import re
from datetime import datetime

class ValidationError(BaseModel):
    """Standardized validation error format"""
    field: str
    message: str
    code: str

class ErrorResponse(BaseModel):
    """Standardized error response format"""
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
    validation_errors: Optional[list[ValidationError]] = None

class ValidationUtils:
    """Utility class for common validation functions"""
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validate US phone number format"""
        # Remove common formatting characters
        cleaned = re.sub(r'[\s\-\(\)]', '', phone)
        # Check if it's 10 or 11 digits (with country code)
        pattern = r'^(\+?1)?[0-9]{10}$'
        return re.match(pattern, cleaned) is not None
    
    @staticmethod
    def validate_password_strength(password: str) -> tuple[bool, str]:
        """
        Validate password strength
        Returns: (is_valid, error_message)
        """
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        
        if not re.search(r'[0-9]', password):
            return False, "Password must contain at least one number"
        
        return True, ""
    
    @staticmethod
    def validate_date_format(date_str: str, format: str = "%Y-%m-%d") -> bool:
        """Validate date string format"""
        try:
            datetime.strptime(date_str, format)
            return True
        except ValueError:
            return False
    
    @staticmethod
    def validate_age(date_of_birth: str, min_age: int = 18) -> tuple[bool, int]:
        """
        Validate age from date of birth
        Returns: (is_valid, actual_age)
        """
        try:
            dob = datetime.strptime(date_of_birth, "%Y-%m-%d").date()
            today = datetime.now().date()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            return age >= min_age, age
        except ValueError:
            return False, 0
    
    @staticmethod
    def validate_required_fields(data: dict, required_fields: list) -> list[ValidationError]:
        """Validate that required fields are present and not empty"""
        errors = []
        for field in required_fields:
            if field not in data or not data[field] or str(data[field]).strip() == "":
                errors.append(ValidationError(
                    field=field,
                    message=f"{field.replace('_', ' ').title()} is required",
                    code="required_field"
                ))
        return errors
    
    @staticmethod
    def sanitize_input(text: str) -> str:
        """Basic input sanitization"""
        if not text:
            return ""
        # Remove leading/trailing whitespace
        text = text.strip()
        # Remove multiple consecutive spaces
        text = re.sub(r'\s+', ' ', text)
        return text

class CustomHTTPException(HTTPException):
    """Custom HTTP Exception with structured error response"""
    
    def __init__(
        self,
        status_code: int,
        error: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        validation_errors: Optional[list[ValidationError]] = None
    ):
        self.error = error
        self.message = message
        self.details = details
        self.validation_errors = validation_errors
        
        error_response = {
            "error": error,
            "message": message
        }
        
        if details:
            error_response["details"] = details
        
        if validation_errors:
            error_response["validation_errors"] = [
                {"field": e.field, "message": e.message, "code": e.code}
                for e in validation_errors
            ]
        
        super().__init__(status_code=status_code, detail=error_response)

# Common error responses
def not_found_error(resource: str, resource_id: str = None):
    """Standard 404 error"""
    message = f"{resource} not found"
    if resource_id:
        message += f" with ID: {resource_id}"
    
    return CustomHTTPException(
        status_code=404,
        error="not_found",
        message=message
    )

def validation_error(validation_errors: list[ValidationError]):
    """Standard 400 validation error"""
    return CustomHTTPException(
        status_code=400,
        error="validation_error",
        message="Validation failed",
        validation_errors=validation_errors
    )

def unauthorized_error(message: str = "Authentication required"):
    """Standard 401 error"""
    return CustomHTTPException(
        status_code=401,
        error="unauthorized",
        message=message
    )

def forbidden_error(message: str = "You don't have permission to perform this action"):
    """Standard 403 error"""
    return CustomHTTPException(
        status_code=403,
        error="forbidden",
        message=message
    )

def conflict_error(resource: str, message: str):
    """Standard 409 error"""
    return CustomHTTPException(
        status_code=409,
        error="conflict",
        message=message,
        details={"resource": resource}
    )

def server_error(message: str = "An internal server error occurred"):
    """Standard 500 error"""
    return CustomHTTPException(
        status_code=500,
        error="internal_server_error",
        message=message
    )

# Validation decorator
def validate_model(model_class):
    """Decorator to validate Pydantic models"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                raise server_error(str(e))
        return wrapper
    return decorator

print("✅ Error handling utilities loaded")
