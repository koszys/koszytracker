from pydantic import BaseModel

class AccountBase(BaseModel):
    uid: str
    server: str
    name: str

class AccountCreate(AccountBase):
    pass

class Account(AccountBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
