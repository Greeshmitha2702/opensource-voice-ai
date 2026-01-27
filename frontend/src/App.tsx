import { useRef, useState } from "react";
import { generateSpeech } from "./services/ttsService";
import AudioVisualizer from "./components/AudioVisualizer";
import "./App.css";

const LANGUAGES = [
  { code: "bn", label: "Bengali" },
  { code: "en", label: "English" },
  { code: "gu", label: "Gujarati" },
  { code: "hi", label: "Hindi" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "mr", label: "Marathi" },
  { code: "pa", label: "Punjabi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
];

interface HistoryItem {
  id: number;
  buffer: AudioBuffer;
  label: string;
}

const App = () => {
  const [text, setText] = useState(
    "Welcome to VoxOpen AI. This platform is now running on a Python FastAPI backend with zero-cost neural synthesis."
  );

  const [language, setLanguage] = useState("en");
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  /** 🔑 REAL PITCH LOGIC */
  const voice =
    pitch < 0 ? "male" : pitch > 0 ? "female" : "neutral";

  const handleGenerate = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    setIsGenerating(true);

    try {
      const { buffer } = await generateSpeech(
        text,
        {
          voice,        // ✅ real pitch → voice
          speed,
          pitch,
        },
        audioContextRef.current,
        language
      );

      setAudioBuffer(buffer);

      setHistory((prev) => [
        {
          id: Date.now(),
          buffer,
          label: `${language.toUpperCase()} • ${speed.toFixed(1)}x • ${
            pitch < 0 ? "Male" : pitch > 0 ? "Female" : "Neutral"
          }`,
        },
        ...prev,
      ]);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start();
      setIsPlaying(true);
      source.onended = () => setIsPlaying(false);
    } catch {
      alert("TTS failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const download = (buffer: AudioBuffer, name: string) => {
    const wav = audioBufferToWav(buffer);
    const url = URL.createObjectURL(wav);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <header className="topbar">
        <h1>VOXOPEN AI</h1>
        <span className="status">Cluster Status: Healthy</span>
      </header>

      {/* TEXT */}
      <div className="card main">
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Voice"}
        </button>
      </div>

      {/* WAVEFORM */}
      <div className="card waveform">
        <h3>Live Waveform</h3>
        <AudioVisualizer isPlaying={isPlaying} audioBuffer={audioBuffer} />
      </div>

      {/* NEURAL CONFIG */}
      <div className="card config">
        <h3>Neural Config</h3>

        <label>Language</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>

        <label>Playback Speed ({speed.toFixed(1)}x)</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />

        <label>Pitch ({pitch < 0 ? "Male" : pitch > 0 ? "Female" : "Neutral"})</label>
        <input
          type="range"
          min="-10"
          max="10"
          value={pitch}
          onChange={(e) => setPitch(Number(e.target.value))}
        />
      </div>

      {/* HISTORY */}
      <div className="card history">
        <h3>History</h3>

        {history.length === 0 && <p>No audio yet</p>}

        {history.map((h) => (
          <div className="history-item" key={h.id}>
            <span>{h.label}</span>
            <button onClick={() => download(h.buffer, "voxopen.wav")}>
              ⬇
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

/* WAV UTILS */
const audioBufferToWav = (buffer: AudioBuffer) => {
  const length = buffer.length * 2 + 44;
  const arr = new ArrayBuffer(length);
  const view = new DataView(arr);
  let offset = 0;

  const write = (s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset++, s.charCodeAt(i));
  };

  write("RIFF");
  view.setUint32(offset, length - 8, true);
  offset += 4;
  write("WAVEfmt ");
  view.setUint32(offset, 16, true);
  offset += 4;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint32(offset, buffer.sampleRate, true);
  offset += 4;
  view.setUint32(offset, buffer.sampleRate * 2, true);
  offset += 4;
  view.setUint16(offset, 2, true);
  offset += 2;
  view.setUint16(offset, 16, true);
  offset += 2;
  write("data");
  view.setUint32(offset, buffer.length * 2, true);
  offset += 4;

  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    view.setInt16(offset, data[i] * 0x7fff, true);
    offset += 2;
  }

  return new Blob([arr], { type: "audio/wav" });
};
