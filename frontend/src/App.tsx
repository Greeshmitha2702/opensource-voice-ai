
import React, { useState, useRef } from 'react';
import { VoiceID, Emotion, GenerationConfig, AudioEntry, GenerationMetrics } from './types';
import { generateSpeech, audioBufferToWav } from './services/ttsService';
import AudioVisualizer from './components/AudioVisualizer';

const SUPPORTED_LANGUAGES = [
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
].sort((a, b) => a.name.localeCompare(b.name));

const App: React.FC = () => {
  const [text, setText] = useState('Welcome to VoxOpen AI. This platform is now running on a Python FastAPI backend with zero-cost neural synthesis.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState<(AudioEntry & { translatedText?: string })[]>([]);
  const [activeConfig, setActiveConfig] = useState<GenerationConfig>({
    voice: VoiceID.Kore,
    emotion: Emotion.Neutral,
    emotionIntensity: 0.5,
    speed: 1.0,
    pitch: 1.0,
    language: 'English'
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [lastBuffer, setLastBuffer] = useState<AudioBuffer | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<GenerationMetrics | null>(null);

  const initAudioContext = () => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    initAudioContext();
    setIsGenerating(true);
    try {
      const { buffer, metrics, translatedText } = await generateSpeech(text, activeConfig, audioContextRef.current!);
      setLastBuffer(buffer);
      setCurrentMetrics(metrics);
      const wavBlob = audioBufferToWav(buffer);
      const url = URL.createObjectURL(wavBlob);
      const newEntry: AudioEntry & { translatedText?: string } = {
        id: crypto.randomUUID(),
        text,
        translatedText,
        timestamp: Date.now(),
        url,
        config: { ...activeConfig },
        metrics
      };
      setHistory(prev => [newEntry, ...prev]);
      playBuffer(buffer, activeConfig);
    } catch (error: any) {
      alert(`Synthesis error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const playBuffer = (buffer: AudioBuffer, config: GenerationConfig) => {
    if (!audioContextRef.current) return;
    if (currentSourceRef.current) currentSourceRef.current.stop();
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = config.speed;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setIsPlaying(false);
    source.start(0);
    currentSourceRef.current = source;
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[1400px] mx-auto px-4 py-8 gap-8">
      <header className="flex justify-between items-center border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">VOXOPEN AI</h1>
        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-gray-900 px-4 py-2 rounded-full border border-gray-800">Cluster Status: Healthy</div>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 shadow-2xl">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-48 bg-black/50 border border-gray-700 rounded-2xl p-6 text-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Enter text for neural synthesis..."
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim()}
              className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? 'Synthesizing...' : 'Generate Voice'}
            </button>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Live Waveform</h3>
            <AudioVisualizer isPlaying={isPlaying} audioBuffer={lastBuffer} />
          </div>
        </section>
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Neural Config</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black block mb-3">Personality</label>
                <select 
                  value={activeConfig.voice} 
                  onChange={(e) => setActiveConfig(prev => ({ ...prev, voice: e.target.value as VoiceID }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm"
                >
                  {Object.values(VoiceID).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black block mb-3">Language</label>
                <select 
                  value={activeConfig.language} 
                  onChange={(e) => setActiveConfig(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm"
                >
                  {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.name}>{l.flag} {l.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 max-h-[400px] overflow-y-auto">
             <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">History</h3>
             {history.map(h => (
               <div key={h.id} className="p-4 bg-black/30 rounded-xl border border-gray-800 mb-4 text-xs">
                 <p className="text-gray-400 italic mb-2">"{h.text.substring(0, 50)}..."</p>
                 <button onClick={() => { fetch(h.url).then(r => r.arrayBuffer()).then(ab => audioContextRef.current!.decodeAudioData(ab)).then(b => playBuffer(b, h.config)) }} className="text-blue-400 font-bold hover:underline">Replay</button>
               </div>
             ))}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default App;
