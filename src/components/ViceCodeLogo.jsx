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
        display: 'inline-block',
        transform: 'skewX(-10deg)',
        textShadow: [
          `0 ${1 * scale}px ${1 * scale}px rgba(40,10,20,0.2)`,
          `0 0 ${10 * scale}px #ff6688`,
          `0 0 ${24 * scale}px #ff8fa8`,
          `0 0 ${48 * scale}px #ffc2d1`,
          `0 0 ${80 * scale}px #ffd6e0`
        ].join(', ')
      }
    }, 'VICE'),
    /*#__PURE__*/React.createElement('span', {
      style: {
        fontFamily: "'Permanent Marker', cursive",
        fontSize: 20 * scale,
        color: '#fff',
        marginTop: -14 * scale,
        transform: 'rotate(-3deg)',
        textShadow: [
          `0 ${1 * scale}px ${1 * scale}px rgba(30,10,60,0.2)`,
          `0 0 ${8 * scale}px #9d8cff`,
          `0 0 ${18 * scale}px #ab9bff`,
          `0 0 ${36 * scale}px #cdc2ff`
        ].join(', ')
      }
    }, 'CODE')
  );
}
