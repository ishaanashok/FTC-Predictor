import React from 'react';
import { Team } from '../types';

interface TeamsProps {
  teams: Team[];
  onStateFilter: (state: string) => void;
  onSearch: (query: string) => void;
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

const Teams: React.FC<TeamsProps> = ({ teams, onStateFilter, onSearch, loading, page, onPageChange }) => {
  return (
    <div className="teams-container">
      <div className="teams-header">
        <h2>FTC Teams</h2>
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search teams..."
            onChange={(e) => onSearch(e.target.value)}
            className="search-input"
          />
          <input
            type="text"
            placeholder="Enter state code (e.g., CA)"
            onChange={(e) => onStateFilter(e.target.value.toUpperCase())}
            className="state-filter"
          />
        </div>
      </div>

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
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || loading}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={teams.length === 0 || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Teams;