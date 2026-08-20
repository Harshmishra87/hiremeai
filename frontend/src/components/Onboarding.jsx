import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOOLTIP_WIDTH = 236;
const TOOLTIP_TARGET_GAP = 28; // vertical gap between tooltip and its ideal position above the target
const DEFAULT_TOOLTIP_HEIGHT = 118; // fallback before first measured render
const SPOTLIGHT_PADDING = 22; // how far the glow rect extends past the resume's real edges

// Purely presentational first-visit guide: a spotlight around the resume,
// a line pointing from the tooltip to it, a glass tooltip, and an optional
// quiet pulse on the AI orb. Takes plain data in, knows nothing about
// app/window state — Home.jsx owns visibility + "mark as seen"; this
// component just draws it.
export default function Onboarding({ active, bbox, showOrbHint, onDismiss }) {
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1280,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });
  const tooltipRef = useRef(null);
  // Measured actual tooltip size, so the connecting line starts from its
  // real edge rather than a guessed constant.
  const [tooltipSize, setTooltipSize] = useState({
    width: TOOLTIP_WIDTH,
    height: DEFAULT_TOOLTIP_HEIGHT,
  });

  useEffect(() => {
    const onResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const r = tooltipRef.current.getBoundingClientRect();
      setTooltipSize({ width: r.width, height: r.height });
    }
  }, [active, bbox]);

  if (!bbox) return null;

  // Center of the resume's actual on-screen bounding box — the one true
  // target everything else (line, spotlight) is drawn relative to.
  const targetX = bbox.left + bbox.width / 2;
  const targetY = bbox.top + bbox.height / 2;

  // Tooltip: centered above the target when there's room; if the resume
  // sits too high on screen for that, it drops below instead. Horizontal
  // position is clamped to stay fully on screen — the connecting line
  // (below) is what keeps it visually linked to the target even when
  // clamping shifts it off-center.
  const idealLeft = targetX - tooltipSize.width / 2;
  const tooltipLeft = Math.min(
    Math.max(16, idealLeft),
    viewport.width - tooltipSize.width - 16,
  );

  const spaceAbove = bbox.top - 64;
  const placeAbove = spaceAbove > tooltipSize.height + TOOLTIP_TARGET_GAP;
  const tooltipTop = placeAbove
    ? bbox.top - tooltipSize.height - TOOLTIP_TARGET_GAP
    : Math.min(
        bbox.top + bbox.height + TOOLTIP_TARGET_GAP,
        viewport.height - tooltipSize.height - 24,
      );

  // Anchor point on the tooltip's edge closest to the target — the line
  // starts here, so it always reads as "coming from the tooltip."
  const anchorX = Math.min(
    Math.max(targetX, tooltipLeft + 24),
    tooltipLeft + tooltipSize.width - 24,
  );
  const anchorY = placeAbove ? tooltipTop + tooltipSize.height : tooltipTop;

  // Stop the line a little short of the target center so the arrowhead
  // doesn't bury itself under the spotlight glow.
  const dx = targetX - anchorX;
  const dy = targetY - anchorY;
  const dist = Math.max(Math.hypot(dx, dy), 1);
  const stopShort = Math.min(bbox.width, bbox.height) * 0.28;
  const lineEndX = targetX - (dx / dist) * stopShort;
  const lineEndY = targetY - (dy / dist) * stopShort;

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
          {/* Spotlight — a glowing rounded rect that hugs the resume's
              real bounding box directly, so there's no ambiguity about
              what it's highlighting. Border + soft fill, screen-blended
              so it reads clearly against the dark wallpaper. */}
          <motion.div
            className="absolute rounded-2xl"
            style={{
              left: bbox.left - SPOTLIGHT_PADDING,
              top: bbox.top - SPOTLIGHT_PADDING,
              width: bbox.width + SPOTLIGHT_PADDING * 2,
              height: bbox.height + SPOTLIGHT_PADDING * 2,
              border: "1.5px solid rgba(170,205,255,0.55)",
              background:
                "radial-gradient(closest-side, rgba(150,190,255,0.22), rgba(124,92,255,0.12) 60%, transparent 85%)",
              boxShadow: "0 0 40px 8px rgba(124,92,255,0.25)",
              mixBlendMode: "screen",
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Connecting line — drawn fresh every render from the tooltip's
              actual edge to the resume's actual center, so it always
              visually links the two regardless of how far apart they end
              up (unlike a fixed-size arrow icon, which can't span a large
              or variable gap). */}
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            style={{ left: 0, top: 0 }}
          >
            <defs>
              <marker
                id="onboarding-arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="4"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="rgba(170,210,255,0.95)" />
              </marker>
            </defs>
            <motion.line
              x1={anchorX}
              y1={anchorY}
              x2={lineEndX}
              y2={lineEndY}
              stroke="rgba(170,210,255,0.85)"
              strokeWidth="2"
              strokeDasharray="5 5"
              markerEnd="url(#onboarding-arrowhead)"
              style={{ filter: "drop-shadow(0 0 4px rgba(92,225,230,0.5))" }}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
            />
          </svg>

          {/* Tooltip */}
          <motion.div
            ref={tooltipRef}
            className="pointer-events-auto absolute rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.35)] px-4 py-3.5"
            style={{ left: tooltipLeft, top: tooltipTop, width: TOOLTIP_WIDTH }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
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
