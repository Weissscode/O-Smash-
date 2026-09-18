import React from 'react';
import {
  fetchCustomers,
  fetchCustomerTransactions,
  fetchAllRewards,
  createReward,
  setRewardActive
} from '../utils/loyaltyApi.js';
import './managerLoyalty.css';

const TYPES = [
  { value: 'produit_offert', label: 'Produit offert' },
  { value: 'reduction_pourcent', label: 'Réduction en pourcentage' },
  { value: 'reduction_montant', label: 'Réduction en euros' },
  { value: 'cadeau', label: 'Cadeau' }
];

const CARD_STATUS = {
  active: 'Active',
  bloquee: 'Bloquée',
  perdue: 'Perdue',
  remplacee: 'Remplacée',
  disponible: 'Non assignée',
  desactivee: 'Désactivée'
};

const TX_LABELS = {
  gain: 'Points de commande',
  utilisation_recompense: 'Récompense utilisée',
  ajustement: 'Ajustement',
  bonus_bienvenue: 'Bonus de bienvenue',
  bonus_anniversaire: 'Bonus anniversaire',
  bonus_relance: 'Bonus fidélité',
  expiration: 'Expiration'
};

const defaultDataSource = {
  fetchCustomers,
  fetchCustomerTransactions,
  fetchAllRewards,
  createReward,
  setRewardActive
};

function Notice({ children }) {
  return <p className="ml-error" role="alert">{children}</p>;
}

function CustomerDetail({ customer, dataSource, onClose }) {
  const [transactions, setTransactions] = React.useState(null);
  const [error, setError] = React.useState(false);
  const dialogRef = React.useRef(null);

  React.useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  React.useEffect(() => {
    let active = true;
    setTransactions(null);
    setError(false);
    dataSource.fetchCustomerTransactions(customer.id)
      .then(rows => { if (active) setTransactions(rows); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [customer.id, dataSource]);

  const card = customer.loyalty_cards?.find(item => item.statut === 'active') || customer.loyalty_cards?.[0];
  return <dialog ref={dialogRef} className="ml-dialog" onCancel={onClose} onClose={onClose}>
    <div className="ml-dialog-inner">
      <div className="ml-dialog-head">
        <p>Fiche fidélité</p>
        <button className="ml-secondary" type="button" onClick={onClose}>Fermer</button>
      </div>
      <section className="ml-balance">
        <h2>{customer.prenom} {customer.nom || ''}</h2>
        <strong>{customer.points_balance}</strong><span>points</span>
      </section>
      <div className="ml-meta">
        <div>{customer.telephone || 'Téléphone non renseigné'}</div>
        <div>{customer.nombre_visites || 0} visites, {Number(customer.total_depense || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} dépensés</div>
        <div>Carte : {card ? CARD_STATUS[card.statut] || card.statut : 'Aucune carte'}</div>
        {customer.loyalty_tiers?.nom && <div>Palier : {customer.loyalty_tiers.nom}</div>}
      </div>
      <h3 className="ml-history-title">Historique des points</h3>
      {error && <Notice>L’historique est indisponible. Réessayez plus tard.</Notice>}
      {!error && transactions === null && <p className="ml-state">Chargement de l’historique...</p>}
      {!error && transactions?.length === 0 && <p className="ml-state">Aucun mouvement pour le moment.</p>}
      {transactions?.length > 0 && <ol className="ml-history">
        {transactions.map(transaction => <li key={transaction.id}>
          <div>
            <span>{transaction.description || TX_LABELS[transaction.type] || 'Mouvement de points'}</span>
            <time dateTime={transaction.cree_le}>{new Date(transaction.cree_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
          </div>
          <strong className={transaction.points_delta >= 0 ? 'gain' : 'spend'}>
            {transaction.points_delta > 0 ? '+' : ''}{transaction.points_delta} pts
          </strong>
        </li>)}
      </ol>}
    </div>
  </dialog>;
}

function RewardForm({ restaurantId, dataSource, onCreated }) {
  const [name, setName] = React.useState('');
  const [cost, setCost] = React.useState('');
  const [type, setType] = React.useState('produit_offert');
  const [value, setValue] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  async function submit(event) {
    event.preventDefault();
    const points = Number(cost);
    if (!name.trim() || !Number.isInteger(points) || points <= 0) {
      setError('Indiquez un nom et un coût entier supérieur à zéro.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await dataSource.createReward(restaurantId, {
        nom: name.trim(),
        coutPoints: points,
        type,
        valeur: value ? Number(value) : null
      });
      setName('');
      setCost('');
      setValue('');
      onCreated();
    } catch {
      setError('La récompense n’a pas pu être créée.');
    } finally {
      setSaving(false);
    }
  }

  return <form className="ml-form" onSubmit={submit}>
    <label>Nom<input value={name} onChange={event => setName(event.target.value)} required maxLength={150} /></label>
    <label>Points<input type="number" min="1" step="1" value={cost} onChange={event => setCost(event.target.value)} required /></label>
    <label>Type<select value={type} onChange={event => setType(event.target.value)}>{TYPES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
    <label>Valeur<input type="number" min="0" step="0.01" value={value} onChange={event => setValue(event.target.value)} /></label>
    <button className="ml-primary" disabled={saving}>{saving ? 'Enregistrement...' : 'Ajouter'}</button>
    {error && <Notice>{error}</Notice>}
  </form>;
}

function RewardsAdmin({ restaurantId, dataSource }) {
  const [rewards, setRewards] = React.useState(null);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState('');

  const load = React.useCallback(() => {
    setRewards(null);
    setError('');
    dataSource.fetchAllRewards(restaurantId)
      .then(setRewards)
      .catch(() => setError('Le catalogue n’a pas pu être chargé.'));
  }, [restaurantId, dataSource]);

  React.useEffect(load, [load]);

  async function toggle(reward) {
    setBusy(reward.id);
    setError('');
    try {
      await dataSource.setRewardActive(reward.id, !reward.actif);
      load();
    } catch {
      setError('La modification n’a pas été enregistrée.');
    } finally {
      setBusy('');
    }
  }

  return <>
    <RewardForm restaurantId={restaurantId} dataSource={dataSource} onCreated={load} />
    {error && <Notice>{error}</Notice>}
    {rewards === null && !error && <p className="ml-state">Chargement des récompenses...</p>}
    {rewards?.length === 0 && <p className="ml-state">Aucune récompense pour le moment.</p>}
    {rewards?.length > 0 && <div className="ml-panel">
      {rewards.map(reward => <article className="ml-reward" key={reward.id}>
        <div>
          <p>{reward.cout_points} pts</p>
          <h3>{reward.nom}</h3>
          <p>{TYPES.find(item => item.value === reward.type)?.label || 'Récompense'}</p>
        </div>
        <button className={reward.actif ? 'ml-primary' : 'ml-secondary'} disabled={!!busy} onClick={() => toggle(reward)}>
          {busy === reward.id ? 'En cours...' : reward.actif ? 'Active' : 'Désactivée'}
        </button>
      </article>)}
    </div>}
  </>;
}

export function LoyaltyDash({ restaurantId, dataSource = defaultDataSource }) {
  const [tab, setTab] = React.useState('clients');
  const [customers, setCustomers] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [error, setError] = React.useState('');
  const [selected, setSelected] = React.useState(null);

  const load = React.useCallback(() => {
    if (!restaurantId) return;
    setCustomers(null);
    setError('');
    dataSource.fetchCustomers(restaurantId)
      .then(setCustomers)
      .catch(() => setError('La liste des abonnés est indisponible.'));
  }, [restaurantId, dataSource]);

  React.useEffect(load, [load]);
  React.useEffect(() => {
    document.title = tab === 'clients' ? 'Abonnés fidélité | O’SMASH' : 'Récompenses | O’SMASH';
  }, [tab]);

  const query = search.trim().toLowerCase();
  const filtered = (customers || []).filter(customer =>
    [customer.prenom, customer.nom, customer.telephone]
      .some(value => (value || '').toLowerCase().includes(query))
  );

  return <main className="ml-page">
    <header className="ml-heading">
      <div><h1>Fidélité</h1><p>Abonnés et récompenses du restaurant</p></div>
    </header>
    <nav className="ml-tabs" aria-label="Gestion de la fidélité">
      <button aria-current={tab === 'clients' ? 'page' : undefined} onClick={() => setTab('clients')}>Abonnés</button>
      <button aria-current={tab === 'rewards' ? 'page' : undefined} onClick={() => setTab('rewards')}>Récompenses</button>
    </nav>

    {tab === 'rewards' ? <RewardsAdmin restaurantId={restaurantId} dataSource={dataSource} /> : <>
      <label>
        <span className="sr-only">Rechercher un abonné</span>
        <input className="ml-search" type="search" placeholder="Rechercher par nom ou téléphone" value={search} onChange={event => setSearch(event.target.value)} />
      </label>
      {error && <><Notice>{error}</Notice><button className="ml-secondary" onClick={load}>Réessayer</button></>}
      {!error && customers === null && <p className="ml-state">Chargement des abonnés...</p>}
      {!error && customers !== null && filtered.length === 0 && <p className="ml-state">{query ? 'Aucun abonné ne correspond à cette recherche.' : 'Aucun abonné pour le moment.'}</p>}
      {filtered.length > 0 && <div className="ml-panel">
        {filtered.map(customer => {
          const card = customer.loyalty_cards?.find(item => item.statut === 'active') || customer.loyalty_cards?.[0];
          return <button className="ml-customer" type="button" key={customer.id} onClick={() => setSelected(customer)}>
            <strong>{customer.prenom} {customer.nom || ''}<small>{customer.loyalty_tiers?.nom || 'Sans palier'}</small></strong>
            <span>{customer.telephone || 'Téléphone non renseigné'}</span>
            <span className="ml-status">{card ? CARD_STATUS[card.statut] || card.statut : 'Sans carte'}</span>
            <span className="ml-points">{customer.points_balance} pts</span>
          </button>;
        })}
      </div>}
      {selected && <CustomerDetail customer={selected} dataSource={dataSource} onClose={() => setSelected(null)} />}
    </>}
  </main>;
}
