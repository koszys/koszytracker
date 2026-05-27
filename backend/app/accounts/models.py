from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class GameAccount(Base):
    __tablename__ = "game_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    game_id = Column(String, index=True)
    uid = Column(String, nullable=True, index=True)
    server = Column(String)
    name = Column(String)
    ar = Column(Integer, default=1)
    wl = Column(String, default="0")
    mc_option = Column(String, default="")
    last_synced_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="game_accounts")
    wishes = relationship("Wish", back_populates="account")
