import { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Video, 
  VideoOff, 
  Sparkles, 
  RefreshCw, 
  Flame, 
  Activity, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Settings, 
  Zap,
  Play,
  Pause,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Clock,
  Maximize2,
  Minimize2,
  Repeat,
  Square,
  Circle,
  Download,
  Trash2,
  Film,
  Sliders,
  Layers,
  Code,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RfDetrSupervisionTracker from './RfDetrSupervisionTracker';
import { COCO_CLASSES, getSupervisionColor, type RFDetrDetection } from '../cocoClasses';

interface BiomechanicsResult {
  activityDetected: string;
  motionRating: 'Elite' | 'Good' | 'Needs Realignment' | 'Critical Adjustment';
  biomechanicsCaption: string;
  coachingTips: string[];
  jointAlignmentScore: number;
  movementBalance: 'Symmetric' | 'Left-heavy' | 'Right-heavy' | 'Forward-lean' | 'Backward-lean';
}

export default function CameraMotionTracker() {
  // Navigation Mode Tab: 'motion' (Kinetic Coach) | 'rfdetr' (RF-DETR + Supervision) | 'combined' (Both)
  const [activeMainTab, setActiveMainTab] = useState<'motion' | 'rfdetr' | 'combined'>('motion');

  // Camera & Device Stream States
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user'); // 'user' = Front, 'environment' = Back / Rear
  const [isMirrored, setIsMirrored] = useState<boolean>(true); // Mirrored by default for front camera
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false); // Defaults to live camera mode
  const [isFullview, setIsFullview] = useState<boolean>(false); // Fullview expand mode for live camera feed

  // RF-DETR Medium & Supervision State
  const [rfDetections, setRfDetections] = useState<RFDetrDetection[]>([]);
  const [rfLabels, setRfLabels] = useState<string[]>([]);
  const [isRfOverlayEnabled, setIsRfOverlayEnabled] = useState<boolean>(true);
  const [activePresetImageUrl, setActivePresetImageUrl] = useState<string | null>(null);
  const presetImageRef = useRef<HTMLImageElement | null>(null);
  const rfDetectionsRef = useRef<RFDetrDetection[]>([]);
  const rfLabelsRef = useRef<string[]>([]);

  useEffect(() => {
    rfDetectionsRef.current = rfDetections;
    rfLabelsRef.current = rfLabels;
  }, [rfDetections, rfLabels]);

  // Toggle camera facing mode between Front ('user') and Rear ('environment')
  const toggleCameraFacingMode = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    setIsMirrored(nextFacing === 'user');
    setSelectedDeviceId(''); // Clear explicit device ID so facingMode constraint takes effect
  };

  // Handle explicit hardware device selection
  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (!deviceId) return;
    const matchedDev = devices.find(d => d.deviceId === deviceId);
    if (matchedDev && matchedDev.label) {
      const lbl = matchedDev.label.toLowerCase();
      if (lbl.includes('back') || lbl.includes('rear') || lbl.includes('environment')) {
        setFacingMode('environment');
        setIsMirrored(false);
      } else if (lbl.includes('front') || lbl.includes('user') || lbl.includes('selfie')) {
        setFacingMode('user');
        setIsMirrored(true);
      }
    }
  };

  // Keyboard shortcut listener for Esc key to exit fullview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullview(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-time Motion Settings
  const [motionThreshold, setMotionThreshold] = useState<number>(20); // pixel color diff threshold
  const [motionSensitivity, setMotionSensitivity] = useState<number>(8); // downsample scale

  // Real-time Motion Metrics
  const [liveMotionPct, setLiveMotionPct] = useState<number>(0);
  const [peakMotionPct, setPeakMotionPct] = useState<number>(0);
  const [repCount, setRepCount] = useState<number>(0);
  const [activityRate, setActivityRate] = useState<number>(0); // computed cycles per minute
  const [isTracking, setIsTracking] = useState<boolean>(true);

  // AI Captioning Input Parameters
  const [activityType, setActivityType] = useState<string>('Jumping Jacks');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<BiomechanicsResult | null>(null);

  // Dynamic Motion Trail States
  const [trailLength, setTrailLength] = useState<number>(30);
  const [trailPersistence, setTrailPersistence] = useState<number>(0.7); // 0.1 = Fading Trail, 1.0 = Static Path
  const [trailStyle, setTrailStyle] = useState<'ribbon' | 'particles' | 'glow-path'>('ribbon');
  const [isTrailActive, setIsTrailActive] = useState<boolean>(false); // Disabled by default for live camera so only bounding rectangle appears
  const trailPointsRef = useRef<{ x: number; y: number; time: number }[]>([]);
  const [playbackFps, setPlaybackFps] = useState<number>(30);
  const [trailPointsCount, setTrailPointsCount] = useState<number>(0);

  // Live Webcam Recording & Seamless Looping States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [isSeamlessLoopEnabled, setIsSeamlessLoopEnabled] = useState<boolean>(true); // Seamless looping toggle
  const [playbackRate, setPlaybackRate] = useState<number>(1.0); // 0.5x, 1.0x, 1.5x speed
  const [isPlayingRecorded, setIsPlayingRecorded] = useState<boolean>(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const recordedVideoRef = useRef<HTMLVideoElement | null>(null);

  // Synchronize playback speed & looping property whenever recordedVideoRef or controls change
  useEffect(() => {
    if (recordedVideoRef.current) {
      recordedVideoRef.current.playbackRate = playbackRate;
      recordedVideoRef.current.loop = isSeamlessLoopEnabled;
    }
  }, [playbackRate, isSeamlessLoopEnabled, recordedBlobUrl]);

  // Clean up recording timer & blob object URLs on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (recordedBlobUrl) URL.revokeObjectURL(recordedBlobUrl);
    };
  }, [recordedBlobUrl]);

  // Start recording live stream / canvas
  const startRecording = () => {
    if (recordedBlobUrl) {
      URL.revokeObjectURL(recordedBlobUrl);
      setRecordedBlobUrl(null);
    }
    recordedChunksRef.current = [];

    // Capture canvas video stream or raw camera stream
    let captureStream: MediaStream | null = null;
    if (displayCanvasRef.current && (displayCanvasRef.current as any).captureStream) {
      captureStream = (displayCanvasRef.current as any).captureStream(30);
    } else if (stream) {
      captureStream = stream;
    }

    if (!captureStream) {
      setCameraError('No active stream available to record.');
      return;
    }

    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const recorder = new MediaRecorder(captureStream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
        setIsPlayingRecorded(true);
        setIsRecording(false);
        setRecordingDuration(0);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingDuration(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Failed to start MediaRecorder:', err);
      setCameraError('Recording failed to initialize. Please verify device permissions.');
    }
  };

  // Stop current recording session
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
  };

  // Discard currently recorded loop
  const handleDiscardRecording = () => {
    if (recordedBlobUrl) {
      URL.revokeObjectURL(recordedBlobUrl);
    }
    setRecordedBlobUrl(null);
    setIsPlayingRecorded(false);
  };

  // Toggle play/pause for recorded loop
  const togglePlayRecorded = () => {
    if (recordedVideoRef.current) {
      if (isPlayingRecorded) {
        recordedVideoRef.current.pause();
        setIsPlayingRecorded(false);
      } else {
        recordedVideoRef.current.play();
        setIsPlayingRecorded(true);
      }
    }
  };

  // Smooth trail renderer for the tracked movement path
  const drawMotionTrail = (ctx: CanvasRenderingContext2D) => {
    const points = trailPointsRef.current;
    if (points.length < 2) return;

    ctx.save();
    
    // Choose trail color based on activity type
    let strokeColor = '#6366F1'; // Default Indigo
    let glowColor = '#818CF8';
    
    if (activityType === 'Basketball Shooting') {
      strokeColor = '#F97316'; // Orange
      glowColor = '#FB923C';
    } else if (activityType === 'Jumping Jacks') {
      strokeColor = '#06B6D4'; // Cyan
      glowColor = '#22D3EE';
    } else if (activityType === 'Defensive Lateral Slide') {
      strokeColor = '#10B981'; // Emerald
      glowColor = '#34D399';
    } else if (activityType === 'Ergonomic Posture Check') {
      strokeColor = '#EC4899'; // Hot Pink
      glowColor = '#F472B6';
    } else if (activityType === '1v1 Streetball Battle') {
      strokeColor = '#FBBF24'; // Vivid Amber
      glowColor = '#F59E0B';
    }

    if (trailStyle === 'ribbon') {
      // Draw a continuous tapered glowing ribbon
      ctx.shadowBlur = 15;
      ctx.shadowColor = glowColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const ratio = i / points.length;
        
        // trailPersistence determines how much the tail retains opacity and width (1.0 = static path)
        const persistenceAlpha = ratio + (1 - ratio) * Math.max(0, (trailPersistence - 0.1) / 0.9);
        const widthFactor = ratio + (1 - ratio) * Math.max(0, (trailPersistence - 0.1) / 0.9);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = Math.max(2, widthFactor * 12); // Ribbon width stays full when static
        ctx.globalAlpha = Math.min(1.0, Math.max(0.08, persistenceAlpha * 0.9)); // Fades out or stays static
        ctx.stroke();
      }
    } else if (trailStyle === 'glow-path') {
      // High-tech laser trace with dynamic dots
      ctx.shadowBlur = 20;
      ctx.shadowColor = glowColor;
      ctx.lineWidth = 4;
      ctx.strokeStyle = strokeColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = Math.min(1.0, 0.5 + trailPersistence * 0.45);

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        // Curve to make it extra smooth
        const xc = (points[i].x + points[i - 1].x) / 2;
        const yc = (points[i].y + points[i - 1].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }
      ctx.stroke();

      // Pulsing nodes
      for (let i = 0; i < points.length; i += 3) {
        const p = points[i];
        const ratio = i / points.length;
        const nodeAlpha = ratio + (1 - ratio) * Math.max(0, (trailPersistence - 0.1) / 0.9);
        const nodeSize = ratio + (1 - ratio) * Math.max(0, (trailPersistence - 0.1) / 0.9);

        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = Math.min(1.0, Math.max(0.15, nodeAlpha * 0.85));
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.5, nodeSize * 5), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (trailStyle === 'particles') {
      // Spits out fading athletic flow bubbles along the path
      ctx.shadowBlur = 8;
      ctx.shadowColor = glowColor;
      
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const ratio = i / points.length;
        const particleAlpha = ratio + (1 - ratio) * Math.max(0, (trailPersistence - 0.1) / 0.9);
        const particleSize = ratio + (1 - ratio) * Math.max(0, (trailPersistence - 0.1) / 0.9);
        
        ctx.fillStyle = strokeColor;
        ctx.globalAlpha = Math.min(1.0, Math.max(0.1, particleAlpha * 0.7));
        
        ctx.beginPath();
        // Dynamic pulsating size
        const radius = (particleSize * 8) + Math.sin(i * 0.5 + Date.now() * 0.01) * 2;
        ctx.arc(p.x, p.y, Math.max(1, radius), 0, Math.PI * 2);
        ctx.fill();
        
        // Inner bright core
        if (ratio > 0.6 || trailPersistence > 0.8) {
          ctx.fillStyle = '#FFFFFF';
          ctx.globalAlpha = Math.min(1.0, Math.max(0.1, particleAlpha * 0.45));
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Render the beautiful high-tech Path Duration HUD Overlay inside the canvas
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
    
    // Position HUD in the bottom left
    const hudX = 20;
    const hudY = 405;
    const hudW = 190;
    const hudH = 55;

    // Outer glow / card background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = strokeColor; // Use the dynamic activity stroke color for the outline
    ctx.lineWidth = 1.5;
    
    // Draw rounded rect
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(hudX, hudY, hudW, hudH, 10);
    } else {
      ctx.rect(hudX, hudY, hudW, hudH);
    }
    ctx.fill();
    ctx.stroke();

    // Icon / Header text
    ctx.fillStyle = glowColor;
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('⚡ KINETIC PATH DURATION', hudX + 12, hudY + 16);

    // Duration value
    const durationSec = (points.length / playbackFps).toFixed(2);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${durationSec}s`, hudX + 12, hudY + 36);

    // Dynamic stats label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 7.5px monospace';
    ctx.fillText(`[ ${points.length} f @ ${playbackFps} FPS ]`, hudX + 12, hudY + 47);

    // Pulsing blinker indicator in the corner
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(hudX + hudW - 14, hudY + 13, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // HTML Element Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const processingCanvasRef = useRef<HTMLCanvasElement>(null);
  const motionHistoryRef = useRef<number[]>(new Array(40).fill(0));

  // Motion Tracking Internal Variables
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const webcamDefenderXRef = useRef<number>(350);
  const requestRef = useRef<number | null>(null);
  const lastRepTimeRef = useRef<number>(0);
  const isRepPeakRef = useRef<boolean>(false);
  const repCooldownRef = useRef<boolean>(false);
  const trackingStartTimeRef = useRef<number>(Date.now());

  // Demo Simulation Variables
  const demoTimeRef = useRef<number>(0);
  const skeletonCoordsRef = useRef<any>({});

  // 1. Enumerate available video devices
  useEffect(() => {
    async function getDevices() {
      try {
        const devicesList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devicesList.filter(d => d.kind === 'videoinput');
        setDevices(videoDevices);
      } catch (err) {
        console.warn('Could not enumerate video devices:', err);
      }
    }
    getDevices();
  }, []);

  // 2. Control stream active state based on camera active state, facing mode, device ID, and demo mode
  useEffect(() => {
    if (isCameraActive && !isDemoMode) {
      startCameraStream();
    } else {
      stopCameraStream();
    }
    return () => stopCameraStream();
  }, [isCameraActive, selectedDeviceId, facingMode, isDemoMode]);

  const startCameraStream = async () => {
    stopCameraStream();
    setCameraError(null);
    let newStream: MediaStream | null = null;

    try {
      let videoConstraint: MediaTrackConstraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      };

      if (selectedDeviceId && selectedDeviceId.trim() !== '') {
        videoConstraint.deviceId = { ideal: selectedDeviceId };
      } else {
        videoConstraint.facingMode = { ideal: facingMode };
      }

      newStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraint });
    } catch (firstErr) {
      console.warn('Ideal webcam constraints failed, trying facingMode fallback:', firstErr);
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode }
        });
      } catch (fallbackErr) {
        console.warn('Facing mode constraint failed, trying basic video true:', fallbackErr);
        try {
          newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (finalErr: any) {
          console.error('All webcam stream attempts failed:', finalErr);
          setCameraError(
            'Webcam access was denied or is restricted in this browser session. Ensure camera permissions are granted in your browser settings or click "Activate Demo Simulator" to test with motion skeleton AI!'
          );
          setIsDemoMode(true);
          setIsCameraActive(false);
          return;
        }
      }
    }

    if (newStream) {
      setStream(newStream);
      setIsCameraActive(true);
      setIsDemoMode(false);
      
      // Update actual active camera track properties if reported by browser
      try {
        const videoTrack = newStream.getVideoTracks()[0];
        if (videoTrack) {
          const trackSettings = videoTrack.getSettings ? videoTrack.getSettings() : {};
          if (trackSettings.facingMode) {
            const actualFacing = trackSettings.facingMode as 'user' | 'environment';
            setFacingMode(actualFacing);
            setIsMirrored(actualFacing === 'user');
          }
          if (trackSettings.deviceId && !selectedDeviceId) {
            setSelectedDeviceId(trackSettings.deviceId);
          }
        }
      } catch (trackErr) {
        console.warn('Could not read track settings:', trackErr);
      }

      // Refresh device list to capture human-readable camera labels
      try {
        const devicesList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devicesList.filter(d => d.kind === 'videoinput');
        if (videoDevices.length > 0) {
          setDevices(videoDevices);
        }
      } catch (e) {
        console.warn('Post-stream device enumeration failed:', e);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.warn("Video direct play auto-retried:", e));
        }
      }
    }
  };

  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    prevFrameDataRef.current = null;
  };

  // 3. Main processing loop for Motion Detection
  useEffect(() => {
    trackingStartTimeRef.current = Date.now();
    
    const updateMotion = () => {
      if (!isTracking) {
        requestRef.current = requestAnimationFrame(updateMotion);
        return;
      }

      const canvas = displayCanvasRef.current;
      const procCanvas = processingCanvasRef.current;
      const video = videoRef.current;

      if (!canvas || !procCanvas) {
        requestRef.current = requestAnimationFrame(updateMotion);
        return;
      }

      const ctx = canvas.getContext('2d');
      const pctx = procCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx || !pctx) {
        requestRef.current = requestAnimationFrame(updateMotion);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      let currentMotionPct = 0;

      // Reset styles and clear canvas
      ctx.clearRect(0, 0, width, height);

      let currentFrameWidth = width;
      let currentFrameHeight = height;

      if (isDemoMode) {
        // --- DEMO SIMULATION MODE ---
        // Animate a vector skeleton based on the selected activity
        demoTimeRef.current += 0.05;
        const time = demoTimeRef.current;
        
        // Background dark grid
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(0, 0, width, height);
        
        // Draw athletic gridlines
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.1)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Simulating different posture states
        let baseHeight = height * 0.55;
        let centerX = width * 0.5;
        let bounceSpeed = 4;
        let crouch = 10;
        let headY = baseHeight - 90;
        let chestY = baseHeight - 60;
        let hipY = baseHeight;
        
        let lShoulderX = centerX - 25;
        let rShoulderX = centerX + 25;
        let shoulderY = baseHeight - 55;
        
        let lHandX = centerX - 40;
        let lHandY = baseHeight - 20;
        let rHandX = centerX + 40;
        let rHandY = baseHeight - 20;

        let lKneeX = centerX - 18;
        let lKneeY = baseHeight + 35;
        let rKneeX = centerX + 18;
        let rKneeY = baseHeight + 35;

        let lFootX = centerX - 25;
        let lFootY = baseHeight + 70;
        let rFootX = centerX + 25;
        let rFootY = baseHeight + 70;

        let simulatedMotionFactor = 0;

        if (activityType === 'Jumping Jacks') {
          // Oscillate arms and legs outwards/inwards
          const armCycle = Math.sin(time * 2.2); // Faster cycle
          const legCycle = Math.abs(Math.sin(time * 2.2));
          simulatedMotionFactor = Math.abs(Math.cos(time * 2.2));

          lHandX = centerX - 30 - armCycle * 60;
          lHandY = baseHeight - 40 - armCycle * 70;
          rHandX = centerX + 30 + armCycle * 60;
          rHandY = baseHeight - 40 - armCycle * 70;

          lFootX = centerX - 15 - legCycle * 35;
          rFootX = centerX + 15 + legCycle * 35;

          // Squat slightly at the bottom
          const bounce = Math.abs(Math.sin(time * 2.2)) * 8;
          headY += bounce;
          chestY += bounce;
          hipY += bounce;
          shoulderY += bounce;
          lKneeY += bounce / 2;
          rKneeY += bounce / 2;
        } else if (activityType === 'Basketball Shooting') {
          // Jump shot simulation: crouch -> rise -> release -> hold
          const shootCycle = (time % 4) / 4; // 4-second loop
          
          if (shootCycle < 0.25) {
            // 1. Loading Phase (Crouch)
            const p = shootCycle / 0.25;
            const crouch = p * 25;
            headY += crouch; chestY += crouch; hipY += crouch; shoulderY += crouch;
            lKneeY += crouch / 2; rKneeY += crouch / 2;
            lKneeX -= p * 8; rKneeX += p * 8;
            
            // Bring ball to set point
            rHandX = centerX + 15;
            rHandY = headY + 15;
            lHandX = centerX - 5;
            lHandY = headY + 10;
            simulatedMotionFactor = p * 0.4;
          } else if (shootCycle < 0.35) {
            // 2. Rising & Jump Phase
            const p = (shootCycle - 0.25) / 0.10;
            const lift = 25 - p * 45; // Jump up
            headY += lift; chestY += lift; hipY += lift; shoulderY += lift;
            lKneeY += lift; rKneeY += lift;
            lFootY += lift; rFootY += lift;

            // Lift ball above head
            rHandX = centerX + 18;
            rHandY = headY - 20;
            lHandX = centerX - 12;
            lHandY = headY - 10;
            simulatedMotionFactor = 0.9;
          } else if (shootCycle < 0.50) {
            // 3. High Release Phase
            const p = (shootCycle - 0.35) / 0.15;
            const lift = -20 + p * 20; // Falling back
            headY += lift; chestY += lift; hipY += lift; shoulderY += lift;
            lKneeY += lift; rKneeY += lift;
            lFootY = Math.min(lFootY + p * 25, baseHeight + 70);
            rFootY = Math.min(rFootY + p * 25, baseHeight + 70);

            // Flick wrist
            rHandX = centerX + 24;
            rHandY = headY - 45;
            lHandX = centerX - 15;
            lHandY = headY - 5;
            simulatedMotionFactor = 0.8;
          } else {
            // 4. Recovery / Hold pose
            const p = (shootCycle - 0.50) / 0.50;
            // Gradually return to base stance
            headY = headY + (baseHeight - 90 - headY) * p;
            chestY = chestY + (baseHeight - 60 - chestY) * p;
            hipY = hipY + (baseHeight - hipY) * p;
            shoulderY = shoulderY + (baseHeight - 55 - shoulderY) * p;
            lKneeY = baseHeight + 35;
            rKneeY = baseHeight + 35;
            lFootY = baseHeight + 70;
            rFootY = baseHeight + 70;

            rHandX = rHandX + (centerX + 40 - rHandX) * p;
            rHandY = rHandY + (baseHeight - 20 - rHandY) * p;
            lHandX = lHandX + (centerX - 40 - lHandX) * p;
            lHandY = lHandY + (baseHeight - 20 - lHandY) * p;
            simulatedMotionFactor = (1 - p) * 0.15;
          }
        } else if (activityType === 'Defensive Lateral Slide') {
          // Shuffle left and right
          const slideCycle = Math.sin(time * 1.5);
          centerX = width * 0.5 + slideCycle * 90;
          simulatedMotionFactor = Math.abs(Math.cos(time * 1.5)) * 0.8;

          // Stay low
          const crouch = 20;
          headY += crouch; chestY += crouch; hipY += crouch; shoulderY += crouch;
          lKneeY += crouch / 2; rKneeY += crouch / 2;

          lShoulderX = centerX - 25;
          rShoulderX = centerX + 25;
          lKneeX = centerX - 25;
          rKneeX = centerX + 25;
          
          lFootX = centerX - 45;
          rFootX = centerX + 45;

          // Arms out wide
          lHandX = centerX - 75;
          lHandY = baseHeight;
          rHandX = centerX + 75;
          rHandY = baseHeight;
        } else if (activityType === 'Ergonomic Posture Check') {
          // Tiny micro-movements to simulate breathing
          const breathe = Math.sin(time * 0.8);
          simulatedMotionFactor = Math.abs(breathe) * 0.08;
          chestY += breathe * 1.5;
          shoulderY += breathe * 1.2;
          lHandY += breathe * 2;
          rHandY += breathe * 2;
        } else if (activityType === '1v1 Streetball Battle') {
          // --- 1v1 STREETBALL BATTLE SIMULATOR ---
          const phase = (time % 6);
          bounceSpeed = 4;
          crouch = 10;
          let releaseShot = false;
          let ballAirborne = false;
          let ballAirProgress = 0;

          if (phase < 2.0) {
            // 1. Sizing up / Crossover
            centerX = width * 0.45 + Math.sin(time * 5.0) * 20;
            bounceSpeed = 8;
            crouch = 20;
            simulatedMotionFactor = 0.6;
          } else if (phase < 3.8) {
            // 2. Explode and drive right!
            const progress = (phase - 2.0) / 1.8;
            const startX = width * 0.45 + Math.sin(2.0 * 5.0) * 20;
            const endX = width * 0.65;
            centerX = startX + progress * (endX - startX);
            bounceSpeed = 12;
            crouch = 25;
            simulatedMotionFactor = 0.9;
          } else if (phase < 4.8) {
            // 3. Step-back jumper space creation
            const progress = (phase - 3.8) / 1.0;
            const startX = width * 0.65;
            const endX = width * 0.50;
            centerX = startX - progress * (startX - endX);
            // Hop in the air slightly
            const hop = Math.sin(progress * Math.PI) * 15;
            headY -= hop; chestY -= hop; hipY -= hop; shoulderY -= hop;
            lKneeY -= hop/2; rKneeY -= hop/2;
            bounceSpeed = 0; // stop dribbling
            crouch = 15;
            simulatedMotionFactor = 0.8;
          } else {
            // 4. Pull-up jump shot release
            centerX = width * 0.50;
            const progress = (phase - 4.8) / 1.2;
            crouch = 5;
            
            // Rise for jumper
            const jumpHeight = Math.sin(Math.min(1, progress * 1.5) * Math.PI) * 45;
            headY -= jumpHeight; chestY -= jumpHeight; hipY -= jumpHeight; shoulderY -= jumpHeight;
            lKneeY -= jumpHeight/2; rKneeY -= jumpHeight/2;
            lFootY -= jumpHeight; rFootY -= jumpHeight;

            releaseShot = true;
            if (progress > 0.2) {
              ballAirborne = true;
              ballAirProgress = Math.min(1.0, (progress - 0.2) / 0.8);
            }
            simulatedMotionFactor = 0.4;
          }

          // Offense body bouncing with the steps/dribbles
          const stepBounce = bounceSpeed > 0 ? Math.abs(Math.sin(time * bounceSpeed)) * 6 : 0;
          headY += stepBounce; chestY += stepBounce; hipY += stepBounce; shoulderY += stepBounce;

          // Assign arm positions based on crossover / dribble
          if (bounceSpeed > 0) {
            const ballCycle = Math.sin(time * bounceSpeed);
            if (ballCycle > 0) {
              // Ball on right side
              rHandX = centerX + 35;
              rHandY = baseHeight + stepBounce + 15;
              lHandX = centerX - 30;
              lHandY = baseHeight - 15;
            } else {
              // Ball on left side
              lHandX = centerX - 35;
              lHandY = baseHeight + stepBounce + 15;
              rHandX = centerX + 30;
              rHandY = baseHeight - 15;
            }
          } else if (releaseShot) {
            // High release shot hands
            rHandX = centerX + 15;
            rHandY = headY - 35;
            lHandX = centerX - 10;
            lHandY = headY - 25;
          } else {
            // Gather hands
            rHandX = centerX + 12;
            rHandY = chestY - 10;
            lHandX = centerX - 12;
            lHandY = chestY - 5;
          }

          // Apply Crouch to joints
          headY += crouch; chestY += crouch; hipY += crouch; shoulderY += crouch;
          lKneeY += crouch / 2; rKneeY += crouch / 2;
          lShoulderX = centerX - 20; rShoulderX = centerX + 20;
          lKneeX = centerX - 18; rKneeX = centerX + 18;
          lFootX = centerX - 25; rFootX = centerX + 25;
        } else {
          // General Athletic Movement
          const cycle = Math.sin(time * 1.2);
          simulatedMotionFactor = Math.abs(cycle) * 0.5;
          centerX = width * 0.5 + cycle * 30;
          lHandY = baseHeight - 10 + Math.sin(time * 3) * 30;
          rHandY = baseHeight - 10 + Math.cos(time * 3) * 30;
        }

        // Update & Draw Motion Trail in Demo Mode
        if (isTrailActive) {
          trailPointsRef.current.push({ x: centerX, y: chestY, time: Date.now() });
          if (trailPointsRef.current.length > trailLength) {
            trailPointsRef.current.shift();
          }
          drawMotionTrail(ctx);
        }

        // Draw Simulated Skeleton on main canvas
        if (activityType === '1v1 Streetball Battle') {
          // --- DRAW DUAL 1v1 STREETBALL SKELETONS ---
          const defenderPhase = (time % 6);
          let defenderCenterX = centerX + 65; 
          let defenderCrouch = 25; 
          let defenderRise = 0;

          if (defenderPhase < 2.0) {
            defenderCenterX = centerX + 70 + Math.sin(time * 3.0) * 10;
          } else if (defenderPhase < 3.8) {
            defenderCenterX = centerX + 55;
          } else if (defenderPhase < 4.8) {
            defenderCenterX = centerX + 90;
          } else {
            defenderCenterX = centerX + 60;
            const progress = (defenderPhase - 4.8) / 1.2;
            defenderRise = Math.sin(Math.min(1, progress * 1.6) * Math.PI) * 35;
          }

          const drawOneSkeleton = (cx: number, bHeight: number, cr: number, rise: number, isOffense: boolean) => {
            const headOffset = -70 - rise;
            const chestOffset = -40 - rise;
            const hipOffset = rise;
            const shoulderOffset = -40 - rise;

            const skHeadY = bHeight + headOffset + cr;
            const skChestY = bHeight + chestOffset + cr;
            const skHipY = bHeight + hipOffset + cr;
            const skShoulderY = bHeight + shoulderOffset + cr;

            const lShoulder = cx - 20;
            const rShoulder = cx + 20;

            let skLHandX = cx - 45;
            let skLHandY = bHeight - 10 - rise;
            let skRHandX = cx + 45;
            let skRHandY = bHeight - 10 - rise;

            if (isOffense) {
              skLHandX = lHandX;
              skLHandY = lHandY;
              skRHandX = rHandX;
              skRHandY = rHandY;
            } else {
              const shootProg = (time % 6);
              if (shootProg >= 4.8) {
                skLHandX = cx - 20;
                skLHandY = skHeadY - 30;
                skRHandX = cx + 15;
                skRHandY = skHeadY - 45;
              } else {
                skLHandX = cx - 55 + Math.sin(time * 5) * 5;
                skLHandY = bHeight - 20 + Math.cos(time * 5) * 15;
                skRHandX = cx + 55 + Math.cos(time * 5) * 5;
                skRHandY = bHeight - 20 + Math.sin(time * 5) * 15;
              }
            }

            const skLKneeX = cx - 18;
            const skLKneeY = bHeight + 35 + cr/2 - rise/2;
            const skRKneeX = cx + 18;
            const skRKneeY = bHeight + 35 + cr/2 - rise/2;

            const skLFootX = cx - 25;
            const skLFootY = bHeight + 70 - rise;
            const skRFootX = cx + 25;
            const skRFootY = bHeight + 70 - rise;

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = isOffense ? '#10B981' : '#EF4444';
            ctx.lineWidth = 4;
            ctx.strokeStyle = isOffense ? '#34D399' : '#F87171';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Draw spine
            ctx.beginPath();
            ctx.moveTo(cx, skHeadY);
            ctx.lineTo(cx, skChestY);
            ctx.lineTo(cx, skHipY);
            ctx.stroke();

            // Shoulders
            ctx.beginPath();
            ctx.moveTo(lShoulder, skShoulderY);
            ctx.lineTo(rShoulder, skShoulderY);
            ctx.stroke();

            // Left Arm
            ctx.beginPath();
            ctx.moveTo(lShoulder, skShoulderY);
            ctx.lineTo(cx - 35, (skShoulderY + skLHandY) / 2);
            ctx.lineTo(skLHandX, skLHandY);
            ctx.stroke();

            // Right Arm
            ctx.beginPath();
            ctx.moveTo(rShoulder, skShoulderY);
            ctx.lineTo(cx + 35, (skShoulderY + skRHandY) / 2);
            ctx.lineTo(skRHandX, skRHandY);
            ctx.stroke();

            // Left Leg
            ctx.beginPath();
            ctx.moveTo(cx - 10, skHipY);
            ctx.lineTo(skLKneeX, skLKneeY);
            ctx.lineTo(skLFootX, skLFootY);
            ctx.stroke();

            // Right Leg
            ctx.beginPath();
            ctx.moveTo(cx + 10, skHipY);
            ctx.lineTo(skRKneeX, skRKneeY);
            ctx.lineTo(skRFootX, skRFootY);
            ctx.stroke();

            // Head joint
            ctx.fillStyle = isOffense ? '#10B981' : '#EF4444';
            ctx.beginPath();
            ctx.arc(cx, skHeadY, 12, 0, Math.PI * 2);
            ctx.fill();

            // Glow joints
            ctx.fillStyle = '#FFFFFF';
            const jts = [
              [cx, skChestY], [cx, skHipY],
              [lShoulder, skShoulderY], [rShoulder, skShoulderY],
              [skLHandX, skLHandY], [skRHandX, skRHandY],
              [skLKneeX, skLKneeY], [skRKneeX, skRKneeY],
              [skLFootX, skLFootY], [skRFootX, skRFootY]
            ];
            jts.forEach(j => {
              ctx.beginPath();
              ctx.arc(j[0], j[1], 4.5, 0, Math.PI * 2);
              ctx.fill();
            });

            ctx.restore();
          };

          drawOneSkeleton(defenderCenterX, baseHeight, defenderCrouch, defenderRise, false);
          drawOneSkeleton(centerX, baseHeight, crouch, 0, true);

          // --- NEON BASKETBALL BACKBOARD & HOOP ---
          ctx.save();
          const hoopX = width * 0.12;
          const hoopY = height * 0.35;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#F59E0B';
          
          // Backboard
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.lineWidth = 2;
          ctx.strokeRect(hoopX - 25, hoopY - 35, 50, 35);
          ctx.strokeRect(hoopX - 10, hoopY - 20, 20, 15);

          // Rim
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(hoopX, hoopY, 14, 5, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Net
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1;
          for (let nx = -12; nx <= 12; nx += 6) {
            ctx.beginPath();
            ctx.moveTo(hoopX + nx, hoopY);
            ctx.lineTo(hoopX + nx / 2, hoopY + 18);
            ctx.stroke();
          }
          ctx.restore();

          // --- DRAW BALL ---
          ctx.save();
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#F59E0B';
          ctx.fillStyle = '#FB923C';
          
          let bX = 0;
          let bY = 0;

          const shootProg = (time % 6);
          if (shootProg >= 4.8 && shootProg < 6.0) {
            const p = (shootProg - 4.8) / 1.2;
            const startBallX = centerX + 15;
            const startBallY = baseHeight - 70 - 35 + crouch; 
            const endBallX = hoopX;
            const endBallY = hoopY;

            const hArc = -90;
            const arcY = Math.sin(p * Math.PI) * hArc;

            bX = startBallX + p * (endBallX - startBallX);
            bY = (startBallY + p * (endBallY - startBallY)) + arcY;
          } else {
            const ballCycle = Math.sin(time * bounceSpeed);
            if (bounceSpeed > 0) {
              if (ballCycle > 0) {
                bX = centerX + 35 - (1 - ballCycle) * 10;
                bY = rHandY + (1 - ballCycle) * (height * 0.85 - rHandY);
              } else {
                bX = centerX - 35 + (1 + ballCycle) * 10;
                bY = lHandY + (1 + ballCycle) * (height * 0.85 - lHandY);
              }
            } else {
              bX = centerX;
              bY = chestY + 5;
            }
          }

          ctx.beginPath();
          ctx.arc(bX, bY, 7, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bX - 7, bY);
          ctx.lineTo(bX + 7, bY);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(bX, bY - 7);
          ctx.lineTo(bX, bY + 7);
          ctx.stroke();
          ctx.restore();

          // HUD overlays
          const currentSpacing = (Math.abs(centerX - defenderCenterX) / 25).toFixed(1);
          let contestRating = 'LOW';
          let contestColor = '#10B981';
          const distance = Math.abs(centerX - defenderCenterX);
          if (distance < 50) {
            contestRating = 'EXTREME';
            contestColor = '#EF4444';
          } else if (distance < 75) {
            contestRating = 'HIGH';
            contestColor = '#F59E0B';
          } else if (distance < 110) {
            contestRating = 'MODERATE';
            contestColor = '#3B82F6';
          }

          ctx.save();
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = '#34D399';
          ctx.lineWidth = 1.2;
          ctx.fillRect(15, 45, 175, 50);
          ctx.strokeRect(15, 45, 175, 50);

          ctx.fillStyle = '#34D399';
          ctx.font = 'bold 8.5px monospace';
          ctx.fillText(`SPACING: ${currentSpacing} FT`, 22, 58);
          ctx.fillStyle = contestColor;
          ctx.fillText(`CONTEST: ${contestRating}`, 22, 70);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 7.5px monospace';
          ctx.fillText(`ISO PHASE: ${shootProg < 2.0 ? 'CROSSOVER' : shootProg < 3.8 ? 'DRIVE RIGHT' : shootProg < 4.8 ? 'STEP BACK' : 'JUMP SHOT'}`, 22, 82);
          ctx.restore();

          // Set metrics
          const computedPct = Math.min(100, Math.max(0, simulatedMotionFactor * 75 + Math.random() * 5));
          currentMotionPct = Math.round(computedPct);

          skeletonCoordsRef.current = {
            head: { x: centerX, y: headY },
            chest: { x: centerX, y: chestY },
            hip: { x: centerX, y: hipY },
            rHand: { x: rHandX, y: rHandY },
            lHand: { x: lHandX, y: lHandY },
            rFoot: { x: rFootX, y: rFootY },
            lFoot: { x: lFootX, y: lFootY }
          };
        } else {
          // Shadows/Glow
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#10B981';

          // Connect joints
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#34D399'; // Emerald-400
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Spine and Hips
          ctx.beginPath();
          ctx.moveTo(centerX, headY);
          ctx.lineTo(centerX, chestY);
          ctx.lineTo(centerX, hipY);
          ctx.stroke();

          // Shoulders
          ctx.beginPath();
          ctx.moveTo(lShoulderX, shoulderY);
          ctx.lineTo(rShoulderX, shoulderY);
          ctx.stroke();

          // Left Arm
          ctx.beginPath();
          ctx.moveTo(lShoulderX, shoulderY);
          ctx.lineTo(centerX - 35, (shoulderY + lHandY) / 2); // Elbow
          ctx.lineTo(lHandX, lHandY);
          ctx.stroke();

          // Right Arm
          ctx.beginPath();
          ctx.moveTo(rShoulderX, shoulderY);
          ctx.lineTo(centerX + 35, (shoulderY + rHandY) / 2); // Elbow
          ctx.lineTo(rHandX, rHandY);
          ctx.stroke();

          // Hips to feet (Left Leg)
          ctx.beginPath();
          ctx.moveTo(centerX - 10, hipY);
          ctx.lineTo(lKneeX, lKneeY);
          ctx.lineTo(lFootX, lFootY);
          ctx.stroke();

          // Hips to feet (Right Leg)
          ctx.beginPath();
          ctx.moveTo(centerX + 10, hipY);
          ctx.lineTo(rKneeX, rKneeY);
          ctx.lineTo(rFootX, rFootY);
          ctx.stroke();

          // Head joint
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.arc(centerX, headY, 12, 0, Math.PI * 2);
          ctx.fill();

          // Draw joints as glowing dots
          ctx.fillStyle = '#FFFFFF';
          const joints = [
            [centerX, chestY], [centerX, hipY],
            [lShoulderX, shoulderY], [rShoulderX, shoulderY],
            [lHandX, lHandY], [rHandX, rHandY],
            [lKneeX, lKneeY], [rKneeX, rKneeY],
            [lFootX, lFootY], [rFootX, rFootY]
          ];
          joints.forEach(j => {
            ctx.beginPath();
            ctx.arc(j[0], j[1], 5, 0, Math.PI * 2);
            ctx.fill();
          });

          // Reset shadow
          ctx.shadowBlur = 0;

          // Draw HUD overlay on display canvas
          ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
          ctx.strokeStyle = '#34D399';
          ctx.lineWidth = 1;
          ctx.strokeRect(centerX - 80, headY - 30, 160, baseHeight + 110 - headY);
          ctx.fillRect(centerX - 80, headY - 30, 160, 20);
          
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('LIVE VECTOR ANGLE TRACKER', centerX, headY - 17);

          // Angle lines labels
          ctx.fillStyle = '#A7F3D0';
          ctx.fillText(`Knee: ${activityType === 'Defensive Lateral Slide' ? '128°' : '142°'}`, lKneeX - 25, lKneeY);
          ctx.fillText(`Elbow: ${activityType === 'Basketball Shooting' ? '89°' : '174°'}`, rHandX + 25, rHandY - 15);

          // Live Simulated Motion Value
          const computedPct = Math.min(100, Math.max(0, simulatedMotionFactor * 75 + Math.random() * 5));
          currentMotionPct = Math.round(computedPct);

          // Save skeleton coordinates for caption snapshot
          skeletonCoordsRef.current = {
            head: { x: centerX, y: headY },
            chest: { x: centerX, y: chestY },
            hip: { x: centerX, y: hipY },
            rHand: { x: rHandX, y: rHandY },
            lHand: { x: lHandX, y: lHandY },
            rFoot: { x: rFootX, y: rFootY },
            lFoot: { x: lFootX, y: lFootY }
          };
        }

      } else {
        // --- REAL WEBCAM MODE ---
        const baseHeight = height * 0.55;
        if (video && video.readyState >= 2 && video.videoWidth > 0) {
          currentFrameWidth = video.videoWidth;
          currentFrameHeight = video.videoHeight;
          
          // Match Canvas sizes to stream
          if (canvas.width !== currentFrameWidth || canvas.height !== currentFrameHeight) {
            canvas.width = currentFrameWidth;
            canvas.height = currentFrameHeight;
            procCanvas.width = Math.floor(currentFrameWidth / motionSensitivity);
            procCanvas.height = Math.floor(currentFrameHeight / motionSensitivity);
          }

          // Step 1: Draw live video onto display canvas (handling mirror mode)
          ctx.save();
          if (isMirrored) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          } else {
            ctx.translate(0, 0);
            ctx.scale(1, 1);
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.restore();

          // Step 2: Draw smaller frame on hidden processing canvas to analyze pixel differences
          pctx.save();
          if (isMirrored) {
            pctx.translate(procCanvas.width, 0);
            pctx.scale(-1, 1);
          } else {
            pctx.translate(0, 0);
            pctx.scale(1, 1);
          }
          pctx.drawImage(video, 0, 0, procCanvas.width, procCanvas.height);
          pctx.restore();

          // Step 3: Compute pixel changes
          try {
            const currentFrameData = pctx.getImageData(0, 0, procCanvas.width, procCanvas.height).data;
            
            if (prevFrameDataRef.current) {
              const prevFrameData = prevFrameDataRef.current;
              let changedPixelCount = 0;
              const totalPixels = procCanvas.width * procCanvas.height;

              let minX = procCanvas.width;
              let maxX = 0;
              let minY = procCanvas.height;
              let maxY = 0;

              for (let i = 0; i < currentFrameData.length; i += 4) {
                const rDiff = Math.abs(currentFrameData[i] - prevFrameData[i]);
                const gDiff = Math.abs(currentFrameData[i + 1] - prevFrameData[i + 1]);
                const bDiff = Math.abs(currentFrameData[i + 2] - prevFrameData[i + 2]);
                
                // Average difference
                const avgDiff = (rDiff + gDiff + bDiff) / 3;

                if (avgDiff > motionThreshold) {
                  changedPixelCount++;
                  
                  // Track coordinates for movement bounding box
                  const pixelIndex = i / 4;
                  const px = pixelIndex % procCanvas.width;
                  const py = Math.floor(pixelIndex / procCanvas.width);

                  if (px < minX) minX = px;
                  if (px > maxX) maxX = px;
                  if (py < minY) minY = py;
                  if (py > maxY) maxY = py;
                }
              }

              // Compute percent of frame currently in motion
              const motionPct = (changedPixelCount / totalPixels) * 100;
              currentMotionPct = Math.round(motionPct * 2.5);

              // Draw Bounding box around motion on the display canvas
              if (changedPixelCount > 15) {
                const scaleX = width / procCanvas.width;
                const scaleY = height / procCanvas.height;

                const boxX = minX * scaleX;
                const boxY = minY * scaleY;
                const boxW = (maxX - minX) * scaleX;
                const boxH = (maxY - minY) * scaleY;

                // Clean green bounding rectangle overlay for detected motion
                ctx.strokeStyle = '#34D399';
                ctx.lineWidth = 2.5;
                ctx.strokeRect(boxX, boxY, boxW, boxH);

                // Subtle transparent fill inside bounding box
                ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
                ctx.fillRect(boxX, boxY, boxW, boxH);

                // Corner accents for target reticle effect
                const cornerLen = Math.min(12, boxW / 4, boxH / 4);
                ctx.strokeStyle = '#10B981';
                ctx.lineWidth = 3;
                // Top-Left corner
                ctx.beginPath();
                ctx.moveTo(boxX, boxY + cornerLen);
                ctx.lineTo(boxX, boxY);
                ctx.lineTo(boxX + cornerLen, boxY);
                ctx.stroke();
                // Top-Right corner
                ctx.beginPath();
                ctx.moveTo(boxX + boxW - cornerLen, boxY);
                ctx.lineTo(boxX + boxW, boxY);
                ctx.lineTo(boxX + boxW, boxY + cornerLen);
                ctx.stroke();
                // Bottom-Left corner
                ctx.beginPath();
                ctx.moveTo(boxX, boxY + boxH - cornerLen);
                ctx.lineTo(boxX, boxY + boxH);
                ctx.lineTo(boxX + cornerLen, boxY + boxH);
                ctx.stroke();
                // Bottom-Right corner
                ctx.beginPath();
                ctx.moveTo(boxX + boxW - cornerLen, boxY + boxH);
                ctx.lineTo(boxX + boxW, boxY + boxH);
                ctx.lineTo(boxX + boxW, boxY + boxH - cornerLen);
                ctx.stroke();

                // Label
                ctx.fillStyle = '#34D399';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('LIVE MOTION DETECTED', boxX + 6, boxY + 14);

                // Track center for analytics
                const trackX = boxX + boxW / 2;
                const trackY = boxY + boxH / 2;

                // If 1v1 Streetball Battle mode, draw the defender without connecting lines
                if (activityType === '1v1 Streetball Battle') {
                  // Defender chases the user!
                  const targetDefX = trackX + 100 * (trackX < width * 0.5 ? 1 : -1);
                  webcamDefenderXRef.current += (targetDefX - webcamDefenderXRef.current) * 0.12;
                  
                  const defX = webcamDefenderXRef.current;
                  const defY = baseHeight + 25; // low stance
                  
                  // Let's animate defender stance
                  const defCrouch = 25;
                  const defTime = Date.now() / 1000;
                  
                  // If user moves rapidly (high motion), defender raises hands high to contest!
                  const isContesting = currentMotionPct > 35 || trackY < height * 0.45;
                  
                  const skHeadY = defY - 70 + defCrouch;
                  const skChestY = defY - 40 + defCrouch;
                  const skHipY = defY + defCrouch;
                  const skShoulderY = defY - 40 + defCrouch;
                  
                  const lShoulder = defX - 22;
                  const rShoulder = defX + 22;
                  
                  let skLHandX = defX - 45;
                  let skLHandY = defY - 15;
                  let skRHandX = defX + 45;
                  let skRHandY = defY - 15;
                  
                  if (isContesting) {
                    // Hands straight up!
                    skLHandX = defX - 15;
                    skLHandY = skHeadY - 35;
                    skRHandX = defX + 15;
                    skRHandY = skHeadY - 45;
                  } else {
                    // Wingspan wide
                    skLHandX = defX - 60 + Math.sin(defTime * 6) * 5;
                    skLHandY = defY - 5 + Math.cos(defTime * 6) * 10;
                    skRHandX = defX + 60 + Math.cos(defTime * 6) * 5;
                    skRHandY = defY - 5 + Math.sin(defTime * 6) * 10;
                  }
                  
                  const skLKneeX = defX - 20;
                  const skLKneeY = defY + 35 + defCrouch/2;
                  const skRKneeX = defX + 20;
                  const skRKneeY = defY + 35 + defCrouch/2;
                  
                  const skLFootX = defX - 28;
                  const skLFootY = defY + 70;
                  const skRFootX = defX + 28;
                  const skRFootY = defY + 70;
                  
                  ctx.save();
                  ctx.shadowBlur = 15;
                  ctx.shadowColor = '#EF4444'; // Holographic Rose/Red
                  ctx.lineWidth = 4.5;
                  ctx.strokeStyle = '#F87171';
                  ctx.lineCap = 'round';
                  ctx.lineJoin = 'round';
                  
                  // Spine
                  ctx.beginPath();
                  ctx.moveTo(defX, skHeadY);
                  ctx.lineTo(defX, skChestY);
                  ctx.lineTo(defX, skHipY);
                  ctx.stroke();
                  
                  // Shoulders
                  ctx.beginPath();
                  ctx.moveTo(lShoulder, skShoulderY);
                  ctx.lineTo(rShoulder, skShoulderY);
                  ctx.stroke();
                  
                  // Arms
                  ctx.beginPath();
                  ctx.moveTo(lShoulder, skShoulderY);
                  ctx.lineTo(defX - 35, (skShoulderY + skLHandY) / 2);
                  ctx.lineTo(skLHandX, skLHandY);
                  ctx.stroke();
                  
                  ctx.beginPath();
                  ctx.moveTo(rShoulder, skShoulderY);
                  ctx.lineTo(defX + 35, (skShoulderY + skRHandY) / 2);
                  ctx.lineTo(skRHandX, skRHandY);
                  ctx.stroke();
                  
                  // Legs
                  ctx.beginPath();
                  ctx.moveTo(defX - 10, skHipY);
                  ctx.lineTo(skLKneeX, skLKneeY);
                  ctx.lineTo(skLFootX, skLFootY);
                  ctx.stroke();
                  
                  ctx.beginPath();
                  ctx.moveTo(defX + 10, skHipY);
                  ctx.lineTo(skRKneeX, skRKneeY);
                  ctx.lineTo(skRFootX, skRFootY);
                  ctx.stroke();
                  
                  // Head
                  ctx.fillStyle = '#EF4444';
                  ctx.beginPath();
                  ctx.arc(defX, skHeadY, 12, 0, Math.PI * 2);
                  ctx.fill();
                  
                  // Joints glow dots
                  ctx.fillStyle = '#FFFFFF';
                  const jts = [
                    [defX, skChestY], [defX, skHipY],
                    [lShoulder, skShoulderY], [rShoulder, skShoulderY],
                    [skLHandX, skLHandY], [skRHandX, skRHandY],
                    [skLKneeX, skLKneeY], [skRKneeX, skRKneeY],
                    [skLFootX, skLFootY], [skRFootX, skRFootY]
                  ];
                  jts.forEach(j => {
                    ctx.beginPath();
                    ctx.arc(j[0], j[1], 4.5, 0, Math.PI * 2);
                    ctx.fill();
                  });
                  
                  ctx.restore();
                  
                  // Draw 1v1 telemetry HUD in bottom left
                  ctx.save();
                  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
                  ctx.strokeStyle = '#EF4444';
                  ctx.lineWidth = 1;
                  ctx.fillRect(15, height - 75, 170, 55);
                  ctx.strokeRect(15, height - 75, 170, 55);
                  
                  ctx.fillStyle = '#F87171';
                  ctx.font = 'bold 8.5px monospace';
                  ctx.fillText(`GUARD_BOT_V2.0 CONNECTED`, 22, height - 61);
                  
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillText(`CONTEST: ${isContesting ? '92% (EXTREME BLOCK)' : '28% (SLIGHTLY OPEN)'}`, 22, height - 49);
                  ctx.fillText(`USER ISO VELOCITY: ${currentMotionPct} MPH`, 22, height - 37);
                  ctx.fillText(`DEFENDER GAP: ${changedPixelCount > 15 ? (Math.abs(trackX - defX) / 25).toFixed(1) + ' FT' : 'STANDBY'}`, 22, height - 25);
                  ctx.restore();
                }
              } else {
                // Even if no movement, keep rendering defender at standby
                if (activityType === '1v1 Streetball Battle') {
                  const defX = webcamDefenderXRef.current;
                  const defY = baseHeight + 25;
                  const defCrouch = 25;
                  const skHeadY = defY - 70 + defCrouch;
                  const skChestY = defY - 40 + defCrouch;
                  const skHipY = defY + defCrouch;
                  const skShoulderY = defY - 40 + defCrouch;
                  
                  ctx.save();
                  ctx.shadowBlur = 10;
                  ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';
                  ctx.lineWidth = 3;
                  ctx.strokeStyle = 'rgba(248, 113, 113, 0.4)';
                  ctx.lineCap = 'round';
                  ctx.lineJoin = 'round';
                  
                  ctx.beginPath();
                  ctx.moveTo(defX, skHeadY);
                  ctx.lineTo(defX, skChestY);
                  ctx.lineTo(defX, skHipY);
                  ctx.stroke();

                  ctx.beginPath();
                  ctx.moveTo(defX - 22, skShoulderY);
                  ctx.lineTo(defX + 22, skShoulderY);
                  ctx.stroke();

                  ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
                  ctx.beginPath();
                  ctx.arc(defX, skHeadY, 12, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.restore();
                }
              }

              if (isTrailActive && isDemoMode) {
                drawMotionTrail(ctx);
              }
            }

            // Draw RFDETR Supervision Annotator (BoxAnnotator + LabelAnnotator)
            if (isRfOverlayEnabled && rfDetectionsRef.current && rfDetectionsRef.current.length > 0) {
              rfDetectionsRef.current.forEach((det, idx) => {
                const color = getSupervisionColor(det.class_id);
                let ymin = 0, xmin = 0, ymax = 0, xmax = 0;

                if (det.box_2d && det.box_2d.length === 4) {
                  [ymin, xmin, ymax, xmax] = det.box_2d;
                } else if (det.xyxy && det.xyxy.length === 4) {
                  [xmin, ymin, xmax, ymax] = det.xyxy;
                }

                const bx = (xmin / 1000) * width;
                const by = (ymin / 1000) * height;
                const bw = Math.max(12, ((xmax - xmin) / 1000) * width);
                const bh = Math.max(12, ((ymax - ymin) / 1000) * height);

                ctx.save();
                
                // 1. sv.BoxAnnotator
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                if (ctx.roundRect) {
                  ctx.roundRect(bx, by, bw, bh, 4);
                } else {
                  ctx.strokeRect(bx, by, bw, bh);
                }
                ctx.stroke();

                ctx.fillStyle = `${color}18`;
                ctx.fillRect(bx, by, bw, bh);

                // 2. sv.LabelAnnotator
                const rawLabel = rfLabelsRef.current[idx] || `${COCO_CLASSES[det.class_id] || det.class_name}`;
                const displayTag = `${rawLabel.toUpperCase()} ${(det.confidence * 100).toFixed(0)}%`;
                
                ctx.font = 'bold 11px monospace';
                const textWidth = ctx.measureText(displayTag).width;
                const pillW = textWidth + 14;
                const pillH = 20;
                const pillX = bx;
                const pillY = Math.max(0, by - pillH);

                ctx.fillStyle = color;
                ctx.beginPath();
                if (ctx.roundRect) {
                  ctx.roundRect(pillX, pillY, pillW, pillH, [4, 4, 0, 0]);
                } else {
                  ctx.fillRect(pillX, pillY, pillW, pillH);
                }
                ctx.fill();

                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = 'left';
                ctx.fillText(displayTag, pillX + 6, pillY + 14);

                ctx.restore();
              });
            }

            // Save current frame for the next check
            prevFrameDataRef.current = currentFrameData;

          } catch (e) {
            console.warn('Canvas image reading exception:', e);
          }
        }
      }

      // --- COMMON MOTION TRACKING ANALYTICS & REPS COUNTER ---
      // Update historical stream of motion percentages
      const history = [...motionHistoryRef.current];
      history.shift();
      history.push(currentMotionPct);
      motionHistoryRef.current = history;

      // Peak Tracker
      setPeakMotionPct(prev => Math.max(prev, currentMotionPct));

      // Count reps / active movement cycles based on peak/valley thresholds
      const peakThreshold = activityType === 'Ergonomic Posture Check' ? 5 : 20;
      const valleyThreshold = activityType === 'Ergonomic Posture Check' ? 2 : 10;

      if (currentMotionPct > peakThreshold && !isRepPeakRef.current && !repCooldownRef.current) {
        isRepPeakRef.current = true;
      }

      if (currentMotionPct < valleyThreshold && isRepPeakRef.current) {
        isRepPeakRef.current = false;
        // Trigger a rep completion!
        setRepCount(rc => rc + 1);
        // Cooldown to prevent double counts in quick successions
        repCooldownRef.current = true;
        setTimeout(() => {
          repCooldownRef.current = false;
        }, 650);
      }

      // Update the React state exactly ONCE at the end of the frame
      setLiveMotionPct(currentMotionPct);

      // Calculate dynamic speed activity index (Rep rate)
      const secondsActive = (Date.now() - trackingStartTimeRef.current) / 1000;
      if (secondsActive > 3) {
        const cpm = (repCount / secondsActive) * 60;
        setActivityRate(Math.round(cpm * 10) / 10);
      }

      setTrailPointsCount(trailPointsRef.current.length);

      requestRef.current = requestAnimationFrame(updateMotion);
    };

    requestRef.current = requestAnimationFrame(updateMotion);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isTracking, isDemoMode, activityType, motionThreshold, motionSensitivity, repCount, isTrailActive, trailStyle, trailLength, playbackFps]);

  // Handle Snapshot Capture and server-side analysis request
  const handleAnalyzeSnapshot = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const displayCanvas = displayCanvasRef.current;
      if (!displayCanvas) {
        throw new Error('Canvas not available');
      }

      let imageBase64 = '';

      if (isDemoMode) {
        // In Demo mode, we capture the simulated vector skeleton drawn on the canvas!
        imageBase64 = displayCanvas.toDataURL('image/jpeg', 0.85);
      } else {
        // In live camera mode, we capture the active frame from canvas
        imageBase64 = displayCanvas.toDataURL('image/jpeg', 0.85);
      }

      // POST to our server API
      const response = await fetch('/api/ai-analyze-motion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: imageBase64,
          activityType: activityType,
          additionalNotes: additionalNotes
        })
      });

      if (!response.ok) {
        throw new Error('Server analysis endpoint failed');
      }

      const data = await response.json();
      if (data.success) {
        setAnalysisResult({
          activityDetected: data.activityDetected,
          motionRating: data.motionRating,
          biomechanicsCaption: data.biomechanicsCaption,
          coachingTips: data.coachingTips,
          jointAlignmentScore: data.jointAlignmentScore,
          movementBalance: data.movementBalance
        });
      } else {
        throw new Error(data.error || 'Unknown analysis error');
      }

    } catch (error: any) {
      console.error('Error analyzing motion snapshot:', error);
      // Fallback local mock simulation
      setTimeout(() => {
        setAnalysisResult({
          activityDetected: activityType + ' (Simulated Tracking)',
          motionRating: activityType === 'Basketball Shooting' ? 'Needs Realignment' : 'Good',
          biomechanicsCaption: `Active kinetic alignment processed. Our simulated biomechanics engine detected your stance and lateral velocity shift. Movement cycles are running symmetrically.`,
          coachingTips: [
            'Keep your core tightly active to absorb vertical force.',
            'Maintain wide feet spacing to optimize lateral transition speed.'
          ],
          jointAlignmentScore: activityType === 'Basketball Shooting' ? 78 : 88,
          movementBalance: activityType === 'Basketball Shooting' ? 'Forward-lean' : 'Symmetric'
        });
      }, 1000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetMetrics = () => {
    setRepCount(0);
    setPeakMotionPct(0);
    setActivityRate(0);
    trackingStartTimeRef.current = Date.now();
  };

  const getLiveFrameBase64 = (): string | null => {
    if (displayCanvasRef.current) {
      return displayCanvasRef.current.toDataURL('image/jpeg', 0.85);
    }
    return null;
  };

  const handleSelectPresetImage = (url: string) => {
    setActivePresetImageUrl(url);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      presetImageRef.current = img;
      if (displayCanvasRef.current) {
        const ctx = displayCanvasRef.current.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, displayCanvasRef.current.width, displayCanvasRef.current.height);
        }
      }
    };
    img.src = url;
  };

  return (
    <div className="bg-surface-container-lowest/60 border border-outline-variant/10 rounded-3xl p-6 space-y-6 text-left shadow-xl" id="camera-motion-tracker-panel">
      
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/10 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-mono font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1.5 w-fit">
              <Zap className="w-3 h-3 text-emerald-400 animate-pulse" /> COMPUTER VISION & TRANSFORMER AI
            </span>
            <span className="text-[9px] font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3" /> RFDETRMedium + supervision
            </span>
          </div>
          <h2 className="text-2xl font-headline font-extrabold text-white tracking-tight flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" /> Live Motion Analysis & Supervision Tracking
          </h2>
          <p className="text-xs text-on-surface-variant max-w-2xl">
            Real-time transformer detection powered by <strong className="text-purple-300">RFDETRMedium</strong> and <strong className="text-emerald-300">supervision (sv)</strong> BoxAnnotator & LabelAnnotator alongside kinetic motion tracking and AI coaching captions.
          </p>
        </div>

        {/* Top Toggles */}
        <div className="flex flex-wrap items-center gap-2 bg-surface-container/60 p-1.5 rounded-2xl border border-outline-variant/10 shadow-inner">
          <button
            onClick={() => {
              setIsDemoMode(false);
              setIsCameraActive(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-1 ${
              !isDemoMode && !isFullview
                ? 'bg-primary text-black shadow font-black' 
                : 'text-on-surface-variant hover:text-white hover:bg-white/5'
            }`}
          >
            <Video className="w-3.5 h-3.5" /> LIVE WEBCAM
          </button>
          <button
            onClick={() => {
              setIsDemoMode(false);
              setIsCameraActive(true);
              setIsFullview(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-1 ${
              isFullview 
                ? 'bg-primary text-black shadow font-black' 
                : 'text-primary/90 bg-primary/10 hover:bg-primary/20 border border-primary/30'
            }`}
            title="Expand webcam to full view mode"
          >
            <Maximize2 className="w-3.5 h-3.5" /> FULLVIEW MODE
          </button>
          <button
            onClick={() => {
              setIsDemoMode(true);
              setIsCameraActive(false);
              setIsFullview(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-1 ${
              isDemoMode 
                ? 'bg-emerald-500 text-black shadow font-black' 
                : 'text-on-surface-variant hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> DEMO SKELETON
          </button>
        </div>
      </div>

      {/* Main Mode Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container/40 p-2 rounded-2xl border border-outline-variant/10">
        <div className="flex items-center gap-1.5">
          <button
            id="tab-mode-motion"
            onClick={() => setActiveMainTab('motion')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              activeMainTab === 'motion'
                ? 'bg-primary text-black font-extrabold shadow-md'
                : 'bg-zinc-900/60 hover:bg-zinc-900 text-on-surface-variant hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Kinetic & Biomechanics Coach
          </button>
          <button
            id="tab-mode-rfdetr"
            onClick={() => setActiveMainTab('rfdetr')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              activeMainTab === 'rfdetr'
                ? 'bg-purple-600 text-white font-extrabold shadow-lg shadow-purple-600/30'
                : 'bg-zinc-900/60 hover:bg-zinc-900 text-purple-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" /> RF-DETR + Supervision Engine
          </button>
          <button
            id="tab-mode-combined"
            onClick={() => setActiveMainTab('combined')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              activeMainTab === 'combined'
                ? 'bg-emerald-500 text-black font-extrabold shadow-md'
                : 'bg-zinc-900/60 hover:bg-zinc-900 text-on-surface-variant hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Combined Vision Dashboard
          </button>
        </div>

        {/* Supervision Overlay Toggle Pill */}
        <div className="flex items-center gap-2 bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
          <span className="text-on-surface-variant">Supervision Overlay:</span>
          <button
            id="btn-toggle-rf-overlay"
            onClick={() => setIsRfOverlayEnabled(!isRfOverlayEnabled)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
              isRfOverlayEnabled
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-zinc-800 text-on-surface-variant'
            }`}
          >
            {isRfOverlayEnabled ? 'ENABLED' : 'MUTED'}
          </button>
        </div>
      </div>

      {/* Main Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Webcam Feed & HUD metrics (Col Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Persistent hidden elements for media streaming and frame processing */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="hidden"
          />
          <canvas
            ref={processingCanvasRef}
            className="hidden"
            width={80}
            height={60}
          />

          {/* Canvas Preview Container */}
          {isFullview ? (
            <div className="fixed inset-0 z-50 bg-slate-950/95 p-4 sm:p-6 flex flex-col justify-between overflow-hidden backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
              {/* Top Fullview HUD Bar */}
              <div className="flex justify-between items-center bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 z-10">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-mono text-xs font-black text-red-400 uppercase tracking-wider">
                      {isDemoMode ? 'FULLVIEW DEMO SIMULATOR' : 'FULLVIEW LIVE WEBCAM'}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl">
                    <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <span className="font-mono text-xs font-bold text-primary tracking-wider">
                      MOTION: {liveMotionPct}%
                    </span>
                  </div>
                  <span className="text-xs font-mono text-on-surface-variant hidden md:inline">
                    Drill: <strong className="text-white">{activityType}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {!isDemoMode && (
                    <>
                      <button
                        onClick={toggleCameraFacingMode}
                        className="bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-white flex items-center gap-1.5 hover:text-primary transition"
                        title={`Switch camera facing mode (Currently ${facingMode === 'user' ? 'Front/Selfie' : 'Rear/Back'})`}
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-primary" />
                        <span>{facingMode === 'user' ? '📷 Front Cam' : '📷 Rear Cam'}</span>
                      </button>

                      {devices.length > 0 && (
                        <select
                          value={selectedDeviceId}
                          onChange={(e) => handleDeviceChange(e.target.value)}
                          className="bg-zinc-900 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                        >
                          <option value="">Auto ({facingMode === 'user' ? 'Front' : 'Rear'})</option>
                          {devices.map((device, idx) => (
                            <option key={device.deviceId} value={device.deviceId}>
                              {device.label || `Camera ${idx + 1}`}
                            </option>
                          ))}
                        </select>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => setIsFullview(false)}
                    className="bg-primary hover:bg-primary-hover text-black font-mono font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-lg"
                  >
                    <Minimize2 className="w-4 h-4" /> Exit Fullview <span className="hidden sm:inline text-[10px] opacity-75">(Esc)</span>
                  </button>
                </div>
              </div>

              {/* Center Fullview Video/Canvas Stage with Floating HUD Overlays */}
              <div className="relative my-auto flex-1 flex items-center justify-center overflow-hidden py-2">
                <canvas
                  ref={displayCanvasRef}
                  className="max-h-[calc(100vh-180px)] w-full object-contain rounded-2xl shadow-2xl border border-primary/30 bg-black"
                  width={640}
                  height={480}
                />

                {/* Floating Left Stats Card Overlay */}
                <div className="absolute top-6 left-6 hidden lg:flex flex-col gap-2.5 bg-black/75 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-52 shadow-2xl z-10 pointer-events-none">
                  <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-wider">Live Biomechanics HUD</span>
                  
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-on-surface-variant uppercase">Movement Reps</span>
                    <p className="text-3xl font-headline font-black text-white">{repCount}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-left">
                    <div>
                      <span className="text-[8px] font-mono text-on-surface-variant block">Speed</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">{activityRate} <span className="text-[9px]">c/m</span></span>
                    </div>
                    <div>
                      <span className="text-[8px] font-mono text-on-surface-variant block">Peak Motion</span>
                      <span className="text-sm font-bold text-indigo-400 font-mono">{peakMotionPct}%</span>
                    </div>
                  </div>
                </div>

                {/* Floating Right Controls Overlay */}
                <div className="absolute top-6 right-6 hidden lg:flex flex-col gap-3 bg-black/75 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-64 shadow-2xl z-10">
                  <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Motion Tracer Style
                  </span>
                  
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'ribbon', label: 'Ribbon' },
                      { id: 'particles', label: 'Spark' },
                      { id: 'glow-path', label: 'Laser' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setTrailStyle(style.id as any)}
                        className={`py-1 rounded-lg text-[9px] font-mono font-bold text-center transition ${
                          trailStyle === style.id
                            ? 'bg-primary text-black font-extrabold'
                            : 'bg-zinc-800 text-on-surface-variant hover:text-white'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1 pt-2 border-t border-white/10">
                    <div className="flex justify-between text-[9px] font-mono text-on-surface-variant">
                      <span>Tracer Trail Length</span>
                      <span className="text-white">{trailLength} f</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="5"
                      value={trailLength}
                      onChange={(e) => setTrailLength(Number(e.target.value))}
                      className="w-full accent-primary h-1 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Fullview Control Toolbar */}
              <div className="flex flex-wrap justify-between items-center bg-black/70 backdrop-blur-md p-3 rounded-2xl border border-white/10 gap-3 z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsTracking(!isTracking)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                      !isTracking ? 'bg-red-500/30 text-red-400 border border-red-500/50' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {isTracking ? <Pause className="w-4 h-4 text-primary" /> : <Play className="w-4 h-4 text-red-400" />}
                    {isTracking ? 'Pause Tracking' : 'Resume Tracking'}
                  </button>

                  <button
                    onClick={handleResetMetrics}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-4 h-4" /> Reset Counter
                  </button>

                  {/* Record Button in Fullview */}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse shadow-lg font-extrabold'
                        : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4 fill-current" /> Stop Record ({recordingDuration}s)
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 fill-current text-red-500" /> Record Loop
                      </>
                    )}
                  </button>

                  {/* Seamless Looping Toggle Pill */}
                  <button
                    onClick={() => setIsSeamlessLoopEnabled(!isSeamlessLoopEnabled)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition border ${
                      isSeamlessLoopEnabled
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-zinc-800 text-on-surface-variant border-white/10'
                    }`}
                    title="Toggle continuous seamless looping for webcam recordings"
                  >
                    <Repeat className={`w-3.5 h-3.5 ${isSeamlessLoopEnabled ? 'text-emerald-400' : 'text-on-surface-variant'}`} />
                    Seamless Loop: {isSeamlessLoopEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Snapshot Trigger AI Button inside Fullview */}
                <button
                  onClick={() => {
                    setIsFullview(false);
                    handleAnalyzeSnapshot();
                  }}
                  disabled={isAnalyzing}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-xl font-headline text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition"
                >
                  <Sparkles className="w-4 h-4" /> Analyze AI Snapshot
                </button>
              </div>
            </div>
          ) : (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-outline-variant/15 bg-black shadow-inner group">
              {/* Main Visual Display Canvas */}
              <canvas
                ref={displayCanvasRef}
                className="w-full h-full object-cover rounded-2xl"
                width={640}
                height={480}
              />

              {/* Glowing HUD top bars */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-emerald-400 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
                    <span className="font-mono text-[9px] text-white font-bold uppercase tracking-wider">
                      {isDemoMode ? 'SIMULATOR ON' : 'WEBCAM ON'}
                    </span>
                  </div>

                  {!isDemoMode && (
                    <button
                      onClick={toggleCameraFacingMode}
                      className="pointer-events-auto bg-black/60 hover:bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-white flex items-center gap-1.5 text-[9px] font-mono font-bold hover:text-primary transition shadow"
                      title={`Switch camera facing mode (Currently ${facingMode === 'user' ? 'Front/Selfie' : 'Rear/Back'})`}
                    >
                      <RefreshCw className="w-3 h-3 text-primary" />
                      <span>{facingMode === 'user' ? '📷 FRONT' : '📷 REAR / BACK'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Seamless Loop Indicator Badge */}
                  <button
                    onClick={() => setIsSeamlessLoopEnabled(!isSeamlessLoopEnabled)}
                    className="pointer-events-auto bg-black/60 hover:bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-white flex items-center gap-1.5 text-[9px] font-mono font-bold transition"
                    title="Toggle seamless looping mode"
                  >
                    <Repeat className={`w-3 h-3 ${isSeamlessLoopEnabled ? 'text-emerald-400' : 'text-on-surface-variant'}`} />
                    <span className={isSeamlessLoopEnabled ? 'text-emerald-400 font-extrabold' : 'text-on-surface-variant'}>
                      LOOP {isSeamlessLoopEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-primary animate-pulse" />
                    <span className="font-mono text-[9px] text-primary font-bold uppercase tracking-widest">
                      MOTION RATIO: {liveMotionPct}%
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (isDemoMode) {
                        setIsDemoMode(false);
                        setIsCameraActive(true);
                      }
                      setIsFullview(true);
                    }}
                    className="pointer-events-auto bg-black/60 hover:bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-white flex items-center gap-1 text-[9px] font-mono font-bold hover:text-primary transition"
                    title="Expand webcam feed to fullview mode"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-primary" /> FULLVIEW
                  </button>
                </div>
              </div>

              {/* Camera Blocked/Permissions alert */}
              {cameraError && !isDemoMode && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
                  <AlertTriangle className="w-12 h-12 text-amber-500 animate-bounce" />
                  <h3 className="text-white font-headline text-lg font-bold">Webcam Access Restricted</h3>
                  <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">
                    {cameraError}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => startCameraStream()}
                      className="bg-primary hover:bg-primary-hover text-black font-mono font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retry Camera Access
                    </button>
                    <button
                      onClick={() => setIsDemoMode(true)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
                    >
                      <Activity className="w-3.5 h-3.5" /> Activate Demo Simulator
                    </button>
                  </div>
                </div>
              )}

              {/* HUD bottom controls overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsTracking(!isTracking)}
                    className={`p-1.5 rounded-lg hover:bg-white/10 text-white transition ${!isTracking ? 'bg-red-500/20' : ''}`}
                    title={isTracking ? 'Pause Tracking' : 'Resume Tracking'}
                  >
                    {isTracking ? <Pause className="w-4 h-4 text-primary" /> : <Play className="w-4 h-4 text-red-400" />}
                  </button>
                  <button
                    onClick={handleResetMetrics}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white transition"
                    title="Reset Counter"
                  >
                    <RefreshCw className="w-4 h-4 text-white" />
                  </button>

                  {/* Record Clip Trigger in Hover HUD */}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse font-extrabold'
                        : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-3 h-3 fill-current" /> STOP REC ({recordingDuration}s)
                      </>
                    ) : (
                      <>
                        <Circle className="w-3 h-3 fill-current text-red-500" /> REC LOOP
                      </>
                    )}
                  </button>
                </div>

                {!isDemoMode && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={toggleCameraFacingMode}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[9px] font-mono font-bold flex items-center gap-1 transition"
                      title={`Flip camera (${facingMode === 'user' ? 'Front' : 'Rear'})`}
                    >
                      <RefreshCw className="w-3 h-3 text-primary" />
                      <span>{facingMode === 'user' ? 'Front' : 'Rear'}</span>
                    </button>

                    {devices.length > 0 && (
                      <select
                        value={selectedDeviceId}
                        onChange={(e) => handleDeviceChange(e.target.value)}
                        className="bg-zinc-900 border border-white/10 rounded px-2 py-1 text-[9px] font-mono text-white focus:outline-none"
                      >
                        <option value="">Auto ({facingMode === 'user' ? 'Front' : 'Rear'})</option>
                        {devices.map((device, idx) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recorded Seamless Loop Player Section */}
          <AnimatePresence>
            {recordedBlobUrl && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="bg-surface-container/80 border border-emerald-500/30 p-4 rounded-2xl space-y-3 shadow-2xl relative overflow-hidden backdrop-blur-md"
                id="recorded-seamless-loop-player"
              >
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-outline-variant/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Recorded Webcam Motion Clip
                    </span>
                    <span className={`text-[9px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${
                      isSeamlessLoopEnabled 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                        : 'bg-zinc-800 text-on-surface-variant border-white/10'
                    }`}>
                      {isSeamlessLoopEnabled ? '⚡ SEAMLESS LOOP ACTIVE' : 'SINGLE PLAY'}
                    </span>
                  </div>

                  {/* Seamless Looping Toggle Switch in Player Header */}
                  <div className="flex items-center gap-2.5 bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-white/10 shadow-inner">
                    <Repeat className={`w-3.5 h-3.5 ${isSeamlessLoopEnabled ? 'text-emerald-400 animate-spin-slow' : 'text-on-surface-variant'}`} />
                    <span className="text-[10px] font-mono font-bold text-on-surface-variant uppercase">Seamless Loop</span>
                    <button
                      id="toggle-seamless-loop-player"
                      onClick={() => setIsSeamlessLoopEnabled(!isSeamlessLoopEnabled)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                        isSeamlessLoopEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                      }`}
                      title="Toggle continuous seamless looping for recorded webcam clip"
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform duration-200 ${
                          isSeamlessLoopEnabled ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Video Player Display */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black shadow-inner group">
                  <video
                    ref={recordedVideoRef}
                    src={recordedBlobUrl}
                    autoPlay
                    loop={isSeamlessLoopEnabled}
                    playsInline
                    className="w-full h-full object-cover rounded-xl"
                    onEnded={() => {
                      if (!isSeamlessLoopEnabled) {
                        setIsPlayingRecorded(false);
                      }
                    }}
                  />

                  {/* Replay Overlay when video finishes in non-loop mode */}
                  {!isSeamlessLoopEnabled && !isPlayingRecorded && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          if (recordedVideoRef.current) {
                            recordedVideoRef.current.currentTime = 0;
                            recordedVideoRef.current.play();
                            setIsPlayingRecorded(true);
                          }
                        }}
                        className="bg-primary hover:bg-primary-hover text-black font-mono font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition"
                      >
                        <Play className="w-4 h-4 fill-current" /> Replay Motion Clip
                      </button>
                      <button
                        onClick={() => {
                          setIsSeamlessLoopEnabled(true);
                          if (recordedVideoRef.current) {
                            recordedVideoRef.current.play();
                            setIsPlayingRecorded(true);
                          }
                        }}
                        className="text-[10px] font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1.5"
                      >
                        <Repeat className="w-3.5 h-3.5" /> Enable Continuous Seamless Looping
                      </button>
                    </div>
                  )}
                </div>

                {/* Video Controls Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlayRecorded}
                      className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition"
                    >
                      {isPlayingRecorded ? <Pause className="w-3.5 h-3.5 text-primary" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                      {isPlayingRecorded ? 'Pause' : 'Play'}
                    </button>

                    {/* Speed Multiplier Pills */}
                    <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-white/10">
                      {[
                        { rate: 0.5, label: '0.5x Slow' },
                        { rate: 1.0, label: '1.0x Norm' },
                        { rate: 1.5, label: '1.5x Fast' },
                      ].map((item) => (
                        <button
                          key={item.rate}
                          onClick={() => {
                            setPlaybackRate(item.rate);
                            if (recordedVideoRef.current) {
                              recordedVideoRef.current.playbackRate = item.rate;
                            }
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold transition ${
                            playbackRate === item.rate
                              ? 'bg-primary text-black font-extrabold'
                              : 'text-on-surface-variant hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={recordedBlobUrl}
                      download={`webcam_seamless_loop_${Date.now()}.webm`}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 transition border border-white/10"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" /> Save Clip
                    </a>
                    <button
                      onClick={handleDiscardRecording}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 transition border border-red-500/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Discard
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick HUD Metrics Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-container/30 border border-outline-variant/10 p-3 rounded-2xl text-left space-y-1">
              <span className="text-[8px] font-mono font-bold text-on-surface-variant uppercase tracking-wider block">Active Movement Cycles</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-headline font-black text-primary">{repCount}</span>
                <span className="text-[10px] text-on-surface-variant font-mono">reps</span>
              </div>
            </div>

            <div className="bg-surface-container/30 border border-outline-variant/10 p-3 rounded-2xl text-left space-y-1">
              <span className="text-[8px] font-mono font-bold text-on-surface-variant uppercase tracking-wider block">Movement Speed Rate</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-headline font-black text-emerald-400">{activityRate}</span>
                <span className="text-[10px] text-on-surface-variant font-mono">cycles/min</span>
              </div>
            </div>

            <div className="bg-surface-container/30 border border-outline-variant/10 p-3 rounded-2xl text-left space-y-1">
              <span className="text-[8px] font-mono font-bold text-on-surface-variant uppercase tracking-wider block">Peak Motion Ratio</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-headline font-black text-indigo-400">{peakMotionPct}%</span>
                <span className="text-[10px] text-on-surface-variant font-mono">of frame</span>
              </div>
            </div>

            <div className="bg-surface-container/30 border border-outline-variant/10 p-3 rounded-2xl text-left space-y-1">
              <span className="text-[8px] font-mono font-bold text-on-surface-variant uppercase tracking-wider block">Sensitivity Tuner</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={motionThreshold}
                  onChange={(e) => setMotionThreshold(Number(e.target.value))}
                  className="w-full accent-primary h-1 bg-surface-container-highest rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-mono text-white shrink-0">{motionThreshold}</span>
              </div>
            </div>
          </div>

          {/* Real-time SVG Sparkline History Chart */}
          <div className="bg-surface-container-low/40 border border-outline-variant/5 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary" /> Live Spatiotemporal Kinetic Activity Log
              </span>
              <span className="text-[8px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">60Hz Pulse</span>
            </div>
            <div className="h-10 w-full">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#34D399" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Background Area */}
                <path
                  d={`M 0 40 ${motionHistoryRef.current.map((v, i) => `L ${(i / 39) * 100}% ${40 - (v / 100) * 35}`).join(' ')} L 100% 40 Z`}
                  fill="url(#chartGlow)"
                />
                {/* Line Path */}
                <path
                  d={motionHistoryRef.current.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / 39) * 100}% ${40 - (v / 100) * 35}`).join(' ')}
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Last point pulse dot */}
                <circle
                  cx="100%"
                  cy={`${40 - (motionHistoryRef.current[39] / 100) * 35}`}
                  r="3.5"
                  fill="#FFFFFF"
                  className="animate-ping"
                />
                <circle
                  cx="100%"
                  cy={`${40 - (motionHistoryRef.current[39] / 100) * 35}`}
                  r="2"
                  fill="#10B981"
                />
              </svg>
            </div>
          </div>

        </div>

        {/* Right Column: AI Analysis, Coach Controls & Results (Col Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Camera Facing & Orientation Control Panel */}
          <div className="bg-surface-container/40 p-5 rounded-2xl border border-outline-variant/10 space-y-3" id="camera-facing-control-panel">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-primary" /> Camera Facing & Device
              </h3>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                facingMode === 'user' 
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {facingMode === 'user' ? 'Front Camera (User)' : 'Rear Camera (Environment)'}
              </span>
            </div>

            {/* Front / Rear Toggle Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                id="btn-facing-user"
                onClick={() => {
                  setFacingMode('user');
                  setIsMirrored(true);
                  setSelectedDeviceId('');
                }}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition border ${
                  facingMode === 'user'
                    ? 'bg-primary text-black border-primary font-extrabold shadow-md'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-on-surface-variant border-white/10'
                }`}
              >
                📷 Front / Selfie
              </button>

              <button
                id="btn-facing-environment"
                onClick={() => {
                  setFacingMode('environment');
                  setIsMirrored(false);
                  setSelectedDeviceId('');
                }}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition border ${
                  facingMode === 'environment'
                    ? 'bg-primary text-black border-primary font-extrabold shadow-md'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-on-surface-variant border-white/10'
                }`}
              >
                📷 Rear / Back
              </button>
            </div>

            {/* Hardware Device Selection */}
            {devices.length > 0 && (
              <div className="space-y-1 pt-1">
                <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">
                  Video Input Device Hardware
                </label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => handleDeviceChange(e.target.value)}
                  className="w-full bg-zinc-950 border border-outline-variant/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-primary/50"
                >
                  <option value="">Auto Selected ({facingMode === 'user' ? 'Front' : 'Rear'})</option>
                  {devices.map((device, idx) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Horizontal Mirroring Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-outline-variant/10">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-white block">Horizontal Mirroring</span>
                <span className="text-[9px] text-on-surface-variant block">Flip video feed horizontally</span>
              </div>
              <button
                onClick={() => setIsMirrored(!isMirrored)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  isMirrored ? 'bg-primary' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform duration-200 ${
                    isMirrored ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {/* Form Parameters */}
          <div className="bg-surface-container/40 p-5 rounded-2xl border border-outline-variant/10 space-y-4">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-primary" /> Analysis Configuration
            </h3>

            {/* Drill / Pose type selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">Target Movement Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: '1v1 Streetball Battle', label: '🔥 1v1 Play Action' },
                  { name: 'Basketball Shooting', label: '🏀 Jump Shot Form' },
                  { name: 'Defensive Lateral Slide', label: '🛡️ Defensive Slide' },
                  { name: 'Jumping Jacks', label: '🏃‍♂️ Jumping Jacks' },
                  { name: 'Ergonomic Posture Check', label: '🧍 Posture Check' }
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActivityType(item.name);
                      setAnalysisResult(null); // Clear previous results to encourage fresh snapshots
                    }}
                    className={`px-3 py-2 rounded-xl text-xs text-left transition ${
                      activityType === item.name
                        ? 'bg-primary text-black font-extrabold shadow-md border-primary'
                        : 'bg-surface-container-high/40 hover:bg-surface-container-high text-on-surface-variant hover:text-white border border-transparent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coach's manual notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider flex justify-between">
                <span>Coach's Additional Guidance Notes</span>
                <span className="text-primary font-normal">(Optional)</span>
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g., Focus on my shoulder extension, track if elbow flares, check lateral squat depth"
                rows={2}
                className="w-full bg-zinc-950 border border-outline-variant/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>

            {/* Trigger Capture & AI Analysis */}
            <button
              onClick={handleAnalyzeSnapshot}
              disabled={isAnalyzing}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-950 disabled:text-emerald-500 py-3 rounded-xl text-black font-headline text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> RUNNING BIOMECHANICS CAPTION ENGINE...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black animate-pulse" /> ANALYZE MOTION SNAPSHOT
                </>
              )}
            </button>
          </div>

          {/* Seamless Loop Recording Panel */}
          <div className="bg-surface-container/40 p-5 rounded-2xl border border-outline-variant/10 space-y-4" id="seamless-loop-recording-settings">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Repeat className="w-4 h-4 text-emerald-400" /> Seamless Loop Recording
              </h3>
              {/* Toggle switch */}
              <button
                id="toggle-seamless-loop-setting"
                onClick={() => setIsSeamlessLoopEnabled(!isSeamlessLoopEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  isSeamlessLoopEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
                title="Toggle continuous seamless looping for live webcam recordings"
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform duration-200 ${
                    isSeamlessLoopEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Record live webcam feed movement clips and loop them seamlessly for continuous, glitch-free biomechanical analysis.
            </p>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-outline-variant/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse shadow-lg font-extrabold'
                      : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" /> Stop Recording ({recordingDuration}s)
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5 fill-current text-red-500" /> Start Recording
                    </>
                  )}
                </button>

                {recordedBlobUrl && (
                  <button
                    onClick={handleDiscardRecording}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-on-surface-variant hover:text-white rounded-xl text-xs font-mono transition"
                  >
                    Clear Loop
                  </button>
                )}
              </div>

              <span className={`text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg border ${
                isSeamlessLoopEnabled 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                  : 'bg-zinc-800 text-on-surface-variant border-white/10'
              }`}>
                {isSeamlessLoopEnabled ? 'Looping: Active' : 'Looping: Off'}
              </span>
            </div>
          </div>

          {/* Visual Trail Renderer Settings */}
          <div className="bg-surface-container/40 p-5 rounded-2xl border border-outline-variant/10 space-y-4" id="kinetic-trail-settings">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" /> Kinetic Trail Renderer
              </h3>
              {/* Toggle switch */}
              <button
                id="toggle-trail-renderer"
                onClick={() => {
                  setIsTrailActive(!isTrailActive);
                  if (isTrailActive) {
                    trailPointsRef.current = [];
                  }
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  isTrailActive ? 'bg-primary' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform duration-200 ${
                    isTrailActive ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Overlay a dynamic, high-fidelity spatiotemporal path animation tracking your center of body movements.
            </p>

            {isTrailActive && (
              <div className="space-y-3.5 pt-2 border-t border-outline-variant/10 animate-in fade-in duration-200">
                {/* Path Duration Display Panel */}
                <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-outline-variant/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" /> Tracked Duration
                    </span>
                    <span className="text-xs font-mono font-extrabold text-white">
                      {((trailPointsRef.current?.length || 0) / playbackFps).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-on-surface-variant">
                    <span>Active Path Length</span>
                    <span className="text-white/80">{trailPointsCount} frames</span>
                  </div>
                </div>

                {/* Playback FPS Selection */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">Typical Playback FPS</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 24, label: '24 FPS' },
                      { id: 30, label: '30 FPS' },
                      { id: 45, label: '45 FPS' },
                      { id: 60, label: '60 FPS' },
                    ].map((rate) => (
                      <button
                        key={rate.id}
                        id={`btn-playback-fps-${rate.id}`}
                        onClick={() => setPlaybackFps(rate.id)}
                        className={`py-1 rounded-lg text-[9px] font-mono font-bold text-center transition ${
                          playbackFps === rate.id
                            ? 'bg-primary/20 text-primary border border-primary/40'
                            : 'bg-zinc-900 text-on-surface-variant hover:text-white border border-transparent'
                        }`}
                      >
                        {rate.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trail Style Selection */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">Tracer Visual Style</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'ribbon', label: '🎗️ Ribbon' },
                      { id: 'particles', label: '✨ Spark' },
                      { id: 'glow-path', label: '⚡ Laser' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        id={`btn-trail-style-${style.id}`}
                        onClick={() => setTrailStyle(style.id as any)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold text-center transition ${
                          trailStyle === style.id
                            ? 'bg-primary/20 text-primary border border-primary/40'
                            : 'bg-zinc-900 text-on-surface-variant hover:text-white border border-transparent'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trail Length Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">
                    <span>Tracer Trail Length</span>
                    <span className="text-primary">{trailLength} frames</span>
                  </div>
                  <input
                    type="range"
                    id="input-trail-length-slider"
                    min="10"
                    max="80"
                    step="5"
                    value={trailLength}
                    onChange={(e) => setTrailLength(Number(e.target.value))}
                    className="w-full accent-primary h-1 bg-surface-container-highest rounded-lg cursor-pointer"
                  />
                </div>

                {/* Trail Persistence & Opacity Slider (Fading Trail vs Static Path) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[9px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-primary" /> Trail Persistence & Opacity
                    </span>
                    <span className="text-primary font-extrabold">
                      {trailPersistence <= 0.25
                        ? '⚡ Fast Fade'
                        : trailPersistence <= 0.65
                        ? '✨ Dynamic Fade'
                        : trailPersistence < 0.95
                        ? '🌟 High Persistence'
                        : '🔒 Static Path'}
                      ({Math.round(trailPersistence * 100)}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    id="input-trail-persistence-slider"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={trailPersistence}
                    onChange={(e) => setTrailPersistence(Number(e.target.value))}
                    className="w-full accent-primary h-1 bg-surface-container-highest rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-on-surface-variant/70 px-0.5">
                    <span>Fading Trail (10%)</span>
                    <span>Balanced</span>
                    <span>Static Path (100%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis Result Board */}
          <AnimatePresence mode="wait">
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-surface-container-low/60 border border-outline-variant/10 p-6 rounded-2xl text-center space-y-4"
              >
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                    <Sparkles className="w-5 h-5 text-primary absolute inset-0 m-auto animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-headline font-bold text-sm">Computer Vision Captions Processing...</h4>
                  <p className="text-[11px] text-on-surface-variant max-w-xs mx-auto">
                    Gemini is processing the captured joints coordinates, analyzing kinetic balance, and preparing professional coaching tips.
                  </p>
                </div>
              </motion.div>
            )}

            {!isAnalyzing && !analysisResult && (
              <div className="border border-dashed border-outline-variant/20 rounded-2xl p-8 text-center text-on-surface-variant/70 space-y-3 bg-surface-container-low/20">
                <HelpCircle className="w-10 h-10 text-on-surface-variant/40 mx-auto" />
                <div className="space-y-1">
                  <p className="font-headline font-bold text-sm text-white">No active caption analyzed</p>
                  <p className="text-[11px] max-w-xs mx-auto leading-relaxed">
                    Set your target movement configuration above, strike a posture/drill pose in the viewer, and click <strong className="text-primary">Analyze Motion Snapshot</strong> to generate AI feedback!
                  </p>
                </div>
              </div>
            )}

            {!isAnalyzing && analysisResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface-container-low border border-outline-variant/15 p-5 rounded-2xl text-left space-y-4 relative overflow-hidden shadow-2xl"
              >
                {/* Glow decor background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* Subtitle & rating indicator */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-wider block font-bold">DETECTED ACTIVITY</span>
                    <h4 className="text-base font-headline font-extrabold text-white">{analysisResult.activityDetected}</h4>
                  </div>

                  <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full border ${
                    analysisResult.motionRating === 'Elite' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : analysisResult.motionRating === 'Good'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {analysisResult.motionRating} Form
                  </span>
                </div>

                {/* Biomechanics Caption */}
                <div className="space-y-1 bg-zinc-950/40 border border-white/5 p-3.5 rounded-xl">
                  <span className="font-mono text-[8px] text-primary uppercase tracking-widest block font-bold">BIOMECHANICAL ANALYTICAL CAPTION</span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {analysisResult.biomechanicsCaption}
                  </p>
                </div>

                {/* Grid for Score and Balance */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Joint Alignment Score Circular bar */}
                  <div className="bg-zinc-950/30 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="relative shrink-0 w-12 h-12">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="19"
                          stroke="rgba(255, 255, 255, 0.05)"
                          strokeWidth="3.5"
                          fill="transparent"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="19"
                          stroke="#10B981"
                          strokeWidth="3.5"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 19}
                          strokeDashoffset={2 * Math.PI * 19 * (1 - analysisResult.jointAlignmentScore / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center font-mono font-extrabold text-xs text-white">
                        {analysisResult.jointAlignmentScore}
                      </span>
                    </div>

                    <div className="text-left">
                      <span className="font-mono text-[8px] text-on-surface-variant block uppercase tracking-wide">ALIGNMENT SCORE</span>
                      <span className="text-xs font-bold text-white">Kinetic Match</span>
                    </div>
                  </div>

                  {/* Weight / Balance Indicator */}
                  <div className="bg-zinc-950/30 p-3 rounded-xl border border-white/5 space-y-0.5 text-left flex flex-col justify-center">
                    <span className="font-mono text-[8px] text-on-surface-variant uppercase tracking-wide block">AXIS BALANCE</span>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" /> {analysisResult.movementBalance}
                    </span>
                  </div>

                </div>

                {/* Actionable coaching tips */}
                <div className="space-y-2">
                  <span className="font-mono text-[9px] text-white uppercase tracking-widest block font-bold">COACH'S KINETIC ADJUSTMENTS</span>
                  <div className="space-y-1.5">
                    {analysisResult.coachingTips.map((tip, index) => (
                      <div key={index} className="flex gap-2.5 items-start text-xs text-on-surface-variant bg-zinc-950/20 p-2.5 rounded-lg border border-white/5">
                        <span className="w-4 h-4 bg-primary/15 text-primary text-[10px] font-mono font-bold flex items-center justify-center rounded shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <p className="leading-normal">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom verification watermark */}
                <div className="flex justify-between items-center text-[8px] font-mono text-on-surface-variant/40 pt-2 border-t border-white/5">
                  <span>MODEL REFERENCE: GEMINI-3.5-FLASH</span>
                  <span>TIME: {new Date().toLocaleTimeString()}</span>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* RF-DETR Medium + Supervision Dedicated Panel */}
      {(activeMainTab === 'rfdetr' || activeMainTab === 'combined') && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <RfDetrSupervisionTracker
            onApplyDetectionsToCanvas={(dets, lbls) => {
              setRfDetections(dets);
              setRfLabels(lbls);
            }}
            getLiveFrameBase64={getLiveFrameBase64}
            onSelectPresetImage={handleSelectPresetImage}
          />
        </motion.div>
      )}

    </div>
  );
}
