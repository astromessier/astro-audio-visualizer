
import React from 'react';
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const SettingsPanel = () => {
  return (
    <Card className="p-6 neo-morphism bg-astro-dark border-astro-grid animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Input Settings</h3>
          
          <div className="space-y-2">
            <Label htmlFor="input-device">Audio Input Device</Label>
            <Select defaultValue="default">
              <SelectTrigger id="input-device" className="bg-astro-dark border-astro-accent/30">
                <SelectValue placeholder="Select input device" />
              </SelectTrigger>
              <SelectContent className="bg-astro-dark border-astro-accent/30">
                <SelectItem value="default">Default Input Device</SelectItem>
                <SelectItem value="microphone">Internal Microphone</SelectItem>
                <SelectItem value="line-in">Line In</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sample-rate">Sample Rate</Label>
            <Select defaultValue="44100">
              <SelectTrigger id="sample-rate" className="bg-astro-dark border-astro-accent/30">
                <SelectValue placeholder="Select sample rate" />
              </SelectTrigger>
              <SelectContent className="bg-astro-dark border-astro-accent/30">
                <SelectItem value="8000">8,000 Hz</SelectItem>
                <SelectItem value="11025">11,025 Hz</SelectItem>
                <SelectItem value="22050">22,050 Hz</SelectItem>
                <SelectItem value="44100">44,100 Hz</SelectItem>
                <SelectItem value="48000">48,000 Hz</SelectItem>
                <SelectItem value="96000">96,000 Hz</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="buffer-size">Buffer Size</Label>
            <Select defaultValue="1024">
              <SelectTrigger id="buffer-size" className="bg-astro-dark border-astro-accent/30">
                <SelectValue placeholder="Select buffer size" />
              </SelectTrigger>
              <SelectContent className="bg-astro-dark border-astro-accent/30">
                <SelectItem value="256">256 samples</SelectItem>
                <SelectItem value="512">512 samples</SelectItem>
                <SelectItem value="1024">1024 samples</SelectItem>
                <SelectItem value="2048">2048 samples</SelectItem>
                <SelectItem value="4096">4096 samples</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Display Settings</h3>
          
          <div className="space-y-2">
            <Label htmlFor="refresh-rate">Refresh Rate</Label>
            <Slider 
              id="refresh-rate"
              defaultValue={[60]} 
              min={15} 
              max={120} 
              step={1}
              className="my-6"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>15 fps</span>
              <span>60 fps</span>
              <span>120 fps</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="grid-toggle" className="cursor-pointer">Show Grid Lines</Label>
              <Switch id="grid-toggle" defaultChecked />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="markers-toggle" className="cursor-pointer">Show Time/Frequency Markers</Label>
              <Switch id="markers-toggle" defaultChecked />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="baseline-toggle" className="cursor-pointer">Show Baseline</Label>
              <Switch id="baseline-toggle" defaultChecked />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Processing Settings</h3>
          
          <div className="space-y-2">
            <Label htmlFor="filter-type">Pre-Processing Filter</Label>
            <Select defaultValue="none">
              <SelectTrigger id="filter-type" className="bg-astro-dark border-astro-accent/30">
                <SelectValue placeholder="Select filter type" />
              </SelectTrigger>
              <SelectContent className="bg-astro-dark border-astro-accent/30">
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="lowpass">Low Pass</SelectItem>
                <SelectItem value="highpass">High Pass</SelectItem>
                <SelectItem value="bandpass">Band Pass</SelectItem>
                <SelectItem value="notch">Notch Filter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="smoothing">Smoothing</Label>
            <Slider 
              id="smoothing"
              defaultValue={[0.5]} 
              min={0} 
              max={1} 
              step={0.05}
              className="my-6"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>None</span>
              <span>Medium</span>
              <span>Maximum</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-gain-toggle" className="cursor-pointer">Auto Gain Control</Label>
              <Switch id="auto-gain-toggle" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="dc-offset-toggle" className="cursor-pointer">Remove DC Offset</Label>
              <Switch id="dc-offset-toggle" defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SettingsPanel;
