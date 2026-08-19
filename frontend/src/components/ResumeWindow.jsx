import { Download, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { CANDIDATE } from "../data/constants";
import { SKILL_GROUPS } from "../data/skills";
import { EXPERIENCE } from "../data/experience";
import { PROJECTS } from "../data/projects";
import { useResume } from "../context/ResumeContext.jsx";

function Section({ title, children }) {
  return (
    <section className="mb-7">
      <h3 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-accent-violet mb-3">
        {title}
      </h3>

      {children}

      <div className="mt-6 border-b border-black/[0.06]" />
    </section>
  );
}

export default function ResumeWindow() {
  const { resume, hasResume, loading, error, refetch } = useResume();

  const name = resume?.name || CANDIDATE.name;
  const email = resume?.email || CANDIDATE.email;
  const phone = resume?.phone || CANDIDATE.phone;

  const skills = hasResume
    ? resume.skills
    : SKILL_GROUPS.flatMap((g) => g.items);

  const experiences = hasResume
    ? resume.experiences
    : EXPERIENCE.map((e) => ({
        company: e.org,
        role: e.role,
        duration: e.period,
        description: e.summary,
      }));

  const education = hasResume
    ? resume.education
    : ["B.Tech, Computer Science — Engineering College"];

  const projects = hasResume ? resume.projects : PROJECTS.map((p) => p.title);

  const certifications = hasResume ? resume.certifications : [];

  return (
    <div className="bg-[#f6f4ee] text-[#1c1c1e] h-full os-scroll overflow-y-auto flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-black/10 bg-[#f6f4ee]/95 backdrop-blur px-8 py-4">
        <div className="min-w-0">
          <h1 className="text-xl font-display font-bold truncate">{name}</h1>

          <p className="text-xs text-black/50 truncate">
            {email}
            {phone ? ` · ${phone}` : ""}
          </p>
        </div>

        <a
          href={CANDIDATE.resumeUrl}
          download
          className="flex items-center gap-1.5 text-xs font-medium bg-[#1c1c1e] text-white px-3.5 py-2 rounded-lg hover:bg-black transition shrink-0"
        >
          <Download size={13} />
          Download
        </a>
      </header>

      <div className="max-w-2xl mx-auto px-8 py-8 font-body w-full">
        {loading && (
          <div className="flex items-center gap-2 text-xs text-black/40 mb-6">
            <Loader2 size={13} className="animate-spin" />
            Loading resume from the backend…
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mb-6">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />

            <div className="flex-1">
              <p className="font-medium">Showing placeholder content</p>

              <p className="text-amber-700/80 mt-0.5">{error}</p>
            </div>

            <button
              onClick={refetch}
              className="flex items-center gap-1 text-amber-800 hover:text-amber-900 font-medium shrink-0"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        )}

        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="text-xs px-2.5 py-1 rounded-full bg-black/[0.05] text-black/70"
              >
                {skill}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Experience">
          <div className="space-y-4">
            {experiences.map((exp, index) => (
              <div key={index}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold">
                    {exp.role}

                    <span className="font-normal text-black/50">
                      {" "}
                      · {exp.company}
                    </span>
                  </p>

                  <p className="text-[11px] text-black/40 shrink-0 font-mono">
                    {exp.duration}
                  </p>
                </div>

                {exp.description && (
                  <p className="text-[13px] text-black/60 mt-1 leading-relaxed">
                    {exp.description}
                  </p>
                )}

                {exp.skills_used?.length > 0 && (
                  <p className="text-[11px] text-black/40 mt-1">
                    {exp.skills_used.join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Education">
          <ul className="text-sm text-black/75 space-y-1.5">
            {education.map((ed, index) => (
              <li key={index}>{ed}</li>
            ))}
          </ul>
        </Section>

        <Section title="Projects">
          <div className="space-y-1.5">
            {projects.map((project, index) => (
              <p key={index} className="text-sm text-black/75">
                {project}
              </p>
            ))}
          </div>
        </Section>

        {certifications.length > 0 && (
          <section>
            <h3 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-accent-violet mb-3">
              Certifications
            </h3>

            <ul className="text-sm text-black/70 list-disc list-inside space-y-1.5">
              {certifications.map((certification, index) => (
                <li key={index}>{certification}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
