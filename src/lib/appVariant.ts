import type { DeviceRole } from "@/lib/deviceConnection";

export const APP_VERSION = "1.1.0";
export const APP_NAME = "Customli";

export function homeForRole(role: DeviceRole) {
  if (role === "kitchen") return "/kitchen";
  if (role === "display") return "/display";
  return "/register";
}

export function nameForRole(role: DeviceRole) {
  if (role === "kitchen") return "Customli Kitchen Display";
  if (role === "display") return "Customli Customer Display";
  return "Customli POS";
}
