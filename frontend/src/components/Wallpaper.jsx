import { useEffect, useMemo, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useParallaxLayers } from "../hooks/useParallaxLayers";
import { TOPBAR_HEIGHT, DOCK_CLEARANCE } from "../data/layout";

// Hard limits from spec — the character must never travel further than this,
// regardless of screen size or cursor speed.
const MAX_TRANSLATE_X = 45;
const MAX_TRANSLATE_Y = 35;

const MAX_ROTATE_Y = 18;
const MAX_ROTATE_X = 12;

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export default function Wallpaper() {
  const gridRef = useRef(null);
  const glowRef = useRef(null);
  const particlesRef = useRef(null);

  useParallaxLayers([
    { ref: particlesRef, factor: 6 },
    { ref: gridRef, factor: 10 },
    { ref: glowRef, factor: 22 },
  ]);

  const particles = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        size: 1.5 + Math.random() * 3,
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 10 + Math.random() * 16,
        opacity: 0.2 + Math.random() * 0.5,
      })),
    [],
  );

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springConfig = { stiffness: 120, damping: 20, mass: 0.7 };
  const x = useSpring(rawX, springConfig);
  const y = useSpring(rawY, springConfig);
  const rotateY = useTransform(
    x,
    [-MAX_TRANSLATE_X, MAX_TRANSLATE_X],
    [-MAX_ROTATE_Y, MAX_ROTATE_Y],
  );
  const rotateX = useTransform(
    y,
    [-MAX_TRANSLATE_Y, MAX_TRANSLATE_Y],
    [MAX_ROTATE_X, -MAX_ROTATE_X],
  );
  const glowX = useTransform(x, (v) => v * 1.2);
  const glowY = useTransform(y, (v) => v * 1.2);
  const shadowX = useTransform(x, (v) => v * -0.3);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return undefined;

    const handleMove = (e) => {
      const nx = clamp(
        (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2),
        -1,
        1,
      );
      const ny = clamp(
        (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2),
        -1,
        1,
      );
      rawX.set(nx * MAX_TRANSLATE_X);
      rawY.set(ny * MAX_TRANSLATE_Y);
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-void pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#070a16] via-[#0c1024] to-[#141a3d]" />

      <div
        ref={gridRef}
        className="absolute -inset-8 opacity-[0.035] will-change-transform"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div ref={glowRef} className="absolute -inset-10 will-change-transform">
        <div className="absolute -top-1/4 -left-1/4 h-[70vmax] w-[70vmax] rounded-full bg-accent-purple/25 blur-[130px] animate-aurora" />
        <div
          className="absolute -bottom-1/3 -right-1/4 h-[65vmax] w-[65vmax] rounded-full bg-accent-blue/20 blur-[130px] animate-aurora"
          style={{ animationDelay: "4s" }}
        />
        <div className="absolute top-1/3 right-1/4 h-[42vmax] w-[42vmax] rounded-full bg-accent-cyan/12 blur-[110px] animate-float-slower" />
        <div
          className="absolute bottom-1/4 left-1/3 h-[30vmax] w-[30vmax] rounded-full bg-accent-violet/14 blur-[100px] animate-float-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/[0.04] to-transparent" />

      <div
        ref={particlesRef}
        className="absolute inset-0 will-change-transform"
      >
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
      </div>

      <div
        className="hidden md:flex absolute left-0 right-0 items-center justify-center"
        style={{ top: TOPBAR_HEIGHT, bottom: DOCK_CLEARANCE }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            top: TOPBAR_HEIGHT,
            bottom: DOCK_CLEARANCE,
          }}
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative"
          >
            {/* Shadow */}
            <motion.div
              style={{ x: shadowX }}
              className="absolute left-1/2 -translate-x-1/2 bottom-[-40px] w-[50vw] h-[80px] rounded-full bg-black/40 blur-3xl"
            />

            {/* Glow */}
            <motion.div
              style={{ x: glowX, y: glowY }}
              className="absolute inset-0 scale-110 rounded-full bg-gradient-to-b from-accent-purple/25 via-accent-blue/20 to-transparent blur-[80px]"
            />

            {/* Character */}
            <motion.div
              style={{
                x,
                y,
                rotateX,
                rotateY,
                transformPerspective: 1200,
                transformStyle: "preserve-3d",
              }}
              className="relative"
            >
              <img
                src="/portrait.png"
                alt="Harsh Mishra"
                draggable={false}
                className="select-none object-contain"
                style={{
                  width: "min(95vw, 1400px)",
                  height: "min(95vh, 1200px)",

                  filter:
                    "drop-shadow(0 40px 80px rgba(0,0,0,0.45)) drop-shadow(0 0 60px rgba(124,92,255,0.35))",

                  userSelect: "none",
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)]" />
    </div>
  );
}
