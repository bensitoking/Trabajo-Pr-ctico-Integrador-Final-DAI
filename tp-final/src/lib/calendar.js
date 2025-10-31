import * as Calendar from "expo-calendar";
import { Platform } from "react-native";

export async function getDefaultCalendarSource() {
  if (Platform.OS === "ios") {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    return defaultCalendar.source;
  } else {
    return { isLocalAccount: true, name: "MindSync" };
  }
}

export async function ensureMindSyncCalendar() {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const existing = calendars.find(c => c.title === "MindSync Sessions");
  if (existing) return existing.id;

  const source = await getDefaultCalendarSource();
  return Calendar.createCalendarAsync({
    title: "MindSync Sessions",
    color: "#6366f1",
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: source.id,
    source,
    name: "MindSync",
    ownerAccount: "personal",
    accessLevel: Calendar.CalendarAccessLevel.OWNER
  });
}

export async function addFocusEvent({ title, startDate, endDate, notes }) {
  const calId = await ensureMindSyncCalendar();
  return Calendar.createEventAsync(calId, {
    title,
    startDate,
    endDate,
    timeZone: undefined,
    notes
  });
}

export async function fetchRecentEvents(limit = 10) {
  const now = new Date();
  const from = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7); // 7 días atrás
  const to = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);   // 7 días adelante
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const ms = calendars.find(c => c.title === "MindSync Sessions");
  if (!ms) return [];
  const events = await Calendar.getEventsAsync([ms.id], from, to);
  return events.sort((a, b) => b.startDate - a.startDate).slice(0, limit);
}
