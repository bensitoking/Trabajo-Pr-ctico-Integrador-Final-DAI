// src/screens/HomeScreen.js
import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from "react-native";
import { colors, spacing, radius } from "../lib/theme";
import { useFocusTimer } from "../hooks/useFocusTimer";
import { ensureCalendarPermissions, ensureNotificationPermissions } from "../lib/permissions";
import { setupAndroidChannel } from "../lib/notifications";
import { addFocusEvent } from "../lib/calendar";
import { Audio } from "expo-av";

const h = React.createElement;

// 🔊 sonidos disponibles (locales)
const TRACKS = [
  { id: "rain", name: "Lluvia", source: require("../../assets/rain.mp3") },
  { id: "forest", name: "Bosque", source: require("../../assets/forest.mp3") },
  { id: "piano", name: "Piano", source: require("../../assets/piano.mp3") },
];

export default function HomeScreen() {
  // referencia del sonido ambiente
  const soundRef = useRef(new Audio.Sound());
  const [selected, setSelected] = useState(TRACKS[0]);
  const [input, setInput] = useState("25");
  const [loadingAudio, setLoadingAudio] = useState(false);

  // callback al terminar sesión → detiene audio
  async function handleFinish() {
    await stopAndUnload();
  }

  // inicializa timer y lo asocia al callback de fin
  const { minutes, setMinutes, formatted, running, start, pause, reset } =
    useFocusTimer(25, true, handleFinish);

  // helpers de audio
  async function stopAndUnload() {
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        try { await soundRef.current.stopAsync(); } catch {}
        await soundRef.current.unloadAsync();
      }
    } catch {}
  }

  async function playAmbient() {
    try {
      setLoadingAudio(true);
      await stopAndUnload();
      await soundRef.current.loadAsync(selected.source, { shouldPlay: true, isLooping: true });
      await soundRef.current.setVolumeAsync(1.0);
    } finally {
      setLoadingAudio(false);
    }
  }

  async function pauseAmbient() {
    try {
      const s = await soundRef.current.getStatusAsync();
      if (s.isLoaded && s.isPlaying) await soundRef.current.pauseAsync();
    } catch {}
  }

  useEffect(() => {
    (async () => {
      try {
        await ensureNotificationPermissions();
        await setupAndroidChannel();
        await ensureCalendarPermissions();
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.warn("init error:", e);
      }
    })();
    return () => { stopAndUnload().catch(() => {}); };
  }, []);

  async function handleStart() {
    try {
      await playAmbient();
      start();
    } catch (e) {
      console.log("Audio load error:", e);
      Alert.alert("Audio", "No se pudo reproducir el sonido. Verificá assets/ y nombres.");
    }
  }

  async function handlePause() {
    await pauseAmbient();
    pause();
  }

  function handleReset() {
    stopAndUnload().catch(() => {});
    reset();
  }

  // cambiar el sonido antes de iniciar
  function handleSelect(track) {
    if (running) return;
    setSelected(track);
  }

  return h(View, { style: styles.container },
    h(Text, { style: styles.title }, "MindSync"),
    h(Text, { style: styles.subtitle }, "Sesiones de enfoque con música + timer"),

    // 🔘 selector de sonido
    h(View, { style: styles.selectorContainer },
      h(Text, { style: styles.label }, "Elegí tu sonido:"),
      h(View, { style: styles.rowSelector },
        TRACKS.map(t =>
          h(TouchableOpacity, {
            key: t.id,
            onPress: () => handleSelect(t),
            style: [styles.soundBtn, selected.id === t.id ? styles.soundBtnActive : null]
          },
            h(Text, { style: selected.id === t.id ? styles.soundTextActive : styles.soundText }, t.name)
          )
        )
      )
    ),

    // 🕒 timer + controles
    h(View, { style: styles.timerCard },
      h(Text, { style: styles.timer }, formatted),
      h(View, { style: styles.row },
        h(TouchableOpacity, {
          onPress: running ? handlePause : handleStart,
          disabled: loadingAudio && !running,
          style: [styles.btn, running ? styles.btnDanger : styles.btnPrimary, (loadingAudio && !running) ? styles.btnDisabled : null]
        }, h(Text, { style: styles.btnText }, running ? "Pausar" : (loadingAudio ? "Cargando..." : "Iniciar"))),
        h(TouchableOpacity, {
          onPress: handleReset,
          style: [styles.btn, styles.btnGhost]
        }, h(Text, { style: styles.btnText }, "Reiniciar"))
      ),

      // duración editable
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
              setMinutes(m);
              reset(m);
            },
            style: [styles.btn, styles.btnPrimary, { marginLeft: spacing(1) }]
          }, h(Text, { style: styles.btnText }, "Aplicar"))
        )
      )
    ),

    // botón de prueba de evento (opcional)
    h(TouchableOpacity, {
      onPress: async () => {
        try {
          const now = new Date();
          const end = new Date(now.getTime() + 2 * 60 * 1000);
          const id = await addFocusEvent({
            title: "MindSync · PRUEBA 2 min",
            startDate: now,
            endDate: end,
            notes: "Evento de prueba creado manualmente."
          });
          alert("Evento agregado (id: " + id + ")");
        } catch (e) {
          alert("Error al crear evento: " + (e?.message || e));
          console.log("Calendar error:", e);
        }
      },
      style: [styles.btn, styles.btnPrimary, { marginTop: spacing(2) }]
    }, h(Text, { style: styles.btnText }, "Registrar evento de prueba")),

    h(Text, { style: styles.hint }, "La música se apaga automáticamente al terminar el conteo.")
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  title: { color: colors.text, fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.muted, marginTop: 4 },
  selectorContainer: { marginTop: spacing(3), marginBottom: spacing(1) },
  rowSelector: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing(1) },
  soundBtn: {
    flex: 1,
    backgroundColor: colors.card,
    paddingVertical: spacing(1.2),
    marginHorizontal: spacing(0.5),
    borderRadius: 12,
    alignItems: "center",
  },
  soundBtnActive: { backgroundColor: colors.primary },
  soundText: { color: colors.text, fontWeight: "500" },
  soundTextActive: { color: "white", fontWeight: "700" },
  timerCard: { backgroundColor: colors.card, marginTop: spacing(3), borderRadius: radius, padding: spacing(3) },
  timer: { color: colors.text, fontSize: 64, fontVariant: ["tabular-nums"], textAlign: "center", marginVertical: spacing(2) },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  btn: { paddingVertical: spacing(1.25), paddingHorizontal: spacing(2), borderRadius: 999, marginHorizontal: spacing(0.5) },
  btnPrimary: { backgroundColor: colors.primary },
  btnDanger: { backgroundColor: colors.danger },
  btnGhost: { backgroundColor: "#1f2937" },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "white", fontWeight: "600" },
  label: { color: colors.muted, marginBottom: 6 },
  input: { flex: 1, backgroundColor: "#0b1220", borderRadius: 10, padding: spacing(1.25), color: colors.text },
  hint: { color: colors.muted, textAlign: "center", marginTop: spacing(2) }
});
