import { useEffect, useRef } from "react";

// Apply returned ref to an element. If user clicks outside of that element, the
// given callback will be called. Note that this hook handles some events during
// the capture phase, and that may affect how the callback needs to work.
export default function useOutsideClick(callback) {
  const ref = useRef();

  useEffect(() => {
    const handleClick = (evt) => {
      if (ref.current && !ref.current.contains(evt.target)) {
        callback(evt);
      }
    };

    document.addEventListener("click", handleClick, true); // Uses capture phase.

    return () => {
      document.removeEventListener("click", handleClick, true); // Uses capture phase.
    };
  }, [callback, ref]);

  return ref;
}
