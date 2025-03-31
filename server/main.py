from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

# Verify environment variables are loaded
username = os.getenv("FTC_API_USERNAME")
api_key = os.getenv("FTC_API_KEY")

if not username or not api_key:
    raise ValueError("FTC API credentials not found in environment variables")

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_URL = "https://ftc-api.firstinspires.org/v2.0"
AUTH_TOKEN = httpx.BasicAuth(username=username, password=api_key)

@app.get("/api/teams/{season}")
async def get_teams(season: int, search: str = None, state: str = None):
    async with httpx.AsyncClient() as client:
        params = {}
        if search:
            params['nameOrNumber'] = search
        if state:
            params['state'] = state
        response = await client.get(
            f"{BASE_URL}/{season}/teams",
            params=params,
            auth=AUTH_TOKEN
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@app.get("/api/teams/{season}/{team_number}")
async def get_team_info(season: int, team_number: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/{season}/teams",
            params={"teamNumber": team_number},
            auth=AUTH_TOKEN
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@app.get("/api/events/{season}")
async def get_events(season: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/{season}/events",
            auth=AUTH_TOKEN
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@app.get("/api/events/{season}/{event_code}")
async def get_event_info(season: int, event_code: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/{season}/events",
            params={"eventCode": event_code},
            auth=AUTH_TOKEN
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@app.get("/api/rankings/{season}/{event_code}")
async def get_event_rankings(season: int, event_code: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/{season}/rankings/{event_code}",
            auth=AUTH_TOKEN
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@app.get("/api/schedule/{season}/{event_code}/{tournament_level}")
async def get_event_schedule(season: int, event_code: str, tournament_level: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/{season}/schedule/{event_code}/{tournament_level}/hybrid",
            auth=AUTH_TOKEN
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()