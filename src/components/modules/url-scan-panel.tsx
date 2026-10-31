"use client";

import { AlertCircle, ArrowRight, Globe, ScanSearch } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { UrlScanResult } from "@/lib/scan/types";

export function UrlScanPanel() {
  const [url, setUrl] = useState("https://example.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<UrlScanResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/accesslens/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await response.json()) as {
        success: boolean;
        result?: UrlScanResult;
        error?: string;
      };
      if (!response.ok || !data.success || !data.result) {
        setError(data.error ?? "Scan failed for that page.");
        return;
      }
      setResult(data.result);
    } catch {
      setError("Could not reach the scan service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="editor-card" aria-labelledby="url-scan-heading">
      <div className="editor-card-header">
        <div className="editor-title">
          <span className="editor-icon">
            <Globe size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 id="url-scan-heading">Scan a live website</h2>
            <p>Real axe-core results from an isolated browser. Public URLs only.</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="scan-url">
          Public website URL
        </label>
        <div className="search-input-row">
          <ScanSearch size={18} aria-hidden="true" />
          <input
            id="scan-url"
            className="search-input"
            type="url"
            inputMode="url"
            value={url}
            maxLength={2048}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com"
            required
          />
          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? "Scanning…" : "Run scan"} <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </form>
      {error && (
        <p className="inline-error" role="alert">
          <AlertCircle size={15} aria-hidden="true" /> {error}
        </p>
      )}
      {result && (
        <div className="analysis-summary" role="status">
          <div className="summary-item">
            <span className="summary-number">{result.violations.length}</span>
            <span>violations</span>
          </div>
          <div className="summary-divider" aria-hidden="true" />
          <div className="summary-item">
            <span className="summary-number">{result.incompleteCount}</span>
            <span>needs review</span>
          </div>
          <div className="summary-divider" aria-hidden="true" />
          <div className="summary-item">
            <span className="summary-number">{result.passesCount}</span>
            <span>passes</span>
          </div>
        </div>
      )}
      {result && result.violations.length > 0 && (
        <ul className="knowledge-list">
          {result.violations.slice(0, 10).map((v) => (
            <li key={v.ruleId}>
              <div>
                <strong>
                  {v.ruleId} · {v.help}
                </strong>
                <span>
                  {v.impact ?? "no impact"} · {v.nodes.length} occurrence(s) ·{" "}
                  {v.wcagTags.join(", ") || "no WCAG tag"}
                </span>
                <span>{v.nodes[0]?.target.join(" ")}</span>
              </div>
              <span className="rule-id">{v.nodes.length}</span>
            </li>
          ))}
        </ul>
      )}
      {result && result.violations.length === 0 && (
        <p className="answer-summary">
          No axe violations found. Incomplete checks ({result.incompleteCount}) still need manual
          review — this does not prove WCAG conformance.
        </p>
      )}
    </section>
  );
}
