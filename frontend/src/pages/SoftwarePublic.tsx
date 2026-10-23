import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Cloud,
  Code2,
  Cpu,
  Database,
  Globe2,
  Layers,
  Lock,
  MessageSquare,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import { Reveal } from "../components/Reveal";
import { api, apiErrorMessage } from "../lib/api";
import toast from "react-hot-toast";

const SERVICES = [
  {
    icon: Code2,
    title: "Enterprise Web Applications",
    description:
      "Scalable, high-throughput web platforms built with React, Next.js, TypeScript, and modern microservices.",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    description:
      "Cross-platform iOS and Android applications with native performance using Flutter and React Native.",
  },
  {
    icon: Cloud,
    title: "Cloud Infrastructure & DevOps",
    description:
      "Resilient cloud architecture on AWS and Google Cloud, automated CI/CD pipelines, Docker, and Kubernetes orchestration.",
  },
  {
    icon: Cpu,
    title: "AI & Intelligent Automation",
    description:
      "Custom GenAI integration, predictive analytics, process automation, and intelligent document extraction.",
  },
  {
    icon: Lock,
    title: "Cyber Security & Auditing",
    description:
      "Role-Based Access Control (RBAC), end-to-end encryption, penetration testing, and ISO 27001 compliant coding practices.",
  },
  {
    icon: Database,
    title: "ERP & Custom Database Architecture",
    description:
      "Tailor-made Enterprise Resource Planning systems, real-time inventory synchronization, and distributed database engineering.",
  },
];

const TECH_STACK = {
  frontend: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Vue", "Framer Motion"],
  backend: ["Node.js", "TypeScript", "Express", "NestJS", "Python", "Go"],
  database: ["PostgreSQL", "Prisma ORM", "Redis", "MongoDB", "BigQuery"],
  cloud: ["AWS", "Google Cloud", "Docker", "Kubernetes", "GitHub Actions", "Terraform"],
  security: ["OAuth2 / OIDC", "JWT & MFA", "Helmet & WAF", "SSL/TLS 1.3", "Rate-Limiting"],
};

export default function SoftwarePublic() {
  // Interactive estimator state
  const [projectType, setProjectType] = useState("web_app");
  const [complexity, setComplexity] = useState("standard");
  const [needsAuth, setNeedsAuth] = useState(true);
  const [needsCloud, setNeedsCloud] = useState(true);

  // RFQ Form state
  const [rfqName, setRfqName] = useState("");
  const [rfqEmail, setRfqEmail] = useState("");
  const [rfqPhone, setRfqPhone] = useState("");
  const [rfqScope, setRfqScope] = useState("");
  const [submittingRfq, setSubmittingRfq] = useState(false);

  // Estimation calculation
  const estimatedCost = (() => {
    let base = 350000;
    if (projectType === "mobile_app") base = 480000;
    if (projectType === "enterprise_erp") base = 950000;
    if (projectType === "ai_solution") base = 750000;

    let multiplier = 1;
    if (complexity === "complex") multiplier = 1.6;
    if (complexity === "enterprise") multiplier = 2.4;

    let extras = 0;
    if (needsAuth) extras += 75000;
    if (needsCloud) extras += 120000;

    return Math.round((base * multiplier + extras) / 1000) * 1000;
  })();

  async function handleRfqSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmittingRfq(true);
    try {
      await api.post("/api/inquiries", {
        division: "SOFTWARE",
        name: rfqName,
        email: rfqEmail,
        phone: rfqPhone,
        subject: `Software Proposal Request: ${projectType.toUpperCase().replace(/_/g, " ")}`,
        message: rfqScope,
        details: {
          projectType,
          complexity,
          needsAuth,
          needsCloud,
          estimatedCostLkr: estimatedCost,
        },
      });
      toast.success("Software proposal request received! Our engineering lead will review your specs.");
      setRfqName("");
      setRfqEmail("");
      setRfqPhone("");
      setRfqScope("");
    } catch (err) {
      // Don't silently open the visitor's mail app — tell them it failed so they can retry
      // or choose "Send via email app" / WhatsApp themselves.
      toast.error(apiErrorMessage(err, "Your proposal request couldn't be sent. Please try again, or use WhatsApp."));
    } finally {
      setSubmittingRfq(false);
    }
  }

  return (
    <div>
      {/* High-Tech Hero */}
      <section className="relative overflow-hidden bg-brand-navy py-24 text-white">
        <div className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-brand-accent/25 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-brand-gold/20 blur-3xl animate-blob" />

        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-brand-gold ring-1 ring-brand-gold/40"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Balasuriya Software & Digital Solutions
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold tracking-tight sm:text-6xl"
          >
            Engineering Digital Excellence For Modern Enterprises
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-3xl text-lg text-white/85 leading-relaxed"
          >
            From scalable cloud architectures and custom ERP solutions to cross-platform mobile apps,
            our engineering team delivers mission-critical software built with security, performance,
            and agility.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <a href="#estimator" className="btn-primary bg-brand-gold text-brand-navy hover:bg-brand-gold/90">
              Calculate Project Estimate
            </a>
            <a href="#rfq" className="btn-secondary border-white/40 text-white hover:bg-white/10">
              Request Technical Proposal
            </a>
          </motion.div>
        </div>
      </section>

      {/* Division Leadership Spotlight */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-brand-surface p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy text-brand-gold font-bold text-xl">
                BS
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-brand-accent">
                  Technology Division Leadership
                </span>
                <h3 className="font-display font-bold text-lg text-brand-navy">
                  Led by Mr. Clemon Balasuriya & Mr. Shenal Fonseka
                </h3>
                <p className="text-xs text-gray-500">
                  Backed by enterprise architects, full-stack engineers, and cloud specialists.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center px-4 border-r border-gray-200">
                <span className="block font-bold text-brand-navy text-xl">99.9%</span>
                <span className="text-[11px] text-gray-500">SLA Uptime</span>
              </div>
              <div className="text-center px-4 border-r border-gray-200">
                <span className="block font-bold text-brand-navy text-xl">100%</span>
                <span className="text-[11px] text-gray-500">Code Coverage</span>
              </div>
              <div className="text-center px-4">
                <span className="block font-bold text-brand-navy text-xl">Agile</span>
                <span className="text-[11px] text-gray-500">2-Week Sprints</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
            Core Engineering
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-brand-navy">
            Our Software Capabilities
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            Comprehensive technology services from strategic architecture to deployment and 24/7 SLA maintenance.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((srv, i) => {
            const Icon = srv.icon;
            return (
              <Reveal key={srv.title} delay={i * 0.08}>
                <div className="card h-full transition duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-brand-navy">{srv.title}</h3>
                  <p className="mt-2 text-xs text-gray-600 leading-relaxed">{srv.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Technology Matrix */}
      <section className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
              Stack & Frameworks
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold">Battle-Tested Technology Matrix</h2>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(TECH_STACK).map(([category, items]) => (
              <div key={category} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <span className="text-xs uppercase font-semibold text-brand-gold tracking-wider">
                  {category}
                </span>
                <div className="mt-4 flex flex-wrap gap-2">
                  {items.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Estimator Section */}
      <section id="estimator" className="mx-auto max-w-4xl px-4 py-20">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
            Budget Transparency
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-brand-navy">
            Interactive Project Cost Calculator
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            Configure your technical requirements to generate an instant preliminary budgetary estimate.
          </p>
        </Reveal>

        <div className="mt-10 card p-8 shadow-xl">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="label">Solution Category</label>
              <select
                className="input"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
              >
                <option value="web_app">Custom Web Application / SaaS Platform</option>
                <option value="mobile_app">iOS & Android Mobile App (Flutter)</option>
                <option value="enterprise_erp">Enterprise ERP & Supply Chain System</option>
                <option value="ai_solution">AI & Machine Learning Integration</option>
              </select>
            </div>

            <div>
              <label className="label">Project Complexity & Scale</label>
              <select
                className="input"
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
              >
                <option value="standard">Standard (MVP, essential workflows)</option>
                <option value="complex">Advanced (Multi-role permissions, high concurrency)</option>
                <option value="enterprise">Enterprise (Multi-tenant, audit logs, SLA)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-6 border-t border-b border-gray-100 py-4 text-xs font-medium">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={needsAuth}
                onChange={(e) => setNeedsAuth(e.target.checked)}
                className="rounded border-gray-300 text-brand-navy focus:ring-brand-accent"
              />
              <span>Include Enterprise RBAC & OAuth Authentication</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={needsCloud}
                onChange={(e) => setNeedsCloud(e.target.checked)}
                className="rounded border-gray-300 text-brand-navy focus:ring-brand-accent"
              />
              <span>Include Automated CI/CD Cloud Provisioning (AWS/GCP)</span>
            </label>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-brand-navy p-6 text-white">
            <div>
              <span className="text-xs uppercase tracking-widest text-brand-gold">
                Estimated Development Budget
              </span>
              <div className="font-display text-3xl font-bold sm:text-4xl">
                LKR {estimatedCost.toLocaleString()}
                <span className="text-sm font-normal text-white/70 ml-2">
                  (~${Math.round(estimatedCost / 300).toLocaleString()} USD)
                </span>
              </div>
            </div>

            <a href="#rfq" className="btn-primary bg-brand-gold text-brand-navy hover:bg-brand-gold/90 text-xs py-2.5">
              Lock in Estimate with Proposal →
            </a>
          </div>
        </div>
      </section>

      {/* RFQ / Proposal Request Form */}
      <section id="rfq" className="bg-brand-surface py-20">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
              Consultation
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-brand-navy">
              Request a Technical Architecture Proposal
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Submit your project brief and receive an actionable architecture blueprint and milestone timeline within 24 hours.
            </p>
          </Reveal>

          <form onSubmit={handleRfqSubmit} className="mt-10 card p-8 sm:p-10 space-y-4 shadow-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shanilka Silva"
                  value={rfqName}
                  onChange={(e) => setRfqName(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. shanilka@techcorp.lk"
                  value={rfqEmail}
                  onChange={(e) => setRfqEmail(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">Contact Phone / WhatsApp</label>
              <input
                type="tel"
                placeholder="+94 77 000 0000"
                value={rfqPhone}
                onChange={(e) => setRfqPhone(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">Project Scope & Technical Objectives</label>
              <textarea
                rows={4}
                required
                placeholder="Describe your current challenge, target user base, integrations needed, and target release date…"
                value={rfqScope}
                onChange={(e) => setRfqScope(e.target.value)}
                className="input resize-none"
              />
            </div>

            <button type="submit" disabled={submittingRfq} className="btn-primary w-full py-3">
              {submittingRfq ? "Submitting Technical Brief…" : "Submit Technical Brief for Review"}
            </button>

            <p className="text-center text-xs text-gray-400">
              Protected by non-disclosure ethics. All technical ideas remain your intellectual property.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
