import { fp } from './format.js';
import { T } from '../data/theme.js';

export function generateInsights(orders) {
  if (orders.length === 0) return [];
  const insights = [];
  const total = orders.reduce((s, o) => s + o.total, 0);
  const avgBasket = total / orders.length;
  insights.push({
    label: 'Panier moyen',
    value: fp(avgBasket),
    color: T.primary
  });
  const hourTotals = {};
  orders.forEach(o => {
    const h = new Date(o.date).getHours();
    hourTotals[h] = (hourTotals[h] || 0) + o.total;
  });
  const sortedHours = Object.entries(hourTotals).sort((a, b) => b[1] - a[1]);
  if (sortedHours.length > 0) {
    insights.push({
      label: 'Rush n1',
      value: sortedHours[0][0] + 'h',
      sub: fp(sortedHours[0][1]),
      color: T.warn
    });
  }
  if (sortedHours.length > 1) {
    insights.push({
      label: 'Rush n2',
      value: sortedHours[1][0] + 'h',
      sub: fp(sortedHours[1][1]),
      color: T.txtSub
    });
  }
  return insights;
}
