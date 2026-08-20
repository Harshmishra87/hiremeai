import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOOLTIP_WIDTH = 236;
const TOOLTIP_TARGET_GAP = 28;
const DEFAULT_TOOLTIP_HEIGHT = 118;

export default function Onboarding({ active, bbox, showOrbHint, onDismiss }) {
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1280,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });
  const tooltipRef = useRef(null);
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

  const targetX = bbox.left + bbox.width / 2;
  const targetY = bbox.top + bbox.height / 2;

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

  const anchorX = Math.min(
    Math.max(targetX, tooltipLeft + 24),
    tooltipLeft + tooltipSize.width - 24,
  );
  const anchorY = placeAbove ? tooltipTop + tooltipSize.height : tooltipTop;

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
          className="pointer-events-none absolute inset-0 z-[45]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Connecting line — plain opacity fade-in, no pathLength trick,
              so nothing can silently override its dash/stroke rendering. */}
          <svg className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <marker
                id="onboarding-arrowhead"
                markerWidth="5"
                markerHeight="5"
                refX="2.5"
                refY="2.5"
                orient="auto"
              >
                <path d="M0,0 L5,2.5 L0,5 Z" fill="rgba(190,220,255,0.9)" />
              </marker>
            </defs>
            <motion.line
              x1={anchorX}
              y1={anchorY}
              x2={lineEndX}
              y2={lineEndY}
              stroke="rgba(190,220,255,0.95)"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              strokeLinecap="round"
              markerEnd="url(#onboarding-arrowhead)"
              style={{ filter: "drop-shadow(0 0 3px rgba(92,225,230,0.55))" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
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
