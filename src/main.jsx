import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthGate } from './AuthGate.jsx';
import { PublicInscription } from './components/PublicInscription.jsx';
import { LoyaltyPreview } from './components/LoyaltyPreview.jsx';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/600.css';
import '@fontsource/anton';
import '@fontsource/permanent-marker';
import './index.css';

const path = window.location.pathname;
const publicInscription = path.match(/^\/r\/([^/]+)\/fidelite\/?$/);
const mode = path.startsWith('/gestion') ? 'manager' : path.startsWith('/scan') ? 'scan' : 'pos';
const preview = import.meta.env.DEV && path === '/__preview/gestion-fidelite';

if (mode === 'manager' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/manager-sw.js', { scope: '/gestion' }).catch(() => {});
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {preview
      ? <LoyaltyPreview />
      : publicInscription
      ? <PublicInscription restaurantSlug={publicInscription[1]} />
      : <AuthGate mode={mode} />}
  </React.StrictMode>
);

