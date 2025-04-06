import os
from dotenv import load_dotenv
import base64
import httpx
from fastapi import HTTPException

load_dotenv()

async def ftc_api_request(endpoint: str, params: dict | None = None):
    FTC_API_BASE_URL = "https://ftc-api.firstinspires.org/v2.0"
    FTC_USERNAME = os.getenv("FTC_API_USERNAME")
    FTC_AUTH_KEY = os.getenv("FTC_API_KEY")

    auth_string = f"{FTC_USERNAME}:{FTC_AUTH_KEY}"
    AUTH_TOKEN = base64.b64encode(auth_string.encode()).decode()
    
    headers = {
        "Authorization": f"Basic {AUTH_TOKEN}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{FTC_API_BASE_URL}{endpoint}",
                headers=headers,
                params=params
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            if isinstance(e, httpx.HTTPStatusError):
                raise HTTPException(status_code=e.response.status_code, detail=str(e))
            raise HTTPException(status_code=500, detail=str(e))