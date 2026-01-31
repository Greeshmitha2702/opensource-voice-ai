import React, { useState, useRef, useEffect } from "react";
import { Download, Trash2, Mic2, Settings2, Clock, Sparkles, Mic, Upload, StopCircle, Play, Pause } from "lucide-react";
import "./App.css";

const App = () => {
  const [text, setText] = useState("Enter text here to generate neural audio in seconds...");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Fetch voice history from backend on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("https://opensource-voice-ai.onrender.com/api/history");
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        // Map backend history to frontend format
        const mapped = (data.history || []).map((item: any) => ({
          text: item.text,
          id: item._id,
          voiceName: item.voice,
          emotion: item.emotion,
          // No audio URL from backend, so set to null (or could fetch audio if stored)
          url: null,
          timestamp: item.timestamp
        }));
        setHistory(mapped);
      } catch (e) {
        // Optionally handle error
      }
    };
    fetchHistory();
  }, []);
  
  // NEW: State to track the latest generated audio for the top play button
  const [lastGenerated, setLastGenerated] = useState<{url: string, id: number} | null>(null);
  
  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Playback States
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [config, setConfig] = useState({
    voice: "Kore",
    speed: 1.0,
    pitch: 0,
    emotion: "Neutral" 
  });
  const [isStarted, setIsStarted] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const handleStart = () => {
    setIsFading(true); 
    setTimeout(() => {
      setIsStarted(true); 
    }, 500); 
  };
  
  // CLEANUP EFFECT: Prevents memory leaks and audio overlapping on refresh
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Helper to handle Play/Pause
  const togglePlay = (url: string, id: number) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      
      // Update visualizer when audio actually starts/ends
      audio.play().catch(e => console.error("Playback failed", e));
      setPlayingId(id);
      audio.onended = () => setPlayingId(null);
    }
  };

  // --- RECORDING LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        handleAutoDetect(audioBlob, "Recorded_Profile.wav");
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied. Please check browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleAutoDetect = (file: Blob | File, name: string) => {
    const url = URL.createObjectURL(file);
    const id = Date.now();
    setLastGenerated({ url, id }); // Also sync recorded voice to top button
    togglePlay(url, id); 
    alert(`Voice Pattern Detected: ${name}. Neural engine is now synced to this profile.`);
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    
    try {
      const response = await fetch("https://opensource-voice-ai.onrender.com/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, text })
      });

      if (!response.ok) throw new Error("Server Error");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const id = Date.now();
      
      // Set the last generated audio for the top control
      setLastGenerated({ url, id });
      togglePlay(url, id);

      setHistory([{ 
        text, 
        url, 
        id, 
        voiceName: config.voice,
        emotion: config.emotion 
      }, ...history]);

    } catch (err) {
      alert("Neural Link Interrupted. Ensure your Python server is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- LANDING PAGE RENDER ---
  // --- LANDING PAGE RENDER ---
  if (!isStarted) {
    return (
      <div className={`landing-wrapper black-bg ${isFading ? 'fade-out' : ''}`}>
        <div className="landing-content">
          <h1 className="landing-logo glow-text animate-float">
            Sentio <span className="logo-accent">AI</span>
          </h1>
          <p className="landing-subtext animate-reveal">
            The Future of Neural Voice Synthesis
          </p>
          <button 
            className="get-started-btn neural-pulse" 
            onClick={handleStart}
          >
            Get Started !!
          </button>
        </div>
        {/* Subtle background glow effect */}
        <div className="bg-glow-spot"></div>
      </div>
    );
  }
  return (
    <div className="app-container animate-fade-in">
      <h1 className="logo">
        Sentio <span className="ai-text">AI</span>
      </h1>

      <div className="main-grid">
        <div className="left-column">
          {/* 1. CORE INPUT SECTION */}
          <div className="glass-box input-section">
            <div className="header"><Mic2 size={16}/>Signal Input</div>
            <textarea 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              placeholder="Enter neural data..."
            />
            {/* Added Wrapper for dual controls */}
            <div className="gen-controls-wrapper" style={{ display: 'flex', gap: '12px', marginTop: '25px' }}>
              <button 
                className={`gen-btn ${isGenerating ? 'loading' : ''}`} 
                onClick={handleGenerate} 
                disabled={isGenerating}
                style={{ flex: 1, marginTop: 0 }}
              >
                {isGenerating ? "Synthesizing..." : "Generate Voice"}
              </button>

              {/* Top Play/Pause Toggle */}
              {lastGenerated && (
                <button 
                  onClick={() => togglePlay(lastGenerated.url, lastGenerated.id)}
                  className={`btn-circle large ${playingId === lastGenerated.id ? 'active-play' : 'blue'}`}
                  style={{ width: '76px', height: '76px', borderRadius: '22px', flexShrink: 0 }}
                >
                  {playingId === lastGenerated.id ? <Pause size={24}/> : <Play size={24}/>}
                </button>
              )}
            </div>
          </div>

          {/* 2. NEURAL OUTPUT SECTION */}
          <div className="glass-box output-section">
             <div className="header"><Sparkles size={16}/> Vocal Rendering</div>
             <div className="visualizer-container">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`wave-bar ${isGenerating || isRecording || playingId ? 'active' : ''}`}></div>
                ))}
             </div>
          </div>

          {/* 3. VOICE CLONE LAB */}
          <div className="glass-box cloner-section">
            <div className="header"><Mic size={16}/> Vocal Biometry</div>
            <div className="clone-controls">
              <button 
                className={`record-btn ${isRecording ? 'active' : ''}`} 
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? <StopCircle size={18}/> : <Mic size={18}/>}
                {isRecording ? "Stop & Sync" : "Record Voice"}
              </button>

              <label className="upload-btn">
                <Upload size={18} /> Upload Voice
                <input 
                  type="file" 
                  hidden 
                  accept="audio/*" 
                  onChange={(e) => e.target.files && handleAutoDetect(e.target.files[0], e.target.files[0].name)} 
                />
              </label>
            </div>
          </div>
        </div>

        <div className="glass-box config-section">
          <div className="header"><Settings2 size={16}/> Synthesis Config</div>
          <div className="controls">
            
            <label className="label">Linguistic Persona</label>
            <select 
              value={config.voice} 
              onChange={(e) => setConfig({...config, voice: e.target.value})}
              className="custom-select"
            >
              <optgroup label="English (Global)">
                <option value="Kore">Kore (US Male)</option>
                <option value="Jenny">Jenny (US Female)</option>
                <option value="Ryan">Ryan (UK Male)</option>
                <option value="Sonia">Sonia (UK Female)</option>
                <option value="Liam">Liam (Canada Male)</option>
                <option value="Natasha">Natasha (Australia Female)</option>
              </optgroup>

              <optgroup label="Indian (Regional)">
                <option value="Madhur">Madhur (Hindi Male)</option>
                <option value="Swara">Swara (Hindi Female)</option>
                <option value="Karthik">Karthik (Tamil Male)</option>
                <option value="Pallavi">Pallavi (Tamil Female)</option>
                <option value="Shruti">Shruti (Telugu Female)</option>
                <option value="Nirmala">Nirmala (Marathi Female)</option>
                <option value="Sagar">Sagar (Bengali Male)</option>
              </optgroup>

              <optgroup label="European">
                <option value="Remy">Remy (French Male)</option>
                <option value="Eloise">Eloise (French Female)</option>
                <option value="Alvaro">Alvaro (Spanish Male)</option>
                <option value="Elena">Elena (Spanish Female)</option>
                <option value="Lukas">Lukas (German Male)</option>
                <option value="Katrin">Katrin (German Female)</option>
                <option value="Bibi">Bibi (Italian Female)</option>
              </optgroup>

              <optgroup label="Asian & Middle East">
                <option value="Nanami">Nanami (Japanese Female)</option>
                <option value="Keita">Keita (Japanese Male)</option>
                <option value="Zhiyu">Zhiyu (Mandarin Female)</option>
                <option value="Sun-Hi">Sun-Hi (Korean Female)</option>
                <option value="Layla">Layla (Arabic Female)</option>
                <option value="Ali">Ali (Arabic Male)</option>
              </optgroup>

              <optgroup label="South American">
                <option value="Francisca">Francisca (Brazilian Portuguese)</option>
                <option value="Antonio">Antonio (Brazilian Portuguese)</option>
              </optgroup>
            </select>

            <label className="label">Emotion Engine</label>
            <select 
              className="custom-select" 
              value={config.emotion} 
              onChange={(e) => setConfig({...config, emotion: e.target.value})}
            >
              <option value="Neutral">Neutral</option>
              <option value="Cheerful">Cheerful</option>
              <option value="Angry">Angry</option>
              <option value="Sad">Sad</option>
              <option value="Excited">Excited</option>
              <option value="Whispering">Whispering</option>
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
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={16}/> Recent History
          </div>
          {history.length > 0 && (
            <button 
              onClick={() => {
                if(window.confirm("Purge all neural history?")) {
                  history.forEach(item => URL.revokeObjectURL(item.url));
                  setHistory([]);
                  setLastGenerated(null);
                }
              }}
              className="clean-history-btn"
              title="Clear History"
            >
              <span style={{ fontSize: '12px', marginRight: '6px' }}>Clear</span>
              <Trash2 size={14}/>
            </button>
          )}
        </div>

        <div className="history-grid">
          {history.map(item => (
            <div key={item.id} className="history-card">
              <div className="history-info">
                <p>"{item.text.substring(0, 50)}..."</p>
                <small>{item.voiceName} • {item.emotion}</small>
              </div>
              <div className="history-actions">
                <button 
                  onClick={() => togglePlay(item.url, item.id)} 
                  className={`btn-circle ${playingId === item.id ? 'active-play' : 'blue'}`}
                >
                  {playingId === item.id ? <Pause size={14}/> : <Play size={14}/>}
                </button>
                <a href={item.url} download="vox_ai.mp3" className="btn-circle blue"><Download size={14}/></a>
                <button 
                  onClick={() => {
                    URL.revokeObjectURL(item.url);
                    setHistory(history.filter(h => h.id !== item.id));
                  }} 
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