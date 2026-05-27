from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
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

    for existing_acc in existing_accounts:
        if existing_acc.id not in matched_ids:
            db.delete(existing_acc)

    db.commit()

    for acc in result_accounts:
        db.refresh(acc)

    return result_accounts


def check_accounts_conflict(db: Session, user_id: int, game_id: str, local_accounts: list[dict]):
    cloud_accounts = db.query(GameAccount).filter(
        GameAccount.user_id == user_id,
        GameAccount.game_id == game_id
    ).all()

    if not cloud_accounts:
        return {
            "has_conflict": False,
            "cloud_modified_at": None,
            "cloud_accounts": [],
            "message": "No cloud data - will use local"
        }

    local_accounts_dict = {
        (acc.get("name", "").lower(), acc.get("server", "").lower()): acc
        for acc in local_accounts if acc.get("name") and acc.get("server")
    }

    cloud_accounts_dict = {
        (acc.name.lower(), acc.server.lower()): acc
        for acc in cloud_accounts
    }

    local_modified = None
    if local_accounts:
        local_modified = datetime.utcnow()

    cloud_modified = None
    if cloud_accounts:
        cloud_modified = max(
            (acc.last_synced_at for acc in cloud_accounts if acc.last_synced_at),
            default=None
        )
        if not cloud_modified:
            cloud_modified = datetime.utcnow()

    has_conflict = False
    if len(local_accounts) != len(cloud_accounts):
        has_conflict = True
    else:
        for key, local_acc in local_accounts_dict.items():
            cloud_acc = cloud_accounts_dict.get(key)
            if not cloud_acc:
                has_conflict = True
                break
            if (local_acc.get("ar") != cloud_acc.ar or
                local_acc.get("wl") != cloud_acc.wl or
                local_acc.get("mc_option") != cloud_acc.mc_option):
                has_conflict = True
                break

    return {
        "has_conflict": has_conflict,
        "local_modified_at": local_modified,
        "cloud_modified_at": cloud_modified,
        "cloud_accounts": cloud_accounts,
        "message": "Conflict detected" if has_conflict else "Data is in sync"
    }


def resolve_accounts_conflict(
    db: Session,
    user_id: int,
    game_id: str,
    resolution: str,
    local_accounts: list[dict],
    cloud_accounts: list[GameAccount]
):
    if resolution == "cloud":
        return cloud_accounts

    result_accounts = []

    if resolution == "local":
        result_accounts = sync_accounts(db, user_id, game_id, local_accounts)

    elif resolution == "merge":
        existing_by_uid = {acc.uid: acc for acc in cloud_accounts if acc.uid}
        existing_by_name_server = {
            (acc.name.lower(), acc.server.lower()): acc
            for acc in cloud_accounts if not acc.uid
        }

        merged_accounts = list(cloud_accounts)
        existing_ids = {acc.id for acc in cloud_accounts}

        for local_acc in local_accounts:
            fc_uid = local_acc.get("uid")
            fc_name = local_acc.get("name", "")
            fc_server = local_acc.get("server", "")
            fc_key = (fc_name.lower(), fc_server.lower())

            is_duplicate = False
            if fc_uid and fc_uid in existing_by_uid:
                is_duplicate = True
            elif fc_key in existing_by_name_server:
                is_duplicate = True

            if not is_duplicate:
                new_account = GameAccount(
                    user_id=user_id,
                    game_id=game_id,
                    uid=local_acc.get("uid"),
                    name=fc_name,
                    server=fc_server,
                    ar=local_acc.get("ar", 1),
                    wl=local_acc.get("wl", "0"),
                    mc_option=local_acc.get("mc_option", "")
                )
                db.add(new_account)
                merged_accounts.append(new_account)

        db.commit()
        for acc in merged_accounts:
            if acc.id in existing_ids:
                db.refresh(acc)
        result_accounts = merged_accounts

    return result_accounts