export const LS = {
  get: (k, fb) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fb;
    } catch {
      return fb;
    }
  },
  set: (k, d) => {
    try {
      localStorage.setItem(k, JSON.stringify(d));
    } catch (e) {}
  }
};
