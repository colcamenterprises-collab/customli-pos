const API_BASE = String(import.meta.env.VITE_CUSTOMLI_API_BASE || "").replace(/\/$/, "");
const FLAG = "__customliApiBaseInstalled";
export function installApiBase() {
  const globalWindow = window as unknown as Window & Record<string, unknown>;
  if (!API_BASE || globalWindow[FLAG]) return;
  globalWindow[FLAG] = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === "string" && input.startsWith("/api/")) return originalFetch(`${API_BASE}${input}`, { ...init, credentials: init?.credentials || "include" });
    if (input instanceof URL && input.pathname.startsWith("/api/") && input.origin === window.location.origin) return originalFetch(new URL(`${input.pathname}${input.search}`, API_BASE), { ...init, credentials: init?.credentials || "include" });
    return originalFetch(input, init);
  }) as typeof window.fetch;
}
