import type { Project } from "./domain/project";

const API_BASE =
  (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
    .VITE_API_URL ?? "http://localhost:3001";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface ProjectSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface FullProject extends ProjectSummary {
  data: Project;
}

function token(): string | null {
  return localStorage.getItem("cs-token");
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const tok = token();
  if (tok) headers.set("Authorization", `Bearer ${tok}`);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  setToken(t: string) {
    localStorage.setItem("cs-token", t);
  },
  clearToken() {
    localStorage.removeItem("cs-token");
  },
  isAuthed(): boolean {
    return !!token();
  },
  register(email: string, password: string, name?: string) {
    return request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },
  login(email: string, password: string) {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  listProjects() {
    return request<ProjectSummary[]>("/api/projects");
  },
  getProject(id: string) {
    return request<FullProject>(`/api/projects/${id}`);
  },
  createProject(name: string, data: Project) {
    return request<FullProject>("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name, data }),
    });
  },
  updateProject(id: string, name: string, data: Project) {
    return request<FullProject>(`/api/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, data }),
    });
  },
  deleteProject(id: string) {
    return request<{ ok: true }>(`/api/projects/${id}`, { method: "DELETE" });
  },
};
