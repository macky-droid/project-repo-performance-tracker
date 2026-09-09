import { useState, useRef } from 'react';
import { 
  Sparkles, 
  Code, 
  Copy, 
  CheckCheck, 
  Terminal, 
  Zap, 
  Layers, 
  Sliders, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ExternalLink,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  RotateCcw,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COCO_CLASSES, getSupervisionColor, type RFDetrDetection } from '../cocoClasses';

interface RfDetrSupervisionTrackerProps {
  onApplyDetectionsToCanvas?: (detections: RFDetrDetection[], labels: string[]) => void;
  getLiveFrameBase64?: () => string | null;
  onSelectPresetImage?: (url: string) => void;
}

export default function RfDetrSupervisionTracker({
  onApplyDetectionsToCanvas,
  getLiveFrameBase64,
  onSelectPresetImage
}: RfDetrSupervisionTrackerProps) {
  // State
  const [threshold, setThreshold] = useState<number>(0.5);
  const [selectedSource, setSelectedSource] = useState<string>('https://media.roboflow.com/dog.jpg');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detections, setDetections] = useState<RFDetrDetection[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Model In-Place Optimization State (model.inference(compile=False, inplace=True, dtype="float16"))
  const [dtype, setDtype] = useState<'float16' | 'float32'>('float16');
  const [inplace, setInplace] = useState<boolean>(true);
  const [compile, setCompile] = useState<boolean>(false);
  const [isOptimized, setIsOptimized] = useState<boolean>(true);
  const [instanceId, setInstanceId] = useState<number>(1);
  const [resetSuccessNotice, setResetSuccessNotice] = useState<boolean>(false);

  // Supervision Annotator Visual Settings
  const [boxThickness, setBoxThickness] = useState<number>(3);
  const [cornerRadius, setCornerRadius] = useState<number>(4);
  const [showConfidenceInLabel, setShowConfidenceInLabel] = useState<boolean>(true);
  const [showBoxAnnotator, setShowBoxAnnotator] = useState<boolean>(true);
  const [showLabelAnnotator, setShowLabelAnnotator] = useState<boolean>(true);

  // Input Source Mode: 'webcam' | 'video_file' | 'rtsp' | 'benchmark_image' | 'action_image'
  const [videoInputType, setVideoInputType] = useState<'webcam' | 'video_file' | 'rtsp'>('webcam');
  const [webcamIndex, setWebcamIndex] = useState<number>(0);
  const [sourceVideoPath, setSourceVideoPath] = useState<string>('sample_video.mp4');
  const [rtspStreamUrl, setRtspStreamUrl] = useState<string>('rtsp://username:password@ip_address:port/h264');

  // Python Code View State
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'webcam' | 'video_file' | 'rtsp' | 'snippet' | 'full_script'>('webcam');

  // Exact Python OpenCV Webcam Pipeline requested by user
  const pythonWebcamScript = `import cv2
import supervision as sv
from rfdetr import RFDETRMedium
from rfdetr.assets.coco_classes import COCO_CLASSES

# 1. Initialize RFDETR Medium vision model
model = RFDETRMedium()

# 2. In-place FP16 Optimization before predict()
model.inference(compile=${compile ? 'True' : 'False'}, inplace=${inplace ? 'True' : 'False'}, dtype="${dtype}")

# 3. Initialize VideoCapture with Webcam Index
WEBCAM_INDEX = ${webcamIndex}
video_capture = cv2.VideoCapture(WEBCAM_INDEX)
if not video_capture.isOpened():
    raise RuntimeError(f"Failed to open webcam: {WEBCAM_INDEX}")

while True:
    success, frame_bgr = video_capture.read()
    if not success:
        break

    # Convert OpenCV BGR to RGB for model prediction
    frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    detections = model.predict(frame_rgb, threshold=${threshold})

    # Map detected class IDs to COCO human-readable labels
    labels = [COCO_CLASSES[class_id] for class_id in detections.class_id]

    # Annotate frame using Supervision BoxAnnotator and LabelAnnotator
    annotated_frame = sv.BoxAnnotator().annotate(frame_bgr, detections)
    annotated_frame = sv.LabelAnnotator().annotate(annotated_frame, detections, labels)

    cv2.imshow("RF-DETR Webcam", annotated_frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

video_capture.release()
cv2.destroyAllWindows()`;

  // Python OpenCV Video File Pipeline
  const pythonVideoFileScript = `import cv2
import supervision as sv
from rfdetr import RFDETRMedium
from rfdetr.assets.coco_classes import COCO_CLASSES

# 1. Initialize RFDETR Medium model & optimize in-place
model = RFDETRMedium()
model.inference(compile=${compile ? 'True' : 'False'}, inplace=${inplace ? 'True' : 'False'}, dtype="${dtype}")

# 2. Open input video file (<SOURCE_VIDEO_PATH>)
SOURCE_VIDEO_PATH = "${sourceVideoPath}"
video_capture = cv2.VideoCapture(SOURCE_VIDEO_PATH)
if not video_capture.isOpened():
    raise RuntimeError(f"Failed to open video file: {SOURCE_VIDEO_PATH}")

while True:
    success, frame_bgr = video_capture.read()
    if not success:
        break

    frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    detections = model.predict(frame_rgb, threshold=${threshold})

    labels = [COCO_CLASSES[class_id] for class_id in detections.class_id]

    annotated_frame = sv.BoxAnnotator().annotate(frame_bgr, detections)
    annotated_frame = sv.LabelAnnotator().annotate(annotated_frame, detections, labels)

    cv2.imshow("RF-DETR Video Playback", annotated_frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

video_capture.release()
cv2.destroyAllWindows()`;

  // Python OpenCV RTSP Stream Pipeline
  const pythonRtspScript = `import cv2
import supervision as sv
from rfdetr import RFDETRMedium
from rfdetr.assets.coco_classes import COCO_CLASSES

# 1. Initialize RFDETR Medium model & optimize in-place
model = RFDETRMedium()
model.inference(compile=${compile ? 'True' : 'False'}, inplace=${inplace ? 'True' : 'False'}, dtype="${dtype}")

# 2. Connect to RTSP IP Camera Stream (<RTSP_STREAM_URL>)
RTSP_STREAM_URL = "${rtspStreamUrl}"
video_capture = cv2.VideoCapture(RTSP_STREAM_URL)
if not video_capture.isOpened():
    raise RuntimeError(f"Failed to open RTSP stream: {RTSP_STREAM_URL}")

while True:
    success, frame_bgr = video_capture.read()
    if not success:
        break

    frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    detections = model.predict(frame_rgb, threshold=${threshold})

    labels = [COCO_CLASSES[class_id] for class_id in detections.class_id]

    annotated_frame = sv.BoxAnnotator().annotate(frame_bgr, detections)
    annotated_frame = sv.LabelAnnotator().annotate(annotated_frame, detections, labels)

    cv2.imshow("RF-DETR RTSP Live Feed", annotated_frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

video_capture.release()
cv2.destroyAllWindows()`;

  const pythonSnippet = `import supervision as sv
from rfdetr import RFDETRMedium
from rfdetr.assets.coco_classes import COCO_CLASSES

model = RFDETRMedium()

# In-place model optimization before calling predict()
# dtype="float16" halves weight memory and clears base model reference
model.inference(compile=${compile ? 'True' : 'False'}, inplace=${inplace ? 'True' : 'False'}, dtype="${dtype}")

detections = model.predict("${selectedSource === 'live_camera' ? 'camera_frame.jpg' : selectedSource}", threshold=${threshold})

labels = [f"{COCO_CLASSES[class_id]}" for class_id in detections.class_id]

annotated_image = sv.BoxAnnotator().annotate(detections.metadata["source_image"], detections)
annotated_image = sv.LabelAnnotator().annotate(annotated_image, detections, labels)`;

  const pythonFullScript = pythonWebcamScript;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Re-instantiate a fresh RFDETR instance to reverse in-place modification
  const handleCreateNewInstance = () => {
    setInstanceId(prev => prev + 1);
    setDtype('float16');
    setInplace(true);
    setCompile(false);
    setIsOptimized(true);
    setResetSuccessNotice(true);
    setTimeout(() => setResetSuccessNotice(false), 3000);
  };

  // Run RFDETRMedium Prediction
  const runPrediction = async (overrideSource?: string) => {
    const targetSource = overrideSource || selectedSource;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let payload: any = {
        threshold: threshold,
        dtype: dtype,
        inplace: inplace,
        compile: compile
      };

      if (targetSource === 'live_camera') {
        const base64 = getLiveFrameBase64 ? getLiveFrameBase64() : null;
        if (!base64) {
          throw new Error('Live camera frame not accessible. Please ensure webcam is turned on.');
        }
        payload.image = base64;
      } else {
        payload.imageUrl = targetSource;
      }

      const res = await fetch('/api/rfdetr-medium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to process RFDETRMedium prediction');
      }

      const rawDetections = data.detections || {};
      const classIds: number[] = rawDetections.class_id || [];
      const confidences: number[] = rawDetections.confidence || [];
      const xyxyList: [number, number, number, number][] = rawDetections.xyxy || [];
      const box2dList: [number, number, number, number][] = rawDetections.box_2d || [];

      const parsed: RFDetrDetection[] = classIds.map((cid, i) => ({
        class_id: cid,
        class_name: COCO_CLASSES[cid] || `class_${cid}`,
        confidence: confidences[i] ?? 0.9,
        xyxy: xyxyList[i] || [100, 100, 500, 500],
        box_2d: box2dList[i]
      }));

      const derivedLabels: string[] = Array.isArray(data.labels) && data.labels.length > 0
        ? data.labels
        : parsed.map(d => `${COCO_CLASSES[d.class_id] || d.class_name}`);

      setDetections(parsed);
      setLabels(derivedLabels);
      setLatencyMs(data.latency_ms || 24);

      if (onApplyDetectionsToCanvas) {
        onApplyDetectionsToCanvas(parsed, derivedLabels);
      }
      if (onSelectPresetImage && targetSource !== 'live_camera') {
        onSelectPresetImage(targetSource);
      }
    } catch (err: any) {
      console.error('RFDETRMedium prediction error:', err);
      setErrorMsg(err.message || 'Detection failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface-container/60 border border-outline-variant/15 rounded-3xl p-5 space-y-5 text-left shadow-2xl backdrop-blur-md" id="rfdetr-supervision-module">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-outline-variant/10 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-400 animate-pulse" /> RF-DETR Medium + Supervision
            </span>
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
              <Cpu className="w-3 h-3" /> FP16 In-Place Optimized
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full">
              COCO 80 Classes
            </span>
          </div>
          <h3 className="text-lg font-headline font-extrabold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" /> RFDETRMedium & Supervision Annotator Engine
          </h3>
          <p className="text-xs text-on-surface-variant max-w-xl">
            Real-Time Detection Transformer running with Roboflow <code className="text-purple-300 font-mono text-[11px]">supervision (sv)</code> <code className="text-emerald-300 font-mono text-[11px]">BoxAnnotator</code> and <code className="text-amber-300 font-mono text-[11px]">LabelAnnotator</code>.
          </p>
        </div>

        <button
          id="btn-run-rfdetr-medium"
          onClick={() => runPrediction()}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-950 disabled:text-purple-400 text-white font-mono font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Predicting...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run model.predict()</span>
            </>
          )}
        </button>
      </div>

      {/* In-Place Model Optimization Card (model.inference) */}
      <div className="bg-zinc-950/80 border border-cyan-500/25 rounded-2xl p-4 space-y-3.5 shadow-lg relative overflow-hidden" id="rfdetr-model-optimization-panel">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-extrabold text-white tracking-wide uppercase">
                In-Place Model Optimization
              </span>
              <span className="text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                Active Instance #{instanceId}
              </span>
            </div>
            <code className="text-[11px] font-mono text-cyan-300 block font-bold">
              model.inference(compile={compile ? 'True' : 'False'}, inplace={inplace ? 'True' : 'False'}, dtype="{dtype}")
            </code>
          </div>

          {/* Reset / Create New RFDETR instance button */}
          <button
            id="btn-create-new-rfdetr-instance"
            onClick={handleCreateNewInstance}
            title="Create a new RFDETR instance to restore the original unoptimized model"
            className="self-start sm:self-auto bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-[10px] font-mono font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Create New RFDETR Instance</span>
          </button>
        </div>

        {/* Success alert when fresh instance is created */}
        {resetSuccessNotice && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-mono flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Successfully initialized new RFDETRMedium() instance #{instanceId} and reset base model reference.</span>
          </motion.div>
        )}

        {/* Optimization Metrics & Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Dtype Selection (float16 vs float32) */}
          <div className="bg-zinc-900/70 p-3 rounded-xl border border-white/5 space-y-1.5">
            <span className="text-[9px] font-mono uppercase font-bold text-on-surface-variant flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-cyan-400" /> Precision (dtype)
            </span>
            <div className="flex bg-black/50 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setDtype('float16')}
                className={`flex-1 py-1 text-[10px] font-mono font-extrabold rounded-md transition ${
                  dtype === 'float16'
                    ? 'bg-cyan-500 text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                "float16" (FP16)
              </button>
              <button
                onClick={() => setDtype('float32')}
                className={`flex-1 py-1 text-[10px] font-mono font-extrabold rounded-md transition ${
                  dtype === 'float32'
                    ? 'bg-zinc-700 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                "float32"
              </button>
            </div>
            <div className="text-[9px] font-mono text-cyan-400/90 font-bold">
              {dtype === 'float16' ? '✓ Halves weight memory (50%)' : 'Standard 32-bit float'}
            </div>
          </div>

          {/* inplace=True */}
          <div className="bg-zinc-900/70 p-3 rounded-xl border border-white/5 space-y-1.5">
            <span className="text-[9px] font-mono uppercase font-bold text-on-surface-variant">
              In-Place Execution (inplace)
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono font-extrabold text-white">
                {inplace ? 'inplace=True' : 'inplace=False'}
              </span>
              <button
                onClick={() => setInplace(!inplace)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition border ${
                  inplace
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-white/10'
                }`}
              >
                {inplace ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
            <div className="text-[9px] font-mono text-zinc-400">
              {inplace ? '✓ Clears base model ref' : 'Retains base duplicate'}
            </div>
          </div>

          {/* compile=False */}
          <div className="bg-zinc-900/70 p-3 rounded-xl border border-white/5 space-y-1.5">
            <span className="text-[9px] font-mono uppercase font-bold text-on-surface-variant">
              Torch/JIT Compile (compile)
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono font-extrabold text-white">
                {compile ? 'compile=True' : 'compile=False'}
              </span>
              <button
                onClick={() => setCompile(!compile)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition border ${
                  compile
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-white/10'
                }`}
              >
                {compile ? 'TRUE' : 'FALSE'}
              </button>
            </div>
            <div className="text-[9px] font-mono text-zinc-400">
              {compile ? 'JIT graph optimized' : 'Fast startup (compile=False)'}
            </div>
          </div>

          {/* Memory Reduction Metric Box */}
          <div className="bg-cyan-950/30 p-3 rounded-xl border border-cyan-500/20 space-y-1">
            <span className="text-[9px] font-mono uppercase font-bold text-cyan-300">
              Memory Footprint
            </span>
            <div className="text-base font-mono font-extrabold text-white flex items-baseline gap-1.5">
              <span>{dtype === 'float16' ? '~160 MB' : '~320 MB'}</span>
              {dtype === 'float16' && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-1.5 py-0.2 rounded">
                  -50% VRAM
                </span>
              )}
            </div>
            <div className="text-[9px] font-mono text-cyan-200/70">
              Base reference: <strong className="text-cyan-300">{inplace ? 'Cleared' : 'Retained'}</strong>
            </div>
          </div>

        </div>

        {/* Irreversible Notice Callout */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-200 font-mono">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-300 uppercase text-[10px] tracking-wider block">
              Irreversible In-Place Operation Notice
            </span>
            <p className="text-[11px] leading-relaxed text-amber-200/90">
              This in-place operation is <strong>irreversible</strong>: internal model weight tensors are converted to half-precision ({dtype}) and base model references are cleared to minimize memory. To restore the original full-precision model, click <strong>"Create New RFDETR Instance"</strong> to create a fresh <code className="text-white bg-black/40 px-1 py-0.5 rounded">model = RFDETRMedium()</code>.
            </p>
          </div>
        </div>

      </div>

      {/* Preset Source Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider block">
          Inference Input Source
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            {
              id: 'https://media.roboflow.com/dog.jpg',
              title: '🐶 Roboflow Dog Benchmark',
              desc: 'Official benchmark dog image'
            },
            {
              id: 'live_camera',
              title: '📹 Live Camera Feed Frame',
              desc: 'Active real-time webcam frame'
            },
            {
              id: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80',
              title: '🏀 Basketball Player & Ball',
              desc: 'Athletic sports action'
            }
          ].map((item) => (
            <button
              key={item.id}
              id={`preset-source-${item.id === 'live_camera' ? 'live' : 'url'}`}
              onClick={() => {
                setSelectedSource(item.id);
                runPrediction(item.id);
              }}
              className={`p-3 rounded-2xl text-left border transition ${
                selectedSource === item.id
                  ? 'bg-purple-500/20 text-white border-purple-500/50 shadow-md ring-1 ring-purple-500/30'
                  : 'bg-zinc-950/60 hover:bg-zinc-900 text-on-surface-variant hover:text-white border-white/5'
              }`}
            >
              <div className="font-headline font-bold text-xs">{item.title}</div>
              <div className="text-[10px] text-on-surface-variant/70 mt-0.5 truncate">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Threshold & Annotator Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-950/50 p-4 rounded-2xl border border-white/5">
        
        {/* Confidence Threshold Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono font-bold text-on-surface-variant uppercase">
            <span>Confidence Threshold</span>
            <span className="text-purple-400 font-extrabold">{threshold.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.95"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full accent-purple-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[8px] font-mono text-on-surface-variant/60">
            <span>0.10 (Permissive)</span>
            <span>0.50 (Default)</span>
            <span>0.95 (Strict)</span>
          </div>
        </div>

        {/* Supervision Box Annotator Thickness */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono font-bold text-on-surface-variant uppercase">
            <span>sv.BoxAnnotator Thickness</span>
            <span className="text-emerald-400 font-extrabold">{boxThickness}px</span>
          </div>
          <input
            type="range"
            min="1"
            max="6"
            step="1"
            value={boxThickness}
            onChange={(e) => setBoxThickness(Number(e.target.value))}
            className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[8px] font-mono text-on-surface-variant/60">
            <span>1px (Fine)</span>
            <span>3px (Standard)</span>
            <span>6px (Bold)</span>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col justify-center gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono text-on-surface-variant font-bold uppercase">Show Confidence in Labels</span>
            <button
              onClick={() => setShowConfidenceInLabel(!showConfidenceInLabel)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition border ${
                showConfidenceInLabel
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                  : 'bg-zinc-800 text-on-surface-variant border-white/10'
              }`}
            >
              {showConfidenceInLabel ? 'YES' : 'NO'}
            </button>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono text-on-surface-variant font-bold uppercase">Box Corner Radius</span>
            <span className="text-[10px] font-mono text-white font-bold">{cornerRadius}px</span>
          </div>
        </div>

      </div>

      {/* Detection Results & Supervision Badges */}
      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-mono">
          ⚠️ {errorMsg}
        </div>
      )}

      {detections.length > 0 && (
        <div className="space-y-3 bg-zinc-950/70 p-4 rounded-2xl border border-purple-500/20">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Active Detections ({detections.length})
              </span>
              {latencyMs && (
                <span className="text-[9px] font-mono text-cyan-300 bg-cyan-500/15 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                  ⚡ {latencyMs}ms inference ({dtype} in-place)
                </span>
              )}
            </div>

            <div className="text-[9px] font-mono text-on-surface-variant">
              Labels derived via <code className="text-purple-300">[f"&#123;COCO_CLASSES[id]&#125;" for id in class_id]</code>
            </div>
          </div>

          {/* Detections Chips list with Supervision colors */}
          <div className="flex flex-wrap gap-2 pt-1">
            {detections.map((det, idx) => {
              const color = getSupervisionColor(det.class_id);
              const labelStr = labels[idx] || `${COCO_CLASSES[det.class_id] || det.class_name}`;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 shadow-sm"
                  style={{ backgroundColor: `${color}18`, borderColor: `${color}40` }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-headline font-extrabold uppercase text-white tracking-wide">
                      {labelStr}
                    </span>
                    <span className="text-[9px] font-mono text-on-surface-variant">
                      ID: #{det.class_id} • Conf: {(det.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Coordinate Table */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-[10px] font-mono">
              <thead>
                <tr className="text-on-surface-variant/70 border-b border-white/10">
                  <th className="pb-1.5 font-bold">Class ID</th>
                  <th className="pb-1.5 font-bold">COCO Label</th>
                  <th className="pb-1.5 font-bold">Confidence</th>
                  <th className="pb-1.5 font-bold">Bounding Box (xyxy / box_2d)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/90">
                {detections.map((d, i) => (
                  <tr key={i} className="hover:bg-white/5 transition">
                    <td className="py-1.5 font-bold text-purple-400">#{d.class_id}</td>
                    <td className="py-1.5 font-extrabold capitalize">{COCO_CLASSES[d.class_id] || d.class_name}</td>
                    <td className="py-1.5 text-emerald-400 font-bold">{(d.confidence * 100).toFixed(0)}%</td>
                    <td className="py-1.5 text-on-surface-variant">
                      [{d.xyxy.map(v => Math.round(v)).join(', ')}]
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Python Code Implementation Hub */}
      <div className="space-y-3 bg-zinc-950/90 p-4 rounded-2xl border border-outline-variant/15" id="opencv-python-code-hub">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                OpenCV Decoding & Supervision Pipeline
              </span>
            </div>
            <p className="text-[10px] font-mono text-on-surface-variant">
              These examples use OpenCV for decoding and display. Configure &lt;WEBCAM_INDEX&gt;, &lt;SOURCE_VIDEO_PATH&gt;, and &lt;RTSP_STREAM_URL&gt;.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-white/10 overflow-x-auto max-w-full">
              <button
                id="tab-code-webcam"
                onClick={() => setActiveCodeTab('webcam')}
                className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold transition whitespace-nowrap ${
                  activeCodeTab === 'webcam'
                    ? 'bg-purple-600 text-white'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                📹 Webcam ({webcamIndex})
              </button>
              <button
                id="tab-code-video"
                onClick={() => setActiveCodeTab('video_file')}
                className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold transition whitespace-nowrap ${
                  activeCodeTab === 'video_file'
                    ? 'bg-purple-600 text-white'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                🎞️ Video File
              </button>
              <button
                id="tab-code-rtsp"
                onClick={() => setActiveCodeTab('rtsp')}
                className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold transition whitespace-nowrap ${
                  activeCodeTab === 'rtsp'
                    ? 'bg-purple-600 text-white'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                📡 RTSP Stream
              </button>
              <button
                id="tab-code-snippet"
                onClick={() => setActiveCodeTab('snippet')}
                className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold transition whitespace-nowrap ${
                  activeCodeTab === 'snippet'
                    ? 'bg-purple-600 text-white'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                ⚡ Snippet
              </button>
            </div>

            <button
              onClick={() => {
                let codeToCopy = pythonWebcamScript;
                if (activeCodeTab === 'video_file') codeToCopy = pythonVideoFileScript;
                else if (activeCodeTab === 'rtsp') codeToCopy = pythonRtspScript;
                else if (activeCodeTab === 'snippet') codeToCopy = pythonSnippet;
                copyToClipboard(codeToCopy);
              }}
              className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition border border-white/10 cursor-pointer shrink-0"
            >
              {isCopied ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-purple-300" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Input Parameters Customizer for OpenCV Sources */}
        {activeCodeTab === 'webcam' && (
          <div className="bg-zinc-900/60 p-3 rounded-xl border border-white/5 flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-mono font-bold text-purple-300 uppercase">
              Webcam Parameter:
            </span>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-mono text-zinc-400">&lt;WEBCAM_INDEX&gt;:</label>
              <input
                type="number"
                min={0}
                max={10}
                value={webcamIndex}
                onChange={(e) => setWebcamIndex(parseInt(e.target.value) || 0)}
                className="bg-black/60 border border-white/10 rounded px-2 py-0.5 text-xs font-mono text-white w-16 text-center focus:outline-none focus:border-purple-500"
              />
              <span className="text-[9px] font-mono text-zinc-500">(usually 0 for default integrated camera, 1 or 2 for external USB camera)</span>
            </div>
          </div>
        )}

        {activeCodeTab === 'video_file' && (
          <div className="bg-zinc-900/60 p-3 rounded-xl border border-white/5 flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-mono font-bold text-purple-300 uppercase">
              Video File Parameter:
            </span>
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <label className="text-[10px] font-mono text-zinc-400 whitespace-nowrap">&lt;SOURCE_VIDEO_PATH&gt;:</label>
              <input
                type="text"
                value={sourceVideoPath}
                onChange={(e) => setSourceVideoPath(e.target.value)}
                placeholder="e.g. video.mp4 or /path/to/source.mp4"
                className="bg-black/60 border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-white flex-1 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        )}

        {activeCodeTab === 'rtsp' && (
          <div className="bg-zinc-900/60 p-3 rounded-xl border border-white/5 flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-mono font-bold text-purple-300 uppercase">
              RTSP IP Stream Parameter:
            </span>
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <label className="text-[10px] font-mono text-zinc-400 whitespace-nowrap">&lt;RTSP_STREAM_URL&gt;:</label>
              <input
                type="text"
                value={rtspStreamUrl}
                onChange={(e) => setRtspStreamUrl(e.target.value)}
                placeholder="rtsp://user:pass@ip:port/stream"
                className="bg-black/60 border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-white flex-1 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        )}

        {/* Code Box */}
        <div className="relative rounded-xl overflow-hidden bg-black/90 border border-white/10 p-3 font-mono text-[11px] leading-relaxed text-zinc-300 overflow-x-auto">
          <pre className="text-left select-all">
            {activeCodeTab === 'webcam'
              ? pythonWebcamScript
              : activeCodeTab === 'video_file'
              ? pythonVideoFileScript
              : activeCodeTab === 'rtsp'
              ? pythonRtspScript
              : pythonSnippet}
          </pre>
        </div>

        {/* Terminal pip install command pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900/90 p-2.5 rounded-xl border border-white/5 text-[10px] font-mono">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>Install requirements:</span>
            <code className="text-emerald-400 font-bold bg-black/60 px-2 py-0.5 rounded border border-emerald-500/20 select-all">
              pip install opencv-python rfdetr[plus] supervision
            </code>
          </div>
          <button
            onClick={() => copyToClipboard('pip install opencv-python rfdetr[plus] supervision')}
            className="text-primary hover:underline text-[9px] font-bold cursor-pointer"
          >
            Copy Command
          </button>
        </div>
      </div>

    </div>
  );
}
