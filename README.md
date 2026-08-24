# Clinix Healthcare Platform

Intelligent clinical consultation management, automated symptom triage, concurrency-safe scheduling, and doctor leave conflict resolution.

---

## Overview

Clinix is a full-stack, production-grade healthcare appointment and clinical workflow management system. Built with Next.js 14 App Router, TypeScript, Prisma ORM, Supabase PostgreSQL, OpenAI/Groq API, Resend, and Google Calendar OAuth 2.0, Clinix addresses operational friction in outpatient clinics: race-condition double bookings, patient intake triage, physician schedule conflicts, and treatment adherence.

---

## Core System Architecture

### 1. Concurrency-Safe Double-Booking Prevention
Clinix guarantees zero duplicate bookings under concurrent race conditions. Availability validation is enforced at the database level using a compound unique index on `[doctorId, date, startTime]` executed inside Prisma serializable transactions (`$transaction`). If multiple patients confirm the same slot simultaneously, PostgreSQL constraint guards throw an unrecoverable rejection on the losing request while preserving data consistency.

### 2. Five-Minute Temporary Slot Hold Engine
When a patient selects an available appointment slot, Clinix issues a time-bounded hold token (`holdToken`) expiring in 5 minutes (`holdExpiresAt`). This locks the slot from competing users while the patient completes symptom intake. Expired tokens are automatically released back to the availability pool.

### 3. Server-Side AI Pre-Visit & Post-Visit Summaries
- **Pre-Visit Intake Triage**: Analyzes patient symptoms using LLM structured outputs validated against strict Zod schemas:
  - `urgency`: `LOW` | `MEDIUM` | `HIGH`
  - `chiefComplaint`: Summary string
  - `suggestedQuestions`: Exactly 3 targeted clinical intake questions for the physician.
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

## Demo Access & Test Accounts

Clinix comes pre-seeded with ready-to-use accounts for all 3 platform roles:

| Role | Email | Password | Access Portal |
|---|---|---|---|
| **Patient** | `patient@clinix.health` | `password123` | `/patient` |
| **Doctor** | `dr.sharma@clinix.health` | `password123` | `/doctor` |
| **Admin** | `admin@clinix.health` | `password123` | `/admin` |

---

## Google Calendar Integration & Demo Testing

Because Google OAuth 2.0 apps in development status require users to be explicitly registered under authorized test users:

1. **Pre-Authorized Test Accounts in Google Cloud Console**:
   - `anshsingh1762@gmail.com`
   - `ayushkumari1762@gmail.com`

2. **How to Test Calendar Sync**:
   - Sign in to the Patient Portal at `/patient`.
   - Click **Sync Calendar** in the dashboard banner.
   - Select one of the authorized test Google accounts above.
   - When Google displays the standard development screen (*"Google hasn't verified this app"*), click **Advanced** -> **Go to Clinix (unsafe)** to grant calendar event access.
   - You will be redirected to the confirmation screen (`/patient/calendar?status=connected`), and future appointments will automatically sync to that Google Calendar.

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

### 2. Configure Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
```env
# Database (Supabase Pooler)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Authentication
JWT_SECRET="your-jwt-secret-key"
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# AI
OPENAI_API_KEY="your-openai-api-key"
GROQ_API_KEY="your-groq-api-key"

# Email
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="Clinix Healthcare <onboarding@resend.dev>"

# Google Calendar
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/calendar/callback"

# Cron & Application
CRON_SECRET="your-cron-secret"
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

## Deployment Instructions

### Netlify Deployment
1. Connect repository to Netlify.
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add all environment variables in **Site configuration -> Environment variables**.
5. Set `NEXT_PUBLIC_APP_URL` and `GOOGLE_REDIRECT_URI` to your Netlify production domain.

---

## Safety & Clinical Compliance Notice

Clinix is an administrative workflow and scheduling facilitation platform.
- AI-generated pre-visit summaries and post-visit intake notes do **not** constitute medical diagnoses or clinical advice.
- AI systems do not have prescribing authority and cannot alter clinician orders.
- Licensed medical practitioners remain the sole clinical authority for patient consultations and care decisions.

---

## License

This project is licensed under the MIT License.
