from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv
import base64

load_dotenv()

app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FTC API Configuration
FTC_API_BASE_URL = "https://ftc-api.firstinspires.org/v2.0"
FTC_USERNAME = os.getenv("FTC_API_USERNAME")
FTC_AUTH_KEY = os.getenv("FTC_API_KEY")

# Create authorization token
auth_string = f"{FTC_USERNAME}:{FTC_AUTH_KEY}"
AUTH_TOKEN = base64.b64encode(auth_string.encode()).decode()

async def ftc_api_request(endpoint: str, params: dict = None):
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
            raise HTTPException(status_code=e.response.status_code, detail=str(e))

# Advancement endpoints
@app.get("/api/advancement/{season}/{eventCode}")
async def get_event_advancement(season: int, eventCode: str, excludeSkipped: bool = False):
    return await ftc_api_request(f"/{season}/advancement/{eventCode}", {"excludeSkipped": excludeSkipped})

@app.get("/api/advancement/{season}/{eventCode}/source")
async def get_advancement_source(season: int, eventCode: str, includeDeclines: bool = False):
    return await ftc_api_request(f"/{season}/advancement/{eventCode}/source", {"includeDeclines": includeDeclines})

# League endpoints
@app.get("/api/leagues/{season}")
async def get_leagues(season: int, regionCode: str = None, leagueCode: str = None):
    params = {"regionCode": regionCode, "leagueCode": leagueCode}
    return await ftc_api_request(f"/{season}/leagues", params)

@app.get("/api/leagues/{season}/members/{regionCode}/{leagueCode}")
async def get_league_members(season: int, regionCode: str, leagueCode: str):
    return await ftc_api_request(f"/{season}/leagues/members/{regionCode}/{leagueCode}")

@app.get("/api/leagues/{season}/rankings/{regionCode}/{leagueCode}")
async def get_league_rankings(season: int, regionCode: str, leagueCode: str):
    return await ftc_api_request(f"/{season}/leagues/rankings/{regionCode}/{leagueCode}")

# Season Data endpoints
@app.get("/api/season/{season}")
async def get_season_summary(season: int):
    return await ftc_api_request(f"/{season}")

@app.get("/api/events/{season}")
async def get_events(season: int, eventCode: str = None, teamNumber: int = None):
    params = {"eventCode": eventCode, "teamNumber": teamNumber}
    return await ftc_api_request(f"/{season}/events", params)

@app.get("/api/events/{season}/{eventCode}/rankings")
async def get_event_rankings(season: int, eventCode: str):
    return await ftc_api_request(f"/{season}/rankings/{eventCode}")

@app.get("/api/teams/{season}")
async def get_teams(
    season: int,
    teamNumber: int = None,
    eventCode: str = None,
    state: str = None,
    page: int = 1
):
    params = {
        "teamNumber": teamNumber,
        "eventCode": eventCode,
        "state": state,
        "page": page
    }
    return await ftc_api_request(f"/{season}/teams", params)

# Schedule endpoints
@app.get("/api/schedule/{season}/{eventCode}/{tournamentLevel}/hybrid")
async def get_hybrid_schedule(
    season: int,
    eventCode: str,
    tournamentLevel: str,
    start: int = 0,
    end: int = 999
):
    params = {"start": start, "end": end}
    return await ftc_api_request(
        f"/{season}/schedule/{eventCode}/{tournamentLevel}/hybrid",
        params
    )

@app.get("/api/schedule/{season}/{eventCode}")
async def get_event_schedule(
    season: int,
    eventCode: str,
    tournamentLevel: str = None,
    teamNumber: int = None,
    start: int = 0,
    end: int = 999
):
    params = {
        "tournamentLevel": tournamentLevel,
        "teamNumber": teamNumber,
        "start": start,
        "end": end
    }
    return await ftc_api_request(f"/{season}/schedule/{eventCode}", params)