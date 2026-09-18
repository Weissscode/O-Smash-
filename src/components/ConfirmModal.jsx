import React from 'react';
import { T } from '../data/theme.js';
import { card, btn } from '../utils/styles.js';
import { fp } from '../utils/format.js';
import { isPhoneNumber } from '../utils/phone.js';
import { Modal } from './Modal.jsx';
import { SL } from './SL.jsx';

function ClearableInput({ label, value, onChange, onClear, placeholder, type = 'text', borderColor = T.brd, marginBottom = 18 }) {
  return <div style={{ position: 'relative', marginBottom }}>
    <input
      aria-label={label}
      autoComplete="off"
      inputMode={type === 'tel' ? 'tel' : undefined}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: value ? '12px 48px 12px 14px' : '12px 14px',
        borderRadius: 6,
        border: `1.5px solid ${borderColor}`,
        background: T.bg,
        color: T.txt,
        fontSize: 15,
        outline: 'none',
        boxSizing: 'border-box'
      }}
    />
    {value && <button
      type="button"
      aria-label={`Effacer ${label.toLowerCase()}`}
      title={`Effacer ${label.toLowerCase()}`}
      onClick={onClear}
      style={{
        position: 'absolute',
        right: 5,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 36,
        height: 36,
        border: 'none',
        borderRadius: 5,
        background: 'transparent',
        color: T.txtSub,
        cursor: 'pointer',
        fontSize: 24,
        lineHeight: 1
      }}
    ><span aria-hidden="true">×</span></button>}
  </div>;
}

export function ConfirmModal({
  cart,
  cartTotal,
  clientName,
  setClientName,
  loyaltyCustomer,
  onCancel,
  onValidate,
  onSplit
}) {
  const linkedCustomer = loyaltyCustomer?.customer || null;
  const [phone, setPhone] = React.useState(linkedCustomer?.telephone || '');
  const [service, setService] = React.useState('');
  const [payment, setPayment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const submitLock = React.useRef(false);

  React.useEffect(() => {
    if (!linkedCustomer) return;
    setClientName(linkedCustomer.prenom || '');
    setPhone(linkedCustomer.telephone || '');
  }, [linkedCustomer?.id, setClientName]);

  // Un numéro saisi manuellement conserve le fonctionnement historique des
  // commandes téléphone. Le numéro d'un client scanné reste un contact de la
  // vente en caisse et ne change jamais le type de commande.
  const phoneProvided = Boolean(phone.trim());
  const phoneValid = !phoneProvided || isPhoneNumber(phone);
  const isTel = !linkedCustomer && phoneProvided && phoneValid;
  const valid = Boolean(phoneValid && service && (payment || isTel));

  const submit = async action => {
    if (!valid || submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      await action();
    } catch (error) {
      console.error('Échec de validation de la commande', error);
      submitLock.current = false;
      setSubmitting(false);
      setSubmitError('La commande n’a pas pu être enregistrée. Réessayez.');
    }
  };

  return <Modal onClose={submitting ? () => {} : onCancel}>
    <div style={{
      position: 'relative',
      ...card(),
      width: 'min(92vw,480px)',
      maxHeight: '92vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.brd}`, background: T.bgCard }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: T.txt }}>Finaliser la commande</div>
        <div style={{ fontSize: 12, color: T.txtSub, marginTop: 2 }}>
          {cart.length} article{cart.length !== 1 ? 's' : ''} · {fp(cartTotal)}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
        {linkedCustomer && <div style={{
          border: `1px solid ${T.brdL}`,
          borderLeft: `4px solid ${T.primary}`,
          background: T.primaryL,
          borderRadius: 6,
          padding: '10px 12px',
          marginBottom: 16
        }}>
          <strong style={{ display: 'block', color: T.txt, fontSize: 14 }}>Client fidélité associé</strong>
          <span style={{ display: 'block', color: T.txtSub, fontSize: 12, marginTop: 3 }}>
            {linkedCustomer.points_balance} pts, coordonnées modifiables pour cette commande
          </span>
        </div>}

        <SL title="PRÉNOM DU CLIENT" color={T.txtSub} />
        <ClearableInput
          label="Prénom du client"
          value={clientName}
          onChange={event => setClientName(event.target.value)}
          onClear={() => setClientName('')}
          placeholder="Prénom"
          marginBottom={12}
        />

        <SL title="TÉLÉPHONE" color={T.txtSub} />
        <ClearableInput
          label="Numéro de téléphone"
          type="tel"
          value={phone}
          onChange={event => setPhone(event.target.value)}
          onClear={() => setPhone('')}
          placeholder="Téléphone"
          borderColor={!phoneValid ? T.no : isTel ? '#2563EB' : T.brd}
          marginBottom={isTel || !phoneValid ? 6 : 18}
        />

        {isTel && <div style={{
          fontSize: 12,
          color: '#2563EB',
          fontWeight: 600,
          marginBottom: 14,
          padding: '6px 10px',
          background: '#DBEAFE',
          borderRadius: 6
        }}>Commande téléphone</div>}

        {!phoneValid && <div role="alert" style={{
          fontSize: 12,
          color: T.no,
          fontWeight: 600,
          marginBottom: 14,
          padding: '6px 10px',
          background: T.noL,
          borderRadius: 6
        }}>Saisissez un numéro de téléphone valide.</div>}

        <SL title="SUR PLACE OU À EMPORTER" color={T.warn} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          {['Sur place', 'A emporter'].map(option => <button
            type="button"
            key={option}
            onClick={() => setService(option)}
            style={{
              padding: 18,
              borderRadius: 6,
              border: service === option ? `2.5px solid ${T.warn}` : `1.5px solid ${T.brd}`,
              background: service === option ? T.warnL : T.bgCard,
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 600,
              color: service === option ? T.warn : T.txtSub,
              textAlign: 'center',
              boxShadow: 'none'
            }}
          >{option}</button>)}
        </div>

        {!isTel && <div>
          <SL title="MODE DE PAIEMENT" color={T.ok} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            {['Especes', 'CB'].map(option => <button
              type="button"
              key={option}
              onClick={() => setPayment(option)}
              style={{
                padding: 18,
                borderRadius: 6,
                border: payment === option ? `2.5px solid ${T.ok}` : `1.5px solid ${T.brd}`,
                background: payment === option ? T.okL : T.bgCard,
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 600,
                color: payment === option ? T.ok : T.txtSub,
                textAlign: 'center',
                boxShadow: 'none'
              }}
            >{option}</button>)}
          </div>
        </div>}

        <div style={{ ...card({ background: T.primaryL }), padding: '12px 16px', border: `1px solid ${T.brdL}`, marginTop: 8 }}>
          {cart.map((item, index) => <div key={item.id || index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            padding: '4px 0',
            borderBottom: index < cart.length - 1 ? `1px solid ${T.brdL}` : 'none'
          }}>
            <span style={{ color: T.txt }}>{item.qty}x {item.name}</span>
            <span style={{ color: T.primary, fontWeight: 600 }}>{fp(item.total)}</span>
          </div>)}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.brd}` }}>
            <span style={{ fontWeight: 600, color: T.txt }}>Total</span>
            <span style={{ fontWeight: 600, color: T.primary, fontSize: 18 }}>{fp(cartTotal)}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 22px', borderTop: `1px solid ${T.brd}`, display: 'flex', gap: 12, background: T.bg }}>
        <button type="button" onClick={onCancel} disabled={submitting} style={{ ...btn(T.bgCard, T.txtSub, { flex: 1, border: `1px solid ${T.brd}`, cursor: submitting ? 'not-allowed' : 'pointer' }) }}>
          Annuler
        </button>
        <button
          type="button"
          onClick={() => submit(() => onValidate(service, isTel ? '' : payment, phone.trim(), isTel))}
          disabled={!valid || submitting}
          style={{ ...btn(valid && !submitting ? T.ok : T.brd, valid && !submitting ? T.white : T.txtMuted, { flex: 2, cursor: valid && !submitting ? 'pointer' : 'not-allowed', boxShadow: 'none' }) }}
        >{submitting ? 'Validation en cours' : valid ? 'Valider et imprimer' : 'Choisir service'}</button>
      </div>

      {submitError && <div role="alert" style={{ padding: '0 22px 12px', background: T.bg, color: T.no, fontSize: 12, fontWeight: 600 }}>
        {submitError}
      </div>}

      {valid && !isTel && !linkedCustomer && onSplit && <div style={{ padding: '0 22px 14px', background: T.bg }}>
        <button type="button" disabled={submitting} onClick={() => submit(() => onSplit(service, payment, ''))} style={{ ...btn('#F59E0B', T.white, { width: '100%', fontWeight: 600, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer' }) }}>
          Payer séparément
        </button>
      </div>}
    </div>
  </Modal>;
}
