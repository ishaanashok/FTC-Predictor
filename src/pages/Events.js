import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Paper,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FTCApi from '../services/FTCApi';

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const ftcApi = new FTCApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current date
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };

      const season = 2024;
      const response = await ftcApi.getEvents(season);
      console.log('Received events data:', response);
      setEvents(response.events || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchText(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const getStatusColor = (dateStart, dateEnd) => {
    const now = new Date();
    const start = new Date(dateStart);
    const end = new Date(dateEnd);

    if (now < start) return 'primary'; // Upcoming
    if (now > end) return 'default'; // Past
    return 'success'; // In Progress
  };

  const getStatusLabel = (dateStart, dateEnd) => {
    const now = new Date();
    const start = new Date(dateStart);
    const end = new Date(dateEnd);

    if (now < start) return 'Upcoming';
    if (now > end) return 'Past';
    return 'In Progress';
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      (event.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (event.city?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (event.state?.toLowerCase() || '').includes(searchText.toLowerCase());
    
    const status = getStatusLabel(event.dateStart, event.dateEnd).toLowerCase();
    const matchesFilter = filter === 'all' || status === filter;

    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Sort by dateStart (ascending order - earliest events first)
    return new Date(a.dateStart) - new Date(b.dateStart);
  });

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Events
          </Typography>
        </Grid>

        {/* Filters */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filter}
              onChange={handleFilterChange}
              label="Filter by Status"
            >
              <MenuItem value="all">All Events</MenuItem>
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="past">Past</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Search Bar */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search events..."
              size="small"
              value={searchText}
              onChange={handleSearch}
            />
          </Box>
        </Grid>

        {/* Error Message */}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={fetchEvents}
              sx={{ mb: 2 }}
            >
              Retry
            </Button>
          </Grid>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Grid>
        ) : (
          /* Events Grid */
          <Grid item xs={12}>
            <Grid container spacing={3}>
              {filteredEvents.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    No events found
                  </Paper>
                </Grid>
              ) : (
                filteredEvents.map((event) => (
                  <Grid item xs={12} sm={6} md={4} key={`2024-${event.code}`}>
                    <Card sx={{ height: '100%' }}>
                      <CardActionArea onClick={() => navigate(`/events/2024/${event.code}`)}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {event.name}
                          </Typography>
                          <Typography color="textSecondary" gutterBottom>
                            {new Date(event.dateStart).toLocaleDateString()} - {new Date(event.dateEnd).toLocaleDateString()}
                          </Typography>
                          <Typography gutterBottom>
                            {event.city}, {event.stateprov}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                            <Chip
                              label={getStatusLabel(event.dateStart, event.dateEnd)}
                              color={getStatusColor(event.dateStart, event.dateEnd)}
                              size="small"
                            />
                            <Typography variant="body2" color="textSecondary">
                              {event.type}
                            </Typography>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default Events;