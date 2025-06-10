from fastapi import FastAPI, HTTPException
import asyncio
import time

# Import or define ftc_api_request here
# Example placeholder implementation:
async def ftc_api_request(endpoint: str, params: dict = {}):
    # Replace this with actual API request logic
    return {}

# Placeholder implementation for ParallelEPAProcessor
class ParallelEPAProcessor:
    def __init__(self, concurrency_limit=50):
        self.concurrency_limit = concurrency_limit

    async def calculate_multiple_team_epas(self, team_numbers, event_start_date):
        # Replace with actual EPA calculation logic
        return [{"teamNumber": num, "epa": 100 + num} for num in team_numbers]

    def get_epa_mapping(self, epa_results):
        # Replace with actual mapping logic
        return {result["teamNumber"]: result["epa"] for result in epa_results}

    async def calculate_match_predictions(self, matches, team_epas):
        # Replace with actual prediction logic
        return [{"match": match, "prediction": "TBD"} for match in matches]

app = FastAPI()

@app.post("/api/event-predictions-epa")
async def get_event_predictions_epa(data: dict):
    try:
        season = data['season']
        event_code = data['eventCode']
        
        print(f"Processing request for season {season}, event {event_code}")
        
        # Get all initial data in parallel
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

            # Only access .get if teams_data is not an exception
            teams_list = teams_data.get('teams', []) if isinstance(teams_data, dict) else []
            print(f"Found {len(teams_list)} teams")
                    
        except Exception as e:
            print(f"Error fetching initial data: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error fetching event data: {str(e)}")
        
        try:
            # Get event start date
            if isinstance(event_info, dict) and event_info.get('events'):
                event_start_date = event_info['events'][0].get('dateStart')
            else:
                event_start_date = None
            
            # Initialize the parallel EPA processor
            epa_processor = ParallelEPAProcessor(concurrency_limit=50)
            
            # Extract team numbers from the teams list
            team_numbers = [team['teamNumber'] for team in teams_list]
            
            # Process all teams in parallel
            start_time = time.time()
            epa_results = await epa_processor.calculate_multiple_team_epas(team_numbers, event_start_date)
            total_time = time.time() - start_time
            print(f"Completed EPA calculations for all teams in {total_time:.2f} seconds")
            
            # Create EPA mapping
            team_epas = epa_processor.get_epa_mapping(epa_results)
            print(f"Calculated EPAs for {len(team_epas)} teams")
            
            # Calculate predictions for all matches in parallel
            matches_list = matches_data.get('matches', []) if isinstance(matches_data, dict) else []
            predictions = await epa_processor.calculate_match_predictions(
                matches_list,
                team_epas
            )
                
        except Exception as e:
            print(f"Error processing team EPAs or predictions: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error calculating team EPAs or match predictions: {str(e)}")
        
        return {
            'eventDetails': event_info,
            'teams': teams_data.get('teams', []) if isinstance(teams_data, dict) else [],
            'matches': matches_data.get('matches', []) if isinstance(matches_data, dict) else [],
            'teamEPAs': team_epas,
            'predictions': predictions
        }
        
    except Exception as e:
        print(f"Unexpected error in get_event_predictions_epa: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
