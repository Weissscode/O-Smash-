import React from 'react';

const base = (size, strokeWidth) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
});

export const IconMoney = ({ size = 20, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('circle', { cx: 12, cy: 12, r: 9 }),
  /*#__PURE__*/React.createElement('path', { d: 'M9.5 15.5c0 1 .9 1.5 2.5 1.5s2.5-.6 2.5-1.7c0-1-.8-1.4-2.5-1.8-1.7-.4-2.5-.9-2.5-1.8 0-1 .9-1.7 2.5-1.7s2.5.5 2.5 1.5' }),
  /*#__PURE__*/React.createElement('path', { d: 'M12 7.5v1.2M12 15.3v1.2' })
);

export const IconReceipt = ({ size = 20, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3z' }),
  /*#__PURE__*/React.createElement('path', { d: 'M9 8h6M9 12h6M9 16h4' })
);

export const IconBag = ({ size = 20, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M6 8h12l-1 12H7L6 8z' }),
  /*#__PURE__*/React.createElement('path', { d: 'M9 8V6a3 3 0 0 1 6 0v2' })
);

export const IconCash = ({ size = 20, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('rect', { x: 2.5, y: 6.5, width: 19, height: 11, rx: 2 }),
  /*#__PURE__*/React.createElement('circle', { cx: 12, cy: 12, r: 2.6 })
);

export const IconCard = ({ size = 20, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('rect', { x: 2.5, y: 5, width: 19, height: 14, rx: 2.2 }),
  /*#__PURE__*/React.createElement('path', { d: 'M2.5 10h19' }),
  /*#__PURE__*/React.createElement('path', { d: 'M6 15h4' })
);

export const IconClock = ({ size = 16, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('circle', { cx: 12, cy: 12, r: 9 }),
  /*#__PURE__*/React.createElement('path', { d: 'M12 7v5l3.2 2' })
);

export const IconPhone = ({ size = 16, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M5 4h3.2l1.3 4.2-2 1.6a13 13 0 0 0 6.7 6.7l1.6-2 4.2 1.3V19a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4z' })
);

export const IconClose = ({ size = 20, strokeWidth = 2.2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M6 6l12 12M18 6L6 18' })
);

export const IconChevronLeft = ({ size = 18, strokeWidth = 2.2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M15 5l-7 7 7 7' })
);

export const IconChevronRight = ({ size = 18, strokeWidth = 2.2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M9 5l7 7-7 7' })
);

export const IconTrash = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M4 7h16' }),
  /*#__PURE__*/React.createElement('path', { d: 'M9 7V4.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V7' }),
  /*#__PURE__*/React.createElement('path', { d: 'M6 7l1 13a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4L18 7' }),
  /*#__PURE__*/React.createElement('path', { d: 'M10 11v6M14 11v6' })
);

export const IconEdit = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M4 20l.9-3.6L16.4 5a1.5 1.5 0 0 1 2.1 0l1.5 1.5a1.5 1.5 0 0 1 0 2.1L8.5 20 4 20z' }),
  /*#__PURE__*/React.createElement('path', { d: 'M14.5 6.9l2.6 2.6' })
);

export const IconCalendar = ({ size = 16, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('rect', { x: 3.5, y: 5, width: 17, height: 15.5, rx: 2 }),
  /*#__PURE__*/React.createElement('path', { d: 'M3.5 9.5h17' }),
  /*#__PURE__*/React.createElement('path', { d: 'M8 3v4M16 3v4' })
);

export const IconCheck = ({ size = 14, strokeWidth = 2.4 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M5 12.5l4.5 4.5L19 7' })
);

export const IconChevronDown = ({ size = 16, strokeWidth = 2.2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M5 9l7 7 7-7' })
);

export const IconSun = ({ size = 20, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('circle', { cx: 12, cy: 12, r: 4.5 }),
  /*#__PURE__*/React.createElement('path', { d: 'M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1' })
);

export const IconMoon = ({ size = 20, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M20 14.2A8.5 8.5 0 1 1 9.8 4a7 7 0 0 0 10.2 10.2z' })
);

export const IconTrendUp = ({ size = 16, strokeWidth = 2.4 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M3 16l6.5-6.5L14 14l7-7' }),
  /*#__PURE__*/React.createElement('path', { d: 'M15 7h6v6' })
);

export const IconTrendDown = ({ size = 16, strokeWidth = 2.4 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M3 8l6.5 6.5L14 10l7 7' }),
  /*#__PURE__*/React.createElement('path', { d: 'M15 17h6v-6' })
);

export const IconTrophy = ({ size = 20, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M7 4h10v5a5 5 0 0 1-10 0V4z' }),
  /*#__PURE__*/React.createElement('path', { d: 'M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4' }),
  /*#__PURE__*/React.createElement('path', { d: 'M12 14v3M9 20h6M9 17.5h6' })
);

// --- Navigation principale (header) --------------------------------------

// Caisse : silhouette de caisse enregistreuse (tiroir + afficheur).
export const IconTill = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('rect', { x: 4, y: 10.5, width: 16, height: 8.5, rx: 1.4 }),
  /*#__PURE__*/React.createElement('path', { d: 'M6.5 10.5V7a1.4 1.4 0 0 1 1.4-1.4h8.2A1.4 1.4 0 0 1 17.5 7v3.5' }),
  /*#__PURE__*/React.createElement('rect', { x: 9, y: 7.4, width: 6, height: 2.2, rx: 0.5 }),
  /*#__PURE__*/React.createElement('path', { d: 'M7.5 14.5h9M9.5 17.2h5' })
);

// Stock : carton ouvert.
export const IconBox = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M4 9.5l8-4 8 4-8 4-8-4z' }),
  /*#__PURE__*/React.createElement('path', { d: 'M4 9.5V17l8 4 8-4V9.5' }),
  /*#__PURE__*/React.createElement('path', { d: 'M12 13.5V21' })
);

// Dashboard : vue d'ensemble en quadrants.
export const IconGrid = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('rect', { x: 4, y: 4, width: 7, height: 7, rx: 1 }),
  /*#__PURE__*/React.createElement('rect', { x: 13, y: 4, width: 7, height: 7, rx: 1 }),
  /*#__PURE__*/React.createElement('rect', { x: 4, y: 13, width: 7, height: 7, rx: 1 }),
  /*#__PURE__*/React.createElement('rect', { x: 13, y: 13, width: 7, height: 7, rx: 1 })
);

// Analytics : barres de progression dans le temps.
export const IconBars = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M4 20V4M4 20h16' }),
  /*#__PURE__*/React.createElement('path', { d: 'M7.5 16.5v-4M11.5 16.5v-7M15.5 16.5v-2.5M19.5 16.5V9' })
);

// --- Categories produits ---------------------------------------------------

// Burgers : bun, steak, bun.
export const IconBurger = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M4.5 10.5C4.5 7 8 4.5 12 4.5s7.5 2.5 7.5 6' }),
  /*#__PURE__*/React.createElement('path', { d: 'M3.5 12.2h17' }),
  /*#__PURE__*/React.createElement('path', { d: 'M3.5 15.3h17' }),
  /*#__PURE__*/React.createElement('path', { d: 'M4 17.6a1.4 1.4 0 0 0 1.4 1.4h13.2A1.4 1.4 0 0 0 20 17.6' })
);

// BAO : bun vapeur avec pli au sommet.
export const IconBao = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M4 13.5C4 9 7.6 6 12 6s8 3 8 7.5' }),
  /*#__PURE__*/React.createElement('path', { d: 'M3.5 13.5h17c0 3.3-3.8 5.8-8.5 5.8s-8.5-2.5-8.5-5.8z' }),
  /*#__PURE__*/React.createElement('path', { d: 'M10 6.3q2-1.6 4 0' })
);

// Formules : plateau repas a deux compartiments.
export const IconTray = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('rect', { x: 3.5, y: 6, width: 17, height: 13, rx: 1.6 }),
  /*#__PURE__*/React.createElement('path', { d: 'M12 6v13' }),
  /*#__PURE__*/React.createElement('path', { d: 'M7 9.5h2.2M14.8 9.5H17' })
);

// Riz Crousty : bol avec vapeur.
export const IconRiceBowl = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M3.5 12h17a8.5 4.6 0 0 1-17 0z' }),
  /*#__PURE__*/React.createElement('path', { d: 'M4.5 12a7.5 3.6 0 0 1 15 0' }),
  /*#__PURE__*/React.createElement('path', { d: 'M10 4.5q.8 1-.2 2M14.2 4.5q.8 1-.2 2' })
);

// Sides : cornet de frites.
export const IconFries = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M6.5 10h11l-1.3 9.3a1.4 1.4 0 0 1-1.4 1.2H9.2a1.4 1.4 0 0 1-1.4-1.2L6.5 10z' }),
  /*#__PURE__*/React.createElement('path', { d: 'M8 10V5.8M11 10V4.5M13 10V4.5M16 10V5.8' })
);

// Desserts : part de gateau.
export const IconDessert = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M4 19l8-13 8 13z' }),
  /*#__PURE__*/React.createElement('path', { d: 'M4 19h16' }),
  /*#__PURE__*/React.createElement('path', { d: 'M8.8 11.5h6.4' }),
  /*#__PURE__*/React.createElement('circle', { cx: 12, cy: 5, r: 1 })
);

// Boissons : gobelet et paille.
export const IconCup = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M6.5 8h11l-1.1 11.2A1.5 1.5 0 0 1 14.9 20H9.1a1.5 1.5 0 0 1-1.5-1.8L6.5 8z' }),
  /*#__PURE__*/React.createElement('path', { d: 'M5.5 8h13' }),
  /*#__PURE__*/React.createElement('path', { d: 'M14.5 8l1-4.5' })
);

// Milkshakes : gobelet dome avec paille coudee.
// Dome bombe (contrairement au gobelet a bord plat des boissons) + tourbillon,
// pour rester lisible a 18px sans se confondre avec IconCup.
export const IconMilkshake = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M7.3 10.2h9.4l-1 8.6a1.4 1.4 0 0 1-1.4 1.2H9.7a1.4 1.4 0 0 1-1.4-1.2l-1-8.6z' }),
  /*#__PURE__*/React.createElement('path', { d: 'M6.2 10.2a5.8 3 0 0 1 11.6 0z' }),
  /*#__PURE__*/React.createElement('path', { d: 'M9.6 6.6q1.2-1.1 2.4 0t2.4 0' }),
  /*#__PURE__*/React.createElement('path', { d: 'M13.6 6.8l1.2-3.4' })
);

// Crepes : demi-cercle plie avec filet de garniture.
export const IconCrepe = ({ size = 18, strokeWidth = 2 }) => /*#__PURE__*/React.createElement('svg', base(size, strokeWidth),
  /*#__PURE__*/React.createElement('path', { d: 'M4 12a8 8 0 0 1 16 0z' }),
  /*#__PURE__*/React.createElement('path', { d: 'M4 12h16' }),
  /*#__PURE__*/React.createElement('path', { d: 'M8 9.3q2-1.2 4 0t4 0' })
);
