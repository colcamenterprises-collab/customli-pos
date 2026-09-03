import { getDeviceConnection } from "@/lib/deviceConnection";

const ENV_API_BASE = String(import.meta.env.VITE_CUSTOMLI_API_BASE || "").replace(/\/$/, "");
const FLAG = "__customliApiBaseInstalled";
const ASSET_FLAG = "__customliApiAssetFallbackInstalled";
const LOCAL_APP_ASSETS = new Set(["/customli-mark.svg", "/burger-placeholder.png"]);

function configuredApiBase() {
  return getDeviceConnection()?.apiBase || ENV_API_BASE;
}

function requestTarget(input: RequestInfo | URL) {
  const apiBase = configuredApiBase();
  if (!apiBase) return null;
  if (typeof input === "string" && input.startsWith("/api/")) return `${apiBase}${input}`;
  if (input instanceof URL && input.pathname.startsWith("/api/") && input.origin === window.location.origin) {
    return new URL(`${input.pathname}${input.search}`, apiBase);
  }
  return null;
}

function installApiAssetFallback() {
  const globalWindow = window as unknown as Window & Record<string, unknown>;
  if (globalWindow[ASSET_FLAG]) return;
  globalWindow[ASSET_FLAG] = true;

  document.addEventListener("error", (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement)) return;
    if (image.dataset.customliApiAssetRetry === "1") return;

    const original = image.getAttribute("src") || "";
    if (!original || LOCAL_APP_ASSETS.has(original) || /^(data:|blob:|https?:|capacitor:)/i.test(original)) return;

    const apiBase = configuredApiBase();
    if (!apiBase) return;

    try {
      image.dataset.customliApiAssetRetry = "1";
      image.src = new URL(original, `${apiBase}/`).toString();
    } catch {
      // A missing menu image must never block POS operation.
    }
  }, true);
}

export function installApiBase() {
  const globalWindow = window as unknown as Window & Record<string, unknown>;
  if (globalWindow[FLAG]) return;
  globalWindow[FLAG] = true;
  installApiAssetFallback();

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
