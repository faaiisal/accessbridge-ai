import type { NormalizedAsset } from "@/types/assets";

/** Provider-independent request shape. No secrets here. */
export interface AIExplainRequest {
  ruleId: string;
  title: string;
  codeExcerpt: string;
  assetRefs?: NormalizedAsset[];
}

export interface AIFixRequest extends AIExplainRequest {
  mode: "html" | "jsx";
}

export interface AIResult {
  kind: "explanation" | "fix";
  content: string;
  modelId: string;
  /** Deterministic findings remain authoritative; AI output is advisory only. */
  advisory: true;
}

export type AIIntegrationState = "pending" | "ready" | "error";

export interface AIProvider {
  readonly state: AIIntegrationState;
  readonly modelId: string;
  readonly baseUrl: string;
  generate(request: AIExplainRequest | AIFixRequest): Promise<AIResult>;
}
