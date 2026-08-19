import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { EXPERIENCE } from "../data/experience";
import { useResume } from "../context/ResumeContext.jsx";

export default function ExperienceWindow() {
  const { resume, hasResume } = useResume();

  const experiences = hasResume
    ? resume.experiences.map((e, i) => ({
        id: `exp-${i}`,
        role: e.role || "Role",
        org: e.company || "—",
        period: e.duration || "",
        summary: e.description || "",
        highlights: e.skills_used || [],
      }))
    : EXPERIENCE;

  return (
    <div className="p-8 h-full os-scroll overflow-y-auto">
      <h2 className="text-xl font-display font-semibold mb-1">Experience</h2>
      <p className="text-sm text-ink-secondary mb-8">
        A timeline of where I've built things.
      </p>
      {!hasResume && (
        <p className="text-xs text-ink-muted mb-4 italic">
          Showing placeholder content — upload a resume to the backend to see
          real data here.
        </p>
      )}

      <div className="relative pl-8">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-accent-purple via-accent-blue to-transparent" />
        <div className="space-y-8">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="relative"
            >
              <span className="absolute -left-8 top-1 h-6 w-6 rounded-full glass-surface flex items-center justify-center">
                <Briefcase size={12} className="text-accent-violet" />
              </span>
              <div className="glass-surface rounded-xl p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-ink-primary">{exp.role}</h3>
                  <span className="text-xs text-ink-muted font-mono">
                    {exp.period}
                  </span>
                </div>
                <p className="text-sm text-accent-cyan/90 mb-2">{exp.org}</p>
                {exp.summary && (
                  <p className="text-sm text-ink-secondary mb-3">
                    {exp.summary}
                  </p>
                )}
                {exp.highlights?.length > 0 && (
                  <ul className="space-y-1">
                    {exp.highlights.map((h) => (
                      <li
                        key={h}
                        className="text-xs text-ink-secondary flex gap-2"
                      >
                        <span className="text-accent-violet">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
