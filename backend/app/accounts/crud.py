from sqlalchemy.orm import Session
from fastapi import HTTPException
from .models import GameAccount
from .schemas import GameAccountCreate, GameAccountUpdate

def get_user_accounts(db: Session, user_id: int, game_id: str | None = None):
    query = db.query(GameAccount).filter(GameAccount.user_id == user_id)
    if game_id:
        query = query.filter(GameAccount.game_id == game_id)
    return query.all()

def get_account_by_id(db: Session, account_id: int, user_id: int):
    account = db.query(GameAccount).filter(
        GameAccount.id == account_id,
        GameAccount.user_id == user_id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

def create_account(db: Session, user_id: int, account: GameAccountCreate):
    db_account = GameAccount(
        user_id=user_id,
        game_id=account.game_id,
        uid=account.uid,
        name=account.name,
        server=account.server,
        ar=account.ar,
        wl=account.wl,
        mc_option=account.mc_option
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

def update_account(db: Session, account_id: int, user_id: int, account_update: GameAccountUpdate):
    db_account = get_account_by_id(db, account_id, user_id)

    if account_update.name is not None:
        db_account.name = account_update.name
    if account_update.server is not None:
        db_account.server = account_update.server
    if account_update.ar is not None:
        db_account.ar = account_update.ar
    if account_update.wl is not None:
        db_account.wl = account_update.wl
    if account_update.mc_option is not None:
        db_account.mc_option = account_update.mc_option

    db.commit()
    db.refresh(db_account)
    return db_account

def delete_account(db: Session, account_id: int, user_id: int):
    db_account = get_account_by_id(db, account_id, user_id)
    db.delete(db_account)
    db.commit()

def sync_accounts(db: Session, user_id: int, game_id: str, frontend_accounts: list[dict]):
    existing_accounts = db.query(GameAccount).filter(
        GameAccount.user_id == user_id,
        GameAccount.game_id == game_id
    ).all()

    existing_by_uid = {acc.uid: acc for acc in existing_accounts if acc.uid}
    existing_by_name_server = {
        (acc.name.lower(), acc.server.lower()): acc
        for acc in existing_accounts if not acc.uid
    }

    result_accounts = []
    matched_ids = set()

    for fc in frontend_accounts:
        fc_uid = fc.get("uid")
        fc_name = fc.get("name", "New Account")
        fc_server = fc.get("server", "Unknown")
        fc_key = (fc_name.lower(), fc_server.lower())

        matched_acc = None

        if fc_uid and fc_uid in existing_by_uid:
            matched_acc = existing_by_uid[fc_uid]
        elif fc_key in existing_by_name_server:
            matched_acc = existing_by_name_server[fc_key]

        if matched_acc:
            matched_ids.add(matched_acc.id)
            matched_acc.name = fc.get("name", matched_acc.name)
            matched_acc.server = fc.get("server", matched_acc.server)
            matched_acc.ar = fc.get("ar", matched_acc.ar)
            matched_acc.wl = fc.get("wl", matched_acc.wl)
            matched_acc.mc_option = fc.get("mc_option", matched_acc.mc_option)
            db.commit()
            db.refresh(matched_acc)
            result_accounts.append(matched_acc)
        else:
            new_account = GameAccount(
                user_id=user_id,
                game_id=game_id,
                uid=fc.get("uid") if fc.get("uid") else None,
                name=fc_name,
                server=fc_server,
                ar=fc.get("ar", 1),
                wl=fc.get("wl", "0"),
                mc_option=fc.get("mc_option", "")
            )
            db.add(new_account)
            result_accounts.append(new_account)

    db.commit()

    for acc in result_accounts:
        db.refresh(acc)

    return result_accounts