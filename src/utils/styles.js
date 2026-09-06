import { T } from '../data/theme.js';

export const card = (ex = {}) => ({
  background: T.bgCard,
  borderRadius: T.rMd,
  border: `1px solid ${T.brd}`,
  ...ex
});
export const btn = (bg, col, ex = {}) => ({
  padding: '11px 18px',
  borderRadius: T.rMd,
  border: 'none',
  background: bg,
  color: col,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  ...ex
});

// Etat "onglet actif" partage par toute la navigation : nav principale,
// categories, periodes, filtres. Un fond legerement teinte, jamais un
// remplissage plein ; les onglets inactifs restent presque invisibles.
export const segTab = (active, ex = {}) => ({
  background: active ? T.active : 'transparent',
  color: active ? T.txt : T.txtSub,
  fontWeight: active ? 600 : 500,
  opacity: active ? 1 : 0.62,
  border: 'none',
  borderRadius: T.rSm,
  cursor: 'pointer',
  ...ex
});
