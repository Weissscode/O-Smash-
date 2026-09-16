import React from 'react';
import QRCode from 'qrcode';
import { T } from '../data/theme.js';
import { Logo } from './Logo.jsx';
import { PhoneInput } from './PhoneInput.jsx';
import { toE164, DEFAULT_PHONE_COUNTRY } from '../utils/phoneCountries.js';

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function RegisterForm({ restaurantSlug, onDone }) {
  const [prenom, setPrenom] = React.useState('');
  const [phone, setPhone] = React.useState({ country: DEFAULT_PHONE_COUNTRY, number: '' });
  const [cgu, setCgu] = React.useState(false);
  const [marketing, setMarketing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!prenom.trim() || !cgu) return;
    setSaving(true);
    setError(null);
    try {
      const telephone = phone.number.trim() ? toE164(phone.country.dial, phone.number, phone.country.code) : null;
      const res = await fetch('/api/register-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: restaurantSlug,
          prenom: prenom.trim(),
          telephone,
          consentementCgu: cgu,
          consentementMarketing: marketing
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.');
        return;
      }
      onDone(data);
    } catch (e2) {
      setError('Connexion impossible, réessayez.');
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    padding: '13px 14px', borderRadius: 12, border: `1px solid ${T.brd}`, fontSize: 16, boxSizing: 'border-box'
  };

  return /*#__PURE__*/React.createElement('form', {
    onSubmit: submit,
    style: { maxWidth: 380, margin: '0 auto', background: T.bgCard, borderRadius: 20, padding: 24, boxShadow: T.shSoft }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontWeight: 800, fontSize: 20, marginBottom: 4 } }, 'Rejoindre la fidélité'),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 13, color: T.txtSub, marginBottom: 18 } }, '1€ dépensé = 1 point. Récompenses à débloquer, carte dans votre téléphone.'),

    /*#__PURE__*/React.createElement('label', { style: { fontSize: 13, color: T.txtSub, fontWeight: 600 } }, 'Prénom',
      /*#__PURE__*/React.createElement('input', {
        style: { ...inputStyle, width: '100%', marginTop: 6 }, value: prenom, onChange: e => setPrenom(e.target.value), autoFocus: true
      })
    ),
    /*#__PURE__*/React.createElement('label', { style: { fontSize: 13, color: T.txtSub, fontWeight: 600, display: 'block', marginTop: 14 } }, 'Téléphone (optionnel)',
      /*#__PURE__*/React.createElement('div', { style: { marginTop: 6 } },
        /*#__PURE__*/React.createElement(PhoneInput, { value: phone, onChange: setPhone, inputStyle })
      )
    ),

    /*#__PURE__*/React.createElement('label', { style: { display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 18, fontSize: 12, color: T.txt } },
      /*#__PURE__*/React.createElement('input', { type: 'checkbox', checked: cgu, onChange: e => setCgu(e.target.checked), style: { marginTop: 2 } }),
      "J'accepte les conditions d'utilisation du programme de fidélité (obligatoire)."
    ),
    /*#__PURE__*/React.createElement('label', { style: { display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10, fontSize: 12, color: T.txt } },
      /*#__PURE__*/React.createElement('input', { type: 'checkbox', checked: marketing, onChange: e => setMarketing(e.target.checked), style: { marginTop: 2 } }),
      "J'accepte de recevoir des offres et actualités par SMS/email (optionnel)."
    ),

    error && /*#__PURE__*/React.createElement('div', { style: { color: T.no, fontSize: 13, marginTop: 12 } }, error),

    /*#__PURE__*/React.createElement('button', {
      type: 'submit', disabled: saving || !prenom.trim() || !cgu,
      style: {
        width: '100%', marginTop: 18, padding: '15px 0', borderRadius: 14, border: 'none', fontWeight: 700, fontSize: 15,
        background: T.primary, color: '#fff', cursor: 'pointer', opacity: saving ? 0.6 : 1
      }
    }, saving ? 'Création...' : 'Créer ma carte')
  );
}

function ExistingAccount() {
  return /*#__PURE__*/React.createElement('div', {
    style: { maxWidth: 380, margin: '0 auto', background: T.bgCard, borderRadius: 20, padding: 28, boxShadow: T.shSoft, textAlign: 'center' }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 32 } }, '👋'),
    /*#__PURE__*/React.createElement('div', { style: { fontWeight: 800, fontSize: 17, marginTop: 8 } }, 'Vous avez déjà une carte !'),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 13, color: T.txtSub, marginTop: 8 } },
      'Ce numéro est déjà inscrit. Passez en caisse, on la retrouve pour vous en un instant.')
  );
}

function RegisteredCard({ prenom, code }) {
  const [qrDataUrl, setQrDataUrl] = React.useState(null);
  const ios = React.useMemo(isIOS, []);

  React.useEffect(() => {
    QRCode.toDataURL(code, { width: 280, margin: 1 }).then(setQrDataUrl);
  }, [code]);

  return /*#__PURE__*/React.createElement('div', {
    style: { maxWidth: 380, margin: '0 auto', background: T.bgCard, borderRadius: 20, padding: 28, boxShadow: T.shSoft, textAlign: 'center' }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontWeight: 800, fontSize: 19 } }, `Bienvenue ${prenom} 🎉`),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 13, color: T.txtSub, marginTop: 6 } },
      'Votre carte est prête. Présentez-la en caisse à chaque passage.'),
    qrDataUrl && /*#__PURE__*/React.createElement('img', {
      src: qrDataUrl, alt: 'QR code fidélité', style: { marginTop: 16, borderRadius: 12, border: `1px solid ${T.brd}` }
    }),
    ios
      ? /*#__PURE__*/React.createElement('a', {
          href: `/api/wallet-pass?code=${encodeURIComponent(code)}`,
          style: {
            display: 'inline-block', marginTop: 18, padding: '13px 22px', borderRadius: 12,
            background: '#000', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none'
          }
        }, '  Ajouter à Apple Wallet')
      : /*#__PURE__*/React.createElement('div', { style: { fontSize: 12, color: T.txtMuted, marginTop: 14 } },
          "Gardez cette page ou faites une capture d'écran du QR — c'est votre carte de fidélité.")
  );
}

export function PublicInscription({ restaurantSlug }) {
  const [result, setResult] = React.useState(null);

  return /*#__PURE__*/React.createElement('div', {
    style: { minHeight: '100vh', background: T.bgGradient, padding: '32px 16px', boxSizing: 'border-box' }
  },
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 24 } },
      /*#__PURE__*/React.createElement(Logo, { size: 70 })
    ),
    !result && /*#__PURE__*/React.createElement(RegisterForm, { restaurantSlug, onDone: setResult }),
    result && result.status === 'existing' && /*#__PURE__*/React.createElement(ExistingAccount, null),
    result && result.status === 'created' && /*#__PURE__*/React.createElement(RegisteredCard, { prenom: result.prenom, code: result.code })
  );
}
