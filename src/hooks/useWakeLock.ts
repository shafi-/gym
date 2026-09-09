import { useEffect, useRef } from 'react';

export function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    async function requestWakeLock() {
      if ('wakeLock' in navigator) {
        try {
          // Release any existing lock first to avoid conflicts
          if (wakeLockRef.current) {
            wakeLockRef.current.release();
          }
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          wakeLockRef.current.addEventListener('release', () => {
            console.log('Wake Lock released');
            // Attempt to re-acquire when released
            if (enabled) {
              requestWakeLock();
            }
          });
        } catch (err) {
          console.warn('Wake Lock not available:', err);
        }
      }
    }

    requestWakeLock();

    // Re-acquire wake lock when visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [enabled]);
}
