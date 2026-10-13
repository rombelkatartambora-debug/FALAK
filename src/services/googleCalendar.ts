import { GoogleCalendarEvent } from '../types/calendar';

export interface CreateEventInput {
  summary: string;
  description?: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime?: string; // HH:mm
  isAllDay: boolean;
}

/**
 * Fetch events from the user's primary Google Calendar
 */
export async function fetchCalendarEvents(
  accessToken: string,
  timeMin: Date,
  timeMax: Date
): Promise<GoogleCalendarEvent[]> {
  try {
    const minIso = timeMin.toISOString();
    const maxIso = timeMax.toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
      minIso
    )}&timeMax=${encodeURIComponent(
      maxIso
    )}&singleEvents=true&orderBy=startTime&maxResults=250`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Sesi Google Calendar telah berakhir, silakan masuk kembali.');
      }
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error?.message || `Gagal memuat agenda (${res.status})`);
    }

    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: item.id,
      summary: item.summary || '(Tanpa Judul)',
      description: item.description || '',
      location: item.location || '',
      start: item.start || {},
      end: item.end || {},
      htmlLink: item.htmlLink || ''
    }));
  } catch (err: any) {
    console.error('Error fetching calendar events:', err);
    throw err;
  }
}

/**
 * Create a new event on Google Calendar
 */
export async function createCalendarEvent(
  accessToken: string,
  input: CreateEventInput
): Promise<GoogleCalendarEvent> {
  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

  let eventBody: any = {
    summary: input.summary,
    description: input.description || '',
    location: input.location || ''
  };

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';

  if (input.isAllDay) {
    // All day events use 'date' (YYYY-MM-DD)
    // End date is exclusive in Google Calendar, so add 1 day if end is same as start
    let endD = new Date(input.endDate);
    endD.setDate(endD.getDate() + 1);
    const endFormatted = endD.toISOString().split('T')[0];

    eventBody.start = { date: input.startDate };
    eventBody.end = { date: endFormatted };
  } else {
    const sTime = input.startTime || '09:00';
    const eTime = input.endTime || '10:00';

    const startDateTime = `${input.startDate}T${sTime}:00`;
    const endDateTime = `${input.endDate}T${eTime}:00`;

    eventBody.start = {
      dateTime: new Date(startDateTime).toISOString(),
      timeZone: userTimeZone
    };
    eventBody.end = {
      dateTime: new Date(endDateTime).toISOString(),
      timeZone: userTimeZone
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventBody)
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error?.message || `Gagal menyimpan agenda (${res.status})`);
  }

  return await res.json();
}

/**
 * Delete an event from Google Calendar
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok && res.status !== 204 && res.status !== 410) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error?.message || `Gagal menghapus agenda (${res.status})`);
  }
}
