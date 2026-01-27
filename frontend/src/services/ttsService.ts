const API_BASE = "http://localhost:8000";

export const translateText = async (text: string, lang: string) => {
  const res = await fetch(`${API_BASE}/api/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target_lang: lang }),
  });
  const data = await res.json();
  return data.translatedText ?? text;
};

export const generateSpeech = async (
  text: string,
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

  if (!response.ok) throw new Error("TTS failed");

  const buffer = await audioContext.decodeAudioData(
    await response.arrayBuffer()
  );

  return { buffer };
};
