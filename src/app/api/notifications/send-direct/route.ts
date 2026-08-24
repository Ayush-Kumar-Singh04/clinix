import { NextRequest } from "next/server";
import { authorizeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendDirectEmail } from "@/lib/email";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(req, ["PATIENT", "DOCTOR", "ADMIN"]);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  try {
    const body = await req.json();
    const { appointmentId, recipientType, recipientEmail, subject, message } = body;

    if (!recipientEmail || !message?.trim()) {
      return createErrorResponse("VALIDATION_ERROR", "Recipient email and message content are required.", 400);
    }

    let appointmentInfo: any = null;
    if (appointmentId) {
      appointmentInfo = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          doctor: { include: { user: true } },
        },
      });
    }

    // Identify sender
    const sender = await prisma.user.findUnique({
      where: { id: auth.user.userId },
    });

    const senderRole = auth.user.role;
    const senderName = sender?.name || "Clinix Staff";

    const emailSubject = subject || `Clinix Operational Message from ${senderRole}: ${senderName}`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b; margin: 0;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #0EA5E9, #14B8A6); padding: 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Clinix Healthcare</h1>
            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">Direct Operational Communication</p>
          </div>
          <div style="padding: 28px 24px;">
            <p style="font-size: 14px; margin-top: 0;"><strong>Sender:</strong> ${senderName} <span style="font-size: 11px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-left: 4px;">${senderRole}</span></p>
            ${appointmentInfo ? `<p style="font-size: 12px; color: #64748b;">Regarding consultation on <strong>${appointmentInfo.date}</strong> at <strong>${appointmentInfo.startTime}</strong></p>` : ""}
            <div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 16px; margin: 20px 0; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #134e4a;">
              ${message.replace(/\n/g, "<br>")}
            </div>
            <a href="https://clinix-web.netlify.app/login" style="display: inline-block; background: #0f172a; color: white !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 13px; margin-top: 8px;">Access Clinix Portal</a>
          </div>
          <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
            <p style="margin: 0;">© 2026 Clinix Healthcare Platform.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Synchronous immediate dispatch
    const sendResult = await sendDirectEmail({
      to: recipientEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    // Record job in database
    await prisma.notificationJob.create({
      data: {
        type: "BOOKING_CONFIRMATION",
        recipientEmail,
        payload: {
          recipientName: body.recipientName || "Valued Member",
          actionReason: message,
          summaryText: emailSubject,
        } as any,
        status: sendResult.success ? "SENT" : "FAILED",
        sentAt: sendResult.success ? new Date() : null,
        lastError: sendResult.error || null,
        attempts: 1,
      },
    });

    return createSuccessResponse({
      recipientEmail,
      delivered: sendResult.success,
      error: sendResult.error || null,
      message: sendResult.success
        ? `Email successfully delivered to ${recipientEmail}`
        : `Email delivery queued (${sendResult.error})`,
    });
  } catch (error: any) {
    console.error("[Send Direct Email Error]", error);
    return createErrorResponse("SEND_EMAIL_ERROR", error.message || "Failed to send email", 500);
  }
}
