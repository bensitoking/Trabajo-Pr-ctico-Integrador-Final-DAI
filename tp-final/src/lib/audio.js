// src/lib/audio.js
import { Audio } from "expo-av";
import { Platform } from "react-native";

/**
 * Llamar una sola vez al iniciar la app/pantalla de Sonidos.
 * Configura el modo de audio para que funcione en iOS (silencioso) y Android.
 */
export async function setupAudio() {
  try {
    await Audio.setAudioModeAsync({
      // iOS
      playsInSilentModeIOS: true,        // reproducir aunque el switch de silencio esté activado
      staysActiveInBackground: false,    // true si querés seguir sonando en background
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      // Android
      shouldDuckAndroid: true,           // bajar volumen de otras apps al reproducir
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false, // usa parlante por defecto
      // General
      allowsRecordingIOS: false,
    });
  } catch (e) {
    console.warn("setupAudio error:", e);
  }
}

/**
 * Crea un objeto Sound y lo prepara. Devuelve { sound } para que el caller guarde referencia.
 * Si pasás options { shouldPlay: true, isLooping: true } arranca a sonar al cargar.
 */
export async function createSound(uriOrModule, options = { shouldPlay: true, isLooping: true }) {
  const sound = new Audio.Sound();
  try {
    await sound.loadAsync(
      typeof uriOrModule === "string" ? { uri: uriOrModule } : uriOrModule,
      options,
      false
    );
    return { sound };
  } catch (e) {
    try { await sound.unloadAsync(); } catch {}
    throw e;
  }
}

/**
 * Helpers para controlar el sonido de forma segura.
 */
export async function playSound(sound) {
  if (!sound) return;
  const status = await sound.getStatusAsync();
  if (status.isLoaded && !status.isPlaying) await sound.playAsync();
}

export async function pauseSound(sound) {
  if (!sound) return;
  const status = await sound.getStatusAsync();
  if (status.isLoaded && status.isPlaying) await sound.pauseAsync();
}

export async function stopAndUnload(sound) {
  if (!sound) return;
  try {
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      try { await sound.stopAsync(); } catch {}
      await sound.unloadAsync();
    }
  } catch {}
}
