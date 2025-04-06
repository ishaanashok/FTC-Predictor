import asyncio
import logging
from epa_calculator import EPACalculator

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_team_epa():
    calculator = EPACalculator()
    team_number = 5773

    try:
        logger.debug(f"Starting EPA calculation for team {team_number}")
        matches = await calculator.get_team_matches(team_number)
        logger.debug(f"Retrieved matches for all seasons")

        for season, season_matches in matches.items():
            logger.debug(f"\n{'='*50}")
            logger.debug(f"Processing Season {season}")
            logger.debug(f"Found {len(season_matches)} matches")
            
            if season_matches:
                season_epa = calculator.calculate_season_epa(season_matches, team_number)
                logger.debug(f"Season EPA calculated: {season_epa:.2f}")

                for match in season_matches:
                    logger.debug(f"\nMatch Details:")
                    logger.debug(f"Event: {match.get('eventName')}")
                    logger.debug(f"Match: {match.get('description')}")
                    logger.debug(f"Tournament Level: {match.get('tournamentLevel')}")
                    logger.debug(f"Red Score: {match.get('scoreRedFinal')}")
                    logger.debug(f"Blue Score: {match.get('scoreBlueFinal')}")
                    
                    # Calculate and log individual match EPA
                    match_epa = calculator.calculate_match_epa(match, team_number)
                    logger.debug(f"Match EPA: {match_epa:.2f}")

        historical_epa = calculator.calculate_historical_epa(matches, team_number)
        logger.debug(f"\nFinal Historical EPA for team {team_number}: {historical_epa:.2f}")

    except Exception as e:
        logger.error(f"Error during testing: {str(e)}", exc_info=True)

if __name__ == "__main__":
    asyncio.run(test_team_epa())