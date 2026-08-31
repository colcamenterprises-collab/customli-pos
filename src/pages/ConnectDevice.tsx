import { useState } from "react";
import { saveDeviceConnection } from "@/lib/deviceConnection";
import { APP_HOME, APP_NAME, APP_ROLE } from "@/lib/appVariant";

const DEFAULT_API = String(import.meta.env.VITE_CUSTOMLI_API_BASE || "https://app.smashbrosburgers.com").replace(/\/$/, "");

export default function ConnectDevice() {
  const [apiBase, setApiBase] = useState(DEFAULT_API);
  const [deviceToken, setDeviceToken] = useState("");
  const [businessName, setBusinessName] = useState("Smash Brothers Burgers");
  const [deviceName, setDeviceName] = useState(APP_NAME);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function connect() {
    if (!apiBase.trim() || !deviceToken.trim()) return setStatus("Enter the business connection code.");
    setBusy(true);
    setStatus("Checking connection…");
    try {
      const base = apiBase.trim().replace(/\/$/, "");
      const response = await fetch(`${base}/api/pos/discounts`, {
        headers: { "x-pos-device-token": deviceToken.trim() },
        credentials: "include",
      });
      if (!response.ok) throw new Error(response.status === 401 ? "That connection code was not accepted." : `Connection failed (${response.status}).`);
      saveDeviceConnection({ apiBase: base, deviceToken: deviceToken.trim(), businessName: businessName.trim() || "Connected business", deviceName: deviceName.trim() || APP_NAME, role: APP_ROLE });
      window.location.assign(APP_HOME);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not connect this device.");
      setBusy(false);
    }
  }

  return <main className="grid min-h-dvh place-items-center bg-zinc-950 p-5 text-white"><section className="w-full max-w-xl rounded-3xl bg-white p-7 text-zinc-950 shadow-2xl"><p className="text-xs font-black uppercase tracking-[.25em] text-amber-500">{APP_NAME}</p><h1 className="mt-2 text-3xl font-black">Connect this device</h1><p className="mt-2 text-zinc-600">This app is locked to its assigned function. Enter the Back Office connection code once and this device will remember your business.</p><div className="mt-6 grid gap-4"><label className="text-sm font-bold">Business name<input className="mt-1 w-full rounded-xl border p-3 font-medium" value={businessName} onChange={e=>setBusinessName(e.target.value)}/></label><label className="text-sm font-bold">Device name<input className="mt-1 w-full rounded-xl border p-3 font-medium" value={deviceName} onChange={e=>setDeviceName(e.target.value)}/></label><label className="text-sm font-bold">Connection code<input className="mt-1 w-full rounded-xl border p-3 font-mono" type="password" value={deviceToken} onChange={e=>setDeviceToken(e.target.value)} placeholder="Enter code from Back Office"/></label><label className="text-sm font-bold">App role<input className="mt-1 w-full rounded-xl border bg-zinc-100 p-3 font-bold" value={APP_NAME} readOnly/></label><details className="rounded-xl bg-zinc-100 p-3 text-sm"><summary className="cursor-pointer font-bold">Advanced connection settings</summary><label className="mt-3 block font-bold">Back Office address<input className="mt-1 w-full rounded-xl border bg-white p-3 font-mono text-xs" value={apiBase} onChange={e=>setApiBase(e.target.value)}/></label></details>{status && <p className="rounded-xl bg-zinc-100 p-3 text-sm font-semibold">{status}</p>}<button disabled={busy} onClick={connect} className="rounded-2xl bg-amber-400 p-4 text-lg font-black disabled:opacity-50">{busy ? "Connecting…" : `Connect ${APP_NAME}`}</button></div></section></main>;
}
