
import React, { useRef, useEffect, useState } from 'react';

interface SpectrographVisualizerProps {
  audioData: Float32Array | null;
  isActive: boolean;
}

const SpectrographVisualizer: React.FC<SpectrographVisualizerProps> = ({ audioData, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spectrumHistory, setSpectrumHistory] = useState<Uint8Array[]>([]);
  const historyLengthRef = useRef(300); // Keep 5 minutes at 1 scan per second
  
  // Process incoming audio data to frequency domain
  useEffect(() => {
    if (!audioData || !isActive) return;
    
    // Convert time domain data to frequency domain (simplified FFT simulation)
    const processSpectrum = () => {
      // In a real implementation, we would use FFT to get the frequency spectrum
      // For this simulation, we'll create a simplified frequency representation
      
      // Create a buffer with 256 frequency bins
      const spectrumBuffer = new Uint8Array(256);
      
      // Fill with simulated frequency data based on the audio waveform
      for (let i = 0; i < 256; i++) {
        // Create different intensity patterns across the frequency range
        const sampleIndex = Math.floor(i / 256 * audioData.length);
        if (sampleIndex < audioData.length) {
          // Convert audio amplitude to intensity value (0-255)
          const intensity = Math.min(255, Math.max(0, 
            Math.abs(audioData[sampleIndex]) * 1000));
          spectrumBuffer[i] = intensity;
        }
      }
      
      // Add to history with newest at the beginning
      setSpectrumHistory(prev => {
        const newHistory = [spectrumBuffer, ...prev];
        // Limit history length
        if (newHistory.length > historyLengthRef.current) {
          return newHistory.slice(0, historyLengthRef.current);
        }
        return newHistory;
      });
    };
    
    processSpectrum();
  }, [audioData, isActive]);
  
  // Draw the spectrograph visualization
  useEffect(() => {
    if (!canvasRef.current || !isActive) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw two views: short-term and long-term (as described in Radio-Sky Spectrograph)
    
    // First view - short-term (1 minute)
    const shortTermHeight = rect.height * 0.4;
    const shortTermHistory = spectrumHistory.slice(0, 60); // Last minute (60 seconds)
    
    // Second view - long-term (5 minutes)
    const longTermHistory = spectrumHistory; // All history, up to 5 minutes
    const longTermHeight = rect.height * 0.55;
    const longTermY = shortTermHeight + rect.height * 0.05; // 5% spacing
    
    // Draw both views
    drawSpectrograph(ctx, shortTermHistory, 0, 0, rect.width, shortTermHeight);
    drawSpectrograph(ctx, longTermHistory, 0, longTermY, rect.width, longTermHeight);
    
    // Draw labels and division
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px sans-serif';
    ctx.fillText('Last Minute', 10, 15);
    ctx.fillText('Last 5 Minutes', 10, longTermY + 15);
    
    // Draw dividing line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, shortTermHeight + rect.height * 0.025);
    ctx.lineTo(rect.width, shortTermHeight + rect.height * 0.025);
    ctx.stroke();
    
    // Draw frequency scale (y-axis)
    drawFrequencyScale(ctx, 0, 0, rect.width, shortTermHeight);
    drawFrequencyScale(ctx, 0, longTermY, rect.width, longTermHeight);
    
    function drawSpectrograph(
      context: CanvasRenderingContext2D, 
      history: Uint8Array[], 
      x: number, 
      y: number, 
      width: number, 
      height: number
    ) {
      if (history.length === 0) {
        // Show placeholder if no data
        context.fillStyle = 'rgba(255, 255, 255, 0.5)';
        context.textAlign = 'center';
        context.fillText(
          'Recording data to build spectrograph...', 
          x + width / 2, 
          y + height / 2
        );
        return;
      }
      
      // Calculate dimensions for each time slice
      const sliceWidth = width / history.length;
      
      // Draw each slice of history
      history.forEach((spectrum, timeIndex) => {
        const posX = x + timeIndex * sliceWidth;
        
        // Draw each frequency bin in this time slice
        for (let freqIndex = 0; freqIndex < spectrum.length; freqIndex++) {
          // Invert to draw high frequency at top (as described in requirements)
          const normalizedFreq = 1 - (freqIndex / spectrum.length);
          const posY = y + normalizedFreq * height;
          
          // Get intensity value and convert to color
          const intensity = spectrum[freqIndex];
          
          // Create color gradient from black-blue-purple-red-yellow-white
          let r, g, b;
          if (intensity < 40) {
            // Black to blue
            r = 0;
            g = 0;
            b = intensity * 6;
          } else if (intensity < 80) {
            // Blue to purple
            r = (intensity - 40) * 6;
            g = 0;
            b = 255;
          } else if (intensity < 120) {
            // Purple to red
            r = 255;
            g = 0;
            b = 255 - (intensity - 80) * 6;
          } else if (intensity < 160) {
            // Red to yellow
            r = 255;
            g = (intensity - 120) * 6;
            b = 0;
          } else if (intensity < 200) {
            // Yellow to white
            r = 255;
            g = 255;
            b = (intensity - 160) * 6;
          } else {
            // White (saturation)
            r = 255;
            g = 255;
            b = 255;
          }
          
          context.fillStyle = `rgb(${r}, ${g}, ${b})`;
          
          // Draw a small rectangle for this frequency/time bin
          context.fillRect(posX, posY, sliceWidth + 0.5, height / spectrum.length + 0.5);
        }
      });
    }
    
    function drawFrequencyScale(
      context: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      width: number, 
      height: number
    ) {
      // Draw frequency labels
      context.fillStyle = 'rgba(255, 255, 255, 0.5)';
      context.font = '10px sans-serif';
      context.textAlign = 'right';
      
      const frequencies = ['24 MHz', '18 MHz', '12 MHz', '6 MHz', '0 MHz'];
      const positions = [0.1, 0.3, 0.5, 0.7, 0.9];
      
      positions.forEach((pos, i) => {
        const labelY = y + pos * height;
        context.fillText(frequencies[i], width - 10, labelY);
        
        // Draw tick mark
        context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        context.beginPath();
        context.moveTo(width - 30, labelY);
        context.lineTo(width - 25, labelY);
        context.stroke();
      });
    }
    
  }, [spectrumHistory, isActive]);
  
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
      {spectrumHistory.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
          Begin recording to build spectrograph visualization
        </div>
      )}
    </div>
  );
};

export default SpectrographVisualizer;
