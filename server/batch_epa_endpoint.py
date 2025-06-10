from fastapi import HTTPException
import time
from epa_parallel import ParallelEPAProcessor

# This function should be imported into main.py
async def process_batch_historical_epa(data: dict):
    """
    Process multiple team EPAs in a single batch request.
    
    Expects a JSON with the following structure:
    {
        "teamNumbers": [team1, team2, team3, ...]
    }
    
    Returns a dictionary mapping team numbers to their EPA values.
    """
    try:
        team_numbers = data.get('teamNumbers', [])
        if not team_numbers:
            raise HTTPException(status_code=400, detail="No team numbers provided")
        
        print(f"Processing batch EPA request for {len(team_numbers)} teams")
        
        # Use our parallel processor to efficiently calculate all team EPAs
        epa_processor = ParallelEPAProcessor(concurrency_limit=50)
        
        start_time = time.time()
        epa_results = await epa_processor.calculate_multiple_team_epas(team_numbers)
        total_time = time.time() - start_time
        print(f"Completed batch EPA calculations for {len(team_numbers)} teams in {total_time:.2f} seconds")
        
        # Create EPA mapping
        team_epas = epa_processor.get_epa_mapping(epa_results)
    except Exception as e:
        print(f"Error in batch EPA calculation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
