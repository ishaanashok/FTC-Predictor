import React from 'react';
import { Table } from 'antd';

const EventMatches = ({ matches }) => {
    const styles = {
        redTeam: {
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            padding: '4px 8px',
            borderRadius: '12px',
            display: 'inline-block',
            margin: '0 2px'
        },
        blueTeam: {
            backgroundColor: 'rgba(0, 0, 255, 0.1)',
            padding: '4px 8px',
            borderRadius: '12px',
            display: 'inline-block',
            margin: '0 2px'
        }
    };

    const renderTeamNumber = (teamNumber, alliance) => (
        <span key={teamNumber} style={alliance === 'red' ? styles.redTeam : styles.blueTeam}>
            {teamNumber}
        </span>
    );

    const columns = [
        {
            title: 'Match',
            dataIndex: 'matchNumber',
            key: 'matchNumber',
        },
        {
            title: 'Red Alliance',
            dataIndex: 'redTeams',
            key: 'redTeams',
            render: (teams) => teams.map(team => renderTeamNumber(team, 'red'))
        },
        {
            title: 'Blue Alliance',
            dataIndex: 'blueTeams',
            key: 'blueTeams',
            render: (teams) => teams.map(team => renderTeamNumber(team, 'blue'))
        },
        // ... other columns
    ];

    return (
        <Table 
            dataSource={matches} 
            columns={columns} 
            rowKey="matchNumber"
        />
    );
};

export default EventMatches;