import React from 'react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import { T } from '../data/theme.js';
import { signOut } from '../utils/auth.js';
import { lookupCardByCode, createCustomerWithCard } from '../utils/loyaltyApi.js';

const STATUT_LABELS = {
  bloquee: 'Carte bloquée',
  perdue: 'Carte déclarée perdue',
  remplacee: 'Carte remplacée',
  desactivee: 'Carte désactivée',
  disponible: 'Carte pas encore associée'
};

function Btn({ label, onClick, kind = 'primary' }) {
  const styles = {
    primary: { background: T.primary, color: '#fff' },
    ghost: { background: T.bgCard, color: T.txt, border: `1px solid ${T.brd}` }
  };
  return /*#__PURE__*/React.createElement('button', {
    onClick,
    style: {
      padding: '14px 22px', borderRadius: 14, fontWeight: 700, fontSize: 15,
      cursor: 'pointer', border: 'none', boxShadow: T.sh, ...styles[kind]
    }
  }, label);
}

function CameraScanner({ onDetected, active }) {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!active) return;
    let stream;
    let cancelled = false;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => {
        if (cancelled) { s.getTracks().forEach(t => t.stop()); return; }
        stream = s;
        videoRef.current.srcObject = s;
        videoRef.current.play();
        tick();
      })
      .catch(() => setError("Impossible d'accéder à la caméra. Vérifiez les autorisations du navigateur."));

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          onDetected(code.data);
          return; // on arrete la boucle, le parent change de mode
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [active]);

  if (error) {
    return /*#__PURE__*/React.createElement('div', {
      style: { padding: 24, textAlign: 'center', color: T.no, fontSize: 14 }
    }, error);
  }

  return /*#__PURE__*/React.createElement('div', {
    style: {
      position: 'relative', width: '100%', maxWidth: 420, aspectRatio: '1 / 1',
      borderRadius: 20, overflow: 'hidden', background: '#000', margin: '0 auto',
      boxShadow: T.shSoft
    }
  },
    /*#__PURE__*/React.createElement('video', {
      ref: videoRef, muted: true, playsInline: true,
      style: { width: '100%', height: '100%', objectFit: 'cover' }
    }),
    /*#__PURE__*/React.createElement('canvas', { ref: canvasRef, style: { display: 'none' } }),
    /*#__PURE__*/React.createElement('div', {
      style: {
        position: 'absolute', inset: 24, border: '3px solid rgba(255,255,255,0.85)',
        borderRadius: 16, pointerEvents: 'none'
      }
    })
  );
}

function CustomerCard({ customer, onReset }) {
  const tier = customer.loyalty_tiers ? customer.loyalty_tiers.nom : null;
  return /*#__PURE__*/React.createElement('div', {
    style: {
      background: T.bgCard, borderRadius: 20, padding: 28, maxWidth: 420,
      margin: '0 auto', boxShadow: T.shSoft, textAlign: 'center'
    }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 22, fontWeight: 800, color: T.txt } },
      `Salut ${customer.prenom} 👋`),
    tier && /*#__PURE__*/React.createElement('div', {
      style: {
        display: 'inline-block', marginTop: 6, padding: '4px 12px', borderRadius: 999,
        background: T.gradViolet, color: T.primaryD, fontWeight: 700, fontSize: 12
      }
    }, tier),
    /*#__PURE__*/React.createElement('div', { style: { marginTop: 18, fontSize: 38, fontWeight: 800, color: T.primaryD } },
      `⭐ ${customer.points_balance} pts`),
    /*#__PURE__*/React.createElement('div', { style: { marginTop: 4, fontSize: 13, color: T.txtSub } },
      `${customer.nombre_visites} visite(s) · ${customer.total_depense.toFixed(2)} € dépensés`),
    /*#__PURE__*/React.createElement('div', { style: { marginTop: 24 } },
      /*#__PURE__*/React.createElement(Btn, { label: 'Nouveau scan', onClick: onReset })
    )
  );
}

function CardIssue({ status, onReset }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      background: T.noL, borderRadius: 20, padding: 28, maxWidth: 420,
      margin: '0 auto', textAlign: 'center'
    }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: T.no } },
      STATUT_LABELS[status] || 'Carte non valide'),
    /*#__PURE__*/React.createElement('div', { style: { marginTop: 6, fontSize: 13, color: T.txt } },
      'Merci de contacter la caisse.'),
    /*#__PURE__*/React.createElement('div', { style: { marginTop: 20 } },
      /*#__PURE__*/React.createElement(Btn, { label: 'Nouveau scan', onClick: onReset })
    )
  );
}

function UnknownCode({ onReset }) {
  return /*#__PURE__*/React.createElement('div', {
    style: { textAlign: 'center', color: T.txtSub, fontSize: 14, maxWidth: 420, margin: '0 auto' }
  },
    'QR code non reconnu.',
    /*#__PURE__*/React.createElement('div', { style: { marginTop: 16 } },
      /*#__PURE__*/React.createElement(Btn, { label: 'Réessayer', onClick: onReset, kind: 'ghost' })
    )
  );
}

function NewClientForm({ onCreated, onCancel, restaurantId }) {
  const [prenom, setPrenom] = React.useState('');
  const [telephone, setTelephone] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!prenom.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      const result = await createCustomerWithCard(restaurantId, { prenom: prenom.trim(), telephone: telephone.trim() });
      onCreated(result);
    } catch (e2) {
      setErr("Erreur lors de la création. Réessayez.");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${T.brd}`,
    fontSize: 15, marginTop: 6, boxSizing: 'border-box'
  };

  return /*#__PURE__*/React.createElement('form', {
    onSubmit: submit,
    style: { maxWidth: 380, margin: '0 auto', background: T.bgCard, borderRadius: 20, padding: 24, boxShadow: T.shSoft }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontWeight: 800, fontSize: 17, marginBottom: 16 } }, 'Nouveau client'),
    /*#__PURE__*/React.createElement('label', { style: { fontSize: 13, color: T.txtSub, fontWeight: 600 } }, 'Prénom',
      /*#__PURE__*/React.createElement('input', {
        style: inputStyle, value: prenom, onChange: e => setPrenom(e.target.value), autoFocus: true
      })
    ),
    /*#__PURE__*/React.createElement('label', { style: { fontSize: 13, color: T.txtSub, fontWeight: 600, display: 'block', marginTop: 14 } }, 'Téléphone (optionnel)',
      /*#__PURE__*/React.createElement('input', {
        style: inputStyle, value: telephone, onChange: e => setTelephone(e.target.value), type: 'tel'
      })
    ),
    err && /*#__PURE__*/React.createElement('div', { style: { color: T.no, fontSize: 13, marginTop: 10 } }, err),
    /*#__PURE__*/React.createElement('div', { style: { display: 'flex', gap: 10, marginTop: 20 } },
      /*#__PURE__*/React.createElement(Btn, { label: 'Annuler', onClick: onCancel, kind: 'ghost' }),
      /*#__PURE__*/React.createElement('button', {
        type: 'submit', disabled: saving || !prenom.trim(),
        style: {
          flex: 1, padding: '14px 0', borderRadius: 14, border: 'none', fontWeight: 700, fontSize: 15,
          background: T.primary, color: '#fff', cursor: 'pointer', opacity: saving ? 0.6 : 1
        }
      }, saving ? 'Création...' : 'Créer la carte')
    )
  );
}

function NewClientResult({ result, onReset }) {
  const [qrDataUrl, setQrDataUrl] = React.useState(null);

  React.useEffect(() => {
    QRCode.toDataURL(result.code, { width: 280, margin: 1 }).then(setQrDataUrl);
  }, [result.code]);

  return /*#__PURE__*/React.createElement('div', {
    style: { maxWidth: 380, margin: '0 auto', background: T.bgCard, borderRadius: 20, padding: 28, boxShadow: T.shSoft, textAlign: 'center' }
  },
    /*#__PURE__*/React.createElement('div', { style: { fontWeight: 800, fontSize: 18 } }, `Bienvenue ${result.customer.prenom} 🎉`),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 13, color: T.txtSub, marginTop: 6 } },
      'Sa carte de fidélité (QR à scanner à chaque passage) :'),
    qrDataUrl && /*#__PURE__*/React.createElement('img', {
      src: qrDataUrl, alt: 'QR code fidélité', style: { marginTop: 16, borderRadius: 12, border: `1px solid ${T.brd}` }
    }),
    /*#__PURE__*/React.createElement('div', { style: { fontSize: 12, color: T.txtMuted, marginTop: 12 } },
      "À faire scanner par le client depuis son téléphone (capture d'écran), ou à imprimer sur une carte."),
    /*#__PURE__*/React.createElement('div', { style: { marginTop: 20 } },
      /*#__PURE__*/React.createElement(Btn, { label: 'Nouveau scan', onClick: onReset })
    )
  );
}

export function ScanFidelite({ restaurantId, profile }) {
  const [mode, setMode] = React.useState('scan'); // scan | result | newClient | newClientResult
  const [result, setResult] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  async function handleDetected(code) {
    if (busy) return;
    setBusy(true);
    try {
      const r = await lookupCardByCode(restaurantId, code);
      setResult(r);
      setMode('result');
    } catch (e) {
      setResult({ status: 'erreur' });
      setMode('result');
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setResult(null);
    setBusy(false);
    setMode('scan');
  }

  return /*#__PURE__*/React.createElement('div', {
    style: { minHeight: '100vh', background: T.bgGradient, padding: '24px 16px', boxSizing: 'border-box' }
  },
    /*#__PURE__*/React.createElement('div', {
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 420, margin: '0 auto 20px' }
    },
      /*#__PURE__*/React.createElement('div', { style: { fontWeight: 800, fontSize: 18, color: T.txt } }, "📷 Scan fidélité"),
      /*#__PURE__*/React.createElement('button', {
        onClick: () => signOut(),
        style: { background: 'none', border: 'none', color: T.txtSub, fontSize: 13, cursor: 'pointer' }
      }, 'Se déconnecter')
    ),

    mode === 'scan' && /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement(CameraScanner, { active: mode === 'scan', onDetected: handleDetected }),
      /*#__PURE__*/React.createElement('div', { style: { textAlign: 'center', marginTop: 20 } },
        /*#__PURE__*/React.createElement(Btn, { label: '+ Nouveau client', onClick: () => setMode('newClient'), kind: 'ghost' })
      )
    ),

    mode === 'result' && result && result.status === 'active' &&
      /*#__PURE__*/React.createElement(CustomerCard, { customer: result.customer, onReset: reset }),
    mode === 'result' && result && result.status === 'inconnue' &&
      /*#__PURE__*/React.createElement(UnknownCode, { onReset: reset }),
    mode === 'result' && result && result.status === 'erreur' &&
      /*#__PURE__*/React.createElement(UnknownCode, { onReset: reset }),
    mode === 'result' && result && !['active', 'inconnue', 'erreur'].includes(result.status) &&
      /*#__PURE__*/React.createElement(CardIssue, { status: result.status, onReset: reset }),

    mode === 'newClient' && /*#__PURE__*/React.createElement(NewClientForm, {
      restaurantId, onCancel: reset,
      onCreated: r => { setResult(r); setMode('newClientResult'); }
    }),
    mode === 'newClientResult' && result && /*#__PURE__*/React.createElement(NewClientResult, { result, onReset: reset })
  );
}
