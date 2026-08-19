import { useCallback, useState } from "react";

let zCounter = 10;

/**
 * Window state shape:
 * { id, minimized, maximized, z, x, y, prevX, prevY }
 *
 * x/y is the window's position while NOT maximized. prevX/prevY is only
 * used to remember where to restore to when un-maximizing — it's captured
 * at the exact moment maximize is toggled (including any live drag offset),
 * so restore always lands back where the user actually left the window.
 */
export function useWindowManager() {
  const [windows, setWindows] = useState({});
  const [activeId, setActiveId] = useState(null);

  const openWindow = useCallback((id, { x = 100, y = 80 } = {}) => {
    setWindows((prev) => {
      // Already open: focus it instead of creating a duplicate.
      if (prev[id]) {
        zCounter += 1;
        return {
          ...prev,
          [id]: { ...prev[id], minimized: false, z: zCounter },
        };
      }
      zCounter += 1;
      return {
        ...prev,
        [id]: {
          id,
          minimized: false,
          maximized: false,
          z: zCounter,
          x,
          y,
          prevX: x,
          prevY: y,
        },
      };
    });
    setActiveId(id);
  }, []);

  const closeWindow = useCallback((id) => {
    setWindows((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const focusWindow = useCallback((id) => {
    zCounter += 1;
    setWindows((prev) =>
      prev[id]
        ? { ...prev, [id]: { ...prev[id], z: zCounter, minimized: false } }
        : prev,
    );
    setActiveId(id);
  }, []);

  const minimizeWindow = useCallback((id) => {
    setWindows((prev) =>
      prev[id] ? { ...prev, [id]: { ...prev[id], minimized: true } } : prev,
    );
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  /**
   * Toggle maximize/restore. `livePosition` (optional) is the window's
   * actual on-screen position at the moment of the click — captured by the
   * Window component from its Draggable instance — so restoring lands
   * exactly where the user last dragged it, not back at the original spot.
   */
  const toggleMaximize = useCallback((id, livePosition) => {
    zCounter += 1;
    const nextZ = zCounter;
    setWindows((prev) => {
      const win = prev[id];
      if (!win) return prev;

      if (!win.maximized) {
        const pos = livePosition ?? { x: win.x, y: win.y };
        return {
          ...prev,
          [id]: {
            ...win,
            maximized: true,
            prevX: pos.x,
            prevY: pos.y,
            z: nextZ,
          },
        };
      }

      return {
        ...prev,
        [id]: {
          ...win,
          maximized: false,
          x: win.prevX,
          y: win.prevY,
          z: nextZ,
        },
      };
    });
    setActiveId(id);
  }, []);

  const isOpen = useCallback((id) => Boolean(windows[id]), [windows]);

  return {
    windows,
    activeId,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximize,
    isOpen,
  };
}
