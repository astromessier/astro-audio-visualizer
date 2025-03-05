import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Waveform, Mic, Activity, Save, Play, Square, Settings, ChevronDown, ChevronUp } from "lucide-react";
import WaveformVisualizer from './WaveformVisualizer';
import SpectrumVisualizer from './SpectrumVisualizer';
import TimeSeriesVisualizer from './TimeSeriesVisualizer';
import SettingsPanel from './SettingsPanel';

const AudioVisualizer = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [visualizationType, setVisualizationType] = useState('waveform');
  const [timeScale, setTimeScale] = useState(1);
  const [gain, setGain] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [recordedData, setRecordedData] = useState<Float32Array[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Setup audio context and analyser
  useEffect(() => {
    if (isRecording && !audioContext) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);

      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
          const source = context.createMediaStreamSource(stream);
          const analyserNode = context.createAnalyser();
          analyserNode.fftSize = 2048;
          source.connect(analyserNode);
          setAnalyser(analyserNode);
        })
        .catch(err => {
          console.error("Error accessing audio device:", err);
          setIsRecording(false);
        });
    }
  }, [isRecording, audioContext]);

  // Process audio data
  useEffect(() => {
    if (!analyser || !isRecording) return;

    const dataArray = new Float32Array(analyser.frequencyBinCount);
    
    const updateData = () => {
      if (!isRecording || !analyser) return;
      
      // Get time domain data
      analyser.getFloatTimeDomainData(dataArray);
      
      // Apply gain
      const amplifiedData = dataArray.map(value => value * gain);
      setAudioData(new Float32Array(amplifiedData));
      
      // Save data if recording
      setRecordedData(prev => [...prev, new Float32Array(amplifiedData)]);
      
      requestAnimationFrame(updateData);
    };

    updateData();

    return () => {
      // Cleanup
    };
  }, [analyser, isRecording, gain]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedData([]);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (audioContext) {
      // Keep the context but stop recording
    }
  };

  const handleSaveRecording = () => {
    if (recordedData.length === 0) return;
    
    // Create a Blob with the recorded data
    const mergedArray = new Float32Array(recordedData.reduce((acc, curr) => acc + curr.length, 0));
    let offset = 0;
    
    recordedData.forEach(array => {
      mergedArray.set(array, offset);
      offset += array.length;
    });
    
    const blob = new Blob([mergedArray], { type: 'application/octet-stream' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Get current date and time for filename
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    link.href = url;
    link.download = `radio-astronomy-recording-${timestamp}.dat`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePlayback = () => {
    if (recordedData.length === 0) return;
    setIsPlaying(true);
    
    // Implement playback logic here
    // For simplicity, we'll just visualize the first chunk of recorded data
    if (recordedData.length > 0) {
      setAudioData(recordedData[0]);
    }
  };

  const handleStopPlayback = () => {
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-astro-accent-light animate-pulse-subtle" />
          <h1 className="text-2xl font-semibold tracking-tight">Radio Astronomy Visualizer</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {!isRecording && !isPlaying ? (
            <Button onClick={handleStartRecording} className="bg-astro-accent hover:bg-astro-accent-dark transition-colors duration-300">
              <Mic className="mr-2 h-4 w-4" />
              Start Recording
            </Button>
          ) : (
            <Button onClick={isRecording ? handleStopRecording : handleStopPlayback} variant="destructive" className="transition-colors duration-300">
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
          )}
          
          <Button onClick={handleSaveRecording} disabled={recordedData.length === 0} variant="outline" className="border-astro-accent text-astro-accent-light hover:bg-astro-accent/10 transition-colors duration-300">
            <Save className="mr-2 h-4 w-4" />
            Save Recording
          </Button>
          
          <Button onClick={isPlaying ? handleStopPlayback : handlePlayback} disabled={recordedData.length === 0} variant="outline" className="border-astro-accent text-astro-accent-light hover:bg-astro-accent/10 transition-colors duration-300">
            {isPlaying ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isPlaying ? "Stop Playback" : "Play Recording"}
          </Button>
          
          <Button 
            onClick={() => setShowSettings(!showSettings)} 
            variant="ghost" 
            className="hover:bg-astro-accent/10 transition-colors duration-300"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
            {showSettings ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {showSettings && (
        <SettingsPanel />
      )}
      
      <Card className="flex-1 overflow-hidden neo-morphism bg-astro-dark border-astro-grid p-1">
        <Tabs defaultValue="waveform" onValueChange={setVisualizationType} className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="grid grid-cols-3 bg-astro-dark">
              <TabsTrigger value="waveform" className="data-[state=active]:bg-astro-accent data-[state=active]:text-white transition-all duration-300">
                <Waveform className="mr-2 h-4 w-4" />
                Waveform
              </TabsTrigger>
              <TabsTrigger value="spectrum" className="data-[state=active]:bg-astro-accent data-[state=active]:text-white transition-all duration-300">
                <Activity className="mr-2 h-4 w-4" />
                Spectrum
              </TabsTrigger>
              <TabsTrigger value="timeSeries" className="data-[state=active]:bg-astro-accent data-[state=active]:text-white transition-all duration-300">
                <Waveform className="mr-2 h-4 w-4" />
                Time Series
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 p-4">
            <TabsContent value="waveform" className="h-full animate-slide-up">
              <WaveformVisualizer audioData={audioData} isActive={visualizationType === 'waveform'} />
            </TabsContent>
            
            <TabsContent value="spectrum" className="h-full animate-slide-up">
              <SpectrumVisualizer audioData={audioData} isActive={visualizationType === 'spectrum'} />
            </TabsContent>
            
            <TabsContent value="timeSeries" className="h-full animate-slide-up">
              <TimeSeriesVisualizer audioData={audioData} isActive={visualizationType === 'timeSeries'} />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 neo-morphism bg-astro-dark border-astro-grid">
          <h3 className="text-sm font-medium mb-2">Time Scale</h3>
          <Slider 
            value={[timeScale]} 
            min={0.1} 
            max={5} 
            step={0.1} 
            onValueChange={(value) => setTimeScale(value[0])}
            className="my-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Compressed</span>
            <span>Normal</span>
            <span>Expanded</span>
          </div>
        </Card>
        
        <Card className="p-4 neo-morphism bg-astro-dark border-astro-grid">
          <h3 className="text-sm font-medium mb-2">Gain / Sensitivity</h3>
          <Slider 
            value={[gain]} 
            min={0.1} 
            max={10} 
            step={0.1} 
            onValueChange={(value) => setGain(value[0])}
            className="my-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AudioVisualizer;
