import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import type { ConstructionProject } from "../../types";

export default function ConstructionPublic() {
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ projects: ConstructionProject[] }>("/api/construction/projects")
      .then((res) => setProjects(res.data.projects))
      .catch(() => setError("Couldn't load projects right now. Please try again shortly."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-3xl font-bold text-brand-navy">Construction Projects</h1>
      <p className="mt-2 max-w-2xl text-gray-600">
        A look at what we're building, and how far along each project is.
      </p>

      {loading && <p className="mt-8 text-gray-500">Loading projects…</p>}
      {error && <p className="mt-8 text-red-600">{error}</p>}
      {!loading && !error && projects.length === 0 && (
        <p className="mt-8 text-gray-500">No projects published yet — check back soon.</p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const latest = p.progressUpdates[0];
          return (
            <Link key={p.id} to={`/construction/${p.id}`} className="card block hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-brand-navy">{p.name}</h3>
                <StatusBadge status={p.status} />
              </div>
              {p.location && <p className="mt-1 text-sm text-gray-500">{p.location}</p>}
              {latest && (
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-brand-accent"
                      style={{ width: `${latest.percentComplete}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{latest.percentComplete}% complete</p>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
