import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthGate } from './AuthGate.jsx';
import { PublicInscription } from './components/PublicInscription.jsx';
import { LoyaltyPreview } from './components/LoyaltyPreview.jsx';
import { ScanPreview } from './components/ScanFidelite.jsx';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/600.css';
import '@fontsource/anton';
import '@fontsource/permanent-marker';
import './index.css';

const path = window.location.pathname;
const publicInscription = path.match(/^\/r\/([^/]+)\/fidelite\/?$/);
const mode = path.startsWith('/scan') || path.startsWith('/gestion/scan')
  ? 'scan'
  : path.startsWith('/gestion')
  ? 'manager'
  : 'pos';
const preview = import.meta.env.DEV && path === '/__preview/gestion-fidelite';
const scanPreview = import.meta.env.DEV && path === '/__preview/scan';

if (path.startsWith('/gestion') && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/manager-sw.js', { scope: '/gestion' }).catch(() => {});
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {scanPreview
      ? <ScanPreview />
      : preview
      ? <LoyaltyPreview />
      : publicInscription
      ? <PublicInscription restaurantSlug={publicInscription[1]} />
      : <AuthGate mode={mode} />}
  </React.StrictMode>
);

