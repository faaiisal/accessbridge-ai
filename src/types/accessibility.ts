import type { Finding, Severity } from "@/lib/accessibility/analyze";

export type VerificationStatus = "passed" | "failed" | "needs-review";

export interface EvidenceFinding extends Finding {
  findingId: string;
  evidence: string;
  verificationStatus: VerificationStatus | null;
}

export interface VerificationOutcome {
  status: VerificationStatus;
  remaining: EvidenceFinding[];
  checkedAt: string;
}

export function toEvidenceFinding(finding: Finding, index: number): EvidenceFinding {
  return {
    ...finding,
    findingId: `${finding.ruleId}-${finding.start}-${index}`,
    evidence: `<${finding.element.replace(/[<>]/g, "")}> at offset ${finding.start}`,
    verificationStatus: null,
  };
}

export type { Finding, Severity };
