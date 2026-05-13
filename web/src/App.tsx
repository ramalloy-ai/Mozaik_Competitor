import { useState } from "react";
import { api, type AuthUser } from "./api";
import { useProject } from "./store";
import { AuthView } from "./views/AuthView";
import { DesignView } from "./views/DesignView";
import { CutlistView } from "./views/CutlistView";
import { NestingView } from "./views/NestingView";
import { QuoteView } from "./views/QuoteView";
import { ProjectsView } from "./views/ProjectsView";

type ViewId = "design" | "cutlist" | "nesting" | "quote" | "projects";

const VIEWS: { id: ViewId; label: string }[] = [
  { id: "design", label: "Design" },
  { id: "cutlist", label: "Cut list" },
  { id: "nesting", label: "Nesting" },
  { id: "quote", label: "Quote" },
  { id: "projects", label: "Projects" },
];

export function App() {
  const store = useProject();
  const [view, setView] = useState<ViewId>("design");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth && !api.isAuthed()) {
    return (
      <AuthView
        onAuthed={(r) => {
          setUser(r.user);
          setShowAuth(false);
        }}
      />
    );
  }

  return (
    <div className="app">
      <div className="topbar">
        <span className="brand">Cabinet Studio</span>
        <nav className="topnav">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              className={v.id === view ? "active" : ""}
              onClick={() => setView(v.id)}
            >
              {v.label}
            </button>
          ))}
        </nav>
        <div className="topbar-spacer" />
        <span className="muted small">{store.project.name}</span>
        {user || api.isAuthed() ? (
          <button
            onClick={() => {
              api.clearToken();
              setUser(null);
              store.setServerProjectId(null);
            }}
          >
            Log out{user ? ` (${user.email})` : ""}
          </button>
        ) : (
          <button onClick={() => setShowAuth(true)}>Log in / Register</button>
        )}
      </div>

      <div className="app-body">
        {view === "design" && <DesignView store={store} />}
        {view === "cutlist" && <CutlistView store={store} />}
        {view === "nesting" && <NestingView store={store} />}
        {view === "quote" && <QuoteView store={store} />}
        {view === "projects" &&
          (api.isAuthed() ? (
            <ProjectsView store={store} onOpened={() => setView("design")} />
          ) : (
            <div className="screen">
              <div className="screen-body">
                <p>
                  Log in to save and load projects from the server. Your work is
                  preserved locally either way.
                </p>
                <button className="primary" onClick={() => setShowAuth(true)}>
                  Log in / Register
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
