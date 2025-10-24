import { useState, useEffect } from "react";

export default function useContainerBucket(ref, step = 100) {
  const [bucket, setBucket] = useState(null);

  useEffect(() => {
    if (!ref.current) return;

    const container = ref.current;

    const check = () => {
      const { width } = container.getBoundingClientRect();
      const newBucket = Math.floor(width / step);
      setBucket((prev) => (prev !== newBucket ? newBucket : prev));
    };

    check();

    const observer = new ResizeObserver(() => {
      check();
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, [ref, step]);

  return bucket;
}
