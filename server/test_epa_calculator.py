import pytest
import asyncio
from unittest.mock import patch, MagicMock
from epa_calculator import EPACalculator

@pytest.fixture
def calculator():
    return EPACalculator()

@pytest.mark.asyncio
async def test_get_team_matches_success(calculator):
    # Mock successful API responses
    mock_events_response = {
        "events": [
            {
                "code": "TEST_EVENT_1",
                "name": "Test Event 1",
                "startDate": "2024-01-01"
            }
        ]
    }
    
    mock_matches_response = {
        "matches": [
            {
                "matchNumber": 1,
                "tournamentLevel": "QUALIFICATION",
                "teams": [
                    {"teamNumber": 12345, "station": "Red1"},
                    {"teamNumber": 67890, "station": "Blue1"}
                ],
                "scoreRedFinal": 100,
                "scoreBlueFinal": 90
            }
        ]
    }

    with patch('epa_calculator.ftc_api_request') as mock_api:
        mock_api.side_effect = [
            mock_events_response,  # First call for events
            mock_matches_response  # Second call for matches
        ]
        
        result = await calculator.get_team_matches(12345)
        
        assert isinstance(result, dict)
        assert 2024 in result
        assert len(result[2024]) == 1
        assert result[2024][0]['matchNumber'] == 1
        assert result[2024][0]['eventCode'] == 'TEST_EVENT_1'
        assert result[2024][0]['eventName'] == 'Test Event 1'

@pytest.mark.asyncio
async def test_get_team_matches_with_start_date(calculator):
    mock_events_response = {
        "events": [
            {
                "code": "FUTURE_EVENT",
                "name": "Future Event",
                "startDate": "2024-12-01"
            },
            {
                "code": "PAST_EVENT",
                "name": "Past Event",
                "startDate": "2024-01-01"
            }
        ]
    }

    with patch('epa_calculator.ftc_api_request') as mock_api:
        mock_api.side_effect = [mock_events_response]
        
        result = await calculator.get_team_matches(12345, start_date="2024-06-01")
        
        assert isinstance(result, dict)
        # Should only include events before start_date
        mock_api.assert_called_once()

@pytest.mark.asyncio
async def test_get_team_matches_empty_response(calculator):
    mock_empty_response = {"events": []}

    with patch('epa_calculator.ftc_api_request') as mock_api:
        mock_api.return_value = mock_empty_response
        
        result = await calculator.get_team_matches(12345)
        
        assert isinstance(result, dict)
        assert len(result) == 0

@pytest.mark.asyncio
async def test_get_team_matches_api_error(calculator):
    with patch('epa_calculator.ftc_api_request') as mock_api:
        mock_api.side_effect = Exception("API Error")
        
        result = await calculator.get_team_matches(12345)
        
        assert isinstance(result, dict)
        assert len(result) == 0

@pytest.mark.asyncio
async def test_get_team_matches_invalid_event_data(calculator):
    mock_invalid_event = {
        "events": [
            {"name": "Invalid Event"}  # Missing code and startDate
        ]
    }

    with patch('epa_calculator.ftc_api_request') as mock_api:
        mock_api.return_value = mock_invalid_event
        
        result = await calculator.get_team_matches(12345)
        
        assert isinstance(result, dict)
        assert len(result) == 0  # Should skip invalid event