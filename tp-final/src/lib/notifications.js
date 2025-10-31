import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Mostrar notificaciones en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// True si corre dentro de Expo Go
const isExpoGo = Constants.appOwnership === "expo";

// Para Android: crear canal
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

// Programar **notificación local** (funciona en Expo Go)
export async function scheduleLocal(title, body, secondsFromNow = 1) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: "default" },
    trigger: { seconds: secondsFromNow, channelId: "focus" },
  });
}

/**
 * Si alguna vez querés implementar **push remotas**:
 * - NO llames getExpoPushTokenAsync en Expo Go (isExpoGo === true).
 * - Hacé un development build: `npx expo run:android` o `eas build --profile development`
 */
export async function maybeGetPushToken() {
  if (isExpoGo) {
    console.log("Saltando obtención de push token en Expo Go (SDK 53+).");
    return null;
  }
  // Ejemplo (comentado):
  // const { data: token } = await Notifications.getExpoPushTokenAsync();
  // return token;
  return null;
}
