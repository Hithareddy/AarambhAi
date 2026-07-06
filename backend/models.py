from sqlalchemy import Boolean, Column, DateTime, Integer, String, func

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    preferred_language = Column(String, nullable=True)
    education_level = Column(String, nullable=True)
    learner_type = Column(String, nullable=True)

    
    profile_completed = Column(Boolean, nullable=False, default=False, server_default="false")
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
