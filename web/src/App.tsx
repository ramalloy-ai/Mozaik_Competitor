import { Suspense, lazy, useEffect, useState } from "react";
import { api, type AuthUser } from "./api";
import { useProject } from "./store";
import { DesignView } from "./views/DesignView";

const CutlistView = lazy(() =>
  import("./views/CutlistView").then((m) => ({ default: m.CutlistView })),
);
const NestingView = lazy(() =>
  import("./views/NestingView").then((m) => ({ default: m.NestingView })),
);
const QuoteView = lazy(() =>
  import("./views/QuoteView").then((m) => ({ default: m.QuoteView })),
);
const ProjectsView = lazy(() =>
  import("./views/ProjectsView").then((m) => ({ default: m.ProjectsView })),
);
const AuthView = lazy(() =>
  import("./views/AuthView").then((m) => ({ default: m.AuthView })),
);

type ViewId = "design" | "cutlist" | "nesting" | "quote" | "projects";

const VIEWS: { id: ViewId; label: string }[] = [
  { id: "design", label: "Design" },
  { id: "cutlist", label: "Cut list" },
  { id: "nesting", label: "Nesting" },
  { id: "quote", label: "Quote" },
  { id: "projects", label: "Projects" },
];

function Fallback() {
  return (
    <div className="screen">
      <div className="screen-body">
        <div className="muted">Loading…</div>
      </div>
    </div>
  );
}

export function App() {
  const store = useProject();
  const [view, setView] = useState<ViewId>("design");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key.toLowerCase() === "z") {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store]);

  if (showAuth && !api.isAuthed()) {
    return (
      <Suspense fallback={<Fallback />}>
        <AuthView
          onAuthed={(r) => {
            setUser(r.user);
            setShowAuth(false);
          }}
        />
      </Suspense>
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
        <div className="history-btns">
          <button
            onClick={store.undo}
            disabled={!store.canUndo}
            title="Undo (Cmd/Ctrl+Z)"
          >
            ↶
          </button>
          <button
            onClick={store.redo}
            disabled={!store.canRedo}
            title="Redo (Cmd/Ctrl+Shift+Z)"
          >
            ↷
          </button>
        </div>
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
        <Suspense fallback={<Fallback />}>
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
                    Log in to save and load projects from the server. Your work
                    is preserved locally either way.
                  </p>
                  <button className="primary" onClick={() => setShowAuth(true)}>
                    Log in / Register
                  </button>
                </div>
              </div>
            ))}
        </Suspense>
      </div>
    </div>
  );
}
