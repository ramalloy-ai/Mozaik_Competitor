import { useState } from "react";
import { api, type AuthResponse } from "../api";

export function AuthView({ onAuthed }: { onAuthed: (resp: AuthResponse) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const resp =
        mode === "login"
          ? await api.login(email, password)
          : await api.register(email, password, name);
      api.setToken(resp.token);
      onAuthed(resp);
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Cabinet Studio</h1>
        <div className="auth-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Log in
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>
        {mode === "register" && (
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="auth-error">{error}</div>}
        <button className="primary" disabled={busy} onClick={submit}>
          {busy ? "…" : mode === "login" ? "Log in" : "Create account"}
        </button>
        <p className="muted small">
          Backend at <code>http://localhost:3001</code>. You can also continue
          offline — projects are saved to local storage.
        </p>
      </div>
    </div>
  );
}
