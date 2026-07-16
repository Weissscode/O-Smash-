import React from 'react';


export function PieChart({
  data,
  size,
  centerLabel
}) {
  size = size || 130;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const strokeW = size * 0.16;
  const r = size / 2 - strokeW / 2 - 2;
  const cx = size / 2,
    cy = size / 2;
  let acc = 0;
  const circumference = 2 * Math.PI * r;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: `0 0 ${size} ${size}`,
    style: {
      transform: 'rotate(-90deg)'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: r,
    fill: "none",
    stroke: "#F0EAFB",
    strokeWidth: strokeW
  }), data.map((d, i) => {
    const frac = d.value / total;
    const dash = frac * circumference;
    const gap = circumference - dash;
    const offset = -acc * circumference;
    acc += frac;
    return /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: cx,
      cy: cy,
      r: r,
      fill: "none",
      stroke: d.color,
      strokeWidth: strokeW,
      strokeDasharray: `${dash} ${gap}`,
      strokeDashoffset: offset,
      strokeLinecap: data.length > 1 ? 'butt' : 'round'
    });
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: size * 0.15,
      fontWeight: 900,
      color: '#3B1578',
      lineHeight: 1
    }
  }, centerLabel || total), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: size * 0.07,
      fontWeight: 700,
      color: '#8b7aa8',
      marginTop: 2
    }
  }, "total"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flex: 1,
      minWidth: 120
    }
  }, data.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 3,
      background: d.color,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#5a4a78',
      fontWeight: 700,
      flex: 1
    }
  }, d.label), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#3B1578',
      fontWeight: 900
    }
  }, total > 0 ? Math.round(d.value / total * 100) : 0, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5,
      borderRadius: 3,
      background: '#F0EAFB',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: (total > 0 ? Math.round(d.value / total * 100) : 0) + '%',
      background: d.color,
      borderRadius: 3
    }
  }))))));
}

