import { useMemo, useState } from "react";
import { saveDeviceConnection, type DeviceRole } from "@/lib/deviceConnection";
import { APP_NAME, APP_VERSION, homeForRole, nameForRole } from "@/lib/appVariant";

const DEFAULT_API = String(import.meta.env.VITE_CUSTOMLI_API_BASE || "https://app.smashbrosburgers.com").replace(/\/$/, "");

function initialPairingCode() {
  const value = new URLSearchParams(window.location.search).get("code") || "";
  return value.replace(/\D/g, "").slice(0, 6);
}

export default function ConnectDevice() {
  const [apiBase, setApiBase] = useState(DEFAULT_API);
  const [pairingCode, setPairingCode] = useState(initialPairingCode());
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const prettyCode = useMemo(() => pairingCode.length > 3 ? `${pairingCode.slice(0, 3)} ${pairingCode.slice(3)}` : pairingCode, [pairingCode]);

  async function connect() {
    const code = pairingCode.replace(/\D/g, "");
    if (!apiBase.trim() || code.length !== 6) return setStatus("Enter the 6-digit pairing code shown in Back Office.");
    setBusy(true);
    setStatus("Registering this device…");
    try {
      const base = apiBase.trim().replace(/\/$/, "");
      const response = await fetch(`${base}/api/pos/provisioning/claim`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          platform: "android",
          app_version: APP_VERSION,
          os_version: navigator.userAgent,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body?.ok) throw new Error(body?.error || `Connection failed (${response.status}).`);
      const data = body.data || {};
      const role = data.role as DeviceRole;
      if (!["register", "kitchen", "display"].includes(role)) throw new Error("Back Office returned an unsupported device role.");

      saveDeviceConnection({
        apiBase: base,
        deviceToken: String(data.device_token),
        deviceId: String(data.device_id),
        businessName: String(data.business_name || "Connected business"),
        deviceName: String(data.device_name || nameForRole(role)),
        locationName: data.location_name == null ? null : String(data.location_name),
        role,
      });
      window.location.assign(homeForRole(role));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not register this device.");
      setBusy(false);
    }
  }

  return <main className="grid min-h-dvh place-items-center bg-zinc-950 p-5 text-white">
    <section className="w-full max-w-xl rounded-3xl bg-white p-7 text-zinc-950 shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[.25em] text-amber-500">{APP_NAME}</p>
      <h1 className="mt-2 text-3xl font-black">Connect this device</h1>
      <p className="mt-2 text-zinc-600">Create the device in Back Office, choose its role there, then enter the one-time pairing code. This app will configure itself as POS, Kitchen Display or Customer Display automatically.</p>

      <div className="mt-6 grid gap-4">
        <label className="text-sm font-bold">Pairing code
          <input
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            className="mt-1 w-full rounded-2xl border-2 border-zinc-300 p-4 text-center font-mono text-3xl font-black tracking-[0.25em] focus:border-amber-400 focus:outline-none"
            value={prettyCode}
            onChange={(e) => setPairingCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000 000"
          />
        </label>

        <div className="rounded-xl bg-zinc-100 p-4 text-sm text-zinc-700">
          <strong>No server setup required.</strong> Device name, business, location and role come from Back Office. The pairing code is single-use and expires automatically.
        </div>

        <details className="rounded-xl bg-zinc-100 p-3 text-sm">
          <summary className="cursor-pointer font-bold">Advanced connection settings</summary>
          <label className="mt-3 block font-bold">Back Office address
            <input className="mt-1 w-full rounded-xl border bg-white p-3 font-mono text-xs" value={apiBase} onChange={e=>setApiBase(e.target.value)} />
          </label>
        </details>

        {status && <p className="rounded-xl bg-zinc-100 p-3 text-sm font-semibold">{status}</p>}
        <button disabled={busy || pairingCode.length !== 6} onClick={connect} className="rounded-2xl bg-amber-400 p-4 text-lg font-black disabled:opacity-50">{busy ? "Connecting…" : "Connect device"}</button>
      </div>
    </section>
  </main>;
}
