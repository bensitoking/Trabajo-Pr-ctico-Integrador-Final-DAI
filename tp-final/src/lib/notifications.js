import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// handler global: cómo mostrar notificaciones en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("focus", {
      name: "Focus",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 120, 200],
      lightColor: "#6366f1",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      showBadge: true,
      sound: "default",
    });
  }
}

export async function scheduleLocal(title, body, secondsFromNow = 1) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: "default" },
    trigger: { seconds: secondsFromNow, channelId: "focus" },
  });
}
