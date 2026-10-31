"use client";

import { ArrowRight, BookOpenText, LifeBuoy, Search, ShieldAlert } from "lucide-react";
import { useState, type FormEvent } from "react";

interface Article {
  id: string;
  title: string;
  keywords: string[];
  summary: string;
  steps: string[];
}

const articles: Article[] = [
  {
    id: "S-01",
    title: "Sign-in troubleshooting",
    keywords: ["sign", "login", "log in", "password", "account access"],
    summary: "Sample steps for common sign-in issues.",
    steps: [
      "Check that the email address is entered correctly.",
      "Use the password reset option if you cannot sign in.",
      "If the issue continues, contact your organization's support team.",
    ],
  },
  {
    id: "S-02",
    title: "Update account email",
    keywords: ["email", "change email", "update account", "profile"],
    summary: "Sample steps for updating an account email address.",
    steps: [
      "Open your account profile settings.",
      "Choose the email update option and enter the new address.",
      "Follow the confirmation instructions sent to that address.",
    ],
  },
  {
    id: "S-03",
    title: "Keyboard navigation basics",
    keywords: ["keyboard", "tab", "focus", "accessibility", "screen reader"],
    summary: "Sample steps for checking basic keyboard access.",
    steps: [
      "Press Tab to move through interactive elements and Shift+Tab to move back.",
      "Use Enter or Space to activate the focused control when appropriate.",
      "If a control cannot be reached or operated, share the page and browser details with support.",
    ],
  },
];

export function SupportPilotDemo() {
  const [question, setQuestion] = useState("");
  const [article, setArticle] = useState<Article | null>(null);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  function findArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = question.trim();
    if (!query) {
      setMessage("Enter a question to search the sample support content.");
      return;
    }
    const normalized = query.toLowerCase();
    const match =
      articles.find((candidate) =>
        candidate.keywords.some((keyword) =>
          normalized.includes(keyword.toLowerCase()),
        ),
      ) ?? null;

    setArticle(match);
    setSearched(true);
    setMessage("");
    setHistory((previous) => [query, ...previous].slice(0, 5));
  }

  return (
    <div className="page-wrap">
      <header className="page-header module-page-header">
        <div>
          <p className="eyebrow">SUPPORTPILOT AI · LOCAL DEMO</p>
          <h1>Get a clear next step.</h1>
          <p className="page-description">
            Search a small sample knowledge base for practical troubleshooting
            steps and their source.
          </p>
        </div>
        <span className="local-check-badge">
          <span aria-hidden="true" /> Sample knowledge only
        </span>
      </header>

      <div className="demo-notice">
        <BookOpenText size={17} aria-hidden="true" />
        <p>
          Answers are matched only against the sample articles shown here. If
          no relevant source is found, the demo will say so rather than guess.
        </p>
      </div>

      <form className="editor-card support-search" onSubmit={findArticle}>
        <label className="field-label" htmlFor="support-question">
          What do you need help with?
        </label>
        <p className="field-hint" id="support-hint">
          Try “I can’t sign in”, “change my email”, or “keyboard navigation”.
        </p>
        <div className="search-input-row">
          <Search size={18} aria-hidden="true" />
          <input
            id="support-question"
            className="search-input"
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              setMessage("");
            }}
            aria-describedby="support-hint"
            placeholder="Describe the issue you are experiencing..."
            maxLength={240}
          />
          <button type="submit" className="button button-primary">
            Search <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
        {message && (
          <p className="inline-error" role="alert">
            {message}
          </p>
        )}
      </form>

      {searched && (
        <section className="support-result" aria-live="polite">
          {article ? (
            <div className="support-answer-card">
              <div className="support-answer-heading">
                <span className="module-icon icon-mint">
                  <LifeBuoy size={19} aria-hidden="true" />
                </span>
                <div>
                  <p className="eyebrow">SAMPLE SUPPORT STEPS</p>
                  <h2>{article.title}</h2>
                </div>
              </div>
              <p className="answer-summary">{article.summary}</p>
              <ol className="troubleshooting-list">
                {article.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="reference-row">
                <BookOpenText size={16} aria-hidden="true" />
                <span>
                  Source: Sample knowledge base · {article.id} · {article.title}
                </span>
              </div>
              <div className="escalation-note">
                <ShieldAlert size={17} aria-hidden="true" />
                <p>
                  Still stuck, or dealing with an urgent or sensitive issue?
                  Contact a human support representative.
                </p>
              </div>
            </div>
          ) : (
            <div className="no-match-card">
              <span className="empty-icon">
                <Search size={18} aria-hidden="true" />
              </span>
              <h2>No relevant sample article found</h2>
              <p>
                This local demo does not have enough information to answer
                that. It has not generated or verified a solution.
              </p>
              <div className="escalation-note">
                <ShieldAlert size={17} aria-hidden="true" />
                <p>
                  Please contact a human support representative for help with
                  this question.
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="knowledge-base" aria-labelledby="knowledge-heading">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow">AVAILABLE CONTEXT</p>
            <h2 id="knowledge-heading">Sample knowledge base</h2>
          </div>
          <span className="section-caption">{articles.length} sample articles</span>
        </div>
        <ul className="knowledge-list">
          {articles.map((item) => (
            <li key={item.id}>
              <BookOpenText size={17} aria-hidden="true" />
              <div>
                <strong>{item.title}</strong>
                <span>{item.summary}</span>
              </div>
              <span className="rule-id">{item.id}</span>
            </li>
          ))}
        </ul>
      </section>

      {history.length > 0 && (
        <section className="support-history" aria-labelledby="history-heading">
          <h2 id="history-heading">Recent questions in this session</h2>
          <ul>
            {history.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
