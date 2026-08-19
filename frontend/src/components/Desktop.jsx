import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";
import DesktopIcon from "./DesktopIcon.jsx";
import { DESKTOP_ICONS } from "../data/apps";

export default function Desktop({ onOpenApp, hideOrb }) {
  const [selected, setSelected] = useState(null);

  return (
    <div
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
            label={icon.label}
            selected={selected === icon.id}
            onSelect={() => setSelected(icon.id)}
            onOpen={() => onOpenApp(icon.id)}
          />
        ))}
      </div>

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
    </div>
  );
}
