// frontend/src/services/PlayerService.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const PlayerService = {
  async getPlayers() {
    try {
      const response = await axios.get(`${API_URL}/players`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des joueurs:', error);
      throw error;
    }
  },
  
  async getPlayersByCategory(category) {
    try {
      const response = await axios.get(`${API_URL}/players`);
      return response.data.filter(player => player.category === category);
    } catch (error) {
      console.error('Erreur lors de la récupération des joueurs par catégorie:', error);
      throw error;
    }
  },
  
  async getPlayer(id) {
    try {
      const response = await axios.get(`${API_URL}/players/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du joueur:', error);
      throw error;
    }
  },
  
  async getRecentGames(id) {
    try {
      const response = await axios.get(`${API_URL}/players/${id}/recent-games`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des parties récentes:', error);
      throw error;
    }
  },
  
  async getPlayerStats(id) {
    try {
      const response = await axios.get(`${API_URL}/players/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },
  
  async addPlayer(playerData) {
    try {
      const response = await axios.post(`${API_URL}/players`, playerData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du joueur:', error);
      throw error;
    }
  }
};

export default PlayerService;