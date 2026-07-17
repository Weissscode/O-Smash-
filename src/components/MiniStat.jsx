import React from 'react';


export function MiniStat({
  label,
  value,
  color
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 6,
      padding: '10px 12px',
      border: '1px solid #ECE5F7',
      boxShadow: '0 1px 6px rgba(90,40,150,0.05)',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 3,
      height: '100%',
      background: color
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9.5,
      fontWeight: 700,
      color: '#9b8fb0',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      paddingLeft: 6,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 900,
      color: '#2B1B45',
      paddingLeft: 6,
      marginTop: 2
    }
  }, value));
}


