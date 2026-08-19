# HarshOS

An interactive, macOS-Sonoma-inspired operating system portfolio. Built with React, Vite, Tailwind CSS, and Framer Motion.

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Backend

HarshOS expects a backend running at `http://localhost:8000` with three endpoints:

- `POST /upload` — upload a resume PDF
- `POST /chat` — accepts `{ "question": string }` and streams back plain text
- `POST /reset` — clears the conversation

The base URL lives in `src/data/constants.js` (`API_BASE_URL`) if you need to point it elsewhere.

If the backend isn't running, the AI Interview window will show an inline error message instead of crashing — every other part of the OS works independently of it.

## Structure

```
src/
  components/     # Desktop, Window, Dock, TopBar, BootScreen, and every app window
  services/api.js # axios + streaming fetch wrapper for the backend
  hooks/          # useWindowManager (open/close/focus/z-index), useChat (streaming chat)
  data/           # static content: apps registry, projects, experience, skills, constants
  pages/Home.jsx  # composes the whole OS shell
```

## Customizing content

Edit the files in `src/data/` — `constants.js` (name, contact info, boot lines, quick questions),
`projects.js`, `experience.js`, and `skills.js` — to update the portfolio content without touching
any component code.

## Replacing the resume file

Drop a PDF at `public/resume.pdf` — the download button in the Resume window links to `/resume.pdf`.
