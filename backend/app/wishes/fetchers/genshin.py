import httpx
from fastapi import HTTPException
from urllib.parse import urlparse, parse_qs, unquote
from . import BaseFetcher

GACHA_TYPES = {
    301: "Character Event Wish",
    302: "Weapon Event Wish",
    303: "Standard Wish",
    304: "Chronicled Wish"
}

class GenshinFetcher(BaseFetcher):
    def parse_url(self, url: str) -> dict:
        """Parse the wish history URL to extract auth key and game biz."""
        parsed = urlparse(url)
        params = parse_qs(parsed.query)
        
        if "authkey" not in params:
            raise HTTPException(status_code=400, detail="Invalid wish URL: missing authkey")
        
        game_biz = params.get("game_biz", ["hk4e_global"])[0]
        
        if game_biz == "hk4e_cn":
            server = "cn"
            api_host = "public-operation-hk4e.mihoyo.com"
        else:
            server = "os_i"
            api_host = "public-operation-hk4e-sg.hoyoverse.com"
        
        authkey = unquote(params["authkey"][0])
        
        return {
            "authkey": authkey,
            "authkey_ver": int(params.get("authkey_ver", [1])[0]),
            "game_biz": game_biz,
            "server": server,
            "api_host": api_host
        }

    async def fetch_wishes(self, parsed_data: dict) -> list[dict]:
        all_wishes = []
        for gacha_type in GACHA_TYPES.keys():
            try:
                wishes = await self._fetch_gacha_type(
                    api_host=parsed_data["api_host"],
                    authkey=parsed_data["authkey"],
                    authkey_ver=parsed_data["authkey_ver"],
                    gacha_type=gacha_type
                )
                for w in wishes:
                    w["gacha_type"] = gacha_type
                    w["server"] = parsed_data["server"]
                all_wishes.extend(wishes)
            except Exception as e:
                print(f"Error fetching gacha_type {gacha_type}: {e}")
                continue
                
        return all_wishes

    async def _fetch_gacha_type(self, api_host: str, authkey: str, authkey_ver: int, gacha_type: int, lang: str = "en"):
        """Fetch wishes from Genshin's API."""
        url = f"https://{api_host}/gacha_info/api/getGachaLog"
        
        params = {
            "authkey": authkey,
            "authkey_ver": authkey_ver,
            "gacha_type": gacha_type,
            "lang": lang,
            "size": 20
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params, timeout=30.0)
                data = response.json()
                
                if data.get("retcode") != 0:
                    print(f"Error for gacha_type {gacha_type}: {data.get('message')}")
                    return []
                
                return data.get("data", {}).get("list", [])
            except Exception as e:
                print(f"Exception for gacha_type {gacha_type}: {e}")
                return []
