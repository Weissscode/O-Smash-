import React from "react";
import {
  CB,
  DRINKS,
  FRITES_SAUCES,
  TWISTER_SUPPS,
  FRITES_SUPPS,
  LOADED_RETRAITS,
  LOADED_SUPPS,
  SIDES,
} from "../data/products.js";
import {
  createBurgerDraft,
  composerSteps,
  burgerLine,
  extraLine,
  composerLines,
  composerError,
} from "../data/kioskComposer.js";
import { getUpsellSuggestions } from "../data/kioskUpsell.js";
import { productImage } from "../data/kioskCatalogue.js";
import { KioskLogo } from "./KioskOrderUI.jsx";
import { fp } from "../utils/format.js";
import "./kiosk-composer.css";

const titles = {
  mode: "Burger seul ou menu ?",
  sauce: "Votre sauce burger",
  retraits: "Un ingrédient à retirer ?",
  supplements: "Un supplément dans le burger ?",
  fritesSauce: "La sauce de vos frites",
  fritesSupps: "Un supplément sur les frites ?",
  drink: "La boisson de votre menu",
  extras: "Un extra avec ça ?",
  recap: "Votre composition",
};
const optional = new Set([
  "sauce",
  "retraits",
  "supplements",
  "fritesSauce",
  "fritesSupps",
  "extras",
]);
const hints = {
  mode: "En menu : frites Twister et boisson pour 3 € de plus.",
  sauce: "Choisissez vos sauces, ou gardez la recette d'origine.",
  retraits: "Touchez uniquement ce que vous souhaitez enlever.",
  supplements: "Les suppléments sélectionnés s'ajoutent au prix.",
  fritesSauce: "Choisissez une sauce, ou passez cette étape.",
  fritesSupps: "À ajouter sur vos Twister, si vous en avez envie.",
  drink: "Une boisson est incluse. Choisissez celle qui vous plaît.",
  extras: "Facultatif. Vous pouvez continuer sans extra.",
  recap: "Vérifiez vos choix avant de les ajouter au panier.",
};
const toggle = (array, value) =>
  array.includes(value) ? array.filter((x) => x !== value) : [...array, value];

function Choice({ label, selected, price, image, disabled, onClick }) {
  return (
    <button
      type="button"
      className="kc-choice"
      aria-pressed={!!selected}
      disabled={disabled}
      onClick={onClick}
    >
      {image && <img src={image} alt="" />}
      <span>{label}</span>
      {price !== undefined && <strong>{fp(price)}</strong>}
      <span className="kc-selection-mark" aria-hidden="true">
        {selected ? "✓" : "+"}
      </span>
    </button>
  );
}
function Options({ options, selected, onPick, priced = false }) {
  return (
    <div className="kc-choices">
      {options.map((option) => {
        const label = typeof option === "string" ? option : option.l;
        return (
          <Choice
            key={label}
            label={label}
            selected={selected.includes(label)}
            price={priced ? option.p : undefined}
            onClick={() => onPick(label)}
          />
        );
      })}
    </div>
  );
}
function Details({ line }) {
  const c = line.cust || {};
  const details = [
    ...(c.sauces || []).map((x) => "Sauce " + x),
    ...(c.retraits || []),
    ...(c.supplements || []),
    ...(c.supps || []),
    ...(c.version ? [c.version] : []),
    ...(c.fritesSauce ? ["Sauce frites : " + c.fritesSauce] : []),
    ...(c.fritesSupps || []).map((x) => "Frites : " + x),
    ...(c.sauce ? ["Sauce : " + c.sauce] : []),
    ...(c.drink ? ["Boisson : " + c.drink] : []),
    ...(c.note ? ["Remarque : " + c.note] : []),
  ];
  return (
    <article className="kc-recap-line">
      <div>
        <h2>
          {line.qty > 1 ? line.qty + " × " : ""}
          {line.name}
        </h2>
        {c.inMenu && <p>Frites Twister incluses</p>}
        {details.length ? (
          <ul>
            {details.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
        ) : (
          <p>Recette d'origine</p>
        )}
      </div>
      <strong>{fp(line.total)}</strong>
    </article>
  );
}

export function KioskBurgerFlow({
  product,
  initial,
  inMenu = false,
  editId,
  qty = 1,
  cart,
  stockOut,
  onCancel,
  onCommit,
}) {
  const [draft, setDraft] = React.useState(() =>
    createBurgerDraft(initial, inMenu),
  );
  const [step, setStep] = React.useState("mode");
  const [extraPanel, setExtraPanel] = React.useState(null);
  const [error, setError] = React.useState("");
  const [cancelAsked, setCancelAsked] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const committing = React.useRef(false);
  const heading = React.useRef(null);
  const scroll = React.useRef(null);
  const steps = composerSteps(draft.inMenu);
  const index = steps.indexOf(step);
  const lines = composerLines(product, draft, qty);
  const total = Math.round(lines.reduce((n, p) => n + p.total, 0) * 100) / 100;
  const suggestions = getUpsellSuggestions(
    burgerLine(product, draft),
    stockOut,
    cart.filter((p) => p.id !== editId),
  );
  const extra = extraPanel && SIDES.find((p) => p.id === extraPanel.id);
  const extraLoaded = extra?.id.startsWith("lo-");
  const extraOptions = extra ? draft.extraOptions[extra.id] || {} : {};
  const setField = (key, value) => {
    setError("");
    setDraft((d) => ({ ...d, [key]: value }));
  };
  const flip = (key, value) =>
    setDraft((d) => ({ ...d, [key]: toggle(d[key], value) }));
  const setExtra = (key, value) =>
    setDraft((d) => ({
      ...d,
      extraOptions: {
        ...d.extraOptions,
        [extra.id]: { ...d.extraOptions[extra.id], [key]: value },
      },
    }));
  React.useEffect(() => {
    heading.current?.focus();
    scroll.current?.scrollTo(0, 0);
  }, [step, extraPanel?.id, extraPanel?.stage, cancelAsked]);
  const advance = () => {
    if (step === "drink") {
      const problem = composerError(
        product,
        { ...draft, extraIds: [] },
        stockOut,
      );
      if (problem) {
        setError(problem);
        return;
      }
    }
    setError("");
    setStep(steps[index + 1]);
  };
  const skip = () => {
    setError("");
    setStep(steps[index + 1]);
  };
  const back = () => {
    setError("");
    if (extraPanel) {
      setExtraPanel(extraPanel.stage ? { ...extraPanel, stage: 0 } : null);
      return;
    }
    if (index) setStep(steps[index - 1]);
    else setCancelAsked(true);
  };
  const submit = () => {
    if (committing.current) return;
    const problem = composerError(product, draft, stockOut);
    if (problem) {
      setError(problem);
      return;
    }
    committing.current = true;
    setSaving(true);
    try {
      onCommit(lines, editId);
    } catch (e) {
      committing.current = false;
      setSaving(false);
      setError(e.message || "Impossible d'ajouter ce produit. Réessayez.");
    }
  };
  const versionAllowed =
    !product.id.includes("veg") &&
    !product.id.includes("chik") &&
    !product.id.startsWith("bao-") &&
    !["b-avoc", "b-mncc", "b-mncb"].includes(product.id);
  return (
    <main className="kiosk kc-page">
      <header className="k-header">
        <KioskLogo />
        <span>À VOTRE GOÛT.</span>
        <button
          className="kc-cancel"
          disabled={saving}
          onClick={() => setCancelAsked(true)}
        >
          Quitter la composition
        </button>
      </header>
      <section className="kc-body" ref={scroll}>
        <div className="kc-context">
          <span>
            {product.name}
            {qty > 1 ? " · " + qty + " unités" : ""}
          </span>
          <span>
            {extraPanel
              ? "Extra · étape " + (extraPanel.stage + 1) + " sur 2"
              : "Étape " + (index + 1) + " sur " + steps.length}
          </span>
        </div>
        <progress
          aria-label="Progression de la composition"
          value={index + 1}
          max={steps.length}
        />
        <h1 ref={heading} tabIndex={-1}>
          {cancelAsked
            ? "Quitter cette composition ?"
            : extra
              ? extra.name +
                " : " +
                (extraPanel.stage === 0
                  ? extraLoaded
                    ? "vos retraits"
                    : "votre sauce"
                  : "vos suppléments")
              : titles[step]}
        </h1>
        {cancelAsked ? (
          <div className="kc-cancel-panel">
            <p>
              Vos choix en cours seront abandonnés. Le panier reste inchangé.
            </p>
            <button
              className="k-secondary"
              onClick={() => setCancelAsked(false)}
            >
              Reprendre la composition
            </button>
            <button className="k-primary" onClick={onCancel}>
              Quitter sans enregistrer
            </button>
          </div>
        ) : extra ? (
          <>
            <p className="kc-hint">
              Personnalisation facultative, dans votre composition.
            </p>
            {extraPanel.stage === 0 ? (
              extraLoaded ? (
                <Options
                  options={LOADED_RETRAITS}
                  selected={extraOptions.retraits || []}
                  onPick={(v) =>
                    setExtra("retraits", toggle(extraOptions.retraits || [], v))
                  }
                />
              ) : (
                <Options
                  options={FRITES_SAUCES}
                  selected={[extraOptions.sauce]}
                  onPick={(v) =>
                    setExtra("sauce", extraOptions.sauce === v ? "" : v)
                  }
                />
              )
            ) : (
              <>
                <Options
                  priced
                  options={extraLoaded ? LOADED_SUPPS : FRITES_SUPPS}
                  selected={
                    extraOptions[extraLoaded ? "supplements" : "supps"] || []
                  }
                  onPick={(v) => {
                    const key = extraLoaded ? "supplements" : "supps";
                    setExtra(key, toggle(extraOptions[key] || [], v));
                  }}
                />
                {extraLoaded && (
                  <label className="kc-note">
                    Une remarque pour cet extra ?
                    <textarea
                      maxLength={250}
                      value={extraOptions.note || ""}
                      onChange={(e) => setExtra("note", e.target.value)}
                    />
                  </label>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <p className="kc-hint">{hints[step]}</p>
            {step === "mode" && (
              <>
                <div className="kc-choices kc-mode">
                  <Choice
                    label="Burger seul"
                    image={productImage(product.id)}
                    price={product.price}
                    selected={!draft.inMenu}
                    onClick={() => setField("inMenu", false)}
                  />
                  <Choice
                    label="En menu"
                    image={productImage(product.id, true)}
                    price={product.price + 3}
                    selected={draft.inMenu}
                    onClick={() => setField("inMenu", true)}
                  />
                </div>
                {versionAllowed && (
                  <>
                    <h2 className="kc-subtitle">Votre version</h2>
                    <div className="kc-choices">
                      <Choice
                        label="Steak (recette d'origine)"
                        selected={!draft.version}
                        onClick={() => setField("version", "")}
                      />
                      <Choice
                        label="Version Chicken"
                        selected={draft.version === "Chicken"}
                        onClick={() => setField("version", "Chicken")}
                      />
                    </div>
                  </>
                )}
              </>
            )}
            {step === "sauce" && (
              <Options
                options={CB.sauces}
                selected={draft.sauces}
                onPick={(v) => flip("sauces", v)}
              />
            )}
            {step === "retraits" && (
              <Options
                options={CB.retraits}
                selected={draft.retraits}
                onPick={(v) => flip("retraits", v)}
              />
            )}
            {step === "supplements" && (
              <Options
                priced
                options={CB.supps}
                selected={draft.supplements}
                onPick={(v) => flip("supplements", v)}
              />
            )}
            {step === "fritesSauce" && (
              <Options
                options={FRITES_SAUCES}
                selected={[draft.twisterSauce]}
                onPick={(v) =>
                  setField("twisterSauce", draft.twisterSauce === v ? "" : v)
                }
              />
            )}
            {step === "fritesSupps" && (
              <Options
                priced
                options={TWISTER_SUPPS}
                selected={draft.twisterSupps}
                onPick={(v) => flip("twisterSupps", v)}
              />
            )}
            {step === "drink" && (
              <div className="kc-choices">
                {DRINKS.map((p) => (
                  <Choice
                    key={p.id}
                    label={p.name}
                    selected={draft.drink === p.name}
                    disabled={stockOut.includes(p.id)}
                    onClick={() => setField("drink", p.name)}
                  />
                ))}
              </div>
            )}
            {step === "extras" && (
              <>
                <div className="kc-choices">
                  {suggestions.map((p) => (
                    <div className="kc-extra" key={p.id}>
                      <Choice
                        label={p.name}
                        image={productImage(p.id)}
                        price={extraLine(p, draft.extraOptions[p.id]).unit}
                        selected={draft.extraIds.includes(p.id)}
                        onClick={() => flip("extraIds", p.id)}
                      />
                      {draft.extraIds.includes(p.id) &&
                        (p.id.startsWith("lo-") || p.hasSauce) && (
                          <button
                            className="kc-personalize"
                            onClick={() =>
                              setExtraPanel({ id: p.id, stage: 0 })
                            }
                          >
                            Personnaliser {p.name}
                          </button>
                        )}
                    </div>
                  ))}
                </div>
                {!suggestions.length && (
                  <p>Aucun extra disponible pour cette composition.</p>
                )}
                {draft.extraIds
                  .filter((id) => !suggestions.some((p) => p.id === id))
                  .map((id) => (
                    <button
                      key={id}
                      className="k-secondary"
                      onClick={() => flip("extraIds", id)}
                    >
                      Retirer{" "}
                      {SIDES.find((p) => p.id === id)?.name || "cet extra"} de
                      la sélection
                    </button>
                  ))}
              </>
            )}
            {step === "recap" && (
              <>
                <div className="kc-recap">
                  {lines.map((line, i) => (
                    <Details key={i} line={line} />
                  ))}
                </div>
                <label className="kc-note">
                  Une remarque pour votre burger ? (facultatif)
                  <textarea
                    maxLength={250}
                    value={draft.note}
                    onChange={(e) => setField("note", e.target.value)}
                  />
                </label>
              </>
            )}
          </>
        )}
        {error && (
          <p className="kc-error" role="alert">
            {error}
          </p>
        )}
      </section>
      {!cancelAsked && (
        <footer className="kc-footer">
          <div className="kc-total">
            <span>Total de la composition</span>
            <strong>{fp(total)}</strong>
          </div>
          <div className="kc-navigation">
            <button className="k-secondary" disabled={saving} onClick={back}>
              Retour
            </button>
            {(extraPanel || optional.has(step)) && (
              <button
                className="kc-skip"
                onClick={
                  extraPanel
                    ? () =>
                        setExtraPanel(
                          extraPanel.stage ? null : { ...extraPanel, stage: 1 },
                        )
                    : skip
                }
              >
                Passer
              </button>
            )}
            <button
              className="k-primary"
              disabled={saving || (step === "drink" && !draft.drink)}
              onClick={
                extraPanel
                  ? () =>
                      setExtraPanel(
                        extraPanel.stage ? null : { ...extraPanel, stage: 1 },
                      )
                  : step === "recap"
                    ? submit
                    : advance
              }
            >
              {saving
                ? "Enregistrement…"
                : extraPanel
                  ? extraPanel.stage
                    ? "Revenir aux extras"
                    : "Continuer"
                  : step === "recap"
                    ? editId
                      ? "Enregistrer les modifications"
                      : "Ajouter au panier"
                    : "Continuer"}
            </button>
          </div>
        </footer>
      )}
    </main>
  );
}
