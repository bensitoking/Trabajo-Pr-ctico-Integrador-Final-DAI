import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../lib/theme";
import { fetchRecentEvents } from "../lib/calendar";

const h = React.createElement;

export default function CalendarScreen() {
  const [events, setEvents] = useState([]);

  useEffect(() => { (async () => setEvents(await fetchRecentEvents(20)))(); }, []);

  return h(View, { style: styles.container },
    h(Text, { style: styles.title }, "Historial de sesiones"),
    h(FlatList, {
      data: events,
      keyExtractor: e => String(e.id),
      ListEmptyComponent: h(Text, { style: styles.muted }, "Aún no hay sesiones registradas."),
      ItemSeparatorComponent: () => h(View, { style: { height: spacing(1) } }),
      renderItem: ({ item }) =>
        h(View, { style: styles.card },
          h(Text, { style: styles.cardTitle }, item.title),
          h(Text, { style: styles.cardText },
            `${new Date(item.startDate).toLocaleString()} → ${new Date(item.endDate).toLocaleTimeString()}`
          )
        )
    })
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: colors.bg, padding: spacing(2) },
  title: { color: colors.text, fontSize: 22, fontWeight: "700", marginBottom: spacing(2) },
  card: { backgroundColor: colors.card, borderRadius: radius, padding: spacing(2) },
  cardTitle: { color: colors.text, fontWeight: "700" },
  cardText: { color: colors.muted, marginTop: 4 },
  muted: { color: colors.muted, textAlign: "center", marginTop: spacing(4) }
});
