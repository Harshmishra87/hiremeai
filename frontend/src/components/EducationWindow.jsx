import { GraduationCap } from "lucide-react";
import { useResume } from "../context/ResumeContext.jsx";

const FALLBACK_EDUCATION = [
  "B.Tech, Computer Science — Engineering College (2021 — 2025)",
];

export default function EducationWindow() {
  const { resume, hasResume } = useResume();
  const education = hasResume ? resume.education : FALLBACK_EDUCATION;

  return (
    <div className="p-8 h-full os-scroll overflow-y-auto">
      <h2 className="text-xl font-display font-semibold mb-1">Education</h2>
      <p className="text-sm text-ink-secondary mb-6">Academic background.</p>
      {!hasResume && (
        <p className="text-xs text-ink-muted mb-4 italic">
          Showing placeholder content — upload a resume to the backend to see
          real data here.
        </p>
      )}

      <div className="space-y-3">
        {education.length === 0 && (
          <p className="text-sm text-ink-muted">
            No education entries found in the uploaded resume.
          </p>
        )}
        {education.map((entry, i) => (
          <div
            key={i}
            className="glass-surface rounded-2xl p-5 flex items-start gap-4"
          >
            <div className="h-11 w-11 rounded-xl bg-accent-purple/20 flex items-center justify-center shrink-0">
              <GraduationCap size={20} className="text-accent-violet" />
            </div>
            <p className="text-sm text-ink-primary leading-relaxed pt-1.5">
              {entry}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
