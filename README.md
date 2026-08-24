# Clinix Healthcare Platform

Intelligent clinical consultation management, automated symptom triage, concurrency-safe scheduling, and doctor leave conflict resolution.

---

## Live Hosted Application

- **Production Deployment URL**: [https://clinix-web.netlify.app](https://clinix-web.netlify.app)
- **Repository URL**: [https://github.com/Ayush-Kumar-Singh04/clinix](https://github.com/Ayush-Kumar-Singh04/clinix)
- **System Design Document**: [SYSTEM_DESIGN.md](file:///c:/Projects/Clinix/SYSTEM_DESIGN.md)

---

## Demo Access & Test Accounts

Clinix comes pre-seeded with ready-to-use accounts for all 3 platform roles:

| Role | Email | Password | Access Portal |
|---|---|---|---|
| **Patient** | `patient@clinix.health` | `password123` | `/patient` |
| **Doctor** | `dr.sharma@clinix.health` | `password123` | `/doctor` |
| **Admin** | `admin@clinix.health` | `password123` | `/admin` |

---

## Google Calendar Integration & Demo Testing

Because Google OAuth 2.0 applications in testing status require users to be explicitly registered under authorized test users:

1. **Demo Google Account for Reviewers & Evaluators**:
   - **Google Email**: `clinix.demo.tester@gmail.com`
   - **Password**: `ClinixDemoUser2026!`

2. **How to Test Calendar Sync**:
   - Sign in to the Patient Portal at `/patient` (or Doctor Portal at `/doctor`).
   - Click **Sync Calendar** in the dashboard banner.
   - Sign in with the demo Google account above (`clinix.demo.tester@gmail.com` / `ClinixDemoUser2026!`).
   - When Google displays the standard testing consent screen (*"Google hasn't verified this app"*), click **Advanced** -> **Go to Clinix (unsafe)** to grant calendar event access.
   - You will be redirected to the confirmation screen (`/patient/calendar?status=connected`).
   - Book any new consultation — it will immediately sync and create an event in that Google Calendar.

---

## Core System Architecture

### 1. Concurrency-Safe Double-Booking Prevention
Clinix guarantees zero duplicate bookings under concurrent race conditions. Availability validation is enforced at the database level using a compound unique index on `[doctorId, date, startTime]` executed inside Prisma serializable transactions (`$transaction`). If multiple patients confirm the same slot simultaneously, PostgreSQL constraint guards throw an unrecoverable rejection on the losing request while preserving data consistency.

### 2. Five-Minute Temporary Slot Hold Engine
When a patient selects an available appointment slot, Clinix issues a time-bounded hold token (`holdToken`) expiring in 5 minutes (`holdExpiresAt`). This locks the slot from competing users while the patient completes symptom intake. Expired tokens are automatically released back to the availability pool.

### 3. Server-Side AI Pre-Visit & Post-Visit Summaries
- **Pre-Visit Intake Triage**: Analyzes patient symptoms using LLM structured outputs validated against strict Zod schemas.
- **Post-Visit Patient Care Plan**: Converts doctor clinical notes and prescriptions into patient-friendly summaries without modifying clinician prescriptions.
- **Non-blocking Resiliency**: If AI services time out or fail, Clinix defaults gracefully, retains raw patient symptoms, and does not block booking or consultation workflows.

### 4. Doctor Leave Management & Real-Time Clash Auditing
- **Doctor Portal**: Physicians can apply for leave dates with specific categories (Annual Vacation, Medical Emergency, CME Conference, Personal Leave). A real-time conflict auditor detects existing patient bookings on the requested date and offers one-click automated cancellation with patient email notifications.
- **Admin Conflict Resolution**: System administrators receive real-time conflict alerts for all physician leave dates, view affected patient rosters, and can execute batch cancellations with automated rebooking guidance.

### 5. Resend Notification Queue with Exponential Retries
All system notifications (booking confirmations, cancellations, reschedules, doctor leave alerts, post-visit care plans, and medication reminders) are recorded in a PostgreSQL `NotificationJob` table (`PENDING`). Background worker processes retry failed dispatches up to 3 times. Email delivery issues never roll back appointment transactions.

### 6. Google Calendar OAuth 2.0 Two-Way Sync
Patients and physicians can link their Google Calendar. Confirmed appointments automatically generate structured Google Calendar events with start/end times and location details. Cancellations and reschedules dynamically delete or update the associated Google Calendar events.

---

## LLM Prompts & AI Architecture

Clinix uses server-side structured outputs with `response_format: { type: "json_object" }` validated by Zod.

### 1. Pre-Visit Triage Prompt (`src/lib/ai.ts`)

```text
Analyze the following patient reported symptoms and create a concise pre-visit workflow summary for a licensed healthcare professional.

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
  "urgency": "LOW" | "MEDIUM" | "HIGH",
  "chiefComplaint": "Concise summary of patient's primary complaint",
  "suggestedQuestions": [
    "Question 1",
    "Question 2",
    "Question 3"
  ]
}
```

### 2. Post-Visit Patient Care Plan Prompt (`src/lib/ai.ts`)

```text
Convert the following doctor's clinical visit notes and prescribed medications into a clear, patient-friendly summary.

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
}
```

---

## Database Schema

```mermaid
erDiagram
    User ||--o| Doctor : "has profile"
    User ||--o{ Appointment : "books as patient"
    User ||--o{ Prescription : "receives"
    User ||--o{ MedicationReminder : "sets"
    User ||--o| CalendarConnection : "links"
    
    Doctor ||--o{ DoctorWorkingHours : "defines"
    Doctor ||--o{ DoctorLeave : "requests"
    Doctor ||--o{ AppointmentSlot : "generates"
    Doctor ||--o{ Appointment : "conducts"
    Doctor ||--o{ Prescription : "issues"

    Appointment ||--o| AppointmentSlot : "occupies"
    Appointment ||--o| Prescription : "contains"
    Appointment ||--o{ CalendarEvent : "syncs"

    Prescription ||--o{ PrescriptionItem : "lists"
    PrescriptionItem ||--o{ MedicationReminder : "triggers"
```

### Core Data Models (`prisma/schema.prisma`)
- **User**: Core entity holding credentials, roles (`PATIENT`, `DOCTOR`, `ADMIN`), and contact info.
- **Doctor**: Physician profile, specialty, rating, and slot duration settings.
- **DoctorWorkingHours**: Weekly recurring consultation hours.
- **DoctorLeave**: Dates when physician is off-duty with conflict audit records.
- **AppointmentSlot**: Granular time slots with status (`AVAILABLE`, `HELD`, `CONFIRMED`, `CANCELLED`) and `holdToken` / `holdExpiresAt`.
- **Appointment**: Consultation record, symptoms, urgency (`LOW`, `MEDIUM`, `HIGH`), pre-visit summary JSON, and post-visit notes.
- **Prescription & PrescriptionItem**: Structured medications, dosages, frequency, and duration.
- **MedicationReminder**: Time-scheduled dose reminders for patients.
- **NotificationJob**: Asynchronous resilient email queue with retry counters (`attempts`, `maxAttempts`).
- **CalendarConnection & CalendarEvent**: OAuth access tokens and mapped Google Calendar event IDs.

---

## Technology Stack

- **Framework**: Next.js 14 (App Router, Server Actions, API Routes)
- **Language**: TypeScript 5.5
- **Database**: Supabase PostgreSQL with Prisma ORM 5.22
- **Connection Management**: Supavisor Connection Pooler (IPv4 Transaction & Session mode)
- **Styling**: Tailwind CSS & Lucide Icons
- **Authentication**: Custom JWT Session Cookies (HTTP-Only, Secure, SameSite)
- **AI Processing**: OpenAI API (GPT-4o-mini) & Groq API with Zod schema validation
- **Email Delivery**: Resend API with background queue worker
- **Calendar**: Google Calendar API v3 (OAuth 2.0)
- **Analytics & Charts**: Recharts
- **Hosting & Serverless**: Netlify / Vercel

---

## API Reference

### Authentication
- `POST /api/auth/register` — Register new patient account
- `POST /api/auth/login` — Authenticate user and issue JWT cookie
- `POST /api/auth/logout` — Clear session cookie
- `GET /api/auth/me` — Retrieve authenticated user profile

### Appointments & Scheduling
- `GET /api/appointments` — Fetch appointments for current user (Patient / Doctor)
- `POST /api/appointments/hold` — Request 5-minute temporary slot hold
- `GET /api/appointments/[id]` — Fetch single appointment details
- `PATCH /api/appointments/[id]` — Cancel or reschedule appointment

### AI Processing
- `POST /api/ai/pre-visit-summary` — Generate AI pre-visit intake triage & questions
- `POST /api/ai/post-visit-summary` — Generate patient-friendly care plan summary

### Doctor Leave & Availability
- `GET /api/doctor/leave` — List leaves and active clashes for doctor
- `POST /api/doctor/leave` — Audit date conflicts or submit leave application
- `DELETE /api/doctor/leave/[id]` — Withdraw scheduled doctor leave
- `GET /api/admin/leaves` — List all doctor leaves across the clinic

### Clinical & Consultations
- `POST /api/doctor/appointments/[id]/complete` — Publish diagnosis, prescription & AI summary

### Background Workers & Cron
- `GET /api/cron/process-notifications` — Background worker processing email queues
- `POST /api/notifications/send-direct` — Direct admin/doctor operational email dispatch

### Google Calendar
- `GET /api/calendar/connect` — Generate Google OAuth 2.0 authorization URL
- `GET /api/calendar/callback` — Exchange auth code for tokens and store connection

---

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Ayush-Kumar-Singh04/clinix.git
cd clinix
npm install
```

### 2. Configure Environment Variables (`.env.example`)
Create a `.env` file in the root directory:
```env
# Database Configuration (Supabase PostgreSQL Connection Pooler)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Authentication & Security
JWT_SECRET="clinix-super-secret-jwt-key-change-in-production-2026"
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# OpenAI / Groq API Key for AI Summaries
OPENAI_API_KEY="your-openai-api-key"
GROQ_API_KEY="your-groq-api-key"

# Resend Email Integration
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="Clinix Healthcare <onboarding@resend.dev>"

# Google Calendar OAuth 2.0
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/calendar/callback"

# System Cron Secret
CRON_SECRET="clinix-cron-secret-key-12345"

# App Public URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database & Seed Demo Data
```bash
npx prisma db push
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Google Cloud Console OAuth Setup Steps

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an OAuth 2.0 Client ID for **Web application**.
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000`
   - `https://clinix-web.netlify.app`
4. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/calendar/callback`
   - `https://clinix-web.netlify.app/api/calendar/callback`
5. Under **OAuth consent screen -> Test users**, add `clinix.demo.tester@gmail.com`.
6. Enable the **Google Calendar API** under Enabled APIs & Services.

---

## Automated Test Suite

Run the automated integration test suite:
```bash
npm test
```

The test suite validates:
1. AI Pre-visit response schema parsing and structured output validation.
2. AI summary non-blocking fallback handling when external APIs are unavailable.
3. Database concurrency double-booking guard (exact 1 success, 1 rejection).
4. Doctor leave conflict detection and bulk appointment cancellation.
5. Email notification queue failure isolation.

---

## Safety & Clinical Compliance Notice

Clinix is an administrative workflow and scheduling facilitation platform.
- AI-generated pre-visit summaries and post-visit intake notes do **not** constitute medical diagnoses or clinical advice.
- AI systems do not have prescribing authority and cannot alter clinician orders.
- Licensed medical practitioners remain the sole clinical authority for patient consultations and care decisions.

---

## License

This project is licensed under the MIT License.
