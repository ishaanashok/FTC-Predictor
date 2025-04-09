import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Typography, 
  Container, 
  Paper, 
  Grid, 
  CircularProgress, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Tabs,
  Tab,
  TableSortLabel
} from '@mui/material';
import FTCApi from '../services/ftcapi';

const EventDetails = () => {
  const { season, eventCode } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [teamEPAs, setTeamEPAs] = useState({});
  const ftcApi = new FTCApi();

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const [details, teamsData, matchesData] = await Promise.all([
          ftcApi.getEventInfo(Number(season), eventCode),
          ftcApi.getTeams(Number(season), { eventCode }),
          ftcApi.getEventMatches(Number(season), eventCode)
        ]);
        
        setEventDetails(details);
        const sortedTeams = (teamsData.teams || []).sort((a, b) => a.teamNumber - b.teamNumber);
        setTeams(sortedTeams);
        setMatches(matchesData.matches || []);
      } catch (err) {
        setError('Failed to fetch event details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (season && eventCode) {
      fetchEventData();
    }
  }, [season, eventCode]);

  const sortedMatches = React.useMemo(() => {
    return [...matches].sort((a, b) => {
      const matchNumA = parseInt(a.matchNumber);
      const matchNumB = parseInt(b.matchNumber);
      return matchNumA - matchNumB;
    });
  }, [matches]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  if (error) return <Container><Typography color="error">{error}</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {eventDetails?.events[0]?.name || 'Event Details'}
        </Typography>

        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="Event Details" />
          <Tab label="Matches" />
        </Tabs>

        {activeTab === 0 ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Event Information</Typography>
              <Typography>Date: {eventDetails?.events[0]?.dateStart}</Typography>
              <Typography>Location: {eventDetails?.events[0]?.venue}</Typography>
              <Typography>City: {eventDetails?.events[0]?.city}</Typography>
              <Typography>State: {eventDetails?.events[0]?.stateProv}</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Participating Teams</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Team Number</TableCell>
                      <TableCell>Team Name</TableCell>
                      <TableCell>Organization</TableCell>
                      <TableCell>Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teams.map((team) => (
                      <TableRow key={team.teamNumber} hover>
                        <TableCell>{team.teamNumber}</TableCell>
                        <TableCell>{team.nameShort || team.nameFull}</TableCell>
                        <TableCell>{team.schoolName}</TableCell>
                        <TableCell>{`${team.city}, ${team.stateProv}`}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Match</TableCell>
                  <TableCell>Red Alliance</TableCell>
                  <TableCell>Blue Alliance</TableCell>
                  <TableCell align="right">Red Score</TableCell>
                  <TableCell align="right">Blue Score</TableCell>
                  <TableCell>Winner</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedMatches.map((match) => {
                  const redWon = match.scoreRedFinal > match.scoreBlueFinal;
                  const blueWon = match.scoreBlueFinal > match.scoreRedFinal;
                  
                  return (
                    <TableRow key={match.matchNumber}>
                      <TableCell>{match.description || `Match ${match.matchNumber}`}</TableCell>
                      <TableCell>
                        {match.teams
                          .filter(team => team.station.includes('Red'))
                          .map(team => team.teamNumber)
                          .join(', ')}
                      </TableCell>
                      <TableCell>
                        {match.teams
                          .filter(team => team.station.includes('Blue'))
                          .map(team => team.teamNumber)
                          .join(', ')}
                      </TableCell>
                      <TableCell align="right" sx={{ color: redWon ? 'success.main' : 'inherit' }}>
                        {match.scoreRedFinal}
                      </TableCell>
                      <TableCell align="right" sx={{ color: blueWon ? 'success.main' : 'inherit' }}>
                        {match.scoreBlueFinal}
                      </TableCell>
                      <TableCell>
                        {redWon ? 'Red' : blueWon ? 'Blue' : 'Tie'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default EventDetails;