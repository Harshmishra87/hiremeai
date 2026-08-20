import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";
import DesktopIcon from "./DesktopIcon.jsx";
import Onboarding from "./Onboarding.jsx";
import { DESKTOP_ICONS } from "../data/apps";

// Must stay in sync with the "resume" hotspot's pointsF in Wallpaper.jsx —
// duplicated here (rather than imported) because Wallpaper.jsx is the
// background glow layer (pointer-events-none, -z-10) and can never itself
// receive clicks: Desktop's full-screen container always sits on top of it
// in the stacking order, so the actual click target has to live here. If
// you ever retrace/move the resume paper in Wallpaper.jsx, update both.
const NATURAL_WIDTH = 1024;
const NATURAL_HEIGHT = 576;
const OBJECT_POSITION = { x: 0.65, y: 0.5 };
const RESUME_POINTS_F = [
  { xF: 624 / NATURAL_WIDTH, yF: 574 / NATURAL_HEIGHT },
  { xF: 538 / NATURAL_WIDTH, yF: 420 / NATURAL_HEIGHT },
  { xF: 805 / NATURAL_WIDTH, yF: 268 / NATURAL_HEIGHT },
  { xF: 828 / NATURAL_WIDTH, yF: 310 / NATURAL_HEIGHT },
  { xF: 779 / NATURAL_WIDTH, yF: 355 / NATURAL_HEIGHT },
  { xF: 930 / NATURAL_WIDTH, yF: 574 / NATURAL_HEIGHT },
];

function getCoverLayout(containerW, containerH) {
  const scale = Math.max(
    containerW / NATURAL_WIDTH,
    containerH / NATURAL_HEIGHT,
  );
  const renderedW = NATURAL_WIDTH * scale;
  const renderedH = NATURAL_HEIGHT * scale;
  const offsetX = -(renderedW - containerW) * OBJECT_POSITION.x;
  const offsetY = -(renderedH - containerH) * OBJECT_POSITION.y;
  return { scale, offsetX, offsetY };
}

export default function Desktop({
  onOpenApp,
  hideOrb,
  onboardingActive = false,
  onDismissOnboarding,
}) {
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);
  const [resumeClipPath, setResumeClipPath] = useState(null);
  // Resume's on-screen bounding box (same coordinate space as the clip
  // path above) — the onboarding spotlight/arrow/tooltip position off of
  // this rather than the polygon points directly, since a simple rect is
  // all they need.
  const [resumeBBox, setResumeBBox] = useState(null);

  // Recompute the resume paper's on-screen polygon whenever the viewport
  // resizes, using the same object-fit: cover math Wallpaper.jsx uses, so
  // the clickable region always lines up with what's actually drawn.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const recompute = () => {
      const { width, height } = node.getBoundingClientRect();
      const { scale, offsetX, offsetY } = getCoverLayout(width, height);
      const points = RESUME_POINTS_F.map((p) => ({
        x: p.xF * NATURAL_WIDTH * scale + offsetX,
        y: p.yF * NATURAL_HEIGHT * scale + offsetY,
      }));
      setResumeClipPath(
        `polygon(${points.map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(", ")})`,
      );

      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      const bbox = {
        left: Math.min(...xs),
        top: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      };
      setResumeBBox(bbox);
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pt-9 pb-24"
      onClick={() => setSelected(null)}
    >
      {/* Fixed-spacing, wrapping icon grid — no free dragging, so icons can
          never end up partially off-screen. Wraps automatically on narrow
          viewports and never overflows the desktop area. */}
      <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-flow-col sm:grid-rows-6 gap-2 p-4 pt-6 content-start justify-items-center sm:justify-items-start">
        {DESKTOP_ICONS.map((icon) => (
          <DesktopIcon
            key={icon.id}
            icon={icon.icon}
            asset={icon.asset}
            label={icon.label}
            selected={selected === icon.id}
            onSelect={() => setSelected(icon.id)}
            onOpen={() => onOpenApp(icon.id)}
          />
        ))}
      </div>

      {/* Hero headline — premium display treatment: ambient glow, layered
          bloom via a blurred duplicate, a slow shimmer sweep across the
          gradient, and a thin glowing accent line underneath. */}
      <div className="absolute left-[18%] top-1/2 -translate-y-1/2 pointer-events-none select-none">
        <div
          aria-hidden="true"
          className="hero-ambient-glow absolute -inset-x-16 -inset-y-10 blur-3xl opacity-70"
        />

        <p className="relative font-display font-medium text-4xl md:text-5xl lg:text-6xl tracking-[-0.02em] leading-[1] text-hey-premium">
          Hey,
        </p>

        <div className="relative mt-1">
          {/* Blurred duplicate underneath the real text — gives genuine
              light bloom around the bright areas rather than a flat glow. */}
          <h1
            aria-hidden="true"
            className="absolute inset-0 font-display font-bold text-6xl md:text-7xl lg:text-8xl tracking-[-0.04em] leading-[0.95] text-harsh-bloom opacity-50"
          >
            I&rsquo;m Harsh
          </h1>
          <h1 className="relative font-display font-bold text-6xl md:text-7xl lg:text-8xl tracking-[-0.04em] leading-[0.95] text-harsh-shimmer">
            I&rsquo;m Harsh
          </h1>
        </div>

        <div className="hero-accent-line relative h-px w-40 md:w-52 mt-5 rounded-full" />
      </div>

      {/* Resume paper — clickable hit-region matching the paper's traced
          shape in Wallpaper.jsx. Wallpaper only draws the glow; this is
          the actual click target, since it needs to sit above the
          pointer-events-none background layer. Re-enables pointer events
          for just this clipped shape (the rest of the desktop keeps its
          normal deselect-on-click behavior). */}
      {resumeClipPath && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenApp("resume");
          }}
          aria-label="Open resume"
          className="absolute inset-0 pointer-events-auto cursor-pointer bg-transparent border-0 p-0"
          style={{ clipPath: resumeClipPath }}
        />
      )}

      {/* Floating AI orb — fixed to the viewport so it can never clip outside
          the window. Hidden while the AI Interview sidebar is open, so it
          behaves like a collapsible chat widget: collapse the sidebar to
          bring this back, click it to expand the sidebar again. */}
      <AnimatePresence>
        {!hideOrb && (
          <motion.button
            key="ai-orb"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity: 1,
              scale: 1,
              boxShadow: [
                "0 0 25px rgba(124,92,255,0.4)",
                "0 0 45px rgba(92,225,230,0.5)",
                "0 0 25px rgba(124,92,255,0.4)",
              ],
            }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{
              boxShadow: { duration: 3, repeat: Infinity },
              default: { duration: 0.25 },
            }}
            onClick={(e) => {
              e.stopPropagation();
              onOpenApp("interview");
            }}
            whileHover={{ scale: 1.1 }}
            className="fixed bottom-28 right-6 z-30 h-14 w-14 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan shadow-glow flex items-center justify-center"
            aria-label="Open AI Interview Assistant"
          >
            <Bot size={22} className="text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* First-visit onboarding — spotlight/arrow/tooltip on the resume,
          quiet pulse on the AI orb. Renders last so it sits on top; see
          Onboarding.jsx and Home.jsx (state + localStorage) for details. */}
      <Onboarding
        active={onboardingActive}
        bbox={resumeBBox}
        showOrbHint={onboardingActive && !hideOrb}
        onDismiss={onDismissOnboarding}
      />
    </div>
  );
}
