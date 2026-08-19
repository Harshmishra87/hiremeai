import { motion, AnimatePresence } from "framer-motion";
import InterviewWindow from "./InterviewWindow.jsx";

/**
 * Renders the AI Interview assistant as a fixed sidebar docked to the right
 * edge of the screen (like Intercom/Crisp), rather than a draggable window.
 * Slides in/out with Framer Motion; collapsing hands control back to the
 * caller (which shows the floating orb again).
 */
export default function InterviewSidebar({ open, onCollapse, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="interview-sidebar"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed top-9 right-0 bottom-0 z-[70] w-full max-w-[480px] glass-panel border-l border-white/10 shadow-glass flex flex-col"
        >
          <InterviewWindow onCollapse={onCollapse} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
