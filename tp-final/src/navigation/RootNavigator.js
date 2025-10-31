import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
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
  // EXTENDER el DarkTheme para conservar fonts, spacing, etc.
  const MyTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.bg,
      card: "#111827",
      border: "#0b1220",
      text: colors.text,
      primary: colors.primary,
      notification: colors.primary
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

  return h(NavigationContainer, { theme: MyTheme },
    h(Tab.Navigator, { screenOptions },
      h(Tab.Screen, { name: "Home", component: HomeScreen }),
      h(Tab.Screen, { name: "Sonidos", component: SoundsScreen }),
      h(Tab.Screen, { name: "Calendario", component: CalendarScreen }),
      h(Tab.Screen, { name: "Ajustes", component: SettingsScreen })
    )
  );
}
