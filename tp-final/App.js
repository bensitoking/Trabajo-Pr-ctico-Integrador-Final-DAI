import React from "react";
import { StatusBar } from "expo-status-bar";
import RootNavigator from "./src/navigation/RootNavigator";

const h = React.createElement;

export default function App() {
  return h(React.Fragment, null,
    h(StatusBar, { style: "light" }),
    h(RootNavigator, null)
  );
}
