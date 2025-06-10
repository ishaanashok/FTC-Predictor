import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import Confetti from 'react-confetti';
import FTCApi from '../services/ftcapi';

// Add method to FTCApi to handle batch processing
FTCApi.prototype.getBestAlliancePartnersBatch = async function(season, eventCode, teamNumbers) {
  try {
    const response = await fetch(`${this.apiBaseUrl}/api/alliance-matchmaker/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        season,
        eventCode,
        teamNumbers
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in batch alliance matchmaker request:', error);
    throw error;
  }
};

const AllianceMatchmaker = ({ season, eventCode, teams, teamEPAs }) => {
  const [teamNumber, setTeamNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [mode, setMode] = useState('single'); // 'single' or 'batch'
  const [activeResultTab, setActiveResultTab] = useState(0);
  
  const ftcApi = new FTCApi();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'single') {
      if (!teamNumber) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Check if the team is part of the event
        const isTeamInEvent = teams.some(team => team.teamNumber === parseInt(teamNumber));
        if (!isTeamInEvent) {
          setError(`Team ${teamNumber} is not participating in this event.`);
          setLoading(false);
          return;
        }
        
        const matchResult = await ftcApi.getBestAlliancePartner(
          season, 
          eventCode, 
          parseInt(teamNumber)
        );
        
        setResult(matchResult);
        setOpenDialog(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } catch (err) {
        setError(err.message || 'Failed to find alliance partners');
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      // Batch mode
      if (selectedTeams.length === 0) {
        setError("Please select at least one team for batch processing");
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const batchResult = await ftcApi.getBestAlliancePartnersBatch(
          season,
          eventCode,
          selectedTeams.map(t => parseInt(t))
        );
        
        setBatchResults(batchResult);
        setOpenDialog(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } catch (err) {
        setError(err.message || 'Failed to process batch alliance partners');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleTeamSelect = (event) => {
    setSelectedTeams(event.target.value);
  };
  
  const handleModeChange = (event, newMode) => {
    setMode(newMode);
    setError(null); // Clear any previous errors
  };
  
  const handleResultTabChange = (event, newValue) => {
    setActiveResultTab(newValue);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const formatScoreCategory = (score) => {
    if (score <= 5) return 'Low';
    if (score <= 15) return 'Average';
    if (score <= 25) return 'Good';
    return 'Excellent';
  };
  
  const getColorForScore = (score) => {
    if (score <= 5) return '#f44336';  // Red
    if (score <= 15) return '#ff9800';  // Orange
    if (score <= 25) return '#2196f3';  // Blue
    return '#4caf50';  // Green
  };
  
  const CompatibilityCard = ({ match, index }) => {
    const team = teams.find(t => t.teamNumber === match.teamNumber2);
    const teamName = team ? (team.nameShort || team.nameFull || `Team ${match.teamNumber2}`) : `Team ${match.teamNumber2}`;
    const teamEPA = teamEPAs[match.teamNumber2] || 0;
    
    return (
      <Card elevation={3} sx={{ mb: 2, border: index === 0 ? '2px solid #4caf50' : 'none' }}>
        <CardHeader
          title={`#${match.teamNumber2} - ${teamName}`}
          subheader={`Compatibility Score: ${(match.compatibilityScore * 100).toFixed(1)}%`}
          sx={{
            backgroundColor: index === 0 ? '#e8f5e9' : 'inherit',
            '& .MuiCardHeader-title': { fontWeight: 'bold' }
          }}
        />
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Combined EPA: {match.combinedEPA.toFixed(1)}
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" gutterBottom>Your Team</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Auto:</Typography>
                <Typography 
                  variant="body2" 
                  sx={{ fontWeight: 'bold', color: getColorForScore(match.team1Stats.auto) }}
                >
                  {match.team1Stats.auto.toFixed(1)} ({formatScoreCategory(match.team1Stats.auto)})
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Teleop:</Typography>
                <Typography 
                  variant="body2" 
                  sx={{ fontWeight: 'bold', color: getColorForScore(match.team1Stats.teleop) }}
                >
                  {match.team1Stats.teleop.toFixed(1)} ({formatScoreCategory(match.team1Stats.teleop)})
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Endgame:</Typography>
                <Typography 
                  variant="body2" 
                  sx={{ fontWeight: 'bold', color: getColorForScore(match.team1Stats.endgame) }}
                >
                  {match.team1Stats.endgame.toFixed(1)} ({formatScoreCategory(match.team1Stats.endgame)})
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" gutterBottom>Partner Team</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Auto:</Typography>
                <Typography 
                  variant="body2" 
                  sx={{ fontWeight: 'bold', color: getColorForScore(match.team2Stats.auto) }}
                >
                  {match.team2Stats.auto.toFixed(1)} ({formatScoreCategory(match.team2Stats.auto)})
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Teleop:</Typography>
                <Typography 
                  variant="body2" 
                  sx={{ fontWeight: 'bold', color: getColorForScore(match.team2Stats.teleop) }}
                >
                  {match.team2Stats.teleop.toFixed(1)} ({formatScoreCategory(match.team2Stats.teleop)})
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Endgame:</Typography>
                <Typography 
                  variant="body2" 
                  sx={{ fontWeight: 'bold', color: getColorForScore(match.team2Stats.endgame) }}
                >
                  {match.team2Stats.endgame.toFixed(1)} ({formatScoreCategory(match.team2Stats.endgame)})
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          {index === 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Perfect Match! This team complements your strengths and weaknesses.
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, position: 'relative', overflow: 'hidden' }}>
      <Typography variant="h5" gutterBottom>Alliance Matchmaker</Typography>
      <Typography variant="body1" paragraph>
        Find your perfect alliance partner based on complementary strengths and weaknesses.
      </Typography>
      
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Your Team Number"
            variant="outlined"
            size="small"
            value={teamNumber}
            onChange={(e) => setTeamNumber(e.target.value)}
            disabled={loading}
            placeholder="Enter your team number"
            type="number"
            required
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading || !teamNumber}
          >
            {loading ? <CircularProgress size={24} /> : 'Find Partners'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
      
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Alliance Matchmaker Results
        </DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Here are the best alliance partners for Team {result?.teamNumber}, ordered by compatibility:
          </DialogContentText>
          
          {result?.bestMatches?.map((match, index) => (
            <CompatibilityCard key={match.teamNumber2} match={match} index={index} />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AllianceMatchmaker;
