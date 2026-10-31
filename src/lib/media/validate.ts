import {
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
  SUPPORTED_IMAGE_MIME,
  SUPPORTED_PDF_MIME,
  imageAssetSchema,
  pdfAssetSchema,
} from "@/lib/schemas/assets";
import { createAssetId, type AssetKind, type NormalizedAsset } from "@/types/assets";

interface UploadCandidate {
  name: string;
  mimeType: string;
  sizeBytes: number;
}

function reject(kind: AssetKind, candidate: UploadCandidate, reason: string): NormalizedAsset {
  return {
    id: createAssetId(),
    kind,
    mimeType: candidate.mimeType,
    sizeBytes: candidate.sizeBytes,
    name: candidate.name.slice(0, 180) || "upload",
    validation: "rejected",
    reason,
  };
}

export function validateImageUpload(candidate: UploadCandidate): NormalizedAsset {
  if (!(SUPPORTED_IMAGE_MIME as readonly string[]).includes(candidate.mimeType)) {
    return reject("image", candidate, `Unsupported image type. Use PNG, JPEG, or WebP.`);
  }
  if (candidate.sizeBytes > MAX_IMAGE_BYTES) {
    return reject("image", candidate, `Image exceeds 5 MB limit.`);
  }
  const parsed = imageAssetSchema.safeParse(candidate);
  if (!parsed.success) {
    return reject("image", candidate, parsed.error.issues[0]?.message ?? "Invalid image upload.");
  }
  return {
    id: createAssetId(),
    kind: "image",
    mimeType: candidate.mimeType,
    sizeBytes: candidate.sizeBytes,
    name: candidate.name,
    validation: "valid",
  };
}

export function validatePdfUpload(candidate: UploadCandidate): NormalizedAsset {
  if (!(SUPPORTED_PDF_MIME as readonly string[]).includes(candidate.mimeType)) {
    return reject("pdf", candidate, `Unsupported document type. Use PDF.`);
  }
  if (candidate.sizeBytes > MAX_PDF_BYTES) {
    return reject("pdf", candidate, `PDF exceeds 10 MB limit.`);
  }
  const parsed = pdfAssetSchema.safeParse(candidate);
  if (!parsed.success) {
    return reject("pdf", candidate, parsed.error.issues[0]?.message ?? "Invalid PDF upload.");
  }
  return {
    id: createAssetId(),
    kind: "pdf",
    mimeType: candidate.mimeType,
    sizeBytes: candidate.sizeBytes,
    name: candidate.name,
    validation: "valid",
  };
}

/** Video remains architecture-only; always rejected with guidance until verified. */
export function validateVideoUpload(candidate: UploadCandidate): NormalizedAsset {
  return reject(
    "video",
    candidate,
    "Video analysis is not enabled until a documented provider media flow is verified.",
  );
}
