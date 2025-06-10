"""
Test the performance of the optimized alliance matchmaker
"""
import asyncio
import time
from alliance_matchmaker_fixed import AllianceMatchmaker
from epa_parallel import ParallelEPAProcessor
import random

# Sample data for testing
async def generate_test_data(num_teams=50):
    """Generate test data for alliance matchmaker performance testing"""
    print(f"Generating test data with {num_teams} teams")
    
    # Generate team numbers
    team_numbers = [random.randint(1000, 9999) for _ in range(num_teams)]
    
    # Generate random EPA values
    team_epas = {str(team): random.uniform(50, 150) for team in team_numbers}
    
    # Create a processor to get match data
    epa_processor = ParallelEPAProcessor(concurrency_limit=50)
    
    # Generate match data structure
    team_matches = {}
    
    # For testing purposes, we'll create simplified mock match data
    for team in team_numbers[:10]:  # Only get real data for first 10 teams to speed up testing
        try:
            result = await epa_processor.calculate_team_epa(team)
            team_matches[team] = result.get('matches', {})
        except Exception as e:
            print(f"Error getting match data for team {team}: {e}")
            team_matches[team] = {}
    
    # For the rest, create mock data
    for team in team_numbers[10:]:
        # Create mock match data with realistic structure
        team_matches[team] = {
            2024: [
                {
                    'teams': [
                        {'teamNumber': team, 'station': 'Red1'},
                        {'teamNumber': random.choice(team_numbers), 'station': 'Red2'},
                        {'teamNumber': random.choice(team_numbers), 'station': 'Blue1'},
                        {'teamNumber': random.choice(team_numbers), 'station': 'Blue2'},
                    ],
                    'scoreRedFinal': random.randint(50, 200),
                    'scoreBlueFinal': random.randint(50, 200),
                    'scoreRedAuto': random.randint(10, 50),
                    'scoreBlueAuto': random.randint(10, 50),
                    'scoreRedTeleop': random.randint(30, 100),
                    'scoreBlueTeleop': random.randint(30, 100),
                    'scoreRedEnd': random.randint(10, 50),
                    'scoreBlueEnd': random.randint(10, 50),
                } for _ in range(5)  # 5 matches per team
            ],
            2023: [
                {
                    'teams': [
                        {'teamNumber': team, 'station': 'Red1'},
                        {'teamNumber': random.choice(team_numbers), 'station': 'Red2'},
                        {'teamNumber': random.choice(team_numbers), 'station': 'Blue1'},
                        {'teamNumber': random.choice(team_numbers), 'station': 'Blue2'},
                    ],
                    'scoreRedFinal': random.randint(50, 200),
                    'scoreBlueFinal': random.randint(50, 200),
                    'scoreRedAuto': random.randint(10, 50),
                    'scoreBlueAuto': random.randint(10, 50),
                    'scoreRedTeleop': random.randint(30, 100),
                    'scoreBlueTeleop': random.randint(30, 100),
                    'scoreRedEnd': random.randint(10, 50),
                    'scoreBlueEnd': random.randint(10, 50),
                } for _ in range(3)  # 3 matches per team from previous season
            ]
        }
    
    return team_numbers, team_epas, team_matches

async def test_alliance_matchmaker_performance():
    """Test the performance of the optimized alliance matchmaker"""
    # Generate test data
    team_numbers, team_epas, team_matches = await generate_test_data(50)
    
    # Create an instance of the matchmaker
    matchmaker = AllianceMatchmaker()
    
    # Test batch processing with different numbers of teams
    test_sizes = [1, 5, 10, 20]
    
    print("\nAlliance Matchmaker Performance Test")
    print("===================================")
    
    for size in test_sizes:
        # Select a subset of teams for testing
        test_teams = team_numbers[:size]
        
        # Measure performance
        start_time = time.time()
        # Run find_best_alliance_partners for each team and aggregate results
        async def run_for_team(team):
            return await matchmaker.find_best_alliance_partners(
                team, team_numbers, team_epas, team_matches
            )
        tasks = [run_for_team(team) for team in test_teams]
        results = await asyncio.gather(*tasks)
        result = {
            "averageTimePerTeam": (time.time() - start_time) / size,
            "concurrencyUsed": "manual",
            "results": results
        }
        end_time = time.time()
        
        # Print results
        print(f"\nProcessing {size} teams took {end_time - start_time:.2f} seconds")
        print(f"Average time per team: {result.get('averageTimePerTeam', 0):.2f} seconds")
        print(f"Concurrency used: {result.get('concurrencyUsed', 'N/A')}")
    
    print("\nTest completed!")

if __name__ == "__main__":
    asyncio.run(test_alliance_matchmaker_performance())
