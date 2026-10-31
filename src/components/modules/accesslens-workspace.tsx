"use client";

import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  Check,
  Clipboard,
  ClipboardCheck,
  Code2,
  Eye,
  FileCode2,
  Info,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  analyzeAccessibility,
  createSuggestedCode,
  MAX_CODE_LENGTH,
  verifySuggestedCode,
  type AnalysisResult,
  type CodeMode,
  type Finding,
} from "@/lib/accessibility/analyze";
import { accessLensInputSchema } from "@/lib/schemas/accesslens";
import { StatusPill } from "@/components/shared/StatusPill";
import { UrlScanPanel } from "@/components/modules/url-scan-panel";
import { useState } from "react";

const starterCode = `<!doctype html>
<html>
  <head>
    <title>Account settings</title>
  </head>
  <body>
    <h1>Account settings</h1>
    <img src="/profile-photo.jpg">
    <h3>Update your details</h3>
    <button></button>
    <a href="/help"></a>
    <input type="email" placeholder="Email address">
  </body>
</html>`;

const manualChecks = [
  "Tab through the page and confirm the focus order makes sense.",
  "Use only the keyboard to activate buttons, links, and controls.",
  "Check that image descriptions convey the right meaning in context.",
  "Review heading structure and page language against the actual content.",
  "Test with a screen reader and inspect contrast at normal zoom.",
];

function getLineNumber(source: string, offset: number): number {
  return source.slice(0, offset).split("\n").length;
}

function SummaryStatus({ findings }: { findings: Finding[] }) {
  if (findings.length) {
    return (
      <StatusPill tone="failed">
        <AlertCircle size={15} aria-hidden="true" />
        {findings.length} finding{findings.length === 1 ? "" : "s"} to review
      </StatusPill>
    );
  }
  return (
    <StatusPill tone="review">
      <Eye size={15} aria-hidden="true" />
      No supported issues detected · manual review still needed
    </StatusPill>
  );
}

export function AccessLensWorkspace() {
  const [mode, setMode] = useState<CodeMode>("html");
  const [source, setSource] = useState(starterCode);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [suggestedCode, setSuggestedCode] = useState<string | null>(null);
  const [verification, setVerification] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const selectedFinding = analysis?.findings.find(
    (finding) => finding.start === selectedStart,
  );
  const fixableCount =
    analysis?.findings.filter((finding) =>
      finding.fixable &&
        ["image-alt", "button-name", "link-name", "form-control-name"].includes(
          finding.ruleId,
        ),
    ).length ?? 0;

  function runAnalysis(input: string, inputMode: CodeMode) {
    const parsed = accessLensInputSchema.safeParse({ source: input, mode: inputMode });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a code snippet before running the checks.");
      return null;
    }

    setError("");
    const result = analyzeAccessibility(parsed.data.source, parsed.data.mode);
    setAnalysis(result);
    setSelectedStart(result.findings[0]?.start ?? null);
    return result;
  }

  function handleAnalyze() {
    setSuggestedCode(null);
    setVerification(null);
    setVerificationMessage("");
    setCopyMessage("");
    runAnalysis(source, mode);
  }

  function handleSourceChange(value: string) {
    setSource(value);
    setAnalysis(null);
    setSuggestedCode(null);
    setVerification(null);
    setVerificationMessage("");
    setError("");
    setCopyMessage("");
  }

  function handleSuggestedCode() {
    if (!analysis) return;
    const nextCode = createSuggestedCode(source, analysis.findings);
    if (nextCode.length > MAX_CODE_LENGTH) {
      setError(
        "The suggested snippet exceeds the analysis size limit. Shorten the original code before creating suggestions.",
      );
      return;
    }
    setError("");
    setSuggestedCode(nextCode);
    setVerification(null);
    setVerificationMessage("");
  }

  function handleVerify() {
    if (suggestedCode === null) return;
    if (suggestedCode.length > MAX_CODE_LENGTH) {
      setVerificationMessage(
        `The suggested snippet exceeds the ${MAX_CODE_LENGTH.toLocaleString()} character limit and cannot be verified.`,
      );
      return;
    }
    setVerificationMessage("");
    const { result } = verifySuggestedCode(suggestedCode, mode);
    setVerification(result);
  }

  async function handleCopy() {
    if (suggestedCode === null) return;
    try {
      await navigator.clipboard.writeText(suggestedCode);
      setCopyMessage("Suggested code copied.");
    } catch {
      setCopyMessage(
        "Copy was blocked by the browser. Select the suggested code and copy it manually.",
      );
    }
  }

  return (
    <div className="page-wrap accesslens-page">
      <header className="page-header accesslens-heading">
        <div>
          <p className="eyebrow">ACCESSLENS AI · PRIMARY WORKSPACE</p>
          <h1>Find a better way forward.</h1>
          <p className="page-description">
            Run focused local checks on HTML or React markup. Review every
            suggestion before you use it.
          </p>
        </div>
        <span className="local-check-badge">
          <span aria-hidden="true" /> Checks run in your browser
        </span>
      </header>

      <ol className="workflow-steps" aria-label="AccessLens workflow">
        <li className="workflow-step step-current">
          <span>01</span> Analyze
        </li>
        <li className="workflow-connector" aria-hidden="true" />
        <li className={`workflow-step${suggestedCode ? " step-current" : ""}`}>
          <span>02</span> Review
        </li>
        <li className="workflow-connector" aria-hidden="true" />
        <li className={`workflow-step${verification ? " step-current" : ""}`}>
          <span>03</span> Verify
        </li>
      </ol>

      <div style={{ marginBottom: 16 }}>
        <UrlScanPanel />
      </div>

      <section className="editor-card" aria-labelledby="editor-heading">
        <div className="editor-card-header">
          <div className="editor-title">
            <span className="editor-icon">
              <Code2 size={18} aria-hidden="true" />
            </span>
            <div>
              <h2 id="editor-heading">Your code</h2>
              <p>Paste a snippet to run local accessibility checks.</p>
            </div>
          </div>
          <label className="mode-select-label">
            <span>Input mode</span>
            <select
              value={mode}
              onChange={(event) => {
                const nextMode = event.target.value;
                if (nextMode !== "html" && nextMode !== "jsx") return;
                setMode(nextMode);
                setAnalysis(null);
                setSuggestedCode(null);
                setVerification(null);
                setVerificationMessage("");
                setError("");
              }}
            >
              <option value="html">HTML</option>
              <option value="jsx">React / JSX</option>
            </select>
          </label>
        </div>

        <label className="visually-hidden" htmlFor="source-code">
          HTML or React JSX snippet
        </label>
        <textarea
          id="source-code"
          className="code-editor"
          value={source}
          onChange={(event) => handleSourceChange(event.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? "code-helper code-error" : "code-helper"
          }
          placeholder="Paste an HTML or React / JSX snippet..."
        />
        <div className="editor-footer">
          <p id="code-helper">
            Snippets are analyzed locally and never executed. Maximum{" "}
            {MAX_CODE_LENGTH.toLocaleString()} characters.
          </p>
          <span className="character-count">
            {source.length.toLocaleString()} / {MAX_CODE_LENGTH.toLocaleString()}
          </span>
        </div>
        {error && (
          <p className="inline-error" id="code-error" role="alert">
            <AlertCircle size={15} aria-hidden="true" /> {error}
          </p>
        )}
        <div className="editor-actions">
          <span className="privacy-hint">
            <Info size={15} aria-hidden="true" />
            No code is sent to an AI service.
          </span>
          <button
            type="button"
            className="button button-primary"
            onClick={handleAnalyze}
          >
            <ScanSearch size={16} aria-hidden="true" />
            Analyze code
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </section>

      {analysis && (
        <section className="analysis-section" aria-labelledby="analysis-heading">
          <div className="section-heading analysis-heading">
            <div>
              <p className="eyebrow">LOCAL ANALYSIS</p>
              <h2 id="analysis-heading">Review your results</h2>
            </div>
            <SummaryStatus findings={analysis.findings} />
          </div>

          <div className="analysis-summary">
            <div className="summary-item">
              <span className="summary-number">{analysis.scannedElements}</span>
              <span>elements scanned</span>
            </div>
            <div className="summary-divider" aria-hidden="true" />
            <div className="summary-item">
              <span className="summary-number">
                {analysis.findings.filter((finding) => finding.severity === "High").length}
              </span>
              <span>high priority</span>
            </div>
            <div className="summary-divider" aria-hidden="true" />
            <div className="summary-item">
              <span className="summary-number">
                {analysis.findings.filter((finding) => finding.severity === "Medium").length}
              </span>
              <span>review items</span>
            </div>
          </div>

          <div className="findings-grid">
            <section className="findings-card" aria-labelledby="findings-heading">
              <div className="card-heading">
                <h3 id="findings-heading">Detected findings</h3>
                <span className="count-badge">
                  {analysis.findings.length}
                </span>
              </div>
              {analysis.findings.length ? (
                <ul className="finding-list">
                  {analysis.findings.map((finding) => (
                    <li key={`${finding.ruleId}-${finding.start}`}>
                      <button
                        type="button"
                        className={`finding-button${selectedStart === finding.start ? " finding-selected" : ""}`}
                        aria-pressed={selectedStart === finding.start}
                        onClick={() => setSelectedStart(finding.start)}
                      >
                        <span
                          className={`severity-indicator severity-${finding.severity.toLowerCase()}`}
                          aria-hidden="true"
                        />
                        <span className="finding-button-copy">
                          <strong>{finding.title}</strong>
                          <span>
                            {finding.element} · line{" "}
                            {getLineNumber(source, finding.start)}
                          </span>
                        </span>
                        <ArrowRight size={15} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-results">
                  <span className="empty-icon">
                    <Check size={18} aria-hidden="true" />
                  </span>
                  <strong>No supported issues detected</strong>
                  <p>
                    This is not a full accessibility audit. Continue with the
                    manual checks below.
                  </p>
                </div>
              )}
            </section>

            <section className="detail-card" aria-labelledby="detail-heading">
              {selectedFinding ? (
                <>
                  <div className="detail-topline">
                    <span
                      className={`severity-label severity-label-${selectedFinding.severity.toLowerCase()}`}
                    >
                      {selectedFinding.severity} priority
                    </span>
                    <span className="rule-id">{selectedFinding.ruleId}</span>
                  </div>
                  <h3 id="detail-heading">{selectedFinding.title}</h3>
                  <p className="detail-summary">{selectedFinding.summary}</p>
                  <div className="recommendation-block">
                    <strong>What to review</strong>
                    <p>{selectedFinding.recommendation}</p>
                  </div>
                  {selectedFinding.needsManualReview && (
                    <p className="manual-note">
                      <Eye size={15} aria-hidden="true" />
                      Confirm the right fix for this specific content.
                    </p>
                  )}
                  <p className="affected-element">
                    Affected element: <code>{selectedFinding.element}</code> ·
                    line {getLineNumber(source, selectedFinding.start)}
                  </p>
                </>
              ) : (
                <div className="empty-detail">
                  <span className="detail-icon">
                    <Check size={18} aria-hidden="true" />
                  </span>
                  <h3 id="detail-heading">Nothing flagged by these checks</h3>
                  <p>
                    The selected rules did not detect a supported issue in this
                    snippet. This does not confirm overall accessibility.
                  </p>
                </div>
              )}
            </section>
          </div>

          <div className="ai-pending-banner">
            <span className="ai-pending-icon">
              <Sparkles size={17} aria-hidden="true" />
            </span>
            <div>
              <strong>AI explanations are not connected in this build</strong>
              <p>
                Findings and starter suggestions here come only from the
                deterministic local checks. No generated AI advice is shown.
              </p>
            </div>
            <span className="pending-label">INTEGRATION PENDING</span>
          </div>

          <section className="suggestion-section" aria-labelledby="suggestion-heading">
            <div className="section-heading compact-heading">
              <div>
                <p className="eyebrow">REVIEW BEFORE APPLYING</p>
                <h2 id="suggestion-heading">Suggested starting point</h2>
              </div>
              {fixableCount > 0 && !suggestedCode && (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={handleSuggestedCode}
                >
                  <Sparkles size={16} aria-hidden="true" />
                  Create starter suggestions
                </button>
              )}
            </div>

            {!suggestedCode && (
              <div className="suggestion-intro">
                <span className="suggestion-placeholder-icon">
                  <FileCode2 size={20} aria-hidden="true" />
                </span>
                <div>
                  <strong>
                    {fixableCount
                      ? "No changes have been made to your original code."
                      : "No automatic starter suggestion is available for these findings."}
                  </strong>
                  <p>
                    {fixableCount
                      ? `${fixableCount} supported finding${fixableCount === 1 ? "" : "s"} can receive a clearly marked placeholder. Review and replace each placeholder with content that fits your page.`
                      : "Review the recommendations above and make any content-specific changes manually."}
                  </p>
                </div>
              </div>
            )}

            {suggestedCode !== null && (
              <>
                <div className="code-comparison">
                  <CodePanel
                    title="Original · unchanged"
                    code={source}
                    icon={<Code2 size={16} aria-hidden="true" />}
                  />
                  <div className="comparison-arrow" aria-hidden="true">
                    <ArrowRight size={18} />
                  </div>
                  <CodePanel
                    title="Suggested · review placeholders"
                    code={suggestedCode}
                    icon={<FileCode2 size={16} aria-hidden="true" />}
                    suggested
                  />
                </div>
                <div className="suggestion-actions">
                  <p className="placeholder-disclaimer">
                    Placeholder text is not a finished accessibility fix.
                    Replace it with accurate, context-specific content.
                  </p>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={handleCopy}
                  >
                    {copyMessage === "Suggested code copied." ? (
                      <ClipboardCheck size={16} aria-hidden="true" />
                    ) : (
                      <Clipboard size={16} aria-hidden="true" />
                    )}
                    Copy suggested code
                  </button>
                </div>
                {copyMessage && (
                  <p className="copy-message" role="status">
                    {copyMessage}
                  </p>
                )}
                <div className="verification-row">
                  <div>
                    <strong>Re-run the same supported checks</strong>
                    <p>
                      Checks run on the suggested text only after you select
                      this action.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={handleVerify}
                  >
                    Verify suggested code <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
                {verificationMessage && (
                  <p className="inline-error" role="alert">
                    {verificationMessage}
                  </p>
                )}
                {verification && (
                  <div className="verification-result" role="status">
                    <span
                      className={`verification-icon${verification.findings.length ? " verification-icon-failed" : ""}`}
                    >
                      {verification.findings.length ? (
                        <AlertCircle size={17} aria-hidden="true" />
                      ) : (
                        <Eye size={17} aria-hidden="true" />
                      )}
                    </span>
                    <div>
                      <strong>
                        {verification.findings.length
                          ? `Failed: ${verification.findings.length} supported finding${verification.findings.length === 1 ? "" : "s"} remain`
                          : "Needs manual review: no supported issues detected"}
                      </strong>
                      <p>
                        Verification only re-runs the listed local checks. It
                        cannot determine whether placeholder text is accurate
                        or prove WCAG conformance.
                      </p>
                      {verification.findings.length > 0 && (
                        <ul>
                          {verification.findings.map((finding) => (
                            <li key={`${finding.ruleId}-${finding.start}`}>
                              {finding.title} ({finding.ruleId})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          <section className="manual-checks" aria-labelledby="manual-heading">
            <div className="manual-check-header">
              <span className="manual-check-icon">
                <Eye size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="eyebrow">AUTOMATION HAS LIMITS</p>
                <h2 id="manual-heading">Manual testing checklist</h2>
              </div>
            </div>
            <ul className="manual-check-list">
              {manualChecks.map((check) => (
                <li key={check}>
                  <span className="check-box" aria-hidden="true" />
                  {check}
                </li>
              ))}
            </ul>
          </section>

          <div className="analysis-notes">
            <Info size={16} aria-hidden="true" />
            <div>
              <strong>Know what these checks can and cannot tell you</strong>
              <ul>
                {analysis.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function CodePanel({
  title,
  code,
  icon,
  suggested = false,
}: {
  title: string;
  code: string;
  icon: ReactNode;
  suggested?: boolean;
}) {
  return (
    <section
      className={`code-panel${suggested ? " code-panel-suggested" : ""}`}
      aria-label={title}
    >
      <div className="code-panel-header">
        <span>{icon}</span>
        <strong>{title}</strong>
        {suggested && <ArrowDown size={14} aria-hidden="true" />}
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </section>
  );
}
