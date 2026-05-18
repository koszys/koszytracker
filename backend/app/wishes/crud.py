import httpx
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from .models import Wish
from app.accounts.models import GameAccount

def get_wishes_by_account(db: Session, account_id: int):
    return db.query(Wish).filter(Wish.account_id == account_id).all()

from fastapi import HTTPException

def get_or_create_game_account(db: Session, user_id: int, game_id: str, uid: str, server: str, name: str = "Imported Account"):
    account = db.query(GameAccount).filter(GameAccount.game_id == game_id, GameAccount.uid == uid).first()
    if account:
        if account.user_id != user_id:
            raise HTTPException(status_code=403, detail="Account UID belongs to another user")
        return account
        
    account = GameAccount(user_id=user_id, game_id=game_id, uid=uid, server=server, name=name)
    db.add(account)
    db.commit()
    db.refresh(account)
    return account

def batch_create_wishes(db: Session, wishes_data: list[dict]):
    if not wishes_data:
        return 0

    stmt = insert(Wish).values(wishes_data)
    
    # Do nothing if wish_uid already exists
    stmt = stmt.on_conflict_do_nothing(
        index_elements=['wish_uid']
    )
    
    result = db.execute(stmt)
    db.commit()
    
    # Return the number of newly inserted rows
    return result.rowcount
