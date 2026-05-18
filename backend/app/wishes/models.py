from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Wish(Base):
    __tablename__ = "wishes"
    
    id = Column(Integer, primary_key=True, index=True)
    wish_uid = Column(String, unique=True, index=True)
    account_id = Column(Integer, ForeignKey("game_accounts.id"))
    gacha_type = Column(Integer)
    item_id = Column(String)
    item_name = Column(String)
    rarity = Column(Integer)
    timestamp = Column(DateTime)
    banner_id = Column(String, nullable=True)
    
    account = relationship("GameAccount", back_populates="wishes")
