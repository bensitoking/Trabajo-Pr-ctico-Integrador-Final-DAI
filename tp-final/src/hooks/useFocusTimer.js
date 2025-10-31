// src/hooks/useFocusTimer.js
import { useEffect, useMemo, useRef, useState } from "react";
import { Vibration } from "react-native";
import { scheduleLocal } from "../lib/notifications";
import { addFocusEvent } from "../lib/calendar";

const PATTERN_START = [0, 150];
const PATTERN_END = [0, 300, 120, 300];

export function useFocusTimer(defaultMinutes = 25, autoLogToCalendar = true, onFinish) {
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [secondsLeft, setSecondsLeft] = useState(defaultMinutes * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const finishedRef = useRef(false); // evita dobles disparos

  const formatted = useMemo(() => {
    const m = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const s = (secondsLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [secondsLeft]);

  function cleanupInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  async function finishSession() {
    if (finishedRef.current) return;
    finishedRef.current = true;

    // vibrar y notificar
    Vibration.vibrate(PATTERN_END);
    await scheduleLocal("Sesión finalizada", "Tomate un descanso.").catch(() => {});

    // registrar evento en calendario
    if (autoLogToCalendar) {
      const end = new Date();
      const start = new Date(end.getTime() - minutes * 60 * 1000);
      await addFocusEvent({
        title: `MindSync · ${minutes} min`,
        startDate: start,
        endDate: end,
        notes: "Sesión de enfoque registrada automáticamente."
      }).catch(() => {});
    }

    // ejecutar callback (por ejemplo: detener música)
    if (typeof onFinish === "function") {
      try {
        await onFinish();
      } catch {}
    }

    setRunning(false);
  }

  function start() {
    if (running) return;
    finishedRef.current = false;
    setRunning(true);
    Vibration.vibrate(PATTERN_START);
    scheduleLocal("Sesión iniciada", "¡A concentrarse!").catch(() => {});

    cleanupInterval();
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          cleanupInterval();
          setSecondsLeft(0);
          // terminar en el mismo tick
          finishSession().catch(() => {});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function pause() {
    cleanupInterval();
    setRunning(false);
  }

  function reset(newMinutes = minutes) {
    cleanupInterval();
    setRunning(false);
    finishedRef.current = false;
    setMinutes(newMinutes);
    setSecondsLeft(newMinutes * 60);
  }

  useEffect(() => () => cleanupInterval(), []);

  return { minutes, setMinutes, secondsLeft, formatted, running, start, pause, reset };
}
