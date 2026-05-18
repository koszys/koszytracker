from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class WishBase(BaseModel):
    wish_uid: str
    gacha_type: int
    item_id: str
    item_name: str
    rarity: int
    timestamp: datetime
    banner_id: Optional[str] = None

class WishCreate(WishBase):
    account_id: int

class Wish(WishBase):
    id: int
    account_id: int

    class Config:
        from_attributes = True

class ImportWishesRequest(BaseModel):
    url: str
    game_id: str
    account_id: Optional[int] = None

class WishData(BaseModel):
    id: str
    name: str
    rarity: int
    gacha_type: int
    time: str
