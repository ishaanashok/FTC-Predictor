import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
} from '@mui/material';
import api from '../services/api';

function Events() {
  const [events, setEvents] = useState([]);
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
      
      // Get date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Format dates as YYYY-MM-DD
      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };

      const params = {
        season: 2024,
        limit: 100,
        startDate: formatDate(thirtyDaysAgo),
        endDate: formatDate(now),
        hasMatches: true
      };

      console.log('Fetching events with params:', params);
      const data = await api.searchEvents(params);
      console.log('Received events data:', data);
      setEvents(data);
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
          /* Events Table */
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Event Name</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Season</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No events found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map((event) => (
                      <TableRow key={`${event.season}-${event.code}`}>
                        <TableCell>{event.name}</TableCell>
                        <TableCell>
                          {new Date(event.dateStart).toLocaleDateString()} - {new Date(event.dateEnd).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{event.city}, {event.stateprov}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(event.dateStart, event.dateEnd)}
                            color={getStatusColor(event.dateStart, event.dateEnd)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{event.type}</TableCell>
                        <TableCell>{event.season}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default Events;