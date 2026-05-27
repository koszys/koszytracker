from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.auth.crud import decode_token
from . import crud
from .schemas import (
    GameAccountCreate,
    GameAccountUpdate,
    GameAccountResponse,
    SyncAccountsRequest,
    SyncAccountsResponse,
    ConflictCheckRequest,
    ConflictCheckResponse,
    ConflictResolveRequest,
    ConflictResolveResponse
)

router = APIRouter(prefix="/api/accounts", tags=["accounts"])

def get_user_id_from_token(authorization: str = Header(default=None)) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization required")
    token = authorization.split(" ")[1]
    try:
        data = decode_token(token)
        return int(data["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("", response_model=list[GameAccountResponse])
def get_accounts(
    game_id: Optional[str] = None,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_user_id_from_token)
):
    accounts = crud.get_user_accounts(db, user_id, game_id)
    return accounts

@router.post("", response_model=GameAccountResponse)
def create_account(
    account: GameAccountCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_user_id_from_token)
):
    return crud.create_account(db, user_id, account)

@router.put("/{account_id}", response_model=GameAccountResponse)
def update_account(
    account_id: int,
    account_update: GameAccountUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_user_id_from_token)
):
    return crud.update_account(db, account_id, user_id, account_update)

@router.delete("/{account_id}")
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_user_id_from_token)
):
    crud.delete_account(db, account_id, user_id)
    return {"message": "Account deleted"}

@router.post("/sync", response_model=SyncAccountsResponse)
def sync_accounts(
    request: SyncAccountsRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_user_id_from_token)
):
    accounts = crud.sync_accounts(
        db,
        user_id,
        request.game_id,
        [acc.model_dump() for acc in request.accounts]
    )
    now = datetime.utcnow()
    for acc in accounts:
        acc.last_synced_at = now
    db.commit()
    for acc in accounts:
        db.refresh(acc)
    return SyncAccountsResponse(
        accounts=accounts,
        message=f"Synced {len(accounts)} accounts"
    )

@router.post("/check-conflict", response_model=ConflictCheckResponse)
def check_conflict(
    request: ConflictCheckRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_user_id_from_token)
):
    result = crud.check_accounts_conflict(
        db,
        user_id,
        request.game_id,
        [acc.model_dump() for acc in request.accounts]
    )
    return ConflictCheckResponse(
        has_conflict=result["has_conflict"],
        local_modified_at=result["local_modified_at"],
        cloud_modified_at=result["cloud_modified_at"],
        cloud_accounts=result["cloud_accounts"],
        message=result["message"]
    )

@router.post("/resolve-conflict", response_model=ConflictResolveResponse)
def resolve_conflict(
    request: ConflictResolveRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_user_id_from_token)
):
    accounts = crud.resolve_accounts_conflict(
        db,
        user_id,
        request.game_id,
        request.resolution,
        [acc.model_dump() for acc in request.local_accounts],
        request.cloud_accounts
    )
    now = datetime.utcnow()
    for acc in accounts:
        acc.last_synced_at = now
    db.commit()
    for acc in accounts:
        db.refresh(acc)
    return ConflictResolveResponse(
        accounts=accounts,
        message=f"Resolved conflict using {request.resolution} data"
    )