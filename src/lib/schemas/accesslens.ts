import { z } from "zod";
import { MAX_CODE_LENGTH } from "@/lib/accessibility/analyze";

export const codeModeSchema = z.enum(["html", "jsx"]);

export const accessLensInputSchema = z.object({
  source: z
    .string()
    .min(1, "Enter a code snippet before running the checks.")
    .refine((value) => value.trim().length > 0, {
      message: "Enter a code snippet before running the checks.",
    })
    .max(MAX_CODE_LENGTH, `Keep the snippet under ${MAX_CODE_LENGTH.toLocaleString()} characters.`),
  mode: codeModeSchema,
});

export type AccessLensInput = z.infer<typeof accessLensInputSchema>;
export type CodeModeInput = z.infer<typeof codeModeSchema>;
