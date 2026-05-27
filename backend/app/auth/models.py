from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    picture = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    oauth_accounts = relationship("UserOAuth", back_populates="user")
    # Reference by string to avoid circular imports
    game_accounts = relationship("GameAccount", back_populates="user")

class UserOAuth(Base):
    __tablename__ = "user_oauth"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    provider = Column(String)
    provider_user_id = Column(String)
    
    user = relationship("User", back_populates="oauth_accounts")
