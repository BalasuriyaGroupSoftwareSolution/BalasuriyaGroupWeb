import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import type { ConstructionProject } from "../../types";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ConstructionProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get<{ project: ConstructionProject }>(`/api/construction/projects/${id}`)
      .then((res) => setProject(res.data.project))
      .catch((err) =>
        setError(err?.response?.status === 404 ? "This project could not be found." : "Could not load this project. Please try again.")
      );
  }, [id]);

  if (error) return <p className="mx-auto max-w-3xl px-4 py-14 text-gray-600">{error}</p>;
  if (!project) return <p className="mx-auto max-w-3xl px-4 py-14 text-gray-500">Loading…</p>;

  return (
    <div>
      {project.coverImageUrl && (
        <div className="relative h-64 w-full overflow-hidden bg-brand-navy sm:h-80">
          <img src={project.coverImageUrl} alt={project.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-4 pb-6 text-white">
            {project.projectType && (
              <span className="mb-2 inline-block rounded-full bg-brand-gold px-3 py-1 text-xs font-semibold text-brand-navy">
                {project.projectType}
              </span>
            )}
            <h1 className="font-display text-3xl font-bold [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">
              {project.name}
            </h1>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="flex items-start justify-between gap-2">
          {!project.coverImageUrl && (
            <h1 className="font-display text-3xl font-bold text-brand-navy">{project.name}</h1>
          )}
          <StatusBadge status={project.status} />
        </div>
        {project.location && <p className="mt-1 text-gray-500">{project.location}</p>}
        {project.description && <p className="mt-4 text-gray-700">{project.description}</p>}

        <h2 className="mt-10 font-display text-xl font-bold text-brand-navy">Progress updates</h2>
        {project.progressUpdates.length === 0 && (
          <p className="mt-3 text-gray-500">No updates posted yet.</p>
        )}
        <div className="mt-4 space-y-4">
          {project.progressUpdates.map((u) => (
            <div key={u.id} className="card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                <span className="text-sm font-semibold text-brand-accent">{u.percentComplete}% complete</span>
              </div>
              <p className="mt-2 text-sm font-medium text-brand-navy">Current status</p>
              <p className="text-sm text-gray-700">{u.currentStatus}</p>
              <p className="mt-2 text-sm font-medium text-brand-navy">Next period</p>
              <p className="text-sm text-gray-700">{u.nextPeriodPlan}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
