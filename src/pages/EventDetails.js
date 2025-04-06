import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Container, Paper, Grid, CircularProgress, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import FTCApi from '../services/ftcapi';

const EventDetails = () => {
  const { season, eventCode } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ftcApi = new FTCApi();

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const [details, teamsData] = await Promise.all([
          ftcApi.getEventInfo(Number(season), eventCode),
          ftcApi.getTeams(Number(season), { eventCode })
        ]);
        
        setEventDetails(details);
        // Sort teams by team number
        const sortedTeams = (teamsData.teams || []).sort((a, b) => a.teamNumber - b.teamNumber);
        setTeams(sortedTeams);
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

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  if (error) return <Container><Typography color="error">{error}</Typography></Container>;

  const event = eventDetails?.events[0];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {eventDetails?.events[0]?.name || 'Event Details'}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Event Information</Typography>
            <Typography>Date: {eventDetails?.events[0]?.dateStart}</Typography>
            <Typography>Location: {eventDetails?.events[0]?.venue}</Typography>
            <Typography>City: {eventDetails?.events[0]?.city}</Typography>
            <Typography>State: {eventDetails?.events[0]?.stateProv}</Typography>
          </Grid>
          
          {/* Teams Table */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Participating Teams</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Team Number</TableCell>
                    <TableCell>Team Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.teamNumber}>
                      <TableCell>{team.teamNumber}</TableCell>
                      <TableCell>{team.nameShort}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default EventDetails;