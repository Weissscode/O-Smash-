import React from 'react';

// Outline icons share the navigation's current text color.
const paths = {
  pos: 'M4 4h16v10H4z M8 18h8 M6 21h12 M12 14v4 M7 8h5',
  telephone: 'M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a14 14 0 0 1-7-7l2-2z',
  stock: 'M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10 M7 5l9 4',
  dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  analytics: 'M4 3v18h17 M8 16v-5 M13 16V6 M18 16V9',
  burger: 'M4 9a8 6 0 0 1 16 0z M3 13h18 M4 17h16v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z M9 6h.01 M14 5h.01',
  bao: 'M12 3C9 7 3 7 3 14a7 6 0 0 0 7 6h4a7 6 0 0 0 7-6c0-7-6-7-9-11z M12 3c-3 6-4 7-4 10 M12 3c3 6 4 7 4 10 M12 4v8',
  formule: 'M3 19h18 M5 16a7 7 0 0 1 14 0z M12 7V4 M10 4h4',
  riz: 'M3 12h18a9 8 0 0 1-18 0z M8 20h8 M7 8c-2-2 2-3 0-5 M12 8c-2-2 2-3 0-5 M17 8c-2-2 2-3 0-5',
  sides: 'M5 10l2 11h10l2-11 M5 10c4 3 10 3 14 0 M7 10V4h3v7 M11 11V2h3v9 M15 11V5h3v5',
  desserts: 'M4 11h16v9H4z M4 11l13-7 3 7 M4 15h16 M13 6V3',
  boissons: 'M5 6h14l-2 15H7z M4 6h16 M12 6l2-4h5',
  milkshake: 'M6 10h12l-2 11H8z M5 10h14 M7 9a5 5 0 0 1 10 0 M14 4l2-3 M10 13v5 M14 13v5',
  crepes: 'M3 18L12 3l9 15c-6 4-12 4-18 0z M12 3l3 15 M8 13l3 2',
  divers: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M17 14v6 M14 17h6'
};
export function PosIcon({ name, size = 19 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[name] || paths.divers} /></svg>;
}
