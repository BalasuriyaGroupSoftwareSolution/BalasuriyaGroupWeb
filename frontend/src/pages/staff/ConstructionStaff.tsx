import { useEffect, useState, type FormEvent } from "react";
import { api, apiErrorMessage } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import type { ConstructionProject, ProjectStatus } from "../../types";
import toast from "react-hot-toast";

const STATUSES: ProjectStatus[] = ["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED"];

export default function ConstructionStaff() {
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);

  // New project form
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  // Progress update form
  const [currentStatus, setCurrentStatus] = useState("");
  const [nextPeriodPlan, setNextPeriodPlan] = useState("");
  const [percentComplete, setPercentComplete] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  function loadProjects() {
    api.get<{ projects: ConstructionProject[] }>("/api/construction/projects").then((res) => {
      setProjects(res.data.projects);
    });
  }

  useEffect(loadProjects, []);

  async function handleCreateProject(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/construction/projects", { name, location, description, status: "PLANNING" });
      toast.success("Project created.");
      setName("");
      setLocation("");
      setDescription("");
      setShowNewProject(false);
      loadProjects();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create project."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(projectId: string, status: ProjectStatus) {
    try {
      await api.patch(`/api/construction/projects/${projectId}`, { status });
      loadProjects();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handlePostUpdate(e: FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await api.post(`/api/construction/projects/${selectedId}/progress`, {
        currentStatus,
        nextPeriodPlan,
        percentComplete,
      });
      toast.success("Progress update posted.");
      setCurrentStatus("");
      setNextPeriodPlan("");
      setPercentComplete(0);
      loadProjects();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not post update."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand-navy">Construction Progress</h1>
        <button className="btn-secondary py-1.5 text-xs" onClick={() => setShowNewProject((s) => !s)}>
          {showNewProject ? "Cancel" : "New project"}
        </button>
      </div>

      {showNewProject && (
        <form onSubmit={handleCreateProject} className="card mt-4 space-y-3">
          <div>
            <label className="label">Project name</label>
            <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <button className="btn-primary" disabled={submitting} type="submit">
            Create project
          </button>
        </form>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`card block w-full text-left ${selectedId === p.id ? "ring-2 ring-brand-navy" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-brand-navy">{p.name}</span>
                <StatusBadge status={p.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(p.id, s);
                    }}
                    className={`rounded px-2 py-0.5 text-[11px] ${
                      p.status === s ? "bg-brand-navy text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {s.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </button>
          ))}
          {projects.length === 0 && <p className="text-gray-500">No projects yet.</p>}
        </div>

        <div>
          {selectedId ? (
            <form onSubmit={handlePostUpdate} className="card space-y-3">
              <h2 className="font-semibold text-brand-navy">Post a progress update</h2>
              <div>
                <label className="label">Current status</label>
                <textarea
                  className="input"
                  rows={2}
                  required
                  placeholder="What's the current status of this project?"
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Next period plan</label>
                <textarea
                  className="input"
                  rows={2}
                  required
                  placeholder="What's planned for the next period?"
                  value={nextPeriodPlan}
                  onChange={(e) => setNextPeriodPlan(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Percent complete: {percentComplete}%</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={percentComplete}
                  onChange={(e) => setPercentComplete(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <button className="btn-primary" disabled={submitting} type="submit">
                {submitting ? "Posting…" : "Post update"}
              </button>
            </form>
          ) : (
            <p className="text-gray-500">Select a project to post a progress update.</p>
          )}
        </div>
      </div>
    </div>
  );
}
