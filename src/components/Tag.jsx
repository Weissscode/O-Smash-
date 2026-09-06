import React from 'react';

export function Tag({
  label,
  color
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      alignSelf: 'flex-start',
      padding: '2px 8px',
      borderRadius: 3,
      fontSize: 9,
      fontWeight: 600,
      background: `${color}12`,
      color,
      letterSpacing: 0.7,
      textTransform: 'uppercase'
    }
  }, label);
}
