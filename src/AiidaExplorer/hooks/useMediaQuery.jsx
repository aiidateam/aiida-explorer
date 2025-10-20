import { useEffect, useState } from "react";

// custom hook to allow complex rerendering based on media query
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);
    const listener = (event) => {
      setMatches(event.matches);

      console.log("media query fired");
    };
    media.addEventListener("change", listener);

    setMatches(media.matches);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
