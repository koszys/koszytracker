from pydantic import BaseModel

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

    class Config:
        from_attributes = True

class SyncAccountsRequest(BaseModel):
    game_id: str
    accounts: list[GameAccountBase]

class SyncAccountsResponse(BaseModel):
    accounts: list[GameAccountResponse]
    message: str