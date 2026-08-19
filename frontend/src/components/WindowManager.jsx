import { lazy, Suspense } from "react";
import Window from "./Window.jsx";
import { APPS } from "../data/apps";

// Lazy-loaded so each window's code only ships to the browser once it's
// actually opened, instead of all windows being bundled into the initial load.
const CONTENT_MAP = {
  resume: lazy(() => import("./ResumeWindow.jsx")),
  experience: lazy(() => import("./ExperienceWindow.jsx")),
  projects: lazy(() => import("./ProjectsWindow.jsx")),
  education: lazy(() => import("./EducationWindow.jsx")),
  achievements: lazy(() => import("./AchievementsWindow.jsx")),
  contact: lazy(() => import("./ContactWindow.jsx")),
  terminal: lazy(() => import("./TerminalWindow.jsx")),
  gallery: lazy(() => import("./GalleryWindow.jsx")),
  about: lazy(() => import("./AboutWindow.jsx")),
  finder: lazy(() => import("./FinderWindow.jsx")),
  // 'interview' intentionally omitted — rendered by InterviewSidebar instead.
};

function ContentFallback() {
  return (
    <div className="h-full w-full flex items-center justify-center text-ink-muted text-sm">
      Loading…
    </div>
  );
}

export default function WindowManager({ windows, activeId, wm, onOpenApp }) {
  return (
    <>
      {Object.values(windows).map((w) => {
        if (w.id === "interview") return null;
        const meta = APPS[w.id];
        const Content = CONTENT_MAP[w.id];
        if (!meta || !Content) return null;
        return (
          <Window
            key={w.id}
            id={w.id}
            title={meta.title}
            icon={meta.icon}
            x={w.x}
            y={w.y}
            z={w.z}
            width={meta.width}
            height={meta.height}
            minimized={w.minimized}
            maximized={w.maximized}
            isActive={activeId === w.id}
            onClose={() => wm.closeWindow(w.id)}
            onMinimize={() => wm.minimizeWindow(w.id)}
            onToggleMaximize={(livePos) => wm.toggleMaximize(w.id, livePos)}
            onFocus={() => wm.focusWindow(w.id)}
          >
            <Suspense fallback={<ContentFallback />}>
              <Content onOpenApp={onOpenApp} />
            </Suspense>
          </Window>
        );
      })}
    </>
  );
}
