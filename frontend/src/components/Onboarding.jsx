import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOOLTIP_WIDTH = 236;
const TOOLTIP_ARROW_GAP = 18;
const ARROW_SIZE = 30;
const DEFAULT_TOOLTIP_HEIGHT = 118; // fallback before first measured render

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
  const tooltipRef = useRef(null);
  // Measured actual tooltip height, so the arrow's angle is computed from
  // its real bottom edge rather than a guessed constant — keeps the arrow
  // visually attached to the tooltip regardless of font rendering/zoom.
  const [tooltipHeight, setTooltipHeight] = useState(DEFAULT_TOOLTIP_HEIGHT);

  useEffect(() => {
    const onResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useLayoutEffect(() => {
    if (tooltipRef.current) {
      setTooltipHeight(tooltipRef.current.getBoundingClientRect().height);
    }
  }, [active, bbox]);

  if (!bbox) return null;

  // The point we're actually guiding the visitor's eye to — center of the
  // resume's on-screen bounding box.
  const targetX = bbox.left + bbox.width / 2;
  const targetY = bbox.top + bbox.height / 2;

  // Tooltip is centered on the resume horizontally, sits just above it,
  // then gets clamped to stay fully inside the viewport. Clamping is what
  // can push it off-center — the arrow below corrects for that by aiming
  // at the real target instead of assuming straight-down.
  const idealLeft = targetX - TOOLTIP_WIDTH / 2;
  const tooltipLeft = Math.min(
    Math.max(16, idealLeft),
    viewport.width - TOOLTIP_WIDTH - 16,
  );
  const idealTop = bbox.top - tooltipHeight - TOOLTIP_ARROW_GAP - ARROW_SIZE;
  const tooltipTop = Math.max(64, idealTop);

  const tooltipBottomX = tooltipLeft + TOOLTIP_WIDTH / 2;
  const tooltipBottomY = tooltipTop + tooltipHeight;

  // Real angle from the tooltip's bottom edge to the resume's center —
  // this is what keeps the arrow visually connected to both endpoints
  // instead of just hanging at a fixed offset.
  const angleRad = Math.atan2(
    targetY - tooltipBottomY,
    targetX - tooltipBottomX,
  );
  const angleDeg = (angleRad * 180) / Math.PI;

  const arrowLeft = tooltipBottomX - ARROW_SIZE / 2;
  const arrowTop = tooltipBottomY + TOOLTIP_ARROW_GAP;

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
          {/* Spotlight — a quiet, breathing glow behind the resume.
              mix-blend-screen + higher opacity so it actually reads
              against the dark wallpaper instead of washing out. */}
          <motion.div
            className="absolute rounded-[28%]"
            style={{
              left: bbox.left - bbox.width * 0.4,
              top: bbox.top - bbox.height * 0.4,
              width: bbox.width * 1.8,
              height: bbox.height * 1.8,
              background:
                "radial-gradient(closest-side, rgba(150,190,255,0.38), rgba(124,92,255,0.24) 45%, rgba(92,225,230,0.14) 66%, transparent 82%)",
              mixBlendMode: "screen",
            }}
            animate={{ opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Arrow — rotated to point from the tooltip's bottom edge
              straight at the resume's actual on-screen center. Small and
              singular, not a big tutorial-style pointer. */}
          <motion.div
            style={{
              position: "absolute",
              left: arrowLeft,
              top: arrowTop,
              width: ARROW_SIZE,
              height: ARROW_SIZE,
              transform: `rotate(${angleDeg - 45}deg)`,
              transformOrigin: "50% 50%",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <motion.svg
              width={ARROW_SIZE}
              height={ARROW_SIZE}
              viewBox="0 0 30 30"
              animate={{ x: [0, 4, 0], y: [0, 4, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <path
                d="M6 6 L24 24 M24 24 L13 24 M24 24 L24 13"
                stroke="rgba(170,210,255,0.95)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{ filter: "drop-shadow(0 0 6px rgba(92,225,230,0.6))" }}
              />
            </motion.svg>
          </motion.div>

          {/* Tooltip */}
          <motion.div
            ref={tooltipRef}
            className="pointer-events-auto absolute rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.35)] px-4 py-3.5"
            style={{ left: tooltipLeft, top: tooltipTop, width: TOOLTIP_WIDTH }}
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
