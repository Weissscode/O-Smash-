import React from 'react';
import { T } from '../data/theme.js';
import { generateInsights } from '../utils/insights.js';
import { StatCard } from './StatCard.jsx';

export function InsightsCard({
  orders
}) {
  const insights = generateInsights(orders);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: T.primary,
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.8
    }
  }, "Analyse automatique"), insights.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 10,
      padding: '20px 18px',
      border: '1px solid #ECE5F7',
      textAlign: 'center',
      color: '#9b8fb0',
      fontSize: 13,
      fontWeight: 600
    }
  }, "Pas encore assez de commandes pour analyser") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
      gap: 10
    }
  }, insights.map((ins, i) => /*#__PURE__*/React.createElement(StatCard, {
    key: i,
    label: ins.label,
    value: ins.value,
    sub: ins.sub,
    color: ins.color
  }))));
}



