import { google } from "googleapis";
import { prisma } from "./prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/calendar/callback";

export function getGoogleOAuthClient() {
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

export function getGoogleAuthUrl(userId: string): string {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return "#google-auth-disabled-missing-keys";
  }

  const oauth2Client = getGoogleOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state: userId,
  });
}

export async function createGoogleCalendarEvent(
  userId: string,
  appointmentId: string,
  eventDetails: {
    summary: string;
    description: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  }
): Promise<string | null> {
  try {
    const conn = await prisma.calendarConnection.findUnique({
      where: { userId },
    });

    if (!conn) {
      console.log(`[Calendar] User ${userId} has no connected Google Calendar.`);
      return null;
    }

    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
      access_token: conn.accessToken,
      refresh_token: conn.refreshToken || undefined,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const startDateTime = `${eventDetails.date}T${eventDetails.startTime}:00`;
    const endDateTime = `${eventDetails.date}T${eventDetails.endTime}:00`;

    const res = await calendar.events.insert({
      calendarId: conn.googleCalendarId || "primary",
      requestBody: {
        summary: eventDetails.summary,
        description: eventDetails.description,
        start: { dateTime: new Date(startDateTime).toISOString() },
        end: { dateTime: new Date(endDateTime).toISOString() },
      },
    });

    const googleEventId = res.data.id;
    if (googleEventId) {
      await prisma.calendarEvent.create({
        data: {
          appointmentId,
          userId,
          googleEventId,
        },
      });
      return googleEventId;
    }
    return null;
  } catch (error: any) {
    console.error("[Google Calendar Error] Failed to create event:", error.message || error);
    // Non-blocking catch to ensure appointment transactions complete cleanly
    return null;
  }
}

export async function deleteGoogleCalendarEventsForAppointment(appointmentId: string) {
  try {
    const events = await prisma.calendarEvent.findMany({
      where: { appointmentId },
    });

    for (const evt of events) {
      const conn = await prisma.calendarConnection.findUnique({
        where: { userId: evt.userId },
      });

      if (conn) {
        const oauth2Client = getGoogleOAuthClient();
        oauth2Client.setCredentials({
          access_token: conn.accessToken,
          refresh_token: conn.refreshToken || undefined,
        });
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        await calendar.events.delete({
          calendarId: conn.googleCalendarId || "primary",
          eventId: evt.googleEventId,
        });
      }
    }

    await prisma.calendarEvent.deleteMany({
      where: { appointmentId },
    });
  } catch (error: any) {
    console.error("[Google Calendar Error] Failed to delete events:", error.message || error);
  }
}
