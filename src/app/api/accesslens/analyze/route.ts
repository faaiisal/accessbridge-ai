
import { NextResponse } from "next/server";
import { getMetaClient, getMetaStatus, META_MODEL_ID } from "@/lib/meta/client";

function classifyError(error: unknown): { status: number; code: string; message: string } {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status: unknown }).status)
      : undefined;
  if (status === 400) return { status, code: "invalid_request", message: "Invalid request." };
  if (status === 401) return { status, code: "unauthorized", message: "Invalid or missing credentials." };
  if (status === 402) return { status, code: "billing", message: "Billing issue." };
  if (status === 403) return { status, code: "forbidden", message: "Permission denied." };
  if (status === 404) return { status, code: "not_found", message: "Endpoint or model not found." };
  if (status === 413) return { status, code: "payload_too_large", message: "Payload too large." };
  if (status === 429) return { status, code: "rate_limited", message: "Rate limited. Try again later." };
  if (status === 504) return { status: 504, code: "gateway_timeout", message: "Provider timeout." };
  if (status === 500 || status === 503)
    return { status, code: "provider_unavailable", message: "Provider temporarily unavailable." };
  return { status: 500, code: "provider_error", message: "Meta API request failed." };
}

export async function GET() {
  return NextResponse.json({ success: true, status: getMetaStatus() });
}

export async function POST() {
  const status = getMetaStatus();
  if (!status.configured) {
    return NextResponse.json(
      { success: false, code: "not_configured", error: "MODEL_API_KEY is not configured.", status },
      { status: 503 },
    );
  }

  const client = getMetaClient();
  if (!client) {
    return NextResponse.json(
      { success: false, code: "not_configured", error: "MODEL_API_KEY is not configured." },
      { status: 503 },
    );
  }

  try {
    const response = await client.responses.create({
      model: META_MODEL_ID,
      input: "Say hello in one sentence.",
    });

    return NextResponse.json({ success: true, result: response.output_text });
  } catch (error) {
    const classified = classifyError(error);
    return NextResponse.json(
      { success: false, code: classified.code, error: classified.message },
      { status: classified.status },
    );
  }
}
