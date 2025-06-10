# ...existing code from alliance_matchmaker_fixed.py...
import numpy as np
from typing import Dict, List, Any, Optional, Union, Tuple
import asyncio
from fastapi import HTTPException
from epa_calculator import EPACalculator
from epa_parallel import ParallelEPAProcessor

class AllianceMatchmaker:
    def __init__(self):
        pass

    async def calculate_compatibility_score(self, team1_number: int, team2_number: int, 
                                   team1_matches: Dict[int, List], team2_matches: Dict[int, List],
                                   team_epas: Dict[str, float]) -> Dict[str, Any]:
        try:
            team1_str = str(team1_number)
            team2_str = str(team2_number)
            team1_epa = team_epas.get(team1_str, 0.0)
            team2_epa = team_epas.get(team2_str, 0.0)
            combined_epa = team1_epa + team2_epa
            team1_stats, team2_stats = await asyncio.gather(
                asyncio.to_thread(self._calculate_team_stats, team1_matches, team1_number),
                asyncio.to_thread(self._calculate_team_stats, team2_matches, team2_number)
            )
            auto_max = max(team1_stats['auto'], team2_stats['auto'])
            teleop_max = max(team1_stats['teleop'], team2_stats['teleop']) 
            endgame_max = max(team1_stats['endgame'], team2_stats['endgame'])
            auto_complement = min(team1_stats['auto'], team2_stats['auto']) / auto_max if auto_max > 0 else 0
            teleop_complement = min(team1_stats['teleop'], team2_stats['teleop']) / teleop_max if teleop_max > 0 else 0
            endgame_complement = min(team1_stats['endgame'], team2_stats['endgame']) / endgame_max if endgame_max > 0 else 0
            if team1_stats['auto'] < team1_stats['teleop'] and team2_stats['auto'] > team2_stats['teleop']:
                auto_complement += 0.2
            elif team2_stats['auto'] < team2_stats['teleop'] and team1_stats['auto'] > team1_stats['teleop']:
                auto_complement += 0.2
            if team1_stats['endgame'] < team1_stats['teleop'] and team2_stats['endgame'] > team2_stats['teleop']:
                endgame_complement += 0.2
            elif team2_stats['endgame'] < team2_stats['teleop'] and team1_stats['endgame'] > team1_stats['teleop']:
                endgame_complement += 0.2
            normalized_epa = combined_epa / 200
            compatibility_score = (
                0.6 * normalized_epa +
                0.15 * auto_complement +
                0.15 * teleop_complement + 
                0.10 * endgame_complement
            )
            return {
                "teamNumber1": team1_number,
                "teamNumber2": team2_number,
                "compatibilityScore": round(float(compatibility_score), 3),
                "combinedEPA": round(float(combined_epa), 1),
                "team1Stats": team1_stats,
                "team2Stats": team2_stats
            }
        except Exception as e:
            print(f"Error calculating compatibility score: {str(e)}")
            combined_epa_safe = 0.0
            try:
                combined_epa_safe = float(combined_epa)
            except Exception:
                combined_epa_safe = 0.0
            return {
                "teamNumber1": team1_number,
                "teamNumber2": team2_number,
                "compatibilityScore": 0,
                "combinedEPA": combined_epa_safe,
                "team1Stats": {"auto": 0, "teleop": 0, "endgame": 0},
                "team2Stats": {"auto": 0, "teleop": 0, "endgame": 0},
                "error": str(e)
            }

    def _calculate_team_stats(self, matches: Dict[int, List], team_number: int) -> Dict[str, float]:
        total_matches = 0
        auto_score = 0
        teleop_score = 0
        endgame_score = 0
        # Only use current and previous season
        recent_seasons = [2024, 2023]  # Update these numbers as seasons progress
        season_weights = {2024: 1.0, 2023: 0.7}
        for season in recent_seasons:
            season_matches = matches.get(season, [])
            if not season_matches:
                continue
            for match in season_matches:
                team_data = next((t for t in match.get('teams', []) if str(t.get('teamNumber')) == str(team_number)), None)
                if not team_data:
                    continue
                alliance = 'Red' if 'Red' in team_data.get('station', '') else 'Blue'
                alliance_prefix = 'scoreRed' if alliance == 'Red' else 'scoreBlue'
                auto_component = match.get(f'{alliance_prefix}Auto', 0)
                teleop_component = match.get(f'{alliance_prefix}Teleop', 0)
                endgame_component = match.get(f'{alliance_prefix}End', 0)
                if auto_component == 0 and teleop_component == 0 and endgame_component == 0:
                    total_score = match.get(f'{alliance_prefix}Final', 0)
                    auto_component = total_score * 0.3
                    teleop_component = total_score * 0.5
                    endgame_component = total_score * 0.2
                alliance_teams = len([t for t in match.get('teams', []) if (('Red' in t.get('station', '')) == (alliance == 'Red'))])
                if alliance_teams > 0:
                    auto_score += (auto_component / alliance_teams) * season_weights.get(season, 0.5)
                    teleop_score += (teleop_component / alliance_teams) * season_weights.get(season, 0.5)
                    endgame_score += (endgame_component / alliance_teams) * season_weights.get(season, 0.5)
                    total_matches += season_weights.get(season, 0.5)
        if total_matches > 0:
            return {
                "auto": round(auto_score / total_matches, 1),
                "teleop": round(teleop_score / total_matches, 1),
                "endgame": round(endgame_score / total_matches, 1)
            }
        else:
            return {"auto": 0, "teleop": 0, "endgame": 0}

    async def find_best_alliance_partner(self, team_number: int, event_teams: List[int], 
                                    team_epas: Dict[str, float], 
                                    team_matches: Dict[int, Dict[int, List]]) -> Dict[str, Any]:
        try:
            compatibility_scores = []
            for other_team in event_teams:
                if other_team == team_number:
                    continue
                compatibility = await self.calculate_compatibility_score(
                    team_number, 
                    other_team,
                    team_matches.get(team_number, {}),
                    team_matches.get(other_team, {}),
                    team_epas
                )
                compatibility_scores.append(compatibility)
            compatibility_scores.sort(key=lambda x: x['compatibilityScore'], reverse=True)
            top_matches = compatibility_scores[:3]
            return {
                "teamNumber": team_number,
                "bestMatches": top_matches
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error finding alliance partner: {str(e)}")

    async def find_best_alliance_partners(self, team: int, team_numbers: List[int], 
                                        team_epas: Dict[str, float], 
                                        team_matches: Dict[int, Dict[int, List]]) -> Dict[str, Any]:
        try:
            result = await self.find_best_alliance_partner(team, team_numbers, team_epas, team_matches)
            return result
        except Exception as e:
            print(f"Error finding alliance partners for team {team}: {str(e)}")
            return {
                "teamNumber": team,
                "bestMatches": [],
                "error": str(e)
            }
