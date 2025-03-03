// frontend/src/pages/PlayerDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PlayerService from '../services/PlayerService';
import RecentGames from '../components/RecentGames';
import StatsOverview from '../components/StatsOverview';
import AccountsList from '../components/AccountsList';

function PlayerDetail() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [recentGames, setRecentGames] = useState([]);
  const [stats, setStats] = useState({ stats7Days: null, stats14Days: null });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');
  
  useEffect(() => {
    async function fetchPlayerData() {
      try {
        const playerData = await PlayerService.getPlayer(id);
        setPlayer(playerData);
        
        const gamesData = await PlayerService.getRecentGames(id);
        setRecentGames(gamesData.recentGames);
        
        const statsData = await PlayerService.getPlayerStats(id);
        setStats(statsData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données du joueur:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPlayerData();
  }, [id]);
  
  if (loading) {
    return <div className="loading">Chargement...</div>;
  }
  
  if (!player) {
    return <div className="error">Joueur non trouvé</div>;
  }
  
  return (
    <div className="player-detail">
      <header className="player-header">
        <h2>{player.name}</h2>
        <span className="category-badge">{player.category}</span>
      </header>
      
      <div className="tabs">
        <button 
          className={activeTab === 'recent' ? 'active' : ''} 
          onClick={() => setActiveTab('recent')}
        >
          Parties Récentes
        </button>
        <button 
          className={activeTab === 'stats7' ? 'active' : ''} 
          onClick={() => setActiveTab('stats7')}
        >
          Stats (7 jours)
        </button>
        <button 
          className={activeTab === 'stats14' ? 'active' : ''} 
          onClick={() => setActiveTab('stats14')}
        >
          Stats (14 jours)
        </button>
        <button 
          className={activeTab === 'accounts' ? 'active' : ''} 
          onClick={() => setActiveTab('accounts')}
        >
          Comptes
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'recent' && (
          <RecentGames games={recentGames} />
        )}
        
        {activeTab === 'stats7' && (
          <StatsOverview stats={stats.stats7Days} period="7 jours" />
        )}
        
        {activeTab === 'stats14' && (
          <StatsOverview stats={stats.stats14Days} period="14 jours" />
        )}
        
        {activeTab === 'accounts' && (
          <AccountsList accounts={player.accounts} />
        )}
      </div>
    </div>
  );
}

export default PlayerDetail;