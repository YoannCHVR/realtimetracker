// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlayerService from '../services/PlayerService';

function Dashboard() {
  const [summary, setSummary] = useState({
    coached: { count: 0, items: [] },
    pro: { count: 0, items: [] },
    scout: { count: 0, items: [] }
  });
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const coachedPlayers = await PlayerService.getPlayersByCategory('coached');
        const proPlayers = await PlayerService.getPlayersByCategory('pro');
        const scoutPlayers = await PlayerService.getPlayersByCategory('scout');
        
        setSummary({
          coached: { count: coachedPlayers.length, items: coachedPlayers.slice(0, 3) },
          pro: { count: proPlayers.length, items: proPlayers.slice(0, 3) },
          scout: { count: scoutPlayers.length, items: scoutPlayers.slice(0, 3) }
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  if (loading) {
    return <div className="loading">Chargement...</div>;
  }
  
  return (
    <div className="dashboard">
      <h2>Tableau de Bord</h2>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Joueurs Coachés ({summary.coached.count})</h3>
          <ul>
            {summary.coached.items.map(player => (
              <li key={player.id}>
                <Link to={`/player/${player.id}`}>{player.name}</Link>
              </li>
            ))}
          </ul>
          <Link to="/players/coached" className="view-all">Voir tous</Link>
        </div>
        
        <div className="dashboard-card">
          <h3>Joueurs Pro ({summary.pro.count})</h3>
          <ul>
            {summary.pro.items.map(player => (
              <li key={player.id}>
                <Link to={`/player/${player.id}`}>{player.name}</Link>
              </li>
            ))}
          </ul>
          <Link to="/players/pro" className="view-all">Voir tous</Link>
        </div>
        
        <div className="dashboard-card">
          <h3>Joueurs Scouts ({summary.scout.count})</h3>
          <ul>
            {summary.scout.items.map(player => (
              <li key={player.id}>
                <Link to={`/player/${player.id}`}>{player.name}</Link>
              </li>
            ))}
          </ul>
          <Link to="/players/scout" className="view-all">Voir tous</Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;