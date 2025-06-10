import asyncio
import time
from typing import List, Dict, Any, Optional
from epa_calculator import EPACalculator

class ParallelEPAProcessor:
    def __init__(self, concurrency_limit: int = 20):
        self.calculator = EPACalculator()
        self.concurrency_limit = concurrency_limit
    
    async def calculate_team_epa(self, team_number: int, event_start_date: Optional[str] = None) -> Dict[str, Any]:
        """Calculate EPA for a single team."""
        try:
            team_start_time = time.time()
            print(f"Processing team {team_number}")
            
            matches = await self.calculator.get_team_matches(team_number, event_start_date if event_start_date is not None else "")
            epa = self.calculator.calculate_historical_epa(matches, team_number)
            
            process_time = time.time() - team_start_time
            print(f"Processed team {team_number} in {process_time:.2f} seconds")
            
            return {"teamNumber": team_number, "historicalEPA": epa, "matches": matches}
        except Exception as e:
            print(f"Error processing team {team_number}: {str(e)}")
            return {"teamNumber": team_number, "historicalEPA": 0.0, "error": str(e)}
    
    async def calculate_multiple_team_epas(self, team_numbers: List[int], event_start_date: Optional[str] = None) -> List[Dict[str, Any]]:
        """Calculate EPAs for multiple teams in parallel with concurrency limit."""
        semaphore = asyncio.Semaphore(self.concurrency_limit)
        
        async def limited_process_team(team_num):
            async with semaphore:
                return await self.calculate_team_epa(team_num, event_start_date)
        
        start_time = time.time()
        print(f"Starting EPA calculations for {len(team_numbers)} teams")
        
        # Process all teams concurrently with semaphore limiting
        tasks = [limited_process_team(team_num) for team_num in team_numbers]
        results = await asyncio.gather(*tasks)
        
        total_time = time.time() - start_time
        print(f"Completed EPA calculations for {len(team_numbers)} teams in {total_time:.2f} seconds")
        
        return results
    
    def get_epa_mapping(self, epa_results: List[Dict[str, Any]]) -> Dict[str, float]:
        """Convert EPA results list to a mapping of team numbers to EPA values."""
        return {str(result['teamNumber']): result.get('historicalEPA', 0.0) for result in epa_results}
    
    async def calculate_match_predictions(self, 
                                         matches: List[Dict[str, Any]], 
                                         team_epas: Dict[str, float]) -> List[Dict[str, Any]]:
        """Calculate predictions for all matches in parallel."""
        async def process_match(match):
            red_teams = [team['teamNumber'] for team in match['teams'] if 'Red' in team['station']]
            blue_teams = [team['teamNumber'] for team in match['teams'] if 'Blue' in team['station']]
            
            prediction = self.calculator.calculate_match_win_probability(
                red_teams, blue_teams, team_epas
            )
            
            return {
                'matchNumber': match['matchNumber'],
                'prediction': prediction
            }
        
        # Process all match predictions concurrently
        tasks = [process_match(match) for match in matches]
        return await asyncio.gather(*tasks)
