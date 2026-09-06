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
