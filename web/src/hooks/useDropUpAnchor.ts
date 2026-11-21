import { useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

/** Keep a portaled menu aligned to its trigger, including after scroll or resize. */
export function useDropUpAnchor(
  trigger: RefObject<HTMLDivElement | null>,
  active: boolean,
) {
  const [position, setPosition] = useState<CSSProperties>();
  useLayoutEffect(() => {
    const anchor = trigger.current;
    if (!active || !anchor) return;
    const align = () => {
      const bounds = anchor.getBoundingClientRect();
      setPosition({ bottom: window.innerHeight - bounds.top + 4, left: bounds.left });
    };
    align();
    window.addEventListener("resize", align);
    window.addEventListener("scroll", align, true);
    return () => {
      window.removeEventListener("resize", align);
      window.removeEventListener("scroll", align, true);
    };
  }, [trigger, active]);
  return active ? position : undefined;
}
