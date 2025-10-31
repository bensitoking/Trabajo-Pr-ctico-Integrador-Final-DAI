import React, { useState } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { colors, spacing } from "../lib/theme";
import * as Notifications from "expo-notifications";
import { scheduleLocal } from "../lib/notifications";

const h = React.createElement;

export default function SettingsScreen() {
  const [dailyReminder, setDailyReminder] = useState(false);

  async function toggleDaily(value) {
    setDailyReminder(value);
    if (value) {
      await scheduleLocal("Recordatorio MindSync", "¿Arrancamos una sesión?", 10);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  }

  return h(View, { style: styles.container },
    h(Text, { style: styles.title }, "Ajustes"),
    h(View, { style: styles.row },
      h(Text, { style: styles.label }, "Recordatorio diario"),
      h(Switch, { value: dailyReminder, onValueChange: toggleDaily })
    ),
    h(Text, { style: styles.hint }, "Consejo: usá sesiones más cortas al principio (15-20 min) y descansos auténticos.")
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: colors.bg, padding: spacing(2) },
  title: { color: colors.text, fontSize: 22, fontWeight: "700", marginBottom: spacing(2) },
  row: { backgroundColor: "#111827", padding: spacing(2), borderRadius: 12, flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  label: { color: colors.text, fontSize: 16 },
  hint: { color: colors.muted, marginTop: spacing(2) }
});
