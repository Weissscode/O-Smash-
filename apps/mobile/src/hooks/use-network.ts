import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/** false uniquement quand on SAIT que l'appareil est hors ligne. */
export function useIsOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(
    () => NetInfo.addEventListener((s) => setOnline(s.isConnected !== false && s.isInternetReachable !== false)),
    [],
  );
  return online;
}
