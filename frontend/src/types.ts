// ================= VOICES =================
export enum VoiceID {
  Kore = "en-US-ChristopherNeural",
  Jenny = "en-US-JennyNeural",
  Eric = "en-US-EricNeural",
  // Hindi Support Voices
  Madhur = "hi-IN-MadhurNeural",
  Swara = "hi-IN-SwaraNeural",
  // Global
  Sonia = "en-GB-SoniaNeural",
  Isabelle = "fr-FR-IsabelleNeural",
}

// ================= EMOTIONS =================
export enum Emotion {
  Neutral = "Neutral",
  Cheerful = "Cheerful",
  Sad = "Sad",
  Angry = "Angry",
  Excited = "Excited",
  Friendly = "Friendly",
  Whispering = "Whispering"
}

// ================= CONFIG & HISTORY =================
export interface GenerationConfig {
  voice: VoiceID;
  emotion: Emotion;
  emotionIntensity: number;
  speed: number;
  pitch: number;
  language: string;
}

export interface GenerationMetrics {
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