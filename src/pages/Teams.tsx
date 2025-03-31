import React, { useState, useEffect } from 'react';
import Teams from '../components/Teams';
import api from '../services/api';
import '../styles/Teams.css';

const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchState, setSearchState] = useState('');
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await api.searchTeams(2023, searchState);
        setTeams(response.teams || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch teams');
        console.error('Error fetching teams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [searchState]);

  if (error) return <div className="error">{error}</div>;
  if (loading && teams.length === 0) return <div className="loading">Loading teams...</div>;

  return (
    <Teams
      teams={teams}
      onStateFilter={setSearchState}
      loading={loading}
    />
  );
};

export default TeamsPage;