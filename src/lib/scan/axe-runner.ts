import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import type { ScanSeverity, UrlScanResult, ScanViolation } from "./types";

const NAV_TIMEOUT_MS = 20_000;
const SCAN_TIMEOUT_MS = 45_000;

function toSeverity(impact: unknown): ScanSeverity | null {
  if (impact === "critical" || impact === "serious" || impact === "moderate" || impact === "minor")
    return impact;
  return null;
}

/** Runs axe-core in an isolated browser. Throws with code BROWSER_UNAVAILABLE when engines are missing. */
export async function runAxeScan(targetUrl: string): Promise<UrlScanResult> {
  const started = Date.now();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/executable doesn't exist|has not been downloaded|browser/i.test(message)) {
      throw Object.assign(new Error("Browser engine is not installed. Run: npx playwright install chromium"), {
        code: "BROWSER_UNAVAILABLE",
      });
    }
    throw error;
  }

  try {
    const context = await browser.newContext({ javaScriptEnabled: true });
    // Restrict outbound requests from the page: block private/metadata targets if redirected.
    await context.route("**/*", (route) => {
      const dest = new URL(route.request().url());
      const host = dest.hostname.toLowerCase();
      if (
        host === "localhost" ||
        host.endsWith(".local") ||
        host === "169.254.169.254" ||
        host === "metadata.google.internal"
      ) {
        return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });

    const results = await Promise.race([
      new AxeBuilder({ page }).analyze(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("axe scan timed out")), SCAN_TIMEOUT_MS),
      ),
    ]);

    const violations: ScanViolation[] = results.violations.map((v) => ({
      ruleId: v.id,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      impact: toSeverity(v.impact),
      wcagTags: v.tags.filter((t) => t.startsWith("wcag")),
      nodes: v.nodes.slice(0, 20).map((n) => ({
        target: n.target.map(String),
        html: n.html.slice(0, 500),
      })),
    }));

    return {
      url: targetUrl,
      violations,
      incompleteCount: results.incomplete.length,
      passesCount: results.passes.length,
      durationMs: Date.now() - started,
      scannedAt: new Date().toISOString(),
    };
  } finally {
    await browser.close().catch(() => undefined);
  }
}
