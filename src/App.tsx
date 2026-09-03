import PosRegisterGate from "@/pages/PosRegisterGate";
import PosShifts from "@/pages/PosShifts";
import PosKitchen from "@/pages/PosKitchen";
import PosDisplay from "@/pages/PosDisplay";
import ConnectDevice from "@/pages/ConnectDevice";
import { getDeviceConnection } from "@/lib/deviceConnection";
import { APP_HOME, APP_ROLE, APP_VARIANT } from "@/lib/appVariant";

export default function App() {
  const connection = getDeviceConnection();
  const path = window.location.pathname;

  if (!connection || path === "/connect") return <ConnectDevice />;

  if (connection.role !== APP_ROLE) {
    window.localStorage.removeItem("customli.pos.deviceConnection.v1");
    window.history.replaceState({}, "", "/connect");
    return <ConnectDevice />;
  }

  if (APP_VARIANT === "pos") {
    if (path === "/shifts") return <PosShifts />;
    if (path !== "/register") window.history.replaceState({}, "", "/register");
    return <PosRegisterGate />;
  }

  if (path !== APP_HOME) {
    window.history.replaceState({}, "", APP_HOME);
  }

  if (APP_VARIANT === "kds") return <PosKitchen />;
  return <PosDisplay />;
}
