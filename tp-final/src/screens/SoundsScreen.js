import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { colors, spacing, radius } from "../lib/theme";

const TRACKS = [
  { id: "rain", name: "Lluvia", uri: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_51b6ecb016.mp3?filename=rain-ambient-110251.mp3" },
  { id: "forest", name: "Bosque", uri: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_e6a7431f71.mp3?filename=forest-ambience-110245.mp3" },
  { id: "piano", name: "Piano", uri: "https://cdn.pixabay.com/download/audio/2021/11/03/audio_9e6aee206f.mp3?filename=calm-piano-ambient-10467.mp3" },
];

const h = React.createElement;

export default function SoundsScreen() {
  const [current, setCurrent] = useState(null);
  const soundRef = useRef(new Audio.Sound());

  useEffect(() => () => { soundRef.current.unloadAsync().catch(()=>{}); }, []);

  async function playTrack(track) {
    try {
      if (current?.id === track.id) {
        await soundRef.current.pauseAsync();
        setCurrent(null);
        return;
      }
      await soundRef.current.unloadAsync().catch(()=>{});
      await soundRef.current.loadAsync({ uri: track.uri }, { shouldPlay: true, isLooping: true });
      setCurrent(track);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  return h(View, { style: styles.container },
    h(Text, { style: styles.title }, "Sonidos para enfocar"),
    h(FlatList, {
      data: TRACKS,
      keyExtractor: i => i.id,
      ItemSeparatorComponent: () => h(View, { style: { height: spacing(1) } }),
      renderItem: ({ item }) =>
        h(View, { style: styles.card },
          h(Text, { style: styles.cardText }, item.name),
          h(TouchableOpacity, { onPress: () => playTrack(item), style: [styles.btn, styles.btnPrimary] },
            h(Text, { style: styles.btnText }, current?.id === item.id ? "Pausar" : "Reproducir")
          )
        )
    }),
    current && h(TouchableOpacity, {
      onPress: async () => { await soundRef.current.stopAsync(); setCurrent(null); },
      style: [styles.btn, styles.btnDanger, { marginTop: spacing(2), alignSelf: "center" }]
    }, h(Text, { style: styles.btnText }, "Detener todo"))
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: colors.bg, padding: spacing(2) },
  title: { color: colors.text, fontSize: 22, fontWeight: "700", marginBottom: spacing(2) },
  card: { backgroundColor: colors.card, borderRadius: radius, padding: spacing(2), flexDirection: "row", alignItems: "center", justifyContent:"space-between" },
  cardText: { color: colors.text, fontSize: 16 },
  btn: { paddingVertical: spacing(1), paddingHorizontal: spacing(2), borderRadius: 999 },
  btnPrimary: { backgroundColor: colors.primary },
  btnDanger: { backgroundColor: "#ef4444" },
  btnText: { color: "white", fontWeight: "600" }
});
