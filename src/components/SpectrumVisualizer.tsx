
import React, { useRef, useEffect } from 'react';

interface SpectrumVisualizerProps {
  audioData: Float32Array | null;
  isActive: boolean;
}

const SpectrumVisualizer: React.FC<SpectrumVisualizerProps> = ({ audioData, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !isActive) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match display size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    
    // Clear the canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    if (!audioData) {
      // Draw placeholder spectrum if no data
      const barWidth = rect.width / 64;
      const baseHeight = rect.height * 0.05;
      
      for (let i = 0; i < 64; i++) {
        const randomHeight = baseHeight + Math.random() * rect.height * 0.1;
        const x = i * barWidth;
        const y = rect.height - randomHeight;
        
        ctx.fillStyle = 'rgba(110, 89, 165, 0.3)';
        ctx.fillRect(x, y, barWidth - 1, randomHeight);
      }
      return;
    }
    
    // For a real spectrum analyzer, we would need to perform FFT
    // Here we'll simulate it by using the audio data directly
    const dataPoints = audioData.length;
    const barWidth = rect.width / Math.min(128, dataPoints);
    const samplingRate = 4; // Only use every Nth sample to reduce density
    
    // Create frequency bars
    for (let i = 0; i < dataPoints; i += samplingRate) {
      if (i >= 128 * samplingRate) break; // Limit to 128 bars
      
      const value = Math.abs(audioData[i]);
      const percent = value; // Amplitude as percentage (normally 0-1)
      const height = percent * rect.height * 1.5; // Scale for visibility
      const x = (i / samplingRate) * barWidth;
      const y = rect.height - height;
      
      // Apply gradient for spectrum bars
      const hue = 270 - (i / dataPoints) * 30; // Purple to blue-ish
      ctx.fillStyle = `hsla(${hue}, 70%, 65%, 0.9)`;
      
      ctx.fillRect(x, y, barWidth - 1, height);
    }
    
    // Add frequency markers
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'center';
    
    const frequencies = ['20Hz', '100Hz', '500Hz', '1kHz', '5kHz', '10kHz', '20kHz'];
    const positions = [0.05, 0.15, 0.30, 0.45, 0.65, 0.80, 0.95];
    
    positions.forEach((pos, i) => {
      const x = rect.width * pos;
      ctx.fillText(frequencies[i], x, rect.height - 5);
    });
    
    // Add amplitude scale
    ctx.textAlign = 'right';
    ctx.fillText('-60dB', rect.width - 10, rect.height - 20);
    ctx.fillText('-30dB', rect.width - 10, rect.height - rect.height / 3);
    ctx.fillText('0dB', rect.width - 10, 20);
    
  }, [audioData, isActive]);
  
  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="relative h-full w-full bg-astro-dark rounded-md overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="visualizer-canvas" 
      />
      {!audioData && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
          Begin recording to visualize frequency spectrum
        </div>
      )}
    </div>
  );
};

export default SpectrumVisualizer;
