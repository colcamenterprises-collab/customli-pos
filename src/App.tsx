import PosRegisterGate from "@/pages/PosRegisterGate";
import PosShifts from "@/pages/PosShifts";
import PosKitchen from "@/pages/PosKitchen";
import PosDisplay from "@/pages/PosDisplay";
import PrinterSettings from "@/pages/PrinterSettings";
import ConnectDevice from "@/pages/ConnectDevice";
import { getDeviceConnection } from "@/lib/deviceConnection";
import { APP_HOME, APP_NAME, APP_ROLE, APP_VARIANT, APP_VERSION } from "@/lib/appVariant";

function VersionBadge() {
  return (
    <div className="pointer-events-none fixed bottom-2 right-3 z-[100] rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-black tracking-wide text-white shadow-lg">
      {APP_NAME} v{APP_VERSION}
    </div>
  );
}

export default function App() {
  const connection = getDeviceConnection();
  const path = window.location.pathname;

  let content;

  if (!connection || path === "/connect") {
    content = <ConnectDevice />;
  } else if (connection.role !== APP_ROLE) {
    window.localStorage.removeItem("customli.pos.deviceConnection.v1");
    window.history.replaceState({}, "", "/connect");
    content = <ConnectDevice />;
  } else if (APP_VARIANT === "pos") {
    if (path === "/shifts") content = <PosShifts />;
    else if (path === "/printer") {
      content = (
        <main className="min-h-dvh bg-slate-50 p-5 pb-16">
          <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between gap-3">
            <a href="/register" className="rounded-xl bg-black px-4 py-3 text-sm font-black text-white">Back to POS</a>
            <span className="text-xs font-bold text-slate-500">Production device setup</span>
          </div>
          <PrinterSettings />
        </main>
      );
    } else {
      if (path !== "/register") window.history.replaceState({}, "", "/register");
      content = <PosRegisterGate />;
    }
  } else {
    if (path !== APP_HOME) window.history.replaceState({}, "", APP_HOME);
    content = APP_VARIANT === "kds" ? <PosKitchen /> : <PosDisplay />;
  }

  return <>{content}<VersionBadge /></>;
}
