// src/lib/calendar.js
import * as Calendar from "expo-calendar";
import { Platform } from "react-native";

// Devuelve un calendario existente y editable (ideal: el principal del usuario)
async function getWritableCalendarId() {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  // 1) intentá primary / predeterminado
  const preferred = calendars.find(c =>
    (c.allowsModifications || c.accessLevel === Calendar.CalendarAccessLevel.OWNER) &&
    (c.isPrimary || /primary|principal|predeterminado|default/i.test(c.title || ""))
  );
  if (preferred) return preferred.id;

  // 2) cualquier calendario editable
  const anyWritable = calendars.find(c => c.allowsModifications || c.accessLevel === Calendar.CalendarAccessLevel.OWNER);
  if (anyWritable) return anyWritable.id;

  // 3) como último recurso, creamos uno local
  const source = Platform.OS === "ios"
    ? (await Calendar.getDefaultCalendarAsync()).source
    : { isLocalAccount: true, name: "MindSync" };

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
  const calId = await getWritableCalendarId();
  return Calendar.createEventAsync(calId, {
    title,
    startDate,
    endDate,
    timeZone: undefined,
    notes,
  });
}

export async function fetchRecentEvents(limit = 10) {
  const now = new Date();
  const from = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7);
  const to = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  const ids = calendars
    .filter(c => c.isPrimary || c.allowsModifications || c.accessLevel === Calendar.CalendarAccessLevel.OWNER)
    .map(c => c.id);

  const events = ids.length ? await Calendar.getEventsAsync(ids, from, to) : [];
  return events.sort((a, b) => b.startDate - a.startDate).slice(0, limit);
}
