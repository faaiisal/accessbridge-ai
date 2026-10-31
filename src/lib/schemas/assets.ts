import { z } from "zod";

export const SUPPORTED_IMAGE_MIME = ["image/png", "image/jpeg", "image/webp"] as const;
export const SUPPORTED_PDF_MIME = ["application/pdf"] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_BYTES = 10 * 1024 * 1024;
/** Video is architecture-only until a documented provider flow is verified. */
export const MAX_VIDEO_BYTES = 25 * 1024 * 1024;

export const imageAssetSchema = z.object({
  mimeType: z.enum(SUPPORTED_IMAGE_MIME),
  sizeBytes: z.number().int().positive().max(MAX_IMAGE_BYTES),
  name: z.string().min(1).max(180),
});

export const pdfAssetSchema = z.object({
  mimeType: z.enum(SUPPORTED_PDF_MIME),
  sizeBytes: z.number().int().positive().max(MAX_PDF_BYTES),
  name: z.string().min(1).max(180),
});

export type ImageAssetInput = z.infer<typeof imageAssetSchema>;
export type PdfAssetInput = z.infer<typeof pdfAssetSchema>;
