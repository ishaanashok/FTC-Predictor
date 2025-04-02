import React, { useState, useEffect } from 'react';
import FTCApi from '../services/FTCApi';
import '../styles/Teams.css';
import { Button } from '@mui/material';

const ftcApi = new FTCApi();

function Teams() {
    const [teams, setTeams] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [teamNumber, setTeamNumber] = useState('');
    const [teamName, setTeamName] = useState('');
    const [page, setPage] = useState(1);
    const [allTeams, setAllTeams] = useState([]);

    const fetchTeams = async (searchParams = {}) => {
        try {
            setLoading(true);
            if (searchParams.teamNumber) {
                const params = { page, ...searchParams };
                const response = await ftcApi.getTeams(2024, params);
                setTeams(response.teams || []);
                setFilteredTeams(response.teams || []);
            } else if (searchParams.search) {
                const response = await ftcApi.getTeams(2024, {});
                const allTeamsData = response.teams || [];
                setAllTeams(allTeamsData);
                const filtered = allTeamsData.filter(team =>
                    team.nameShort.toLowerCase().includes(searchParams.search.toLowerCase())
                );
                setFilteredTeams(filtered);
                setTeams(filtered);
            } else {
                const params = { page };
                const response = await ftcApi.getTeams(2024, params);
                setTeams(response.teams || []);
                setFilteredTeams(response.teams || []);
            }
        } catch (err) {
            setError('Failed to fetch teams');
            console.error('Error fetching teams:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, [page]);

    const handleSearch = () => {
        const searchParams = {};
        if (teamNumber) {
            searchParams.teamNumber = teamNumber;
        } else if (teamName) {
            searchParams.search = teamName;
        }
        fetchTeams(searchParams);
    };



    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && (teamNumber || teamName)) {
            handleSearch();
        }
    };

    return (
        <div className="teams-container">
            <div className="teams-header">
                <h2>FTC Teams</h2>
                <div className="search-filters">
                    <div className="search-bar">
                        <input
                            type="number"
                            placeholder="Search by team number"
                            value={teamNumber}
                            onChange={(e) => {
                                setTeamNumber(e.target.value);
                                setTeamName('');
                            }}
                            onKeyPress={handleKeyPress}
                            className="search-filter"
                        />
                        <input
                            type="text"
                            placeholder="Search by team name"
                            value={teamName}
                            onChange={(e) => {
                                setTeamName(e.target.value);
                                setTeamNumber('');
                            }}
                            onKeyPress={handleKeyPress}
                            className="search-filter"
                        />
                        <Button
                            variant="contained"
                            onClick={handleSearch}
                            disabled={!teamNumber && !teamName}
                            className="search-button"
                        >
                            Search
                        </Button>
                    </div>
                </div>
            </div>

            {loading && <div className="loading">Loading teams...</div>}
            {error && <div className="error">{error}</div>}
            
            {!loading && !error && (
                <>
                    <div className="teams-grid">
                        {filteredTeams.map(team => (
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