import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthGate } from './AuthGate.jsx';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
// Anton et Permanent Marker restent : ce sont les polices du logo Vice Code.
import '@fontsource/anton';
import '@fontsource/permanent-marker';
import './index.css';

const mode = window.location.pathname.startsWith('/gestion') ? 'manager' : 'pos';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthGate mode={mode} />
  </React.StrictMode>
);
