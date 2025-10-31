import * as Notifications from "expo-notifications";
import * as Calendar from "expo-calendar";
import { Platform } from "react-native";

export async function ensureNotificationPermissions() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    return req.status === "granted";
  }
  return true;
}

export async function ensureCalendarPermissions() {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== "granted") return false;
  const { status: writeStatus } = await Calendar.requestRemindersPermissionsAsync().catch(() => ({ status: "granted" }));
  return writeStatus === "granted" || Platform.OS === "ios" ? true : true;
}
