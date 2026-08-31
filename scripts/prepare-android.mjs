import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const androidDir = resolve(root, "android");

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (!existsSync(androidDir)) {
  run("npx", ["cap", "add", "android"]);
}

run("npx", ["cap", "sync", "android"]);

const javaDir = resolve(androidDir, "app/src/main/java/io/customli/pos");
mkdirSync(javaDir, { recursive: true });
copyFileSync(resolve(root, "native/android/MainActivity.java"), resolve(javaDir, "MainActivity.java"));
copyFileSync(resolve(root, "native/android/ThermalPrinterPlugin.java"), resolve(javaDir, "ThermalPrinterPlugin.java"));

const manifestPath = resolve(androidDir, "app/src/main/AndroidManifest.xml");
let manifest = readFileSync(manifestPath, "utf8");
const permissions = [
  '<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />',
  '<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />',
  '<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />',
  '<uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />',
];
for (const permission of permissions) {
  if (!manifest.includes(permission)) manifest = manifest.replace("<application", `${permission}\n    <application`);
}
writeFileSync(manifestPath, manifest);

console.log("Customli POS Android project prepared with native printer/TTS bridge.");
