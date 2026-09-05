import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Keep the established POS package id so existing register installations can
  // upgrade in place. Role is now assigned by Back Office after pairing.
  appId: "io.customli.pos",
  appName: "Customli",
  webDir: "dist",
  android: { allowMixedContent: false },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
