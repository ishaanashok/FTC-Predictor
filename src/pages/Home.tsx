import React from 'react';
import { Container, Typography, Grid, Paper, Button, Box, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import BarChartIcon from '@mui/icons-material/BarChart';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box textAlign="center" mb={6} mt={4}>
        <Typography variant="h2" component="h1" gutterBottom>
          FTC Match Predictor
        </Typography>
        <Typography variant="h5" color="textSecondary" gutterBottom sx={{ mb: 4 }}>
          Advanced Match Prediction and Team Analysis
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: '800px', margin: '0 auto', mb: 6 }}>
          WinSim uses advanced machine learning algorithms to analyze FTC team performance data, 
          match histories, and competition statistics. Our predictive models help teams and 
          event organizers make data-driven decisions by providing accurate match outcome 
          predictions and detailed performance analytics.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{
            p: 4,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 3
            }
          }}>
            <GroupIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>
              Team Analysis
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
              View detailed team statistics, performance metrics, and historical data
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/teams')}
              sx={{ mt: 'auto' }}
            >
              View Teams
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{
            p: 4,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 3
            }
          }}>
            <EmojiEventsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>
              Event Predictions
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
              Get match predictions, event statistics, and tournament analysis
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/events')}
              sx={{ mt: 'auto' }}
            >
              View Events
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          FTC Predictor by the Numbers
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {[
          {
            label: 'Active Teams',
            value: '7,000+',
            icon: PeopleIcon,
          },
          {
            label: 'Events Analyzed',
            value: '150+',
            icon: EventIcon,
          },
          {
            label: 'Prediction Accuracy',
            value: '90%',
            icon: BarChartIcon,
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  textAlign: 'center',
                  py: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Icon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h4" component="div" gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="h6" color="textSecondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Additional content or sections can be added here */}

    </Container>
  );
};

export default Home;