// src/screens/SoundsScreen.js
import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { colors, spacing, radius } from "../lib/theme";
import { Audio } from "expo-av";

// ✅ Pistas LOCALES (sin red)
const TRACKS = [
  { id: "rain",   name: "Lluvia", fuente: require("../../assets/rain.mp3") },
  { id: "forest", name: "Bosque", fuente: require("../../assets/forest.mp3") },
  { id: "piano",  name: "Piano",  fuente: require("../../assets/piano.mp3") },
];

const h = React.createElement;

export default function SoundsScreen() {
  const [current, setCurrent] = useState(null); // {id,name}
  const [loadingId, setLoadingId] = useState(null);
  const soundRef = useRef(new Audio.Sound());

  useEffect(() => {
    (async () => {
      try {
        // Modo audio robusto (iOS silencioso, mezcla en Android)
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
        console.warn("setAudioMode error:", e);
      }
    })();

    return () => {
      // descarga segura
      soundRef.current.unloadAsync().catch(() => {});
    };
  }, []);

  async function stopAndUnload() {
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        try { await soundRef.current.stopAsync(); } catch {}
        await soundRef.current.unloadAsync();
      }
    } catch {}
  }

  async function handlePlayPause(item) {
    // Si es el mismo track, pausar
    if (current?.id === item.id) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          setCurrent(null);
          return;
        }
        // si estaba pausado, continuar
        if (status.isLoaded && !status.isPlaying) {
          await soundRef.current.playAsync();
          setCurrent(item);
          return;
        }
      } catch (e) {
        console.warn("pause/resume error:", e);
      }
    }

    // Cambiar de pista: descargar anterior y cargar nueva
    try {
      setLoadingId(item.id);
      await stopAndUnload();

      await soundRef.current.loadAsync(item.fuente, { shouldPlay: true, isLooping: true });
      // (opcional) ajustar volumen inicial
      await soundRef.current.setVolumeAsync(1.0);

      soundRef.current.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded && status.error) {
          console.warn("Audio status error:", status.error);
        }
      });

      setCurrent(item);
    } catch (e) {
      console.log("Audio load error:", e);
      Alert.alert(
        "Audio",
        "No se pudo reproducir el sonido local. Verificá que los archivos existan en /assets y el nombre coincida (rain.mp3, forest.mp3, piano.mp3)."
      );
      setCurrent(null);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleStopAll() {
    await stopAndUnload();
    setCurrent(null);
  }

  function renderItem({ item }) {
    const isActive = current?.id === item.id;
    const isLoading = loadingId === item.id;

    return h(View, { style: styles.card },
      h(Text, { style: styles.cardText }, item.name),
      h(TouchableOpacity, {
        onPress: () => handlePlayPause(item),
        disabled: isLoading,
        style: [styles.btn, isActive ? styles.btnDanger : styles.btnPrimary, isLoading && styles.btnDisabled]
      }, h(Text, { style: styles.btnText }, isLoading ? "Cargando..." : (isActive ? "Pausar" : "Reproducir")))
    );
  }

  return h(View, { style: styles.container },
    h(Text, { style: styles.title }, "Sonidos para enfocar"),
    h(FlatList, {
      data: TRACKS,
      keyExtractor: (i) => i.id,
      ItemSeparatorComponent: () => h(View, { style: { height: spacing(1) } }),
      renderItem
    }),
    current && h(TouchableOpacity, {
      onPress: handleStopAll,
      style: [styles.btn, styles.btnDanger, { marginTop: spacing(2), alignSelf: "center" }]
    }, h(Text, { style: styles.btnText }, "Detener todo"))
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(2) },
  title: { color: colors.text, fontSize: 22, fontWeight: "700", marginBottom: spacing(2) },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius,
    padding: spacing(2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardText: { color: colors.text, fontSize: 16 },
  btn: { paddingVertical: spacing(1), paddingHorizontal: spacing(2), borderRadius: 999 },
  btnPrimary: { backgroundColor: colors.primary },
  btnDanger: { backgroundColor: colors.danger },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "white", fontWeight: "600" }
});
