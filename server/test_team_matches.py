import asyncio
from epa_calculator import EPACalculator

async def main():
    try:
        # Create an instance of EPACalculator
        calculator = EPACalculator()
        
        # Example team number (FTC Team 12345)
        team_number = 5773
        
        print(f"Fetching matches for team {team_number}...")
        
        # Call get_team_matches with the team number
        matches = await calculator.get_team_matches(team_number, start_date="2024-01-01T000")
        
        # Process and display results
        print("\nResults:")
        for season, season_matches in matches.items():
            print(f"\nSeason {season}: {len(season_matches)} matches found")
            for match in season_matches:
                print(f"  - Match {match['matchNumber']} at {match['eventName']} (Event Code: {match['eventCode']})")
                print(f"    Red Score: {match['scoreRedFinal']}, Blue Score: {match['scoreBlueFinal']}")
    
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())