import { ArrowUpRight, Check, KeyRound, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="page-wrap">
      <header className="page-header module-page-header">
        <div>
          <p className="eyebrow">PREFERENCES</p>
          <h1>Settings</h1>
          <p className="page-description">
            A clear view of what is local, what is connected, and what is not.
          </p>
        </div>
      </header>

      <section className="settings-card" aria-labelledby="privacy-heading">
        <div className="settings-card-heading">
          <span className="module-icon icon-mint">
            <ShieldCheck size={19} aria-hidden="true" />
          </span>
          <div>
            <h2 id="privacy-heading">Privacy and local analysis</h2>
            <p>AccessLens checks run in your browser in this version.</p>
          </div>
        </div>
        <ul className="settings-list">
          <li><Check size={16} aria-hidden="true" /> Submitted snippets are not sent to an AI service.</li>
          <li><Check size={16} aria-hidden="true" /> Snippets are not saved to local storage.</li>
          <li><Check size={16} aria-hidden="true" /> SkillBridge sample progress stays in this browser.</li>
        </ul>
      </section>

      <section className="settings-card" aria-labelledby="ai-settings-heading">
        <div className="settings-card-heading">
          <span className="module-icon icon-lavender">
            <KeyRound size={19} aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow">INTEGRATION PENDING</p>
            <h2 id="ai-settings-heading">AI provider</h2>
            <p>
              Meta Model API integration is not configured. No key is required
              to run this app, and no provider requests are made.
            </p>
          </div>
        </div>
        <div className="integration-status">
          <span className="status-indicator" aria-hidden="true" />
          <span>Not connected</span>
          <a
            href="https://dev.meta.ai/docs/overview"
            target="_blank"
            rel="noreferrer"
          >
            Integration documentation <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}
