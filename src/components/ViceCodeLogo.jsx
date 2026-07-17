import React from 'react';

export function ViceCodeLogo({ scale = 1 }) {
  return /*#__PURE__*/React.createElement('div', {
    style: {
      position: 'relative',
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: `${8 * scale}px ${4 * scale}px ${14 * scale}px`
    }
  },
    /*#__PURE__*/React.createElement('span', {
      style: {
        fontFamily: "'Anton', sans-serif",
        fontSize: 44 * scale,
        color: '#fff',
        letterSpacing: 0.5 * scale,
        lineHeight: 1,
        textShadow: [
          `0 ${1 * scale}px ${2 * scale}px rgba(40,10,20,0.35)`,
          `0 0 ${8 * scale}px #ff5577`,
          `0 0 ${18 * scale}px #ff5577`,
          `0 0 ${34 * scale}px #ffb3c1`
        ].join(', ')
      }
    }, 'VICE'),
    /*#__PURE__*/React.createElement('span', {
      style: {
        fontFamily: "'Permanent Marker', cursive",
        fontSize: 20 * scale,
        color: '#fff',
        marginTop: -12 * scale,
        transform: 'rotate(-3deg)',
        textShadow: [
          `0 ${1 * scale}px ${1 * scale}px rgba(30,10,60,0.35)`,
          `0 0 ${6 * scale}px #8b7bff`,
          `0 0 ${12 * scale}px #8b7bff`,
          `0 0 ${24 * scale}px #c4b5fd`
        ].join(', ')
      }
    }, 'CODE')
  );
}
