import React from 'react';
import { LOGO_SRC } from '../assets/logo.js';

export function Logo({
  size = 60,
  blendMode = 'screen'
}) {
  return /*#__PURE__*/React.createElement("img", {
    src: LOGO_SRC,
    style: {
      height: size,
      width: 'auto',
      flexShrink: 0,
      mixBlendMode: blendMode
    },
    alt: "O'Smash"
  });
}
