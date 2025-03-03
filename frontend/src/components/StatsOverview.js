// frontend/src/components/StatsOverview.js
import React from 'react';

function StatsOverview({ stats, period }) {
  if (!stats) {
    return <div>Aucune statistique disponible pour cette période.</div>;
  }
  
  // Trier les champions par nombre de parties
  const sortedChampions = Object.entries(stats.championStats)
    .map(([championId, data]) => ({
      championId: parseInt(championId),
      ...data
    }))
    .sort((a, b) => b.count - a.count);
  
  return (
    <div className="stats-overview">
      <h3>Aperçu des {period}</h3>
      
      <div className="stats-grid">
        <div className="stats-card">
          <h4>Performance</h4>
          <div className="stats-content">
            <div className="stat-item">
              <span className="stat-label">Parties jouées:</span>
              <span className="stat-value">{stats.totalGames}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Victoires:</span>
              <span className="stat-value win">{stats.wins}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Défaites:</span>
              <span className="stat-value loss">{stats.losses}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Taux de victoire:</span>
              <span className="stat-value">
                {stats.totalGames > 0 ? (stats.wins / stats.totalGames * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <h4>Progression</h4>
          <div className="stats-content">
            <div className="stat-item">
              <span className="stat-label">Évolution LP:</span>
              <span className={`stat-value ${stats.lpChange >= 0 ? 'positive' : 'negative'}`}>
                {stats.lpChange > 0 ? '+' : ''}{stats.lpChange} LP
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="champions-section">
        <h4>Champions les plus joués</h4>
        
        {sortedChampions.length === 0 ? (
          <p>Aucun champion joué pendant cette période.</p>
        ) : (
          <div className="champions-grid">
            {sortedChampions.slice(0, 5).map(champion => (
              <div key={champion.championId} className="champion-card">
                <img 
                  src={`/champions/${champion.championId}.png`} 
                  alt={`Champion ${champion.championId}`} 
                  className="champion-icon" 
                />
                <div className="champion-stats">
                  <div className="champion-name">Champion {champion.championId}</div>
                  <div className="champion-record">
                    {champion.wins}V {champion.losses}D ({(champion.wins / champion.count * 100).toFixed(1)}%)
                  </div>
                  <div className="champion-count">{champion.count} parties</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {stats.proPlayersEncountered && stats.proPlayersEncountered.length > 0 && (
        <div className="pro-players-section">
          <h4>Joueurs Pro Rencontrés</h4>
          <ul className="pro-players-list">
            {stats.proPlayersEncountered.map((player, index) => (
              <li key={index} className="pro-player-item">
                {player.name} ({player.team})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default StatsOverview;