import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthGate } from './AuthGate.jsx';
import { PublicInscription } from './components/PublicInscription.jsx';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/anton';
import '@fontsource/permanent-marker';
import './index.css';

const path = window.location.pathname;

// /r/<slug>/fidelite : page publique (plaque NFC / QR imprimé), aucune
// authentification staff necessaire - on ne passe donc jamais par
// AuthGate pour cette route.
const publicInscriptionMatch = path.match(/^\/r\/([^/]+)\/fidelite\/?$/);

const root = ReactDOM.createRoot(document.getElementById('root'));

if (publicInscriptionMatch) {
  root.render(
    <React.StrictMode>
      <PublicInscription restaurantSlug={publicInscriptionMatch[1]} />
    </React.StrictMode>
  );
} else {
  const mode = path.startsWith('/gestion')
    ? 'manager'
    : path.startsWith('/scan')
    ? 'scan'
    : 'pos';

  root.render(
    <React.StrictMode>
      <AuthGate mode={mode} />
    </React.StrictMode>
  );
}
