from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.limiter import limiter
from .schemas import ImportWishesRequest, WishCreate
from .crud import get_wishes_by_account, get_or_create_game_account, batch_create_wishes
from .fetchers import get_fetcher
from app.auth.crud import decode_token
from datetime import datetime

router = APIRouter(prefix="/api/wishes", tags=["wishes"])

def get_optional_user_id(authorization: str = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    try:
        data = decode_token(token)
        return int(data["sub"])
    except Exception:
        return None

@router.post("/import")
@limiter.limit("5/minute")
async def import_wishes(
    request: Request,
    payload: ImportWishesRequest, 
    db: Session = Depends(get_db),
    user_id: int | None = Depends(get_optional_user_id)
):
    """Import wishes from a wish history URL."""
    try:
        fetcher = get_fetcher(payload.game_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    parsed = fetcher.parse_url(payload.url)
    all_wishes = await fetcher.fetch_wishes(parsed)
    
    if not all_wishes:
        raise HTTPException(status_code=400, detail="No wishes found")
        
    inserted_count = 0
    if user_id and all_wishes:
        # Extract uid from the first wish
        game_uid = all_wishes[0].get("uid")
        if game_uid:
            account = get_or_create_game_account(
                db=db, 
                user_id=user_id, 
                game_id=payload.game_id,
                uid=game_uid, 
                server=all_wishes[0].get("server", "unknown")
            )
            
            wishes_data = []
            for w in all_wishes:
                wishes_data.append({
                    "wish_uid": w["id"],
                    "account_id": account.id,
                    "gacha_type": int(w["gacha_type"]),
                    "item_id": w.get("item_id", ""),
                    "item_name": w["name"],
                    "rarity": int(w.get("rank_type", 3)),
                    "timestamp": datetime.strptime(w["time"], "%Y-%m-%d %H:%M:%S")
                })
                
            inserted_count = batch_create_wishes(db, wishes_data)
    
    # Format for frontend response
    frontend_wishes = []
    for w in all_wishes:
        frontend_wishes.append({
            "id": w["id"],
            "uid": w.get("uid"),
            "name": w["name"],
            "rarity": int(w.get("rank_type", 3)),
            "gacha_type": int(w["gacha_type"]),
            "time": w["time"]
        })

    msg = f"Found {len(all_wishes)} wishes."
    if user_id:
        msg += f" {inserted_count} new wishes saved to cloud."
    else:
        msg += " Saved locally. Sign in to save to cloud."

    return {
        "message": msg,
        "wishes": frontend_wishes
    }

@router.post("/sync")
async def sync_wishes(
    request: dict,  # Expecting {"game_id": "...", "wishes": [...]}
    db: Session = Depends(get_db),
    user_id: int | None = Depends(get_optional_user_id)
):
    if not user_id:
        raise HTTPException(status_code=401, detail="Must be logged in to sync")
        
    game_id = request.get("game_id")
    wishes = request.get("wishes", [])
        
    if not wishes or not game_id:
        return {"message": "No wishes or game_id provided to sync."}
        
    # Group wishes by uid
    wishes_by_uid = {}
    for w in wishes:
        uid = w.get("uid")
        if uid:
            if uid not in wishes_by_uid:
                wishes_by_uid[uid] = []
            wishes_by_uid[uid].append(w)
            
    total_inserted = 0
    for uid, uid_wishes in wishes_by_uid.items():
        account = get_or_create_game_account(
            db=db, 
            user_id=user_id, 
            game_id=game_id, 
            uid=uid, 
            server="unknown", 
            name="Synced Account"
        )
        
        wishes_data = []
        for w in uid_wishes:
            try:
                wishes_data.append({
                    "wish_uid": w["id"],
                    "account_id": account.id,
                    "gacha_type": int(w["gacha_type"]),
                    "item_id": "", # we don't have item_id in local data, but it's fine
                    "item_name": w["name"],
                    "rarity": int(w["rarity"]),
                    "timestamp": datetime.strptime(w["time"], "%Y-%m-%d %H:%M:%S")
                })
            except Exception:
                continue
                
        if wishes_data:
            total_inserted += batch_create_wishes(db, wishes_data)

    return {"message": f"Synced {total_inserted} new wishes to cloud."}

from app.accounts.models import GameAccount

@router.get("/{account_id}")
async def get_wishes(
    account_id: int, 
    db: Session = Depends(get_db),
    user_id: int | None = Depends(get_optional_user_id)
):
    """Get all wishes for an account."""
    if not user_id:
        raise HTTPException(status_code=401, detail="Must be logged in to view wishes")
        
    account = db.query(GameAccount).filter(GameAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    if account.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this account")
        
    wishes = get_wishes_by_account(db, account_id)
    return {"wishes": wishes}
