import React from 'react';
import { T } from '../data/theme.js';
import { useProductStyles } from './useProductStyles.js';

export function Chip({
  label,
  active,
  onClick,
  clr = T.primary
}) {
  const { T: theme } = useProductStyles();
  if (theme.kiosk) return <button aria-pressed={!!active} onClick={onClick} className="k-option">{label}</button>;
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      padding: '11px 14px',
      borderRadius: 6,
      fontSize: 15,
      fontWeight: active ? 700 : 500,
      cursor: 'pointer',
      border: active ? `2px solid ${clr}` : `1.5px solid ${T.brd}`,
      background: active ? `${clr}12` : T.bgCard,
      color: active ? clr : T.txtSub,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, label);
}
