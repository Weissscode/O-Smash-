// Palette neutre, proche d'un vrai logiciel de caisse : la couleur ne decore
// pas, elle porte une information (vert = especes, bleu = carte, rouge =
// echec ou destructif, encre = action principale, gris-bleu = etat selectionne).
export const T = {
  // Encre : actions principales, etats actifs, chiffres mis en avant
  primary: '#171717',
  primaryD: '#0F0F0F',
  primaryL: '#ECECEA',
  primaryLL: '#F7F7F6',

  // Rouge de marque, reserve aux rares accents identitaires (ex: jour courant)
  accent: '#B0342C',

  white: '#FFFFFF',

  // Surfaces
  bg: '#F6F6F4',
  bgCard: '#FFFFFF',
  bgSide: '#EFEEEC',

  // Fond legerement teinte des onglets/filtres selectionnes : nav principale,
  // categories, periodes. Jamais un remplissage plein.
  active: '#E8ECF3',

  // Texte
  txt: '#171717',
  txtSub: '#6B6B6B',
  txtMuted: '#9A9A97',

  // Traits de separation, a la place des ombres
  brd: '#E1DFDB',
  brdL: '#EBEAE7',

  // Semantique
  ok: '#15703F',
  okL: '#E6F0E9',
  no: '#B3271E',
  noL: '#F9E9E7',
  warn: '#8A5A0B',
  warnL: '#F5EDE0',
  info: '#1F4E9C',
  infoL: '#E8EEF7',

  // Rayons hierarchises, jamais au-dela de 8px : dense et sobre plutot que
  // "arrondi app mobile".
  rSm: 4,
  rMd: 6,
  rLg: 8,
  rPill: 999,

  // Une seule ombre dans toute l'app : celle des elements qui flottent reellement
  // au dessus du contenu (modales).
  shModal: '0 12px 32px rgba(20,18,16,0.18)'
};
