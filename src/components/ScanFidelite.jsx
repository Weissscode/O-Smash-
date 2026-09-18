import React from 'react';
import jsQR from 'jsqr';
import { signOut } from '../utils/auth.js';
import {
  lookupCardByCode,
  broadcastLoyaltyScan,
  fetchActiveRewards,
  redeemReward
} from '../utils/loyaltyApi.js';
import { PosIcon } from './PosIcon.jsx';
import './managerLoyalty.css';

const CARD_ERRORS = {
  bloquee: 'Cette carte est bloquée.',
  perdue: 'Cette carte a été déclarée perdue.',
  remplacee: 'Cette carte a été remplacée.',
  desactivee: 'Cette carte est désactivée.',
  disponible: 'Cette carte n’est pas encore associée à un client.'
};

function CameraScanner({ onDetected }) {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const frameRef = React.useRef(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let stream;
    let cancelled = false;
    let lastRead = 0;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('La caméra n’est pas disponible sur ce navigateur.');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        readFrame();
      } catch {
        if (stream) stream.getTracks().forEach(track => track.stop());
        setError('Autorisez l’accès à la caméra pour scanner la carte fidélité.');
      }
    }

    function readFrame(timestamp = 0) {
      if (cancelled) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (timestamp - lastRead >= 100 && video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        lastRead = timestamp;
        const scale = Math.min(1, 720 / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(image.data, image.width, image.height);
        if (code?.data) {
          onDetected(code.data);
          return;
        }
      }
      frameRef.current = requestAnimationFrame(readFrame);
    }

    start();
    return () => {
      cancelled = true;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  if (error) return <section className="scan-card scan-error" role="alert">
    <h2>Caméra indisponible</h2>
    <p>{error}</p>
    <button className="scan-button secondary" type="button" onClick={() => window.location.reload()}>Réessayer</button>
  </section>;

  return <section className="scan-card">
    <div className="scan-camera">
      <video ref={videoRef} muted playsInline aria-label="Aperçu de la caméra" />
      <canvas ref={canvasRef} hidden />
      <div className="scan-guide" aria-hidden="true" />
    </div>
    <p className="scan-help">Placez le QR du client dans le cadre.</p>
  </section>;
}

function RewardRow({ reward, balance, busy, onSelect }) {
  const missing = Math.max(0, reward.cout_points - balance);
  return <article className="scan-reward">
    <div>
      <strong>{reward.nom}</strong>
      <span>{reward.cout_points} pts</span>
      <small>{missing ? missing + ' points manquants' : 'Disponible'}</small>
    </div>
    <button className="scan-button small" type="button" disabled={missing > 0 || busy} onClick={() => onSelect(reward)}>
      Utiliser
    </button>
  </article>;
}

function CustomerResult({ initialCustomer, cardId, restaurantId, staffId, delivery, onReset }) {
  const [customer, setCustomer] = React.useState(initialCustomer);
  const [rewards, setRewards] = React.useState(null);
  const [rewardError, setRewardError] = React.useState(false);
  const [selectedReward, setSelectedReward] = React.useState(null);
  const [redeeming, setRedeeming] = React.useState(false);
  const [message, setMessage] = React.useState(null);

  React.useEffect(() => {
    fetchActiveRewards(restaurantId)
      .then(setRewards)
      .catch(() => setRewardError(true));
  }, [restaurantId]);

  async function confirmReward() {
    if (!selectedReward || redeeming) return;
    setRedeeming(true);
    setMessage(null);
    try {
      const { newBalance } = await redeemReward(restaurantId, {
        customerId: customer.id,
        cardId,
        reward: selectedReward,
        staffId
      });
      setCustomer(current => ({ ...current, points_balance: newBalance }));
      setMessage({ type: 'success', text: selectedReward.nom + ' utilisée. Nouveau solde : ' + newBalance + ' points.' });
      setSelectedReward(null);
    } catch {
      setMessage({ type: 'error', text: 'La récompense n’a pas pu être utilisée. Vérifiez le solde puis réessayez.' });
    } finally {
      setRedeeming(false);
    }
  }

  return <section className="scan-result">
    <div className={'scan-delivery ' + (delivery === 'sent' ? 'success' : 'warning')} role="status">
      {delivery === 'sent'
        ? 'Client envoyé à la caisse.'
        : delivery === 'sending'
        ? 'Envoi du client vers la caisse...'
        : 'Envoi impossible. Vérifiez le réseau puis recommencez.'}
    </div>
    <div className="scan-balance">
      <p>Client identifié</p>
      <h2>{customer.prenom} {customer.nom || ''}</h2>
      <strong>{customer.points_balance}</strong><span>points</span>
      {customer.loyalty_tiers?.nom && <small>{customer.loyalty_tiers.nom}</small>}
    </div>
    <div className="scan-order-note">
      Les points seront ajoutés après validation de la commande en caisse.
    </div>
    <div className="scan-customer-meta">
      <span>{customer.nombre_visites || 0} visites</span>
      <span>{Number(customer.total_depense || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} dépensés</span>
    </div>

    <div className="scan-rewards-head"><h3>Récompenses</h3></div>
    {rewards === null && !rewardError && <p className="scan-help">Chargement des récompenses...</p>}
    {rewardError && <p className="scan-inline-error">Les récompenses sont indisponibles.</p>}
    {rewards?.length === 0 && <p className="scan-help">Aucune récompense active pour le moment.</p>}
    {rewards?.length > 0 && <div className="scan-rewards">
      {rewards.map(reward => <RewardRow key={reward.id} reward={reward} balance={customer.points_balance} busy={redeeming} onSelect={setSelectedReward} />)}
    </div>}

    {selectedReward && <div className="scan-confirm" role="dialog" aria-label="Confirmer la récompense">
      <p>Utiliser {selectedReward.nom} pour {selectedReward.cout_points} points ?</p>
      <div>
        <button className="scan-button secondary" type="button" disabled={redeeming} onClick={() => setSelectedReward(null)}>Annuler</button>
        <button className="scan-button" type="button" disabled={redeeming} onClick={confirmReward}>{redeeming ? 'Validation...' : 'Confirmer'}</button>
      </div>
    </div>}
    {message && <p className={'scan-message ' + message.type} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</p>}
    <button className="scan-button wide" type="button" onClick={onReset}>Scanner un autre client</button>
  </section>;
}

function ScanIssue({ status, onReset }) {
  const message = status === 'inconnue' || status === 'erreur'
    ? 'Ce QR code ne correspond à aucune carte fidélité active.'
    : CARD_ERRORS[status] || 'Cette carte ne peut pas être utilisée.';
  return <section className="scan-card scan-error">
    <h2>Carte non reconnue</h2>
    <p>{message}</p>
    <button className="scan-button secondary" type="button" onClick={onReset}>Réessayer</button>
  </section>;
}

export function ScanFidelite({ restaurantId, profile }) {
  const [mode, setMode] = React.useState('scan');
  const [result, setResult] = React.useState(null);
  const [delivery, setDelivery] = React.useState('idle');
  const lockRef = React.useRef(false);

  async function handleDetected(code) {
    if (lockRef.current) return;
    lockRef.current = true;
    setMode('loading');
    setDelivery('idle');
    try {
      const next = await lookupCardByCode(restaurantId, code);
      setResult(next);
      setMode('result');
      if (next.status === 'active') {
        setDelivery('sending');
        try {
          await broadcastLoyaltyScan(restaurantId, { customerId: next.customer.id, cardId: next.card.id });
          setDelivery('sent');
        } catch {
          setDelivery('failed');
        }
      }
    } catch {
      setResult({ status: 'erreur' });
      setMode('result');
    }
  }

  function reset() {
    lockRef.current = false;
    setResult(null);
    setDelivery('idle');
    setMode('scan');
  }

  return <main className="scan-page">
    <header className="scan-header">
      {profile?.role === 'gerant'
        ? <a href="/gestion" className="scan-brand" aria-label="Retour à la gestion"><img src="/osmash-logo.png" alt="O’SMASH" /></a>
        : <span className="scan-brand"><img src="/osmash-logo.png" alt="O’SMASH" /></span>}
      <button type="button" onClick={() => signOut()}>Se déconnecter</button>
    </header>
    <div className="scan-content">
      <div className="scan-title">
        <span><PosIcon name="scan" size={24} /></span>
        <div><h1>Scanner la carte fidélité</h1><p>Identification du client pour la caisse</p></div>
      </div>
      {mode === 'scan' && <CameraScanner onDetected={handleDetected} />}
      {mode === 'loading' && <section className="scan-card"><p className="scan-loading" role="status">Identification du client...</p></section>}
      {mode === 'result' && result?.status === 'active' && <CustomerResult
        initialCustomer={result.customer}
        cardId={result.card.id}
        restaurantId={restaurantId}
        staffId={profile?.id || null}
        delivery={delivery}
        onReset={reset}
      />}
      {mode === 'result' && result?.status !== 'active' && <ScanIssue status={result?.status} onReset={reset} />}
    </div>
  </main>;
}

export function ScanPreview() {
  return <main className="scan-page">
    <header className="scan-header">
      <span className="scan-brand"><img src="/osmash-logo.png" alt="O’SMASH" /></span>
      <button type="button">Se déconnecter</button>
    </header>
    <div className="scan-content">
      <div className="scan-title">
        <span><PosIcon name="scan" size={24} /></span>
        <div><h1>Scanner la carte fidélité</h1><p>Identification du client pour la caisse</p></div>
      </div>
      <section className="scan-card">
        <div className="scan-camera"><div className="scan-guide" aria-hidden="true" /></div>
        <p className="scan-help">Placez le QR du client dans le cadre.</p>
      </section>
    </div>
  </main>;
}
