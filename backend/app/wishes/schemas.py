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
    last_synced_at: Optional[datetime] = None

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

class WishesCheckConflictRequest(BaseModel):
    game_id: str
    wishes: List[dict]

class WishesCheckConflictResponse(BaseModel):
    has_conflict: bool
    local_count: int
    cloud_count: int
    local_modified_at: Optional[datetime] = None
    cloud_modified_at: Optional[datetime] = None
    message: str

class WishesResolveConflictRequest(BaseModel):
    game_id: str
    resolution: str
    local_wishes: List[dict]
    cloud_wishes: List[dict]

class WishesResolveConflictResponse(BaseModel):
    count: int
    message: str
