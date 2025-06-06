import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, useTheme } from '@mui/material';
import FTCApi from '../services/ftcapi';
import '../styles/components.css';

interface EventDetail {
    code: string;
    name: string;
    type: string;
    venue: string;
    city: string;
    stateProv: string;
    country: string;
    dateStart: string;
    dateEnd: string;
}

interface TeamRanking {
    rank: number;
    teamNumber: number;
    wins: number;
    losses: number;
    ties: number;
    qualifyingPoints: number;
    rankingPoints: number;
}

interface Prediction {
    predicted_winner: string;
    red_win_probability: number;
    blue_win_probability: number;
    winner_color: string;
    win_margin: number;
}

const EventDetails: React.FC = () => {
    const theme = useTheme();
    const { eventCode } = useParams<{ eventCode: string }>();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [rankings, setRankings] = useState<TeamRanking[]>([]);
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const ftcApi = new FTCApi();

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const currentYear = new Date().getFullYear();
                const [eventResponse, rankingsResponse, predictionResponse] = await Promise.all([
                    ftcApi.getEventInfo(currentYear, eventCode),
                    ftcApi.getEventRankings(currentYear, eventCode),
                    ftcApi.getPrediction(currentYear, eventCode)
                ]);

                if (eventResponse.events && eventResponse.events[0]) {
                    setEvent(eventResponse.events[0]);
                }
                if (rankingsResponse.rankings) {
                    setRankings(rankingsResponse.rankings);
                }
                if (predictionResponse) {
                    setPrediction(predictionResponse);
                }
                setLoading(false);
            } catch (err) {
                console.error('API Error:', err);
                setError('Failed to fetch event details');
                setLoading(false);
            }
        };

        if (eventCode) {
            fetchEventDetails();
        }
    }, [eventCode]);

    if (loading) return <div className="loading-container">Loading event details...</div>;
    if (error) return <div className="error-container">Error: {error}</div>;
    if (!event) return <div className="empty-container">Event not found</div>;

    return (
        <div className="event-details">
            <h2>{event.name}</h2>
            <div className="event-info">
                <p>{event.venue}</p>
                <p>{event.city}, {event.stateProv}</p>
                <p>{event.country}</p>
                <p>Date: {new Date(event.dateStart).toLocaleDateString()} - {new Date(event.dateEnd).toLocaleDateString()}</p>
            </div>

            {prediction && (
                <Box sx={{
                    backgroundColor: prediction.predicted_winner === 'Red' 
                        ? theme.palette.error.light  // Light red from theme
                        : theme.palette.info.light,  // Light blue from theme
                    padding: 2,
                    borderRadius: theme.shape.borderRadius,
                    marginY: 2,
                    border: `1px solid ${prediction.predicted_winner === 'Red' 
                        ? theme.palette.error.main 
                        : theme.palette.info.main}`,
                }}>
                    <Typography variant="h6" color={prediction.predicted_winner === 'Red' 
                        ? theme.palette.error.dark 
                        : theme.palette.info.dark
                    }>
                        Predicted Winner: {prediction.predicted_winner}
                    </Typography>
                    <Typography color="text.secondary">
                        Win Probability: {
                            prediction.predicted_winner === 'Red'
                                ? `${(prediction.red_win_probability * 100).toFixed(1)}%`
                                : `${(prediction.blue_win_probability * 100).toFixed(1)}%`
                        }
                    </Typography>
                </Box>
            )}

            <h3>Rankings</h3>
            <div className="rankings-table">
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Team</th>
                            <th>W-L-T</th>
                            <th>QP</th>
                            <th>RP</th>

                        </tr>
                    </thead>
                    <tbody>
                        {rankings.map(ranking => (
                            <tr key={ranking.teamNumber}>
                                <td>{ranking.rank}</td>
                                <td>{ranking.teamNumber}</td>
                                <td>{`${ranking.wins}-${ranking.losses}-${ranking.ties}`}</td>
                                <td>{ranking.qualifyingPoints}</td>
                                <td>{ranking.rankingPoints}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EventDetails;