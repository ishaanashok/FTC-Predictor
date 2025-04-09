import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Teams from './pages/teams';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import TeamDetails from './pages/teamDetails';  // Fixed to match actual filename
import { ThemeProvider } from '@mui/material';
import { theme } from './theme/theme';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:season/:eventCode" element={<EventDetails />} />
            <Route path="/team/:teamNumber" element={<TeamDetails />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;