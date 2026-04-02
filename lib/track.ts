const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL || "https://symbiotime.com";

let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId) return sessionId;
  if (typeof window === "undefined") return "";
  sessionId = sessionStorage.getItem("_sid");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("_sid", sessionId);
  }
  return sessionId;
}

export function track(
  event: string,
  data?: { page?: string; persona?: string; meta?: Record<string, unknown> }
) {
  if (typeof window === "undefined") return;
  const payload = {
    event,
    page: data?.page || window.location.pathname,
    session_id: getSessionId(),
    persona: data?.persona,
    meta: data?.meta,
  };
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        `${ANALYTICS_URL}/api/track`,
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );
    } else {
      fetch(`${ANALYTICS_URL}/api/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // silent fail
  }
}
