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
        fontSize: 40 * scale,
        color: '#fff',
        WebkitTextStroke: `${1.5 * scale}px rgba(20,10,20,0.75)`,
        letterSpacing: 1 * scale,
        lineHeight: 1,
        textShadow: [
          `0 0 ${6 * scale}px #ff4d6d`,
          `0 0 ${14 * scale}px #ff4d6d`,
          `0 0 ${28 * scale}px #ff8fa3`
        ].join(', ')
      }
    }, 'VICE'),
    /*#__PURE__*/React.createElement('span', {
      style: {
        fontFamily: "'Permanent Marker', cursive",
        fontSize: 18 * scale,
        color: '#fff',
        WebkitTextStroke: `${0.8 * scale}px rgba(20,10,40,0.7)`,
        marginTop: -8 * scale,
        transform: 'rotate(-2deg)',
        textShadow: [
          `0 0 ${5 * scale}px #7c6cff`,
          `0 0 ${10 * scale}px #7c6cff`,
          `0 0 ${20 * scale}px #a78bfa`
        ].join(', ')
      }
    }, 'CODE')
  );
}
