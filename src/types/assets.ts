export type AssetKind = "code" | "image" | "pdf" | "video";

export type AssetValidationStatus = "pending" | "valid" | "rejected";

export interface NormalizedAsset {
  id: string;
  kind: AssetKind;
  mimeType: string;
  sizeBytes: number;
  name: string;
  validation: AssetValidationStatus;
  reason?: string;
  /** Reference to in-memory / temp content. Never persisted without explicit consent. */
  storageRef?: string;
}

export function createAssetId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `asset-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}
