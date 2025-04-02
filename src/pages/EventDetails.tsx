import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Container, Paper, Grid, CircularProgress, Box } from '@mui/material';
import FTCApi from '../services/FTCApi';

const EventDetails: React.FC = () => {
  const { season, eventCode } = useParams();
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = new FTCApi();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const seasonNumber = season ? parseInt(season) : new Date().getFullYear();
        if (isNaN(seasonNumber)) {
          throw new Error('Invalid season number');
        }
        const details = await api.getEventInfo(seasonNumber, eventCode || '');
        const rankings = await api.getEventRankings(seasonNumber, eventCode || '');
        setEventDetails({ ...details, rankings });
      } catch (err) {
        setError('Failed to fetch event details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (eventCode) {
      fetchEventDetails();
    }
  }, [season, eventCode]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

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
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Rankings</Typography>
            {eventDetails?.rankings?.rankings?.slice(0, 5).map((rank: any, index: number) => (
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