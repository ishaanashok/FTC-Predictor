import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Container, Paper, Grid, CircularProgress, Box } from '@mui/material';
import FTCApi from '../services/FTCApi';

function EventDetails() {
  const { season, eventCode } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = new FTCApi();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const details = await api.getEventInfo(Number(season), eventCode || '');
        const rankings = await api.getEventRankings(Number(season), eventCode || '');
        setEventDetails({ ...details, rankings });
      } catch (err) {
        setError('Failed to fetch event details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (season && eventCode) {
      fetchEventDetails();
    }
  }, [season, eventCode]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  if (error) return <Container><Typography color="error">{error}</Typography></Container>;

  const event = eventDetails?.events[0];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>{event?.name || 'Event Details'}</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Event Information</Typography>
            <Typography>Date: {event?.dateStart}</Typography>
            <Typography>Location: {event?.venue}</Typography>
            <Typography>City: {event?.city}</Typography>
            <Typography>State: {event?.stateProv}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Top 5 Rankings</Typography>
            {eventDetails?.rankings?.rankings?.slice(0, 5).map((rank, index) => (
              <Typography key={index}>
                #{rank.rank} - Team {rank.teamNumber} (Score: {rank.totalPoints})
              </Typography>
            ))}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default EventDetails;