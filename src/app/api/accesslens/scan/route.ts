import { NextResponse } from "next/server";
import { validateScanUrl } from "@/lib/scan/url-validator";
import { runAxeScan } from "@/lib/scan/axe-runner";

export const maxDuration = 60;

const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_HITS = 10;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_HITS;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { success: false, code: "rate_limited", error: "Too many scans. Try again in a minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, code: "invalid_request", error: "Send JSON with a url field." },
      { status: 400 },
    );
  }

  const url = typeof body === "object" && body !== null && "url" in body ? String((body as { url: unknown }).url ?? "") : "";
  if (url.length > 2048) {
    return NextResponse.json(
      { success: false, code: "payload_too_large", error: "URL is too long." },
      { status: 413 },
    );
  }

  const validation = await validateScanUrl(url);
  if (!validation.ok) {
    return NextResponse.json(
      { success: false, code: "invalid_request", error: validation.error },
      { status: 400 },
    );
  }

  try {
    const result = await runAxeScan(validation.url);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    // Server log only — never sent to the client.
    console.error("[accesslens/scan]", error instanceof Error ? error.message : error);
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "BROWSER_UNAVAILABLE") {
      return NextResponse.json(
        { success: false, code: "browser_unavailable", error: "Scan engine is not installed on this host." },
        { status: 503 },
      );
    }
    const message = error instanceof Error ? error.message : "Scan failed.";
    const safe = /timed out|timeout|net::|ERR_|navigation/i.test(message)
      ? "Could not load that page for scanning."
      : "Scan failed for that page.";
    return NextResponse.json({ success: false, code: "scan_failed", error: safe }, { status: 502 });
  }
}
