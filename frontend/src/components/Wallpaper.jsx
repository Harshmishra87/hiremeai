import { useEffect, useMemo, useRef, useState } from "react";

// Hotspot regions expressed as FRACTIONS OF THE IMAGE'S NATURAL PIXEL SIZE
// (measured directly from wallpaper.jpg, which is 1024x576) — not fractions
// of the viewport. This is what makes them resolution/aspect-ratio-proof:
// the actual on-screen rect is computed at render time by replicating the
// same object-fit: cover math the browser uses (see getCoverLayout below).
const NATURAL_WIDTH = 1024;
const NATURAL_HEIGHT = 576;
const OBJECT_POSITION = { x: 0.65, y: 0.5 }; // must match the <img> style below

const HOTSPOTS = [
  {
    id: "coffee",
    kind: "rect",
    steam: true,
    // px: 790,120 -> 945,265
    leftF: 790 / NATURAL_WIDTH,
    topF: 120 / NATURAL_HEIGHT,
    widthF: (945 - 790) / NATURAL_WIDTH,
    heightF: (265 - 120) / NATURAL_HEIGHT,
    core: "bg-accent-purple",
    bloom: "bg-accent-purple/40",
  },
  {
    id: "laptop",
    kind: "polygon",
    // Traced directly from wallpaper.jpg (1024x576) as a 7-point polygon
    // following the screen's real bezel edge, including the curve where
    // it meets the kickstand/hinge. This is exact, not an approximation —
    // clip-path renders precisely this shape, so glow can never bleed
    // past the real screen boundary onto the desk or keyboard.
    pointsF: [
      { xF: 1022 / NATURAL_WIDTH, yF: 198 / NATURAL_HEIGHT },
      { xF: 1023 / NATURAL_WIDTH, yF: 408 / NATURAL_HEIGHT },
      { xF: 898 / NATURAL_WIDTH, yF: 501 / NATURAL_HEIGHT },
      { xF: 796 / NATURAL_WIDTH, yF: 356 / NATURAL_HEIGHT },
    ],
  },
];

const PROXIMITY_RADIUS_PX = 240; // how far from the hotspot's edge the glow starts ramping up
const LAPTOP_ACTIVATION_THRESHOLD = 0.2; // proximity level that counts as "cursor approached" — one-time trigger
const LAPTOP_REARM_PROXIMITY = 0.05; // must drop below this after the assistant panel closes before activation can trigger again
function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function smoothstep(t) {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}
function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x,
      yi = points[i].y;
    const xj = points[j].x,
      yj = points[j].y;
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function distToSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const lenSq = abx * abx + aby * aby;
  let t = lenSq === 0 ? 0 : ((px - ax) * abx + (py - ay) * aby) / lenSq;
  t = clamp(t, 0, 1);
  return Math.hypot(px - (ax + t * abx), py - (ay + t * aby));
}

function distToPolygon(x, y, points) {
  let min = Infinity;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const d = distToSegment(
      x,
      y,
      points[i].x,
      points[i].y,
      points[j].x,
      points[j].y,
    );
    if (d < min) min = d;
  }
  return min;
}

function proximityToPolygon(x, y, points) {
  if (pointInPolygon(x, y, points)) return 1;
  return smoothstep(1 - distToPolygon(x, y, points) / PROXIMITY_RADIUS_PX);
}
/**
 * Replicates CSS object-fit: cover's scale + crop math so we can convert a
 * point/rect in the image's natural pixel space into on-screen pixels,
 * for any container size and any object-position — exactly, not approximately.
 */
function getCoverLayout(containerW, containerH) {
  const scale = Math.max(
    containerW / NATURAL_WIDTH,
    containerH / NATURAL_HEIGHT,
  );
  const renderedW = NATURAL_WIDTH * scale;
  const renderedH = NATURAL_HEIGHT * scale;
  const overflowX = renderedW - containerW;
  const overflowY = renderedH - containerH;
  const offsetX = -overflowX * OBJECT_POSITION.x;
  const offsetY = -overflowY * OBJECT_POSITION.y;
  return { scale, offsetX, offsetY };
}

/**
 * @param {Object} props
 * @param {boolean} [props.assistantOpen] - true while the AI Interview
 *   Assistant panel is open. The panel sits on top of (and occludes) the
 *   laptop hotspot region, so while it's open we must fully suppress laptop
 *   proximity detection — including the one-time "power on" activation
 *   trigger. Without this, moving the cursor across the panel (e.g. to hit
 *   the close button, which sits directly above the laptop's on-screen
 *   position) silently powers the laptop on behind the panel, which then
 *   shows as already-on the moment the panel closes even though no one
 *   ever saw it happen.
 */
export default function Wallpaper({ assistantOpen = false }) {
  const containerRef = useRef(null);
  const spotlightRef = useRef(null);
  const coreRefs = useRef({});
  const bloomRefs = useRef({});
  const steamRefs = useRef({}); // coffee only — overall opacity of the steam group
  const rectsRef = useRef({});
  // Laptop screen "power on" — flips true the first time the cursor comes
  // close enough, and stays true for the rest of the session (until
  // reload). Plain ref, not state, so it never triggers a re-render.
  const laptopOnRef = useRef(false);
  const screenOffRef = useRef(null);
  // Mirrors the assistantOpen prop into a ref so the 60fps mousemove path
  // can read it without depending on React state/re-renders. Prop changes
  // are infrequent (panel open/close), so syncing via effect is fine.
  const assistantOpenRef = useRef(assistantOpen);
  // When the assistant panel closes, the cursor is almost always still
  // sitting right on/near the laptop (that's where the close button was),
  // so lifting suppression immediately would fire the "power on" trigger
  // the instant the panel disappears — even though the user never actually
  // approached the laptop on purpose. To prevent that, closing the panel
  // arms this "needs rearm" flag; activation stays blocked until proximity
  // drops below LAPTOP_REARM_PROXIMITY (cursor has genuinely moved away),
  // after which a real approach can trigger it normally.
  const laptopNeedsRearmRef = useRef(false);
  const prevAssistantOpenRef = useRef(assistantOpen);
  const [layout, setLayout] = useState([]);

  useEffect(() => {
    assistantOpenRef.current = assistantOpen;
    if (prevAssistantOpenRef.current && !assistantOpen) {
      laptopNeedsRearmRef.current = true;
    }
    prevAssistantOpenRef.current = assistantOpen;
  }, [assistantOpen]);

  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        size: 1.5 + Math.random() * 2.5,
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 12 + Math.random() * 16,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    [],
  );

  // Recompute hotspot pixel rects whenever the container resizes. This is
  // the only place hotspot POSITION changes — infrequent, so plain React
  // state is fine here (nothing to do with the 60fps mousemove path below).
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const recompute = () => {
      const { width, height } = node.getBoundingClientRect();
      const { scale, offsetX, offsetY } = getCoverLayout(width, height);

      const next = HOTSPOTS.map((h) => {
        if (h.kind === "polygon") {
          const points = h.pointsF.map((p) => ({
            x: p.xF * NATURAL_WIDTH * scale + offsetX,
            y: p.yF * NATURAL_HEIGHT * scale + offsetY,
          }));
          const xs = points.map((p) => p.x);
          const ys = points.map((p) => p.y);
          return {
            id: h.id,
            kind: "polygon",
            points,
            clipPath: `polygon(${points
              .map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`)
              .join(", ")})`,
            bbox: {
              left: Math.min(...xs),
              top: Math.min(...ys),
              width: Math.max(...xs) - Math.min(...xs),
              height: Math.max(...ys) - Math.min(...ys),
            },
          };
        }
        const left = h.leftF * NATURAL_WIDTH * scale + offsetX;
        const top = h.topF * NATURAL_HEIGHT * scale + offsetY;
        const w = h.widthF * NATURAL_WIDTH * scale;
        const ht = h.heightF * NATURAL_HEIGHT * scale;
        return {
          id: h.id,
          kind: "rect",
          steam: h.steam,
          left,
          top,
          width: w,
          height: ht,
          core: h.core,
          bloom: h.bloom,
        };
      });

      rectsRef.current = Object.fromEntries(next.map((r) => [r.id, r]));
      setLayout(next);
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  // Cursor spotlight + hotspot proximity glow. One mousemove listener, one
  // rAF loop, direct style mutation only — no React state on the hot path,
  // so this never triggers a re-render regardless of cursor speed.
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return undefined;

    let raf = null;
    let pending = null;

    const proximityToRect = (x, y, rect) => {
      const insideX = x >= rect.left && x <= rect.left + rect.width;
      const insideY = y >= rect.top && y <= rect.top + rect.height;
      if (insideX && insideY) return 1;

      const dx = Math.max(rect.left - x, 0, x - (rect.left + rect.width));
      const dy = Math.max(rect.top - y, 0, y - (rect.top + rect.height));
      const dist = Math.hypot(dx, dy);
      return smoothstep(1 - dist / PROXIMITY_RADIUS_PX);
    };

    const handleMove = (e) => {
      pending = { x: e.clientX, y: e.clientY };
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        if (!pending) return;
        const { x, y } = pending;

        // While the assistant panel is open, it visually covers the laptop
        // hotspot. Treat proximity as zero and skip the activation check
        // entirely — the cursor passing over/near that screen region
        // (e.g. to reach the panel's close button) must never count as
        // "approaching the laptop," since nobody can see it happen.
        const laptopSuppressed = assistantOpenRef.current;

        // Laptop proximity is computed first so the ambient spotlight
        // can recede near the screen — otherwise the two light sources
        // wash into each other and the screen glow reads as invisible.
        const laptop = rectsRef.current.laptop;
        const laptopProximity =
          !laptopSuppressed && laptop
            ? laptop.kind === "polygon"
              ? proximityToPolygon(x, y, laptop.points)
              : 0
            : 0;

        // Once the panel has closed, activation stays blocked until the
        // cursor has genuinely moved away from the laptop first — this is
        // what stops it from powering on the instant the panel disappears
        // while the cursor is still sitting where the close button was.
        if (
          laptopNeedsRearmRef.current &&
          !laptopSuppressed &&
          laptopProximity < LAPTOP_REARM_PROXIMITY
        ) {
          laptopNeedsRearmRef.current = false;
        }

        if (
          !laptopSuppressed &&
          !laptopNeedsRearmRef.current &&
          !laptopOnRef.current &&
          laptopProximity > LAPTOP_ACTIVATION_THRESHOLD
        ) {
          laptopOnRef.current = true;
          if (screenOffRef.current) {
            screenOffRef.current.style.opacity = "0";
          }
        }
        // Before the first activation, the screen is fully off — no
        // glow, no spotlight recede. After, it behaves exactly as
        // before: proximity-driven, in and out, for the rest of the
        // session. While suppressed (assistant panel open), it's forced
        // back to 0 regardless of laptopOnRef, so no glow leaks out from
        // under the panel either.
        const laptopEffectiveProximity =
          !laptopSuppressed && laptopOnRef.current ? laptopProximity : 0;
        if (spotlightRef.current) {
          const spotlightStrength = 1 - laptopEffectiveProximity * 0.85;
          const a1 = (0.08 * spotlightStrength).toFixed(3);
          const a2 = (0.03 * spotlightStrength).toFixed(3);
          spotlightRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(124,92,255,${a1}), rgba(92,225,230,${a2}) 35%, transparent 65%)`;
        }

        for (const id of Object.keys(rectsRef.current)) {
          const rect = rectsRef.current[id];
          const proximity =
            rect.kind === "polygon"
              ? id === "laptop"
                ? laptopEffectiveProximity
                : proximityToPolygon(x, y, rect.points)
              : proximityToRect(x, y, rect);

          const core = coreRefs.current[id];
          const bloom = bloomRefs.current[id];

          if (rect.kind === "polygon") {
            if (core) core.style.opacity = (proximity * 0.28).toFixed(3);
            if (bloom) bloom.style.opacity = (proximity * 0.16).toFixed(3);

            continue;
          }

          if (rect.steam) {
            const steam = steamRefs.current[id];
            if (steam) steam.style.opacity = proximity.toFixed(3);
          }
        }
      });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 overflow-hidden bg-void pointer-events-none"
    >
      <img
        src="/wallpaper.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          objectPosition: `${OBJECT_POSITION.x * 100}% ${OBJECT_POSITION.y * 100}%`,
          filter: "saturate(1.05) brightness(0.9)",
        }}
        draggable={false}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-[#050712]/85 via-[#0a0e1e]/76 to-[#0c1024]/88" />

      {/* <div className="absolute -top-1/4 -left-1/4 h-[60vmax] w-[60vmax] rounded-full bg-accent-purple/14 blur-[140px] animate-aurora" />
      <div
        className="absolute -bottom-1/3 -right-1/4 h-[55vmax] w-[55vmax] rounded-full bg-accent-blue/12 blur-[140px] animate-aurora"
        style={{ animationDelay: "4s" }}
      /> */}

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-white animate-float-slow"
          style={{
            width: p.size,
            height: p.size,
            top: `${p.top}%`,
            left: `${p.left}%`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]" />

      {/* Interactive hotspot glow — kept tight and low-opacity on purpose.
          Blur radii/insets/opacity caps here are deliberately small so this
          reads as a subtle "the object is lighting up" effect, not a large
          glowing blob covering the desktop. */}
      {layout.map((r) => {
        if (r.kind === "polygon") {
          return (
            <div
              key={r.id}
              className="absolute inset-0"
              style={{ clipPath: r.clipPath }}
            >
              {/* Screen-off cover — hides the baked-in dashboard graphic
                  until the cursor first approaches. Fades out once,
                  permanently, via laptopOnRef — never re-appears this
                  session. */}
              <div
                ref={screenOffRef}
                className="absolute inset-0 bg-void"
                style={{
                  opacity: 1,
                  transition: "opacity 1.4s ease-out",
                  willChange: "opacity",
                }}
              />
              {/* Directional wash — screen lit from within, not a flat
                  glow. Confined entirely to the clip-path shape above,
                  so it can never bleed onto the desk. */}
              <div
                ref={(el) => {
                  bloomRefs.current[r.id] = el;
                }}
                className="absolute inset-0 mix-blend-screen"
                style={{
                  opacity: 0,
                  willChange: "opacity",
                  background:
                    "linear-gradient(135deg, rgba(79,124,255,0.9) 0%, rgba(92,225,230,0.5) 45%, transparent 80%)",
                }}
              />
              {/* Brighter focal point, biased toward where the dashboard
                  graphic sits — reads as "screen just became active". */}
              <div
                ref={(el) => {
                  coreRefs.current[r.id] = el;
                }}
                className="absolute inset-0 mix-blend-screen"
                style={{
                  opacity: 0,
                  willChange: "opacity",
                  background:
                    "radial-gradient(circle at 62% 45%, rgba(92,225,230,0.95) 0%, rgba(92,225,230,0.35) 35%, transparent 65%)",
                }}
              />
            </div>
          );
        }

        return (
          <div
            key={r.id}
            className="absolute"
            style={{
              left: r.left,
              top: r.top,
              width: r.width,
              height: r.height,
            }}
          >
            {/* Coffee steam — three wisps, each looping continuously via CSS
                keyframes (cheap, GPU-driven); the whole group's opacity is
                the only thing the rAF loop touches, so it fades in/out with
                cursor proximity without restarting the loop each frame. */}
            {r.steam && (
              <div
                ref={(el) => {
                  steamRefs.current[r.id] = el;
                }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-14"
                style={{ opacity: 0 }}
              >
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-6 w-2.5 rounded-full bg-white/90 blur-[3px] animate-steam-1" />
                <span className="absolute bottom-0 left-[30%] h-5 w-2.5 rounded-full bg-white/80 blur-[3px] animate-steam-2" />
                <span className="absolute bottom-0 left-[70%] h-5 w-2.5 rounded-full bg-white/80 blur-[3px] animate-steam-3" />
              </div>
            )}
          </div>
        );
      })}

      <div ref={spotlightRef} className="absolute inset-0" />
    </div>
  );
}
