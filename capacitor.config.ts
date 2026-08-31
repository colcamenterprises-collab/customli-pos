import type { CapacitorConfig } from "@capacitor/cli";

const variant = String(process.env.CUSTOMLI_APP_VARIANT || "pos").toLowerCase();
const app = variant === "kds"
  ? { appId: "io.customli.kds", appName: "Customli KDS" }
  : variant === "cds"
    ? { appId: "io.customli.cds", appName: "Customli CDS" }
    : { appId: "io.customli.pos", appName: "Customli POS" };

const config: CapacitorConfig = {
  ...app,
  webDir: "dist",
  android: { allowMixedContent: false },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
