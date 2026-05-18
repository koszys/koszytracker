from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class GameAccountBase(BaseModel):
    game_id: str
    uid: str | None = None
    name: str
    server: str
    ar: int = 1
    wl: str = "0"
    mc_option: str = ""

class GameAccountCreate(GameAccountBase):
    pass

class GameAccountUpdate(BaseModel):
    name: str | None = None
    server: str | None = None
    ar: int | None = None
    wl: str | None = None
    mc_option: str | None = None

class GameAccountResponse(GameAccountBase):
    id: int
    user_id: int
    last_synced_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SyncAccountsRequest(BaseModel):
    game_id: str
    accounts: list[GameAccountBase]

class SyncAccountsResponse(BaseModel):
    accounts: list[GameAccountResponse]
    message: str

class ConflictCheckRequest(BaseModel):
    game_id: str
    accounts: list[GameAccountBase]

class ConflictCheckResponse(BaseModel):
    has_conflict: bool
    local_modified_at: Optional[datetime] = None
    cloud_modified_at: Optional[datetime] = None
    cloud_accounts: list[GameAccountResponse] = []
    message: str

class ConflictResolveRequest(BaseModel):
    game_id: str
    resolution: str  # "local", "cloud", or "merge"
    local_accounts: list[GameAccountBase]
    cloud_accounts: list[GameAccountResponse] = []

class ConflictResolveResponse(BaseModel):
    accounts: list[GameAccountResponse]
    message: str