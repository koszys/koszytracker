import httpx
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime
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


def get_all_user_wishes(db: Session, user_id: int, game_id: str):
    accounts = db.query(GameAccount).filter(
        GameAccount.user_id == user_id,
        GameAccount.game_id == game_id
    ).all()
    account_ids = [acc.id for acc in accounts]
    if not account_ids:
        return []
    return db.query(Wish).filter(Wish.account_id.in_(account_ids)).all()


def check_wishes_conflict(db: Session, user_id: int, game_id: str, local_wishes: list[dict]):
    cloud_wishes = get_all_user_wishes(db, user_id, game_id)

    local_count = len(local_wishes)
    cloud_count = len(cloud_wishes)

    local_modified = None
    if local_wishes:
        local_modified = datetime.utcnow()

    cloud_modified = None
    if cloud_wishes:
        cloud_modified = max(
            (w.last_synced_at for w in cloud_wishes if w.last_synced_at),
            default=None
        )
        if not cloud_modified:
            cloud_modified = datetime.utcnow()

    has_conflict = local_count != cloud_count

    return {
        "has_conflict": has_conflict,
        "local_count": local_count,
        "cloud_count": cloud_count,
        "local_modified_at": local_modified,
        "cloud_modified_at": cloud_modified,
        "cloud_wishes": cloud_wishes,
        "message": "Conflict detected" if has_conflict else "Data is in sync"
    }


def resolve_wishes_conflict(
    db: Session,
    user_id: int,
    game_id: str,
    resolution: str,
    local_wishes: list[dict],
    cloud_wishes: list[Wish]
):
    if resolution == "cloud":
        return len(cloud_wishes)

    if resolution == "local":
        accounts = db.query(GameAccount).filter(
            GameAccount.user_id == user_id,
            GameAccount.game_id == game_id
        ).all()
        if not accounts:
            return 0
        account_id = accounts[0].id

        for wish in local_wishes:
            wish_data = {
                "wish_uid": wish.get("id"),
                "account_id": account_id,
                "gacha_type": int(wish.get("gacha_type")),
                "item_id": wish.get("item_id", ""),
                "item_name": wish.get("name"),
                "rarity": int(wish.get("rarity")),
                "timestamp": datetime.strptime(wish.get("time"), "%Y-%m-%d %H:%M:%S"),
                "last_synced_at": datetime.utcnow()
            }
            stmt = insert(Wish).values(wish_data)
            stmt = stmt.on_conflict_do_nothing(index_elements=['wish_uid'])
            db.execute(stmt)
        db.commit()
        return len(local_wishes)

    if resolution == "merge":
        existing_uids = {w.wish_uid for w in cloud_wishes}
        accounts = db.query(GameAccount).filter(
            GameAccount.user_id == user_id,
            GameAccount.game_id == game_id
        ).all()
        if not accounts:
            return 0
        account_id = accounts[0].id

        new_count = 0
        for wish in local_wishes:
            wish_uid = wish.get("id")
            if wish_uid not in existing_uids:
                wish_data = {
                    "wish_uid": wish_uid,
                    "account_id": account_id,
                    "gacha_type": int(wish.get("gacha_type")),
                    "item_id": wish.get("item_id", ""),
                    "item_name": wish.get("name"),
                    "rarity": int(wish.get("rarity")),
                    "timestamp": datetime.strptime(wish.get("time"), "%Y-%m-%d %H:%M:%S"),
                    "last_synced_at": datetime.utcnow()
                }
                stmt = insert(Wish).values(wish_data)
                stmt = stmt.on_conflict_do_nothing(index_elements=['wish_uid'])
                db.execute(stmt)
                new_count += 1
        db.commit()
        return cloud_count + new_count

    return 0
