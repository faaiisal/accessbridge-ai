
import OpenAI from "openai";

export const META_BASE_URL = "https://api.meta.ai/v1";
export const META_MODEL_ID = "muse-spark-1.3";

let cachedClient: OpenAI | null = null;

export function getMetaStatus() {
  const configured = Boolean(process.env.MODEL_API_KEY);
  const raw = process.env.MODEL_API_KEY ?? "";
  return {
    configured,
    keyFormatAppearsValid: raw.length >= 8,
    baseUrl: META_BASE_URL,
    modelId: META_MODEL_ID,
    sdk: "openai-compatible",
  };
}

export function getMetaClient(): OpenAI | null {
  if (!process.env.MODEL_API_KEY) return null;
  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: process.env.MODEL_API_KEY,
      baseURL: META_BASE_URL,
    });
  }
  return cachedClient;
}
