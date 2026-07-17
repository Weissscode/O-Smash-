import React from 'react';
import { supabase } from './supabaseClient.js';
import { T } from './data/theme.js';
import { AuthScreen } from './components/AuthScreen.jsx';
import App from './App.jsx';

export function AuthGate() {
  const [session, setSession] = React.useState(undefined);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return /*#__PURE__*/React.createElement('div', {
      style: {
        minHeight: '100vh',
        background: T.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: T.txtSub,
        fontSize: 14
      }
    }, 'Chargement...');
  }

  if (!session) {
    return /*#__PURE__*/React.createElement(AuthScreen, { onAuthed: setSession });
  }

  return /*#__PURE__*/React.createElement(App, null);
}
