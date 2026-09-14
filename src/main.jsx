import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthGate } from './AuthGate.jsx';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/600.css';
import '@fontsource/anton';
import '@fontsource/permanent-marker';
import './index.css';

const mode = window.location.pathname.startsWith('/gestion') ? 'manager' : 'pos';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthGate mode={mode} />
  </React.StrictMode>
);
