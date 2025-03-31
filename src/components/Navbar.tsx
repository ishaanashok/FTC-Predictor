import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" style={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
          FTC Predictor
        </Typography>
        <Button color="inherit" component={Link} to="/teams">Teams</Button>
        <Button color="inherit" component={Link} to="/events">Events</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;