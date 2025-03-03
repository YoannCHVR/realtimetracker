// backend/server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const riotApiService = require('./services/riotApiService');
// const scrapingService = require('./services/scrapingService');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Base de données
let db;
(async () => {
  db = await open({
    filename: '../database/players.db',
    driver: sqlite3.Database
  });
  
  // Créer les tables si elles n'existent pas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      main_account TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER,
      platform TEXT NOT NULL,
      account_id TEXT NOT NULL,
      summoner_name TEXT NOT NULL,
      FOREIGN KEY(player_id) REFERENCES players(id)
    );
    
    CREATE TABLE IF NOT EXISTS match_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER,
      match_id TEXT NOT NULL,
      champion_id INTEGER,
      win BOOLEAN,
      played_at TIMESTAMP,
      lp_change INTEGER,
      FOREIGN KEY(account_id) REFERENCES accounts(id)
    );
  `);
})();

// Routes pour les joueurs
app.get('/api/players', async (req, res) => {
  try {
    const players = await db.all('SELECT * FROM players');
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/players/:id', async (req, res) => {
  try {
    const player = await db.get('SELECT * FROM players WHERE id = ?', req.params.id);
    const accounts = await db.all('SELECT * FROM accounts WHERE player_id = ?', req.params.id);
    
    if (!player) {
      return res.status(404).json({ error: 'Joueur non trouvé' });
    }
    
    res.json({ ...player, accounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour obtenir l'historique récent d'un joueur
app.get('/api/players/:id/recent-games', async (req, res) => {
  try {
    const player = await db.get('SELECT * FROM players WHERE id = ?', req.params.id);
    const accounts = await db.all('SELECT * FROM accounts WHERE player_id = ?', req.params.id);
    
    if (!player) {
      return res.status(404).json({ error: 'Joueur non trouvé' });
    }
    
    // Récupérer l'historique des 24 dernières heures pour tous les comptes
    const recentGames = [];
    for (const account of accounts) {
      // Obtenir les données via l'API Riot ou par scraping
      const games = await riotApiService.getRecentGames(account.platform, account.account_id);
      recentGames.push(...games);
    }
    
    // Trier les matchs par date
    recentGames.sort((a, b) => new Date(b.played_at) - new Date(a.played_at));
    
    res.json({ player, recentGames });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour obtenir les statistiques sur 7 et 14 jours
app.get('/api/players/:id/stats', async (req, res) => {
  try {
    const playerId = req.params.id;
    const accounts = await db.all('SELECT * FROM accounts WHERE player_id = ?', playerId);
    
    // Dates pour 7 et 14 jours
    const date7Days = new Date();
    date7Days.setDate(date7Days.getDate() - 7);
    
    const date14Days = new Date();
    date14Days.setDate(date14Days.getDate() - 14);
    
    // Statistiques pour chaque période
    const stats7Days = await calculateStats(accounts, date7Days);
    const stats14Days = await calculateStats(accounts, date14Days);
    
    res.json({
      stats7Days,
      stats14Days
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour ajouter un nouveau joueur
app.post('/api/players', async (req, res) => {
  try {
    const { name, category, main_account } = req.body;
    
    // Validation de base
    if (!name || !category) {
      return res.status(400).json({ error: 'Le nom et la catégorie sont requis' });
    }
    
    const result = await db.run(
      'INSERT INTO players (name, category, main_account) VALUES (?, ?, ?)',
      [name, category, main_account]
    );
    
    const newPlayer = await db.get('SELECT * FROM players WHERE id = ?', result.lastID);
    res.status(201).json(newPlayer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour ajouter un compte à un joueur
app.post('/api/players/:id/accounts', async (req, res) => {
  try {
    const { platform, account_id, summoner_name } = req.body;
    const player_id = req.params.id;
    
    // Validation de base
    if (!platform || !account_id || !summoner_name) {
      return res.status(400).json({ 
        error: 'La plateforme, l\'ID du compte et le nom d\'invocateur sont requis' 
      });
    }
    
    // Vérifier si le joueur existe
    const player = await db.get('SELECT * FROM players WHERE id = ?', player_id);
    if (!player) {
      return res.status(404).json({ error: 'Joueur non trouvé' });
    }
    
    const result = await db.run(
      'INSERT INTO accounts (player_id, platform, account_id, summoner_name) VALUES (?, ?, ?, ?)',
      [player_id, platform, account_id, summoner_name]
    );
    
    const newAccount = await db.get('SELECT * FROM accounts WHERE id = ?', result.lastID);
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour ajouter un match à l'historique
app.post('/api/accounts/:id/matches', async (req, res) => {
  try {
    const { match_id, champion_id, win, played_at, lp_change } = req.body;
    const account_id = req.params.id;
    
    // Validation de base
    if (!match_id || champion_id === undefined || win === undefined) {
      return res.status(400).json({ 
        error: 'L\'ID du match, l\'ID du champion et le résultat (victoire/défaite) sont requis'
      });
    }
    
    // Vérifier si le compte existe
    const account = await db.get('SELECT * FROM accounts WHERE id = ?', account_id);
    if (!account) {
      return res.status(404).json({ error: 'Compte non trouvé' });
    }
    
    const timestamp = played_at || new Date().toISOString();
    
    const result = await db.run(
      'INSERT INTO match_history (account_id, match_id, champion_id, win, played_at, lp_change) VALUES (?, ?, ?, ?, ?, ?)',
      [account_id, match_id, champion_id, win ? 1 : 0, timestamp, lp_change || 0]
    );
    
    const newMatch = await db.get('SELECT * FROM match_history WHERE id = ?', result.lastID);
    res.status(201).json(newMatch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fonction pour calculer les statistiques
async function calculateStats(accounts, startDate) {
  // Initialiser les stats
  const stats = {
    totalGames: 0,
    wins: 0,
    losses: 0,
    lpChange: 0,
    championStats: {},
    proPlayersEncountered: []
  };
  
  for (const account of accounts) {
    // Obtenir les matchs depuis startDate
    const matches = await db.all(
      'SELECT * FROM match_history WHERE account_id = ? AND played_at >= ?',
      account.id, startDate.toISOString()
    );
    
    stats.totalGames += matches.length;
    
    for (const match of matches) {
      if (match.win) {
        stats.wins += 1;
      } else {
        stats.losses += 1;
      }
      
      stats.lpChange += match.lp_change || 0;
      
      // Compter les champions joués
      const champId = match.champion_id;
      if (!stats.championStats[champId]) {
        stats.championStats[champId] = {
          count: 0,
          wins: 0,
          losses: 0
        };
      }
      
      stats.championStats[champId].count += 1;
      if (match.win) {
        stats.championStats[champId].wins += 1;
      } else {
        stats.championStats[champId].losses += 1;
      }
      
      // Option bonus: récupérer les joueurs pro rencontrés
      const proPlayers = await riotApiService.getProPlayersInMatch(match.match_id);
      stats.proPlayersEncountered.push(...proPlayers);
    }
  }
  
  // Tri et dédoublonnage des joueurs pro
  stats.proPlayersEncountered = [...new Set(stats.proPlayersEncountered)];
  
  return stats;
}

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});