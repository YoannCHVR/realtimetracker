// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Composants
import Dashboard from './pages/Dashboard';
import PlayerList from './pages/PlayerList';
import PlayerDetail from './pages/PlayerDetail';
import AddPlayer from './pages/AddPlayer';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>LoL Player Tracker</h1>
          <nav>
            <ul>
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/players/coached">Joueurs Coachés</Link></li>
              <li><Link to="/players/pro">Joueurs Pro</Link></li>
              <li><Link to="/players/scout">Joueurs Scouts</Link></li>
              <li><Link to="/add-player">Ajouter un Joueur</Link></li>
            </ul>
          </nav>
        </header>
        
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/players/:category" element={<PlayerList />} />
            <Route path="/player/:id" element={<PlayerDetail />} />
            <Route path="/add-player" element={<AddPlayer />} />
          </Routes>
        </main>
        
        <footer className="app-footer">
          <p>© {new Date().getFullYear()} LoL Player Tracker - Développé avec ❤️</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;