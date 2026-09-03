import { useEffect, useState, type ReactNode } from "react";
import PosRegisterGate from "@/pages/PosRegisterGate";
import PosKitchen from "@/pages/PosKitchen";
import PosDisplay from "@/pages/PosDisplay";
import PosShifts from "@/pages/PosShifts";
import ConnectDevice from "@/pages/ConnectDevice";
import ManagerTestMode from "@/pages/ManagerTestMode";
import { getDeviceConnection } from "@/lib/deviceConnection";
import { APP_HOME, APP_ROLE, APP_VARIANT } from "@/lib/appVariant";
import { disableManagerTestMode, isManagerTestMode } from "@/lib/testMode";

function TestModeGuard({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/pos-shifts/test/access", { credentials: "include", cache: "no-store" })
      .then(async response => {
        const body = await response.json();
        if (!response.ok || !body.ok) throw new Error(body.error || "Manager login required");
        if (!cancelled) setAllowed(true);
      })
      .catch(() => {
        disableManagerTestMode();
        if (!cancelled) setAllowed(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (allowed === null) return <main className="grid min-h-dvh place-items-center bg-zinc-950 text-lg font-black text-white">Checking manager Test Mode…</main>;
  if (!allowed) {
    window.history.replaceState({}, "", "/test");
    return <ManagerTestMode />;
  }
  return <>{children}</>;
}

function TestModeBanner() {
  const exit = () => {
    disableManagerTestMode();
    window.location.assign("/register");
  };
  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] flex flex-wrap items-center justify-center gap-2 border-t border-amber-300 bg-amber-100 p-2 text-xs font-black text-black shadow-2xl">
      <span className="rounded bg-red-600 px-2 py-1 text-white">TEST MODE — NO LIVE SALES</span>
      <a href="/register" className="rounded bg-black px-3 py-2 text-white">POS</a>
      <a href="/kitchen" className="rounded bg-emerald-600 px-3 py-2 text-white">KDS</a>
      <a href="/display" className="rounded bg-blue-600 px-3 py-2 text-white">CDS</a>
      <a href="/shifts" className="rounded bg-white px-3 py-2">Shift</a>
      <a href="/test" className="rounded bg-white px-3 py-2">Test Console</a>
      <button onClick={exit} className="rounded border border-red-400 bg-white px-3 py-2 text-red-700">Exit Test</button>
    </div>
  );
}

function TestModeView() {
  const path = window.location.pathname;
  let page: ReactNode;
  if (path === "/kitchen") page = <PosKitchen />;
  else if (path === "/display") page = <PosDisplay />;
  else if (path === "/shifts") page = <PosShifts />;
  else if (path === "/test") page = <ManagerTestMode />;
  else page = <PosRegisterGate />;
  return <TestModeGuard><div className="pb-14">{page}</div><TestModeBanner /></TestModeGuard>;
}

export default function App() {
  const connection = getDeviceConnection();
  if (!connection || window.location.pathname === "/connect") return <ConnectDevice />;

  if (connection.role !== APP_ROLE) {
    window.localStorage.removeItem("customli.pos.deviceConnection.v1");
    window.history.replaceState({}, "", "/connect");
    return <ConnectDevice />;
  }

  if (APP_VARIANT === "pos") {
    if (window.location.pathname === "/test" || isManagerTestMode()) return <TestModeView />;
    if (window.location.pathname !== "/register") window.history.replaceState({}, "", "/register");
    return (
      <>
        <PosRegisterGate />
        <a href="/test" className="fixed bottom-3 left-3 z-[90] rounded-xl bg-zinc-900 px-4 py-3 text-xs font-black text-white shadow-xl">Manager Test</a>
      </>
    );
  }

  if (window.location.pathname !== APP_HOME) window.history.replaceState({}, "", APP_HOME);
  if (APP_VARIANT === "kds") return <PosKitchen />;
  return <PosDisplay />;
}
