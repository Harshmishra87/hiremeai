import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { PROJECTS } from "../data/projects";
import { useResume } from "../context/ResumeContext.jsx";

export default function ProjectsWindow() {
  const { resume, hasResume } = useResume();

  const projects = hasResume ? resume.projects : PROJECTS.map((p) => p.title);

  return (
    <div className="p-6 h-full os-scroll overflow-y-auto">
      <h2 className="text-xl font-display font-semibold mb-1">Projects</h2>
      <p className="text-sm text-ink-secondary mb-5">
        Things I've shipped, from idea to demo.
      </p>
      {!hasResume && (
        <p className="text-xs text-ink-muted mb-4 italic">
          Showing placeholder content — upload a resume to the backend to see
          real projects here.
        </p>
      )}

      {projects.length === 0 && (
        <p className="text-sm text-ink-muted">
          No projects found in the uploaded resume.
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {projects.map((title, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-surface rounded-xl p-4 flex items-start gap-3"
          >
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-accent-purple/40 to-accent-blue/30 flex items-center justify-center shrink-0">
              <Rocket size={16} className="text-white" />
            </div>
            <p className="text-sm font-medium text-ink-primary leading-snug pt-1.5">
              {title}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
