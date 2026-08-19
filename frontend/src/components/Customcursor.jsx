import { useEffect, useRef } from "react";

const TRAIL_LENGTH = 6;
const TRAIL_INTERVAL_MS = 45;

/**
 * Replaces the system cursor with a glowing dot that:
 * - follows the pointer with spring-like smoothing
 * - snaps toward ("magnetic pull") any element tagged data-cursor="magnetic"
 *   when the pointer is near/over it, and scales up while hovering
 * - leaves a short, fading particle trail while moving
 *
 * Disabled entirely on touch/coarse-pointer devices (no hover concept there)
 * and under prefers-reduced-motion. Everything here mutates refs directly
 * inside a single rAF loop — no React state, so it never re-renders.
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRefs = useRef([]);
  const rootRef = useRef(null);

  const pos = useRef({ x: -100, y: -100 });
  const smoothed = useRef({ x: -100, y: -100 });
  const target = useRef(null); // currently-hovered magnetic element, if any
  const lastTrailAt = useRef(0);
  const trailIndex = useRef(0);

  useEffect(() => {
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (isCoarsePointer || reduceMotion) return undefined;

    document.documentElement.classList.add("custom-cursor-active");

    const handleMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const handleOver = (e) => {
      const el = e.target.closest('[data-cursor="magnetic"]');
      target.current = el || null;
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseover", handleOver, { passive: true });

    let raf = null;
    const tick = (now) => {
      let goalX = pos.current.x;
      let goalY = pos.current.y;
      let magnetic = false;

      if (target.current) {
        const rect = target.current.getBoundingClientRect();
        goalX = rect.left + rect.width / 2;
        goalY = rect.top + rect.height / 2;
        magnetic = true;
      }

      smoothed.current.x +=
        (goalX - smoothed.current.x) * (magnetic ? 0.25 : 0.18);
      smoothed.current.y +=
        (goalY - smoothed.current.y) * (magnetic ? 0.25 : 0.18);

      const { x, y } = smoothed.current;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${magnetic ? 1.8 : 1})`;
      }

      if (now - lastTrailAt.current > TRAIL_INTERVAL_MS) {
        lastTrailAt.current = now;
        const el = trailRefs.current[trailIndex.current];
        if (el) {
          el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
          el.style.opacity = "0.35";
          el.style.transition = "none";
          // Force reflow so the fade-out transition restarts cleanly each time
          void el.offsetWidth;
          el.style.transition =
            "opacity 0.5s ease-out, transform 0.5s ease-out";
          el.style.opacity = "0";
        }
        trailIndex.current = (trailIndex.current + 1) % TRAIL_LENGTH;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      aria-hidden="true"
    >
      {Array.from({ length: TRAIL_LENGTH }).map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          className="fixed top-0 left-0 h-1.5 w-1.5 rounded-full bg-accent-cyan opacity-0"
          style={{ willChange: "transform, opacity" }}
        />
      ))}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 h-8 w-8 rounded-full border border-accent-purple/50 bg-accent-purple/10 backdrop-blur-[1px]"
        style={{
          willChange: "transform",
          transition: "transform 0.15s ease-out",
        }}
      />
      <div
        ref={dotRef}
        className="fixed top-0 left-0 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_4px_1px_rgba(124,92,255,0.8)]"
        style={{ willChange: "transform" }}
      />
    </div>
  );
}
