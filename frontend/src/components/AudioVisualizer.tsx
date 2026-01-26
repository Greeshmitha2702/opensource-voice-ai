
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps { isPlaying: boolean; audioBuffer: AudioBuffer | null; }

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying, audioBuffer }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;

      if (isPlaying) {
        for (let x = 0; x < width; x += 2) {
          const t = Date.now() / 200;
          const y = centerY + Math.sin(x * 0.05 + t) * (height / 4) * Math.sin(t * 0.5);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
      } else {
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
      }
      ctx.stroke();
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, audioBuffer]);

  return (
    <div className="w-full h-24 bg-black/50 rounded-xl overflow-hidden border border-gray-800">
      <canvas ref={canvasRef} width={800} height={96} className="w-full h-full block" />
    </div>
  );
};

export default AudioVisualizer;
