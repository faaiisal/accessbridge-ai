import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Check,
  CircleHelp,
  Clock3,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="page-wrap">
      <header className="page-header">
        <div>
          <p className="eyebrow">YOUR ACCESSIBILITY WORKSPACE</p>
          <h1>Build a more accessible web.</h1>
          <p className="page-description">
            Practical tools to find barriers, understand their impact, and make
            thoughtful improvements.
          </p>
        </div>
        <Link className="button button-primary" href="/accesslens">
          Open AccessLens <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </header>

      <section className="welcome-panel" aria-labelledby="welcome-heading">
        <div className="welcome-copy">
          <span className="welcome-tag">
            <Sparkles size={14} aria-hidden="true" /> YOUR STARTING POINT
          </span>
          <h2 id="welcome-heading">
            Make the web more accessible, one fix at a time.
          </h2>
          <p>
            Start with AccessLens: a focused workspace for checking common
            accessibility barriers in HTML and React markup.
          </p>
          <Link className="button button-light" href="/accesslens">
            Analyze a code snippet <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="welcome-visual" aria-hidden="true">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-center">
            <ScanSearch size={43} strokeWidth={1.6} />
          </div>
          <div className="visual-chip chip-top">
            <Check size={14} /> Thoughtful checks
          </div>
          <div className="visual-chip chip-bottom">
            <Check size={14} /> Human-led fixes
          </div>
        </div>
      </section>

      <section className="section-block" aria-labelledby="modules-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE WORKSPACE</p>
            <h2 id="modules-heading">Tools for more inclusive experiences</h2>
          </div>
          <span className="section-caption">Choose a place to begin</span>
        </div>
        <div className="module-grid">
          <Link className="module-card module-card-primary" href="/accesslens">
            <span className="module-icon icon-lavender">
              <ScanSearch size={20} aria-hidden="true" />
            </span>
            <span className="module-card-top">
              <span className="module-status status-ready">
                <span aria-hidden="true" /> READY TO USE
              </span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </span>
            <h3>AccessLens AI</h3>
            <p>
              Check common barriers in code and review deterministic starter
              suggestions before you copy them.
            </p>
            <span className="module-card-foot">
              <span><Check size={14} /> Local checks</span>
              <span><Clock3 size={14} /> No setup</span>
            </span>
          </Link>

          <Link className="module-card" href="/skillbridge">
            <span className="module-icon icon-peach">
              <BookOpenCheck size={20} aria-hidden="true" />
            </span>
            <span className="module-card-top">
              <span className="module-status status-sample">
                <span aria-hidden="true" /> LOCAL DEMO
              </span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </span>
            <h3>SkillBridge AI</h3>
            <p>
              Explore a simple, bilingual learning plan with small practical
              exercises and locally saved progress.
            </p>
            <span className="module-card-foot">
              <span><Check size={14} /> Sample lessons</span>
              <span><CircleHelp size={14} /> Human review</span>
            </span>
          </Link>

          <Link className="module-card" href="/supportpilot">
            <span className="module-icon icon-mint">
              <CircleHelp size={20} aria-hidden="true" />
            </span>
            <span className="module-card-top">
              <span className="module-status status-sample">
                <span aria-hidden="true" /> LOCAL DEMO
              </span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </span>
            <h3>SupportPilot AI</h3>
            <p>
              Find guided troubleshooting steps from a small sample knowledge
              base, with clear source context.
            </p>
            <span className="module-card-foot">
              <span><Check size={14} /> Sample sources</span>
              <span><CircleHelp size={14} /> Escalation aware</span>
            </span>
          </Link>
        </div>
      </section>

      <footer className="overview-footer">
        <span>AccessBridge AI · Hackathon prototype</span>
        <span>Automated checks are a starting point, not a conformance claim.</span>
      </footer>
    </div>
  );
}
