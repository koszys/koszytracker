from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
import httpx
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import oauth_settings
from .crud import get_or_create_user, create_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/google")
def login_google():
    params = {
        "client_id": oauth_settings.google_client_id,
        "redirect_uri": oauth_settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{query}")

@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": oauth_settings.google_client_id,
                "client_secret": oauth_settings.google_client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": oauth_settings.google_redirect_uri,
            }
        )
        access_token = token_resp.json()["access_token"]

        user_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_info = user_resp.json()

    user = get_or_create_user(
        db=db,
        provider="google",
        provider_user_id=user_info["id"],
        email=user_info["email"],
        name=user_info["name"],
        picture=user_info.get("picture")
    )

    token = create_token({"sub": str(user.id), "email": user.email, "name": user.name, "picture": user.picture})
    return RedirectResponse(f"http://localhost:3000/auth/callback?token={token}")

@router.get("/discord")
def login_discord():
    params = {
        "client_id": oauth_settings.discord_client_id,
        "redirect_uri": oauth_settings.discord_redirect_uri,
        "response_type": "code",
        "scope": "identify email",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(f"https://discord.com/api/oauth2/authorize?{query}")

@router.get("/discord/callback")
async def discord_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://discord.com/api/oauth2/token",
            data={
                "client_id": oauth_settings.discord_client_id,
                "client_secret": oauth_settings.discord_client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": oauth_settings.discord_redirect_uri,
            }
        )
        token_data = token_resp.json()
        access_token = token_data["access_token"]

        user_resp = await client.get(
            "https://discord.com/api/users/@me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_info = user_resp.json()

    user = get_or_create_user(
        db=db,
        provider="discord",
        provider_user_id=user_info["id"],
        email=f"{user_info['username']}@discord",
        name=user_info["username"],
        picture=f"https://cdn.discordapp.com/avatars/{user_info['id']}/{user_info['avatar']}.png"
    )

    token = create_token({"sub": str(user.id), "email": user.email, "name": user.name, "picture": user.picture})
    return RedirectResponse(f"http://localhost:3000/auth/callback?token={token}")
