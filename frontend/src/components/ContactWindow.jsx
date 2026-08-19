import { useState } from "react";
import {
  Mail,
  Phone,
  Linkedin,
  Github,
  MapPin,
  Send,
  Check,
} from "lucide-react";
import { CANDIDATE } from "../data/constants";

const LINKS = [
  { icon: Mail, label: CANDIDATE.email, href: `mailto:${CANDIDATE.email}` },
  { icon: Phone, label: CANDIDATE.phone, href: `tel:${CANDIDATE.phone}` },
  { icon: Linkedin, label: "LinkedIn Profile", href: CANDIDATE.linkedin },
  { icon: Github, label: "GitHub Profile", href: CANDIDATE.github },
  { icon: MapPin, label: CANDIDATE.location, href: null },
];

export default function ContactWindow() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
    setTimeout(() => setSent(false), 3200);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="p-8 h-full os-scroll overflow-y-auto grid sm:grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-display font-semibold mb-1">Contact</h2>
        <p className="text-sm text-ink-secondary mb-6">
          Let's talk about opportunities.
        </p>
        <div className="space-y-2">
          {LINKS.map((l) => {
            const Content = (
              <div className="flex items-center gap-3 glass-surface rounded-lg px-4 py-3 hover:bg-white/10 transition">
                <l.icon size={15} className="text-accent-violet shrink-0" />
                <span className="text-sm text-ink-primary">{l.label}</span>
              </div>
            );
            return l.href ? (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                {Content}
              </a>
            ) : (
              <div key={l.label}>{Content}</div>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-surface rounded-2xl p-5 space-y-3 h-fit"
      >
        <h3 className="text-sm font-semibold text-ink-primary mb-1">
          Send a message
        </h3>
        <input
          type="text"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-[#161b38] border border-white/10 rounded-lg px-3 py-2 text-sm !text-white placeholder:text-ink-muted focus-ring outline-none"
          style={{ backgroundColor: "#161b38", color: "#ffffff" }}
        />
        <input
          type="email"
          placeholder="Your email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-[#161b38] border border-white/10 rounded-lg px-3 py-2 text-sm !text-white placeholder:text-ink-muted focus-ring outline-none"
          style={{ backgroundColor: "#161b38", color: "#ffffff" }}
        />
        <textarea
          rows={4}
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full bg-white/6 border border-white/10 rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus-ring outline-none resize-none"
        />
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 text-sm font-medium bg-accent-purple hover:bg-accent-violet transition text-white py-2.5 rounded-lg"
        >
          {sent ? <Check size={15} /> : <Send size={14} />}
          {sent ? "Message sent" : "Send message"}
        </button>
      </form>
    </div>
  );
}
