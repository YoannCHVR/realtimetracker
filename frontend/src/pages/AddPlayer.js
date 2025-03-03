// frontend/src/pages/AddPlayer.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerService from '../services/PlayerService';

function AddPlayer() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState({
    name: '',
    category: 'coached',
    main_account: '',
    accounts: [{ platform: 'EUW', summoner_name: '' }]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlayer({ ...player, [name]: value });
  };
  
  const handleAccountChange = (index, field, value) => {
    const updatedAccounts = [...player.accounts];
    updatedAccounts[index][field] = value;
    setPlayer({ ...player, accounts: updatedAccounts });
  };
  
  const addAccount = () => {
    setPlayer({
      ...player,
      accounts: [...player.accounts, { platform: 'EUW', summoner_name: '' }]
    });
  };
  
  const removeAccount = (index) => {
    const updatedAccounts = player.accounts.filter((_, i) => i !== index);
    setPlayer({ ...player, accounts: updatedAccounts });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!player.name.trim()) {
        throw new Error('Le nom du joueur est requis.');
      }
      
      if (player.accounts.some(acc => !acc.summoner_name.trim())) {
        throw new Error('Tous les noms d\'invocateur sont requis.');
      }
      
      const result = await PlayerService.addPlayer(player);
      navigate(`/player/${result.id}`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du joueur:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'ajout du joueur.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="add-player">
      <h2>Ajouter un Joueur</h2>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nom du joueur:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={player.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Catégorie:</label>
          <select
            id="category"
            name="category"
            value={player.category}
            onChange={handleChange}
          >
            <option value="coached">Joueur Coaché</option>
            <option value="pro">Joueur Pro</option>
            <option value="scout">Joueur Scout</option>
          </select>
        </div>
        
        <h3>Comptes</h3>
        
        {player.accounts.map((account, index) => (
          <div key={index} className="account-form">
            <div className="form-group">
              <label htmlFor={`platform-${index}`}>Serveur:</label>
              <select
                id={`platform-${index}`}
                value={account.platform}
                onChange={(e) => handleAccountChange(index, 'platform', e.target.value)}
              >
                <option value="EUW">EUW</option>
                <option value="NA">NA</option>
                <option value="KR">KR</option>
                <option value="EUNE">EUNE</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor={`summoner-${index}`}>Nom d'invocateur:</label>
              <input
                type="text"
                id={`summoner-${index}`}
                value={account.summoner_name}
                onChange={(e) => handleAccountChange(index, 'summoner_name', e.target.value)}
                required
              />
            </div>
            
            {index > 0 && (
              <button 
                type="button" 
                className="remove-btn"
                onClick={() => removeAccount(index)}
              >
                Supprimer
              </button>
            )}
          </div>
        ))}
        
        <button type="button" className="add-btn" onClick={addAccount}>
          Ajouter un compte
        </button>
        
        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Ajout en cours...' : 'Ajouter le joueur'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddPlayer;