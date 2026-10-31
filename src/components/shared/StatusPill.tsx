import type { ReactNode } from "react";

type Tone = "failed" | "review" | "passed";

const icons: Record<Tone, ReactNode> = {
  failed: <span aria-hidden="true">●</span>,
  review: <span aria-hidden="true">●</span>,
  passed: <span aria-hidden="true">●</span>,
};

export function StatusPill({
  tone,
  children,
}: {
  tone: Tone;
  children: ReactNode;
}) {
  const className =
    tone === "failed"
      ? "result-pill result-failed"
      : tone === "review"
        ? "result-pill result-review"
        : "result-pill";
  return (
    <span className={className} role="status">
      {icons[tone]} {children}
    </span>
  );
}
