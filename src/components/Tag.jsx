import React from 'react';

export function Tag({
  label,
  color
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      alignSelf: 'flex-start',
      padding: '2px 0',
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 600,
      background: 'transparent',
      color: '#62666B',
      letterSpacing: 0.5,
      textTransform: 'uppercase'
    }
  }, label);
}
