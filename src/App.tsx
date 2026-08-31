import PosRegisterGate from "@/pages/PosRegisterGate";
import PosKitchen from "@/pages/PosKitchen";
import PosDisplay from "@/pages/PosDisplay";
import ConnectDevice from "@/pages/ConnectDevice";
import { getDeviceConnection } from "@/lib/deviceConnection";
import { APP_HOME, APP_ROLE, APP_VARIANT } from "@/lib/appVariant";

export default function App() {
  const connection = getDeviceConnection();
  if (!connection || window.location.pathname === "/connect") return <ConnectDevice />;

  if (connection.role !== APP_ROLE) {
    window.localStorage.removeItem("customli.pos.deviceConnection.v1");
    window.history.replaceState({}, "", "/connect");
    return <ConnectDevice />;
  }

  if (window.location.pathname !== APP_HOME) {
    window.history.replaceState({}, "", APP_HOME);
  }

  if (APP_VARIANT === "kds") return <PosKitchen />;
  if (APP_VARIANT === "cds") return <PosDisplay />;
  return <PosRegisterGate />;
}
