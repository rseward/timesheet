from pydantic import BaseModel

"""
Pydantic models for Auth related requests.
"""

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
    