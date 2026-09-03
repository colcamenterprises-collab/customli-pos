import { SBB_MEMBERSHIP_QR_URL, SBB_RECEIPT_BRAND_NAME, SBB_RECEIPT_WEBSITE } from "@/lib/receiptBranding";

export type NativePrinterDevice = {
  name: string;
  address: string;
  bonded?: boolean;
};

type NativeThermalPrinter = {
  listPrinters: () => Promise<{ printers: NativePrinterDevice[] }>;
  connect: (options: { address: string }) => Promise<{ connected: boolean; name?: string; address?: string; connectionMethod?: string }>;
  disconnect: () => Promise<{ connected: boolean }>;
  getStatus: () => Promise<{ connected: boolean; name?: string; address?: string; connectionMethod?: string }>;
  printRaw: (options: { base64: string }) => Promise<{ ok: boolean; connectionMethod?: string }>;
  printTest: () => Promise<{ ok: boolean; connectionMethod?: string }>;
  openCashDrawer: () => Promise<{ ok: boolean }>;
  speak: (options: { text: string; language?: string }) => Promise<{ ok: boolean }>;
};

type CapacitorWindow = Window & {
  Capacitor?: {
    isNativePlatform?: () => boolean;
    Plugins?: Record<string, unknown>;
  };
};

const STORAGE_KEY = "customli.nativePrinter.address";

export function nativePrinterAvailable() {
  const cap = (window as CapacitorWindow).Capacitor;
  return Boolean(cap?.isNativePlatform?.() && cap?.Plugins?.ThermalPrinter);
}

function plugin(): NativeThermalPrinter {
  const cap = (window as CapacitorWindow).Capacitor;
  const value = cap?.Plugins?.ThermalPrinter as NativeThermalPrinter | undefined;
  if (!value) throw new Error("Native thermal printer is not available in this browser");
  return value;
}

export function readSavedPrinterAddress() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function savePrinterAddress(address: string) {
  if (address) localStorage.setItem(STORAGE_KEY, address);
  else localStorage.removeItem(STORAGE_KEY);
}

export async function listNativePrinters() {
  return (await plugin().listPrinters()).printers || [];
}

export async function connectNativePrinter(address: string) {
  const result = await plugin().connect({ address });
  if (result.connected) savePrinterAddress(address);
  return result;
}

export async function reconnectSavedPrinter() {
  if (!nativePrinterAvailable()) return { connected: false };
  const address = readSavedPrinterAddress();
  if (!address) return { connected: false };
  try {
    return await connectNativePrinter(address);
  } catch {
    return { connected: false };
  }
}

export async function getNativePrinterStatus() {
  return plugin().getStatus();
}

export async function disconnectNativePrinter() {
  savePrinterAddress("");
  return plugin().disconnect();
}

export async function nativeTestPrint() {
  return plugin().printTest();
}

export async function nativeOpenCashDrawer() {
  return plugin().openCashDrawer();
}

export async function nativeSpeak(text: string, language = "en-US") {
  if (!nativePrinterAvailable()) throw new Error("Native device bridge unavailable");
  return plugin().speak({ text, language });
}

export async function printEscPosBytes(bytes: Uint8Array) {
  if (!nativePrinterAvailable()) throw new Error("Native printer unavailable");
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return plugin().printRaw({ base64: btoa(binary) });
}

const enc = new TextEncoder();
const concat = (...chunks: Uint8Array[]) => {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
};

const text = (value: string) => enc.encode(value.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?"));
const cmd = (...values: number[]) => new Uint8Array(values);
const INIT = cmd(0x1b, 0x40);
const ALIGN_LEFT = cmd(0x1b, 0x61, 0x00);
const ALIGN_CENTER = cmd(0x1b, 0x61, 0x01);
const BOLD_ON = cmd(0x1b, 0x45, 0x01);
const BOLD_OFF = cmd(0x1b, 0x45, 0x00);
const SIZE_NORMAL = cmd(0x1d, 0x21, 0x00);
const SIZE_DOUBLE = cmd(0x1d, 0x21, 0x11);
const CUT = cmd(0x1d, 0x56, 0x00);
const FEED_AND_CUT = concat(text("\n\n\n"), CUT);

export type ReceiptPayload = {
  ticketNumber: string;
  orderMode?: string;
  grabOrderNumber?: string;
  customerName?: string;
  createdAt?: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  total: number;
  cashReceived?: number;
  change?: number;
  lines: {
    quantity: number;
    name: string;
    unitPrice: number;
    modifiers?: { name: string; price: number }[];
    notes?: string;
    setUpgrade?: boolean;
    drinkName?: string;
    isSetComponent?: boolean;
  }[];
};

const money = (value: number) => `THB ${Number(value || 0).toFixed(2)}`;
const WIDTH = 32;
const RULE = "--------------------------------";
const HEAVY_RULE = "================================";
const pair = (left: string, right: string) => {
  const r = right.slice(0, WIDTH);
  return `${left.slice(0, Math.max(1, WIDTH - r.length - 1)).padEnd(Math.max(1, WIDTH - r.length - 1))} ${r}`;
};

const qrCode = (value: string) => {
  const data = enc.encode(value);
  const storeLength = data.length + 3;
  const pL = storeLength & 0xff;
  const pH = (storeLength >> 8) & 0xff;
  return concat(
    cmd(0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00),
    cmd(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x05),
    cmd(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31),
    cmd(0x1d, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30),
    data,
    cmd(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30),
  );
};

const orderIdentity = (payload: ReceiptPayload) => {
  const isGrab = String(payload.orderMode || payload.paymentMethod).toLowerCase() === "grab";
  if (!isGrab) return { label: "ORDER", value: payload.ticketNumber || "---", customer: "" };
  const raw = String(payload.grabOrderNumber || "").trim().replace(/^GF[-\s]*/i, "");
  return {
    label: "GRAB",
    value: raw ? `GF-${raw}` : payload.ticketNumber || "GRAB",
    customer: String(payload.customerName || "").trim().toUpperCase(),
  };
};

const formatOrderDateTime = (createdAt?: string) => {
  const date = createdAt ? new Date(createdAt) : new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value || "";
  return { date: `${get("day")}/${get("month")}/${get("year")}`, time: `${get("hour")}:${get("minute")}` };
};

const itemLines = (payload: ReceiptPayload) => {
  const lines: string[] = [];
  for (const line of payload.lines) {
    if (line.isSetComponent) {
      lines.push(`    [ ] ${line.quantity} x ${line.name}`.slice(0, WIDTH));
      continue;
    }

    const amount = money(line.quantity * line.unitPrice);
    const left = `[ ] ${line.quantity} x ${line.name}`;
    if (left.length + amount.length + 1 <= WIDTH) lines.push(pair(left, amount));
    else {
      lines.push(left.slice(0, WIDTH));
      if (line.unitPrice > 0) lines.push(pair("", amount));
    }
    for (const modifier of line.modifiers || []) {
      const modifierPrice = Number(modifier.price || 0);
      const suffix = modifierPrice ? ` ${money(modifierPrice)}` : "";
      lines.push(`    + ${modifier.name}${suffix}`.slice(0, WIDTH));
    }
    if (line.setUpgrade) lines.push("    + SET UPGRADE");
    if (line.drinkName) lines.push(`    + ${line.drinkName}`.slice(0, WIDTH));
    if (line.notes) lines.push(`    NOTE: ${line.notes}`.slice(0, WIDTH));
  }
  return lines;
};

function buildReceiptCopy(payload: ReceiptPayload, copyLabel: "CASHIER COPY" | "CUSTOMER COPY", cut = true) {
  const identity = orderIdentity(payload);
  const stamp = formatOrderDateTime(payload.createdAt);
  const items = itemLines(payload);
  const totals = [pair("PAYMENT", String(payload.paymentMethod || "UNKNOWN").toUpperCase()), pair("SUBTOTAL", money(payload.subtotal))];
  if (payload.discount > 0) totals.push(pair("DISCOUNT", `-${money(payload.discount)}`));
  totals.push(pair("TOTAL", money(payload.total)));
  if (payload.cashReceived !== undefined) totals.push(pair("CASH", money(payload.cashReceived)));
  if (payload.change !== undefined) totals.push(pair("CHANGE", money(payload.change)));

  return concat(
    INIT,
    ALIGN_CENTER,
    BOLD_ON,
    text(`${SBB_RECEIPT_BRAND_NAME}\n`),
    BOLD_OFF,
    text("Rawai, Phuket\n\n"),
    BOLD_ON,
    text(`${copyLabel}\n\n`),
    BOLD_OFF,
    text(`${identity.label}\n`),
    SIZE_DOUBLE,
    BOLD_ON,
    text(`${identity.value}\n`),
    SIZE_NORMAL,
    identity.customer ? text(`${identity.customer}\n`) : text(""),
    BOLD_OFF,
    text(`${RULE}\n`),
    ALIGN_LEFT,
    text(items.join("\n") + "\n"),
    text(`${RULE}\n`),
    text(totals.join("\n") + "\n"),
    text(pair(stamp.date, stamp.time) + "\n"),
    text(`${HEAVY_RULE}\n`),
    BOLD_ON,
    text("PACKED [ ]\n"),
    BOLD_OFF,
    ALIGN_CENTER,
    text("\nScan to join Smash Club\n"),
    qrCode(SBB_MEMBERSHIP_QR_URL),
    text("\n"),
    BOLD_ON,
    text(`${SBB_RECEIPT_WEBSITE}\n`),
    BOLD_OFF,
    text(copyLabel === "CUSTOMER COPY" ? "THANK YOU\n" : "\n"),
    cut ? FEED_AND_CUT : text("\n\n"),
  );
}

export function buildReceiptEscPos(payload: ReceiptPayload) {
  return concat(
    buildReceiptCopy(payload, "CASHIER COPY", true),
    buildReceiptCopy(payload, "CUSTOMER COPY", true),
  );
}

export async function printReceiptNative(payload: ReceiptPayload, openDrawer = false) {
  if (!nativePrinterAvailable()) return { attempted: false, ok: false, message: "Native printer unavailable" };
  let status = await getNativePrinterStatus().catch(() => ({ connected: false }));
  if (!status.connected) status = await reconnectSavedPrinter();
  if (!status.connected) return { attempted: true, ok: false, message: "Printer is not connected" };

  const bytes = buildReceiptEscPos(payload);
  try {
    await printEscPosBytes(bytes);
  } catch (firstError) {
    const reconnected = await reconnectSavedPrinter();
    if (!reconnected.connected) {
      return {
        attempted: true,
        ok: false,
        message: firstError instanceof Error ? firstError.message : "Printing failed and printer could not reconnect",
      };
    }
    try {
      await printEscPosBytes(bytes);
    } catch (retryError) {
      return {
        attempted: true,
        ok: false,
        message: retryError instanceof Error ? retryError.message : "Printing failed after reconnect",
      };
    }
  }

  if (openDrawer) await nativeOpenCashDrawer().catch(() => undefined);
  return { attempted: true, ok: true, message: "Cashier and customer receipts printed" };
}
