import React from 'react';
import { AppBar, Toolbar, Typography, Button, styled } from '@mui/material';
import { Link } from 'react-router-dom';

const StyledLink = styled(Link)(({ theme }) => ({
  flexGrow: 1,
  textDecoration: 'none',
  color: theme.palette.primary.contrastText
}));

const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={StyledLink} to="/">
          FTC Predictor
        </Typography>
        <Button color="inherit" component={Link} to="/teams">Teams</Button>
        <Button color="inherit" component={Link} to="/events">Events</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;