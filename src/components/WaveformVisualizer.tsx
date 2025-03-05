
import React, { useRef, useEffect } from 'react';

interface WaveformVisualizerProps {
  audioData: Float32Array | null;
  isActive: boolean;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ audioData, isActive }) => {
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
      // Draw placeholder waveform if no data
      ctx.beginPath();
      ctx.moveTo(0, rect.height / 2);
      
      for (let i = 0; i < rect.width; i++) {
        const y = rect.height / 2 + Math.sin(i * 0.05) * 5;
        ctx.lineTo(i, y);
      }
      
      ctx.strokeStyle = 'rgba(110, 89, 165, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      return;
    }
    
    // Draw waveform
    ctx.beginPath();
    
    const sliceWidth = rect.width / audioData.length;
    let x = 0;
    
    for (let i = 0; i < audioData.length; i++) {
      const v = audioData[i];
      const y = (v + 1) / 2 * rect.height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    // Apply gradient for waveform
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, '#9b87f5');
    gradient.addColorStop(1, '#6E59A5');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Add grid lines
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    const stepSize = rect.height / 10;
    for (let i = 0; i <= 10; i++) {
      const y = i * stepSize;
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
    }
    
    // Vertical grid lines
    const vStepSize = rect.width / 20;
    for (let i = 0; i <= 20; i++) {
      const x = i * vStepSize;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
    }
    
    ctx.stroke();
    
    // Add center line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.moveTo(0, rect.height / 2);
    ctx.lineTo(rect.width, rect.height / 2);
    ctx.stroke();
    
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
          Begin recording to visualize audio input
        </div>
      )}
    </div>
  );
};

export default WaveformVisualizer;
