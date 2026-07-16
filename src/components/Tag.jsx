import React from 'react';

export function Tag({
  label,
  color
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      padding: '2px 9px',
      borderRadius: 6,
      fontSize: 10,
      fontWeight: 700,
      background: `${color}16`,
      color,
      letterSpacing: 0.5,
      textTransform: 'uppercase'
    }
  }, label);
}
