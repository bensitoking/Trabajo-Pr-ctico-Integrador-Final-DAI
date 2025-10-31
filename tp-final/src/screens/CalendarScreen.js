// src/screens/CalendarScreen.js
import React, { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { colors, spacing, radius } from "../lib/theme";
import { fetchRecentEvents } from "../lib/calendar";
import { useFocusEffect } from "@react-navigation/native";

const h = React.createElement;

export default function CalendarScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchRecentEvents(20);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchRecentEvents(20);
      setEvents(data);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Re-fetch cada vez que la pestaña gana foco
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return h(View, { style: styles.container },
    h(View, { style: styles.headerRow },
      h(Text, { style: styles.title }, "Historial de sesiones"),
      h(TouchableOpacity, { onPress: onRefresh, style: styles.reloadBtn },
        h(Text, { style: styles.reloadText }, loading ? "Cargando..." : "Recargar"))
    ),
    h(FlatList, {
      data: events,
      keyExtractor: (e) => String(e.id),
      refreshControl: h(RefreshControl, { refreshing, onRefresh, tintColor: colors.primary }),
      ListEmptyComponent: () =>
        h(Text, { style: styles.muted }, loading ? "Cargando..." : "Aún no hay sesiones registradas."),
      ItemSeparatorComponent: () => h(View, { style: { height: spacing(1) } }),
      renderItem: ({ item }) =>
        h(View, { style: styles.card },
          h(Text, { style: styles.cardTitle }, item.title || "Sesión MindSync"),
          h(Text, { style: styles.cardText },
            `${new Date(item.startDate).toLocaleString()} → ${new Date(item.endDate).toLocaleTimeString()}`
          )
        )
    })
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: colors.bg, padding: spacing(2) },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing(2) },
  title: { color: colors.text, fontSize: 22, fontWeight: "700" },
  reloadBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "#1f2937" },
  reloadText: { color: colors.text, fontWeight: "600" },
  card: { backgroundColor: colors.card, borderRadius: radius, padding: spacing(2) },
  cardTitle: { color: colors.text, fontWeight: "700" },
  cardText: { color: colors.muted, marginTop: 4 },
  muted: { color: colors.muted, textAlign: "center", marginTop: spacing(4) }
});
