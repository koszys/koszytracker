from sqlalchemy.orm import Session
from .models import GenshinAccount
from .schemas import AccountCreate

def get_account(db: Session, account_id: int):
    return db.query(GenshinAccount).filter(GenshinAccount.id == account_id).first()

def get_user_accounts(db: Session, user_id: int):
    return db.query(GenshinAccount).filter(GenshinAccount.user_id == user_id).all()

def create_account(db: Session, account: AccountCreate, user_id: int):
    db_account = GenshinAccount(**account.dict(), user_id=user_id)
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account
