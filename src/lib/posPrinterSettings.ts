export type PosPrinterSettings = {
  printerName: string;
  paperWidth: 58 | 80;
  autoPrint: boolean;
  cashDrawerAttached: boolean;
  autoOpenCashDrawer: boolean;
  receiptLogoDataUrl: string;
  receiptBusinessName: string;
  receiptLocation: string;
  receiptWebsite: string;
  membershipQrUrl: string;
};

export const POS_PRINTER_SETTINGS_KEY = "customli_pos_printer_settings";

export const DEFAULT_POS_PRINTER_SETTINGS: PosPrinterSettings = {
  printerName: "Receipt printer",
  paperWidth: 58,
  autoPrint: true,
  cashDrawerAttached: false,
  autoOpenCashDrawer: true,
  receiptLogoDataUrl: "",
  receiptBusinessName: "SMASH BROTHERS BURGERS",
  receiptLocation: "Rawai, Phuket",
  receiptWebsite: "SMASHBROSBURGERS.COM",
  membershipQrUrl: "https://smashbrosburgers.com/membership",
};

export function readPosPrinterSettings(): PosPrinterSettings {
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(POS_PRINTER_SETTINGS_KEY) || "null",
    );
    return {
      printerName:
        typeof stored?.printerName === "string" && stored.printerName.trim()
          ? stored.printerName.trim()
          : DEFAULT_POS_PRINTER_SETTINGS.printerName,
      paperWidth: stored?.paperWidth === 80 ? 80 : 58,
      autoPrint: stored?.autoPrint !== false,
      cashDrawerAttached: stored?.cashDrawerAttached === true,
      autoOpenCashDrawer: stored?.autoOpenCashDrawer !== false,
      receiptLogoDataUrl: typeof stored?.receiptLogoDataUrl === "string" ? stored.receiptLogoDataUrl : "",
      receiptBusinessName:
        typeof stored?.receiptBusinessName === "string" && stored.receiptBusinessName.trim()
          ? stored.receiptBusinessName.trim()
          : DEFAULT_POS_PRINTER_SETTINGS.receiptBusinessName,
      receiptLocation:
        typeof stored?.receiptLocation === "string" && stored.receiptLocation.trim()
          ? stored.receiptLocation.trim()
          : DEFAULT_POS_PRINTER_SETTINGS.receiptLocation,
      receiptWebsite:
        typeof stored?.receiptWebsite === "string" && stored.receiptWebsite.trim()
          ? stored.receiptWebsite.trim()
          : DEFAULT_POS_PRINTER_SETTINGS.receiptWebsite,
      membershipQrUrl:
        typeof stored?.membershipQrUrl === "string" && stored.membershipQrUrl.trim()
          ? stored.membershipQrUrl.trim()
          : DEFAULT_POS_PRINTER_SETTINGS.membershipQrUrl,
    };
  } catch {
    return DEFAULT_POS_PRINTER_SETTINGS;
  }
}

export function savePosPrinterSettings(settings: PosPrinterSettings) {
  window.localStorage.setItem(
    POS_PRINTER_SETTINGS_KEY,
    JSON.stringify(settings),
  );
}
