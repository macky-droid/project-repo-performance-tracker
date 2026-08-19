import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Dumbbell, 
  Clock, 
  BookOpen, 
  Shield, 
  Sparkles, 
  Check, 
  PenTool, 
  Activity, 
  Calendar, 
  Save, 
  RefreshCw,
  Trophy,
  History,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';

interface PlayerConsistencyProps {
  activePlayer: string;
}

export interface DailyRoutine {
  date: string; // YYYY-MM-DD
  completed: {
    wakeup: boolean;
    gym: boolean;
    reading: boolean;
    noAlcohol: boolean;
    socialMediaDetox: boolean;
    goalReview: boolean;
    journaling: boolean;
    coldShower: boolean;
  };
  details: {
    wakeupTime: string;
    gymType: string;
    readMinutes: number;
    drinkStatus: string;
    screenTimeMins: number;
    dailyGoal: string;
    journalText: string;
    showerDurationSec: number;
  };
}

// 8 core habits configured for high visual polish
const HABIT_CONFIGS = [
  { 
    id: 'wakeup' as const, 
    title: 'Sunrise Rise-Up', 
    subtitle: 'Wake up early & phone-free start', 
    desc: 'Establish circadian rhythm. First 30 minutes offline.', 
    icon: Clock, 
    color: '#ff8f6f', 
    unit: 'Time' 
  },
  { 
    id: 'gym' as const, 
    title: 'Gym & Core Mobility', 
    subtitle: 'Strength, stretch & physical prep', 
    desc: 'Active physical training, target high elasticity and joints.', 
    icon: Dumbbell, 
    color: '#91f78e', 
    unit: 'Focus' 
  },
  { 
    id: 'reading' as const, 
    title: 'Focus Study & Learn', 
    subtitle: 'Project work & playbook reading', 
    desc: 'Upgrade cognitive depth. Playbook reading or strategic course.', 
    icon: BookOpen, 
    color: '#44a5ff', 
    unit: 'Minutes' 
  },
  { 
    id: 'noAlcohol' as const, 
    title: 'Sobriety Shield', 
    subtitle: 'Zero alcohol for deep sleep index', 
    desc: 'Protect REM sleep & cardiovascular baseline stability.', 
    icon: Shield, 
    color: '#ff716c', 
    unit: 'Status' 
  },
  { 
    id: 'socialMediaDetox' as const, 
    title: 'Dopamine Detox', 
    subtitle: 'Social media & screen restriction', 
    desc: 'Minimize mindless scroll. Reclaim focus attention span.', 
    icon: Activity, 
    color: '#eab308', 
    unit: 'Minutes' 
  },
  { 
    id: 'goalReview' as const, 
    title: 'Daily Alignment Set', 
    subtitle: 'Goal setting & strategic vision', 
    desc: 'Review goals and alignment with tactical court play.', 
    icon: Trophy, 
    color: '#a855f7', 
    unit: 'Goal' 
  },
  { 
    id: 'journaling' as const, 
    title: 'Mindset Reflection Log', 
    subtitle: 'Journaling & court visualization', 
    desc: 'Write notes, reflections, court awareness, and confidence anchors.', 
    icon: PenTool, 
    color: '#06b6d4', 
    unit: 'Entry' 
  },
  { 
    id: 'coldShower' as const, 
    title: 'Cold Reset Trigger', 
    subtitle: 'Nervous system thermal shock', 
    desc: 'Cold immersion or shower to release dopamine and fight fatigue.', 
    icon: Flame, 
    color: '#ec4899', 
    unit: 'Seconds' 
  }
];

// Helper to get formatted date string
const getTodayString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

export default function PlayerConsistency({ activePlayer }: PlayerConsistencyProps) {
  const [history, setHistory] = useState<DailyRoutine[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [activePreset, setActivePreset] = useState<'mamba' | 'spurs' | 'rookie'>('mamba');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Load consistency data from localStorage
  useEffect(() => {
    const storageKey = `player_consistency_v2_${activePlayer}`;
    const storedData = localStorage.getItem(storageKey);
    
    if (storedData) {
      try {
        setHistory(JSON.parse(storedData));
      } catch (e) {
        console.error("Error loading consistency logs", e);
        initializeDemoLogs();
      }
    } else {
      initializeDemoLogs();
    }
  }, [activePlayer]);

  // Seed baseline realistic data for a gorgeous immediate experience
  const initializeDemoLogs = () => {
    const demoLogs: DailyRoutine[] = [];
    const baseWakeTimes = ["06:00 AM", "06:15 AM", "06:30 AM", "07:00 AM", "05:45 AM", "06:30 AM", "08:15 AM"];
    const baseGym = ["Upper Body Power", "Active Flex & Stretch", "Lower Body Speed", "Recovery Yoga", "Leg Power & Core", "Warmup Stretching", "Light Core Rollout"];
    const baseReads = [45, 30, 20, 60, 45, 15, 0];
    const baseScreens = [40, 50, 60, 30, 45, 90, 120];
    const baseGoals = [
      "Master the Austin Spurs BLOB entry help side cut",
      "Improve perimeter lateral quickness in AR drills",
      "Calibrate vertical jump launch and ankle alignment",
      "Analyze YouTube CV player spacing diagrams",
      "Review pick and roll defensive drop rotations",
      "Improve hydration levels and soft-tissue mobility",
      "Study playoff game tape and spacing analytics"
    ];
    const baseJournals = [
      "Felt fantastic today. Woke up clean, studied the Austin Spurs BLOB misdirect. The backplate cut coordinates make perfect sense.",
      "AR tracking showed minor drift in my left heel rotation. Working with physical therapists on soft-tissue loading.",
      "Decent energy. Sobriety shield is making a huge difference in sleep quality. Heart rate variability is up to 74ms.",
      "Incredible reading session on court spacing. Mindset is locked in on defensive spacing indicators.",
      "Leg workout was intense. Felt slightly sore but cold immersion reset my nervous system immediately.",
      "Had a busy playoff analysis session. Screen time was a bit high due to video tracking, but feeling aligned.",
      "Sunday recovery. Reset goals for the upcoming Knicks series. Ready to dominate the floor."
    ];

    // Seed past 14 days
    for (let i = 13; i >= 0; i--) {
      const logDate = getTodayString(i);
      const randIndex = i % 7;
      const completionChance = i === 0 ? 0.5 : (0.6 + Math.random() * 0.4); // Today is partial by default
      
      const isWake = Math.random() < completionChance;
      const isGym = Math.random() < completionChance;
      const isRead = Math.random() < completionChance;
      const isSober = Math.random() < 0.85; // highly sober player
      const isDetox = Math.random() < completionChance;
      const isGoal = Math.random() < completionChance;
      const isJourn = Math.random() < completionChance;
      const isShower = Math.random() < completionChance;

      demoLogs.push({
        date: logDate,
        completed: {
          wakeup: isWake,
          gym: isGym,
          reading: isRead,
          noAlcohol: isSober,
          socialMediaDetox: isDetox,
          goalReview: isGoal,
          journaling: isJourn,
          coldShower: isShower
        },
        details: {
          wakeupTime: isWake ? baseWakeTimes[randIndex] : "08:30 AM",
          gymType: isGym ? baseGym[randIndex] : "None (Rest)",
          readMinutes: isRead ? baseReads[randIndex] : 0,
          drinkStatus: isSober ? "Sober" : "Had 1 drink",
          screenTimeMins: isDetox ? baseScreens[randIndex] : 140,
          dailyGoal: baseGoals[randIndex],
          journalText: isJourn ? baseJournals[randIndex] : "No reflections entered today.",
          showerDurationSec: isShower ? (Math.random() < 0.5 ? 180 : 300) : 0
        }
      });
    }

    setHistory(demoLogs);
    saveLogsToStorage(demoLogs);
  };

  const saveLogsToStorage = (updatedHistory: DailyRoutine[]) => {
    const storageKey = `player_consistency_v2_${activePlayer}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
  };

  // Get current active routine or build empty template
  const currentLog = history.find(item => item.date === selectedDate) || {
    date: selectedDate,
    completed: {
      wakeup: false,
      gym: false,
      reading: false,
      noAlcohol: true,
      socialMediaDetox: false,
      goalReview: false,
      journaling: false,
      coldShower: false
    },
    details: {
      wakeupTime: "07:00 AM",
      gymType: "Stretching",
      readMinutes: 15,
      drinkStatus: "Sober",
      screenTimeMins: 45,
      dailyGoal: "",
      journalText: "",
      showerDurationSec: 120
    }
  };

  // Handle habit toggle
  const handleToggleHabit = (habitId: keyof typeof currentLog.completed) => {
    let updatedHistory = [...history];
    const itemIndex = updatedHistory.findIndex(item => item.date === selectedDate);
    
    const updatedLog = { ...currentLog };
    updatedLog.completed = {
      ...updatedLog.completed,
      [habitId]: !updatedLog.completed[habitId]
    };

    if (itemIndex >= 0) {
      updatedHistory[itemIndex] = updatedLog;
    } else {
      updatedHistory.push(updatedLog);
    }

    setHistory(updatedHistory);
    saveLogsToStorage(updatedHistory);
  };

  // Handle custom details input change
  const handleDetailChange = (field: keyof typeof currentLog.details, value: any) => {
    let updatedHistory = [...history];
    const itemIndex = updatedHistory.findIndex(item => item.date === selectedDate);

    const updatedLog = { ...currentLog };
    updatedLog.details = {
      ...updatedLog.details,
      [field]: value
    };

    if (itemIndex >= 0) {
      updatedHistory[itemIndex] = updatedLog;
    } else {
      updatedHistory.push(updatedLog);
    }

    setHistory(updatedHistory);
    saveLogsToStorage(updatedHistory);
  };

  // Quick save notification trigger
  const triggerSaveNotification = () => {
    setSaveToast("Consistency logs synchronized with cloud index!");
    setTimeout(() => {
      setSaveToast(null);
    }, 3000);
  };

  // CALCULATIONS FOR METRICS & STREAKS

  // 1. Current Streak Calculation
  const calculateStreak = () => {
    let streak = 0;
    const sortedDates = [...history]
      .sort((a, b) => b.date.localeCompare(a.date));

    // Start checking from today or yesterday
    const todayStr = getTodayString();
    const yesterdayStr = getTodayString(1);

    let checkIndex = 0;
    // If today has no completed habits, we start check from yesterday to maintain continuity
    const todayLog = sortedDates.find(x => x.date === todayStr);
    const completedToday = todayLog ? Object.values(todayLog.completed).filter(Boolean).length : 0;
    
    if (completedToday === 0) {
      const yesterdayLog = sortedDates.find(x => x.date === yesterdayStr);
      const completedYesterday = yesterdayLog ? Object.values(yesterdayLog.completed).filter(Boolean).length : 0;
      if (completedYesterday > 0) {
        checkIndex = sortedDates.findIndex(x => x.date === yesterdayStr);
      }
    }

    for (let i = checkIndex; i < sortedDates.length; i++) {
      const log = sortedDates[i];
      const completedCount = Object.values(log.completed).filter(Boolean).length;
      // High performance threshold: at least 4 out of 8 habits completed to maintain daily streak
      if (completedCount >= 4) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // 2. Max Streak
  const calculateMaxStreak = () => {
    let maxStreak = 0;
    let currentStreak = 0;
    const sortedDates = [...history]
      .sort((a, b) => a.date.localeCompare(b.date)); // chronological

    for (const log of sortedDates) {
      const completedCount = Object.values(log.completed).filter(Boolean).length;
      if (completedCount >= 4) {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    }
    return Math.max(maxStreak, calculateStreak());
  };

  // 3. Weekly compliance index chart data
  const getWeeklyChartData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const dStr = getTodayString(i);
      const log = history.find(x => x.date === dStr);
      const completedCount = log ? Object.values(log.completed).filter(Boolean).length : 0;
      const compliancePercent = Math.round((completedCount / 8) * 100);
      
      // format label (e.g. "Mon", "Tue")
      const dateObj = new Date(dStr + "T00:00:00");
      const label = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

      last7Days.push({
        date: dStr,
        day: label,
        percent: compliancePercent,
        completed: completedCount,
        readMins: log?.details?.readMinutes || 0,
        screenMins: log?.details?.screenTimeMins || 0,
      });
    }
    return last7Days;
  };

  // 4. Lifetime statistics
  const totalLogsCount = history.length;
  const averageCompliance = totalLogsCount > 0 
    ? Math.round(history.reduce((acc, curr) => acc + (Object.values(curr.completed).filter(Boolean).length), 0) / (totalLogsCount * 8) * 100)
    : 0;

  const currentStreak = calculateStreak();
  const maxStreak = calculateMaxStreak();
  const weeklyData = getWeeklyChartData();

  // Tier criteria label based on active preset / average
  const getPlayerTierLabel = () => {
    if (averageCompliance >= 85) return { text: "Mamba Visionary", style: "text-primary border-primary/20 bg-primary/5", score: "Hall of Fame Index" };
    if (averageCompliance >= 70) return { text: "Spurs Standard Core", style: "text-secondary border-secondary/20 bg-secondary/5", score: "Professional Index" };
    return { text: "Active Rebuild Prospect", style: "text-tertiary border-tertiary/20 bg-tertiary/5", score: "Development Index" };
  };

  const tierInfo = getPlayerTierLabel();

  // Quick navigation date helpers
  const shiftDate = (offset: number) => {
    const current = new Date(selectedDate + "T00:00:00");
    current.setDate(current.getDate() + offset);
    const offsetStr = current.toISOString().split('T')[0];
    setSelectedDate(offsetStr);
  };

  const todayCompletedCount = Object.values(currentLog.completed).filter(Boolean).length;
  const todayCompletionRate = Math.round((todayCompletedCount / 8) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12" id="player-consistency-page">
      {/* Toast Notification */}
      <AnimatePresence>
        {saveToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 right-6 bg-[#1a1a1a] border border-secondary/30 text-secondary text-xs font-label font-bold tracking-wider px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
            <span>{saveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="font-label text-[10px] bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wider font-extrabold">
              🏀 HIGH-PERFORMANCE RECOVERY ENGINE
            </span>
            <span className={`font-label text-[10px] border px-3 py-1 rounded-full uppercase tracking-wider font-bold ${tierInfo.style}`}>
              👑 {tierInfo.text}
            </span>
          </div>
          <h1 className="font-headline text-4xl lg:text-5xl font-extrabold tracking-tighter text-white">
            ROUTINE CONSISTENCY
          </h1>
          <p className="font-body text-on-surface-variant text-sm mt-1 max-w-2xl">
            Rebuilding the foundational mental & physical metrics for <span className="text-primary font-bold">{activePlayer}</span>. Every rep is tracked, evaluated, and structured for elite peak performance.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-col gap-2 w-full lg:w-auto shrink-0">
          <span className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest font-black text-left lg:text-right">Routine Target Presets</span>
          <div className="flex bg-surface-container-high p-1.5 rounded-2xl border border-outline-variant/15 w-full lg:w-max">
            {[
              { id: 'mamba' as const, label: '⚡ Mamba', desc: '8/8 Habits Target' },
              { id: 'spurs' as const, label: '⚙️ Spurs System', desc: '6/8 Habits Target' },
              { id: 'rookie' as const, label: '🌱 Rookie Standard', desc: '4/8 Habits Target' }
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setActivePreset(preset.id);
                  triggerSaveNotification();
                }}
                className={`px-4 py-2.5 rounded-xl font-label text-[11px] font-bold uppercase tracking-wider transition-all duration-150 flex flex-col items-center justify-center gap-0.5 ${
                  activePreset === preset.id 
                    ? 'performance-gradient text-black font-extrabold shadow-lg scale-105' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Streak Flame Card */}
        <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 relative overflow-hidden flex flex-col justify-between group shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold font-sans">ACTIVE STREAK</span>
              <p className="font-headline text-5xl font-black text-white flex items-baseline gap-1.5">
                {currentStreak} <span className="text-xs text-on-surface-variant font-medium">Days</span>
              </p>
            </div>
            <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 text-primary">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-[11px] text-on-surface-variant font-label">
            <span>MAX STREAK</span>
            <span className="font-bold text-white font-mono">{maxStreak} DAYS</span>
          </div>
        </div>

        {/* Total Habits Completed Counter */}
        <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 relative overflow-hidden flex flex-col justify-between group shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-all duration-500" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold font-sans">LIFETIME INDEX</span>
              <p className="font-headline text-5xl font-black text-white flex items-baseline gap-1.5">
                {averageCompliance}% <span className="text-xs text-on-surface-variant font-medium">Rating</span>
              </p>
            </div>
            <div className="bg-secondary/10 p-3 rounded-2xl border border-secondary/20 text-secondary">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-[11px] text-on-surface-variant font-label">
            <span>COGNITIVE VS PHYSICAL</span>
            <span className="font-bold text-white font-mono">{tierInfo.score}</span>
          </div>
        </div>

        {/* Current Date Navigation Header */}
        <div className="md:col-span-2 bg-surface-container-low p-6 rounded-3xl border border-outline-variant/15 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => shiftDate(-1)}
              className="p-3 bg-surface-container-high hover:bg-surface-bright border border-outline-variant/10 hover:border-outline-variant/30 rounded-2xl transition-all text-on-surface active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <span className="text-[9px] font-label text-primary font-extrabold uppercase tracking-widest block">ROUTINE TIMELINE TARGET</span>
              <h2 className="font-headline text-2xl font-black text-white tracking-tight mt-0.5">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </h2>
            </div>
            <button 
              onClick={() => shiftDate(1)}
              disabled={selectedDate === getTodayString()}
              className={`p-3 border rounded-2xl transition-all text-on-surface active:scale-95 cursor-pointer ${
                selectedDate === getTodayString() 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-600 opacity-40 cursor-not-allowed' 
                  : 'bg-surface-container-high hover:bg-surface-bright border-outline-variant/10 hover:border-outline-variant/30'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 bg-surface-container p-3 rounded-2xl border border-outline-variant/10 mt-4">
            <div className="flex-1 space-y-1 text-left">
              <div className="flex justify-between text-[10px] font-label font-bold text-on-surface-variant">
                <span>HABIT COMPLETION RATE</span>
                <span className="text-primary font-mono">{todayCompletedCount}/8 COMPLETED</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out" 
                  style={{ width: `${todayCompletionRate}%` }}
                />
              </div>
            </div>
            <div className="bg-surface-container-high px-3 py-2 rounded-xl border border-outline-variant/10 text-center font-headline font-black text-base text-white">
              {todayCompletionRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Primary Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Dynamic 8 Habit Checklist */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center pb-2">
            <h3 className="font-headline text-xl font-black text-white flex items-center gap-2">
              <span>🚀 8 Core Building Blocks</span>
              <span className="text-[10px] font-mono text-on-surface-variant uppercase font-medium">({activePreset} Preset Enabled)</span>
            </h3>
            <button 
              onClick={() => {
                // Set all to true
                let updatedHistory = [...history];
                const itemIndex = updatedHistory.findIndex(item => item.date === selectedDate);
                const updatedLog = { ...currentLog };
                updatedLog.completed = {
                  wakeup: true,
                  gym: true,
                  reading: true,
                  noAlcohol: true,
                  socialMediaDetox: true,
                  goalReview: true,
                  journaling: true,
                  coldShower: true
                };
                if (itemIndex >= 0) {
                  updatedHistory[itemIndex] = updatedLog;
                } else {
                  updatedHistory.push(updatedLog);
                }
                setHistory(updatedHistory);
                saveLogsToStorage(updatedHistory);
                triggerSaveNotification();
              }}
              className="text-[10px] font-label text-primary hover:text-primary-dim uppercase tracking-widest font-bold cursor-pointer transition-colors"
            >
              ✓ Complete All 8 Today
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HABIT_CONFIGS.map((habit) => {
              const isDone = currentLog.completed[habit.id];
              const IconComp = habit.icon;
              return (
                <div 
                  key={habit.id}
                  onClick={() => handleToggleHabit(habit.id)}
                  className={`group bg-surface-container hover:bg-surface-bright border rounded-3xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 shadow-md cursor-pointer text-left relative overflow-hidden select-none active:scale-[0.99] ${
                    isDone 
                      ? 'border-secondary/20 shadow-[0_8px_20px_rgba(145,247,142,0.05)]' 
                      : 'border-outline-variant/10 hover:border-outline-variant/25'
                  }`}
                >
                  {/* Subtle color flare in background when checked */}
                  {isDone && (
                    <div 
                      className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-10 transition-all duration-500"
                      style={{ backgroundColor: habit.color }}
                    />
                  )}

                  <div className="flex gap-4 items-start">
                    {/* Habit Custom Icon Wrapper */}
                    <div 
                      className="p-3.5 rounded-2xl border transition-all duration-300 shrink-0"
                      style={{ 
                        backgroundColor: isDone ? `${habit.color}15` : 'rgba(255,255,255,0.03)',
                        borderColor: isDone ? `${habit.color}40` : 'rgba(255,255,255,0.05)',
                        color: habit.color
                      }}
                    >
                      <IconComp className="w-5 h-5 stroke-[2.2]" />
                    </div>

                    <div className="space-y-0.5 text-left pr-6">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-headline text-[15px] font-bold text-white tracking-tight">{habit.title}</h4>
                        {isDone && <Check className="w-4 h-4 text-secondary shrink-0 stroke-[2.5]" />}
                      </div>
                      <p className="text-[11px] font-label text-on-surface-variant font-bold leading-none">{habit.subtitle}</p>
                      <p className="text-[11px] text-on-surface-variant/70 leading-relaxed font-sans mt-1">
                        {habit.desc}
                      </p>
                    </div>
                  </div>

                  {/* Habit Specific Parameter Inputs inside Card to keep interface deeply robust */}
                  <div 
                    onClick={(e) => e.stopPropagation()} // prevent toggle card when using inputs
                    className="mt-2 pt-3 border-t border-white/5 flex flex-col gap-2.5"
                  >
                    {/* 1. Wakeup Time */}
                    {habit.id === 'wakeup' && (
                      <div className="flex items-center justify-between gap-2 bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/10">
                        <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">WAKE TIME:</span>
                        <input 
                          type="text" 
                          value={currentLog.details.wakeupTime}
                          onChange={(e) => handleDetailChange('wakeupTime', e.target.value)}
                          placeholder="06:30 AM"
                          className="bg-transparent text-white font-mono text-[11px] font-bold text-right outline-none w-24 placeholder-white/10"
                        />
                      </div>
                    )}

                    {/* 2. Gym Workout focus */}
                    {habit.id === 'gym' && (
                      <div className="flex items-center justify-between gap-2 bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/10">
                        <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">FOCUS AREAS:</span>
                        <select
                          value={currentLog.details.gymType}
                          onChange={(e) => handleDetailChange('gymType', e.target.value)}
                          className="bg-transparent text-[#91f78e] font-label text-[11px] font-bold text-right outline-none w-32 border-none cursor-pointer"
                        >
                          <option value="Upper Body Power">Upper Body Power</option>
                          <option value="Lower Body Speed">Lower Body Speed</option>
                          <option value="Active Flex & Stretch">Active Flex & Stretch</option>
                          <option value="Rest & Recovery">Rest & Recovery</option>
                          <option value="Core & Mobility">Core & Mobility</option>
                        </select>
                      </div>
                    )}

                    {/* 3. Reading study minutes */}
                    {habit.id === 'reading' && (
                      <div className="flex items-center justify-between gap-2 bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/10">
                        <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">MINUTES STUDY:</span>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="number" 
                            min={0}
                            max={300}
                            value={currentLog.details.readMinutes}
                            onChange={(e) => handleDetailChange('readMinutes', parseInt(e.target.value) || 0)}
                            className="bg-transparent text-[#44a5ff] font-mono text-[11px] font-bold text-right outline-none w-12"
                          />
                          <span className="text-[9px] font-sans text-on-surface-variant/50">mins</span>
                        </div>
                      </div>
                    )}

                    {/* 4. Alcohol Sobriety checklist status */}
                    {habit.id === 'noAlcohol' && (
                      <div className="flex items-center justify-between gap-2 bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/10">
                        <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">SHIELD STATUS:</span>
                        <select
                          value={currentLog.details.drinkStatus}
                          onChange={(e) => handleDetailChange('drinkStatus', e.target.value)}
                          className="bg-transparent text-red-400 font-label text-[11px] font-bold text-right outline-none w-28 border-none cursor-pointer"
                        >
                          <option value="Sober">Sober (Full Shield)</option>
                          <option value="Had Alcohol">Had Alcohol</option>
                        </select>
                      </div>
                    )}

                    {/* 5. Social Media screens */}
                    {habit.id === 'socialMediaDetox' && (
                      <div className="flex items-center justify-between gap-2 bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/10">
                        <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">SCREEN TIME:</span>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="number" 
                            min={0}
                            max={480}
                            value={currentLog.details.screenTimeMins}
                            onChange={(e) => handleDetailChange('screenTimeMins', parseInt(e.target.value) || 0)}
                            className="bg-transparent text-yellow-400 font-mono text-[11px] font-bold text-right outline-none w-12"
                          />
                          <span className="text-[9px] font-sans text-on-surface-variant/50">mins</span>
                        </div>
                      </div>
                    )}

                    {/* 6. Daily Goal Text */}
                    {habit.id === 'goalReview' && (
                      <div className="bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/10">
                        <input 
                          type="text" 
                          value={currentLog.details.dailyGoal}
                          onChange={(e) => handleDetailChange('dailyGoal', e.target.value)}
                          placeholder="My strategic court target for today..."
                          className="bg-transparent text-[#a855f7] font-sans text-[11px] outline-none w-full placeholder-white/20"
                        />
                      </div>
                    )}

                    {/* 7. Journal Entry trigger visual */}
                    {habit.id === 'journaling' && (
                      <div className="bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/10">
                        <input 
                          type="text" 
                          value={currentLog.details.journalText}
                          onChange={(e) => handleDetailChange('journalText', e.target.value)}
                          placeholder="Key mindset reflections..."
                          className="bg-transparent text-[#06b6d4] font-sans text-[11px] outline-none w-full placeholder-white/20 truncate"
                        />
                      </div>
                    )}

                    {/* 8. Cold immersion seconds */}
                    {habit.id === 'coldShower' && (
                      <div className="flex items-center justify-between gap-2 bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/10">
                        <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">EXPOSURE DURATION:</span>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="number" 
                            min={0}
                            max={600}
                            value={currentLog.details.showerDurationSec}
                            onChange={(e) => handleDetailChange('showerDurationSec', parseInt(e.target.value) || 0)}
                            className="bg-transparent text-pink-400 font-mono text-[11px] font-bold text-right outline-none w-12"
                          />
                          <span className="text-[9px] font-sans text-on-surface-variant/50">seconds</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Journal Writing Area */}
          <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant/10 space-y-4 shadow-lg text-left">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#06b6d4]/10 p-2 rounded-xl border border-[#06b6d4]/20 text-[#06b6d4]">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-white leading-tight">Elite Mindset Reflector</h3>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Record technical insights, court visualization & confidence anchors</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  triggerSaveNotification();
                }}
                className="bg-primary hover:bg-primary-dim text-black font-label text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>SAVE ENTRY</span>
              </button>
            </div>

            <textarea
              value={currentLog.details.journalText}
              onChange={(e) => handleDetailChange('journalText', e.target.value)}
              placeholder="What strategic breakthroughs did you hit on the court today? Write down spacing alignments, workout notes, or tactical focus targets..."
              rows={4}
              className="w-full bg-surface-container-low text-white text-xs leading-relaxed p-4 rounded-2xl border border-outline-variant/10 outline-none focus:border-primary/50 resize-none placeholder-white/20 custom-scrollbar text-left font-sans"
            />
          </div>
        </div>

        {/* Right Side: Charts & Historical Timeline */}
        <div className="lg:col-span-4 space-y-8">
          {/* Chart 1: Daily Compliance Progress Chart */}
          <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 space-y-4 shadow-lg text-left">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div>
                <h4 className="font-headline text-sm font-bold text-white">Weekly Consistency %</h4>
                <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mt-0.5">Progress Last 7 Days</p>
              </div>
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="day" stroke="#adaaaa" fontSize={10} tickLine={false} />
                  <YAxis stroke="#adaaaa" fontSize={10} domain={[0, 100]} tickLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#131313', borderColor: '#484847', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '11px', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#ff8f6f', fontSize: '11px' }}
                    formatter={(value: any) => [`${value}% Compliance`, 'Rating']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="percent" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={3} 
                    dot={{ fill: '#ff8f6f', strokeWidth: 1, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <ReferenceLine y={activePreset === 'mamba' ? 100 : activePreset === 'spurs' ? 75 : 50} stroke="#91f78e" strokeDasharray="3 3" label={{ value: 'Target', fill: '#91f78e', fontSize: 8, position: 'insideBottomRight' }} />
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ff8f6f" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Cognitive vs Screen Time Screen Bar */}
          <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 space-y-4 shadow-lg text-left">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div>
                <h4 className="font-headline text-sm font-bold text-white">Focus vs Screen Time</h4>
                <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mt-0.5">Study Mins vs Social Scrolling Mins</p>
              </div>
              <BookOpen className="w-4 h-4 text-[#44a5ff]" />
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="day" stroke="#adaaaa" fontSize={10} tickLine={false} />
                  <YAxis stroke="#adaaaa" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#131313', borderColor: '#484847', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '11px', fontFamily: 'monospace' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Bar dataKey="readMins" name="Cognitive Focus" fill="#44a5ff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="screenMins" name="Social Screen" fill="#ff716c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Log list */}
          <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 space-y-4 shadow-lg text-left">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-on-surface-variant" />
                <h4 className="font-headline text-sm font-bold text-white">Historical Timelines</h4>
              </div>
              <button 
                onClick={initializeDemoLogs}
                className="text-[10px] font-mono text-on-surface-variant hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Refresh and seed dummy performance data for the past 14 days"
              >
                <RefreshCw className="w-3 h-3" />
                <span>SEED GRAPH</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
              {history
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((log) => {
                  const compCount = Object.values(log.completed).filter(Boolean).length;
                  const compRate = Math.round((compCount / 8) * 100);
                  const isSelected = log.date === selectedDate;
                  const dateObj = new Date(log.date + "T00:00:00");
                  
                  return (
                    <div
                      key={log.date}
                      onClick={() => setSelectedDate(log.date)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-left group ${
                        isSelected 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'bg-surface-container-low border-outline-variant/5 hover:border-outline-variant/20'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-white font-body">
                          {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-mono font-bold text-on-surface-variant/70 uppercase">
                            {log.date === getTodayString() ? "TODAY" : log.date === getTodayString(1) ? "YESTERDAY" : "PAST DAY"}
                          </span>
                          {compCount >= 6 ? (
                            <span className="text-[8px] font-mono font-black text-[#91f78e] bg-[#91f78e]/10 px-1 rounded uppercase">ELITE</span>
                          ) : compCount >= 4 ? (
                            <span className="text-[8px] font-mono font-black text-amber-400 bg-amber-400/10 px-1 rounded uppercase">SOLID</span>
                          ) : (
                            <span className="text-[8px] font-mono font-black text-[#ff716c] bg-[#ff716c]/10 px-1 rounded uppercase">REBUILD</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-headline font-black text-white font-mono block">
                            {compRate}%
                          </span>
                          <span className="text-[9px] font-mono text-on-surface-variant block -mt-1">
                            {compCount}/8 Check
                          </span>
                        </div>
                        <div className="h-6 w-1.5 bg-white/5 rounded-full overflow-hidden shrink-0">
                          <div 
                            className={`h-full transition-all duration-300 ${compCount >= 6 ? 'bg-secondary' : compCount >= 4 ? 'bg-amber-400' : 'bg-error'}`} 
                            style={{ height: `${compRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
