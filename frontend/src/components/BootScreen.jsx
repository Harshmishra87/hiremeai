import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BOOT_LINES } from "../data/constants";

const LINE_DELAY_MS = 280;
const EXIT_DELAY_MS = 300;
const EXIT_DURATION_MS = 400;

export default function BootScreen({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (exiting) {
      const doneTimer = setTimeout(onComplete, EXIT_DURATION_MS);
      return () => clearTimeout(doneTimer);
    }
    if (visibleLines >= BOOT_LINES.length) {
      const exitTimer = setTimeout(() => setExiting(true), EXIT_DELAY_MS);
      return () => clearTimeout(exitTimer);
    }
    const t = setTimeout(() => setVisibleLines((n) => n + 1), LINE_DELAY_MS);
    return () => clearTimeout(t);
  }, [visibleLines, exiting, onComplete]);

  const handleSkip = () => {
    setExiting(true);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: EXIT_DURATION_MS / 1000 }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-void text-ink-primary font-mono"
        >
          <button
            data-cursor="magnetic"
            onClick={handleSkip}
            className="absolute top-6 right-6 text-xs text-ink-muted hover:text-ink-primary transition px-3 py-1.5 rounded-lg hover:bg-white/8 focus-ring"
          >
            Skip
          </button>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-10 h-16 w-16 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-blue shadow-glow flex items-center justify-center"
          >
            <span className="text-2xl font-display font-bold text-white">
              H
            </span>
          </motion.div>
          <div className="w-72 text-sm space-y-2">
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-ink-secondary"
              >
                <span className="text-accent-violet">
                  {i === BOOT_LINES.length - 1 ? "✓" : "›"}
                </span>
                <span>{line}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 h-1 w-56 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-purple to-accent-cyan"
              initial={{ width: "0%" }}
              animate={{
                width: `${(visibleLines / BOOT_LINES.length) * 100}%`,
              }}
              transition={{ duration: 0.25 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
