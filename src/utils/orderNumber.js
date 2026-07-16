import { LS } from './storage.js';
import { fdy } from './format.js';

export function getNextOrderNum() {
  const today = fdy(new Date());
  const saved = LS.get('osm7-counter', {
    date: '',
    num: 0
  });
  let num = saved.date === today ? saved.num + 1 : 1;
  LS.set('osm7-counter', {
    date: today,
    num
  });
  return num;
}
