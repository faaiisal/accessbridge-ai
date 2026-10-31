"use client";

import { BookOpenCheck, Clock3, RotateCcw, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";

type Language = "en" | "bn";

const translations = {
  en: {
    goal: "Learning goal",
    goalHint: "What would you like to learn?",
    language: "Learning language",
    level: "Current level",
    time: "Time available each day",
    start: "Create a sample plan",
    plan: "Your sample learning path",
    sample: "LOCAL SAMPLE · NOT AI-GENERATED",
    stepOne: "Start with the essentials",
    stepOneBody: "Review key terms, then write down one question to explore.",
    stepTwo: "Learn by doing",
    stepTwoBody: "Try a short, practical exercise connected to your goal.",
    stepThree: "Reflect and continue",
    stepThreeBody: "Summarize what you learned and decide what to practice next.",
    exercise: "Practice task",
    exerciseBody:
      "Explain one idea from today's lesson in your own words. Add an example and one question you still have.",
    complete: "Mark practice complete",
    reset: "Reset local progress",
    saved: "Progress is saved in this browser only.",
    unavailable: "Local progress could not be saved in this browser.",
    goalError: "Add a learning goal to create a sample plan.",
  },
  bn: {
    goal: "শেখার লক্ষ্য",
    goalHint: "আপনি কী শিখতে চান?",
    language: "শেখার ভাষা",
    level: "বর্তমান দক্ষতার স্তর",
    time: "প্রতিদিন শেখার সময়",
    start: "নমুনা পরিকল্পনা তৈরি করুন",
    plan: "আপনার নমুনা শেখার পথ",
    sample: "স্থানীয় নমুনা · AI তৈরি নয়",
    stepOne: "প্রয়োজনীয় বিষয় দিয়ে শুরু করুন",
    stepOneBody: "মূল শব্দগুলো দেখুন, তারপর অনুসন্ধানের জন্য একটি প্রশ্ন লিখুন।",
    stepTwo: "অনুশীলনের মাধ্যমে শিখুন",
    stepTwoBody: "আপনার লক্ষ্যের সঙ্গে সম্পর্কিত একটি ছোট ব্যবহারিক কাজ করুন।",
    stepThree: "ভাবুন এবং এগিয়ে যান",
    stepThreeBody: "কী শিখেছেন সংক্ষেপে লিখুন এবং পরবর্তী অনুশীলন বেছে নিন।",
    exercise: "অনুশীলনের কাজ",
    exerciseBody:
      "আজকের একটি ধারণা নিজের ভাষায় ব্যাখ্যা করুন। একটি উদাহরণ এবং আপনার একটি প্রশ্ন যোগ করুন।",
    complete: "অনুশীলন সম্পন্ন হিসেবে চিহ্নিত করুন",
    reset: "স্থানীয় অগ্রগতি মুছুন",
    saved: "অগ্রগতি শুধু এই ব্রাউজারে সংরক্ষিত হয়।",
    unavailable: "এই ব্রাউজারে স্থানীয় অগ্রগতি সংরক্ষণ করা যায়নি।",
    goalError: "নমুনা পরিকল্পনা তৈরি করতে শেখার লক্ষ্য লিখুন।",
  },
} satisfies Record<Language, Record<string, string>>;

const STORAGE_KEY = "accessbridge-skillbridge-progress";

export function SkillBridgeDemo() {
  const [goal, setGoal] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [level, setLevel] = useState("beginner");
  const [minutes, setMinutes] = useState("20");
  const [planReady, setPlanReady] = useState(false);
  const [complete, setComplete] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [message, setMessage] = useState("");
  const t = translations[language];

  function loadProgress() {
    if (progressLoaded) return;
    try {
      setComplete(window.localStorage.getItem(STORAGE_KEY) === "complete");
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
      setMessage(t.unavailable);
    }
    setProgressLoaded(true);
  }

  function createPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!goal.trim()) {
      setMessage(t.goalError);
      return;
    }
    loadProgress();
    setMessage("");
    setPlanReady(true);
  }

  function updateProgress(nextValue: boolean) {
    try {
      if (nextValue) {
        window.localStorage.setItem(STORAGE_KEY, "complete");
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      setComplete(nextValue);
      setProgressLoaded(true);
      setStorageAvailable(true);
      setMessage(t.saved);
    } catch {
      setProgressLoaded(true);
      setStorageAvailable(false);
      setMessage(t.unavailable);
    }
  }

  return (
    <div className="page-wrap">
      <header className="page-header module-page-header">
        <div>
          <p className="eyebrow">SKILLBRIDGE AI · LOCAL DEMO</p>
          <h1>Learn at your own pace.</h1>
          <p className="page-description">
            A small, bilingual learning-plan demonstration with sample
            activities. No AI-generated lessons or feedback are provided.
          </p>
        </div>
        <span className="local-check-badge">
          <span aria-hidden="true" /> Sample content only
        </span>
      </header>

      <div className="demo-notice">
        <Sparkles size={17} aria-hidden="true" />
        <p>
          This is a deterministic local demo. The plan follows the same sample
          structure for each learner; it is not personalized instruction.
        </p>
      </div>

      <form className="editor-card skill-form" onSubmit={createPlan}>
        <div className="editor-title">
          <span className="editor-icon">
            <BookOpenCheck size={18} aria-hidden="true" />
          </span>
          <div>
            <h2>Set up a learning session</h2>
            <p>Your goal is displayed locally and is not sent to a service.</p>
          </div>
        </div>
        <label className="field-label" htmlFor="learning-goal">
          {t.goal}
        </label>
        <input
          id="learning-goal"
          className="text-input"
          value={goal}
          onChange={(event) => {
            setGoal(event.target.value);
            setMessage("");
          }}
          placeholder={t.goalHint}
          maxLength={160}
          required
        />
        <div className="form-grid">
          <label className="field-label" htmlFor="learning-language">
            {t.language}
            <select
              id="learning-language"
              className="text-input"
              value={language}
              onChange={(event) => {
                const nextLanguage = event.target.value;
                if (nextLanguage === "en" || nextLanguage === "bn") {
                  setLanguage(nextLanguage);
                }
              }}
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
          </label>
          <label className="field-label" htmlFor="learning-level">
            {t.level}
            <select
              id="learning-level"
              className="text-input"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
          <label className="field-label" htmlFor="learning-time">
            {t.time}
            <select
              id="learning-time"
              className="text-input"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            >
              <option value="10">10 minutes</option>
              <option value="20">20 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
            </select>
          </label>
        </div>
        {message && (
          <p className="inline-error" role="status">
            {message}
          </p>
        )}
        <div className="editor-actions">
          <span className="privacy-hint">
            <Clock3 size={15} aria-hidden="true" />
            {minutes} minutes · {level}
          </span>
          <button type="submit" className="button button-primary">
            {t.start}
          </button>
        </div>
      </form>

      {planReady && (
        <section className="plan-section" aria-labelledby="plan-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t.sample}</p>
              <h2 id="plan-heading">{t.plan}</h2>
              <p className="page-description plan-goal">
                Goal: <strong>{goal.trim()}</strong>
              </p>
            </div>
            <span className="result-pill result-review">{language === "en" ? "Sample plan" : "নমুনা পরিকল্পনা"}</span>
          </div>

          <ol className="lesson-list">
            {[t.stepOne, t.stepTwo, t.stepThree].map((title, index) => {
              const details = [t.stepOneBody, t.stepTwoBody, t.stepThreeBody];
              return (
                <li className="lesson-card" key={title}>
                  <span className="lesson-number">0{index + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{details[index]}</p>
                  </div>
                  <span className="lesson-duration">
                    <Clock3 size={14} aria-hidden="true" />
                    {language === "en" ? "5 min" : "৫ মিনিট"}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="exercise-card">
            <div>
              <p className="eyebrow">{t.exercise}</p>
              <h3>{t.stepTwo}</h3>
              <p>{t.exerciseBody}</p>
            </div>
            <label className="complete-toggle">
              <input
                type="checkbox"
                checked={complete}
                onChange={(event) => updateProgress(event.target.checked)}
              />
              <span className="check-box" aria-hidden="true" />
              <span>{t.complete}</span>
            </label>
          </div>
          <div className="progress-footer">
            <p>{storageAvailable ? t.saved : t.unavailable}</p>
            <button
              type="button"
              className="text-button"
              onClick={() => updateProgress(false)}
              disabled={!complete}
            >
              <RotateCcw size={14} aria-hidden="true" />
              {t.reset}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
