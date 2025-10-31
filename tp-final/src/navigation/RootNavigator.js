import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import SoundsScreen from "../screens/SoundsScreen";
import CalendarScreen from "../screens/CalendarScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { colors } from "../lib/theme";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();
const h = React.createElement;

export default function RootNavigator() {
  const theme = {
    dark: true,
    colors: {
      background: colors.bg,
      border: "#0b1220",
      card: "#111827",
      notification: colors.primary,
      primary: colors.primary,
      text: colors.text
    }
  };

  const screenOptions = ({ route }) => ({
    headerShown: false,
    tabBarStyle: { backgroundColor: "#0b1220", borderTopColor: "#17203a" },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: "#94a3b8",
    tabBarIcon: ({ color, size }) => {
      const map = { Home: "ios-timer", Sonidos: "musical-notes", Calendario: "calendar", Ajustes: "settings" };
      return h(Ionicons, { name: map[route.name], size, color });
    }
  });

  return h(NavigationContainer, { theme },
    h(Tab.Navigator, { screenOptions },
      h(Tab.Screen, { name: "Home", component: HomeScreen }),
      h(Tab.Screen, { name: "Sonidos", component: SoundsScreen }),
      h(Tab.Screen, { name: "Calendario", component: CalendarScreen }),
      h(Tab.Screen, { name: "Ajustes", component: SettingsScreen })
    )
  );
}
