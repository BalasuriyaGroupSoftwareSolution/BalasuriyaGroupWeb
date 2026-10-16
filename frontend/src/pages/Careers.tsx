import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Code2,
  GraduationCap,
  HeartHandshake,
  MapPin,
  Palmtree,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { Reveal } from "../components/Reveal";
import toast from "react-hot-toast";

interface JobOpening {
  id: string;
  title: string;
  division: string;
  location: string;
  type: string;
  experience: string;
  description: string;
}

const OPENINGS: JobOpening[] = [
  {
    id: "job_1",
    title: "Senior Civil / Structural Engineer",
    division: "Construction & Infrastructure",
    location: "Colombo / Site Visits",
    type: "Full-Time",
    experience: "4+ Years (BSc Engineering / IESL)",
    description: "Lead on-site structural inspections, contractor oversight, quality assurance, and bar-bending scheduling.",
  },
  {
    id: "job_2",
    title: "Full Stack Software Engineer",
    division: "Software & Digital Solutions",
    location: "Hybrid / Negombo & Colombo",
    type: "Full-Time",
    experience: "2+ Years (React, Node.js, TypeScript)",
    description: "Develop enterprise web and cloud platforms for group subsidiaries and external commercial clients.",
  },
  {
    id: "job_3",
    title: "Travel & Air Ticketing Consultant",
    division: "Tourism & Travel Bureau",
    location: "Andiambalama / Airport Desk",
    type: "Full-Time",
    experience: "2+ Years (Amadeus / Sabre / IATA)",
    description: "Handle international flight bookings, client itinerary curation, and embassy visa documentation dossiers.",
  },
  {
    id: "job_4",
    title: "Assistant Chartered Accountant",
    division: "Group Finance & Audit",
    location: "Head Office, Andiambalama",
    type: "Full-Time",
    experience: "Part-qualified CA Sri Lanka / CIMA",
    description: "Assist with multi-company ledger consolidation, payment reconciliations, and tax compliance.",
  },
  {
    id: "job_5",
    title: "Project Quantity Surveyor (QS)",
    division: "Construction & Infrastructure",
    location: "Active Construction Sites",
    type: "Full-Time",
    experience: "3+ Years (BSc QS / NDT)",
    description: "Manage Bills of Quantities (BOQ), interim contractor valuations, and material cost controls.",
  },
];

export default function Careers() {
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantNote, setApplicantNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleApply(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success(`Application received for ${selectedJob?.title}! Our HR office will review your profile.`);
      setSubmitting(false);
      setSelectedJob(null);
      setApplicantName("");
      setApplicantEmail("");
      setApplicantPhone("");
      setApplicantNote("");
    }, 800);
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-navy py-20 text-white">
        <div className="pointer-events-none absolute -left-16 top-0 h-72 w-72 rounded-full bg-brand-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-brand-gold/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-brand-gold ring-1 ring-brand-gold/40"
          >
            <Users className="h-3.5 w-3.5" />
            Careers at Balasuriya Group
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold sm:text-5xl"
          >
            Build Your Career With a Visionary Group
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-white/85 text-base sm:text-lg"
          >
            Join a dynamic team of engineers, tourism specialists, software developers, and financial leaders
            driving growth across Sri Lanka and beyond.
          </motion.p>
        </div>
      </section>

      {/* Culture & Values */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="text-center">
            <h2 className="font-display text-2xl font-bold text-brand-navy">Why Join With Us?</h2>
            <p className="mt-1 text-sm text-gray-500">We invest in our people and empower talent</p>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="card text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-brand-steel mb-3">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-brand-navy text-sm">Professional Development</h3>
              <p className="mt-1 text-xs text-gray-600">
                Continuous mentorship under certified civil engineers, senior developers, and travel directors.
              </p>
            </div>

            <div className="card text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700 mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-brand-navy text-sm">Multi-Sector Mobility</h3>
              <p className="mt-1 text-xs text-gray-600">
                Gain diverse cross-functional exposure across engineering, technology, tourism, and corporate finance.
              </p>
            </div>

            <div className="card text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-3">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-brand-navy text-sm">Competitive Rewards</h3>
              <p className="mt-1 text-xs text-gray-600">
                Industry-standard compensation, project performance incentives, and comprehensive health insurance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
            Current Opportunities
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-brand-navy">
            Open Positions Across All Divisions
          </h2>
        </Reveal>

        <div className="mt-10 space-y-4">
          {OPENINGS.map((job) => (
            <div
              key={job.id}
              className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:shadow-lg transition"
            >
              <div>
                <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-xs font-semibold text-brand-navy">
                  {job.division}
                </span>
                <h3 className="mt-2 font-display font-bold text-lg text-brand-navy">{job.title}</h3>
                <p className="mt-1 text-xs text-gray-600 max-w-xl">{job.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {job.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> {job.experience}
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setSelectedJob(job)}
                  className="btn-primary text-xs py-2 px-6 w-full sm:w-auto"
                >
                  Apply Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 sm:p-6 backdrop-blur-sm">
          <div className="flex min-h-full items-start sm:items-center justify-center py-6 sm:py-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl my-auto"
            >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-brand-navy">Apply for Position</h3>
                <p className="text-xs text-brand-accent">{selectedJob.title}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="mt-4 space-y-3">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  required
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Phone / WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Short Cover Note / LinkedIn URL</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your experience or link your resume…"
                  value={applicantNote}
                  onChange={(e) => setApplicantNote(e.target.value)}
                  className="input resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary text-xs">
                  {submitting ? "Submitting…" : "Submit Application"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
      )}
    </div>
  );
}
