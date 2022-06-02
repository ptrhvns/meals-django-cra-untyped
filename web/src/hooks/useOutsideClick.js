import { useEffect, useRef } from "react";

export default function useOutsideClick(callback) {
  const ref = useRef();

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("click", handleClick, true); // Uses capture phase.

    return () => {
      document.removeEventListener("click", handleClick, true); // Uses capture phase.
    };
  }, [callback, ref]);

  return ref;
}
