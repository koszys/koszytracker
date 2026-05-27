from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt
from app.config import oauth_settings
from .models import User, UserOAuth

def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, oauth_settings.secret_key, algorithm=oauth_settings.algorithm)

def decode_token(token: str) -> dict:
    return jwt.decode(token, oauth_settings.secret_key, algorithms=[oauth_settings.algorithm])

def get_or_create_user(db: Session, provider: str, provider_user_id: str, email: str, name: str, picture: str = None):
    # Check if this exact OAuth account already exists
    oauth_account = db.query(UserOAuth).filter(
        UserOAuth.provider == provider,
        UserOAuth.provider_user_id == provider_user_id
    ).first()

    if oauth_account:
        user = oauth_account.user
        
        if not user:
            # Clean up orphaned OAuth account
            db.delete(oauth_account)
            db.commit()
            return get_or_create_user(db, provider, provider_user_id, email, name, picture)
            
        if user.email != email:
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user and existing_user.id != user.id:
                # Merge the old user into the existing user
                for oa in user.oauth_accounts:
                    oa.user_id = existing_user.id
                for ga in user.game_accounts:
                    ga.user_id = existing_user.id
                
                # Clear relationships so SQLAlchemy doesn't nullify the FKs upon deletion
                user.oauth_accounts = []
                user.game_accounts = []
                
                db.delete(user)
                user = existing_user
            else:
                user.email = email

        # Update user profile with latest data
        user.name = name
        user.picture = picture
        db.commit()
        db.refresh(user)
        return user

    # Check if a user with this email already exists
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Create a new user if no match found
        user = User(email=email, name=name, picture=picture)
        db.add(user)
        db.flush()

    # Link the new OAuth provider to the existing or newly created user
    new_oauth = UserOAuth(
        user_id=user.id,
        provider=provider,
        provider_user_id=provider_user_id
    )
    db.add(new_oauth)
    db.commit()
    db.refresh(user)
    
    return user
