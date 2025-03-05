import React, { useRef, useEffect, useState } from 'react';

interface TimeSeriesVisualizerProps {
  audioData: Float32Array | null;
  isActive: boolean;
}

const TimeSeriesVisualizer: React.FC<TimeSeriesVisualizerProps> = ({ audioData, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<number[]>([]);
  
  // Accumulate data for time series
  useEffect(() => {
    if (!audioData || !isActive) return;
    
    // Extract a single data point from the audio data
    // For time series, we often want to track a specific value over time
    const newDataPoint = audioData.reduce((sum, value) => sum + Math.abs(value), 0) / audioData.length;
    
    setTimeSeriesData(prev => {
      const newData = [...prev, newDataPoint];
      // Keep only the last 500 points to prevent unlimited growth
      if (newData.length > 500) {
        return newData.slice(newData.length - 500);
      }
      return newData;
    });
  }, [audioData, isActive]);
  
  // Draw the time series chart
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
    
    // Add grid
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    const yStep = rect.height / 10;
    for (let i = 0; i <= 10; i++) {
      const y = i * yStep;
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
    }
    
    // Vertical grid lines
    const timeMarkers = 12;
    const xStep = rect.width / timeMarkers;
    for (let i = 0; i <= timeMarkers; i++) {
      const x = i * xStep;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
    }
    
    ctx.stroke();
    
    // Draw baseline
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.moveTo(0, rect.height / 2);
    ctx.lineTo(rect.width, rect.height / 2);
    ctx.stroke();
    
    // Draw time labels
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'center';
    
    for (let i = 0; i <= timeMarkers; i++) {
      const x = i * xStep;
      const timeLabel = `${i * (60 / timeMarkers)}s`;
      ctx.fillText(timeLabel, x, rect.height - 5);
    }
    
    if (timeSeriesData.length < 2) {
      // Show placeholder if not enough data
      ctx.font = '14px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'center';
      ctx.fillText('Recording and accumulating data...', rect.width / 2, rect.height / 2);
      return;
    }
    
    // Find min and max values for scaling
    const maxValue = Math.max(...timeSeriesData, 0.01); // Avoid division by zero
    
    // Draw the time series line
    ctx.beginPath();
    
    const pointSpacing = rect.width / (timeSeriesData.length - 1);
    
    timeSeriesData.forEach((value, i) => {
      const x = i * pointSpacing;
      // Scale the value to fit in the canvas height
      const y = rect.height - (value / maxValue) * (rect.height * 0.8);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    // Apply gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, '#9b87f5');
    gradient.addColorStop(1, '#6E59A5');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Fill area under the curve
    ctx.lineTo(rect.width, rect.height);
    ctx.lineTo(0, rect.height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(110, 89, 165, 0.1)';
    ctx.fill();
    
    // Mark data points
    const pointInterval = Math.max(1, Math.floor(timeSeriesData.length / 50)); // Show max 50 points
    
    timeSeriesData.forEach((value, i) => {
      if (i % pointInterval === 0) {
        const x = i * pointSpacing;
        const y = rect.height - (value / maxValue) * (rect.height * 0.8);
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#9b87f5';
        ctx.fill();
      }
    });
    
  }, [timeSeriesData, isActive]);
  
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
      {timeSeriesData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
          Begin recording to start time series visualization
        </div>
      )}
    </div>
  );
};

export default TimeSeriesVisualizer;
