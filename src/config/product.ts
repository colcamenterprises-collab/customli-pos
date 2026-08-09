export type DeviceRole = "register" | "kitchen" | "display";
export const PRODUCT = { owner: "Customli.io", name: "Customli POS", appId: "io.customli.pos", storagePrefix: "customli.pos" } as const;
export const REFERENCE_TENANT = { id: "sbb", name: "Smash Brothers Burgers", status: "customer-1-reference" } as const;
export const DEVICE_ROLE_KEY = `${PRODUCT.storagePrefix}.deviceRole`;
