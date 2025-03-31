import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Teams from './pages/teams';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/teams" element={<Teams />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:season/:eventCode" element={<EventDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;