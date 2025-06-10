import os
import sys
import asyncio
import time
import pytest
from epa_parallel import ParallelEPAProcessor

# Add the current directory to path for importing modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

@pytest.mark.asyncio
async def test_multiple_team_epa_calculation():
    """Test that the parallel EPA processor can process multiple teams efficiently."""
    # Test with several teams
    team_numbers = [16461, 19376, 11528, 13075]  # Example team numbers
    
    # Initialize the parallel processor with high concurrency limit for test
    processor = ParallelEPAProcessor(concurrency_limit=50)
    
    # Measure time for parallel operation
    start_time = time.time()
    epa_results = await processor.calculate_multiple_team_epas(team_numbers)
    parallel_time = time.time() - start_time
    
    # Check that we got results for all teams
    assert len(epa_results) == len(team_numbers)
    
    # Verify each team has EPA data
    for result in epa_results:
        assert 'teamNumber' in result
        assert 'historicalEPA' in result
        assert result['teamNumber'] in team_numbers
    
    # Benchmark against sequential processing
    # Process teams one at a time
    start_time = time.time()
    sequential_results = []
    for team in team_numbers:
        result = await processor.calculate_team_epa(team)
        sequential_results.append(result)
    sequential_time = time.time() - start_time
    
    # Print timing statistics
    print(f"\nParallel processing time: {parallel_time:.2f} seconds")
    print(f"Sequential processing time: {sequential_time:.2f} seconds")
    print(f"Speedup factor: {sequential_time / parallel_time:.2f}x")
    
    # For a reasonable number of teams, parallel should be faster
    if len(team_numbers) > 1:
        assert parallel_time < sequential_time, "Parallel processing should be faster than sequential"


@pytest.mark.asyncio
async def test_match_prediction_parallelization():
    """Test that match predictions are processed in parallel efficiently."""
    # Create mock matches
    matches = [
        {
            'matchNumber': 1,
            'teams': [
                {'teamNumber': 16461, 'station': 'Red1'},
                {'teamNumber': 19376, 'station': 'Red2'},
                {'teamNumber': 11528, 'station': 'Blue1'},
                {'teamNumber': 13075, 'station': 'Blue2'},
            ]
        },
        {
            'matchNumber': 2,
            'teams': [
                {'teamNumber': 16461, 'station': 'Blue1'},
                {'teamNumber': 19376, 'station': 'Blue2'},
                {'teamNumber': 11528, 'station': 'Red1'},
                {'teamNumber': 13075, 'station': 'Red2'},
            ]
        }
    ]
    
    # Mock EPA data
    team_epas = {
        '16461': 100.0,
        '19376': 90.0,
        '11528': 95.0,
        '13075': 85.0
    }
    
    processor = ParallelEPAProcessor()
    
    # Test parallel execution
    start_time = time.time()
    predictions = await processor.calculate_match_predictions(matches, team_epas)
    parallel_time = time.time() - start_time
    
    # Verify predictions
    assert len(predictions) == len(matches)
    for prediction in predictions:
        assert 'matchNumber' in prediction
        assert 'prediction' in prediction
        assert 'red_win_probability' in prediction['prediction']
        assert 'blue_win_probability' in prediction['prediction']
    
    print(f"\nMatch prediction parallel processing time: {parallel_time:.2f} seconds")


if __name__ == "__main__":
    asyncio.run(test_multiple_team_epa_calculation())
    asyncio.run(test_match_prediction_parallelization())
