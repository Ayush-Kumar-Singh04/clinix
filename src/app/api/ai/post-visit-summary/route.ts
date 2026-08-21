import { NextRequest } from "next/server";
import { generatePostVisitSummary } from "@/lib/ai";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clinicalNotes, prescriptions = [], doctorNotesPatient } = body;

    if (!clinicalNotes) {
      return createErrorResponse("INVALID_INPUT", "Clinical notes are required", 400);
    }

    const summary = await generatePostVisitSummary(clinicalNotes, prescriptions, doctorNotesPatient);
    return createSuccessResponse(summary);
  } catch (error: any) {
    console.error("[Post-visit AI API Error]", error);
    return createErrorResponse("AI_ERROR", error.message || "Failed to generate post-visit summary", 500);
  }
}
