import React from 'react';


export function AreaChart({
  data,
  color,
  height,
  gradId
}) {
  height = height || 160;
  gradId = gradId || 'ag' + Math.random().toString(36).slice(2, 8);
  const max = Math.max(1, ...data.map(d => d.value));
  const n = data.length;
  const stepX = 100 / Math.max(1, n - 1);
  const padBottom = 22;
  const pts = data.map((d, i) => {
    const x = i * stepX;
    const y = height - padBottom - d.value / max * (height - padBottom - 10);
    return [x, y];
  });
  const linePath = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1]).join(' ');
  const areaPath = linePath + ` L${pts[pts.length - 1][0]},${height - padBottom} L${pts[0][0]},${height - padBottom} Z`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 100 ${height}`,
    preserveAspectRatio: "none",
    style: {
      width: '100%',
      height: height,
      display: 'block',
      overflow: 'visible'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: gradId,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: color,
    stopOpacity: "0.45"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: color,
    stopOpacity: "0.02"
  }))), /*#__PURE__*/React.createElement("path", {
    d: areaPath,
    fill: `url(#${gradId})`
  }), /*#__PURE__*/React.createElement("path", {
    d: linePath,
    fill: "none",
    stroke: color,
    strokeWidth: "1.6",
    strokeLinejoin: "round",
    strokeLinecap: "round",
    vectorEffect: "non-scaling-stroke"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      marginTop: 3
    }
  }, data.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 9,
      color: '#8b7aa8',
      fontWeight: 600,
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    }
  }, i % 2 === 0 ? d.label : ''))));
}
