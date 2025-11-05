import { useState, useEffect } from "react";

export default function useContainerMediaQuery(ref, queries) {
  // queries: array of { name: string, predicate: (width, height) => boolean }
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!ref.current) return;

    const container = ref.current;

    const check = () => {
      const { width, height } = container.getBoundingClientRect();
      for (const q of queries) {
        if (q.predicate(width, height)) {
          setActive(q.name);
          return;
        }
      }
      setActive(null);
    };

    check();

    const observer = new ResizeObserver(() => {
      check();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [ref, queries]);

  return active;
}
