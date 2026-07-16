import React from 'react';


export function BarChart({
  data,
  color,
  height
}) {
  height = height || 130;
  const max = Math.max(1, ...data.map(d => d.value));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 6,
      height: height,
      padding: '0 2px'
    }
  }, data.map((d, i) => {
    const pct = Math.max(2, d.value / max * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%'
      }
    }, d.value > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 800,
        color: color,
        marginBottom: 3,
        whiteSpace: 'nowrap'
      }
    }, d.valueLabel || d.value), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        maxWidth: 34,
        height: pct + '%',
        minHeight: 3,
        borderRadius: '7px 7px 3px 3px',
        background: `linear-gradient(180deg,${color},${color}99)`
      }
    }));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginTop: 5,
      padding: '0 2px'
    }
  }, data.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 9.5,
      color: '#8b7aa8',
      fontWeight: 700,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, d.label))));
}

