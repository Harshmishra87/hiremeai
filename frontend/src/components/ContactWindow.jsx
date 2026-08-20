import { useState } from "react";
import emailjs from "@emailjs/browser";
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

// EmailJS config — swap these for env vars later if you want to keep them
// out of the client bundle source, but the public key is safe to expose
// (it's designed to be used client-side).
const EMAILJS_SERVICE_ID = "service_vo5birb";
const EMAILJS_TEMPLATE_ID = "template_5o67has";
const EMAILJS_PUBLIC_KEY = "mDZ8zLOA-6qLPDale";

export default function ContactWindow() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  // "idle" | "sending" | "sent" | "error" — replaces the old boolean `sent`
  // so the button/UI can distinguish in-flight and failed states too.
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    if (status === "sending") return;

    setStatus("sending");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: form.name,
          email: form.email,
          reply_to: form.email,
          message: form.message,
        },
        EMAILJS_PUBLIC_KEY,
      );

      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 3200);
    } catch (error) {
      console.error("EmailJS send failed:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3200);
    }
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
          disabled={status === "sending"}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium bg-accent-purple hover:bg-accent-violet transition text-white py-2.5 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "sent" ? <Check size={15} /> : <Send size={14} />}
          {status === "sending"
            ? "Sending…"
            : status === "sent"
              ? "Message sent"
              : "Send message"}
        </button>
        {status === "error" && (
          <p className="text-xs text-red-400 text-center pt-1">
            Something went wrong — please try again or email me directly.
          </p>
        )}
      </form>
    </div>
  );
}
