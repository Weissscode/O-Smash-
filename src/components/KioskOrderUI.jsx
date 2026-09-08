import React from "react";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow/700.css";
import "@fontsource/barlow-condensed/700.css";
import {
  CATEGORY_IMAGES,
  imageUrl,
  productImage,
} from "../data/kioskCatalogue.js";
import { fp } from "../utils/format.js";
import "./kiosk.css";

export function KioskLogo({ onClick }) {
  return (
    <img
      className="k-logo"
      src={imageUrl("LOGO (1).png")}
      alt="O'Smash"
      onClick={onClick}
    />
  );
}

function Photo({ id, name, src }) {
  const url = src || productImage(id) || (id ? "/products/" + encodeURIComponent(id) + ".jpg" : null);
  const [missing, setMissing] = React.useState(false);
  React.useEffect(() => setMissing(false), [url]);
  return (
    <div className={"k-photo" + (!url || missing ? " k-photo-missing" : "")}>
      {url && !missing ? (
        <img
          src={url}
          alt={name}
          onError={() => setMissing(true)}
          loading="lazy"
        />
      ) : (
        <span>Photo à venir</span>
      )}
    </div>
  );
}

function ProductCard({ product, category, unavailable, onClick, selected }) {
  return (
    <button
      className="k-product"
      disabled={unavailable}
      onClick={onClick}
      aria-pressed={selected}
      aria-label={
        product.name +
        ", " +
        fp(product.price) +
        (unavailable ? ", indisponible" : "")
      }
    >
      <Photo id={product.id} name={product.name} src={product.image} />
      <div className="k-product-info">
        <span className="k-product-name">{product.name}</span>
        <span className="k-product-bottom">
          <strong>{fp(product.price)}</strong>
          <span className="k-add" aria-hidden="true">
            {selected ? "✓" : "+"}
          </span>
        </span>
      </div>
      {unavailable && <span className="k-unavailable">Indisponible</span>}
    </button>
  );
}

export function KioskWelcome({ onStart, onLogoTap, children }) {
  return (
    <main className="kiosk k-welcome" onClick={onStart}>
      <div className="k-welcome-top">
        <span>BIENVENUE CHEZ</span>
        <KioskLogo
          onClick={(e) => {
            e.stopPropagation();
            onLogoTap();
          }}
        />
      </div>
      <div className="k-welcome-copy">
        <span className="k-eyebrow">À VOUS DE CHOISIR</span>
        <h1>
          COMMANDEZ
          <br />
          ICI.
        </h1>
        <button
          className="k-primary k-start"
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
        >
          Commencer ma commande <span aria-hidden="true">+</span>
        </button>
        <p>Touchez l'écran pour commencer</p>
      </div>
      <div className="k-checker" aria-hidden="true" />
      <div className="k-welcome-footer">
        <span>Sur place ou à emporter</span>
        <span>Paiement en caisse</span>
      </div>
      {children}
    </main>
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
  onLogoTap,
}) {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const [abandon, setAbandon] = React.useState(false);
  const [details, setDetails] = React.useState(null);
  const editable = (i) =>
    /^(b-|bao-|r-|lo-|mk-|cr-|f-)/.test(i.pid) || i.pid === "si-frit";
  return (
    <main className="kiosk k-order">
      <header className="k-header">
        <KioskLogo onClick={onLogoTap} />
        <span>FAITES-VOUS PLAISIR.</span>
        <span className="k-header-note">Paiement en caisse</span>
      </header>
      {cartOpen ? (
        <section className="k-cart k-scroll">
          <button className="k-back" onClick={onCloseCart}>
            ‹ Continuer mes achats
          </button>
          <div className="k-section-heading">
            <h1>Votre commande</h1>
            <span>
              {count} article{count > 1 ? "s" : ""}
            </span>
          </div>
          {!cart.length && (
            <div className="k-empty">
              <h2>Votre panier est vide</h2>
              <button className="k-primary" onClick={onCloseCart}>
                Voir le menu
              </button>
            </div>
          )}
          {cart.map((item) => (
            <article className="k-cart-item" key={item.id}>
              <Photo
                id={item.pid}
                name={item.name}
                src={productImage(item.pid, item.cust?.inMenu)}
              />
              <div className="k-cart-description">
                <h2>{item.name}</h2>
                <strong>{fp(item.total)}</strong>
                <button
                  className="k-text-button"
                  onClick={() =>
                    editable(item) ? onEdit(item) : setDetails(item)
                  }
                >
                  Voir les détails
                </button>
                {item.cust?.drink && <p>{item.cust.drink}</p>}
              </div>
              <div className="k-quantity">
                <button
                  aria-label={"Retirer un " + item.name}
                  onClick={() =>
                    item.qty <= 1 ? onRemove(item.id) : onQty(item.id, -1)
                  }
                >
                  −
                </button>
                <span>{item.qty}</span>
                <button
                  aria-label={"Ajouter un " + item.name}
                  onClick={() => onQty(item.id, 1)}
                >
                  +
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="k-menu">
          <nav className="k-categories" aria-label="Catégories">
            {cats.map((c, index) => (
              <button
                key={c.id}
                aria-current={c.id === selCat ? "true" : undefined}
                onClick={() => setSelCat(c.id)}
              >
                {CATEGORY_IMAGES[c.id] && (
                  <img
                    className="k-category-photo"
                    src={imageUrl(CATEGORY_IMAGES[c.id])}
                    alt=""
                  />
                )}
                <span>{c.name}</span>
              </button>
            ))}
          </nav>
          <section className="k-catalogue k-scroll" key={selCat}>
            <div className="k-section-heading">
              <h1>{cats.find((c) => c.id === selCat)?.name}</h1>
              <span>
                {selCat === "menus" ? "FRITES + BOISSON" : "À LA CARTE"}
              </span>
            </div>
            <div className="k-grid">
              {prods.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  category={selCat}
                  unavailable={stockOut.includes(p.id)}
                  onClick={() => onPick(p)}
                />
              ))}
            </div>
            {!prods.length && <p>Aucun produit dans cette catégorie.</p>}
          </section>
        </div>
      )}
      <footer className="k-bottom">
        <button
          className="k-abandon"
          onClick={() => (cart.length ? setAbandon(true) : onAbandon())}
        >
          Abandonner
        </button>
        <button
          className="k-basket"
          onClick={onOpenCart}
          aria-label="Voir mon panier"
        >
          <span>Panier</span>
          <b>{count}</b>
        </button>
        <div className="k-total">
          <span>Total</span>
          <strong>{fp(cartTotal)}</strong>
        </div>
        <button className="k-primary" disabled={!cart.length} onClick={onPay}>
          Valider <span className="k-desktop">ma commande</span>
        </button>
      </footer>
      {abandon && (
        <KioskSheet
          title="Abandonner la commande ?"
          onCancel={() => setAbandon(false)}
        >
          <p>Votre panier sera vidé.</p>
          <div className="k-actions">
            <button className="k-secondary" onClick={() => setAbandon(false)}>
              Continuer mes achats
            </button>
            <button className="k-primary" onClick={onAbandon}>
              Abandonner
            </button>
          </div>
        </KioskSheet>
      )}
      {details && (
        <KioskSheet title={details.name} onCancel={() => setDetails(null)}>
          <p>
            {details.qty} × {fp(details.unit)}
          </p>
          <button className="k-primary" onClick={() => setDetails(null)}>
            Fermer
          </button>
        </KioskSheet>
      )}
    </main>
  );
}

export function KioskSheet({ title, subtitle, children, onCancel, footer }) {
  const dialog = React.useRef(null);
  const cancel = React.useRef(onCancel);
  cancel.current = onCancel;
  React.useEffect(() => {
    const previous = document.activeElement,
      el = dialog.current;
    el?.focus();
    const key = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancel.current?.();
      }
      if (e.key !== "Tab") return;
      const nodes = [
        ...el.querySelectorAll(
          'button:not(:disabled),input:not(:disabled),textarea,[tabindex="0"]',
        ),
      ];
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first || document.activeElement === el)
      ) {
        e.preventDefault();
        last?.focus();
      }
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    el?.addEventListener("keydown", key);
    return () => {
      el?.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return (
    <div className="kiosk k-overlay">
      <section
        className="k-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={dialog}
      >
        <div className="k-sheet-heading">
          <KioskLogo />
          <button className="k-close" onClick={onCancel} aria-label="Fermer">
            ×
          </button>
        </div>
        <div className="k-sheet-body">
          <h1>{title}</h1>
          {subtitle && <p className="k-subtitle">{subtitle}</p>}
          {children}
        </div>
        {footer && <div className="k-sheet-footer">{footer}</div>}
      </section>
    </div>
  );
}

export function KioskUpsell({
  draft,
  stockOut,
  onPick,
  onConfigure,
  onRemove,
  onSkip,
  onContinue,
}) {
  const total = draft.extras.reduce((s, i) => s + i.total, 0);
  return (
    <KioskSheet
      title="Un extra avec ça ?"
      subtitle="Complétez votre commande"
      onCancel={onSkip}
      footer={
        <div className="k-actions">
          <button className="k-secondary" onClick={onSkip}>
            Non merci
          </button>
          <button className="k-primary" onClick={onContinue}>
            Ajouter et continuer
          </button>
        </div>
      }
    >
      <div className="k-draft">
        <span>{draft.item.name}</span>
        <strong>{fp(draft.item.total)}</strong>
      </div>
      <div className="k-grid k-upsell-grid">
        {draft.suggestions.map((p) => {
          const selected = draft.extras.find((i) => i.pid === p.id);
          return (
            <div className="k-upsell-product" key={p.id}>
              <ProductCard
                product={{ ...p, price: selected?.unit ?? p.price }}
                category={p.category}
                selected={!!selected}
                unavailable={stockOut.includes(p.id)}
                onClick={() => (selected ? onRemove(p.id) : onPick(p))}
              />
              {selected && (p.id.startsWith("lo-") || p.hasSauce) && (
                <button
                  className="k-text-button"
                  onClick={() => onConfigure(p)}
                >
                  Personnaliser {p.name}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="k-selection" role="status">
        {draft.extras.length
          ? draft.extras.length + " extra(s) sélectionné(s), +" + fp(total)
          : "Les extras sont facultatifs."}
      </p>
    </KioskSheet>
  );
}

export function KioskConfirm({
  cart,
  cartTotal,
  clientName,
  setClientName,
  onCancel,
  onValidate,
}) {
  const [service, setService] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");
  const submitting = React.useRef(false);
  const submit = async () => {
    if (!service || submitting.current) return;
    submitting.current = true;
    setSending(true);
    setError("");
    try {
      await onValidate(service);
    } catch {
      setError("La commande n'a pas pu être enregistrée. Réessayez.");
      submitting.current = false;
      setSending(false);
    }
  };
  return (
    <KioskSheet
      title="Sur place ou à emporter ?"
      subtitle={
        cart.reduce((s, i) => s + i.qty, 0) + " articles · " + fp(cartTotal)
      }
      onCancel={() => !sending && onCancel()}
      footer={
        <div className="k-actions">
          <button className="k-secondary" disabled={sending} onClick={onCancel}>
            Annuler
          </button>
          <button
            className="k-primary"
            disabled={!service || sending}
            onClick={submit}
          >
            {sending ? "Enregistrement…" : "Valider ma commande"}
          </button>
        </div>
      }
    >
      <div className="k-service">
        {["Sur place", "A emporter"].map((s) => (
          <button
            key={s}
            disabled={sending}
            aria-pressed={service === s}
            onClick={() => setService(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <label className="k-label" htmlFor="k-client">
        Votre prénom <span>(facultatif)</span>
      </label>
      <input
        id="k-client"
        className="k-input"
        maxLength={80}
        value={clientName}
        disabled={sending}
        onChange={(e) => setClientName(e.target.value)}
        placeholder="Pour vous appeler quand c'est prêt"
      />
      <p className="k-payment-note">Vous réglerez votre commande en caisse.</p>
      {error && <p role="alert">{error}</p>}
    </KioskSheet>
  );
}

export function KioskSuccess({ order, onDone }) {
  return (
    <main className="kiosk k-success">
      <KioskLogo />
      <div className="k-success-body">
        <span className="k-eyebrow">
          {order.offline
            ? "COMMANDE EN ATTENTE DE TRANSMISSION"
            : "COMMANDE ENREGISTRÉE"}
        </span>
        <h1>#{order.num}</h1>
        <p>
          {order.offline
            ? "Présentez-vous en caisse : la connexion est interrompue et votre commande n'a pas encore été transmise."
            : "Présentez ce numéro en caisse pour régler et récupérer votre commande."}
        </p>
        <div className="k-success-total">
          <span>{order.service}</span>
          <strong>{fp(order.total)}</strong>
        </div>
        <button className="k-primary" onClick={onDone}>
          Terminer
        </button>
      </div>
      <div className="k-checker" aria-hidden="true" />
    </main>
  );
}
