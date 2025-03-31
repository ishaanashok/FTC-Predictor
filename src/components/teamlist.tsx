import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/components.css';

interface Team {
    teamNumber: number;
    nameShort: string;
    schoolName: string;
    city: string;
    stateProv: string;
    country: string;
}

const TeamList: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const currentYear = new Date().getFullYear();
                const response = await api.searchTeams(currentYear);
                if (response.teams) {
                    setTeams(response.teams);
                } else {
                    setTeams([]);
                }
                setLoading(false);
            } catch (err) {
                console.error('API Error:', err);
                setError('Failed to fetch teams');
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    if (loading) return <div className="loading-container">Loading teams...</div>;
    if (error) return <div className="error-container">Error: {error}</div>;
    if (teams.length === 0) return <div className="empty-container">No teams found</div>;

    return (
        <div className="team-list">
            <h2>FTC Teams</h2>
            <div className="team-grid">
                {teams.map(team => (
                    <div key={team.teamNumber} className="team-card">
                        <h3>Team {team.teamNumber}</h3>
                        <div className="team-details">
                            <p className="team-name">{team.nameShort}</p>
                            <p className="team-school">{team.schoolName}</p>
                            <p className="team-location">{team.city}, {team.stateProv}</p>
                            <p className="team-country">{team.country}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamList;