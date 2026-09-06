// Palette neutre chaude. La couleur ne decore pas, elle porte une information :
// vert = especes, bleu = carte, rouge = echec ou destructif, encre = action principale.
export const T = {
  // Encre : actions principales, etats actifs, chiffres mis en avant
  primary: '#23201D',
  primaryD: '#12100E',
  primaryL: '#EFECE7',
  primaryLL: '#F7F5F2',

  // Rouge de marque, reserve aux rares accents identitaires
  accent: '#B0342C',

  white: '#FFFFFF',

  // Surfaces
  bg: '#F4F2EF',
  bgCard: '#FFFFFF',
  bgSide: '#EDEAE5',

  // Texte
  txt: '#1A1815',
  txtSub: '#57534E',
  txtMuted: '#8A837C',

  // Traits de separation, a la place des ombres
  brd: '#DDD8D1',
  brdL: '#EAE6E0',

  // Semantique
  ok: '#15703F',
  okL: '#E6F0E9',
  no: '#B3271E',
  noL: '#F9E9E7',
  warn: '#8A5A0B',
  warnL: '#F5EDE0',
  info: '#1F4E9C',
  infoL: '#E8EEF7',

  // Rayons hierarchises : vif sur les barres pleine largeur, doux sur les cartes,
  // pilule uniquement sur les etiquettes.
  rSm: 4,
  rMd: 8,
  rLg: 12,
  rPill: 999,

  // Une seule ombre dans toute l'app : celle des elements qui flottent reellement
  // au dessus du contenu (modales).
  shModal: '0 12px 32px rgba(20,18,16,0.18)',

  // Chiffres alignes en colonne (paniers, tickets, tableaux)
  fontMono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace"
};
