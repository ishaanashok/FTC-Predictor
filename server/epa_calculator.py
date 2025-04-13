import os
from dotenv import load_dotenv
import base64
import asyncio
import httpx
import math  # Add this import
from fastapi import HTTPException
from utils.api_utils import ftc_api_request

class EPACalculator:
    def __init__(self):
        self.year_weights = {
            2024: 1.0,
            2023: 0.7,
            2022: 0.5
        }
        self.k = 12  # EPA scaling factor for win probability

    async def get_team_matches(self, team_number: int) -> dict:
        all_matches = {}
        
        # Only fetch from 2022 onwards as older data seems unreliable
        for season in range(2022, 2025):
            try:
                events_response = await ftc_api_request(f"/{season}/events", {"teamNumber": team_number})
                
                if not events_response.get("events"):
                    continue
                
                # Prepare parallel requests for qualification matches only
                match_tasks = []
                for event in events_response.get("events", []):
                    # Skip if event code is missing
                    if not event.get('code'):
                        continue
                        
                    match_tasks.append({
                        'event': event,
                        'task': ftc_api_request(
                            f"/{season}/matches/{event['code']}", 
                            {
                                "tournamentLevel": "qual",
                                "teamNumber": team_number
                            }
                        )
                    })
                
                if not match_tasks:
                    continue
                
                # Execute all requests in parallel with timeout
                match_results = await asyncio.gather(
                    *[task['task'] for task in match_tasks],
                    return_exceptions=True
                )
                
                # Process results and filter for Qualification matches
                season_matches = []
                for result, task_info in zip(match_results, match_tasks):
                    if isinstance(result, Exception):
                        continue
                        
                    if result.get("matches"):
                        for match in result["matches"]:
                            # Only include matches with tournamentLevel set to "QUALIFICATION"
                            if match.get('tournamentLevel', '').upper() == "QUALIFICATION":
                                match["eventCode"] = task_info['event']['code']
                                match["eventName"] = task_info['event']['name']
                                season_matches.append(match)
                
                if season_matches:
                    all_matches[season] = season_matches
                
            except Exception as e:
                continue
        
        return all_matches

    def calculate_match_epa(self, match: dict, team_number: int) -> float:
        try:
            # Find team's alliance from the teams array
            team_data = next(
                (team for team in match.get('teams', []) 
                if str(team.get('teamNumber')) == str(team_number)),
                None
            )
            
            if not team_data:
                return 0.0

            # Determine alliance color from station
            is_red = 'Red' in team_data['station']
            
            # Get alliance and opponent scores
            alliance_score = match.get('scoreRedFinal', 0) if is_red else match.get('scoreBlueFinal', 0)
            opponent_score = match.get('scoreBlueFinal', 0) if is_red else match.get('scoreRedFinal', 0)

            if alliance_score == 0 and opponent_score == 0:
                return 0.0

            # Count teams in alliance
            alliance_teams = len([t for t in match.get('teams', []) if ('Red' in t['station']) == is_red])
            
            # Base contribution (split among alliance members)
            base_contribution = alliance_score / alliance_teams

            # Opponent strength adjustment (normalized to typical match scores)
            opponent_strength = 1 + (opponent_score / max(alliance_score, 1))

            # Match type multiplier
            match_type = 1.3 if match.get('tournamentLevel', '').lower() == 'playoff' else 1.0

            # Calculate match EPA
            match_epa = base_contribution * opponent_strength * match_type

            return match_epa

        except Exception as e:
            print(f"Error calculating match EPA: {e}")
            return 0.0

    def calculate_season_epa(self, matches: list, team_number: int) -> float:
        if not matches:
            return 0.0

        match_epas = []
        for match in matches:
            match_epa = self.calculate_match_epa(match, team_number)
            if match_epa > 0:
                match_epas.append(match_epa)

        if not match_epas:
            return 0.0

        # Calculate average EPA for the season
        # More recent matches within a season are weighted slightly higher
        weights = [1.0 + (i / len(match_epas) * 0.2) for i in range(len(match_epas))]
        weighted_sum = sum(epa * weight for epa, weight in zip(match_epas, weights))
        total_weight = sum(weights)

        return weighted_sum / total_weight if total_weight > 0 else 0.0

    def calculate_historical_epa(self, all_matches: dict, team_number) -> float:
        if not all_matches:
            return 0.0

        weighted_sum = 0.0
        total_weight = 0.0

        for season, matches in all_matches.items():
            try:
                season_year = int(season)
                if season_year in self.year_weights:
                    season_epa = self.calculate_season_epa(matches, team_number)
                    year_weight = self.year_weights[season_year]
                    
                    weighted_sum += season_epa * year_weight
                    total_weight += year_weight
            except ValueError:
                continue

        return weighted_sum / total_weight if total_weight > 0 else 0.0

    def calculate_match_win_probability(self, red_alliance: list, blue_alliance: list, team_epas: dict) -> dict:
        try:
            # Sum EPA scores for each alliance
            red_epa = sum(team_epas.get(str(team), 0.0) for team in red_alliance)
            blue_epa = sum(team_epas.get(str(team), 0.0) for team in blue_alliance)
            print(f"Red EPA: {red_epa}, Blue EPA: {blue_epa}")
            
            # Calculate EPA difference and normalize
            epa_diff = red_epa - blue_epa
            avg_epa = (red_epa + blue_epa) / 2
            normalized_diff = epa_diff / (avg_epa + 1e-6)  # Avoid division by zero
            
            # Use sigmoid function with adjusted scaling
            k = 0.5  # Scaling factor to make probabilities more reasonable
            red_win_prob = 1 / (1 + math.exp(-normalized_diff / k))
            
            # Clamp probabilities to avoid extreme values
            red_win_prob = max(0.05, min(0.95, red_win_prob))
            
            return {
                'red_win_probability': round(red_win_prob, 3),
                'blue_win_probability': round(1 - red_win_prob, 3),
                'predicted_winner': 'Red' if red_win_prob > 0.5 else 'Blue',
                'win_margin': abs(red_epa - blue_epa)
            }
        except Exception as e:
            print(f"Error calculating match win probability: {e}")
            return {
                'red_win_probability': 0.5,
                'blue_win_probability': 0.5,
                'predicted_winner': 'Tie',
                'win_margin': 0
            }
