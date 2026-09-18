import React from 'react';
import { fetchActiveRewards } from '../../utils/loyaltyApi.js';
import '../managerLoyalty.css';

export function AttachedCustomer({ customer, cartTotal, restaurantId, onDetach }) {
  const [rewardCount, setRewardCount] = React.useState(null);

  React.useEffect(() => {
    let active = true;
    fetchActiveRewards(restaurantId)
      .then(rewards => {
        if (active) setRewardCount(rewards.filter(reward => reward.cout_points <= customer.points_balance).length);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [restaurantId, customer.id, customer.points_balance]);

  return <section className="ml-attached" aria-label="Client attaché à la commande">
    <div>
      <strong>{customer.prenom} {customer.nom || ''}</strong>
      <span>{customer.points_balance} pts, +{Math.floor(cartTotal)} pts avec cette commande</span>
      {rewardCount !== null && <span>{rewardCount} récompense{rewardCount !== 1 ? 's' : ''} disponible{rewardCount !== 1 ? 's' : ''}</span>}
    </div>
    <button type="button" onClick={onDetach}>Retirer</button>
  </section>;
}
