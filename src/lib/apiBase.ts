import { getDeviceConnection } from "@/lib/deviceConnection";

const ENV_API_BASE = String(import.meta.env.VITE_CUSTOMLI_API_BASE || "").replace(/\/$/, "");
const FLAG = "__customliApiBaseInstalled";

function requestTarget(input: RequestInfo | URL) {
  const connection = getDeviceConnection();
  const apiBase = connection?.apiBase || ENV_API_BASE;
  if (!apiBase) return null;
  if (typeof input === "string" && input.startsWith("/api/")) return `${apiBase}${input}`;
  if (input instanceof URL && input.pathname.startsWith("/api/") && input.origin === window.location.origin) {
    return new URL(`${input.pathname}${input.search}`, apiBase);
  }
  return null;
}

export function installApiBase() {
  const globalWindow = window as unknown as Window & Record<string, unknown>;
  if (globalWindow[FLAG]) return;
  globalWindow[FLAG] = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const target = requestTarget(input);
    if (!target) return originalFetch(input, init);
    const connection = getDeviceConnection();
    const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
    if (connection?.deviceToken) headers.set("x-pos-device-token", connection.deviceToken);
    return originalFetch(target, { ...init, headers, credentials: init?.credentials || "include" });
  }) as typeof window.fetch;
}
