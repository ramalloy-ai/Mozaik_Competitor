import { useEffect, useState } from "react";
import { api, type ProjectSummary } from "../api";
import type { ProjectStore } from "../store";
import type { Project } from "../domain/project";

export function ProjectsView({
  store,
  onOpened,
}: {
  store: ProjectStore;
  onOpened: () => void;
}) {
  const [list, setList] = useState<ProjectSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    try {
      setList(await api.listProjects());
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const saveCurrent = async () => {
    setBusy(true);
    setError(null);
    try {
      if (store.serverProjectId) {
        const r = await api.updateProject(
          store.serverProjectId,
          store.project.name,
          store.project,
        );
        store.setServerProjectId(r.id);
      } else {
        const r = await api.createProject(
          store.project.name,
          store.project,
        );
        store.setServerProjectId(r.id);
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  };

  const open = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      const r = await api.getProject(id);
      store.replace(r.data as Project, r.id);
      onOpened();
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setBusy(true);
    try {
      await api.deleteProject(id);
      if (store.serverProjectId === id) store.setServerProjectId(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Projects</h1>
        <div>
          <button onClick={saveCurrent} disabled={busy}>
            {store.serverProjectId ? "Save current" : "Save as new"}
          </button>
        </div>
      </div>
      <div className="screen-body">
        {error && <div className="auth-error">{error}</div>}
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.name}
                  {store.serverProjectId === p.id && (
                    <span className="muted small"> · current</span>
                  )}
                </td>
                <td>{new Date(p.updatedAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => open(p.id)} disabled={busy}>Open</button>{" "}
                  <button onClick={() => remove(p.id)} disabled={busy} className="danger">Delete</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={3} className="muted">No saved projects yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
