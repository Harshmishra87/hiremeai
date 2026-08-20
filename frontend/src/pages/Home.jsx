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

const ONBOARDING_STORAGE_KEY = "harshos-onboarding-seen";
// Delay before onboarding appears, so it doesn't compete for attention
// with the interview sidebar's own auto-open animation right after boot.
const ONBOARDING_SHOW_DELAY_MS = 1400;

export default function Home() {
  const [booted, setBooted] = useState(() => {
    try {
      return sessionStorage.getItem("harshos-booted") === "1";
    } catch {
      return true;
    }
  });
  const [bouncingId, setBouncingId] = useState(null);
  const [windowGeometry, setWindowGeometry] = useState(() => ({
    headerHeight: TOPBAR_HEIGHT,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  }));
  // First-visit onboarding (resume spotlight + AI orb hint). Starts false
  // regardless of history so nothing flashes before the localStorage check
  // below runs; it's turned on only for visitors who haven't dismissed it
  // before.
  const [onboardingActive, setOnboardingActive] = useState(false);
  // Computed synchronously at mount (unlike onboardingActive, which only
  // flips on after ONBOARDING_SHOW_DELAY_MS) so the interview auto-open
  // effect below can know *immediately* whether a first-time visitor is
  // still waiting on onboarding — otherwise the sidebar could sneak open
  // during that delay window, covering the resume before onboarding even
  // has a chance to render.
  const [onboardingPending, setOnboardingPending] = useState(() => {
    try {
      return localStorage.getItem(ONBOARDING_STORAGE_KEY) !== "1";
    } catch {
      return false;
    }
  });
  const wm = useWindowManager();

  useEffect(() => {
    const updateGeometry = () => {
      const header = document.querySelector("[data-window-header]");
      const next = {
        headerHeight: header?.getBoundingClientRect().height ?? TOPBAR_HEIGHT,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };
      setWindowGeometry(next);
      wm.clampWindows(next);
    };

    updateGeometry();
    window.addEventListener("resize", updateGeometry);
    const header = document.querySelector("[data-window-header]");
    const ro = header ? new ResizeObserver(updateGeometry) : null;
    ro?.observe(header);
    return () => {
      window.removeEventListener("resize", updateGeometry);
      ro?.disconnect();
    };
  }, [booted, wm.clampWindows]);

  const handleBootComplete = () => {
    try {
      sessionStorage.setItem("harshos-booted", "1");
    } catch {}

    setBooted(true);
  };

  const dismissOnboarding = useCallback(() => {
    setOnboardingActive(false);
    setOnboardingPending(false);
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
    } catch {}
  }, []);

  // Show onboarding once per visitor, permanently — gated on localStorage
  // (unlike the boot screen's sessionStorage flag) since this should guide
  // first-time visitors specifically, not reappear every new tab/session.
  useEffect(() => {
    if (!booted || !onboardingPending) return undefined;
    const t = setTimeout(
      () => setOnboardingActive(true),
      ONBOARDING_SHOW_DELAY_MS,
    );
    return () => clearTimeout(t);
  }, [booted, onboardingPending]);

  const openApp = useCallback(
    (id) => {
      // Opening the resume is one of the two ways onboarding is dismissed
      // (the other is the "Got it" button inside it). Every entry point —
      // dock, top bar menu, desktop icon, and the resume paper hotspot
      // itself — already calls openApp("resume"), so hooking it here
      // covers all of them without touching those components.
      if (id === "resume" && onboardingActive) {
        dismissOnboarding();
      }

      // Already open: just focus it — never spawn a duplicate.
      if (wm.isOpen(id)) {
        wm.focusWindow(id);
      } else {
        const meta = APPS[id] ?? { width: 600, height: 480 };
        const openCount = Object.keys(wm.windows).length;
        const cascade = openCount * 20;

        const workTop = windowGeometry.headerHeight;
        const renderedWidth = Math.min(
          meta.width,
          windowGeometry.viewportWidth * 0.96,
        );
        const renderedHeight = Math.min(
          meta.height,
          windowGeometry.viewportHeight * 0.88,
        );
        const maxX = Math.max(0, windowGeometry.viewportWidth - renderedWidth);
        const maxY = Math.max(
          workTop,
          windowGeometry.viewportHeight - DOCK_CLEARANCE - renderedHeight,
        );
        const x = Math.min(
          Math.max(
            0,
            (windowGeometry.viewportWidth - renderedWidth) / 2 + cascade,
          ),
          maxX,
        );
        const y = Math.min(
          Math.max(
            workTop + 16,
            workTop +
              (windowGeometry.viewportHeight -
                workTop -
                DOCK_CLEARANCE -
                renderedHeight) /
                2 +
              cascade,
          ),
          maxY,
        );

        wm.openWindow(id, { x, y });
      }
      setBouncingId(id);
      setTimeout(() => setBouncingId(null), 500);
    },
    [wm, onboardingActive, dismissOnboarding, windowGeometry.headerHeight],
  );

  const handleDockClick = useCallback(
    (id) => {
      const win = wm.windows[id];
      if (!win) {
        openApp(id);
      } else if (win.minimized) {
        wm.restoreWindow(id);
      } else if (wm.activeId === id) {
        wm.minimizeWindow(id);
      } else {
        wm.focusWindow(id);
      }
      setBouncingId(id);
      setTimeout(() => setBouncingId(null), 500);
    },
    [wm, openApp],
  );

  const interviewWindow = wm.windows.interview;
  const interviewExpanded =
    Boolean(interviewWindow) && !interviewWindow.minimized;

  // The AI Interview sidebar is the one exception to "nothing opens on
  // startup" — it's meant to greet visitors like a chat widget. Every other
  // app still opens strictly on demand. openApp already guards against
  // duplicates, so this can never spawn a second instance.
  //
  // Gated on !onboardingPending: for a first-time visitor, onboarding's
  // resume spotlight is the primary CTA and must get the screen first —
  // the sidebar would otherwise cover the resume before onboarding even
  // renders. Returning visitors (onboardingPending already false) see no
  // change: the sidebar still auto-opens immediately, exactly as before.
  useEffect(() => {
    if (booted && !wm.isOpen("interview") && !onboardingPending) {
      const t = setTimeout(() => openApp("interview"), 500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted, onboardingPending]);

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
          <TopBar onAboutClick={() => openApp("about")} />
          <Desktop
            onOpenApp={openApp}
            hideOrb={interviewExpanded}
            onboardingActive={onboardingActive}
            onDismissOnboarding={dismissOnboarding}
          />
          <WindowManager
            windows={wm.windows}
            activeId={wm.activeId}
            wm={wm}
            onOpenApp={openApp}
            windowGeometry={windowGeometry}
          />
          <InterviewSidebar
            open={interviewExpanded}
            onCollapse={() => wm.minimizeWindow("interview")}
            onClose={() => wm.closeWindow("interview")}
          />
          <Dock
            onOpen={handleDockClick}
            windows={wm.windows}
            bouncingId={bouncingId}
          />
        </>
      )}
    </div>
  );
}
