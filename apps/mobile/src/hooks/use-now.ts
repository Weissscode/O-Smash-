import { useEffect, useState } from 'react';

/** Heure courante rafraîchie périodiquement (statuts ouvert/fermé, délais). */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
