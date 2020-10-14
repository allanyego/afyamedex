import { useRef } from "react";

export default function useMounted() {
  const mounted = useRef(true);

  const setMounted = (isMounted) => {
    mounted.current = isMounted;
  };

  return {
    isMounted: mounted.current,
    setMounted,
  };
}
