import { useEffect, useMemo, useRef, useState } from "react";
import { Vibration } from "react-native";
import { scheduleLocal } from "../lib/notifications";
import { addFocusEvent } from "../lib/calendar";

const PATTERN_START = [0, 150];
const PATTERN_END = [0, 300, 120, 300];

export function useFocusTimer(defaultMinutes = 25, autoLogToCalendar = true) {
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [secondsLeft, setSecondsLeft] = useState(defaultMinutes * 60);
  const [running, setRunning] = useState(false);

  const intervalRef = useRef(null);

  const formatted = useMemo(() => {
    const m = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const s = (secondsLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [secondsLeft]);

  function start() {
    if (running) return;
    setRunning(true);
    Vibration.vibrate(PATTERN_START);
    scheduleLocal("Sesión iniciada", "¡A concentrarse!").catch(() => {});
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  }

  function pause() {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function reset(newMinutes = minutes) {
    pause();
    setMinutes(newMinutes);
    setSecondsLeft(newMinutes * 60);
  }

  useEffect(() => {
    if (secondsLeft === 0 && running) {
      // terminó
      pause();
      Vibration.vibrate(PATTERN_END);
      scheduleLocal("Sesión finalizada", "Tomate un descanso.").catch(() => {});
      if (autoLogToCalendar) {
        const end = new Date();
        const start = new Date(end.getTime() - minutes * 60 * 1000);
        addFocusEvent({
          title: `MindSync · ${minutes} min`,
          startDate: start,
          endDate: end,
          notes: "Sesión de enfoque registrada automáticamente."
        }).catch(() => {});
      }
    }
  }, [secondsLeft, running]);

  return { minutes, setMinutes, secondsLeft, formatted, running, start, pause, reset };
}
