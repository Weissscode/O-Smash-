import React from 'react';
import { T } from '../data/theme.js';

export function Chip({
  label,
  active,
  onClick,
  clr = T.primary
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      padding: '11px 14px',
      borderRadius: 6,
      fontSize: 15,
      fontWeight: 500,
      cursor: 'pointer',
      border: `1px solid ${active ? T.txtMuted : T.brd}`,
      background: active ? T.primaryL : T.bgCard,
      color: active ? T.txt : T.txtSub,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, label);
}
