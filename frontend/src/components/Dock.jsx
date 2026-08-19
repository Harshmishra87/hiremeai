import { motion } from "framer-motion";
import {
  Folder,
  FileText,
  Rocket,
  Bot,
  TerminalSquare,
  Mail,
  Github,
  Linkedin,
} from "lucide-react";
import { CANDIDATE } from "../data/constants";

const DOCK_ITEMS = [
  // { id: "finder", label: "Finder", icon: Folder, kind: "app" },
  { id: "resume", label: "Resume", icon: FileText, kind: "app" },
  { id: "projects", label: "Projects", icon: Rocket, kind: "app" },
  { id: "interview", label: "AI Interview", icon: Bot, kind: "app" },
  { id: "terminal", label: "Terminal", icon: TerminalSquare, kind: "app" },
  { id: "contact", label: "Contact", icon: Mail, kind: "app" },
  {
    id: "github",
    label: "GitHub",
    icon: Github,
    kind: "link",
    href: CANDIDATE.github,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    kind: "link",
    href: CANDIDATE.linkedin,
  },
];

function DockItem({ item, onOpen, isOpen, bounce }) {
  const content = (
    <motion.button
      onClick={() => item.kind === "app" && onOpen(item.id)}
      whileHover={{ y: -8, scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      animate={bounce ? { y: [0, -14, 0] } : { y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="relative flex flex-col items-center justify-center group"
      aria-label={item.label}
    >
      <div className="relative h-11 w-11 rounded-xl glass-surface flex items-center justify-center shadow-glass group-hover:shadow-glow transition-shadow overflow-visible">
        <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <item.icon size={20} className="text-ink-primary relative" />
      </div>

      <div className="h-5 w-11 mt-0.5 overflow-hidden opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
        <div className="h-11 w-11 rounded-xl glass-surface flex items-center justify-center scale-y-[-1] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.5),transparent)]">
          <item.icon size={20} className="text-ink-primary" />
        </div>
      </div>

      {isOpen && (
        <span className="absolute -bottom-2 h-1 w-1 rounded-full bg-accent-cyan shadow-[0_0_6px_rgba(92,225,230,0.8)]" />
      )}
      <span className="pointer-events-none absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-black/85 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
        {item.label}
      </span>
    </motion.button>
  );

  if (item.kind === "link") {
    return (
      <a href={item.href} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }
  return content;
}

export default function Dock({ onOpen, openIds = [], bouncingId }) {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40">
      <div className="relative flex items-end gap-2.5 px-3.5 py-2.5 rounded-2xl glass-panel shadow-dock backdrop-blur-xl">
        <div className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        {DOCK_ITEMS.map((item) => (
          <DockItem
            key={item.id}
            item={item}
            onOpen={onOpen}
            isOpen={openIds.includes(item.id)}
            bounce={bouncingId === item.id}
          />
        ))}
      </div>
    </div>
  );
}
