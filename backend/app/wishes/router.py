from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from .schemas import ImportWishesRequest
from .crud import parse_wish_url, fetch_wishes_from_genshin, GACHA_TYPES, get_wishes_by_account

router = APIRouter(prefix="/api/wishes", tags=["wishes"])

@router.post("/import")
async def import_wishes(request: ImportWishesRequest, db: Session = Depends(get_db)):
    """Import wishes from a wish history URL."""
    parsed = parse_wish_url(request.url)
    
    all_wishes = []
    for gacha_type in GACHA_TYPES.keys():
        try:
            wishes = await fetch_wishes_from_genshin(
                api_host=parsed["api_host"],
                authkey=parsed["authkey"],
                authkey_ver=parsed["authkey_ver"],
                gacha_type=gacha_type
            )
            for w in wishes:
                w["gacha_type"] = gacha_type
                w["server"] = parsed["server"]
            all_wishes.extend(wishes)
        except Exception as e:
            print(f"Error fetching gacha_type {gacha_type}: {e}")
            continue
    
    if not all_wishes:
        raise HTTPException(status_code=400, detail="No wishes found")
    
    return {
        "message": f"Found {len(all_wishes)} wishes",
        "wishes": all_wishes[:5]
    }

@router.get("/{account_id}")
async def get_wishes(account_id: int, db: Session = Depends(get_db)):
    """Get all wishes for an account."""
    wishes = get_wishes_by_account(db, account_id)
    return {"wishes": wishes}
