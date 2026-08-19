import { useRef } from "react";
import Draggable from "react-draggable";
import { motion, AnimatePresence } from "framer-motion";
import { TOPBAR_HEIGHT, DOCK_CLEARANCE } from "../data/layout";

export default function Window({
  id,
  title,
  icon,
  x = 100,
  y = 80,
  z = 10,
  minimized,
  maximized,
  isActive = true,
  width = 640,
  height = 480,
  onClose,
  onMinimize,
  onToggleMaximize,
  onFocus,
  children,
}) {
  const nodeRef = useRef(null);
  // Tracks the window's live on-screen position without lifting it into
  // React state on every drag tick — cheap, and lets maximize/restore
  // capture the exact spot the user last dragged the window to.
  const posRef = useRef({ x, y });

  const titlebar = (
    <div className="window-titlebar flex items-center gap-2 px-4 py-2.5 border-b border-white/10 cursor-move shrink-0 bg-white/[0.03]">
      <div className="flex items-center gap-2 group">
        <button
          onClick={onClose}
          aria-label="Close window"
          className="h-3 w-3 rounded-full bg-[#ff5f57] hover:brightness-90 flex items-center justify-center focus-ring"
        />
        <button
          onClick={() =>
            maximized ? onToggleMaximize(posRef.current) : onMinimize()
          }
          aria-label={maximized ? "Restore window" : "Minimize window"}
          className="h-3 w-3 rounded-full bg-[#febc2e] hover:brightness-90 focus-ring"
        />
        <button
          onClick={() => onToggleMaximize(posRef.current)}
          aria-label={maximized ? "Restore window" : "Maximize window"}
          className="h-3 w-3 rounded-full bg-[#28c840] hover:brightness-90 focus-ring"
        />
      </div>
      <div className="flex-1 text-center text-xs font-medium text-ink-secondary flex items-center justify-center gap-1.5 pr-14">
        {icon && <span>{icon}</span>}
        <span>{title}</span>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {!minimized &&
        (maximized ? (
          <motion.div
            key="maximized"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onMouseDown={onFocus}
            style={{
              position: "fixed",
              top: TOPBAR_HEIGHT + 8,
              left: 16,
              right: 16,
              bottom: DOCK_CLEARANCE + 8,
              zIndex: z,
            }}
            className={`glass-panel rounded-2xl shadow-glass flex flex-col overflow-hidden transition-[opacity,filter] duration-200 ${
              isActive
                ? "opacity-100 saturate-100"
                : "opacity-90 saturate-[0.85]"
            }`}
          >
            {titlebar}
            <div className="flex-1 min-h-0 overflow-y-auto os-scroll">
              {children}
            </div>
          </motion.div>
        ) : (
          // Keying on the window's authoritative x/y makes Draggable remount
          // (and re-read defaultPosition) only when the parent explicitly
          // moves the window — e.g. restoring from maximize — never mid-drag,
          // since ordinary dragging is handled entirely inside react-draggable.
          <Draggable
            key={`drag-${x}-${y}`}
            nodeRef={nodeRef}
            handle=".window-titlebar"
            defaultPosition={{ x, y }}
            bounds="parent"
            onDrag={(_e, data) => {
              posRef.current = { x: data.x, y: data.y };
            }}
            onStop={(_e, data) => {
              posRef.current = { x: data.x, y: data.y };
            }}
          >
            <div
              ref={nodeRef}
              onMouseDown={onFocus}
              style={{
                position: "absolute",
                zIndex: z,
                width,
                height,
                maxWidth: "96vw",
                maxHeight: "88vh",
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ type: "spring", damping: 26, stiffness: 320 }}
                className={`glass-panel rounded-2xl shadow-glass flex flex-col overflow-hidden h-full w-full transition-[opacity,filter] duration-200 ${
                  isActive
                    ? "opacity-100 saturate-100"
                    : "opacity-90 saturate-[0.85]"
                }`}
              >
                {titlebar}
                <div className="flex-1 min-h-0 overflow-y-auto os-scroll">
                  {children}
                </div>
              </motion.div>
            </div>
          </Draggable>
        ))}
    </AnimatePresence>
  );
}
