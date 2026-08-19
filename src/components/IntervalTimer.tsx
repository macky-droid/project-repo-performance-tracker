import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  Plus, 
  Minus, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Flame, 
  PlusCircle,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IntervalTimerProps {
  sessionId: string;
  sessionTitle: string;
  defaultWork?: number;   // seconds
  defaultRest?: number;   // seconds
  defaultCycles?: number; // total work-rest pairs
  onSessionComplete?: () => void;
  onClose?: () => void;
}

export default function IntervalTimer({
  sessionId,
  sessionTitle,
  defaultWork = 45,
  defaultRest = 15,
  defaultCycles = 4,
  onSessionComplete,
  onClose
}: IntervalTimerProps) {
  // Config States
  const [workTime, setWorkTime] = useState(defaultWork);
  const [restTime, setRestTime] = useState(defaultRest);
  const [totalCycles, setTotalCycles] = useState(defaultCycles);

  // Active Timer States
  const [isActive, setIsActive] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [phase, setPhase] = useState<'work' | 'rest' | 'complete'>('work');
  const [timeLeft, setTimeLeft] = useState(workTime);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Maintain initial duration for SVG circle progress
  const [initialPhaseDuration, setInitialPhaseDuration] = useState(workTime);

  // Sound generator using Web Audio API
  const playTimerSound = (type: 'tick' | 'change' | 'complete') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (type === 'tick') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } else if (type === 'change') {
        // High-low alert beeps
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'complete') {
        // Grand victory chord beep
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime); // C6
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.8);
      }
    } catch (e) {
      console.warn("Audio Context error or user gesture blocked:", e);
    }
  };

  // Keep timeLeft in sync when modifying config before timer starts
  useEffect(() => {
    if (!isActive && currentCycle === 1 && phase === 'work') {
      setTimeLeft(workTime);
      setInitialPhaseDuration(workTime);
    }
  }, [workTime, isActive, currentCycle, phase]);

  // Main Timer tick ticker
  useEffect(() => {
    let interval: any = null;
    if (isActive && phase !== 'complete') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handlePhaseTransition();
            return 0;
          }
          // Tick sound in final 3 seconds of a phase
          if (prev <= 4) {
            playTimerSound('tick');
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, phase, currentCycle, workTime, restTime, totalCycles]);

  const handlePhaseTransition = () => {
    if (phase === 'work') {
      // Transition from work to rest (if cycles remain) or complete
      if (currentCycle >= totalCycles) {
        // End of last work cycle! Session Complete!
        setPhase('complete');
        setIsActive(false);
        playTimerSound('complete');
        if (onSessionComplete) onSessionComplete();
      } else {
        // Move to Rest phase
        setPhase('rest');
        setTimeLeft(restTime);
        setInitialPhaseDuration(restTime);
        playTimerSound('change');
      }
    } else if (phase === 'rest') {
      // Transition from rest back to work on the next cycle
      setPhase('work');
      setCurrentCycle(prev => prev + 1);
      setTimeLeft(workTime);
      setInitialPhaseDuration(workTime);
      playTimerSound('change');
    }
  };

  // Reset the timer completely
  const handleReset = () => {
    setIsActive(false);
    setCurrentCycle(1);
    setPhase('work');
    setTimeLeft(workTime);
    setInitialPhaseDuration(workTime);
  };

  // Quick action buttons
  const applyPreset = (workSec: number, restSec: number, cyclesNum: number) => {
    handleReset();
    setWorkTime(workSec);
    setRestTime(restSec);
    setTotalCycles(cyclesNum);
  };

  const skipPhase = () => {
    handlePhaseTransition();
  };

  // Format digital clock countdown e.g., 01:25
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate SVG stroke offset for animated circular countdown timeline
  const percentageRemaining = initialPhaseDuration > 0 ? (timeLeft / initialPhaseDuration) : 0;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentageRemaining * circumference);

  // Resolve visual colors based on phase
  const getThemeColors = () => {
    switch (phase) {
      case 'work':
        return {
          primary: 'text-primary border-primary/20 bg-primary/5',
          glow: 'shadow-[0_0_20px_rgba(255,143,111,0.25)]',
          stroke: '#FF8F6F',
          bubble: 'bg-primary/10 text-primary border-primary/20',
          title: 'WORK INTERVAL'
        };
      case 'rest':
        return {
          primary: 'text-sky-400 border-sky-400/20 bg-sky-400/5',
          glow: 'shadow-[0_0_20px_rgba(56,189,248,0.25)]',
          stroke: '#38bdf8',
          bubble: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
          title: 'REST BREAK'
        };
      case 'complete':
        return {
          primary: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5',
          glow: 'shadow-[0_0_25px_rgba(52,211,153,0.3)]',
          stroke: '#34d399',
          bubble: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
          title: 'SESSION DONE!'
        };
    }
  };

  const themeColors = getThemeColors();

  return (
    <div className="bg-surface-container/60 border border-outline-variant/10 rounded-2xl p-5 mt-4 space-y-4 shadow-inner relative">
      <div className="flex justify-between items-center pb-2 border-b border-outline-variant/5">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-primary animate-pulse" />
          <h5 className="font-headline font-bold text-xs text-white uppercase tracking-wider">
            Interval Enforcer
          </h5>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-variant transition-colors"
            title={soundEnabled ? 'Mute buzzer alert' : 'Enable buzzer alert'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-primary" /> : <VolumeX className="w-3.5 h-3.5 text-on-surface-variant/40" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-[9px] font-label font-bold text-on-surface-variant/50 hover:text-white uppercase tracking-widest bg-white/5 hover:bg-white/10 px-2 py-1 rounded"
            >
              Minimize
            </button>
          )}
        </div>
      </div>

      {/* Main Countdown Screen & Settings */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2">
        {/* SVG Circle Clock Graphic */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-surface-container-highest"
              strokeWidth="6"
              fill="transparent"
            />
            {phase !== 'complete' && (
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke={themeColors.stroke}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            )}
          </svg>

          {/* Core content inside circular clock */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-label text-[8px] font-bold text-on-surface-variant uppercase tracking-widest leading-none">
              {phase === 'complete' ? '' : `ROUND ${currentCycle}/${totalCycles}`}
            </span>
            <span className="font-mono text-2xl font-black text-white px-2 tracking-snug my-1 leading-none">
              {phase === 'complete' ? 'FINISH' : formatTime(timeLeft)}
            </span>
            <span className={`text-[8px] font-label font-black tracking-wider uppercase px-2 py-0.5 rounded-full ${themeColors.bubble}`}>
              {themeColors.title}
            </span>
          </div>
        </div>

        {/* Dynamic Interval Configurations */}
        <div className="flex-1 w-full space-y-3">
          {/* Work Time Controls */}
          <div className="flex justify-between items-center bg-surface-container-high/40 px-3 py-2 rounded-xl border border-outline-variant/5">
            <div>
              <p className="text-[10px] font-label font-bold text-white uppercase tracking-wider">WORK TIME</p>
              <p className="text-[9px] text-on-surface-variant/70 font-body">Active core exercises</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={isActive}
                onClick={() => setWorkTime(prev => Math.max(5, prev - 5))}
                className="p-1 rounded-lg bg-surface-container-highest hover:bg-white/10 text-on-surface disabled:opacity-20 transition-all"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono text-sm font-bold text-primary w-8 text-center">{workTime}s</span>
              <button
                disabled={isActive}
                onClick={() => setWorkTime(prev => Math.min(300, prev + 5))}
                className="p-1 rounded-lg bg-surface-container-highest hover:bg-white/10 text-on-surface disabled:opacity-20 transition-all"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Rest Time Controls */}
          <div className="flex justify-between items-center bg-surface-container-high/40 px-3 py-2 rounded-xl border border-outline-variant/5">
            <div>
              <p className="text-[10px] font-label font-bold text-white uppercase tracking-wider">REST TIME</p>
              <p className="text-[9px] text-on-surface-variant/70 font-body">Break & fluid recovery</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={isActive}
                onClick={() => setRestTime(prev => Math.max(5, prev - 5))}
                className="p-1 rounded-lg bg-surface-container-highest hover:bg-white/10 text-on-surface disabled:opacity-20 transition-all"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono text-sm font-bold text-sky-400 w-8 text-center">{restTime}s</span>
              <button
                disabled={isActive}
                onClick={() => setRestTime(prev => Math.min(180, prev + 5))}
                className="p-1 rounded-lg bg-surface-container-highest hover:bg-white/10 text-on-surface disabled:opacity-20 transition-all"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Cycles Count */}
          <div className="flex justify-between items-center bg-surface-container-high/40 px-3 py-2 rounded-xl border border-outline-variant/5">
            <div>
              <p className="text-[10px] font-label font-bold text-white uppercase tracking-wider">CYCLES / ROUTINES</p>
              <p className="text-[9px] text-on-surface-variant/70 font-body">Total repetitions</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={isActive}
                onClick={() => setTotalCycles(prev => Math.max(1, prev - 1))}
                className="p-1 rounded-lg bg-surface-container-highest hover:bg-white/10 text-on-surface disabled:opacity-20 transition-all"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono text-sm font-bold w-8 text-center text-white">{totalCycles}</span>
              <button
                disabled={isActive}
                onClick={() => setTotalCycles(prev => Math.min(20, prev + 1))}
                className="p-1 rounded-lg bg-surface-container-highest hover:bg-white/10 text-on-surface disabled:opacity-20 transition-all"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Selectors */}
      {!isActive && phase !== 'complete' && (
        <div className="space-y-1.5">
          <p className="text-[8px] font-label text-on-surface-variant/50 uppercase tracking-wider">Training Preset Templates</p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => applyPreset(40, 20, 4)}
              className="py-1 rounded-lg bg-surface-container-high border border-outline-variant/10 text-[9px] font-label font-bold text-on-surface-variant hover:text-white hover:bg-white/5 transition-all text-center"
            >
              Strength (40s/20s)
            </button>
            <button
              onClick={() => applyPreset(20, 10, 6)}
              className="py-1 rounded-lg bg-surface-container-high border border-outline-variant/10 text-[9px] font-label font-bold text-on-surface-variant hover:text-white hover:bg-white/5 transition-all text-center"
            >
              HiIT/Agility (20s/10s)
            </button>
            <button
              onClick={() => applyPreset(90, 30, 3)}
              className="py-1 rounded-lg bg-surface-container-high border border-outline-variant/10 text-[9px] font-label font-bold text-on-surface-variant hover:text-white hover:bg-white/5 transition-all text-center"
            >
              Practice Set (90s/30s)
            </button>
          </div>
        </div>
      )}

      {/* Core Controls Row */}
      <div className="flex items-center gap-2 pt-2">
        {phase === 'complete' ? (
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-label font-bold text-[10px] text-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Drill Completed • Restart
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`flex-1 py-2.5 rounded-xl font-label font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                isActive 
                  ? 'bg-amber-400 text-black hover:bg-amber-500' 
                  : phase === 'work' 
                    ? 'bg-primary text-black hover:bg-primary-hover shadow-primary/20' 
                    : 'bg-sky-400 text-black hover:bg-sky-500 shadow-sky-400/20'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Timer
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black" /> Resume Interval
                </>
              )}
            </button>

            {isActive && (
              <button
                onClick={skipPhase}
                className="px-3 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/10 text-on-surface hover:text-white hover:bg-white/5 transition-all"
                title="Skip to next phase"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleReset}
              className="px-3 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/10 text-on-surface hover:text-white hover:bg-white/5 transition-all"
              title="Reset current interval"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Complete animation screen */}
      <AnimatePresence>
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-black/90 rounded-2xl flex flex-col items-center justify-center p-4 text-center z-20 border border-emerald-500/20"
          >
            <div className="bg-emerald-500/20 p-3 rounded-full mb-2 border border-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="font-headline text-lg font-black text-white">INTERVAL COMPLETED!</h4>
            <p className="font-body text-[10px] text-on-surface-variant max-w-xs mt-1">
              Fantastic work on <span className="text-emerald-400 font-bold">{sessionTitle}</span>. Rest and work intervals have been successfully enforced.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-500 font-label text-[9px] font-bold text-black uppercase tracking-widest transition-all"
            >
              Run Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
