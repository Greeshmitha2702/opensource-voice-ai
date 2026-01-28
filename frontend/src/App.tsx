<<<<<<< HEAD
import React, { useState } from "react";
import { Download, Trash2, Mic2, Settings2, Clock, Sparkles } from "lucide-react";
import "./App.css";

const App = () => {
  const [text, setText] = useState("System ready. Neural synthesis engine is prepared.");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  
  const [config, setConfig] = useState({
    voice: "Kore",
    speed: 1.0,
    pitch: 0,
    emotion: "Neutral" // New Emotion State
  });
=======
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
>>>>>>> origin/main

  /** 🔑 REAL PITCH LOGIC */
  const voice =
    pitch < 0 ? "male" : pitch > 0 ? "female" : "neutral";

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
<<<<<<< HEAD
    
    try {
      const response = await fetch("http://localhost:8000/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, text })
      });

      if (!response.ok) throw new Error("Server Error");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      new Audio(url).play();

      setHistory([{ 
        text, 
        url, 
        id: Date.now(), 
        voiceName: config.voice,
        emotion: config.emotion 
      }, ...history]);

    } catch (err) {
      alert("Backend Connection Failed");
=======

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
>>>>>>> origin/main
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
<<<<<<< HEAD
    <div className="app-container animate-fade-in">
      <header className="main-header">
        <h1 className="logo">VOXOPEN <span className="ai-text">AI</span></h1>
        <div className="status-indicator">
          <span className="dot"></span> Neural Link Active
        </div>
      </header>

      <div className="main-grid">
        <div className="left-column">
          <div className="glass-box input-section">
            <div className="header"><Mic2 size={16}/> Core Input</div>
            <textarea 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              placeholder="Enter neural data..."
            />
            <button 
              className={`gen-btn ${isGenerating ? 'loading' : ''}`} 
              onClick={handleGenerate} 
              disabled={isGenerating}
            >
              {isGenerating ? "Synthesizing..." : "Generate Voice"}
            </button>
          </div>

          <div className="glass-box output-section">
             <div className="header"><Sparkles size={16}/> Neural Output</div>
             <div className="visualizer-container">
                <div className={`wave-bar ${isGenerating ? 'active' : ''}`}></div>
                <div className={`wave-bar ${isGenerating ? 'active' : ''}`}></div>
                <div className={`wave-bar ${isGenerating ? 'active' : ''}`}></div>
                <div className={`wave-bar ${isGenerating ? 'active' : ''}`}></div>
             </div>
          </div>
        </div>

        <div className="glass-box config-section">
          <div className="header"><Settings2 size={16}/> Synthesis Config</div>
          <div className="controls">
            <label className="label">Voice Model</label>
            <select className="custom-select" value={config.voice} onChange={(e) => setConfig({...config, voice: e.target.value})}>
              <optgroup label="English"><option value="Kore">Kore (Male)</option><option value="Jenny">Jenny (Female)</option></optgroup>
              <optgroup label="Hindi"><option value="Madhur">Madhur</option><option value="Swara">Swara</option></optgroup>
            </select>

            {/* IMPROVED EMOTIONS DROPDOWN */}
            <label className="label">Emotion Engine</label>
            <select className="custom-select" value={config.emotion} onChange={(e) => setConfig({...config, emotion: e.target.value})}>
              <option value="Neutral">Neutral </option>
              <option value="Cheerful">Cheerful </option>
              <option value="Angry">Angry </option>
              <option value="Sad">Sad </option>
              <option value="Excited">Excited </option>
              <option value="Whispering">Whispering </option>
            </select>

            <div className="slider-box">
              <div className="slider-label">Pitch <span>{config.pitch}Hz</span></div>
              <input type="range" min="-50" max="50" value={config.pitch} onChange={(e) => setConfig({...config, pitch: parseInt(e.target.value)})} />
            </div>

            <div className="slider-box">
              <div className="slider-label">Speed <span>{config.speed}x</span></div>
              <input type="range" min="0.5" max="2" step="0.1" value={config.speed} onChange={(e) => setConfig({...config, speed: parseFloat(e.target.value)})} />
            </div>
          </div>
        </div>
      </div>

      <div className="history-section glass-box">
        <div className="header"><Clock size={16}/> Recent History</div>
        <div className="history-grid">
          {history.map(item => (
            <div key={item.id} className="history-card">
              <div className="history-info">
                <p>"{item.text.substring(0, 50)}..."</p>
                <small>{item.voiceName} • {item.emotion}</small>
              </div>
              <div className="history-actions">
                <a href={item.url} download="vox_ai.mp3" className="btn-circle blue"><Download size={14}/></a>
                <button onClick={() => setHistory(history.filter(h => h.id !== item.id))} className="btn-circle red"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
=======
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
>>>>>>> origin/main
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default App;
=======
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
>>>>>>> origin/main
