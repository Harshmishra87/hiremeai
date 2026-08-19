export const APPS = {
  resume: {
    id: "resume",
    title: "Resume.pdf",
    icon: "📄",
    width: 620,
    height: 560,
  },
  experience: {
    id: "experience",
    title: "Experience",
    icon: "💼",
    width: 560,
    height: 520,
  },
  projects: {
    id: "projects",
    title: "Projects",
    icon: "🚀",
    width: 680,
    height: 560,
  },
  education: {
    id: "education",
    title: "Education",
    icon: "🎓",
    width: 520,
    height: 420,
  },
  achievements: {
    id: "achievements",
    title: "Achievements",
    icon: "🏆",
    width: 580,
    height: 540,
  },
  contact: {
    id: "contact",
    title: "Contact",
    icon: "📬",
    width: 640,
    height: 460,
  },
  interview: {
    id: "interview",
    title: "AI Interview Assistant",
    icon: "🤖",
    width: 600,
    height: 600,
  },
  terminal: {
    id: "terminal",
    title: "Terminal",
    icon: "🖥",
    width: 620,
    height: 440,
  },
  gallery: {
    id: "gallery",
    title: "Gallery",
    icon: "📷",
    width: 620,
    height: 520,
  },
  finder: {
    id: "finder",
    title: "Finder",
    icon: "📁",
    width: 560,
    height: 420,
  },
  about: { id: "about", title: "About", icon: "🍎", width: 480, height: 380 },
};

// What actually sits on the desktop. Deliberately minimal, matching exactly
// what's meant to be there — everything else (Terminal, AI Interview,
// Gallery) is still reachable via the Dock and Finder.
export const DESKTOP_ICONS = [
  { id: "resume", label: "Resume.pdf", icon: "📄" },
  { id: "experience", label: "Experience", icon: "💼" },
  { id: "projects", label: "Projects", icon: "🚀" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "achievements", label: "Achievements", icon: "🏆" },
  { id: "contact", label: "Contact", icon: "📬" },
];

// Finder is the full launcher — it still surfaces everything, including the
// apps intentionally left off the desktop itself.
export const FINDER_ICONS = [
  ...DESKTOP_ICONS,
  { id: "terminal", label: "Terminal", icon: "🖥" },
  { id: "interview", label: "AI Interview", icon: "🤖" },
  { id: "gallery", label: "Gallery", icon: "📷" },
];
