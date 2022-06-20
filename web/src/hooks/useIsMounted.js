import { useCallback, useEffect, useRef } from "react";

export default function useIsMounted() {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  // istanbul ignore next
  return {
    isMounted: useCallback(() => isMounted.current, []),
    isUnmounted: useCallback(() => !isMounted.current, []),
  };
}
