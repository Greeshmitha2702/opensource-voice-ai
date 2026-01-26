
import { GenerationConfig, GenerationMetrics } from "../types";

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target_lang: targetLanguage.toLowerCase().substring(0, 2) })
    });
    const data = await response.json();
    return data.translatedText || text;
  } catch (err) {
    console.warn("Translation failed:", err);
    return text;
  }
};

export const generateSpeech = async (
  text: string,
  config: GenerationConfig,
  audioContext: AudioContext
): Promise<{ buffer: AudioBuffer; metrics: GenerationMetrics; base64: string; translatedText: string }> => {
  const startTime = performance.now();
  const translatedText = await translateText(text, config.language);

  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: translatedText,
      voice: config.voice,
      language: config.language,
      emotion: config.emotion,
      speed: config.speed
    })
  });

  if (!response.ok) throw new Error("Synthesis backend failed");
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  return {
    buffer: audioBuffer,
    base64: '',
    translatedText,
    metrics: { 
      latencyMs: Math.round(performance.now() - startTime), 
      duration: audioBuffer.duration, 
      sampleRate: audioBuffer.sampleRate 
    }
  };
};

export const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const length = buffer.length * 2;
  const result = new ArrayBuffer(44 + length);
  const view = new DataView(result);
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);
  const channelData = buffer.getChannelData(0);
  let offset = 44;
  for (let i = 0; i < channelData.length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }
  return new Blob([result], { type: 'audio/wav' });
};

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  console.warn("Transcription placeholder - Requires backend Whisper integration.");
  return "Integrated with backend pipeline.";
};
