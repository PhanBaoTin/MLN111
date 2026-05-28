import { useEffect, useState } from 'react';

/**
 * Returns remaining seconds (integer) based on server epoch timestamp.
 * Updates every 200ms for smooth display.
 */
export function useCountdown(timerEndsAt: number | null): number {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (timerEndsAt === null) {
      setRemaining(0);
      return;
    }

    const tick = () => {
      const diff = Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000));
      setRemaining(diff);
    };

    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [timerEndsAt]);

  return remaining;
}
