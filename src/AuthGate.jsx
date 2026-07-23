import React from 'react';
import { supabase } from './supabaseClient.js';
import { T } from './data/theme.js';
import { AuthScreen } from './components/AuthScreen.jsx';
import { getProfile, signOut } from './utils/auth.js';
import App from './App.jsx';
import { ManagerDash } from './components/ManagerDash.jsx';

export function AuthGate({ mode = 'pos' }) {
  const [session, setSession] = React.useState(undefined);
  const [profile, setProfile] = React.useState(undefined);
  const [profileError, setProfileError] = React.useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!session) {
      setProfile(undefined);
      return;
    }
    setProfile(undefined);
    setProfileError(null);
    getProfile(session.user.id).then(({ data, error }) => {
      if (error) {
        setProfileError(error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    });
  }, [session]);

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

  if (profile === undefined) {
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
    }, 'Chargement du profil...');
  }

  if (!profile) {
    return /*#__PURE__*/React.createElement('div', {
      style: {
        minHeight: '100vh',
        background: T.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: T.no,
        fontSize: 14,
        gap: 12,
        padding: 20,
        textAlign: 'center'
      }
    },
      /*#__PURE__*/React.createElement('div', { style: { fontWeight: 700 } }, "Ce compte n'a pas encore de restaurant associé."),
      /*#__PURE__*/React.createElement('div', { style: { fontSize: 12, color: T.txtSub, maxWidth: 320 } }, "L'inscription s'est probablement arretee avant confirmation. Deconnecte-toi et recree un compte (ou utilise un autre email)."),
      profileError && /*#__PURE__*/React.createElement('div', { style: { fontSize: 12, color: T.txtSub } }, profileError),
      /*#__PURE__*/React.createElement('button', {
        onClick: () => signOut(),
        style: { color: T.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }
      }, 'Se déconnecter')
    );
  }

  if (mode === 'manager') {
    return /*#__PURE__*/React.createElement(ManagerDash, {
      restaurantId: profile.restaurant_id,
      restaurantName: profile.restaurants ? profile.restaurants.nom : ''
    });
  }

  return /*#__PURE__*/React.createElement(App, { restaurantId: profile.restaurant_id, profile });
}
