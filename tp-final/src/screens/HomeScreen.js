import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../lib/theme";
import { useFocusTimer } from "../hooks/useFocusTimer";
import { ensureCalendarPermissions, ensureNotificationPermissions } from "../lib/permissions";
import { setupAndroidChannel } from "../lib/notifications";

const h = React.createElement;

export default function HomeScreen() {
  const { minutes, setMinutes, formatted, running, start, pause, reset } = useFocusTimer(25);
  const [input, setInput] = useState(String(minutes));

  useEffect(() => {
    (async () => {
      await ensureNotificationPermissions();
      await setupAndroidChannel();
      await ensureCalendarPermissions();
    })();
  }, []);

  return h(View, { style: styles.container },
    h(Text, { style: styles.title }, "MindSync"),
    h(Text, { style: styles.subtitle }, "Sesiones de enfoque con biofeedback"),
    h(View, { style: styles.timerCard },
      h(Text, { style: styles.timer }, formatted),
      h(View, { style: styles.row },
        h(TouchableOpacity, {
          onPress: running ? pause : start,
          style: [styles.btn, running ? styles.btnDanger : styles.btnPrimary]
        }, h(Text, { style: styles.btnText }, running ? "Pausar" : "Iniciar")),
        h(TouchableOpacity, {
          onPress: () => reset(),
          style: [styles.btn, styles.btnGhost]
        }, h(Text, { style: styles.btnText }, "Reiniciar"))
      ),
      h(View, { style: { marginTop: spacing(2) } },
        h(Text, { style: styles.label }, "Duración (min)"),
        h(View, { style: styles.row },
          h(TextInput, {
            style: styles.input,
            keyboardType: "number-pad",
            value: input,
            onChangeText: setInput,
            onBlur: () => {
              const m = Math.max(1, Math.min(180, parseInt(input || "25", 10)));
              setMinutes(m);
              reset(m);
              setInput(String(m));
            }
          }),
          h(TouchableOpacity, {
            onPress: () => {
              const m = Math.max(1, Math.min(180, parseInt(input || "25", 10)));
              setMinutes(m); reset(m);
            },
            style: [styles.btn, styles.btnPrimary, { marginLeft: spacing(1) }]
          }, h(Text, { style: styles.btnText }, "Aplicar"))
        )
      )
    ),
    h(Text, { style: styles.hint }, "Al iniciar/terminar vibra y se programa una notificación local.")
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  title: { color: colors.text, fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.muted, marginTop: 4 },
  timerCard: { backgroundColor: colors.card, marginTop: spacing(3), borderRadius: radius, padding: spacing(3) },
  timer: { color: colors.text, fontSize: 64, fontVariant: ["tabular-nums"], textAlign: "center", marginVertical: spacing(2) },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  btn: { paddingVertical: spacing(1.25), paddingHorizontal: spacing(2), borderRadius: 999, marginHorizontal: spacing(0.5) },
  btnPrimary: { backgroundColor: colors.primary },
  btnDanger: { backgroundColor: colors.danger },
  btnGhost: { backgroundColor: "#1f2937" },
  btnText: { color: "white", fontWeight: "600" },
  label: { color: colors.muted, marginBottom: 6 },
  input: { flex: 1, backgroundColor: "#0b1220", borderRadius: 10, padding: spacing(1.25), color: colors.text },
  hint: { color: colors.muted, textAlign: "center", marginTop: spacing(2) }
});
