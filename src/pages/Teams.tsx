import React, { useState, useEffect } from 'react';
import Teams from '../components/Teams';
import FTCApi from '../services/ftcapi';
import '../styles/Teams.css';

const ftcApi = new FTCApi();

const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchState, setSearchState] = useState('');
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await ftcApi.getTeams(2023, { state: searchState });
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
      onSearch={() => {}}
      page={1}
      onPageChange={(newPage: number) => {}}
    />
  );
};

export default TeamsPage;