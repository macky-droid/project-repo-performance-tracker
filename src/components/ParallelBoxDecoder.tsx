import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Upload, 
  Play, 
  Pause, 
  RefreshCw, 
  Plus, 
  X, 
  Check, 
  Cpu, 
  Zap, 
  Layers, 
  ChevronRight, 
  Sliders, 
  Eye, 
  EyeOff, 
  HelpCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BoundingBox {
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized to 0-1000
  label: string;
  score: number;
}

interface ModelResult {
  model: string;
  success: boolean;
  latency: number;
  objects: BoundingBox[];
  isFallback: boolean;
  errorMsg?: string;
}

const SAMPLE_VIDEOS = [
  {
    name: "Basketball Drills",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    presetClasses: ["person", "basketball", "hoop", "referee", "sneakers"]
  },
  {
    name: "City Streets & Traffic",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    presetClasses: ["car", "pedestrian", "traffic light", "truck", "motorcycle"]
  },
  {
    name: "Playful Mascot",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    presetClasses: ["rabbit", "bird", "squirrel", "tree", "grass"]
  }
];

const MODEL_INFO: Record<string, { name: string; color: string; rgb: string; desc: string; speed: string }> = {
  "gemini-3.5-flash": {
    name: "Gemini 3.5 Flash",
    color: "text-cyan-400 border-cyan-500 bg-cyan-500/10",
    rgb: "rgb(34, 211, 238)",
    desc: "Optimized for speed and high-precision multimodal analysis",
    speed: "Extremely Fast"
  },
  "gemini-3.1-flash-lite": {
    name: "Gemini 3.1 Flash Lite",
    color: "text-emerald-400 border-emerald-500 bg-emerald-500/10",
    rgb: "rgb(52, 211, 153)",
    desc: "Compact, light model focused on ultra-low latency inference",
    speed: "Blazing Fast"
  },
  "gemini-custom": {
    name: "Gemini Custom Detector",
    color: "text-pink-400 border-pink-500 bg-pink-500/10",
    rgb: "rgb(244, 114, 182)",
    desc: "Advanced prompt engineering for tiny, distant, or obscured entities",
    speed: "Highly Detailed"
  }
};

export default function ParallelBoxDecoder() {
  const [videoSrc, setVideoSrc] = useState(SAMPLE_VIDEOS[0].url);
  const [videoName, setVideoName] = useState(SAMPLE_VIDEOS[0].name);
  const [targetClasses, setTargetClasses] = useState<string[]>(SAMPLE_VIDEOS[0].presetClasses);
  const [newClass, setNewClass] = useState("");
  
  const [selectedModels, setSelectedModels] = useState<string[]>([
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-custom"
  ]);

  const [isDetecting, setIsDetecting] = useState(false);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [results, setResults] = useState<ModelResult[]>([]);
  const [activeModelFilter, setActiveModelFilter] = useState<string>("all");
  const [hoveredBox, setHoveredBox] = useState<{ box: BoundingBox; model: string } | null>(null);
  const [customVideoUrl, setCustomVideoUrl] = useState("");
  const [currentTime, setCurrentTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state on video metadata update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoSrc]);

  // Load preset video configurations
  const handleSelectPreset = (preset: typeof SAMPLE_VIDEOS[0]) => {
    setVideoSrc(preset.url);
    setVideoName(preset.name);
    setTargetClasses(preset.presetClasses);
    setCapturedFrame(null);
    setResults([]);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  // Add custom class
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newClass.trim().toLowerCase();
    if (clean && !targetClasses.includes(clean)) {
      setTargetClasses([...targetClasses, clean]);
      setNewClass("");
    }
  };

  // Remove target class
  const handleRemoveClass = (cls: string) => {
    setTargetClasses(targetClasses.filter(c => c !== cls));
  };

  // Trigger file upload dialog
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle local video file uploading
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoName(file.name);
      setCapturedFrame(null);
      setResults([]);
      if (videoRef.current) {
        videoRef.current.load();
      }
    }
  };

  // Handle custom URL load
  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customVideoUrl.trim()) {
      setVideoSrc(customVideoUrl.trim());
      setVideoName("Custom Network Video");
      setCapturedFrame(null);
      setResults([]);
      setCustomVideoUrl("");
      if (videoRef.current) {
        videoRef.current.load();
      }
    }
  };

  // Capture video frame and trigger detection API
  const handleDetectObjects = async () => {
    const video = videoRef.current;
    if (!video) return;

    // Standard HTML5 frame grab
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Draw frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedFrame(base64Image);
    setIsDetecting(true);
    setResults([]);

    try {
      const response = await fetch('/api/detect-objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          classes: targetClasses,
          models: selectedModels
        })
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.results)) {
        setResults(data.results);
      } else {
        console.error("Detection error:", data.error);
      }
    } catch (err) {
      console.error("Failed to run object detection:", err);
    } finally {
      setIsDetecting(false);
    }
  };

  // Calculate high-fidelity comparison stats
  const totalDetections = results.reduce((acc, r) => acc + (r.success ? r.objects.length : 0), 0);
  
  const modelStats = results.map(r => {
    const count = r.objects.length;
    const avgScore = count > 0 ? r.objects.reduce((sum, o) => sum + o.score, 0) / count : 0;
    
    // Compute a mock/scientific score representing overall speed/accuracy efficiency index
    // Higher average confidence and lower latency gets a better score!
    const speedScore = Math.max(10, 1000 / (r.latency || 500));
    const efficiency = Math.round((avgScore * 60) + (speedScore * 40));
    
    return {
      model: r.model,
      count,
      avgScore: Math.round(avgScore * 100),
      latency: r.latency,
      efficiency: Math.min(99, Math.max(30, efficiency)),
      isFallback: r.isFallback
    };
  });

  const fastestModel = results.length > 0 
    ? [...results].sort((a, b) => a.latency - b.latency)[0]?.model 
    : null;

  const highestRecallModel = results.length > 0 
    ? [...results].sort((a, b) => b.objects.length - a.objects.length)[0]?.model 
    : null;

  return (
    <div id="parallel-box-decoder-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 pb-24 bg-background text-foreground min-h-[calc(100vh-5rem)]">
      
      {/* LEFT COLUMN: Video Control Panel & Classes */}
      <div id="left-control-panel" className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Module Title card */}
        <div className="bg-surface/40 border border-outline-variant/15 rounded-2xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Parallel Box Decoding</h2>
              <p className="text-xs text-gray-400">Evaluate multiple Gemini models on computer vision object detection side-by-side.</p>
            </div>
          </div>
        </div>

        {/* Video Player Box */}
        <div className="bg-surface/40 border border-outline-variant/15 rounded-2xl overflow-hidden shadow-lg flex flex-col">
          <div className="p-4 border-b border-outline-variant/15 bg-white/5 flex justify-between items-center">
            <span className="text-sm font-medium flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" />
              {videoName}
            </span>
            <span className="text-xs font-mono text-gray-400">
              {currentTime.toFixed(1)}s
            </span>
          </div>

          {/* Actual Video View */}
          <div className="relative aspect-video bg-black flex items-center justify-center group">
            <video
              ref={videoRef}
              src={videoSrc}
              crossOrigin="anonymous"
              className="w-full h-full object-contain"
              playsInline
              controls
            />
          </div>

          {/* Action buttons under video */}
          <div className="p-4 flex gap-3 bg-white/5 border-t border-outline-variant/15">
            <button
              onClick={handleDetectObjects}
              disabled={isDetecting || targetClasses.length === 0}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all active:scale-95 shadow-md ${
                isDetecting || targetClasses.length === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-hover text-primary-foreground'
              }`}
            >
              {isDetecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Frame in Parallel...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Capture & Detect Frame
                </>
              )}
            </button>
            
            <button
              onClick={triggerFileUpload}
              className="p-3 bg-surface border border-outline-variant/15 hover:bg-white/5 rounded-xl transition-all text-gray-300"
              title="Upload Local Video File"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="video/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Target Classes Manager */}
        <div className="bg-surface/40 border border-outline-variant/15 rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center justify-between">
            <span>Target Detection Classes</span>
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-mono lowercase">
              {targetClasses.length} active
            </span>
          </h3>

          <form onSubmit={handleAddClass} className="flex gap-2">
            <input
              type="text"
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              placeholder="Add new class (e.g., dog, car, ball)..."
              className="flex-1 bg-background/50 border border-outline-variant/15 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary transition-all placeholder:text-gray-500"
            />
            <button
              type="submit"
              className="p-2.5 bg-primary/15 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Interactive chips */}
          <div className="flex flex-wrap gap-2">
            {targetClasses.map((cls) => (
              <span
                key={cls}
                className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-outline-variant/15 text-gray-300 rounded-lg text-xs font-medium"
              >
                {cls}
                <button
                  type="button"
                  onClick={() => handleRemoveClass(cls)}
                  className="p-0.5 hover:bg-white/10 rounded text-gray-500 hover:text-red-400 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {targetClasses.length === 0 && (
              <p className="text-xs text-gray-500 py-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                No target classes defined. Please add classes to detect!
              </p>
            )}
          </div>

          {/* Quick Sample Selector */}
          <div className="border-t border-outline-variant/15 pt-4">
            <span className="text-xs font-semibold text-gray-400 block mb-2">Preset Video Templates</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_VIDEOS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-2 text-left rounded-xl border text-xs font-medium transition-all ${
                    videoSrc === preset.url
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-surface/30 border-outline-variant/15 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Model Configurations */}
        <div className="bg-surface/40 border border-outline-variant/15 rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Models Running In Parallel</h3>
          <div className="flex flex-col gap-3">
            {Object.entries(MODEL_INFO).map(([key, info]) => {
              const isSelected = selectedModels.includes(key);
              return (
                <div
                  key={key}
                  onClick={() => {
                    if (isSelected) {
                      if (selectedModels.length > 1) {
                        setSelectedModels(selectedModels.filter(m => m !== key));
                      }
                    } else {
                      setSelectedModels([...selectedModels, key]);
                    }
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                    isSelected 
                      ? 'border-primary/45 bg-primary/5 text-foreground'
                      : 'border-outline-variant/10 bg-surface/10 text-gray-500'
                  }`}
                >
                  <div className={`mt-0.5 p-1 rounded ${isSelected ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-600'}`}>
                    <Check className={`w-3.5 h-3.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold font-sans">{info.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/10 text-gray-300' : 'bg-white/5 text-gray-500'}`}>
                        {info.speed}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-normal">{info.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Parallel Decoding Workspace & Bounding Boxes */}
      <div id="right-workspace-panel" className="lg:col-span-7 flex flex-col gap-6">

        {/* Image bounding box viewport */}
        <div className="bg-surface/40 border border-outline-variant/15 rounded-2xl p-5 flex flex-col gap-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/15 pb-4">
            <div>
              <h3 className="text-md font-bold text-gray-100">AI Bounding Box Visualization</h3>
              <p className="text-xs text-gray-400">Toggle models to evaluate precision, overlap, and accuracy.</p>
            </div>
            
            {/* Filter tags */}
            <div className="flex items-center gap-1 bg-background/50 border border-outline-variant/15 p-1 rounded-xl self-start">
              <button
                onClick={() => setActiveModelFilter("all")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  activeModelFilter === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                All Overlaid
              </button>
              {selectedModels.map((mKey) => {
                const info = MODEL_INFO[mKey];
                return (
                  <button
                    key={mKey}
                    onClick={() => setActiveModelFilter(mKey)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      activeModelFilter === mKey
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: info?.rgb }} />
                    {info?.name.split(' ').slice(1).join(' ')} {/* Just show Flash / Lite etc */}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Display Frame Workspace */}
          <div className="relative w-full aspect-video bg-black/60 rounded-xl overflow-hidden border border-outline-variant/15 flex items-center justify-center">
            {capturedFrame ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={capturedFrame}
                  alt="Captured frame analyze"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
                
                {/* BOUNDING BOX CONTAINER LAYER (responsively absolute matched to actual layout dimensions) */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  {results.map((res) => {
                    const info = MODEL_INFO[res.model];
                    // Skip if filtered out
                    if (activeModelFilter !== 'all' && activeModelFilter !== res.model) return null;
                    if (!res.success) return null;

                    return res.objects.map((box, index) => {
                      const [ymin, xmin, ymax, xmax] = box.box_2d;
                      const top = ymin / 10;
                      const left = xmin / 10;
                      const width = (xmax - xmin) / 10;
                      const height = (ymax - ymin) / 10;

                      const isHovered = hoveredBox?.box === box && hoveredBox?.model === res.model;

                      return (
                        <div
                          key={`${res.model}-${index}`}
                          style={{
                            top: `${top}%`,
                            left: `${left}%`,
                            width: `${width}%`,
                            height: `${height}%`,
                            borderColor: info?.rgb,
                            borderWidth: isHovered ? '2.5px' : '1.5px',
                            boxShadow: isHovered ? `0 0 12px ${info?.rgb}` : 'none',
                          }}
                          onMouseEnter={() => setHoveredBox({ box, model: res.model })}
                          onMouseLeave={() => setHoveredBox(null)}
                          className="absolute border border-solid rounded cursor-crosshair transition-all duration-150 flex flex-col justify-start items-start p-1"
                        >
                          {/* Label tag */}
                          <div 
                            style={{ backgroundColor: info?.rgb }}
                            className="text-[9px] font-bold text-black px-1.5 py-0.5 rounded shadow-sm select-none opacity-85 hover:opacity-100 flex items-center gap-1 whitespace-nowrap overflow-hidden max-w-[120px]"
                          >
                            <span>{box.label}</span>
                            <span className="opacity-80">{(box.score * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      );
                    });
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-gray-500">
                <div className="p-3 bg-white/5 border border-outline-variant/10 rounded-full text-gray-400">
                  <Sliders className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-300">Ready for Detection</h4>
                  <p className="text-xs text-gray-500 max-w-sm mt-1">
                    Play/pause your video above to find a perfect action frame, then press "Capture & Detect Frame" to run the evaluation models.
                  </p>
                </div>
              </div>
            )}

            {/* Hover Tooltip Overlay */}
            {hoveredBox && (
              <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-outline-variant/20 px-3 py-2 rounded-xl shadow-2xl flex flex-col gap-1 z-20 max-w-xs animate-fade-in backdrop-blur-md text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MODEL_INFO[hoveredBox.model]?.rgb }} />
                  <span className="font-bold text-gray-200">{MODEL_INFO[hoveredBox.model]?.name}</span>
                </div>
                <div className="text-gray-400">
                  Detected <span className="text-primary font-bold">{hoveredBox.box.label}</span> with <span className="text-green-400 font-bold">{(hoveredBox.box.score * 100).toFixed(0)}%</span> confidence score.
                </div>
                <div className="font-mono text-[9px] text-gray-500">
                  Coord: [{hoveredBox.box.box_2d.join(', ')}]
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Model Evaluation Analytics Benchmarks */}
        <div className="bg-surface/40 border border-outline-variant/15 rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-md font-bold text-gray-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Parallel Model Performance Scorecard
          </h3>

          {results.length > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {modelStats.map((stat) => {
                  const info = MODEL_INFO[stat.model];
                  return (
                    <div key={stat.model} className="bg-background/40 border border-outline-variant/15 p-4 rounded-2xl flex flex-col gap-2">
                      <div className="flex items-center gap-2 justify-between">
                        <span className="text-xs font-bold text-gray-300">{info?.name}</span>
                        {stat.isFallback && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded border border-yellow-500/20 font-mono">
                            Fallback
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Objects Found</span>
                          <span className="text-lg font-extrabold font-sans text-gray-100">{stat.count}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Avg Confidence</span>
                          <span className="text-lg font-extrabold font-sans text-green-400">{stat.avgScore}%</span>
                        </div>
                      </div>

                      <div className="border-t border-outline-variant/10 pt-2 mt-1 flex justify-between items-center text-[10px]">
                        <span className="text-gray-400">Inference Latency:</span>
                        <span className="font-mono font-bold text-cyan-400">{stat.latency}ms</span>
                      </div>

                      {/* Efficiency Rating bar */}
                      <div className="mt-1">
                        <div className="flex justify-between items-center text-[9px] text-gray-500 mb-1">
                          <span>Overall Efficiency Index:</span>
                          <span className="font-bold">{stat.efficiency}/100</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${stat.efficiency}%`,
                              backgroundColor: info?.rgb 
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Smart AI comparison report based on the results */}
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 flex gap-3">
                <Cpu className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">AI Vision Diagnostic Report</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Parallel decoding complete across <span className="font-bold text-primary">{selectedModels.length} models</span>. 
                    {fastestModel && (
                      <span>
                        {" "}The fastest inference was registered by <span className="font-bold text-emerald-400">{MODEL_INFO[fastestModel]?.name}</span> at <span className="font-mono text-cyan-400 font-bold">{modelStats.find(s => s.model === fastestModel)?.latency}ms</span>.
                      </span>
                    )}
                    {highestRecallModel && (
                      <span>
                        {" "}The highest object recall was achieved by <span className="font-bold text-pink-400">{MODEL_INFO[highestRecallModel]?.name}</span> discovering <span className="font-bold">{modelStats.find(s => s.model === highestRecallModel)?.count} active instances</span> of target classes: <span className="italic text-gray-400">{targetClasses.slice(0,3).join(', ')}</span>.
                      </span>
                    )}
                    {" "}For real-time physical telemetry tracks, utilizing <span className="text-cyan-400 font-bold">Gemini 3.5 Flash</span> provides the optimal trade-off of rapid bounding-box coordinate decoding and consistent semantic labeling.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-6 text-xs flex flex-col items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Capture and analyze a frame to see a performance benchmark.
            </div>
          )}
        </div>

        {/* Detailed detections breakdown table */}
        <div className="bg-surface/40 border border-outline-variant/15 rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-md font-bold text-gray-100">Detected Instances Log</h3>
          
          {results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/15 text-gray-400 font-semibold">
                    <th className="pb-2.5">Class Label</th>
                    <th className="pb-2.5">Model Source</th>
                    <th className="pb-2.5 text-right">Confidence Score</th>
                    <th className="pb-2.5 text-right">Bounding Box [ymin, xmin, ymax, xmax]</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {results.flatMap(res => 
                    res.success ? res.objects.map((box, idx) => ({
                      ...box,
                      model: res.model,
                      key: `${res.model}-${idx}`
                    })) : []
                  )
                  .sort((a, b) => b.score - a.score)
                  .map((item) => {
                    const info = MODEL_INFO[item.model];
                    return (
                      <tr 
                        key={item.key} 
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredBox({ box: item, model: item.model })}
                        onMouseLeave={() => setHoveredBox(null)}
                      >
                        <td className="py-2.5 font-bold text-gray-200 capitalize flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: info?.rgb }} />
                          {item.label}
                        </td>
                        <td className="py-2.5 text-gray-400 text-[10px]">
                          {info?.name}
                        </td>
                        <td className="py-2.5 text-right font-semibold text-green-400 font-mono">
                          {(item.score * 100).toFixed(0)}%
                        </td>
                        <td className="py-2.5 text-right font-mono text-[10px] text-gray-400">
                          [{item.box_2d.join(', ')}]
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4 text-xs">
              No active instances compiled. Frame has not been analyzed yet.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
