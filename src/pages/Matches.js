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
} from '@mui/material';
import FTCApi from '../services/FTCApi';

const ftcApi = new FTCApi();

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchMatches();
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ftcApi.getEvents(null);
      setEvents(data);
      if (data.length > 0) {
        setSelectedEvent(`${data[0].season}-${data[0].code}`);
      }
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    if (!selectedEvent) return;

    try {
      setLoading(true);
      setError(null);
      const [season, code] = selectedEvent.split('-');
      const data = await api.getEventMatches(season, code);
      setMatches(data);
    } catch (err) {
      setError('Failed to fetch matches. Please try again later.');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (event) => {
    setSelectedEvent(event.target.value);
  };

  const handleSearch = (event) => {
    setSearchText(event.target.value);
  };

  const filteredMatches = matches.filter(match =>
    match.redAlliance.some(team => team.toLowerCase().includes(searchText.toLowerCase())) ||
    match.blueAlliance.some(team => team.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Matches
          </Typography>
        </Grid>

        {/* Event Selector */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Event</InputLabel>
            <Select
              value={selectedEvent}
              onChange={handleEventChange}
              label="Select Event"
            >
              {events.map((event) => (
                <MenuItem key={`${event.season}-${event.code}`} value={`${event.season}-${event.code}`}>
                  {event.name} ({event.season})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Search Bar */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search teams..."
              size="small"
              value={searchText}
              onChange={handleSearch}
            />
          </Box>
        </Grid>

        {/* Error Message */}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Grid>
        ) : (
          /* Matches Table */
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Match Number</TableCell>
                    <TableCell>Red Alliance</TableCell>
                    <TableCell>Blue Alliance</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Winner</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMatches.map((match) => (
                    <TableRow key={match.number}>
                      <TableCell>{match.number}</TableCell>
                      <TableCell>{match.redAlliance.join(' & ')}</TableCell>
                      <TableCell>{match.blueAlliance.join(' & ')}</TableCell>
                      <TableCell>{match.scores?.red}-{match.scores?.blue}</TableCell>
                      <TableCell>
                        <Chip
                          label={match.winner}
                          color={
                            match.winner === 'RED'
                              ? 'error'
                              : match.winner === 'BLUE'
                              ? 'primary'
                              : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default Matches;