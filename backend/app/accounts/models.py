from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class GameAccount(Base):
    __tablename__ = "game_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    game_id = Column(String, index=True)
    uid = Column(String, unique=True, index=True)
    server = Column(String)
    name = Column(String)
    
    user = relationship("User", back_populates="game_accounts")
    wishes = relationship("Wish", back_populates="account")
