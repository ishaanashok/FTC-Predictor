import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Teams from './pages/teams';
import Events from './pages/Events'; // Assuming Events.js or Events.tsx exists and contains the Events component
import Navbar from './components/Navbar';
import Home from './pages/Home'; // Assuming Home.js or Home.tsx exists and contains the Home component

function App() {

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/teams" element={<Teams />} />
          <Route path="/events" element={<Events />} />
          <Route path="/" element={<Home />} /> {/* Add this line */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;