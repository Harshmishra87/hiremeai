import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Briefcase, Rocket, Sparkles } from "lucide-react";
import { useResume } from "../context/ResumeContext.jsx";

function Counter({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const duration = 900;
    const tick = (t) => {
      const p = Math.min((t - start) / duration, 1);
      setN(Math.floor(p * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{n}</span>;
}

export default function AchievementsWindow() {
  const { resume, hasResume } = useResume();

  const certifications = hasResume ? resume.certifications : [];
  const stats = hasResume
    ? [
        { label: "Certifications", value: certifications.length, icon: Award },
        {
          label: "Experiences",
          value: resume.experiences.length,
          icon: Briefcase,
        },
        { label: "Projects", value: resume.projects.length, icon: Rocket },
        { label: "Skills", value: resume.skills.length, icon: Sparkles },
      ]
    : [];

  return (
    <div className="p-8 h-full os-scroll overflow-y-auto">
      <h2 className="text-xl font-display font-semibold mb-1">Achievements</h2>
      <p className="text-sm text-ink-secondary mb-6">
        Milestones along the way.
      </p>

      {!hasResume && (
        <p className="text-sm text-ink-muted italic">
          Upload a resume to the backend to see certifications and achievements
          here.
        </p>
      )}

      {hasResume && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-surface rounded-xl p-4 text-center"
              >
                <s.icon size={18} className="mx-auto mb-2 text-accent-violet" />
                <p className="text-2xl font-display font-bold text-gradient">
                  <Counter value={s.value} />
                </p>
                <p className="text-[10px] text-ink-muted uppercase tracking-wide mt-1">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>

          {certifications.length > 0 ? (
            <div className="space-y-2">
              {certifications.map((c, i) => (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 glass-surface rounded-lg px-4 py-3"
                >
                  <Award size={14} className="text-accent-cyan shrink-0" />
                  <span className="text-sm text-ink-primary">{c}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-muted">
              No certifications found in the uploaded resume.
            </p>
          )}
        </>
      )}
    </div>
  );
}
