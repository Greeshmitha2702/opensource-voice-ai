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
    emotion: "Neutral" 
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
      const audio = new Audio(url);
      audio.play();

      setHistory([{ 
        text, 
        url, 
        id: Date.now(), 
        voiceName: config.voice,
        emotion: config.emotion 
      }, ...history]);

    } catch (err) {
      alert("Backend Connection Failed. Ensure your Python server is running.");
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
                <div className={`wave-bar ${isGenerating ? 'active' : ''}`}></div>
             </div>
          </div>
        </div>

        <div className="glass-box config-section">
          <div className="header"><Settings2 size={16}/> Synthesis Config</div>
          <div className="controls">
            
            {/* --- EXPANDED LANGUAGE & VOICE SELECTION --- */}
            <label className="label">Voice & Language Selection</label>
            <select 
              value={config.voice} 
              onChange={(e) => setConfig({...config, voice: e.target.value})}
              className="custom-select"
            >
              <optgroup label="English">
                <option value="Kore">Kore (US Male)</option>
                <option value="Jenny">Jenny (US Female)</option>
                <option value="Ryan">Ryan (UK Male)</option>
                <option value="Sonia">Sonia (UK Female)</option>
              </optgroup>

              <optgroup label="Hindi (North India)">
                <option value="Madhur">Madhur (Hindi Male)</option>
                <option value="Swara">Swara (Hindi Female)</option>
              </optgroup>

              <optgroup label="South Indian">
                <option value="Karthik">Karthik (Tamil Male)</option>
                <option value="Pallavi">Pallavi (Tamil Female)</option>
                <option value="Gagan">Gagan (Kannada Male)</option>
                <option value="Sapna">Sapna (Kannada Female)</option>
                <option value="Mohan">Mohan (Telugu Male)</option>
                <option value="Shruti">Shruti (Telugu Female)</option>
              </optgroup>

              <optgroup label="Other Indian">
                <option value="Dhaval">Dhaval (Gujarati Male)</option>
                <option value="Nirmala">Nirmala (Marathi Female)</option>
              </optgroup>

              <optgroup label="Global">
                <option value="Remy">Remy (French Male)</option>
                <option value="Eloise">Eloise (French Female)</option>
                <option value="Alvaro">Alvaro (Spanish Male)</option>
                <option value="Nanami">Nanami (Japanese Female)</option>
              </optgroup>
            </select>

            <label className="label">Emotion Engine</label>
            <select 
              className="custom-select" 
              value={config.emotion} 
              onChange={(e) => setConfig({...config, emotion: e.target.value})}
            >
              <option value="Neutral">Neutral 😐</option>
              <option value="Cheerful">Cheerful 😊</option>
              <option value="Angry">Angry 😡</option>
              <option value="Sad">Sad 😔</option>
              <option value="Excited">Excited 🤩</option>
              <option value="Whispering">Whispering 🤫</option>
            </select>

            <div className="slider-box">
              <div className="slider-label">Pitch <span>{config.pitch}Hz</span></div>
              <input 
                type="range" 
                min="-50" 
                max="50" 
                value={config.pitch} 
                onChange={(e) => setConfig({...config, pitch: parseInt(e.target.value)})} 
              />
            </div>

            <div className="slider-box">
              <div className="slider-label">Speed <span>{config.speed}x</span></div>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1" 
                value={config.speed} 
                onChange={(e) => setConfig({...config, speed: parseFloat(e.target.value)})} 
              />
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
                <button 
                  onClick={() => setHistory(history.filter(h => h.id !== item.id))} 
                  className="btn-circle red"
                >
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="empty-history">No synthesis history available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;