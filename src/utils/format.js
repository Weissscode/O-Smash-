export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const fp = p => `${p.toFixed(2).replace('.', ',')}€`;
export const ft = d => new Date(d).toLocaleTimeString('fr-FR', {
  hour: '2-digit',
  minute: '2-digit'
});
export const fd = d => new Date(d).toLocaleDateString('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});
export const fdy = d => new Date(d).toLocaleDateString('fr-FR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});
