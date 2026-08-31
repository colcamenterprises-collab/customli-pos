import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const androidDir = resolve(root, "android");
const variant = String(process.env.CUSTOMLI_APP_VARIANT || "pos").toLowerCase();
const packageName = variant === "kds" ? "io.customli.kds" : variant === "cds" ? "io.customli.cds" : "io.customli.pos";
const appName = variant === "kds" ? "Customli KDS" : variant === "cds" ? "Customli CDS" : "Customli POS";

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32", env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (process.env.CUSTOMLI_CLEAN_ANDROID === "1" && existsSync(androidDir)) {
  rmSync(androidDir, { recursive: true, force: true });
}

if (!existsSync(androidDir)) {
  run("npx", ["cap", "add", "android"]);
}

run("npx", ["cap", "sync", "android"]);

const packagePath = packageName.split(".").join("/");
const javaDir = resolve(androidDir, `app/src/main/java/${packagePath}`);
mkdirSync(javaDir, { recursive: true });

for (const fileName of ["MainActivity.java", "ThermalPrinterPlugin.java"]) {
  const source = readFileSync(resolve(root, `native/android/${fileName}`), "utf8")
    .replace(/^package io\.customli\.pos;/m, `package ${packageName};`);
  writeFileSync(resolve(javaDir, fileName), source);
}

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

const stringsPath = resolve(androidDir, "app/src/main/res/values/strings.xml");
if (existsSync(stringsPath)) {
  let strings = readFileSync(stringsPath, "utf8");
  strings = strings.replace(/<string name="app_name">[^<]*<\/string>/, `<string name="app_name">${appName}</string>`);
  strings = strings.replace(/<string name="title_activity_main">[^<]*<\/string>/, `<string name="title_activity_main">${appName}</string>`);
  strings = strings.replace(/<string name="package_name">[^<]*<\/string>/, `<string name="package_name">${packageName}</string>`);
  strings = strings.replace(/<string name="custom_url_scheme">[^<]*<\/string>/, `<string name="custom_url_scheme">${packageName}</string>`);
  writeFileSync(stringsPath, strings);
}

console.log(`${appName} Android project prepared (${packageName}) with native printer/TTS bridge.`);
