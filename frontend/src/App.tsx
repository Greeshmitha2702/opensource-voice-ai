import { useRef, useState } from "react";
import { VoiceID, Emotion } from "./types";
import { generateSpeech } from "./services/ttsService";
import AudioVisualizer from "./components/AudioVisualizer";
import "./App.css";

const App = () => {
  const [text, setText] = useState(
    "Welcome to VoxOpen AI. This platform is now running on a Python FastAPI backend with zero-cost neural synthesis."
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [language, setLanguage] = useState("en");


  const audioContextRef = useRef<AudioContext | null>(null);

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
    speed: 1.0,
  },
  audioContextRef.current,
  language   // 👈 this is the missing argument
);

      setAudioBuffer(buffer);

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

  return (
    <div className="app">
      <header className="topbar">
        <h1>VOXOPEN AI</h1>
        <span className="status">Cluster Status: Healthy</span>
      </header>

      <div className="grid">
        <div className="card main">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Voice"}
          </button>
        </div>

        <div className="card side">
          <h3>Neural Config</h3>

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

          <select>
            <option>US English</option>
          </select>
        </div>

        <div className="card waveform">
          <h3>Live Waveform</h3>
          <AudioVisualizer
            isPlaying={isPlaying}
            audioBuffer={audioBuffer}
          />
        </div>

        <div className="card history">
          <h3>History</h3>
          <p>Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default App;
