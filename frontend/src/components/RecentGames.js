// frontend/src/components/RecentGames.js
import React from 'react';

function RecentGames({ games }) {
  const last24Hours = games.filter(game => {
    const gameDate = new Date(game.playedAt);
    const now = new Date();
    const diffHours = (now - gameDate) / (1000 * 60 * 60);
    return diffHours <= 24;
  });
  
  return (
    <div className="recent-games">
      <h3>Parties des dernières 24 heures</h3>
      
      {last24Hours.length === 0 ? (
        <p>Aucune partie jouée dans les dernières 24 heures.</p>
      ) : (
        <div className="games-list">
          {last24Hours.map((game, index) => (
            <div key={index} className={`game-card ${game.win ? 'win' : 'loss'}`}>
              <div className="champion-info">
                <img 
                  src={`/champions/${game.championId}.png`} 
                  alt={game.championName} 
                  className="champion-icon" 
                />
                <span className="champion-name">{game.championName}</span>
              </div>
              
              <div className="game-stats">
                <div className="kda">
                  <span>{game.kills}</span> / <span className="deaths">{game.deaths}</span> / <span>{game.assists}</span>
                </div>
                <div className="position">{game.position}</div>
              </div>
              
              <div className="game-result">
                <div className={`result-badge ${game.win ? 'win' : 'loss'}`}>
                  {game.win ? 'Victoire' : 'Défaite'}
                </div>
                <div className="lp-change">
                  {game.lpChange > 0 ? '+' : ''}{game.lpChange} LP
                </div>
              </div>
              
              {game.proPlayersEncountered && game.proPlayersEncountered.length > 0 && (
                <div className="pro-players">
                  <h4>Joueurs Pro:</h4>
                  <ul>
                    {game.proPlayersEncountered.map((pro, idx) => (
                      <li key={idx}>{pro.name} ({pro.champion})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentGames;