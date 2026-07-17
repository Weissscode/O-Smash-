import React from 'react';
import { T } from '../data/theme.js';
import { card, btn } from '../utils/styles.js';
import { signIn, signUpRestaurant } from '../utils/auth.js';

const ERR_MESSAGES = {
  'Invalid login credentials': 'Email ou mot de passe incorrect.',
  'User already registered': 'Un compte existe déjà avec cet email.'
};

function translateError(message) {
  return ERR_MESSAGES[message] || message;
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 6,
  border: `1px solid ${T.brd}`,
  fontSize: 14,
  fontFamily: 'inherit'
};

export function AuthScreen({ onAuthed }) {
  const [mode, setMode] = React.useState('login');
  const [nomRestaurant, setNomRestaurant] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [info, setInfo] = React.useState('');

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    const { data, error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(translateError(err.message));
      return;
    }
    onAuthed(data.session);
  };

  const handleSignup = async e => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!nomRestaurant.trim()) {
      setError('Le nom du restaurant est obligatoire.');
      return;
    }
    setLoading(true);
    const result = await signUpRestaurant(nomRestaurant.trim(), email, password);
    setLoading(false);
    if (result.error) {
      setError(translateError(result.error.message));
      return;
    }
    if (result.needsEmailConfirmation) {
      setInfo("Compte créé. Vérifie ta boîte mail pour confirmer ton adresse avant de te connecter.");
      setMode('login');
      return;
    }
    onAuthed(null);
  };

  return /*#__PURE__*/React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: T.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement('form', {
    onSubmit: mode === 'login' ? handleLogin : handleSignup,
    style: {
      ...card(),
      width: 380,
      maxWidth: '100%',
      padding: 32
    }
  },
    /*#__PURE__*/React.createElement('div', {
      style: { display: 'flex', justifyContent: 'center', marginBottom: 16 }
    }, /*#__PURE__*/React.createElement('div', {
      style: {
        background: T.primary,
        borderRadius: 6,
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement('span', {
      style: { fontSize: 22, fontWeight: 800, color: T.white, letterSpacing: -0.5 }
    }, 'Weiss', /*#__PURE__*/React.createElement('span', { style: { fontWeight: 300 } }, 'Code')))),
    /*#__PURE__*/React.createElement('h1', {
      style: { fontSize: 20, fontWeight: 800, textAlign: 'center', color: T.txt, marginBottom: 4 }
    }, mode === 'login' ? 'Connexion' : 'Créer mon compte restaurant'),
    /*#__PURE__*/React.createElement('p', {
      style: { fontSize: 13, color: T.txtSub, textAlign: 'center', marginBottom: 24 }
    }, mode === 'login' ? 'Accède à ton espace de gestion' : 'Inscris ton restaurant en quelques secondes'),

    mode === 'signup' && /*#__PURE__*/React.createElement('div', { style: { marginBottom: 14 } },
      /*#__PURE__*/React.createElement('label', {
        style: { fontSize: 12, fontWeight: 700, color: T.txtSub, display: 'block', marginBottom: 6 }
      }, 'Nom du restaurant'),
      /*#__PURE__*/React.createElement('input', {
        type: 'text',
        value: nomRestaurant,
        onChange: e => setNomRestaurant(e.target.value),
        placeholder: "O'Smash Longwy",
        style: inputStyle,
        required: true
      })
    ),

    /*#__PURE__*/React.createElement('div', { style: { marginBottom: 14 } },
      /*#__PURE__*/React.createElement('label', {
        style: { fontSize: 12, fontWeight: 700, color: T.txtSub, display: 'block', marginBottom: 6 }
      }, 'Email'),
      /*#__PURE__*/React.createElement('input', {
        type: 'email',
        value: email,
        onChange: e => setEmail(e.target.value),
        placeholder: 'toi@exemple.com',
        style: inputStyle,
        required: true,
        autoComplete: 'username'
      })
    ),

    /*#__PURE__*/React.createElement('div', { style: { marginBottom: 20 } },
      /*#__PURE__*/React.createElement('label', {
        style: { fontSize: 12, fontWeight: 700, color: T.txtSub, display: 'block', marginBottom: 6 }
      }, 'Mot de passe'),
      /*#__PURE__*/React.createElement('input', {
        type: 'password',
        value: password,
        onChange: e => setPassword(e.target.value),
        placeholder: '••••••••',
        style: inputStyle,
        required: true,
        minLength: 6,
        autoComplete: mode === 'login' ? 'current-password' : 'new-password'
      })
    ),

    error && /*#__PURE__*/React.createElement('div', {
      style: {
        background: T.noL,
        color: T.no,
        fontSize: 13,
        fontWeight: 600,
        padding: '10px 12px',
        borderRadius: 6,
        marginBottom: 16
      }
    }, error),

    info && /*#__PURE__*/React.createElement('div', {
      style: {
        background: T.okL,
        color: T.ok,
        fontSize: 13,
        fontWeight: 600,
        padding: '10px 12px',
        borderRadius: 6,
        marginBottom: 16
      }
    }, info),

    /*#__PURE__*/React.createElement('button', {
      type: 'submit',
      disabled: loading,
      style: {
        ...btn(T.primary, T.white, { fontSize: 15, width: '100%', opacity: loading ? 0.6 : 1 })
      }
    }, loading ? 'Patiente...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'),

    /*#__PURE__*/React.createElement('div', {
      style: { textAlign: 'center', marginTop: 18, fontSize: 13, color: T.txtSub }
    }, mode === 'login' ? "Pas encore de compte ? " : 'Déjà un compte ? ',
      /*#__PURE__*/React.createElement('a', {
        href: '#',
        onClick: e => {
          e.preventDefault();
          setError('');
          setInfo('');
          setMode(mode === 'login' ? 'signup' : 'login');
        },
        style: { color: T.primary, fontWeight: 700, textDecoration: 'none' }
      }, mode === 'login' ? 'Crée-le ici' : 'Connecte-toi'))
  ));
}
