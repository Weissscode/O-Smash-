import React from 'react';
import { fp } from '../utils/format.js';
import { Logo } from './Logo.jsx';

// ─────────────────────────────────────────────────────────────────────────
// Habillage visuel de la borne de commande (mode ?kiosk=1), style borne de
// fast-food premium (colonne categories a gauche, grille photos, barre de
// paiement fixe en bas), identite O'Smash.
//
// Ce fichier est purement presentationnel : toutes les actions (ajouter au
// panier, changer la quantite, editer un article, valider...) sont recues
// en props et appellent exactement les memes fonctions que le reste de
// l'app (handleProd, updQty, rmCart, handleEdit...) — rien de la logique
// metier n'est duplique ni modifie ici.
// ─────────────────────────────────────────────────────────────────────────

const CAT_ICONS = {
  burger: '🍔',
  formule: '🍽️',
  riz: '🍚',
  sides: '🍟',
  loaded: '🧀',
  desserts: '🍰',
  boissons: '🥤',
  milkshake: '🥛',
  crepes: '🥞',
  divers: '🧾'
};

const stepperBtn = {
  width: 46,
  height: 46,
  borderRadius: '50%',
  border: '1.5px solid #EDE6FB',
  background: '#F8F5FF',
  color: '#1A1028',
  fontSize: 20,
  fontWeight: 800,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

function ProductPhoto({ id, icon, size, radius, fill }) {
  const [ok, setOk] = React.useState(true);
  const dim = fill ? '100%' : size;
  return (
    <div style={{
      position: 'relative',
      width: dim,
      height: dim,
      borderRadius: radius,
      overflow: 'hidden',
      flexShrink: 0,
      background: 'linear-gradient(135deg,#F6F0FF,#EFE7FF)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {ok && (
        <img
          src={`/products/${id}.jpg`}
          alt=""
          loading="lazy"
          onError={() => setOk(false)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      {!ok && <span style={{ fontSize: fill ? 46 : Math.round(size * 0.42) }}>{icon}</span>}
    </div>
  );
}

function KioskProductCard({ p, catIcon, out, onClick }) {
  return (
    <button
      onClick={() => !out && onClick()}
      onPointerDown={e => { if (!out) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      onPointerLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      style={{
        position: 'relative',
        background: '#fff',
        borderRadius: 22,
        border: '1px solid #F1EDFB',
        boxShadow: '0 3px 14px rgba(148,100,214,0.09)',
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        cursor: out ? 'not-allowed' : 'pointer',
        opacity: out ? 0.42 : 1,
        textAlign: 'left',
        transition: 'transform .1s'
      }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', borderRadius: 16, overflow: 'hidden' }}>
        <ProductPhoto id={p.id} icon={catIcon} fill radius={16} />
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: '#1A1028',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 21,
          fontWeight: 700,
          boxShadow: '0 3px 10px rgba(0,0,0,0.28)'
        }}>+</div>
        {out && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.82)'
          }}>
            <span style={{
              fontSize: 12, fontWeight: 800, color: '#DC2626', background: '#FEE2E2',
              padding: '5px 12px', borderRadius: 8, border: '1px solid #FCA5A5'
            }}>Rupture</span>
          </div>
        )}
      </div>
      <div style={{ fontSize: 15.5, fontWeight: 700, color: '#1A1028', lineHeight: 1.25, minHeight: 38 }}>{p.name}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#9370CC' }}>{fp(p.price)}</div>
    </button>
  );
}

function KioskCategoryRail({ cats, selCat, onSelect }) {
  return (
    <div style={{
      width: 116,
      flexShrink: 0,
      background: '#fff',
      borderRight: '1px solid #F1EDFB',
      overflowY: 'auto',
      padding: '16px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
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
              gap: 6,
              padding: '12px 4px',
              borderRadius: 16,
              border: 'none',
              cursor: 'pointer',
              background: active ? '#F2ECFF' : 'transparent'
            }}
          >
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: active ? '#fff' : '#F8F5FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              boxShadow: active ? '0 3px 10px rgba(148,100,214,0.22)' : 'none',
              border: active ? '1.5px solid #B48FE0' : '1.5px solid transparent'
            }}>
              {CAT_ICONS[c.id] || '🍽️'}
            </div>
            <div style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: active ? '#6D28D9' : '#8B8398',
              textAlign: 'center',
              lineHeight: 1.15
            }}>{c.name}</div>
          </button>
        );
      })}
    </div>
  );
}

function KioskProductGrid({ catName, prods, catIcon, stockOut, onPick }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#FBFAFE', padding: '22px 24px 28px' }}>
      <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 0.5, color: '#1A1028', marginBottom: 18, textTransform: 'uppercase' }}>
        {catName}
      </div>
      {prods.length === 0 ? (
        <div style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>Aucun produit dans cette categorie</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {prods.map(p => (
            <KioskProductCard
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

function KioskCartScreen({ cart, onEdit, onQty, onRemove }) {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#fff', padding: '26px 26px 20px' }}>
      <div style={{ fontSize: 26, fontWeight: 900, color: '#1A1028' }}>Votre commande</div>
      <div style={{ fontSize: 14, color: '#8B8398', fontWeight: 600, marginTop: 4, marginBottom: 22 }}>
        {count} article{count !== 1 ? 's' : ''} dans votre panier
      </div>
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#B9B2C6', padding: '70px 0' }}>
          <div style={{ fontSize: 46, marginBottom: 12 }}>🛒</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Votre panier est vide</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Choisissez vos produits dans le menu</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {cart.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: '#fff',
              border: '1px solid #F1EDFB',
              borderRadius: 20,
              boxShadow: '0 2px 12px rgba(148,100,214,0.07)',
              padding: 14
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#9370CC', width: 24, textAlign: 'center', flexShrink: 0 }}>
                {item.qty}x
              </div>
              <ProductPhoto id={item.pid} icon="🍽️" size={62} radius={13} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 700, color: '#1A1028',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>{item.name}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#9370CC', marginTop: 2 }}>{fp(item.total)}</div>
                <button
                  onClick={() => onEdit(item)}
                  style={{
                    marginTop: 7, border: 'none', background: '#1A1028', color: '#fff',
                    fontSize: 11.5, fontWeight: 700, padding: '7px 14px', borderRadius: 9, cursor: 'pointer'
                  }}
                >Voir les détails</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => item.qty <= 1 ? onRemove(item.id) : onQty(item.id, -1)}
                  style={stepperBtn}
                >−</button>
                <div style={{ minWidth: 18, textAlign: 'center', fontWeight: 800, color: '#1A1028', fontSize: 15 }}>{item.qty}</div>
                <button onClick={() => onQty(item.id, 1)} style={stepperBtn}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function KioskBottomBar({ cart, cartTotal, onAbandon, onOpenCart, onPay, cartCount }) {
  const empty = cart.length === 0;
  return (
    <div style={{
      flexShrink: 0,
      background: '#fff',
      borderTop: '1px solid #F1EDFB',
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
      boxShadow: '0 -8px 24px rgba(148,100,214,0.08)'
    }}>
      <button
        onClick={onAbandon}
        disabled={empty}
        style={{
          padding: '15px 18px',
          borderRadius: 16,
          border: '1.5px solid #FCA5A5',
          background: '#FEF2F2',
          color: '#DC2626',
          fontWeight: 700,
          fontSize: 13.5,
          opacity: empty ? 0.4 : 1,
          cursor: empty ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}
      >Abandonner ma commande</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
        <button
          onClick={onOpenCart}
          style={{
            position: 'relative',
            width: 54, height: 54,
            borderRadius: 16,
            border: '1.5px solid #EDE6FB',
            background: '#F8F5FF',
            fontSize: 24,
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          🛒
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6, background: '#9370CC', color: '#fff',
              fontSize: 11, fontWeight: 800, borderRadius: 99, minWidth: 20, height: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px'
            }}>{cartCount}</span>
          )}
        </button>

        <button
          onClick={onPay}
          disabled={empty}
          style={{
            padding: '17px 30px',
            borderRadius: 16,
            border: 'none',
            background: empty ? '#D8D3E3' : '#1A1028',
            color: '#fff',
            fontWeight: 800,
            fontSize: 16,
            cursor: empty ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap'
          }}
        >Payer</button>

        <div style={{ fontSize: 19, fontWeight: 900, color: '#1A1028', minWidth: 78, textAlign: 'right' }}>
          {fp(cartTotal)}
        </div>
      </div>
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
      background: '#FBFAFE',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      <div
        onClick={onLogoTap}
        style={{
          flexShrink: 0,
          background: '#fff',
          borderBottom: '1px solid #F5F2FC',
          padding: '20px 20px 16px',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div style={{
          width: 108,
          height: 108,
          borderRadius: 28,
          background: 'linear-gradient(135deg,#6B35C2 0%,#5425A8 55%,#421890 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 22px rgba(84,37,168,0.28)'
        }}>
          <Logo size={78} />
        </div>
      </div>

      {cartOpen ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            flexShrink: 0, display: 'flex', justifyContent: 'flex-end',
            padding: '14px 22px 0'
          }}>
            <button
              onClick={onCloseCart}
              style={{
                border: 'none', background: '#F8F5FF', color: '#6B7280',
                fontWeight: 700, fontSize: 13, padding: '9px 16px', borderRadius: 12, cursor: 'pointer'
              }}
            >← Continuer mes achats</button>
          </div>
          <KioskCartScreen cart={cart} onEdit={onEdit} onQty={onQty} onRemove={onRemove} />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <KioskCategoryRail cats={cats} selCat={selCat} onSelect={setSelCat} />
          <KioskProductGrid
            catName={catObj ? catObj.name : ''}
            prods={prods}
            catIcon={CAT_ICONS[selCat] || '🍽️'}
            stockOut={stockOut}
            onPick={onPick}
          />
        </div>
      )}

      <KioskBottomBar
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
