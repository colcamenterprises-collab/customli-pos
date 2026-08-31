import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.customli.pos",
  appName: "Customli POS",
  webDir: "dist",
  android: { allowMixedContent: false },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
