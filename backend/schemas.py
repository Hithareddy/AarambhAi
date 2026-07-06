from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)
    preferred_language: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    full_name: str
    preferred_language: str
    education_level: str
    learner_type: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    preferred_language: str | None
    education_level: str | None
    learner_type: str | None
    profile_completed: bool
    created_at: datetime


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse