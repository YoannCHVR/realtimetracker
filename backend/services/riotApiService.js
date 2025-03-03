// backend/services/riotApiService.js
const axios = require('axios');

// À remplacer par votre clé API Riot
const RIOT_API_KEY = 'RGAPI-f3c8be91-969d-4c8b-91be-289ce2e68360';

// Base URL pour les différentes régions
const PLATFORMS = {
  EUW: 'euw1.api.riotgames.com',
  NA: 'na1.api.riotgames.com',
  KR: 'kr.api.riotgames.com',
  // Ajoutez d'autres régions selon vos besoins
};

const riotApiService = {
  // Obtenir les informations d'un invocateur par nom
  async getSummonerByName(platform, summonerName) {
    try {
      const response = await axios.get(
        `https://${PLATFORMS[platform]}/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
        { headers: { 'X-Riot-Token': RIOT_API_KEY } }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données d\'invocateur:', error);
      throw error;
    }
  },

  // Obtenir les matchs récents d'un invocateur
  async getRecentGames(platform, puuid, count = 20) {
    try {
      // D'abord, obtenir les IDs des matchs récents
      const matchIds = await this.getMatchIds(platform, puuid, count);
      
      // Ensuite, obtenir les détails de chaque match
      const matchDetails = [];
      for (const matchId of matchIds) {
        const details = await this.getMatchDetails(platform, matchId);
        matchDetails.push(details);
      }
      
      // Extraire les informations pertinentes pour le joueur spécifique
      return matchDetails.map(match => {
        const participant = match.info.participants.find(p => p.puuid === puuid);
        return {
          matchId: match.metadata.matchId,
          championId: participant.championId,
          win: participant.win,
          playedAt: new Date(match.info.gameCreation),
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          lpChange: this.calculateLpChange(participant),
          position: participant.individualPosition,
          championName: participant.championName
        };
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs récents:', error);
      throw error;
    }
  },

  // Obtenir la liste des IDs de matchs
  async getMatchIds(platform, puuid, count = 20) {
    try {
      // Notez que l'API des matchs utilise des régions (europe, americas, etc.) plutôt que des plateformes
      const region = this.platformToRegion(platform);
      const response = await axios.get(
        `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`,
        {
          params: { count },
          headers: { 'X-Riot-Token': RIOT_API_KEY }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des IDs de matchs:', error);
      throw error;
    }
  },

  // Obtenir les détails d'un match spécifique
  async getMatchDetails(platform, matchId) {
    try {
      const region = this.platformToRegion(platform);
      const response = await axios.get(
        `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        { headers: { 'X-Riot-Token': RIOT_API_KEY } }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du match:', error);
      throw error;
    }
  },

  // Obtenir les rangs d'un invocateur
  async getRankedInfo(platform, summonerId) {
    try {
      const response = await axios.get(
        `https://${PLATFORMS[platform]}/lol/league/v4/entries/by-summoner/${summonerId}`,
        { headers: { 'X-Riot-Token': RIOT_API_KEY } }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des rangs:', error);
      throw error;
    }
  },

  // Calculer le changement de LP (estimation basée sur des heuristiques)
  calculateLpChange(participant) {
    // Cette fonction est une estimation simplifiée
    // Dans un environnement réel, vous devriez comparer les rangs avant/après
    if (participant.win) {
      return Math.floor(Math.random() * 15) + 10; // Gain de 10-25 LP
    } else {
      return -Math.floor(Math.random() * 15) - 10; // Perte de 10-25 LP
    }
  },

  // Convertir une plateforme (euw1, na1, etc.) en région (europe, americas, etc.)
  platformToRegion(platform) {
    const regionMap = {
      'EUW': 'europe',
      'EUNE': 'europe',
      'NA': 'americas',
      'KR': 'asia',
      // Ajoutez d'autres mappings selon vos besoins
    };
    return regionMap[platform] || 'europe';
  },

  // Bonus: Détecter les joueurs pro dans un match
  async getProPlayersInMatch(matchId) {
    try {
      // Cette implémentation est un exemple simplifié
      // Dans une version réelle, vous pourriez maintenir une base de données des joueurs pro
      // ou utiliser un service externe pour les identifier
      
      // Obtenir les détails du match
      const match = await this.getMatchDetails('EUW', matchId);
      const proPlayers = [];
      
      // Liste fictive de puuids de joueurs pro (à remplacer par une vraie liste)
      const knownProPlayersPuuids = [
        // Quelques exemples fictifs
        'pro-player-puuid-1',
        'pro-player-puuid-2'
      ];
      
      // Vérifier si des joueurs pro sont dans le match
      match.info.participants.forEach(participant => {
        if (knownProPlayersPuuids.includes(participant.puuid)) {
          proPlayers.push({
            name: participant.summonerName,
            team: participant.teamId,
            champion: participant.championName
          });
        }
      });
      
      return proPlayers;
    } catch (error) {
      console.error('Erreur lors de la détection des joueurs pro:', error);
      return []; // Retourner une liste vide en cas d'erreur
    }
  }
};

module.exports = riotApiService;