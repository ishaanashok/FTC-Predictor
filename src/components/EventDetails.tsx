import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FTCApi from '../services/ftcapi';

const ftcApi = new FTCApi();
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

const EventDetails: React.FC = () => {
    const { eventCode } = useParams<{ eventCode: string }>();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [rankings, setRankings] = useState<TeamRanking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const currentYear = new Date().getFullYear();
                const [eventResponse, rankingsResponse] = await Promise.all([
                    ftcApi.getEventInfo(currentYear, eventCode),
                    ftcApi.getEventRankings(currentYear, eventCode)
                ]);

                if (eventResponse.events && eventResponse.events[0]) {
                    setEvent(eventResponse.events[0]);
                }
                if (rankingsResponse.rankings) {
                    setRankings(rankingsResponse.rankings);
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