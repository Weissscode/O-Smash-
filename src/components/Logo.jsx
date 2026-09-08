import React from 'react';

export function Logo({
  size = 60
}) {
  return /*#__PURE__*/React.createElement("img", {
    src: "/osmash-logo.png",
    style: {
      height: size,
      width: 'auto',
      flexShrink: 0
    },
    alt: "O'Smash"
  });
}
