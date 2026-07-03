import { useEffect, useRef, useState } from 'react';

export function useImpression(
  onImpression: () => void,
  threshold: number = 0.5,
  durationMs: number = 1500
) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasFired, setHasFired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (hasFired || !ref.current) return;

    const currentRef = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!timerRef.current) {
            timerRef.current = setTimeout(() => {
              onImpression();
              setHasFired(true);
            }, durationMs);
          }
        } else {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }
      },
      { threshold }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [hasFired, onImpression, threshold, durationMs]);

  return { ref };
}
