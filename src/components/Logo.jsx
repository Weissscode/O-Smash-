import React from 'react';
import { LOGO_SRC } from '../assets/logo.js';

export function Logo({
  size = 60
}) {
  return /*#__PURE__*/React.createElement("img", {
    src: LOGO_SRC,
    style: {
      height: size,
      width: 'auto',
      flexShrink: 0,
      mixBlendMode: 'screen'
    },
    alt: "O'Smash"
  });
}
