import type { GenerationConfig, GenerationMetrics } from "../types";

const API_BASE = "http://localhost:8000";

/* ---------- TRANSCRIPTION ---------- */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const formData = new FormData();
  formData.append("file", audioBlob);

  const res = await fetch(`${API_BASE}/api/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Transcription failed");
  const data = await res.json();
  return data.text || "";
};

/* ---------- TRANSLATION ---------- */
export const translateText = async (
  text: string,
  targetLang: string
): Promise<string> => {
  try {
    const res = await fetch(`${API_BASE}/api/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target_lang: targetLang }),
    });

    const data = await res.json();
    return data.translatedText || text;
  } catch {
    return text;
  }
};

/* ---------- TTS ---------- */
export const generateSpeech = async (
  text: string,
<<<<<<< HEAD
  config: GenerationConfig,
  audioContext: AudioContext
): Promise<{
  buffer: AudioBuffer;
  metrics: GenerationMetrics;
  translatedText: string;
}> => {
  const translatedText = await translateText(text, config.language);

 // Inside ttsService.ts
const response = await fetch("http://localhost:8000/api/tts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: text,
    voice: config.voice,   // e.g. "Kore"
    pitch: config.pitch,   // e.g. 0
    speed: config.speed,   // e.g. 1.0
  }),
});
=======
  config: any,
  audioContext: AudioContext,
  language: string,

) => {
  const translatedText = await translateText(text, language);

  const response = await fetch(`${API_BASE}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: translatedText,
      voice: config.voice,
      language: language,
      emotion: config.emotion,
      speed: config.speed,
    }),
  });
>>>>>>> origin/main

  if (!res.ok) throw new Error("TTS backend failed");

  const arrayBuffer = await res.arrayBuffer();
  const buffer = await audioContext.decodeAudioData(arrayBuffer);

  return {
    buffer,
    translatedText,
    metrics: {
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
    },
  };
};

/* ---------- WAV EXPORT ---------- */
export const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const length = buffer.length * 2;
  const result = new ArrayBuffer(44 + length);
  const view = new DataView(result);

  const writeString = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + length, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, length, true);

  const data = buffer.getChannelData(0);
  let offset = 44;

  for (let i = 0; i < data.length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, sample * 0x7fff, true);
    offset += 2;
  }

  return new Blob([result], { type: "audio/wav" });
};
