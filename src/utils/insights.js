import { fp } from './format.js';

export function generateInsights(orders) {
  if (orders.length === 0) return [];
  const insights = [];
  const total = orders.reduce((s, o) => s + o.total, 0);
  const avgBasket = total / orders.length;
  insights.push({
    label: 'Panier moyen',
    value: fp(avgBasket),
    color: '#B48FE0'
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
      color: '#F59E0B'
    });
  }
  if (sortedHours.length > 1) {
    insights.push({
      label: 'Rush n2',
      value: sortedHours[1][0] + 'h',
      sub: fp(sortedHours[1][1]),
      color: '#D97706'
    });
  }
  return insights;
}
