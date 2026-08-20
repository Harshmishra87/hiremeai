import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Purely presentational first-visit guide: a soft spotlight + one small
// arrow + a glass tooltip pointing at the resume, plus an optional quiet
// pulse on the AI orb. Takes plain data in, knows nothing about app/window
// state — Home.jsx owns the "should this be visible" and "mark as seen"
// logic; this component just draws it.
export default function Onboarding({ active, bbox, showOrbHint, onDismiss }) {
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1280,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    const onResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!bbox) return null;

  // Tooltip anchors above-left of the resume paper so it never runs off
  // the right edge (the resume sits in the right half of the frame) and
  // never sits on top of the paper itself. Clamped to stay on-screen on
  // narrower viewports.
  const tooltipWidth = 236;
  const tooltipLeft = Math.min(
    Math.max(16, bbox.left + bbox.width / 2 - tooltipWidth - 24),
    viewport.width - tooltipWidth - 16,
  );
  const tooltipTop = Math.max(64, bbox.top - 148);

  const arrowLeft = Math.min(
    Math.max(tooltipLeft + tooltipWidth - 26, 16),
    viewport.width - 40,
  );
  const arrowTop = tooltipTop + 90;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Spotlight — a quiet, breathing glow behind the resume. The
              gradient's own falloff gives the softness, so no blur filter
              is needed and it never reads as a heavy blurred blob. */}
          <motion.div
            className="absolute rounded-[28%]"
            style={{
              left: bbox.left - bbox.width * 0.35,
              top: bbox.top - bbox.height * 0.35,
              width: bbox.width * 1.7,
              height: bbox.height * 1.7,
              background:
                "radial-gradient(closest-side, rgba(124,92,255,0.22), rgba(92,225,230,0.10) 55%, transparent 80%)",
            }}
            animate={{ opacity: [0.55, 0.85, 0.55] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Arrow — one small glowing chevron pointing at the resume.
              Deliberately tiny and singular, not a big tutorial-style
              pointer. */}
          <motion.svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            style={{ position: "absolute", left: arrowLeft, top: arrowTop }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: [0, 5, 0], y: [0, 5, 0] }}
            transition={{
              opacity: { duration: 0.4, delay: 0.3 },
              x: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <path
              d="M5 5 L25 25 M25 25 L13 25 M25 25 L25 13"
              stroke="rgba(150,205,255,0.9)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{ filter: "drop-shadow(0 0 6px rgba(92,225,230,0.55))" }}
            />
          </motion.svg>

          {/* Tooltip */}
          <motion.div
            className="pointer-events-auto absolute rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.35)] px-4 py-3.5"
            style={{ left: tooltipLeft, top: tooltipTop, width: tooltipWidth }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <p className="font-display text-[13px] font-semibold tracking-wide text-white">
              📄 Start Here
            </p>
            <p className="mt-1 font-body text-[12.5px] leading-snug text-white/70">
              View my Resume for a quick overview.
            </p>
            <button
              type="button"
              onClick={onDismiss}
              className="mt-3 text-[11.5px] font-medium text-white/55 hover:text-white/90 transition-colors"
            >
              Got it
            </button>
          </motion.div>

          {/* AI orb hint — secondary and quiet. Only rendered while the
              orb itself is on screen (Desktop hides it whenever the
              interview sidebar is expanded), so this never floats over
              an empty spot. */}
          {showOrbHint && (
            <>
              <motion.div
                className="fixed bottom-28 right-6 h-14 w-14 rounded-full pointer-events-none z-20"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(124,92,255,0.35)",
                    "0 0 0 10px rgba(124,92,255,0)",
                  ],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <motion.div
                className="fixed bottom-[7.5rem] right-24 z-20 pointer-events-none whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.06] backdrop-blur-md px-2.5 py-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <span className="font-body text-[11px] text-white/60">
                  🤖 Ask My AI Agent
                </span>
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
