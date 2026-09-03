import { useEffect, useState } from "react";
import { disableManagerTestMode, enableManagerTestMode, isManagerTestMode } from "@/lib/testMode";

type ManagerUser = { id: number; name: string; role: string };

export default function ManagerTestMode() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [user, setUser] = useState<ManagerUser | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(isManagerTestMode());

  const verify = async () => {
    try {
      const response = await fetch("/api/pos-shifts/test/access", { credentials: "include", cache: "no-store" });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.error || "Manager login required");
      setUser(body.data?.user || null);
      return true;
    } catch {
      disableManagerTestMode();
      setActive(false);
      setUser(null);
      return false;
    }
  };

  useEffect(() => { if (active) void verify(); }, []);

  const login = async () => {
    if (!username.trim() || !pin) return setStatus("Enter your manager username/name and PIN.");
    setBusy(true);
    setStatus("Checking manager access…");
    try {
      const response = await fetch("/api/pin-auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), pin }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Login failed");
      const role = String(body.user?.role || "");
      if (!["owner", "manager"].includes(role)) {
        await fetch("/api/pin-auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
        throw new Error("Manager or owner access is required for Test Mode.");
      }
      enableManagerTestMode();
      setActive(true);
      setUser(body.user || null);
      setPin("");
      setStatus("Test Mode unlocked. Test data is isolated from production.");
    } catch (error) {
      disableManagerTestMode();
      setActive(false);
      setStatus(error instanceof Error ? error.message : "Could not unlock Test Mode");
    } finally {
      setBusy(false);
    }
  };

  const exit = async () => {
    disableManagerTestMode();
    setActive(false);
    setUser(null);
    await fetch("/api/pin-auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
    window.location.assign("/register");
  };

  const resetSandbox = async () => {
    if (!window.confirm("Delete all TEST shifts and TEST orders? Live production data is not touched.")) return;
    setBusy(true);
    try {
      const response = await fetch("/api/pos-shifts/test/reset", { method: "DELETE", credentials: "include" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not reset test data");
      setStatus("Test sandbox reset. Production data was not changed.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not reset test data");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-dvh bg-zinc-950 p-5 text-white">
      <section className="mx-auto max-w-3xl rounded-3xl bg-white p-7 text-zinc-950 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[.25em] text-amber-500">Manager Test Mode</p>
        <h1 className="mt-2 text-3xl font-black">One-tablet POS / KDS / CDS testing</h1>
        <p className="mt-3 text-sm text-zinc-600">Test Mode uses a separate sandbox shift and separate test-order tables. It can run while the live production shift remains open. Test sales, cash, tickets and movements do not enter production reconciliation.</p>

        {!active ? (
          <div className="mt-7 grid gap-4">
            <label className="text-sm font-bold">Manager username or name<input value={username} onChange={event => setUsername(event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" autoComplete="username" /></label>
            <label className="text-sm font-bold">PIN<input type="password" value={pin} onChange={event => setPin(event.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" autoComplete="current-password" /></label>
            <button disabled={busy} onClick={login} className="rounded-xl bg-[#ffd400] px-5 py-4 text-lg font-black disabled:opacity-50">{busy ? "Checking…" : "Unlock Test Mode"}</button>
          </div>
        ) : (
          <div className="mt-7">
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
              <p className="text-xs font-black tracking-widest text-emerald-700">TEST MODE ACTIVE</p>
              <p className="mt-1 font-black">{user?.name || "Manager"} · {user?.role || "manager"}</p>
              <p className="mt-2 text-sm text-emerald-800">Anything created through the Test Mode views is sandbox data only.</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a href="/shifts" className="rounded-2xl bg-black p-5 text-center font-black text-white">1. Test Shift</a>
              <a href="/register" className="rounded-2xl bg-[#ffd400] p-5 text-center font-black text-black">2. Test POS</a>
              <a href="/kitchen" className="rounded-2xl bg-emerald-600 p-5 text-center font-black text-white">3. Test KDS</a>
              <a href="/display" className="rounded-2xl bg-blue-600 p-5 text-center font-black text-white">4. Test CDS</a>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button disabled={busy} onClick={resetSandbox} className="rounded-xl border border-red-300 px-4 py-3 text-sm font-black text-red-700 disabled:opacity-50">Reset test sandbox</button>
              <button onClick={exit} className="rounded-xl bg-zinc-200 px-4 py-3 text-sm font-black">Exit Test Mode</button>
            </div>
          </div>
        )}

        {status && <p className="mt-5 rounded-xl bg-zinc-100 p-3 text-sm font-semibold">{status}</p>}
        {!active && <a href="/register" className="mt-5 block text-center text-sm font-bold text-zinc-500">Back to live POS</a>}
      </section>
    </main>
  );
}
