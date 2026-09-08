import { DivisionCard } from "../components/DivisionCard";

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-b from-brand-navy to-brand-steel py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Balasuriya Group</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">
            Trusted construction projects and unforgettable tours — local and abroad — with visa
            assistance and air ticketing handled for you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center font-display text-2xl font-bold text-brand-navy">Our Divisions</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DivisionCard
            title="Construction"
            description="From planning to handover — track real project progress, milestones, and what's next."
            to="/construction"
          />
          <DivisionCard
            title="Tourism"
            description="Local tours, family & team trips, and religious tours — plus visa help and air tickets."
            to="/tourism"
          />
          <DivisionCard
            title="Software"
            description="Coming soon — digital products from the Balasuriya Group technology team."
            to="/about"
            cta="Stay tuned"
          />
        </div>
      </section>
    </div>
  );
}
