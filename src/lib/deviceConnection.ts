export type DeviceRole = "register" | "kitchen" | "display";

export type DeviceConnection = {
  apiBase: string;
  deviceToken: string;
  businessName: string;
  deviceName: string;
  role: DeviceRole;
};

const CONNECTION_KEY = "customli.pos.deviceConnection.v1";

export function getDeviceConnection(): DeviceConnection | null {
  try {
    const raw = localStorage.getItem(CONNECTION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DeviceConnection>;
    if (!parsed.apiBase || !parsed.deviceToken || !parsed.role) return null;
    return {
      apiBase: String(parsed.apiBase).replace(/\/$/, ""),
      deviceToken: String(parsed.deviceToken),
      businessName: String(parsed.businessName || "Connected business"),
      deviceName: String(parsed.deviceName || "POS device"),
      role: parsed.role as DeviceRole,
    };
  } catch {
    return null;
  }
}

export function saveDeviceConnection(connection: DeviceConnection) {
  localStorage.setItem(CONNECTION_KEY, JSON.stringify({
    ...connection,
    apiBase: connection.apiBase.replace(/\/$/, ""),
  }));
}

export function clearDeviceConnection() {
  localStorage.removeItem(CONNECTION_KEY);
}
