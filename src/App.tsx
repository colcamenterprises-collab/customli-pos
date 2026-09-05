import PosRegisterGate from "@/pages/PosRegisterGate";
import PosShifts from "@/pages/PosShifts";
import PosKitchen from "@/pages/PosKitchen";
import PosDisplay from "@/pages/PosDisplay";
import PrinterSettings from "@/pages/PrinterSettings";
import ConnectDevice from "@/pages/ConnectDevice";
import { getDeviceConnection } from "@/lib/deviceConnection";
import { APP_NAME, APP_VERSION, homeForRole, nameForRole } from "@/lib/appVariant";

function VersionBadge({ role }: { role?: "register" | "kitchen" | "display" }) {
  return (
    <div className="pointer-events-none fixed bottom-2 right-3 z-[100] rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-black tracking-wide text-white shadow-lg">
      {role ? nameForRole(role) : APP_NAME} v{APP_VERSION}
    </div>
  );
}

export default function App() {
  const connection = getDeviceConnection();
  const path = window.location.pathname;
  let content;

  if (!connection || path === "/connect") {
    content = <ConnectDevice />;
  } else if (connection.role === "register") {
    if (path === "/shifts") content = <PosShifts />;
    else if (path === "/printer") {
      content = (
        <main className="min-h-dvh bg-slate-50 p-5 pb-16">
          <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between gap-3">
            <a href="/register" className="rounded-xl bg-black px-4 py-3 text-sm font-black text-white">Back to POS</a>
            <span className="text-xs font-bold text-slate-500">Managed by Back Office</span>
          </div>
          <PrinterSettings />
        </main>
      );
    } else {
      if (path !== "/register") window.history.replaceState({}, "", "/register");
      content = <PosRegisterGate />;
    }
  } else if (connection.role === "kitchen") {
    if (path !== "/kitchen") window.history.replaceState({}, "", "/kitchen");
    content = <PosKitchen />;
  } else {
    if (path !== "/display") window.history.replaceState({}, "", "/display");
    content = <PosDisplay />;
  }

  if (connection && path !== "/connect") {
    const expected = homeForRole(connection.role);
    if (![expected, "/shifts", "/printer"].includes(window.location.pathname) && connection.role === "register") {
      window.history.replaceState({}, "", expected);
    }
  }

  return <>{content}<VersionBadge role={connection?.role} /></>;
}
