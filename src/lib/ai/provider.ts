import type { AIIntegrationState } from "./types";

/**
 * Integration contract only. No live Meta calls in this build.
 * Future server-side client must use MODEL_API_KEY server-only,
 * base URL https://api.meta.ai/v1, model muse-spark-1.3, Responses API.
 */
export type { AIIntegrationState };
export type { AIExplainRequest, AIFixRequest, AIProvider, AIResult } from "./types";

export const AI_INTEGRATION_STATE: AIIntegrationState = "pending";
export const META_MODEL_ID = "muse-spark-1.3";
export const META_BASE_URL = "https://api.meta.ai/v1";
