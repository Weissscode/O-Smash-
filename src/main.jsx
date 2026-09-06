import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthGate } from './AuthGate.jsx';
// Roboto : proche de la typographie Android/POS du logiciel concurrent pris
// pour reference, sobre et tres lisible en caisse.
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
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
