import { getDeviceConnection } from "@/lib/deviceConnection";
import { isManagerTestMode } from "@/lib/testMode";

const ENV_API_BASE = String(import.meta.env.VITE_CUSTOMLI_API_BASE || "").replace(/\/$/, "");
const FLAG = "__customliApiBaseInstalled";

function sandboxPath(pathname: string) {
  if (!isManagerTestMode()) return pathname;
  if (pathname === "/api/pos-shifts/current") return "/api/pos-shifts/test/current";
  if (pathname === "/api/pos-shifts/open") return "/api/pos-shifts/test/open";
  if (/^\/api\/pos-shifts\/[^/]+\/movements$/.test(pathname)) {
    const id = pathname.split("/")[3];
    return `/api/pos-shifts/test/${id}/movements`;
  }
  if (/^\/api\/pos-shifts\/[^/]+\/close$/.test(pathname)) {
    const id = pathname.split("/")[3];
    return `/api/pos-shifts/test/${id}/close`;
  }
  if (pathname === "/api/pos/orders/next-ticket") return "/api/pos-shifts/test/orders/next-ticket";
  if (pathname === "/api/pos/orders") return "/api/pos-shifts/test/orders";
  if (/^\/api\/pos\/orders\/[^/]+\/receipt$/.test(pathname)) {
    const id = pathname.split("/")[4];
    return `/api/pos-shifts/test/orders/${id}/receipt`;
  }
  if (/^\/api\/pos\/orders\/[^/]+\/print-event$/.test(pathname)) {
    const id = pathname.split("/")[4];
    return `/api/pos-shifts/test/orders/${id}/print-event`;
  }
  if (/^\/api\/(?:pos|ordering)\/orders\/[^/]+\/status$/.test(pathname)) {
    const parts = pathname.split("/");
    const id = parts[4];
    return `/api/pos-shifts/test/orders/${id}/status`;
  }
  if (pathname === "/api/ordering/kitchen/orders") return "/api/pos-shifts/test/kitchen/orders";
  if (pathname === "/api/pos/display/orders") return "/api/pos-shifts/test/display/orders";
  return pathname;
}

function requestTarget(input: RequestInfo | URL) {
  const connection = getDeviceConnection();
  const apiBase = connection?.apiBase || ENV_API_BASE;
  if (!apiBase) return null;
  if (typeof input === "string" && input.startsWith("/api/")) return `${apiBase}${sandboxPath(input)}`;
  if (input instanceof URL && input.pathname.startsWith("/api/") && input.origin === window.location.origin) {
    return new URL(`${sandboxPath(input.pathname)}${input.search}`, apiBase);
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
