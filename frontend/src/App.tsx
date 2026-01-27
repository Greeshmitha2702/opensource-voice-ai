import { useRef, useState } from "react";
import { VoiceID, Emotion } from "./types";
import { generateSpeech } from "./services/ttsService";
import AudioVisualizer from "./components/AudioVisualizer";

const App = () => {
  const [text, setText] = useState("Welcome to VoxOpen AI");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

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
          language: "English",
        },
        audioContextRef.current
      );

      setAudioBuffer(buffer); // store it

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start();
      setIsPlaying(true);
      source.onended = () => setIsPlaying(false);
    } catch (err) {
      alert("TTS failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>VoxOpen AI</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        style={{ width: "100%" }}
      />
      <br />
      <button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? "Generating..." : "Generate Voice"}
      </button>

      <AudioVisualizer 
        isPlaying={isPlaying} 
        audioBuffer={audioBuffer} 
      />
    </div>
  );
};

export default App;
