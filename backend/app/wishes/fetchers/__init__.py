from abc import ABC, abstractmethod

class BaseFetcher(ABC):
    @abstractmethod
    def parse_url(self, url: str) -> dict:
        """Parse the wish history URL to extract auth tokens and metadata."""
        pass

    @abstractmethod
    async def fetch_wishes(self, parsed_data: dict) -> list[dict]:
        """Fetch all wishes from the game API and return them in a standardized format.
        Standardized format should be a list of dictionaries with at least:
        {
            "id": "wish_uid_string",
            "uid": "player_game_uid",
            "gacha_type": int,
            "item_id": "string",
            "name": "string",
            "rank_type": int,
            "time": "YYYY-MM-DD HH:MM:SS",
            "server": "server_name"
        }
        """
        pass

def get_fetcher(game_id: str) -> BaseFetcher:
    if game_id == "genshin":
        from .genshin import GenshinFetcher
        return GenshinFetcher()
    # Add other fetchers here as they are implemented
    raise ValueError(f"No fetcher implemented for game_id: {game_id}")
