export enum VoiceID {
  Kore = "Kore",
  Puck = "Puck",
  Charon = "Charon",
  Fenrir = "Fenrir",
  Zephyr = "Zephyr",
}

export enum Emotion {
  Neutral = "Neutral",
  Cheerful = "Cheerful",
  Serious = "Serious",
  Excited = "Excited",
  Sad = "Sad",
  Whispering = "Whispering",
}

export interface GenerationConfig {
  voice: VoiceID;
  emotion: Emotion;
  emotionIntensity: number;
  speed: number;
  pitch: number;
  language: string;
}

export interface GenerationMetrics {
  latencyMs: number;
  duration: number;
  sampleRate: number;
}

export interface AudioEntry {
  id: string;
  text: string;
  timestamp: number;
  url: string;
  config: GenerationConfig;
  metrics: GenerationMetrics;
}
