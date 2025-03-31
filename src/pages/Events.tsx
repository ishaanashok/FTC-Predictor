import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, CardActionArea } from '@mui/material';
import FTCApi from '../services/FTCApi';

const Events: React.FC = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const api = new FTCApi();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.getEvents(2023);
        setEvents(data.events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (eventCode: string) => {
    navigate(`/events/2023/${eventCode}`);
  };

  return (
    <Grid container spacing={3} sx={{ p: 3 }}>
      {events.map((event: any) => (
        <Grid item xs={12} sm={6} md={4} key={event.code}>
          <Card>
            <CardActionArea onClick={() => handleEventClick(event.code)}>
              <CardContent>
                <Typography variant="h6">{event.name}</Typography>
                <Typography color="textSecondary">
                  {event.dateStart} - {event.dateEnd}
                </Typography>
                <Typography>{event.venue}</Typography>
                <Typography>{event.city}, {event.stateProv}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Events;