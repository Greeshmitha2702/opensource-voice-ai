import { useRef, useState } from "react";
import { VoiceID, Emotion } from "./types";
import { generateSpeech } from "./services/ttsService";
import AudioVisualizer from "./components/AudioVisualizer";
import "./App.css";

const App = () => {
  const [text, setText] = useState(
    "Welcome to VoxOpen AI. Now with multilingual, speed and pitch control."
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  const [language, setLanguage] = useState("en");
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleGenerate = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    setIsGenerating(true);
    try {
      const { buffer } = await generateSpeech(
        text,
        {
          voice: VoiceID.Kore,
          emotion: Emotion.Neutral,
          speed: speed,
          pitch: pitch,
        },
        audioContextRef.current,
        language
      );

      setAudioBuffer(buffer);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start();

      sourceRef.current = source;
      setIsPlaying(true);
      source.onended = () => setIsPlaying(false);
    } catch {
      alert("TTS failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStop = () => {
    sourceRef.current?.stop();
    setIsPlaying(false);
  };

  const handleReplay = () => {
    if (!audioBuffer || !audioContextRef.current) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.start();

    sourceRef.current = source;
    setIsPlaying(true);
    source.onended = () => setIsPlaying(false);
  };

  return (
    <div className="app">
      <header className="topbar">
        <h1>VOXOPEN AI</h1>
        <span className="status">Neural TTS Console</span>
      </header>

      <div className="grid">
        {/* MAIN TEXT */}
        <div className="card main">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Voice"}
          </button>
        </div>

        {/* CONTROLS */}
        <div className="card side">
          <h3>Neural Controls</h3>

          <label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="kn">Kannada</option>
            <option value="ml">Malayalam</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
            <option value="bn">Bengali</option>
            <option value="gu">Gujarati</option>
            <option value="pa">Punjabi</option>
          </select>

          <label>Speed: {speed.toFixed(1)}x</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
  <br />
          <label>Pitch: {pitch} Hz</label>
          <input
            type="range"
            min="-20"
            max="20"
            step="1"
            value={pitch}
            onChange={(e) => setPitch(parseInt(e.target.value))}
          />

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button onClick={handleReplay}>Play</button>
            <button onClick={handleStop}>Stop</button>
          </div>
        </div>

        {/* WAVEFORM */}
        <div className="card waveform">
          <h3>Live Waveform</h3>
          <AudioVisualizer
            isPlaying={isPlaying}
            audioBuffer={audioBuffer}
          />
        </div>

        {/* HISTORY */}
        <div className="card history">
          <h3>History</h3>
          <p>Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default App;
