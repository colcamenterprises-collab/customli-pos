import { useEffect, useState } from "react";
import PosRegisterGate from "@/pages/PosRegisterGate";
import PosKitchen from "@/pages/PosKitchen";
import PosDisplay from "@/pages/PosDisplay";
import PosShifts from "@/pages/PosShifts";
import PrinterSettings from "@/pages/PrinterSettings";
import ConnectDevice from "@/pages/ConnectDevice";
import { getDeviceConnection } from "@/lib/deviceConnection";

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);

  const connection = getDeviceConnection();
  if (!connection || path === "/connect") return <ConnectDevice />;
  if (path === "/register") return <PosRegisterGate />;
  if (path === "/kitchen") return <PosKitchen />;
  if (path === "/display") return <PosDisplay />;
  if (path === "/shifts") return <PosShifts />;
  if (path === "/printer") return <PrinterSettings />;

  const destination = connection.role === "register" ? "/register" : connection.role === "kitchen" ? "/kitchen" : "/display";
  window.history.replaceState({}, "", destination);
  return connection.role === "register" ? <PosRegisterGate /> : connection.role === "kitchen" ? <PosKitchen /> : <PosDisplay />;
}
