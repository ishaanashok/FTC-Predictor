# Remove the EPA-related imports and endpoint
from fastapi import FastAPI, HTTPException
import asyncio  # Add this import at the top with other imports
import time  # Add this import

from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv
import base64
from epa_calculator import EPACalculator
from utils.api_utils import ftc_api_request

load_dotenv()

app = FastAPI(debug=True)

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

# Remove the ftc_api_request function from main.py
# async def ftc_api_request(endpoint: str, params: dict | None = None):
#     headers = {
#         "Authorization": f"Basic {AUTH_TOKEN}",
#         "Content-Type": "application/json"
#     }
#     
#     async with httpx.AsyncClient() as client:
#         try:
#             response = await client.get(
#                 f"{FTC_API_BASE_URL}{endpoint}",
#                 headers=headers,
#                 params=params
#             )
#             response.raise_for_status()
#             return response.json()
#         except httpx.HTTPError as e:
#             if isinstance(e, httpx.HTTPStatusError):
#                 raise HTTPException(status_code=e.response.status_code, detail=str(e))
#             raise HTTPException(status_code=500, detail=str(e))

# Advancement endpoints
@app.get("/api/advancement/{season}/{eventCode}")
async def get_event_advancement(season: int, eventCode: str, excludeSkipped: bool = False):
    return await ftc_api_request(f"/{season}/advancement/{eventCode}", {"excludeSkipped": excludeSkipped})

@app.get("/api/advancement/{season}/{eventCode}/source")
async def get_advancement_source(season: int, eventCode: str, includeDeclines: bool = False):
    return await ftc_api_request(f"/{season}/advancement/{eventCode}/source", {"includeDeclines": includeDeclines})

# League endpoints
@app.get("/api/leagues/{season}")
async def get_leagues(season: int, regionCode: str | None = None, leagueCode: str | None = None):
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
async def get_events(season: int, eventCode: str | None = None, teamNumber: int | None = None):
    params = {"eventCode": eventCode, "teamNumber": teamNumber}
    return await ftc_api_request(f"/{season}/events", params)

@app.get("/api/events/{season}/{eventCode}/rankings")
async def get_event_rankings(season: int, eventCode: str):
    return await ftc_api_request(f"/{season}/rankings/{eventCode}")

@app.get("/api/teams/{season}")
async def get_teams(
    season: int,
    teamNumber: int | None = None,
    eventCode: str | None = None,
    state: str | None = None,
    country: str | None = None,  # Added missing parameter
    page: int = 1
):
    params = {
        "teamNumber": teamNumber,
        "eventCode": eventCode,
        "state": state,
        "country": country,
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
    tournamentLevel: str | None = None,
    teamNumber: int | None = None,
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

# Update path to match official API
@app.get("/api/matches/{season}/{eventCode}")
async def get_event_matches(
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
    return await ftc_api_request(f"/{season}/matches/{eventCode}", params)

# Update schedule endpoint to match API
@app.get("/api/schedule/{season}/{eventCode}")
async def get_event_schedule(
    season: int,
    eventCode: str,
    tournamentLevel: str = "qual",
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

@app.get("/api/teams/{teamNumber}/matches/{season}")
async def get_team_season_matches(season: int, teamNumber: int):
    try:
        # Get all events for the team in the season
        events_response = await ftc_api_request(f"/{season}/events", {"teamNumber": teamNumber})
        
        all_matches = []
        for event in events_response.get("events", []):
            # Get both qual and playoff matches for each event
            for tournament_level in ["qual", "playoff"]:
                try:
                    matches_response = await ftc_api_request(
                        f"/{season}/matches/{event['code']}", 
                        {
                            "tournamentLevel": tournament_level,
                            "teamNumber": teamNumber
                        }
                    )
                    
                    if matches_response.get("matches"):
                        # Add event context to each match
                        for match in matches_response["matches"]:
                            match["eventCode"] = event["code"]
                            match["eventName"] = event["name"]
                            match["tournamentLevel"] = tournament_level
                            all_matches.append(match)
                except Exception as e:
                    print(f"Error fetching {tournament_level} matches for event {event['code']}: {str(e)}")
                    continue

        return {"matches": all_matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/teams/{teamNumber}/historical-matches")
async def get_team_historical_matches(teamNumber: int):
    all_seasons_matches = {}
    current_season = 2024
    
    # Fetch data for recent seasons
    for season in range(2020, current_season + 1):
        try:
            season_matches = await get_team_season_matches(season, teamNumber)
            all_seasons_matches[season] = season_matches["matches"]
        except HTTPException as e:
            if e.status_code != 404:  # Ignore 404s for seasons without data
                raise e
            all_seasons_matches[season] = []
    
    return {"matches": all_seasons_matches}

@app.post("/api/event-predictions-epa")
async def get_event_predictions_epa(data: dict):
    try:
        season = data['season']
        event_code = data['eventCode']
        
        print(f"Processing request for season {season}, event {event_code}")
        
        # Get all data in parallel
        try:
            event_info, teams_data, matches_data = await asyncio.gather(
                ftc_api_request(f"/{season}/events", {"eventCode": event_code}),
                ftc_api_request(f"/{season}/teams", {"eventCode": event_code}),
                ftc_api_request(f"/{season}/matches/{event_code}"),
                return_exceptions=True
            )
            
            # Check for exceptions in gathered results
            for result in [event_info, teams_data, matches_data]:
                if isinstance(result, Exception):
                    raise result
                    
        except Exception as e:
            print(f"Error fetching initial data: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error fetching event data: {str(e)}")
        
        print(f"Found {len(teams_data.get('teams', []))} teams")
        
        # Get EPA for all teams
        calculator = EPACalculator()
        epa_tasks = []
        teams_list = teams_data.get('teams', [])
        
        try:
            print(f"Starting EPA calculations for {len(teams_list)} teams")
            start_time = time.time()
            
            # Create coroutines for all teams
            async def process_team(team):
                try:
                    print(f"Fetching matches for team {team['teamNumber']}")
                    team_start_time = time.time()
                    
                    # Get event start date from event_info
                    event_start_date = event_info.get('events', [])[0].get('dateStart') if event_info.get('events') else None
                    matches = await calculator.get_team_matches(team['teamNumber'], event_start_date)
                    team_fetch_time = time.time() - team_start_time
                    print(f"Fetched matches for team {team['teamNumber']} in {team_fetch_time:.2f} seconds")
                    
                    epa_start_time = time.time()
                    epa = calculator.calculate_historical_epa(matches, team['teamNumber'])
                    epa_calc_time = time.time() - epa_start_time
                    print(f"Calculated EPA for team {team['teamNumber']} in {epa_calc_time:.2f} seconds")
                    
                    return {"teamNumber": team['teamNumber'], "historicalEPA": epa}
                except Exception as e:
                    print(f"Error processing team {team['teamNumber']}: {str(e)}")
                    return None
            
            # Execute all team processing coroutines in parallel. 
            epa_tasks = await asyncio.gather(*[process_team(team) for team in teams_list])
            epa_tasks = [task for task in epa_tasks if task is not None]
            
            total_time = time.time() - start_time
            print(f"Completed EPA calculations for all teams in {total_time:.2f} seconds")
        except Exception as e:
            print(f"Error processing team EPAs: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error calculating team EPAs: {str(e)}")
        
        # Create EPA mapping
        team_epas = {str(team['teamNumber']): epa_result['historicalEPA'] 
                    for team, epa_result in zip(teams_data.get('teams', []), epa_tasks)}
        
        print(f"Calculated EPAs for {len(team_epas)} teams")
        
        # Calculate predictions for all matches
        predictions = []
        try:
            for match in matches_data.get('matches', []):
                red_teams = [team['teamNumber'] for team in match['teams'] 
                            if 'Red' in team['station']]
                blue_teams = [team['teamNumber'] for team in match['teams'] 
                             if 'Blue' in team['station']]
                
                prediction = calculator.calculate_match_win_probability(
                    red_teams, blue_teams, team_epas
                )
                
                predictions.append({
                    'matchNumber': match['matchNumber'],
                    'prediction': prediction
                })
                
        except Exception as e:
            print(f"Error calculating predictions: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error calculating match predictions: {str(e)}")
        
        return {
            'eventDetails': event_info,
            'teams': teams_data.get('teams', []),
            'matches': matches_data.get('matches', []),
            'teamEPAs': team_epas,
            'predictions': predictions
        }
    except Exception as e:
        print(f"Unexpected error in get_event_predictions_epa: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/teams/{teamNumber}/historical-matches")
async def get_team_historical_matches(teamNumber: int):
    all_seasons_matches = {}
    
    # Fetch data from 2020 to 2024
    for season in range(2020, 2025):
        try:
            season_matches = await get_team_matches(season, teamNumber)
            all_seasons_matches[season] = season_matches["matches"]
        except HTTPException as e:
            if e.status_code != 404:  # Ignore 404s for seasons without data
                raise e
            all_seasons_matches[season] = []
    
    return {"matches": all_seasons_matches}

@app.get("/api/teams/{teamNumber}/historical-epa")
async def get_team_historical_epa(teamNumber: int):
    try:
        calculator = EPACalculator()
        matches = await calculator.get_team_matches(teamNumber)
        historical_epa = calculator.calculate_historical_epa(matches, teamNumber)
        return {"teamNumber": teamNumber, "historicalEPA": historical_epa}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/match-prediction")
async def get_match_prediction(data: dict):
    try:
        calculator = EPACalculator()
        prediction = calculator.calculate_match_win_probability(
            data['redTeams'], 
            data['blueTeams'], 
            data['teamEpas']
        )
        
        return {
            "season": data['season'],
            "eventCode": data['eventCode'],
            "matchNumber": data['matchNumber'],
            "redTeams": data['redTeams'],
            "blueTeams": data['blueTeams'],
            "prediction": prediction
        }
    except Exception as e:
        print(f"Error in match prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))
