import React from 'react';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow/600.css';
import '@fontsource/barlow/700.css';
import '@fontsource/barlow-condensed/700.css';
import { fp } from '../utils/format.js';

// ─────────────────────────────────────────────────────────────────────────
// Habillage visuel de la borne de commande (mode ?kiosk=1).
//
// Purement presentationnel : toutes les actions (ajouter au panier, changer
// la quantite, editer un article, valider...) sont recues en props et
// appellent les memes fonctions que le reste de l'app (handleProd, updQty,
// rmCart, handleEdit, placeKioskOrder). Aucune logique metier ici.
//
// Direction : fond blanc casse chaud, cartes blanches a bordure fine, texte
// encre, un seul accent (rouge tomate) pour l'action principale et la
// categorie active. Pas d'ombres, pas de degrade, pas d'emoji : les icones
// sont des SVG traces au trait. Police Barlow (texte) et Barlow Condensed
// (titres, prix) : grotesque dessinee pour la signaletique, lisible de loin
// et en gros corps sur un ecran tactile.
// ─────────────────────────────────────────────────────────────────────────

const C = {
  bg: '#F4F1EC',
  surface: '#FFFFFF',
  soft: '#EEE9E2',
  line: '#E3DED7',
  ink: '#1E1B1A',
  muted: '#716B66',
  accent: '#D8472B',
  disabled: '#CFC9C1'
};

const F = {
  text: "'Barlow', 'Helvetica Neue', Arial, sans-serif",
  display: "'Barlow Condensed', 'Arial Narrow', 'Helvetica Neue', sans-serif"
};

const LOGO = '/osmash-logo.png';

// ── Icones SVG au trait ──────────────────────────────────────────────────
const PATHS = {
  burger: (
    <>
      <path d="M4 10.5c0-3.6 3.6-6.5 8-6.5s8 2.9 8 6.5H4z" />
      <path d="M3.5 14h17" />
      <path d="M5 17.5c0 1.4 1.1 2.5 2.5 2.5h9c1.4 0 2.5-1.1 2.5-2.5" />
      <path d="M4 14c0 1.7 1 3.5 8 3.5s8-1.8 8-3.5" />
    </>
  ),
  formule: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M9 10v8" />
    </>
  ),
  riz: (
    <>
      <path d="M3 12h18c0 4-3.5 7.5-9 7.5S3 16 3 12z" />
      <path d="M7 8.5c1-1.5 2.5-2 5-2s4 .5 5 2" />
      <path d="M12 4v3" />
    </>
  ),
  sides: (
    <>
      <path d="M6.5 12l1.3 8.5h8.4L17.5 12h-11z" />
      <path d="M5.5 12h13" />
      <path d="M9 12V5.5M12 12V3.5M15 12V5.5" />
    </>
  ),
  loaded: (
    <>
      <path d="M6.5 12l1.3 8.5h8.4L17.5 12h-11z" />
      <path d="M5.5 12h13" />
      <path d="M9 12V6M12 12V4M15 12V6" />
      <path d="M8.5 16c1.2-.9 2.4.9 3.5 0s2.3.9 3.5 0" />
    </>
  ),
  desserts: (
    <>
      <path d="M4 19h16" />
      <path d="M5 19v-6a7 7 0 0 1 14 0v6" />
      <path d="M12 6V4" />
      <path d="M8 13c1.3-1 2.7-1 4 0s2.7 1 4 0" />
    </>
  ),
  boissons: (
    <>
      <path d="M6 7h12l-1.2 13H7.2L6 7z" />
      <path d="M5 7h14" />
      <path d="M12 7l3-4" />
    </>
  ),
  milkshake: (
    <>
      <path d="M7 9h10l-1 11H8L7 9z" />
      <path d="M6 9a6 4 0 0 1 12 0" />
      <path d="M13 9l2-6" />
    </>
  ),
  crepes: (
    <>
      <path d="M4 15a8 8 0 0 1 16 0H4z" />
      <path d="M4 15h16" />
      <path d="M12 7v-3" />
    </>
  ),
  divers: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="1.5" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </>
  ),
  basket: (
    <>
      <path d="M3 10h18l-1.8 9.5H4.8L3 10z" />
      <path d="M8 10l3-6M16 10l-3-6" />
      <path d="M9 14v2M12 14v2M15 14v2" />
    </>
  ),
  plate: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
    </>
  ),
  back: <path d="M15 5l-7 7 7 7" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />
};

function Icon({ name, size = 24, stroke = 1.8, color = 'currentColor', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {PATHS[name] || PATHS.divers}
    </svg>
  );
}

// ── Briques ──────────────────────────────────────────────────────────────

// Photo d'un produit ou d'une categorie, repli sur une icone si le fichier
// n'existe pas encore dans public/.
function Photo({ src, icon, size, radius, fill }) {
  const [ok, setOk] = React.useState(true);
  const dim = fill ? '100%' : size;
  return (
    <div style={{
      width: dim,
      height: dim,
      borderRadius: radius,
      overflow: 'hidden',
      flexShrink: 0,
      background: C.soft,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: C.muted
    }}>
      {ok ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setOk(false)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Icon name={icon} size={fill ? 56 : Math.round(size * 0.5)} stroke={1.4} />
      )}
    </div>
  );
}

const pill = (bg, color, extra = {}) => ({
  fontFamily: F.text,
  fontSize: 15,
  fontWeight: 600,
  padding: '15px 24px',
  borderRadius: 999,
  border: '1.5px solid transparent',
  background: bg,
  color,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  ...extra
});

function ProductCard({ p, catIcon, out, onClick }) {
  return (
    <button
      onClick={() => !out && onClick()}
      style={{
        position: 'relative',
        background: C.surface,
        border: `1px solid ${C.line}`,
        borderRadius: 10,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        cursor: out ? 'not-allowed' : 'pointer',
        opacity: out ? 0.45 : 1,
        textAlign: 'left',
        fontFamily: F.text
      }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
        <Photo src={`/products/${p.id}.jpg`} icon={catIcon} fill radius={6} />
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: C.ink,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 500,
          lineHeight: 1
        }}>+</div>
        {out && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.7)'
          }}>
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.ink,
              background: C.surface,
              border: `1px solid ${C.ink}`,
              padding: '5px 12px',
              borderRadius: 999
            }}>Rupture</span>
          </div>
        )}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, lineHeight: 1.25, minHeight: 38 }}>{p.name}</div>
      <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.ink, lineHeight: 1 }}>{fp(p.price)}</div>
    </button>
  );
}

function CategoryRail({ cats, selCat, onSelect }) {
  return (
    <div style={{
      width: 104,
      flexShrink: 0,
      background: C.surface,
      borderRight: `1px solid ${C.line}`,
      overflowY: 'auto',
      padding: '10px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }}>
      {cats.map(c => {
        const active = c.id === selCat;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              padding: '8px 4px 9px',
              borderRadius: 8,
              border: 'none',
              background: active ? C.soft : 'transparent',
              cursor: 'pointer',
              fontFamily: F.text
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              overflow: 'hidden',
              border: active ? `2px solid ${C.accent}` : `1px solid ${C.line}`,
              background: C.surface,
              color: active ? C.accent : C.ink
            }}>
              <Photo src={`/categories/${c.id}.jpg`} icon={c.id} size={46} radius={6} />
            </div>
            <div style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              color: active ? C.accent : C.muted,
              textAlign: 'center',
              lineHeight: 1.15
            }}>{c.name}</div>
          </button>
        );
      })}
    </div>
  );
}

function ProductGrid({ catName, prods, catIcon, stockOut, onPick }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: C.bg, padding: '20px 20px 28px' }}>
      <div style={{
        fontFamily: F.display,
        fontSize: 32,
        fontWeight: 700,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: C.ink,
        marginBottom: 16,
        lineHeight: 1
      }}>{catName}</div>
      {prods.length === 0 ? (
        <div style={{ color: C.muted, fontSize: 15, padding: '40px 0', textAlign: 'center' }}>
          Aucun produit dans cette catégorie
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {prods.map(p => (
            <ProductCard
              key={p.id}
              p={p}
              catIcon={catIcon}
              out={stockOut.includes(p.id)}
              onClick={() => onPick(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const stepper = {
  width: 48,
  height: 48,
  borderRadius: '50%',
  border: `1.5px solid ${C.ink}`,
  background: C.surface,
  color: C.ink,
  fontSize: 24,
  fontWeight: 500,
  lineHeight: 1,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  fontFamily: F.text
};

function CartScreen({ cart, onEdit, onQty, onRemove, onBack }) {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: C.bg, padding: '18px 22px 24px' }}>
      <button
        onClick={onBack}
        style={{
          ...pill('transparent', C.ink, { border: `1.5px solid ${C.line}`, padding: '10px 16px 10px 12px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }),
          marginBottom: 18
        }}
      >
        <Icon name="back" size={18} stroke={2} />
        Continuer mes achats
      </button>
      <div style={{ fontFamily: F.display, fontSize: 36, fontWeight: 700, color: C.ink, lineHeight: 1 }}>Votre commande</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: C.muted, marginTop: 6, marginBottom: 20 }}>
        {count} article{count !== 1 ? 's' : ''} dans votre panier
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', color: C.muted, padding: '64px 0' }}>
          <Icon name="basket" size={48} stroke={1.4} />
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 12, color: C.ink }}>Votre panier est vide</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Choisissez vos produits dans le menu</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cart.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: C.surface,
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              padding: 14
            }}>
              <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.ink, width: 30, flexShrink: 0 }}>
                {item.qty}x
              </div>
              <Photo src={`/products/${item.pid}.jpg`} icon="plate" size={64} radius={6} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 16, fontWeight: 600, color: C.ink,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>{item.name}</div>
                <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.ink, marginTop: 2 }}>{fp(item.total)}</div>
                <button
                  onClick={() => onEdit(item)}
                  style={pill('transparent', C.ink, { border: `1.5px solid ${C.ink}`, fontSize: 13, padding: '7px 14px', marginTop: 8 })}
                >Voir les détails</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <button
                  onClick={() => item.qty <= 1 ? onRemove(item.id) : onQty(item.id, -1)}
                  style={stepper}
                >−</button>
                <div style={{ minWidth: 20, textAlign: 'center', fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.ink }}>{item.qty}</div>
                <button onClick={() => onQty(item.id, 1)} style={stepper}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BottomBar({ cart, cartTotal, cartCount, onAbandon, onOpenCart, onPay }) {
  const empty = cart.length === 0;
  return (
    <div style={{
      flexShrink: 0,
      background: C.surface,
      borderTop: `1px solid ${C.line}`,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    }}>
      <button
        onClick={onAbandon}
        disabled={empty}
        style={pill('transparent', C.ink, {
          border: `1.5px solid ${empty ? C.line : C.ink}`,
          color: empty ? C.disabled : C.ink,
          fontSize: 14,
          padding: '14px 18px',
          cursor: empty ? 'not-allowed' : 'pointer'
        })}
      >Abandonner ma commande</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onOpenCart}
          aria-label="Voir mon panier"
          style={{
            position: 'relative',
            width: 54,
            height: 54,
            borderRadius: 10,
            border: `1px solid ${C.line}`,
            background: C.soft,
            color: C.ink,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon name="basket" size={26} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -7, right: -7,
              background: C.accent, color: '#fff',
              fontSize: 12, fontWeight: 700,
              borderRadius: 999, minWidth: 22, height: 22, padding: '0 6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: F.text
            }}>{cartCount}</span>
          )}
        </button>

        <button
          onClick={onPay}
          disabled={empty}
          style={pill(empty ? C.disabled : C.accent, '#fff', {
            fontSize: 17,
            fontWeight: 700,
            padding: '16px 32px',
            cursor: empty ? 'not-allowed' : 'pointer'
          })}
        >Payer</button>

        <div style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.ink, minWidth: 84, textAlign: 'right', lineHeight: 1 }}>
          {fp(cartTotal)}
        </div>
      </div>
    </div>
  );
}

function Header({ onLogoTap }) {
  return (
    <div
      onClick={onLogoTap}
      style={{
        flexShrink: 0,
        background: C.surface,
        borderBottom: `1px solid ${C.line}`,
        padding: '16px 20px 12px',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <img src={LOGO} alt="O'Smash" style={{ height: 76, width: 'auto', display: 'block' }} />
    </div>
  );
}

// ── Ecrans exportes ──────────────────────────────────────────────────────

export function KioskWelcome({ onStart, onLogoTap, children }) {
  return (
    <div
      onClick={onStart}
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 26,
        background: C.bg,
        color: C.ink,
        textAlign: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        padding: 24,
        fontFamily: F.text
      }}
    >
      <img
        src={LOGO}
        alt="O'Smash"
        onClick={e => { e.stopPropagation(); onLogoTap(); }}
        style={{ height: 230, width: 'auto', display: 'block' }}
      />
      <div style={{ fontFamily: F.display, fontSize: 48, fontWeight: 700, lineHeight: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
        Commandez ici
      </div>
      <div style={{ fontSize: 20, fontWeight: 500, color: C.muted }}>Touchez l'écran pour commencer</div>
      {children}
    </div>
  );
}

export function KioskOrderUI({
  cart,
  cartTotal,
  selCat,
  setSelCat,
  cats,
  prods,
  stockOut,
  onPick,
  onEdit,
  onQty,
  onRemove,
  cartOpen,
  onOpenCart,
  onCloseCart,
  onAbandon,
  onPay,
  onLogoTap
}) {
  const catObj = cats.find(c => c.id === selCat);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: C.bg,
      color: C.ink,
      overflow: 'hidden',
      userSelect: 'none',
      fontFamily: F.text
    }}>
      <Header onLogoTap={onLogoTap} />

      {cartOpen ? (
        <CartScreen cart={cart} onEdit={onEdit} onQty={onQty} onRemove={onRemove} onBack={onCloseCart} />
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <CategoryRail cats={cats} selCat={selCat} onSelect={setSelCat} />
          <ProductGrid
            catName={catObj ? catObj.name : ''}
            prods={prods}
            catIcon={PATHS[selCat] ? selCat : 'plate'}
            stockOut={stockOut}
            onPick={onPick}
          />
        </div>
      )}

      <BottomBar
        cart={cart}
        cartTotal={cartTotal}
        cartCount={cartCount}
        onAbandon={onAbandon}
        onOpenCart={onOpenCart}
        onPay={onPay}
      />
    </div>
  );
}

// Fiche de validation (sur place / a emporter, prenom facultatif). Le
// paiement se fait en caisse : onValidate(service) appelle placeKioskOrder.
export function KioskConfirm({ cart, cartTotal, clientName, setClientName, onCancel, onValidate }) {
  const [service, setService] = React.useState('');
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const valid = !!service;
  const tile = active => ({
    fontFamily: F.text,
    height: 92,
    borderRadius: 10,
    border: active ? `2.5px solid ${C.accent}` : `1.5px solid ${C.line}`,
    background: active ? C.soft : C.surface,
    color: active ? C.accent : C.ink,
    fontSize: 20,
    fontWeight: 700,
    cursor: 'pointer'
  });
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-end', fontFamily: F.text }}>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(30,27,26,0.55)' }} />
      <div style={{
        position: 'relative',
        width: '100%',
        background: C.surface,
        borderRadius: '18px 18px 0 0',
        padding: '26px 24px 24px',
        maxHeight: '92vh',
        overflowY: 'auto'
      }}>
        <div style={{ fontFamily: F.display, fontSize: 32, fontWeight: 700, color: C.ink, lineHeight: 1 }}>
          Sur place ou à emporter ?
        </div>
        <div style={{ fontSize: 15, color: C.muted, fontWeight: 500, marginTop: 6, marginBottom: 20 }}>
          {count} article{count !== 1 ? 's' : ''}, {fp(cartTotal)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
          {['Sur place', 'A emporter'].map(s => (
            <button key={s} onClick={() => setService(s)} style={tile(service === s)}>{s}</button>
          ))}
        </div>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>
          Votre prénom (facultatif)
        </label>
        <input
          value={clientName}
          onChange={e => setClientName(e.target.value)}
          placeholder="Pour vous appeler quand c'est prêt"
          style={{
            width: '100%',
            height: 56,
            padding: '0 16px',
            borderRadius: 8,
            border: `1.5px solid ${C.line}`,
            background: C.surface,
            color: C.ink,
            fontSize: 18,
            fontFamily: F.text,
            outline: 'none',
            marginBottom: 14
          }}
        />
        <div style={{ fontSize: 14, color: C.muted, marginBottom: 22 }}>
          Le paiement se fait en caisse après validation.
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={pill('transparent', C.ink, { border: `1.5px solid ${C.ink}`, flex: 1, fontSize: 16 })}>
            Annuler
          </button>
          <button
            onClick={() => valid && onValidate(service)}
            disabled={!valid}
            style={pill(valid ? C.accent : C.disabled, '#fff', { flex: 2, fontSize: 17, fontWeight: 700, cursor: valid ? 'pointer' : 'not-allowed' })}
          >
            {valid ? 'Valider ma commande' : 'Choisissez sur place ou à emporter'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function KioskSuccess({ order, onDone }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      background: C.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      textAlign: 'center',
      fontFamily: F.text,
      color: C.ink
    }}>
      <div style={{
        width: 84, height: 84, borderRadius: '50%',
        background: C.accent, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 26
      }}>
        <Icon name="check" size={44} stroke={2.4} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.muted }}>
        Commande enregistrée
      </div>
      <div style={{ fontFamily: F.display, fontSize: 132, fontWeight: 700, lineHeight: 1, margin: '8px 0 18px' }}>
        #{order.num}
      </div>
      <div style={{ fontSize: 19, fontWeight: 500, maxWidth: 380, lineHeight: 1.4 }}>
        Présentez ce numéro en caisse pour régler et récupérer votre commande.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '22px 0 34px' }}>
        {order.service && (
          <span style={{ fontSize: 14, fontWeight: 700, border: `1.5px solid ${C.ink}`, borderRadius: 999, padding: '7px 14px' }}>
            {order.service}
          </span>
        )}
        <span style={{ fontFamily: F.display, fontSize: 32, fontWeight: 700, lineHeight: 1 }}>{fp(order.total)}</span>
      </div>
      <button onClick={onDone} style={pill(C.accent, '#fff', { fontSize: 18, fontWeight: 700, padding: '18px 48px' })}>
        Terminer
      </button>
    </div>
  );
}
