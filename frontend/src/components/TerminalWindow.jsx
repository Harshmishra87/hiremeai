import { useEffect, useRef, useState } from "react";
import { CANDIDATE, TERMINAL_HELP } from "../data/constants";
import { SKILLS_FLAT } from "../data/skills";
import { PROJECTS } from "../data/projects";
import { EXPERIENCE } from "../data/experience";
import { useResume } from "../context/ResumeContext.jsx";

const PROMPT = "visitor@harshos:~$";

function initialLines() {
  return [
    {
      type: "system",
      text: `Welcome to HarshOS Terminal. Type "help" to see available commands.`,
    },
  ];
}

export default function TerminalWindow({ onOpenApp }) {
  const { resume, hasResume } = useResume();
  const [lines, setLines] = useState(initialLines);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const print = (text, type = "output") => {
    setLines((prev) => [...prev, { type, text }]);
  };

  const runCommand = (raw) => {
    const cmd = raw.trim().toLowerCase();
    setLines((prev) => [...prev, { type: "command", text: raw }]);

    switch (cmd) {
      case "":
        break;
      case "help":
        TERMINAL_HELP.forEach((h) => print(`  ${h.cmd.padEnd(12)} ${h.desc}`));
        break;
      case "about":
        print(`${CANDIDATE.name} — ${CANDIDATE.role}. ${CANDIDATE.tagline}`);
        break;
      case "resume":
        print("Opening Resume.pdf...");
        onOpenApp?.("resume");
        break;
      case "skills":
        print((hasResume ? resume.skills : SKILLS_FLAT).join("\n"));
        break;
      case "projects":
        if (hasResume) {
          resume.projects.forEach((p) => print(`  ${p}`));
        } else {
          PROJECTS.forEach((p) => print(`  ${p.title} — ${p.tech.join(", ")}`));
        }
        break;
      case "experience":
        if (hasResume) {
          resume.experiences.forEach((e) =>
            print(`  ${e.role} @ ${e.company} (${e.duration})`),
          );
        } else {
          EXPERIENCE.forEach((e) =>
            print(`  ${e.role} @ ${e.org} (${e.period})`),
          );
        }
        break;
      case "contact":
        print("Opening Contact window...");
        onOpenApp?.("contact");
        break;
      case "education":
        if (hasResume) {
          resume.education.forEach((ed) => print(`  ${ed}`));
        } else {
          print("B.Tech, Computer Science — Engineering College (2021 — 2025)");
        }
        break;
      case "achievements":
        if (hasResume) {
          if (resume.certifications.length) {
            resume.certifications.forEach((c) => print(`  ${c}`));
          } else {
            print("No certifications found in the uploaded resume.");
          }
        } else {
          print(
            "Upload a resume to the backend to see real achievements here.",
          );
        }
        break;
      case "interview":
        print("Opening AI Interview Assistant...");
        onOpenApp?.("interview");
        break;
      case "clear":
        setLines([]);
        return;
      case "hire":
        print("Excellent choice 🚀");
        print("Opening contact window...");
        setTimeout(() => onOpenApp?.("contact"), 500);
        break;
      default:
        print(
          `command not found: ${cmd}. Type "help" for a list of commands.`,
          "error",
        );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) {
      setLines((prev) => [...prev, { type: "command", text: "" }]);
      setInput("");
      return;
    }
    runCommand(input);
    setHistory((prev) => [...prev, input]);
    setHistoryIdx(-1);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const idx =
        historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(idx);
      setInput(history[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      const idx = historyIdx + 1;
      if (idx >= history.length) {
        setHistoryIdx(-1);
        setInput("");
      } else {
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    }
  };

  return (
    <div
      className="h-full bg-[#0a0e14] font-mono text-[13px] p-4 overflow-y-auto os-scroll"
      onClick={() => inputRef.current?.focus()}
      ref={scrollRef}
    >
      {lines.map((line, i) => {
        if (line.type === "command") {
          return (
            <div key={i} className="flex gap-2 text-ink-primary">
              <span className="text-accent-cyan">{PROMPT}</span>
              <span>{line.text}</span>
            </div>
          );
        }
        if (line.type === "system") {
          return (
            <p key={i} className="text-accent-violet whitespace-pre-wrap mb-1">
              {line.text}
            </p>
          );
        }
        if (line.type === "error") {
          return (
            <p key={i} className="text-red-400 whitespace-pre-wrap">
              {line.text}
            </p>
          );
        }
        return (
          <p key={i} className="text-ink-secondary whitespace-pre-wrap">
            {line.text}
          </p>
        );
      })}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 text-ink-primary mt-0.5"
      >
        <span className="text-accent-cyan shrink-0">{PROMPT}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          className="flex-1 bg-transparent outline-none text-ink-primary caret-accent-cyan"
        />
      </form>
    </div>
  );
}
