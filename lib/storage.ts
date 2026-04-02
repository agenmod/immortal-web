import { PersonaType } from "./prompts";

export interface Session {
  id: string;
  name: string;
  persona: PersonaType;
  description: string;
  chatContent: string;
  distillResult?: string;
  status: "pending" | "distilling" | "done" | "error";
  createdAt: number;
  error?: string;
}

const store = new Map<string, Session>();

export function generateId(): string {
  return (
    Math.random().toString(36).slice(2, 8) +
    Date.now().toString(36).slice(-4)
  );
}

export function createSession(data: Omit<Session, "id" | "createdAt" | "status">): Session {
  const session: Session = {
    ...data,
    id: generateId(),
    status: "pending",
    createdAt: Date.now(),
  };
  store.set(session.id, session);
  return session;
}

export function getSession(id: string): Session | undefined {
  return store.get(id);
}

export function updateSession(id: string, updates: Partial<Session>): Session | undefined {
  const session = store.get(id);
  if (!session) return undefined;
  const updated = { ...session, ...updates };
  store.set(id, updated);
  return updated;
}

// Clean sessions older than 7 days
setInterval(() => {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  for (const [id, session] of store) {
    if (session.createdAt < cutoff) store.delete(id);
  }
}, 60 * 60 * 1000);
