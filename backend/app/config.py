from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str
    
    model_config = SettingsConfigDict(env_file="backend/.env", extra="ignore")

settings = Settings()

class OAuthSettings(BaseSettings):
    # Google
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str

    # Discord
    discord_client_id: str
    discord_client_secret: str
    discord_redirect_uri: str

    # JWT
    secret_key: str
    algorithm: str = "HS256"

    model_config = SettingsConfigDict(env_file="backend/.env", extra="ignore")

oauth_settings = OAuthSettings()