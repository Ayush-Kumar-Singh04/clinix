import OpenAI from "openai";
import { PreVisitAISchema, PostVisitAISchema } from "./validations";

const groqKey = process.env.GROQ_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const activeKey = (groqKey || openaiKey)?.trim();

const isGroq = activeKey ? activeKey.startsWith("gsk_") : false;

const openai = activeKey
  ? new OpenAI({
      apiKey: activeKey,
      baseURL: isGroq ? "https://api.groq.com/openai/v1" : undefined,
    })
  : null;

const aiModel = isGroq ? "qwen/qwen3.6-27b" : "gpt-4o-mini";

export interface PreVisitAIResult {
  urgency: "LOW" | "MEDIUM" | "HIGH";
  chiefComplaint: string;
  suggestedQuestions: [string, string, string];
  disclaimer: string;
  isAiFallback?: boolean;
}

export interface PostVisitAIResult {
  summary: string;
  medicationSchedule: string;
  followUpSteps: string[];
  importantInstructions: string;
  disclaimer: string;
  isAiFallback?: boolean;
}

export async function generatePreVisitSummary(symptoms: string): Promise<PreVisitAIResult> {
  const disclaimer = "AI-generated workflow summary. Not a medical diagnosis.";

  if (!openai || !activeKey) {
    console.warn("[AI] OpenAI/Groq API Key missing. Using structured clinical fallback.");
    return getPreVisitFallback(symptoms, disclaimer);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const prompt = `Analyze the following patient reported symptoms and create a concise pre-visit workflow summary for a licensed healthcare professional.

CRITICAL CONSTRAINTS:
- Do NOT diagnose the patient.
- Do NOT recommend medication.
- Do NOT provide definitive medical conclusions.
- Do NOT invent symptoms not reported.
- Urgency must strictly be LOW, MEDIUM, or HIGH.
- Provide exactly 3 suggested clinical questions for the doctor to ask.

Patient Reported Symptoms:
"${symptoms}"

Respond ONLY with valid JSON matching this exact structure:
{
  "urgency": "LOW",
  "chiefComplaint": "Concise summary of patient's primary complaint",
  "suggestedQuestions": [
    "Question 1",
    "Question 2",
    "Question 3"
  ]
}`;

    const completion = await openai.chat.completions.create(
      {
        model: aiModel,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response content");

    const parsed = JSON.parse(content);
    const validated = PreVisitAISchema.parse(parsed);

    return {
      urgency: validated.urgency,
      chiefComplaint: validated.chiefComplaint,
      suggestedQuestions: validated.suggestedQuestions as [string, string, string],
      disclaimer,
      isAiFallback: false,
    };
  } catch (error: any) {
    console.error("[AI Error] Pre-visit summary failed or timed out:", error.message || error);
    return getPreVisitFallback(symptoms, disclaimer);
  }
}

function getPreVisitFallback(symptoms: string, disclaimer: string): PreVisitAIResult {
  const lower = symptoms.toLowerCase();
  let urgency: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";
  if (lower.includes("chest pain") || lower.includes("breath") || lower.includes("severe") || lower.includes("bleeding")) {
    urgency = "HIGH";
  } else if (lower.includes("mild") || lower.includes("routine") || lower.includes("checkup")) {
    urgency = "LOW";
  }

  return {
    urgency,
    chiefComplaint: symptoms.length > 80 ? symptoms.slice(0, 80) + "..." : symptoms,
    suggestedQuestions: [
      "Could you elaborate on when these symptoms first started?",
      "Are you experiencing any other associated symptoms?",
      "Have you taken any over-the-counter medications for this?",
    ],
    disclaimer: `${disclaimer} (AI service fallback handler.)`,
    isAiFallback: true,
  };
}

export async function generatePostVisitSummary(
  clinicalNotes: string,
  prescriptions: Array<{ medicineName: string; dosage: string; frequency: string; duration: string; instructions?: string }>,
  doctorNotesPatient?: string
): Promise<PostVisitAIResult> {
  const disclaimer = "AI-generated patient-friendly summary. Follow your clinician's instructions.";

  const formatPrescriptions = prescriptions
    .map((p) => `- ${p.medicineName} (${p.dosage}): Take ${p.frequency} for ${p.duration}. Notes: ${p.instructions || "None"}`)
    .join("\n");

  if (!openai || !activeKey) {
    console.warn("[AI] OpenAI/Groq API Key missing. Using structured post-visit fallback.");
    return getPostVisitFallback(clinicalNotes, prescriptions, doctorNotesPatient, disclaimer);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const prompt = `Convert the following doctor's clinical visit notes and prescribed medications into a clear, patient-friendly summary.

CRITICAL INSTRUCTIONS:
- Do NOT alter or change the doctor's prescribed medications or dosages. The doctor's prescription is the absolute source of truth.
- Explain the visit in reassuring, easily understandable language.
- Format the medication schedule clearly.
- Include action steps and safety instructions.

Doctor's Clinical Notes:
"${clinicalNotes}"

Doctor's Notes for Patient:
"${doctorNotesPatient || "N/A"}"

Prescriptions:
${formatPrescriptions || "No medications prescribed."}

Respond ONLY with valid JSON matching this exact structure:
{
  "summary": "Clear, friendly summary of the appointment outcome and clinician findings",
  "medicationSchedule": "Structured schedule of how and when to take medications",
  "followUpSteps": ["Step 1", "Step 2"],
  "importantInstructions": "Important safety warning or symptoms to watch out for"
}`;

    const completion = await openai.chat.completions.create(
      {
        model: aiModel,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response content");

    const parsed = JSON.parse(content);
    const validated = PostVisitAISchema.parse(parsed);

    return {
      summary: validated.summary,
      medicationSchedule: validated.medicationSchedule,
      followUpSteps: validated.followUpSteps,
      importantInstructions: validated.importantInstructions,
      disclaimer,
      isAiFallback: false,
    };
  } catch (error: any) {
    console.error("[AI Error] Post-visit summary failed or timed out:", error.message || error);
    return getPostVisitFallback(clinicalNotes, prescriptions, doctorNotesPatient, disclaimer);
  }
}

function getPostVisitFallback(
  clinicalNotes: string,
  prescriptions: Array<{ medicineName: string; dosage: string; frequency: string; duration: string; instructions?: string }>,
  doctorNotesPatient: string | undefined,
  disclaimer: string
): PostVisitAIResult {
  const medSchedule = prescriptions.length
    ? prescriptions.map((p) => `${p.medicineName} (${p.dosage}): ${p.frequency} for ${p.duration}`).join("; ")
    : "No new medications prescribed.";

  return {
    summary: doctorNotesPatient || clinicalNotes || "Your doctor completed your appointment evaluation.",
    medicationSchedule: medSchedule,
    followUpSteps: [
      "Take prescribed medications exactly as instructed by your doctor.",
      "Monitor your symptoms and schedule a follow-up if symptoms persist.",
    ],
    importantInstructions: "Contact emergency care immediately if you experience severe symptoms.",
    disclaimer: `${disclaimer} (System generated fallback.)`,
    isAiFallback: true,
  };
}
