import { motion } from "framer-motion";
import {
  CheckCircle2,
  Droplets,
  Globe2,
  Leaf,
  Recycle,
  Scale,
  ShieldCheck,
  Sun,
  Users2,
} from "lucide-react";
import { Reveal } from "../components/Reveal";

export default function Sustainability() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-brand-navy to-slate-900 py-20 text-white">
        <div className="pointer-events-none absolute -left-16 top-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-brand-gold/20 blur-3xl animate-blob" />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-400/40"
          >
            <Leaf className="h-3.5 w-3.5" />
            Environmental, Social & Corporate Governance (ESG)
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold sm:text-5xl"
          >
            Building Sustainably, Leading Ethically
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-white/85 text-base sm:text-lg"
          >
            At Balasuriya Group, progress and responsibility go hand in hand. Discover our corporate
            frameworks for eco-friendly construction, responsible tourism, and governance integrity.
          </motion.p>
        </div>
      </section>

      {/* 3 Pillars */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          <Reveal delay={0}>
            <div className="card h-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-4">
                <Leaf className="h-6 w-6" />
              </div>
              <h2 className="font-display font-bold text-xl text-brand-navy">Environmental Care</h2>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Minimizing ecological footprint across every construction site through sustainable material sourcing,
                dust suppression, and renewable energy integration.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  Solar panel & battery readiness in design
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  Construction waste sorting & recycling
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  Rainwater harvesting integration
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card h-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 mb-4">
                <Users2 className="h-6 w-6" />
              </div>
              <h2 className="font-display font-bold text-xl text-brand-navy">Social Responsibility</h2>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Empowering local Sri Lankan communities, upholding strict worker safety standards on-site, and
                supporting ethical community tourism.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  Zero-harm site safety protocols (PPE)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  Local community hiring & artisan training
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  Ethical heritage conservation tours
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="card h-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-700 mb-4">
                <Scale className="h-6 w-6" />
              </div>
              <h2 className="font-display font-bold text-xl text-brand-navy">Governance & Ethics</h2>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                Operating with transparent corporate oversight, chartered financial auditing, strict anti-corruption
                policies, and verified regulatory standards.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  CIDA & ICTAD building standard compliance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  Independent chartered financial audits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  Data security & client confidentiality
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
