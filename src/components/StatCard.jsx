import React from 'react';


export function StatCard({
  label,
  value,
  sub,
  color
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      padding: '16px 18px',
      border: '1px solid #ECE5F7',
      boxShadow: '0 2px 10px rgba(90,40,150,0.06)',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 4,
      height: '100%',
      background: color
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: '#9b8fb0',
      textTransform: 'uppercase',
      letterSpacing: 0.8
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 4,
      background: color
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 25,
      fontWeight: 900,
      color: '#2B1B45',
      paddingLeft: 8,
      marginTop: 6
    }
  }, value), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: '#9b8fb0',
      marginTop: 3,
      paddingLeft: 8
    }
  }, sub));
}


