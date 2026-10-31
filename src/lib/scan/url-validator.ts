import { promises as dns } from "node:dns";
import { z } from "zod";

export const scanUrlSchema = z
  .string()
  .min(1, "Enter a public website URL.")
  .max(2048, "URL is too long.")
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Use a public http:// or https:// URL.");

export type ScanUrlInput = z.infer<typeof scanUrlSchema>;

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return true;
  if (host === "metadata.google.internal") return true;
  return false;
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true; // cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 0 || a >= 224) return true;
  return false;
}

function isPrivateIP(ip: string): boolean {
  if (ip.includes(":")) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80"))
      return true;
    return false;
  }
  return isPrivateIPv4(ip);
}

/** Validate initial URL + resolved DNS. Redirect targets are re-validated in the runner. */
export async function validateScanUrl(input: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const parsed = scanUrlSchema.safeParse(input.trim());
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid URL." };
  }
  const url = new URL(parsed.data);
  if (isPrivateHostname(url.hostname)) {
    return { ok: false, error: "That host is not a public website." };
  }
  if (isPrivateIP(url.hostname)) {
    return { ok: false, error: "That IP address is not scannable." };
  }
  try {
    const addresses = await dns.lookup(url.hostname, { all: true });
    if (addresses.some((a) => isPrivateIP(a.address))) {
      return { ok: false, error: "That host resolves to a private address." };
    }
  } catch {
    return { ok: false, error: "Could not resolve that host." };
  }
  return { ok: true, url: url.toString() };
}
