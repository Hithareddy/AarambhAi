from contextlib import asynccontextmanager
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

import models  # noqa: F401 — register models with Base before create_all
from database import Base, engine, get_db
from models import User
from schemas import (
    LoginResponse,
    ProfileUpdate,
    UserLogin,
    UserRegister,
    UserResponse,
)
from security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Aarambh AI Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    try:
        user_id = decode_access_token(credentials.credentials)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


@app.get("/")
def root():
    return {"message": "Aarambh backend is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/db-health")
def db_health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"database": "connected"}
    except Exception as e:
        print("Database connection error:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="Database connection failed",
        )


@app.post(
    "/auth/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    email = user_data.email.strip().lower()

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    try:
        new_user = User(
            full_name=user_data.full_name.strip(),
            email=email,
            password_hash=hash_password(user_data.password),
            preferred_language=user_data.preferred_language,
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed",
        )
@app.post("/auth/login", response_model=LoginResponse)
def login_user(
    login_data: UserLogin,
    db: Session = Depends(get_db),
):
    email = login_data.email.strip().lower()

    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }
@app.get("/auth/me", response_model=UserResponse)
def get_logged_in_user(
    current_user: User = Depends(get_current_user),
):
    return current_user

@app.put("/auth/profile", response_model=UserResponse)
def update_user_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        current_user.full_name = profile_data.full_name.strip()
        current_user.preferred_language = profile_data.preferred_language
        current_user.education_level = profile_data.education_level
        current_user.learner_type = profile_data.learner_type
        current_user.profile_completed = True

        db.commit()
        db.refresh(current_user)

        return current_user

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed",
        )