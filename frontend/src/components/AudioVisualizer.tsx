import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioBuffer: AudioBuffer | null;
}

const AudioVisualizer = ({
  isPlaying,
  audioBuffer,
}: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerY = canvas.height / 2;

      // Create a premium gradient for the wave
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#3b82f6'); // Blue
      gradient.addColorStop(1, '#a855f7'); // Purple

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      if (isPlaying) {
        // Create a dynamic "Siri-style" wave
        for (let x = 0; x < canvas.width; x += 5) {
          const t = Date.now() / 150;
          const amplitude = (canvas.height / 3);
          const y = centerY + Math.sin(x * 0.02 + t) * amplitude * Math.cos(t * 0.3);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else {
        // Flat line when idle
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
      }

      ctx.stroke();
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, audioBuffer]);

  return (
    <div className="w-full h-32 bg-black/40 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-sm">
      <canvas
        ref={canvasRef}
        width={800}
        height={128}
        className="w-full h-full block"
      />
    </div>
  );
};

// This line is what was missing!
export default AudioVisualizer;