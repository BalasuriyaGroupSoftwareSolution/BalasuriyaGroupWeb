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
      .catch(() => setError("Project not found."));
  }, [id]);

  if (error) return <p className="mx-auto max-w-3xl px-4 py-14 text-red-600">{error}</p>;
  if (!project) return <p className="mx-auto max-w-3xl px-4 py-14 text-gray-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="flex items-start justify-between gap-2">
        <h1 className="font-display text-3xl font-bold text-brand-navy">{project.name}</h1>
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
  );
}
