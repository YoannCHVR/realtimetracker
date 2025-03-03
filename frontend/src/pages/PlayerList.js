// frontend/src/pages/PlayerList.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PlayerService from '../services/PlayerService';

function PlayerList() {
  const { category } = useParams();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchPlayers() {
      try {
        const data = await PlayerService.getPlayersByCategory(category);
        setPlayers(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des joueurs:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPlayers();
  }, [category]);
  
  if (loading) {
    return <div className="loading">Chargement...</div>;
  }
  
  const categoryLabels = {
    'coached': 'Joueurs Coachés',
    'pro': 'Joueurs Pro',
    'scout': 'Joueurs Scouts'
  };
  
  return (
    <div className="player-list">
      <h2>{categoryLabels[category] || 'Joueurs'}</h2>
      
      {players.length === 0 ? (
        <p>Aucun joueur dans cette catégorie.</p>
      ) : (
        <div className="players-grid">
          {players.map(player => (
            <Link to={`/player/${player.id}`} key={player.id} className="player-card">
              <h3>{player.name}</h3>
              <div className="accounts-count">
                {player.accounts?.length || 0} comptes
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlayerList;