export type AppVariant = "pos" | "kds" | "cds";

const raw = String(import.meta.env.VITE_CUSTOMLI_APP_VARIANT || "pos").toLowerCase();

export const APP_VARIANT: AppVariant = raw === "kds" || raw === "cds" ? raw : "pos";

export const APP_ROLE = APP_VARIANT === "kds" ? "kitchen" : APP_VARIANT === "cds" ? "display" : "register";

export const APP_NAME = APP_VARIANT === "kds" ? "Customli KDS" : APP_VARIANT === "cds" ? "Customli CDS" : "Customli POS";

export const APP_HOME = APP_VARIANT === "kds" ? "/kitchen" : APP_VARIANT === "cds" ? "/display" : "/register";
