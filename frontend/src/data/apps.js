import {
  AppleLogo,
  Briefcase,
  Envelope,
  FileText,
  Folder,
  GraduationCap,
  Images,
  RocketLaunch,
  Robot,
  TerminalWindow,
  Trophy,
} from "@phosphor-icons/react";

export const APPS = {
  resume: {
    id: "resume",
    title: "Resume.pdf",
    icon: FileText,
    width: 620,
    height: 560,
  },
  experience: {
    id: "experience",
    title: "Experience",
    icon: Briefcase,
    width: 560,
    height: 520,
  },
  projects: {
    id: "projects",
    title: "Projects",
    icon: RocketLaunch,
    width: 680,
    height: 560,
  },
  education: {
    id: "education",
    title: "Education",
    icon: GraduationCap,
    width: 520,
    height: 420,
  },
  achievements: {
    id: "achievements",
    title: "Achievements",
    icon: Trophy,
    width: 580,
    height: 540,
  },
  contact: {
    id: "contact",
    title: "Contact",
    icon: Envelope,
    width: 640,
    height: 460,
  },
  interview: {
    id: "interview",
    title: "AI Interview Assistant",
    icon: Robot,
    width: 600,
    height: 600,
  },
  terminal: {
    id: "terminal",
    title: "Terminal",
    icon: TerminalWindow,
    width: 620,
    height: 440,
  },
  gallery: {
    id: "gallery",
    title: "Gallery",
    icon: Images,
    width: 620,
    height: 520,
  },
  finder: {
    id: "finder",
    title: "Finder",
    icon: Folder,
    width: 560,
    height: 420,
  },
  about: {
    id: "about",
    title: "About",
    icon: AppleLogo,
    width: 480,
    height: 380,
  },
};

// What actually sits on the desktop. Deliberately minimal, matching exactly
// what's meant to be there — everything else (Terminal, AI Interview,
// Gallery) is still reachable via the Dock and Finder.
export const DESKTOP_ICONS = [
  { id: "resume", label: "Resume.pdf", icon: FileText, asset: "resume" },
  {
    id: "experience",
    label: "Experience",
    icon: Briefcase,
    asset: "experience",
  },
  { id: "projects", label: "Projects", icon: RocketLaunch, asset: "projects" },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    asset: "education",
  },
  {
    id: "achievements",
    label: "Achievements",
    icon: Trophy,
    asset: "achievements",
  },
  { id: "contact", label: "Contact", icon: Envelope, asset: "contact" },
];

// Finder is the full launcher — it still surfaces everything, including the
// apps intentionally left off the desktop itself.
export const FINDER_ICONS = [
  ...DESKTOP_ICONS,
  { id: "terminal", label: "Terminal", icon: TerminalWindow },
  { id: "interview", label: "AI Interview", icon: Robot },
  { id: "gallery", label: "Gallery", icon: Images },
];
