import { useEffect, useState } from "react";
import { Download, ExternalLink, FileWarning, Loader2 } from "lucide-react";
import { CANDIDATE } from "../data/constants";

const ZOOM_MIN = 60;
const ZOOM_MAX = 200;
const ZOOM_STEP = 10;

/**
 * Renders the actual uploaded resume PDF — never AI-parsed/placeholder
 * content. Uses the browser's own PDF engine inside an iframe (the same
 * approach macOS Preview / Chrome's PDF viewer use), which already gives
 * real page navigation and its own native zoom; the toolbar below adds an
 * additional CSS-zoom layer plus a guaranteed download/open-in-tab path.
 */
export default function ResumeWindow() {
  const [status, setStatus] = useState("checking"); // 'checking' | 'ok' | 'missing'

  useEffect(() => {
    // iframe's own onError doesn't fire for a 404 PDF (only for network-
    // level failures), so we check the file actually exists ourselves.
    let cancelled = false;
    fetch(CANDIDATE.resumeUrl, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setStatus(res.ok ? "ok" : "missing");
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#1c1c1e]">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-white/10 bg-[#232326] shrink-0">
        <p className="text-xs text-ink-secondary truncate">
          {CANDIDATE.name} — Resume.pdf
        </p>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-px h-5 bg-white/10 mx-1" />
          <a
            data-cursor="magnetic"
            href={CANDIDATE.resumeUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open in new tab"
            className="h-7 w-7 rounded-lg bg-white/8 hover:bg-white/14 transition flex items-center justify-center text-ink-secondary"
          >
            <ExternalLink size={13} />
          </a>
          <a
            data-cursor="magnetic"
            href={CANDIDATE.resumeUrl}
            download
            className="flex items-center gap-1.5 text-xs font-medium bg-white text-[#1c1c1e] px-3 py-1.5 rounded-lg hover:bg-white/90 transition"
          >
            <Download size={13} /> Download
          </a>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden bg-[#3a3a3c]">
        {status === "checking" && (
          <div className="flex flex-col items-center justify-center gap-2 h-full text-white/50 pt-24">
            <Loader2 size={20} className="animate-spin" />
            <p className="text-xs">Loading resume…</p>
          </div>
        )}

        {status === "missing" && (
          <div className="flex flex-col items-center justify-center gap-3 text-center h-full text-white/70 max-w-sm mx-auto pt-20">
            <FileWarning size={28} />
            <p className="text-sm">
              Couldn't find a file at{" "}
              <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded">
                {CANDIDATE.resumeUrl}
              </code>
              . Place the real resume PDF at that exact path in{" "}
              <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded">
                public/
              </code>
              .
            </p>
          </div>
        )}

        {status === "ok" && (
          <iframe
            title="Resume PDF"
            src={`${CANDIDATE.resumeUrl}#toolbar=1`}
            className="w-full h-full border-0"
          />
        )}
      </div>
    </div>
  );
}
