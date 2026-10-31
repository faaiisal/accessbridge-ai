export type ScanSeverity = "critical" | "serious" | "moderate" | "minor";

export interface ScanNode {
  target: string[];
  html: string;
}

export interface ScanViolation {
  ruleId: string;
  description: string;
  help: string;
  helpUrl: string;
  impact: ScanSeverity | null;
  wcagTags: string[];
  nodes: ScanNode[];
}

export interface UrlScanResult {
  url: string;
  violations: ScanViolation[];
  incompleteCount: number;
  passesCount: number;
  durationMs: number;
  scannedAt: string;
}
