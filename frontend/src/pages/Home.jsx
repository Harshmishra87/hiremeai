import { useCallback, useEffect, useState } from "react";
import Wallpaper from "../components/Wallpaper.jsx";
import BootScreen from "../components/BootScreen.jsx";
import TopBar from "../components/TopBar.jsx";
import Dock from "../components/Dock.jsx";
import Desktop from "../components/Desktop.jsx";
import WindowManager from "../components/WindowManager.jsx";
import InterviewSidebar from "../components/InterviewSidebar.jsx";
import { useWindowManager } from "../hooks/useWindowManager.js";
import { APPS } from "../data/apps";
import { TOPBAR_HEIGHT, DOCK_CLEARANCE } from "../data/layout";

export default function Home() {
  const [booted, setBooted] = useState(() => {
    try {
      return sessionStorage.getItem("harshos-booted") === "1";
    } catch {
      return true;
    }
  });
  const [bouncingId, setBouncingId] = useState(null);
  const wm = useWindowManager();

  const handleBootComplete = () => {
    console.log("BOOT COMPLETE");

    try {
      sessionStorage.setItem("harshos-booted", "1");
    } catch {}

    setBooted(true);
  };

  const openApp = useCallback(
    (id) => {
      // Already open: just focus it — never spawn a duplicate.
      if (wm.isOpen(id)) {
        wm.focusWindow(id);
      } else {
        const meta = APPS[id] ?? { width: 600, height: 480 };
        const openCount = Object.keys(wm.windows).length;
        const cascade = openCount * 20;

        const workTop = TOPBAR_HEIGHT;
        const workHeight = window.innerHeight - TOPBAR_HEIGHT - DOCK_CLEARANCE;

        const x = Math.max(16, (window.innerWidth - meta.width) / 2 + cascade);
        const y = Math.max(
          workTop + 16,
          workTop + (workHeight - meta.height) / 2 + cascade,
        );

        wm.openWindow(id, { x, y });
      }
      setBouncingId(id);
      setTimeout(() => setBouncingId(null), 500);
    },
    [wm],
  );

  const handleMenuClick = useCallback(
    (id) => {
      const map = {
        resume: "resume",
        projects: "projects",
        contact: "contact",
        about: "about",
      };
      openApp(map[id] ?? id);
    },
    [openApp],
  );

  const interviewWindow = wm.windows.interview;
  const interviewExpanded =
    Boolean(interviewWindow) && !interviewWindow.minimized;

  // The AI Interview sidebar is the one exception to "nothing opens on
  // startup" — it's meant to greet visitors like a chat widget. Every other
  // app still opens strictly on demand. openApp already guards against
  // duplicates, so this can never spawn a second instance.
  useEffect(() => {
    if (booted && !wm.isOpen("interview")) {
      const t = setTimeout(() => openApp("interview"), 500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted]);

  return (
    <div className="relative h-screen w-screen overflow-hidden font-body">
      {/* assistantOpen tells Wallpaper when the InterviewSidebar is covering
          the laptop hotspot region, so it can suppress the laptop's
          proximity/activation logic entirely while hidden behind the
          panel — see Wallpaper.jsx for details. */}
      <Wallpaper assistantOpen={interviewExpanded} />
      {!booted && <BootScreen onComplete={handleBootComplete} />}
      {booted && (
        <>
          <TopBar onMenuClick={handleMenuClick} />
          <Desktop onOpenApp={openApp} hideOrb={interviewExpanded} />
          <WindowManager
            windows={wm.windows}
            activeId={wm.activeId}
            wm={wm}
            onOpenApp={openApp}
          />
          <InterviewSidebar
            open={interviewExpanded}
            onCollapse={() => wm.minimizeWindow("interview")}
            onClose={() => wm.closeWindow("interview")}
          />
          <Dock
            onOpen={openApp}
            openIds={Object.keys(wm.windows)}
            bouncingId={bouncingId}
          />
        </>
      )}
    </div>
  );
}
