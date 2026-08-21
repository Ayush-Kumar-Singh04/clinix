# Clinix AI — AI-Powered Healthcare Appointment & Follow-up Manager

> **Healthcare appointments, intelligently managed.**  
> *Book faster. Prepare better. Follow up smarter.*

Clinix is a complete production-grade healthcare appointment and clinical workflow management platform. Built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **Supabase PostgreSQL**, **OpenAI API**, **Resend**, **Google Calendar OAuth 2.0**, and **Recharts**, Clinix solves core challenges in clinical scheduling, double-booking prevention, AI-assisted symptom triage, doctor leave conflict resolution, and patient care compliance.

---

## 🚀 Key Features & Architectural Innovations

### 1. Concurrency-Safe Double-Booking Prevention
Clinix guarantees **zero duplicate bookings** under concurrent race conditions. Availability validation is enforced at the database layer using a unique index on `[doctorId, date, startTime]` executed inside Prisma isolation transactions (`$transaction`). If two patients attempt to confirm the same slot simultaneously, PostgreSQL constraint guards throw error code `SLOT_ALREADY_BOOKED` on the losing request.

### 2. 5-Minute Temporary Slot Hold Engine
When a patient selects a time slot, Clinix generates a secure temporary hold token (`holdToken`) expiring in 5 minutes (`holdExpiresAt`). This prevents competing patients from selecting the same slot while completing symptom intake, with automated server-side cleanup for expired holds.

### 3. Server-Side AI Pre-Visit & Post-Visit Summaries
- **Pre-Visit Triage**: Analyzes patient symptoms using OpenAI GPT-4o-mini to return structured JSON output validated with Zod:
  - `urgency`: `LOW` | `MEDIUM` | `HIGH`
  - `chiefComplaint`: Summary string
  - `suggestedQuestions`: Exactly 3 clinical questions for the physician.
- **Post-Visit Patient Care Plan**: Converts doctor clinical notes & prescriptions into patient-friendly summaries without modifying clinician prescriptions.
- **Safety Disclaimer**: Prominently labels output as *"AI-generated workflow summary. Not a medical diagnosis."*
- **Non-blocking Resiliency**: If OpenAI API is unavailable or times out, Clinix logs the error server-side, preserves original patient symptoms, and defaults gracefully.

### 4. Admin Doctor Leave Management & Conflict Resolution
When an admin marks a doctor as unavailable for a date:
1. **Audit Preview**: Identifies affected appointments and displays patient details and times.
2. **Confirmation & Resolution**: Updates appointments to `CANCELLED`, releases slots, deletes Google Calendar events, and enqueues `DOCTOR_LEAVE` cancellation email notification jobs to patients.

### 5. Resend Notification Queue with Exponential Retries
Email notifications (`BOOKING_CONFIRMATION`, `CANCELLATION`, `RESCHEDULE`, `DOCTOR_LEAVE`, `POST_VISIT`, `MEDICATION_REMINDER`) are logged to a `NotificationJob` queue table (`PENDING`). Background worker processes retry up to 3 attempts with exponential backoff. Email service failures **never** roll back appointment booking transactions.

---

## 💻 Tech Stack

- **Framework**: Next.js 14 (App Router, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **Database**: Supabase PostgreSQL with Prisma ORM
- **Authentication**: Custom JWT Session Cookies (HTTP-Only)
- **AI Triage**: OpenAI API (GPT-4o-mini) + Zod Validation
- **Email System**: Resend Email API + Retry Queue
- **Calendar Integration**: Google Calendar API (OAuth 2.0)
- **Analytics**: Recharts
- **Containerization**: Docker & Docker Compose

---

## 🔑 Demo Credentials

Immediately test all 3 roles after running `npm run db:seed`:

| Role | Email | Password | Access Portal |
|---|---|---|---|
| **Patient** | `patient@clinix.health` | `password123` | `/patient` |
| **Doctor** | `dr.sharma@clinix.health` | `password123` | `/doctor` |
| **Admin** | `admin@clinix.health` | `password123` | `/admin` |

---

## 🛠️ Quick Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/clinix.git
cd clinix
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

### 3. Database Migration & Seed
```bash
npx prisma db push
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Run the automated integration test suite:
```bash
npm test
```
Tests verify:
- Simultaneous double-booking concurrency rejection (`SLOT_ALREADY_BOOKED`)
- Role RBAC protection
- AI pre-visit response schema validation & error fallback
- Doctor leave conflict resolution

---

## 🐳 Docker Deployment

To spin up a local PostgreSQL database and Clinix application in Docker:
```bash
docker compose up -d
```
Then migrate and seed:
```bash
npx prisma db push
npm run db:seed
```

---

## 🏥 Health Endpoint
- **URL**: `GET /api/health`
- **Response**:
```json
{
  "status": "ok",
  "service": "Clinix Healthcare API",
  "timestamp": "2026-08-21T02:00:00.000Z"
}
```

---

## 🔒 Healthcare Safety & Disclaimers

Clinix is a workflow management and clinical administrative platform.
- AI outputs do **not** represent medical diagnosis or prescription advice.
- AI cannot prescribe medications or alter clinician orders.
- The licensed clinician remains the sole authority for clinical judgment.
