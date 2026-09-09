import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { contactInfo } from "../data/companyProfile";

const WHATSAPP_ICON_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const summary = `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}`;

  function sendByEmail(e: FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Website enquiry from ${form.name || "a visitor"}`);
    const body = encodeURIComponent(summary);
    window.location.href = `mailto:${contactInfo.email}?subject=${subject}&body=${body}`;
  }

  function sendByWhatsApp() {
    const text = encodeURIComponent(summary);
    window.open(`${contactInfo.whatsapp}?text=${text}`, "_blank");
  }

  return (
    <div className="bg-brand-surface py-14">
      <div className="mx-auto max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-accent">Contact Us</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-brand-navy sm:text-4xl">
            Let's Talk About Your Next Project
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Whether it's a construction enquiry or planning your next trip, our team responds
            personally to every message.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5"
        >
          <div className="grid md:grid-cols-5">
            {/* Info panel */}
            <div className="relative col-span-2 overflow-hidden bg-brand-navy p-8 text-white sm:p-10">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-gold/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-brand-accent/30 blur-3xl" />

              <h2 className="relative font-display text-xl font-bold">Contact Information</h2>
              <p className="relative mt-2 text-sm text-white/70">
                Reach us directly, or send a message and we'll get back to you shortly.
              </p>

              <div className="relative mt-8 space-y-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                    <MapPin className="h-4 w-4 text-brand-gold" />
                  </span>
                  <p className="pt-1.5 text-sm text-white/85">{contactInfo.address}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Phone className="h-4 w-4 text-brand-gold" />
                  </span>
                  <a
                    href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                    className="pt-1.5 text-sm text-white/85 hover:text-white"
                  >
                    {contactInfo.phone}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Mail className="h-4 w-4 text-brand-gold" />
                  </span>
                  <a href={`mailto:${contactInfo.email}`} className="pt-1.5 text-sm text-white/85 hover:text-white">
                    {contactInfo.email}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Clock className="h-4 w-4 text-brand-gold" />
                  </span>
                  <p className="pt-1.5 text-sm text-white/85">Mon – Sat, 9:00 AM – 6:00 PM</p>
                </div>
              </div>

              <a
                href={contactInfo.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="relative mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1ebe57]"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d={WHATSAPP_ICON_PATH} />
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* Form panel */}
            <form onSubmit={sendByEmail} className="col-span-3 space-y-5 p-8 sm:p-10">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Your Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="label">Your Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Your Message</label>
                <textarea
                  rows={5}
                  required
                  value={form.message}
                  onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                  className="input resize-none"
                  placeholder="Tell us a little about what you need…"
                />
              </div>
              <button type="submit" className="btn-primary w-full sm:w-auto">
                Send Message
              </button>
              <p className="text-xs text-gray-400">
                This opens your email app with the message pre-filled — nothing leaves your device
                until you hit send.
              </p>
              <button
                type="button"
                onClick={sendByWhatsApp}
                className="text-xs font-medium text-brand-accent hover:underline"
              >
                Prefer WhatsApp? Send this message there instead →
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
