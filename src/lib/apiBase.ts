import { getDeviceConnection } from "@/lib/deviceConnection";
import { isManagerTestMode } from "@/lib/testMode";

const ENV_API_BASE = String(import.meta.env.VITE_CUSTOMLI_API_BASE || "").replace(/\/$/, "");
const FLAG = "__customliApiBaseInstalled";

function apiPath(input: RequestInfo | URL) {
  if (typeof input === "string" && input.startsWith("/api/")) return input.split("?")[0];
  if (input instanceof URL && input.pathname.startsWith("/api/")) return input.pathname;
  if (input instanceof Request) {
    try {
      const url = new URL(input.url, window.location.origin);
      return url.pathname.startsWith("/api/") ? url.pathname : "";
    } catch {
      return "";
    }
  }
  return "";
}

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
    const id = pathname.split("/")[4];
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
  if (input instanceof Request) {
    const url = new URL(input.url, window.location.origin);
    if (url.pathname.startsWith("/api/") && url.origin === window.location.origin) return new URL(`${sandboxPath(url.pathname)}${url.search}`, apiBase);
  }
  return null;
}

export function installApiBase() {
  const globalWindow = window as unknown as Window & Record<string, unknown>;
  if (globalWindow[FLAG]) return;
  globalWindow[FLAG] = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (isManagerTestMode() && apiPath(input) === "/api/pos/discounts/manage") {
      return Promise.resolve(new Response(JSON.stringify({ ok: false, error: "Discount management is disabled in Test Mode to protect live settings." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }));
    }
    const target = requestTarget(input);
    if (!target) return originalFetch(input, init);
    const connection = getDeviceConnection();
    const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
    if (connection?.deviceToken) headers.set("x-pos-device-token", connection.deviceToken);
    return originalFetch(target, { ...init, headers, credentials: init?.credentials || "include" });
  }) as typeof window.fetch;
}
