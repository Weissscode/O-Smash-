import React from 'react';
import { T } from '../data/theme.js';

export function SL({
  title,
  color = T.primary
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color,
      letterSpacing: 1.5,
      textTransform: 'uppercase'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: T.brd
    }
  }));
}
