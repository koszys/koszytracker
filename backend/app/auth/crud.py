from sqlalchemy.orm import Session
from jose import jwt
from app.config import oauth_settings
from .models import User, UserOAuth

def create_token(data: dict) -> str:
    return jwt.encode(data, oauth_settings.secret_key, algorithm=oauth_settings.algorithm)

def decode_token(token: str) -> dict:
    return jwt.decode(token, oauth_settings.secret_key, algorithms=[oauth_settings.algorithm])

def get_or_create_user(db: Session, provider: str, provider_user_id: str, email: str, name: str, picture: str = None):
    oauth_account = db.query(UserOAuth).filter(
        UserOAuth.provider == provider,
        UserOAuth.provider_user_id == provider_user_id
    ).first()

    if oauth_account:
        user = oauth_account.user
        user.email = email
        user.name = name
        user.picture = picture
    else:
        user = User(email=email, name=name, picture=picture)
        db.add(user)
        db.flush()

        oauth_account = UserOAuth(
            user_id=user.id,
            provider=provider,
            provider_user_id=provider_user_id
        )
        db.add(oauth_account)

    db.commit()
    return user
