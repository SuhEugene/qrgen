import {
  renderANSI,
  renderSVG,
  renderUnicode,
  renderUnicodeCompact,
  type QrCodeGenerateOptions,
} from "uqr";
import { isBot } from "./bots";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const ECC_LEVELS = ["L", "M", "Q", "H"] as const;
type EccLevel = (typeof ECC_LEVELS)[number];

export function getQrOptions(url: URL): QrCodeGenerateOptions {
  const mnv = String(
    url.searchParams.get("minv") || url.searchParams.get("mnv") || url.searchParams.get("mn"),
  );
  const mxv = String(
    url.searchParams.get("maxv") || url.searchParams.get("mxv") || url.searchParams.get("mx"),
  );
  const ecc = String(
    url.searchParams.get("ecc") || url.searchParams.get("ec") || url.searchParams.get("e"),
  );
  const b = String(url.searchParams.get("border") || url.searchParams.get("b"));
  const i = String(url.searchParams.get("invert") || url.searchParams.get("i"));
  const hasI = url.searchParams.has("invert") || url.searchParams.has("i");

  let minVersion = parseInt(mnv);
  if (isNaN(minVersion)) minVersion = 1;
  minVersion = clamp(minVersion, 1, 40);

  let maxVersion = parseInt(mxv);
  if (isNaN(maxVersion)) maxVersion = 40;
  maxVersion = clamp(maxVersion, 1, 40);

  if (minVersion > maxVersion) minVersion = maxVersion;

  let border = parseInt(b);
  if (isNaN(border)) border = 1;
  border = clamp(border, 0, 64);

  const eccLevel = ECC_LEVELS.includes(ecc as EccLevel) ? (ecc as EccLevel) : "L";
  const invert = hasI && i !== "0" && i !== "false";

  if (isNaN(minVersion) || isNaN(maxVersion)) {
    minVersion = 1;
    maxVersion = 40;
  }

  return {
    ecc: eccLevel,
    minVersion,
    maxVersion,
    border,
    invert,
  };
}

export type QRRenderer = "text" | "html";
const BROWSER_UA = ["opr/", "opera", "chrome/", "edg/", "safari/", "firefox/"];

export function decideRenderer(url: URL, userAgent: string): QRRenderer {
  if (url.pathname === "/html") return "html";
  if (url.pathname.endsWith(".html")) return "html";
  if (url.pathname.endsWith(".txt")) return "text";
  if (url.pathname.endsWith(".svg")) return "text";

  if (userAgent.startsWith("mozilla/5.0")) return "html";
  if (BROWSER_UA.some((ua) => userAgent.includes(ua))) return "html";
  if (isBot(userAgent)) return "html";

  return "text";
}

export type QRType = "ansi" | "svg" | "unicode" | "unicode-compact";
const pathsForType: Record<QRType, string[]> = {
  ansi: ["a", "ansi"],
  svg: ["s", "svg", "html"],
  unicode: ["u", "uni", "unc", "utf8", "utf-8", "unicode"],
  "unicode-compact": [
    "uc",
    "u-c",
    "unc-c",
    "uni-c",
    "utf8c",
    "utf-8c",
    "utf8-c",
    "utf-8-c",
    "unicode-c",
    "u-compact",
    "unc-compact",
    "uni-compact",
    "utf8-compact",
    "utf-8-compact",
    "unicode-compact",
  ],
};

export function getQrType(url: URL, renderer: QRRenderer): QRType {
  let path = url.pathname.slice(1);
  if (path.includes(".")) {
    const newPath = path.split(".");
    newPath.pop();
    path = newPath.join(".");
  }

  if (url.pathname.endsWith(".svg")) return "svg";

  for (const [type, paths] of Object.entries(pathsForType))
    if (paths.includes(path)) return type as QRType;

  return renderer === "html" ? "svg" : "ansi";
}

export function getQr(type: QRType, data: string, options: QrCodeGenerateOptions): string {
  switch (type) {
    case "ansi":
      return renderANSI(data, options);
    case "svg":
      return renderSVG(data, options);
    case "unicode":
      return renderUnicode(data, options);
    case "unicode-compact":
      return renderUnicodeCompact(data, options);
  }
}