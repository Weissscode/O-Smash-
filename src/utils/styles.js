import { T } from '../data/theme.js';

export const card = (ex = {}) => ({
  background: T.bgCard,
  borderRadius: 14,
  border: `1px solid ${T.brd}`,
  boxShadow: T.sh,
  ...ex
});
export const btn = (bg, col, ex = {}) => ({
  padding: '11px 18px',
  borderRadius: 10,
  border: 'none',
  background: bg,
  color: col,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  ...ex
});
