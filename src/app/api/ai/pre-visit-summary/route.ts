import { NextRequest } from "next/server";
import { generatePreVisitSummary } from "@/lib/ai";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptoms } = body;

    if (!symptoms || typeof symptoms !== "string" || symptoms.trim().length === 0) {
      return createErrorResponse("INVALID_INPUT", "Symptoms description is required", 400);
    }

    const summary = await generatePreVisitSummary(symptoms);
    return createSuccessResponse(summary);
  } catch (error: any) {
    console.error("[Pre-visit AI API Error]", error);
    return createErrorResponse("AI_ERROR", error.message || "Failed to generate pre-visit summary", 500);
  }
}
