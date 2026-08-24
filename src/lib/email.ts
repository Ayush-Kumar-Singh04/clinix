import { Resend } from "resend";
import { prisma } from "./prisma";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || "Clinix Healthcare <onboarding@resend.dev>";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface NotificationPayload {
  recipientName: string;
  doctorName?: string;
  specialization?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  actionReason?: string;
  summaryText?: string;
  medicineName?: string;
  dosage?: string;
  actionUrl?: string;
  password?: string;
}

/**
 * Directly sends an email immediately via Resend (Synchronous & Serverless Safe)
 */
export async function sendDirectEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  console.log(`[Email Dispatch] Sending '${subject}' immediately to ${to}...`);

  if (!resend || !resendApiKey) {
    console.warn(`[Email Sandbox] RESEND_API_KEY not configured. Email logged to console for ${to}: ${subject}`);
    return { success: true, id: "sandbox-local-id", simulated: true };
  }

  try {
    const response = await resend.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
      text: text || undefined,
    });

    if (response.error) {
      console.error(`[Resend Error] Failed to send email to ${to}:`, response.error);
      return { success: false, error: response.error.message };
    }

    console.log(`[Resend Success] Email delivered to ${to} (ID: ${response.data?.id})`);
    return { success: true, id: response.data?.id };
  } catch (error: any) {
    console.error(`[Resend Network Error] Failed sending to ${to}:`, error.message || error);
    return { success: false, error: error.message || "Network delivery error" };
  }
}

/**
 * Queues a notification and immediately processes it in serverless safe manner
 */
export async function queueNotification(
  type:
    | "BOOKING_CONFIRMATION"
    | "APPOINTMENT_REMINDER"
    | "CANCELLATION"
    | "RESCHEDULE"
    | "DOCTOR_LEAVE"
    | "POST_VISIT"
    | "MEDICATION_REMINDER"
    | "DOCTOR_ONBOARDING",
  recipientEmail: string,
  payload: NotificationPayload,
  scheduledAt: Date = new Date()
) {
  try {
    const job = await prisma.notificationJob.create({
      data: {
        type,
        recipientEmail,
        payload: payload as any,
        scheduledAt,
        status: "PENDING",
      },
    });

    // Execute synchronous processing immediately so serverless lambdas don't freeze execution
    await processSingleJob(job.id, type, recipientEmail, payload);

    return job;
  } catch (error) {
    console.error("[Notification Error] Failed to queue notification job:", error);
    return null;
  }
}

async function processSingleJob(
  jobId: string,
  type: string,
  recipientEmail: string,
  payload: NotificationPayload
) {
  const emailSubject = getEmailSubject(type, payload);
  const emailHtml = getEmailHtmlTemplate(type, payload);

  const res = await sendDirectEmail({
    to: recipientEmail,
    subject: emailSubject,
    html: emailHtml,
  });

  try {
    await prisma.notificationJob.update({
      where: { id: jobId },
      data: {
        status: res.success ? "SENT" : "FAILED",
        sentAt: res.success ? new Date() : null,
        lastError: res.error || null,
        attempts: 1,
      },
    });
  } catch (e) {
    console.error("[Job Update Error]", e);
  }
}

export async function processNotificationQueue(batchSize: number = 10) {
  const now = new Date();

  const jobs = await prisma.notificationJob.findMany({
    where: {
      status: "PENDING",
      scheduledAt: { lte: now },
      attempts: { lt: 3 },
    },
    take: batchSize,
    orderBy: { scheduledAt: "asc" },
  });

  const results = {
    processed: jobs.length,
    sent: 0,
    failed: 0,
  };

  for (const job of jobs) {
    const payload = job.payload as unknown as NotificationPayload;
    const emailSubject = getEmailSubject(job.type, payload);
    const emailHtml = getEmailHtmlTemplate(job.type, payload);

    const res = await sendDirectEmail({
      to: job.recipientEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    await prisma.notificationJob.update({
      where: { id: job.id },
      data: {
        status: res.success ? "SENT" : "FAILED",
        sentAt: res.success ? new Date() : null,
        lastError: res.error || null,
        attempts: job.attempts + 1,
      },
    });

    if (res.success) results.sent++;
    else results.failed++;
  }

  return results;
}

export function getDoctorOnboardingEmailHtml({
  name,
  email,
  password,
  specialization,
}: {
  name: string;
  email: string;
  password?: string;
  specialization: string;
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clinix-web.netlify.app";

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
      .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
      .header { background: linear-gradient(135deg, #0EA5E9, #14B8A6); padding: 32px 24px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
      .content { padding: 32px 28px; }
      .credentials-box { background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 12px; padding: 20px; margin: 24px 0; }
      .cred-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
      .cred-row:last-child { border-bottom: none; }
      .label { color: #64748b; font-weight: 600; }
      .value { color: #0f172a; font-weight: 700; font-family: monospace; }
      .btn { display: block; text-align: center; background: #0f172a; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; margin-top: 24px; }
      .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Clinix Healthcare</h1>
        <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Physician Account Onboarding</p>
      </div>
      <div class="content">
        <h2 style="margin-top: 0; font-size: 20px;">Welcome to Clinix, Dr. ${name}!</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Your physician practitioner profile in <strong>${specialization}</strong> has been successfully registered on the Clinix Healthcare Platform.
        </p>

        <div class="credentials-box">
          <div style="font-size: 12px; font-weight: 800; color: #0284c7; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">Your Login Credentials</div>
          <div class="cred-row">
            <span class="label">Portal URL:</span>
            <span class="value">${appUrl}/login</span>
          </div>
          <div class="cred-row">
            <span class="label">Login Email:</span>
            <span class="value">${email}</span>
          </div>
          ${password ? `
          <div class="cred-row">
            <span class="label">Temporary Password:</span>
            <span class="value" style="background: #fef3c7; color: #78350f; padding: 2px 6px; border-radius: 4px;">${password}</span>
          </div>
          ` : ""}
        </div>

        <p style="color: #475569; font-size: 13px; line-height: 1.5;">
          Please sign in to configure your consultation schedule, review patient pre-visit summaries, and manage clinical appointments.
        </p>

        <a href="${appUrl}/login" class="btn">Sign In to Doctor Portal</a>
      </div>
      <div class="footer">
        <p style="margin: 0;">This is an automated operational message from Clinix Healthcare Platform.</p>
        <p style="margin: 4px 0 0 0;">© 2026 Clinix. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

function getEmailSubject(type: string, payload: NotificationPayload): string {
  switch (type) {
    case "BOOKING_CONFIRMATION":
      return `Appointment Confirmed with ${payload.doctorName || "your Doctor"}`;
    case "APPOINTMENT_REMINDER":
      return `Upcoming Appointment Reminder - ${payload.appointmentDate}`;
    case "CANCELLATION":
      return `Appointment Cancelled - Clinix Healthcare`;
    case "RESCHEDULE":
      return `Appointment Rescheduled - ${payload.appointmentDate}`;
    case "DOCTOR_LEAVE":
      return `Important: Your Appointment Needs Rebooking`;
    case "POST_VISIT":
      return `Your Post-Visit Clinical Summary & Care Plan`;
    case "MEDICATION_REMINDER":
      return `Medication Reminder: ${payload.medicineName || "Scheduled Dose"}`;
    case "DOCTOR_ONBOARDING":
      return `Welcome to Clinix — Your Physician Account Access Credentials`;
    default:
      return `Clinix Healthcare Notification`;
  }
}

function getEmailHtmlTemplate(type: string, payload: NotificationPayload): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clinix-web.netlify.app";
  const actionLink = payload.actionUrl || `${appUrl}/patient/appointments`;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
      .header { background: linear-gradient(135deg, #0EA5E9, #14B8A6); padding: 28px 24px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
      .content { padding: 32px 24px; }
      .info-card { background: #f0fdfa; border-left: 4px solid #0d9488; padding: 16px; margin: 20px 0; border-radius: 8px; border: 1px solid #ccfbf1; }
      .info-card p { margin: 4px 0; color: #134e4a; font-size: 14px; }
      .btn { display: inline-block; background: #0f172a; color: white !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; margin-top: 16px; font-size: 14px; }
      .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Clinix Healthcare</h1>
      </div>
      <div class="content">
        <h2 style="font-size: 18px;">Hello ${payload.recipientName},</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">${getMessageBody(type, payload)}</p>

        ${payload.appointmentDate
      ? `
        <div class="info-card">
          ${payload.doctorName ? `<p><strong>Doctor:</strong> ${payload.doctorName}</p>` : ""}
          ${payload.specialization ? `<p><strong>Specialization:</strong> ${payload.specialization}</p>` : ""}
          ${payload.appointmentDate ? `<p><strong>Date:</strong> ${payload.appointmentDate}</p>` : ""}
          ${payload.appointmentTime ? `<p><strong>Time:</strong> ${payload.appointmentTime}</p>` : ""}
          ${payload.actionReason ? `<p><strong>Reason / Note:</strong> ${payload.actionReason}</p>` : ""}
        </div>
        `
      : ""
    }

        ${payload.summaryText ? `<div class="info-card"><p><strong>Summary:</strong></p><p>${payload.summaryText}</p></div>` : ""}

        <a href="${actionLink}" class="btn">View in Clinix Portal</a>
      </div>
      <div class="footer">
        <p style="margin: 0;">This is an automated notification from Clinix Healthcare Platform.</p>
        <p style="margin: 4px 0 0 0;">© 2026 Clinix. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

function getMessageBody(type: string, payload: NotificationPayload): string {
  switch (type) {
    case "BOOKING_CONFIRMATION":
      return `Your appointment has been successfully confirmed. Please review the details below.`;
    case "APPOINTMENT_REMINDER":
      return `This is a reminder for your upcoming medical appointment scheduled with Clinix.`;
    case "CANCELLATION":
      return `Your scheduled appointment has been cancelled. If you did not request this, please contact support or rebook online.`;
    case "RESCHEDULE":
      return `Your appointment timing has been updated successfully.`;
    case "DOCTOR_LEAVE":
      return `Due to an unexpected scheduling conflict, your clinician will be unavailable on your booked date. We have updated your status and released your slot for easy rebooking.`;
    case "POST_VISIT":
      return `Your doctor has completed your appointment and published your care summary & prescription details.`;
    case "MEDICATION_REMINDER":
      return `It's time for your scheduled medication: <strong>${payload.medicineName || "Medication"}</strong> (${payload.dosage || "As prescribed"}).`;
    default:
      return `You have an update regarding your Clinix healthcare services.`;
  }
}
