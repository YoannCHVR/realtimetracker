// frontend/src/components/AccountsList.js
import React from 'react';

function AccountsList({ accounts }) {
  return (
    <div className="accounts-list">
      <h3>Comptes liés</h3>
      
      {accounts.length === 0 ? (
        <p>Aucun compte lié pour ce joueur.</p>
      ) : (
        <div className="accounts-grid">
          {accounts.map(account => (
            <div key={account.id} className="account-card">
              <div className="account-header">
                <h4>{account.summoner_name}</h4>
                <span className="platform-badge">{account.platform}</span>
              </div>
              <div className="account-details">
                <div className="account-id">ID: {account.account_id}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AccountsList;