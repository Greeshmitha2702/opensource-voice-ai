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

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    
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
    } finally {
      setIsGenerating(false);
    }
  };

  return (
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
      </div>
    </div>
  );
};

export default App;