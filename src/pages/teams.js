import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/Teams.css';

function Teams() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchState, setSearchState] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                setLoading(true);
                const response = await api.searchTeams(2024, searchState, page, searchQuery);
                if (response.teams) {
                    setTeams(response.teams);
                } else {
                    setTeams([]);
                }
            } catch (err) {
                setError('Failed to fetch teams');
                console.error('Error fetching teams:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, [searchState, page, searchQuery]);

    return (
        <div className="teams-container">
            <div className="teams-header">
                <h2>FTC Teams</h2>
                <div className="search-filters">
                    <input
                        type="text"
                        placeholder="Enter state code (e.g., CA)"
                        value={searchState}
                        onChange={(e) => setSearchState(e.target.value.toUpperCase())}
                        className="state-filter"
                    />
                    <input
                        type="text"
                        placeholder="Search by team name or number"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-filter"
                    />
                </div>
            </div>

            {loading && <div className="loading">Loading teams...</div>}
            {error && <div className="error">{error}</div>}
            
            {!loading && !error && (
                <>
                    <div className="teams-grid">
                        {teams.map(team => (
                            <div key={team.teamNumber} className="team-card">
                                <h3>Team {team.teamNumber}</h3>
                                <p className="team-name">{team.nameShort}</p>
                                <p className="team-location">{team.city}, {team.stateProv}</p>
                                <p className="team-country">{team.country}</p>
                            </div>
                        ))}
                    </div>

                    <div className="pagination">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            Previous
                        </button>
                        <span>Page {page}</span>
                        <button 
                            onClick={() => setPage(p => p + 1)}
                            disabled={teams.length === 0 || loading}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Teams;