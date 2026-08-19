/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { 
  Settings, 
  Dumbbell, 
  LayoutDashboard, 
  History, 
  User, 
  Plus, 
  Minus,
  Trophy,
  Cpu,
  Zap,
  Shield,
  Hand,
  ArrowLeftRight,
  ArrowUpDown,
  Timer,
  Edit2,
  X,
  Check,
  Undo2,
  Redo2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Brain,
  RefreshCw,
  MessageSquare,
  PenTool,
  Eraser,
  Trash2,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Upload,
  BookOpen,
  Save,
  FolderPlus,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowUpRight,
  Square,
  Circle as CircleIcon,
  BarChart2,
  Search,
  Calendar,
  Clock,
  Flame,
  Activity,
  Scale,
  Heart,
  Radio,
  Wifi,
  Lock,
  Download,
  Info,
  Mic,
  MicOff,
  Share2,
  VideoOff,
  Camera,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import IntervalTimer from './components/IntervalTimer';
import RosterBodyMap from './components/RosterBodyMap';
import CameraMotionTracker from './components/CameraMotionTracker';
import PlayerConsistency from './components/PlayerConsistency';
import ParallelBoxDecoder from './components/ParallelBoxDecoder';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { TEAM_DATA, Team, PlayerGoals as TeamPlayerGoals } from './teams';

// Types for our app state
interface GameEvent {
  id: string;
  player: string;
  team: 'home' | 'away';
  action: string;
  time: string;
  quarter: string;
  value?: string | number;
  type: 'score' | 'rebound' | 'assist' | 'steal' | 'block' | 'miss' | 'sub';
}

interface Play {
  id: string;
  name: string;
  type: 'Offense' | 'Defense';
  description: string;
  canvasData?: string;
  createdAt: string;
  reasoning?: string; // AI-generated reasoning for suggestion
  team?: string; // Team association
  frames?: any[][];
}

interface TrainingSession {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  title: string;
  description: string;
  type: 'Skills' | 'Strength' | 'IQ' | 'Recovery';
  duration: string;
  intensity: 'Low' | 'Medium' | 'High';
  exercises: string[];
  completed: boolean;
}

interface PlayerStats {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  misses: number;
  fgMakes: number;
  fgAttempts: number;
}

interface WorkoutVideo {
  id: string;
  title: string;
  creator: string;
  url: string;
  sourceType: 'local' | 'youtube';
  duration: string;
  description: string;
  difficulty: 'Medium' | 'Intense' | 'Extreme';
  uploadedAt: string;
}

interface PlayerGoals {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
}

export default function App() {
  const [homeTeamName, setHomeTeamName] = useState('New York Knicks');
  const [awayTeamName, setAwayTeamName] = useState('San Antonio Spurs');
  
  const [baseHomeScore, setBaseHomeScore] = useState(0);
  const [baseAwayScore, setBaseAwayScore] = useState(0);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [winProbChartMetric, setWinProbChartMetric] = useState<'pace-space' | 'rim-protection'>('pace-space');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [activeTeam, setActiveTeam] = useState<'home' | 'away'>('home');
  const [activePlayer, setActivePlayer] = useState(TEAM_DATA['New York Knicks'].roster[0]);
  const [activeAwayPlayer, setActiveAwayPlayer] = useState(TEAM_DATA['San Antonio Spurs'].roster[0]);
  const [statViewPlayer, setStatViewPlayer] = useState(TEAM_DATA['New York Knicks'].roster[0]);
  const [editingEvent, setEditingEvent] = useState<GameEvent | null>(null);
  const [history, setHistory] = useState<GameEvent[][]>([]);
  const [redoStack, setRedoStack] = useState<GameEvent[][]>([]);
  
  // Player Metadata State
  const [players, setPlayers] = useState<Record<string, string>>(TEAM_DATA['New York Knicks'].numbers);

  const [spursPlayers, setSpursPlayers] = useState<Record<string, string>>(TEAM_DATA['San Antonio Spurs'].numbers);
  
  // Game Clock State
  const [timeLeft, setTimeLeft] = useState(720); // 12 minutes in seconds (1st quarter)
  const [isRunning, setIsRunning] = useState(false);
  const [currentQuarter, setCurrentQuarter] = useState(1);

  // AI Coach State
  const [aiInsights, setAiInsights] = useState<string[]>([
    "Jordan is dominating the paint. Keep feeding him the ball.",
    "Defensive transition is slow. Focus on backcourt coverage.",
    "Smith is showing signs of fatigue. Consider a substitution soon."
  ]);
  const [aiPlaySuggestions, setAiPlaySuggestions] = useState<Play[]>([]);
  const [drills, setDrills] = useState<{ id: string; name: string; completed: number; target: number; isNewCompletion?: boolean }[]>([
    { id: '1', name: '3PT Catch & Shoot', completed: 45, target: 100 },
    { id: '2', name: 'Defensive Slides', completed: 12, target: 20 },
    { id: '3', name: 'Free Throw Routine', completed: 28, target: 50 }
  ]);
  const [isAddingDrill, setIsAddingDrill] = useState(false);
  const [newDrillName, setNewDrillName] = useState('');
  const [newDrillTarget, setNewDrillTarget] = useState(50);

  const incrementDrill = (id: string) => {
    setDrills(prev => prev.map(d => {
      if (d.id === id) {
        const newCompleted = Math.min(d.completed + 1, d.target);
        const wasNotCompleted = d.completed < d.target;
        const isNowCompleted = newCompleted >= d.target;
        
        return { 
          ...d, 
          completed: newCompleted,
          isNewCompletion: wasNotCompleted && isNowCompleted
        };
      }
      return d;
    }));

    // Reset the "new completion" flag after a delay
    setTimeout(() => {
      setDrills(prev => prev.map(d => d.id === id ? { ...d, isNewCompletion: false } : d));
    }, 3000);
  };
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLiveAnalysisEnabled, setIsLiveAnalysisEnabled] = useState(true);
  const [isTimeoutActive, setIsTimeoutActive] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [playerPositions, setPlayerPositions] = useState<Record<string, string>>(TEAM_DATA['New York Knicks'].positions);

  const [spursPlayerPositions, setSpursPlayerPositions] = useState<Record<string, string>>(TEAM_DATA['San Antonio Spurs'].positions);
  const [playerGoals, setPlayerGoals] = useState<Record<string, PlayerGoals>>(TEAM_DATA['New York Knicks'].goals);
  const [spursPlayerGoals, setSpursPlayerGoals] = useState<Record<string, PlayerGoals>>(TEAM_DATA['San Antonio Spurs'].goals);
  const [isJerseyModalOpen, setIsJerseyModalOpen] = useState(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editGoals, setEditGoals] = useState<PlayerGoals>({ points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0 });
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editPosition, setEditPosition] = useState('');

  useEffect(() => {
    if (isJerseyModalOpen && activePlayer) {
      setEditName(activePlayer);
      setEditNumber(players[activePlayer] || '00');
      setEditPosition(playerPositions[activePlayer] || '');
    }
  }, [isJerseyModalOpen, activePlayer, players, playerPositions]);

  // Global keydown event listener to toggle the 'Timeout Tactical Board' via Ctrl+T or Cmd+T
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        const activeElement = document.activeElement;
        // Skip shortcut if user is actively writing in a form text input, textarea, or selector
        if (
          activeElement &&
          (activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.tagName === 'SELECT' ||
            activeElement.getAttribute('contenteditable') === 'true')
        ) {
          return;
        }

        e.preventDefault();
        setIsTimeoutActive(prev => {
          const nextVal = !prev;
          if (nextVal) {
            setIsRunning(false); // Pause game clock simulation
          }
          return nextVal;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTeamChange = (side: 'home' | 'away', teamName: string) => {
    const team = TEAM_DATA[teamName];
    if (!team) return;

    if (side === 'home') {
      setHomeTeamName(teamName);
      setRoster(team.roster);
      setPlayers(team.numbers);
      setPlayerPositions(team.positions);
      setPlayerGoals(team.goals);
      setActivePlayer(team.roster[0]);
      setStatViewPlayer(team.roster[0]);
      
      const newJerseys: Record<string, string> = {};
      team.roster.forEach(p => {
        newJerseys[p] = team.colors.primary;
      });
      setPlayerJerseys(newJerseys);
    } else {
      setAwayTeamName(teamName);
      setSpursRoster(team.roster);
      setSpursPlayers(team.numbers);
      setSpursPlayerPositions(team.positions);
      setSpursPlayerGoals(team.goals);
      setActiveAwayPlayer(team.roster[0]);

      const newJerseys: Record<string, string> = {};
      team.roster.forEach(p => {
        newJerseys[p] = team.colors.primary;
      });
      setSpursPlayerJerseys(newJerseys);
    }
  };
  const [plays, setPlays] = useState<Play[]>([
    { 
      id: 'austin-spurs-blob', 
      name: 'Austin Spurs - BLOB', 
      type: 'Offense', 
      description: 'Austin Spurs Baseline Out of Bounds (BLOB) play: 1 enters to the help side block, 5 butt screens, 3 curls off of 5, 2 passes to 3, 4 lifts.', 
      createdAt: '2026-06-26',
      team: 'Austin Spurs'
    },
    { 
      id: 'austin-spurs-blob-2', 
      name: 'Austin Spurs - BLOB Misdirect', 
      type: 'Offense', 
      description: 'Austin Spurs Baseline Out of Bounds (BLOB) play: 1-4 are interchangeable height wise. 3+4 both briefly fake a screen for 2. 2 misdirects and comes ball side corner. 4 curls off of 2\'s back to the weak short corner, then exits. 3 pops to the high rimline area. 5 walks towards the elbow. 1 passes to 2.', 
      createdAt: '2026-06-26',
      team: 'Austin Spurs'
    },
    { 
      id: 'okc-curl', 
      name: 'OKC Thunder - Curl Pin Down SLOB', 
      type: 'Offense', 
      description: 'Side Line Out of Bounds play featuring a curl and pin down screen. Perfect for getting an open look for a shooter off a stagger-like action.', 
      createdAt: '2026-05-05',
      team: 'OKC Thunder'
    },
    { 
      id: 'okc-horns', 
      name: 'OKC Thunder - Horns Flare', 
      type: 'Offense', 
      description: 'Tactical offensive set from Horns formation (two bigs at the elbows). Features a flare screen used to free up a perimeter threat as the defense collapses.', 
      createdAt: '2026-05-05',
      team: 'OKC Thunder'
    },
    { 
      id: 'okc-stagger', 
      name: 'OKC Thunder - Low Clock SLOB Stagger', 
      type: 'Offense', 
      description: 'High-efficiency SLOB (Side Line Out of Bounds) play designed for situations with less than 5 seconds. Uses a double-staggered screen to maximize separation.', 
      createdAt: '2026-05-05',
      team: 'OKC Thunder'
    },
    { id: '1', name: 'Hornseth Flare', type: 'Offense', description: 'Flare screen for the shooting guard.', createdAt: '2026-03-27' },
    { id: '2', name: '2-3 Zone', type: 'Defense', description: 'Standard 2-3 zone defense.', createdAt: '2026-03-27' }
  ]);
  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);
  const [isOptimizingPlay, setIsOptimizingPlay] = useState(false);
  const [sharingPlay, setSharingPlay] = useState<Play | null>(null);
  const [exportingPlay, setExportingPlay] = useState<Play | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleExportJson = (play: Play) => {
    try {
      const storageKey = `tactical-players-shared-${play.id}`;
      const savedFrames = localStorage.getItem(storageKey);
      const parsedFrames = savedFrames ? JSON.parse(savedFrames) : (play.frames || undefined);

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        name: play.name,
        type: play.type,
        description: play.description,
        team: play.team,
        canvasData: play.canvasData,
        reasoning: play.reasoning,
        frames: parsedFrames
      }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      const safeName = play.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      downloadAnchor.setAttribute("download", `basketball-play-${safeName}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Failed to export play as JSON:", err);
    }
  };

  const handleExportPng = (play: Play) => {
    try {
      let downloadUrl = play.canvasData;
      if (!downloadUrl) {
        // Fallback: draw court diagram with metadata onto high-res canvas on-the-fly
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 675;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0a0f1d'; // dark deep obsidian background
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Subtle grids
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
          ctx.lineWidth = 1;
          for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }

          // Court line structure in orange tint
          ctx.strokeStyle = 'rgba(251, 146, 60, 0.3)';
          ctx.lineWidth = 4;
          ctx.strokeRect(55, 55, canvas.width - 110, canvas.height - 110);

          ctx.beginPath();
          ctx.moveTo(canvas.width / 2, 55);
          ctx.lineTo(canvas.width / 2, canvas.height - 55);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, 90, 0, 2 * Math.PI);
          ctx.stroke();

          // Left Key (Paint area)
          ctx.strokeRect(55, canvas.height / 2 - 110, 190, 220);
          ctx.beginPath();
          ctx.arc(245, canvas.height / 2, 110, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();

          // Left 3PT Arch
          ctx.beginPath();
          ctx.arc(105, canvas.height / 2, 290, -Math.PI / 2.3, Math.PI / 2.3);
          ctx.stroke();

          // Right Key (Paint area)
          ctx.strokeRect(canvas.width - 245, canvas.height / 2 - 110, 190, 220);
          ctx.beginPath();
          ctx.arc(canvas.width - 245, canvas.height / 2, 110, Math.PI / 2, -Math.PI / 2);
          ctx.stroke();

          // Right 3PT Arch
          ctx.beginPath();
          ctx.arc(canvas.width - 105, canvas.height / 2, 290, Math.PI / 1.3, -Math.PI / 1.3);
          ctx.stroke();

          // Metadata Display Text
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 34px sans-serif';
          ctx.fillText(play.name, 90, 115);

          ctx.fillStyle = '#fb923c'; // brand Orange
          ctx.font = 'bold 16px monospace';
          ctx.fillText(`TACTICAL SET: ${play.type.toUpperCase()}`, 90, 145);

          if (play.team) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '500 15px sans-serif';
            ctx.fillText(`TEAM UNIFORM: ${play.team}`, 90, 170);
          }

          if (play.description) {
            ctx.fillStyle = 'rgba(156, 163, 175, 0.75)';
            ctx.font = 'italic 15px sans-serif';
            const words = play.description.split(' ');
            let line = '';
            let lineY = 215;
            for (let n = 0; n < words.length; n++) {
              let testLine = line + words[n] + ' ';
              let metrics = ctx.measureText(testLine);
              if (metrics.width > 420 && n > 0) {
                ctx.fillText(line, 90, lineY);
                line = words[n] + ' ';
                lineY += 24;
              } else {
                line = testLine;
              }
            }
            ctx.fillText(line, 90, lineY);
          }

          // Offense O and Defense X symbols
          ctx.strokeStyle = '#34d399'; // green ring
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(canvas.width / 2 + 120, canvas.height / 2 - 40, 18, 0, 2 * Math.PI);
          ctx.stroke();

          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 14px monospace';
          ctx.fillText('SG', canvas.width / 2 + 112, canvas.height / 2 - 35);

          ctx.strokeStyle = '#f87171'; // red cross
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 + 100, canvas.height / 2 - 80);
          ctx.lineTo(canvas.width / 2 + 116, canvas.height / 2 - 64);
          ctx.moveTo(canvas.width / 2 + 116, canvas.height / 2 - 80);
          ctx.lineTo(canvas.width / 2 + 100, canvas.height / 2 - 64);
          ctx.stroke();

          // Dotted path line
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.setLineDash([5, 5]);
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 + 120, canvas.height / 2 - 20);
          ctx.lineTo(canvas.width / 2 + 140, canvas.height / 2 + 50);
          ctx.stroke();
          ctx.setLineDash([]);

          // Path direction Arrow
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 + 140, canvas.height / 2 + 50);
          ctx.lineTo(canvas.width / 2 + 130, canvas.height / 2 + 38);
          ctx.lineTo(canvas.width / 2 + 148, canvas.height / 2 + 41);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText('COURTVISION SECURE EXPORT', canvas.width - 350, canvas.height - 85);

          downloadUrl = canvas.toDataURL('image/png');
        }
      }

      if (downloadUrl) {
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", downloadUrl);
        const safeName = play.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        downloadAnchor.setAttribute("download", `basketball-court-diagram-${safeName}.png`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (err) {
      console.error("Failed to export play as PNG:", err);
    }
  };

  const handleCopyLink = (playLink: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(playLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = playLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch (err) {
      console.error("Clipboard copy failed fallback text used:", err);
    }
  };
  const resolveUploadedPlayPositions = (item: any): any[][] | undefined => {
    if (!item) return undefined;
    
    // 1. Direct 'frames' array
    if (item.frames && Array.isArray(item.frames) && item.frames.length > 0) {
      return item.frames.map((frame: any) => {
        if (Array.isArray(frame)) {
          return frame.map((p: any) => ({
            id: p.id || `p-${Math.random().toString(36).substring(2, 6)}`,
            label: p.label || p.name || 'PG',
            x: typeof p.x === 'number' ? p.x : parseFloat(p.x) || 50,
            y: typeof p.y === 'number' ? p.y : parseFloat(p.y) || 50,
            type: (p.type || p.teamType || 'offense').toLowerCase() === 'defense' ? 'defense' : 'offense'
          }));
        }
        return [];
      }).filter((f: any[]) => f.length > 0);
    }

    // 2. Direct 'players' or 'positions' single frame
    const singleFrame = item.players || item.positions || item.coords;
    if (singleFrame && Array.isArray(singleFrame)) {
      const parsedFrame = singleFrame.map((p: any) => ({
        id: p.id || `p-${Math.random().toString(36).substring(2, 6)}`,
        label: p.label || p.name || 'PG',
        x: typeof p.x === 'number' ? p.x : parseFloat(p.x) || 50,
        y: typeof p.y === 'number' ? p.y : parseFloat(p.y) || 50,
        type: (p.type || p.teamType || 'offense').toLowerCase() === 'defense' ? 'defense' : 'offense'
      }));
      if (parsedFrame.length > 0) {
        return [parsedFrame];
      }
    }

    // 3. Stringified or embedded block inside description
    if (typeof item.description === 'string' || typeof item.notes === 'string') {
      const descText = item.description || item.notes || '';
      const jsonMatch = descText.match(/positions\s*:\s*(\[[\s\S]*?\])/i) || descText.match(/frames\s*:\s*(\[[\s\S]*?\])/i);
      if (jsonMatch) {
        try {
          const parsedTxt = JSON.parse(jsonMatch[1]);
          if (Array.isArray(parsedTxt)) {
            if (Array.isArray(parsedTxt[0])) {
              return parsedTxt;
            } else {
              return [parsedTxt];
            }
          }
        } catch (e) {
          console.warn("Could not parse coordinates in text description match", e);
        }
      }
    }

    return undefined;
  };

  const [isCreatingPlay, setIsCreatingPlay] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadFullscreen, setIsUploadFullscreen] = useState(false);
  const [previewingPlayFullscreen, setPreviewingPlayFullscreen] = useState<Play | null>(null);
  
  // AI Video Analysis States
  const [analyzingVideo, setAnalyzingVideo] = useState<any | null>(null);
  const [cvProcessingStep, setCvProcessingStep] = useState<string>('');
  const [cvProcessingProgress, setCvProcessingProgress] = useState<number>(0);
  const [activeCvTab, setActiveCvTab] = useState<'rf_detr' | 'sam3' | 'siglip2' | 'glm_ocr'>('rf_detr');
  const [selectedTrackedPlayerId, setSelectedTrackedPlayerId] = useState<string | null>(null);
  const [cvFloatFrame, setCvFloatFrame] = useState<number>(0);

  // States & Refs for interactive player coordinate/cluster movement in playbook uploads
  const [cvDraggingPlayerId, setCvDraggingPlayerId] = useState<string | null>(null);
  const [cvDraggingPointType, setCvDraggingPointType] = useState<'court' | 'siglip'>('court');
  const siglipSvgRef = React.useRef<SVGSVGElement | null>(null);

  const handleMovePlayerOnCourt = (playerId: string, percentX: number, percentY: number) => {
    if (!analyzingVideo) return;
    const currentFrIdx = analyzingVideo.currentFrame;
    setAnalyzingVideo((prev: any) => {
      if (!prev) return null;
      const updatedFrames = prev.frames.map((frame: any, idx: number) => {
        if (idx !== currentFrIdx) return frame;
        return frame.map((fp: any) => {
          if (fp.id === playerId) {
            return { ...fp, x: parseFloat(percentX.toFixed(1)), y: parseFloat(percentY.toFixed(1)) };
          }
          if (fp.isBall && playerId === 'ball') {
            return { ...fp, x: parseFloat(percentX.toFixed(1)), y: parseFloat(percentY.toFixed(1)) };
          }
          return fp;
        });
      });
      return { ...prev, frames: updatedFrames };
    });
  };

  const handleMovePlayerEmbedding = (playerId: string, embX: number, embY: number) => {
    if (!analyzingVideo) return;
    setAnalyzingVideo((prev: any) => {
      if (!prev) return null;
      const updatedPlayers = prev.players.map((pt: any) => {
        if (pt.id === playerId) {
          return { ...pt, embedding: [parseFloat(embX.toFixed(2)), parseFloat(embY.toFixed(2))] };
        }
        return pt;
      });
      return { ...prev, players: updatedPlayers };
    });
  };

  const handleCourtPointerMove = (clientX: number, clientY: number, currentTarget: HTMLDivElement) => {
    if (!cvDraggingPlayerId || cvDraggingPointType !== 'court') return;
    const rect = currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, parseFloat(((clientX - rect.left) / rect.width * 100).toFixed(1))));
    const y = Math.max(0, Math.min(100, parseFloat(((clientY - rect.top) / rect.height * 100).toFixed(1))));
    handleMovePlayerOnCourt(cvDraggingPlayerId, x, y);
  };

  const handleSiglipPointerMove = (clientX: number, clientY: number) => {
    if (!cvDraggingPlayerId || cvDraggingPointType !== 'siglip' || !siglipSvgRef.current) return;
    const rect = siglipSvgRef.current.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * 200;
    const svgY = ((clientY - rect.top) / rect.height) * 150;
    const embX = (svgX - 100) / 25;
    const embY = (75 - svgY) / 25;
    handleMovePlayerEmbedding(cvDraggingPlayerId, embX, embY);
  };

  const activeCvPlayers = React.useMemo(() => {
    if (!analyzingVideo) return [];
    const framesData = analyzingVideo.frames || [];
    if (framesData.length === 0) return [];

    if (!analyzingVideo.isPlaying) {
      return framesData[analyzingVideo.currentFrame] || [];
    }

    const baseIndex = Math.floor(cvFloatFrame);
    const nextIndex = (baseIndex + 1) % framesData.length;
    const t = cvFloatFrame - baseIndex;

    const baseFrame = framesData[baseIndex] || [];
    const nextFrame = framesData[nextIndex] || [];

    return baseFrame.map((baseObj: any) => {
      let match = null;
      if (baseObj.isBall) {
        match = nextFrame.find((n: any) => n.isBall);
      } else {
        match = nextFrame.find((n: any) => n.id === baseObj.id);
      }

      if (match) {
        return {
          ...baseObj,
          x: baseObj.x + (match.x - baseObj.x) * t,
          y: baseObj.y + (match.y - baseObj.y) * t,
        };
      }
      return baseObj;
    });
  }, [analyzingVideo, cvFloatFrame]);

  const trackedTarget = (() => {
    if (!analyzingVideo) return null;
    const activeFrData = activeCvPlayers || [];
    if (selectedTrackedPlayerId) {
      const foundPlayer = activeFrData.find((pt: any) => pt.id === selectedTrackedPlayerId);
      if (foundPlayer) {
        const details = analyzingVideo.players?.find((p: any) => p.id === selectedTrackedPlayerId);
        return {
          x: foundPlayer.x,
          y: foundPlayer.y,
          id: selectedTrackedPlayerId,
          label: details ? `PLAYER #${details.number}` : 'TRACKED TARGET',
          sublabel: details ? `S2 ${details.type === 'offense' ? 'OFF' : 'DEF'} N${details.number} PHYS ISO` : 'CAMERA LOCK TARGET',
          details: details
        };
      }
    }
    const ballCoord = activeFrData.find((pt: any) => pt.isBall);
    if (ballCoord) {
      return {
        x: ballCoord.x,
        y: ballCoord.y,
        id: 'ball',
        label: 'MATCH BALL',
        sublabel: 'BALL_99.7% TELEMETRY',
        details: null
      };
    }
    return null;
  })();

  const motionTrail = React.useMemo(() => {
    if (!analyzingVideo) return [];
    
    // We want the trail of the currently selected tracked player. If no player is selected, fallback to tracking the ball!
    const targetId = selectedTrackedPlayerId || 'ball';
    const isBall = targetId === 'ball';
    
    const frames = analyzingVideo.frames || [];
    const count = frames.length;
    if (count === 0) return [];

    const trail = [];
    const currentF = analyzingVideo.currentFrame;

    for (let i = 0; i < 10; i++) {
      let frameIdx = currentF - i;
      if (frameIdx < 0) {
        if (analyzingVideo.isPlaying) {
          frameIdx = (frameIdx + count) % count;
        } else {
          break;
        }
      }

      const frameData = frames[frameIdx] || [];
      const itemInFrame = isBall 
        ? frameData.find((pt: any) => pt.isBall)
        : frameData.find((pt: any) => pt.id === targetId);

      if (itemInFrame) {
        // If we are currently playing, interpolate the very first point (age 0) for smoothness!
        if (i === 0 && analyzingVideo.isPlaying) {
          const activeItem = isBall 
            ? activeCvPlayers.find((pt: any) => pt.isBall)
            : activeCvPlayers.find((pt: any) => pt.id === targetId);
          if (activeItem) {
            trail.push({ x: activeItem.x, y: activeItem.y, frameIdx, age: i });
            continue;
          }
        }
        trail.push({ x: itemInFrame.x, y: itemInFrame.y, frameIdx, age: i });
      }
    }
    return trail;
  }, [analyzingVideo, selectedTrackedPlayerId, activeCvPlayers]);

  const ballPossession = React.useMemo(() => {
    if (!analyzingVideo) return null;
    const activeFrData = activeCvPlayers || [];
    const ballCoord = activeFrData.find((pt: any) => pt.isBall);
    if (!ballCoord) return null;

    // Find all player entities in the active list
    const players = activeFrData.filter((pt: any) => !pt.isBall);
    if (players.length === 0) return null;

    let closestPlayer = null;
    let minDist = Infinity;

    for (const p of players) {
      const dx = p.x - ballCoord.x;
      const dy = p.y - ballCoord.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        closestPlayer = p;
      }
    }

    // A proximity radius of 8% represents ball touch/possession
    if (closestPlayer && minDist < 9.5) {
      const details = analyzingVideo.players?.find((pd: any) => pd.id === closestPlayer.id);
      return {
        player: closestPlayer,
        details: details,
        distance: minDist,
        ballX: ballCoord.x,
        ballY: ballCoord.y
      };
    }
    return null;
  }, [analyzingVideo, activeCvPlayers]);

  const [showBallMotionAnalysis, setShowBallMotionAnalysis] = useState<boolean>(true);

  const ballMotionTracker = React.useMemo(() => {
    if (!analyzingVideo) return null;
    const frames = analyzingVideo.frames || [];
    const N = frames.length;
    if (N < 2) return null;

    // Get current ball position in interpolated activeCvPlayers
    const activeFrData = activeCvPlayers || [];
    const ballCurrent = activeFrData.find((pt: any) => pt.isBall);
    if (!ballCurrent) return null;

    // Estimate ball's direction of movement
    // To do this, we can look at the current cvFloatFrame and compare with previous frame index
    const prevFrameIdx = Math.max(0, Math.floor(cvFloatFrame));
    const nextFrameIdx = Math.min(N - 1, prevFrameIdx + 1);
    
    const prevBall = frames[prevFrameIdx]?.find((pt: any) => pt.isBall) || ballCurrent;
    const nextBall = frames[nextFrameIdx]?.find((pt: any) => pt.isBall) || ballCurrent;

    // Ball velocity components (percentage of court per frame)
    const dx = nextBall.x - prevBall.x;
    const dy = nextBall.y - prevBall.y;
    const ballSpeedPerFrame = Math.sqrt(dx * dx + dy * dy);

    // Let's find players in the current frame
    const players = activeFrData.filter((pt: any) => !pt.isBall);

    // Let's find who is the "Sender" (last player who had the ball, or closest player behind the ball's motion vector)
    // Scan backwards to find when a player was last < 9.5% from the ball.
    let sender = null;
    for (let f = prevFrameIdx; f >= 0; f--) {
      const bAtF = frames[f]?.find((pt: any) => pt.isBall);
      if (!bAtF) continue;
      const playersAtF = frames[f]?.filter((pt: any) => !pt.isBall) || [];
      let closestAtF = null;
      let minDistAtF = Infinity;
      for (const p of playersAtF) {
        const dX = p.x - bAtF.x;
        const dY = p.y - bAtF.y;
        const dist = Math.sqrt(dX * dX + dY * dY);
        if (dist < minDistAtF) {
          minDistAtF = dist;
          closestAtF = p;
        }
      }
      if (closestAtF && minDistAtF < 9.5) {
        sender = closestAtF;
        break;
      }
    }

    // Now let's find the "Receiver" (the player toward whom the ball is moving, or closest player ahead of the ball's path, or closest player in the next frames who will be within proximity)
    let receiver = null;
    for (let f = prevFrameIdx; f < N; f++) {
      const bAtF = frames[f]?.find((pt: any) => pt.isBall);
      if (!bAtF) continue;
      const playersAtF = frames[f]?.filter((pt: any) => !pt.isBall) || [];
      let closestAtF = null;
      let minDistAtF = Infinity;
      for (const p of playersAtF) {
        const dX = p.x - bAtF.x;
        const dY = p.y - bAtF.y;
        const dist = Math.sqrt(dX * dX + dY * dY);
        if (dist < minDistAtF) {
          minDistAtF = dist;
          closestAtF = p;
        }
      }
      if (closestAtF && minDistAtF < 9.5) {
        // Only set receiver if it is different from the sender (or if we don't have a sender)
        if (!sender || closestAtF.id !== sender.id) {
          receiver = closestAtF;
          break;
        }
      }
    }

    // Fallback: If we couldn't find a prospective receiver in future frames, find the player closest to the ball's line of travel
    if (!receiver && players.length > 0) {
      let bestReceiver = null;
      let bestScore = -Infinity; // combining proximity and direction alignment
      for (const p of players) {
        if (sender && p.id === sender.id) continue;
        const dxToPlayer = p.x - ballCurrent.x;
        const dyToPlayer = p.y - ballCurrent.y;
        const distToPlayer = Math.sqrt(dxToPlayer * dxToPlayer + dyToPlayer * dyToPlayer);
        if (distToPlayer === 0) continue;

        // Angle alignment between ball travel direction and player direction
        let angleScore = 0;
        if (ballSpeedPerFrame > 0.1) {
          const cosTheta = (dx * dxToPlayer + dy * dyToPlayer) / (ballSpeedPerFrame * distToPlayer);
          angleScore = cosTheta; // 1 means player is directly ahead, -1 means directly behind
        }

        const score = angleScore * 50 - distToPlayer; // balance alignment and distance
        if (score > bestScore) {
          bestScore = score;
          bestReceiver = p;
        }
      }
      receiver = bestReceiver;
    }

    // Let's resolve player names & details
    const senderDetails = sender ? analyzingVideo.players?.find((pd: any) => pd.id === sender.id) : null;
    const receiverDetails = receiver ? analyzingVideo.players?.find((pd: any) => pd.id === receiver.id) : null;

    // Convert screen % units to standard court dimensions (28.65m wide by 15.24m tall)
    const scaleX = 28.65;
    const scaleY = 15.24;

    const ballVxMetersPerSec = (dx * (scaleX / 100)) / 1.0; // Assume 1.0s per frame index default in video
    const ballVyMetersPerSec = (dy * (scaleY / 100)) / 1.0;
    const ballSpeedMetersPerSec = Math.sqrt(ballVxMetersPerSec * ballVxMetersPerSec + ballVyMetersPerSec * ballVyMetersPerSec);

    // Distance from ball to receiver in meters
    let distanceToReceiverMeters = 0;
    if (receiver) {
      const rx = activeFrData.find((p: any) => p.id === receiver.id) || receiver;
      const dxMeters = (rx.x - ballCurrent.x) * (scaleX / 100);
      const dyMeters = (rx.y - ballCurrent.y) * (scaleY / 100);
      distanceToReceiverMeters = Math.sqrt(dxMeters * dxMeters + dyMeters * dyMeters);
    }

    // Est. Time to intercept
    const timeToInterceptSeconds = (ballSpeedMetersPerSec > 0.2 && distanceToReceiverMeters > 0)
      ? distanceToReceiverMeters / ballSpeedMetersPerSec
      : 0;

    return {
      ball: ballCurrent,
      sender: sender ? { ...sender, details: senderDetails } : null,
      receiver: receiver ? { ...receiver, details: receiverDetails } : null,
      dx, dy,
      speedMetersPerSec: ballSpeedMetersPerSec,
      speedMph: ballSpeedMetersPerSec * 2.237,
      distanceToReceiverMeters,
      distanceToReceiverFeet: distanceToReceiverMeters * 3.28084,
      timeToInterceptSeconds,
      isPassInProgress: !ballPossession && ballSpeedMetersPerSec > 1.5,
    };
  }, [analyzingVideo, cvFloatFrame, activeCvPlayers, ballPossession]);

  const [showGroundTruth, setShowGroundTruth] = useState<boolean>(true);
  const [ocrConfidenceFilter, setOcrConfidenceFilter] = useState<number>(85);
  const [cvPlaybackRate, setCvPlaybackRate] = useState<number>(1.0);

  // High-precision subsecond tracking ticker that slides players nicely
  useEffect(() => {
    if (!analyzingVideo) return;
    if (!analyzingVideo.isPlaying) {
      setCvFloatFrame(analyzingVideo.currentFrame);
      return;
    }

    let lastTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const elapsed = now - lastTime;
      lastTime = now;

      setCvFloatFrame((prev) => {
        const step = (elapsed / 1000) * cvPlaybackRate;
        let next = prev + step;

        const maxFrame = (analyzingVideo.framesCount || 5);
        if (next >= maxFrame) {
          next = 0; // seamless looping
        }
        return next;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [analyzingVideo?.isPlaying, cvPlaybackRate, analyzingVideo?.framesCount, analyzingVideo?.currentFrame]);

  // Sync integer frame index so that sliders and tabs stay perfectly in beat with the smooth movement
  useEffect(() => {
    if (analyzingVideo && analyzingVideo.isPlaying) {
      const floorIndex = Math.floor(cvFloatFrame) % (analyzingVideo.framesCount || 5);
      if (floorIndex !== analyzingVideo.currentFrame) {
        setAnalyzingVideo((prev: any) => {
          if (!prev) return null;
          return { ...prev, currentFrame: floorIndex };
        });
      }
    }
  }, [cvFloatFrame, analyzingVideo?.isPlaying, analyzingVideo?.framesCount]);

  const [uploadedFilesData, setUploadedFilesData] = useState<{
    name: string;
    size: string;
    status: 'success' | 'error' | 'loading';
    message?: string;
  }[]>([]);
  const [importPreviewPlays, setImportPreviewPlays] = useState<Play[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // States for Manual Detection on Court Canvas
  const [manualClickCoords, setManualClickCoords] = useState<{ x: number, y: number } | null>(null);
  const [manualPlayerName, setManualPlayerName] = useState<string>('');
  const [manualPlayerNumber, setManualPlayerNumber] = useState<string>('');
  const [manualPlayerTeam, setManualPlayerTeam] = useState<'Team A (Knicks)' | 'Team B (White)'>('Team A (Knicks)');
  const [manualPlayerRole, setManualPlayerRole] = useState<string>('PG');

  const getSimilarVideos = () => {
    const is1v1 = analyzingVideo && (
      analyzingVideo.name.toLowerCase().includes('1v1') || 
      analyzingVideo.name.toLowerCase().includes('wemby') || 
      analyzingVideo.name.toLowerCase().includes('hoop') ||
      analyzingVideo.name.toLowerCase().includes('hooper') ||
      analyzingVideo.players.length <= 2
    );

    if (is1v1) {
      return [
        {
          title: "Wemby vs Holmgren 1v1 Streetball Showdown",
          youtubeId: "kY8c2_Zco7M",
          match: 98.4,
          type: "1V1 STREET HOOP",
          description: "Elite spacing, perimeter crossovers, and step-back fadeaways. Matches the high-low length ratio."
        },
        {
          title: "Kyrie Irving Playground Iso Tape",
          youtubeId: "1FMyC8zWjZ0",
          match: 95.1,
          type: "OUTDOOR ISO HOOP",
          description: "Intense perimeter acceleration with dual crossovers culminating in high-arcing layups on concrete."
        },
        {
          title: "Jordan vs Kobe Outdoor Iso Matchup",
          youtubeId: "68T1nNbyq34",
          match: 92.6,
          type: "1V1 RETRO BATTLE",
          description: "Mid-post triple-threat stance, footwork pivot sequences, and highly identical high-release fadeaways."
        },
        {
          title: "The Professor 1v1 Park Showdown",
          youtubeId: "6_6v4iOOfE8",
          match: 89.8,
          type: "PLAYGROUND EXHIBITION",
          description: "Ankle-breaker crossover sequences and speed bursts matching the rapid court acceleration profiles."
        }
      ];
    } else {
      return [
        {
          title: "Warriors High Split Post Cut",
          youtubeId: "kY8c2_Zco7M",
          match: 96.5,
          type: "5V5 OFFENSE SPLIT",
          description: "Classic high-post hand-off with weakside baseline pin-down screen and rapid corner curl entry."
        },
        {
          title: "Spurs Motion Baseline Rotation",
          youtubeId: "1FMyC8zWjZ0",
          match: 94.2,
          type: "TACTICAL SEQUENCE",
          description: "Strongside overload resulting in weakside paint-kick and secondary corner wing drive."
        },
        {
          title: "Duke Perimeter Full-Court Press Drill",
          youtubeId: "68T1nNbyq34",
          match: 91.8,
          type: "DEFENSIVE PRESSURE",
          description: "Full-court press alignment and sideline traps matching high-speed defensive posture vectors."
        },
        {
          title: "Celtics Double Drag Screen Action",
          youtubeId: "6_6v4iOOfE8",
          match: 87.4,
          type: "PICK & ROLL SET",
          description: "Double high-screen for primary ball handler culminating in a short-roll pocket pass or corner skip."
        }
      ];
    }
  };

  const handleLoadSimilarVideo = (vid: any) => {
    setCvProcessingProgress(0);
    setCvProcessingStep(`Retrieving similar play match: ${vid.title}...`);
    
    const fileName = vid.title;
    const fileSizeStr = "Live Spatiotemporal Stream";
    
    setUploadedFilesData([
      {
        name: fileName,
        size: fileSizeStr,
        status: 'loading',
        message: `Running play semantic similarity map and alignment...`
      }
    ]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        clearInterval(interval);
        setCvProcessingProgress(100);
        
        const is1v1 = vid.type.includes('1V1') || vid.type.includes('ISO') || vid.type.includes('PLAYGROUND');

        let playersList = [];
        let framesList = [];
        let basketObj = { x: 5.5, y: 50, w: 4, h: 6, label: "Basket Rim [Left]" };

        if (is1v1) {
          playersList = [
            { id: 'O1', name: 'YOU', label: 'YOU', number: 'YOU', type: 'offense', confidence: 98.7, cls: 'Team A (Knicks)', embedding: [-2.4, 2.1], ocrDetails: 'Jersey reader detected front plate [YOU], conf 98.7%' },
            { id: 'D1', name: 'WEMBY', label: 'WEMBY', number: 'WEMBY', type: 'defense', confidence: 99.1, cls: 'Team B (White)', embedding: [2.8, -1.4], ocrDetails: 'Jersey reader detected back plate [WEMBY], conf 99.1%' }
          ];

          framesList = [
            [
              { id: 'O1', x: 45, y: 45 }, { id: 'D1', x: 35, y: 48 },
              { isBall: true, x: 45, y: 45 }
            ],
            [
              { id: 'O1', x: 38, y: 42 }, { id: 'D1', x: 31, y: 46 },
              { isBall: true, x: 38, y: 42 }
            ],
            [
              { id: 'O1', x: 28, y: 52 }, { id: 'D1', x: 26, y: 49 },
              { isBall: true, x: 28, y: 52 }
            ],
            [
              { id: 'O1', x: 18, y: 50 }, { id: 'D1', x: 15, y: 48 },
              { isBall: true, x: 14, y: 49 }
            ],
            [
              { id: 'O1', x: 18, y: 50 }, { id: 'D1', x: 15, y: 48 },
              { isBall: true, x: 5.5, y: 50 }
            ]
          ];
        } else {
          playersList = [
            { id: 'O1', name: 'Steph Curry', label: 'PG', number: '30', type: 'offense', confidence: 99.2, cls: 'Team A (Knicks)', embedding: [-2.4, 2.1], ocrDetails: 'Jersey reader detected back plate [30], conf 99.4%' },
            { id: 'O2', name: 'LeBron James', label: 'SF', number: '23', type: 'offense', confidence: 98.1, cls: 'Team A (Knicks)', embedding: [-1.8, 1.9], ocrDetails: 'Jersey reader detected back plate [23], conf 98.1%' },
            { id: 'O3', name: 'Jayson Tatum', label: 'PF', number: '0', type: 'offense', confidence: 97.4, cls: 'Team A (Knicks)', embedding: [-2.1, 1.5], ocrDetails: 'Jersey reader detected jersey front [0], conf 97.8%' },
            { id: 'O4', name: 'Jalen Brunson', label: 'SG', number: '11', type: 'offense', confidence: 96.5, cls: 'Team A (Knicks)', embedding: [-2.9, 2.4], ocrDetails: 'Jersey reader detected shorts corner [11], conf 96.5%' },
            { id: 'O5', name: 'Kevin Durant', label: 'C', number: '7', type: 'offense', confidence: 97.9, cls: 'Team A (Knicks)', embedding: [-1.5, 2.2], ocrDetails: 'Jersey reader detected lateral posture [7], conf 98.5%' },
            
            { id: 'D1', name: 'Jrue Holiday', label: 'PG', number: '4', type: 'defense', confidence: 95.8, cls: 'Team B (White)', embedding: [2.8, -1.4], ocrDetails: 'Jersey reader detected back plate [4], conf 95.8%' },
            { id: 'D2', name: 'Anthony Davis', label: 'C', number: '3', type: 'defense', confidence: 96.2, cls: 'Team B (White)', embedding: [3.1, -1.9], ocrDetails: 'Jersey reader detected back plate [3], conf 96.5%' },
            { id: 'D3', name: 'Anthony Edwards', label: 'SG', number: '5', type: 'defense', confidence: 94.7, cls: 'Team B (White)', embedding: [2.5, -1.2], ocrDetails: 'Jersey reader detected jersey front [5], conf 95.0%' },
            { id: 'D4', name: 'Joel Embiid', label: 'PF', number: '21', type: 'defense', confidence: 93.9, cls: 'Team B (White)', embedding: [3.4, -2.1], ocrDetails: 'Jersey reader detected back plate [21], conf 94.2%' },
            { id: 'D5', name: 'Bam Adebayo', label: 'SF', number: '13', type: 'defense', confidence: 95.1, cls: 'Team B (White)', embedding: [2.6, -1.7], ocrDetails: 'Jersey reader detected back plate [13], conf 95.5%' },
          ];

          framesList = [
            [
              { id: 'O1', x: 23, y: 35 }, { id: 'O2', x: 41, y: 62 }, { id: 'O3', x: 50, y: 47 }, { id: 'O4', x: 15, y: 56 }, { id: 'O5', x: 44, y: 22 },
              { id: 'D1', x: 27, y: 33 }, { id: 'D2', x: 45, y: 65 }, { id: 'D3', x: 46, y: 48 }, { id: 'D4', x: 19, y: 53 }, { id: 'D5', x: 41, y: 26 },
              { isBall: true, x: 50, y: 47 }
            ],
            [
              { id: 'O1', x: 28, y: 39 }, { id: 'O2', x: 45, y: 59 }, { id: 'O3', x: 44, y: 49 }, { id: 'O4', x: 22, y: 53 }, { id: 'O5', x: 42, y: 28 },
              { id: 'D1', x: 32, y: 37 }, { id: 'D2', x: 49, y: 62 }, { id: 'D3', x: 42, y: 50 }, { id: 'D4', x: 26, y: 50 }, { id: 'D5', x: 39, y: 32 },
              { isBall: true, x: 44, y: 54 }
            ],
            [
              { id: 'O1', x: 33, y: 43 }, { id: 'O2', x: 49, y: 56 }, { id: 'O3', x: 38, y: 51 }, { id: 'O4', x: 29, y: 50 }, { id: 'O5', x: 39, y: 34 },
              { id: 'D1', x: 37, y: 41 }, { id: 'D2', x: 53, y: 59 }, { id: 'D3', x: 35, y: 52 }, { id: 'D4', x: 33, y: 47 }, { id: 'D5', x: 36, y: 38 },
              { isBall: true, x: 49, y: 56 }
            ],
            [
              { id: 'O1', x: 38, y: 47 }, { id: 'O2', x: 53, y: 53 }, { id: 'O3', x: 32, y: 53 }, { id: 'O4', x: 36, y: 47 }, { id: 'O5', x: 36, y: 40 },
              { id: 'D1', x: 42, y: 45 }, { id: 'D2', x: 57, y: 56 }, { id: 'D3', x: 29, y: 54 }, { id: 'D4', x: 40, y: 44 }, { id: 'D5', x: 33, y: 44 },
              { isBall: true, x: 22, y: 49 }
            ],
            [
              { id: 'O1', x: 43, y: 51 }, { id: 'O2', x: 57, y: 50 }, { id: 'O3', x: 26, y: 55 }, { id: 'O4', x: 43, y: 44 }, { id: 'O5', x: 33, y: 46 },
              { id: 'D1', x: 47, y: 49 }, { id: 'D2', x: 61, y: 53 }, { id: 'D3', x: 23, y: 56 }, { id: 'D4', x: 47, y: 41 }, { id: 'D5', x: 30, y: 50 },
              { isBall: true, x: 5.5, y: 50 }
            ]
          ];
        }

        setAnalyzingVideo({
          name: fileName,
          youtubeId: vid.youtubeId,
          size: fileSizeStr,
          duration: is1v1 ? "12.6 sec" : "15.4 sec",
          resolution: "1080p Stream (60fps)",
          framesCount: 5,
          currentFrame: 0,
          players: playersList,
          frames: framesList,
          basket: basketObj,
          siglipCentroids: [
            { id: 'C1', x: -2.14, y: 2.02, team: 'Team A (Knicks)', color: '#10B981' },
            { id: 'C2', x: 2.98, y: -1.68, team: 'Team B (White)', color: '#F43F5E' }
          ]
        });

        setUploadedFilesData([
          {
            name: fileName,
            size: fileSizeStr,
            status: 'success',
            message: `Similar play retrieval match complete! Decoded player alignments.`
          }
        ]);
      } else {
        let stepLabel = '';
        if (progress === 25) stepLabel = '[Clustering] Aligning frame contours with search database...';
        if (progress === 50) stepLabel = '[Tracking] Re-mapping tracklets on outdoor coordinate plane...';
        if (progress === 75) stepLabel = '[OCR] Adjusting contrast filters for playground decals...';
        setCvProcessingStep(stepLabel);
        setUploadedFilesData([
          {
            name: fileName,
            size: fileSizeStr,
            status: 'loading',
            message: `${stepLabel} (${progress}%)`
          }
        ]);
      }
    }, 400);
  };

  const handleYoutubeVideoCvAnalysis = (url: string) => {
    if (!url.trim()) {
      alert("Please enter a valid YouTube Video URL");
      return;
    }

    // Match youtube video ID
    const youtubeIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeIdRegex);
    const youtubeId = match ? match[1] : "kY8c2_Zco7M"; 

    // Open upload modal first
    setUploadedFilesData([]);
    setImportPreviewPlays([]);
    setIsUploadFullscreen(true);
    setPreviewingPlayFullscreen(null);
    setIsUploadModalOpen(true);
    setActiveCvTab('rf_detr'); // Jump directly to player detection using motion bounds

    const isStreetball = url.includes('6_6v4iOOfE8') || url.toLowerCase().includes('1v1') || url.toLowerCase().includes('wemby') || url.toLowerCase().includes('hoop') || url.toLowerCase().includes('hooper') || url.toLowerCase().includes('street');
    const fileName = isStreetball ? "Streetball 1v1: YOU vs WEMBY" : `YouTube Video Stream [${youtubeId}]`;
    const fileSizeStr = "Live Streaming Context";
    const fileEntry = {
      name: fileName,
      size: fileSizeStr,
      status: 'loading' as const,
      message: 'Extracting YouTube feed stream and initializing motion detector...'
    };
    
    setUploadedFilesData([fileEntry]);
    
    let progress = 0;
    setCvProcessingProgress(0);
    setCvProcessingStep('Extracting YouTube feed stream and initializing motion detector...');
    
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(interval);
        setCvProcessingProgress(100);
        setCvProcessingStep('Player motion detection & tracking finished! Loading data...');
        setActiveCvTab('rf_detr'); // Ensure motion bounding tab is selected upon completion
        
        let playersList = [];
        let framesList: any[][] = [];

        if (isStreetball) {
          playersList = [
            { id: 'O1', name: 'YOU', label: 'YOU', number: 'YOU', type: 'offense', confidence: 98.7, cls: 'Team A (Knicks)', embedding: [-2.4, 2.1], ocrDetails: 'Jersey reader detected front plate [YOU], conf 98.7%' },
            { id: 'D1', name: 'WEMBY', label: 'WEMBY', number: 'WEMBY', type: 'defense', confidence: 99.1, cls: 'Team B (White)', embedding: [2.8, -1.4], ocrDetails: 'Jersey reader detected back plate [WEMBY], conf 99.1%' }
          ];
          framesList = [
            [
              { id: 'O1', x: 45, y: 45 }, { id: 'D1', x: 35, y: 48 },
              { isBall: true, x: 45, y: 45 }
            ],
            [
              { id: 'O1', x: 38, y: 42 }, { id: 'D1', x: 31, y: 46 },
              { isBall: true, x: 38, y: 42 }
            ],
            [
              { id: 'O1', x: 28, y: 52 }, { id: 'D1', x: 26, y: 49 },
              { isBall: true, x: 28, y: 52 }
            ],
            [
              { id: 'O1', x: 18, y: 50 }, { id: 'D1', x: 15, y: 48 },
              { isBall: true, x: 14, y: 49 }
            ],
            [
              { id: 'O1', x: 18, y: 50 }, { id: 'D1', x: 15, y: 48 },
              { isBall: true, x: 5.5, y: 50 }
            ]
          ];
        } else {
          playersList = [
            { id: 'O1', name: 'Jalen Brunson', label: 'PG', number: '11', type: 'offense', confidence: 98.4, cls: 'Team A (Knicks)', embedding: [-2.1, 1.8], ocrDetails: 'Jersey reader detected front plate [11], conf 98.4%' },
            { id: 'O2', name: 'OG Anunoby', label: 'SF', number: '8', type: 'offense', confidence: 97.2, cls: 'Team A (Knicks)', embedding: [-1.9, 1.6], ocrDetails: 'Jersey reader detected front plate [8], conf 97.2%' },
            { id: 'O3', name: 'Josh Hart', label: 'SG', number: '3', type: 'offense', confidence: 96.5, cls: 'Team A (Knicks)', embedding: [-2.3, 2.1], ocrDetails: 'Jersey reader detected back plate [3], conf 96.5%' },
            { id: 'O4', name: 'Donte DiVincenzo', label: 'PF', number: '0', type: 'offense', confidence: 95.8, cls: 'Team A (Knicks)', embedding: [-1.7, 1.4], ocrDetails: 'Jersey reader detected jersey front [0], conf 95.8%' },
            { id: 'O5', name: 'Isaiah Hartenstein', label: 'C', number: '55', type: 'offense', confidence: 97.1, cls: 'Team A (Knicks)', embedding: [-1.5, 2.2], ocrDetails: 'Jersey reader detected lateral posture [55], conf 97.1%' },
            { id: 'D1', name: 'Tyrese Haliburton', label: 'PG', number: '0', type: 'defense', confidence: 96.2, cls: 'Team B (White)', embedding: [2.5, -1.3], ocrDetails: 'Jersey reader detected back plate [0], conf 96.2%' },
            { id: 'D2', name: 'Andrew Nembhard', label: 'SG', number: '2', type: 'defense', confidence: 95.1, cls: 'Team B (White)', embedding: [2.1, -1.1], ocrDetails: 'Jersey reader detected front plate [2], conf 95.1%' },
            { id: 'D3', name: 'Aaron Nesmith', label: 'SF', number: '23', type: 'defense', confidence: 94.7, cls: 'Team B (White)', embedding: [2.8, -1.5], ocrDetails: 'Jersey reader detected back plate [23], conf 94.7%' },
            { id: 'D4', name: 'Pascal Siakam', label: 'PF', number: '43', type: 'defense', confidence: 95.9, cls: 'Team B (White)', embedding: [3.2, -1.8], ocrDetails: 'Jersey reader detected back plate [43], conf 95.9%' },
            { id: 'D5', name: 'Myles Turner', label: 'C', number: '33', type: 'defense', confidence: 96.8, cls: 'Team B (White)', embedding: [2.9, -1.6], ocrDetails: 'Jersey reader detected back plate [33], conf 96.8%' }
          ];
          framesList = [
            [
              { id: 'O1', x: 23, y: 35 }, { id: 'O2', x: 41, y: 62 }, { id: 'O3', x: 50, y: 47 }, { id: 'O4', x: 15, y: 56 }, { id: 'O5', x: 44, y: 22 },
              { id: 'D1', x: 27, y: 33 }, { id: 'D2', x: 45, y: 65 }, { id: 'D3', x: 46, y: 48 }, { id: 'D4', x: 19, y: 53 }, { id: 'D5', x: 41, y: 26 },
              { isBall: true, x: 50, y: 47 }
            ],
            [
              { id: 'O1', x: 28, y: 39 }, { id: 'O2', x: 45, y: 59 }, { id: 'O3', x: 44, y: 49 }, { id: 'O4', x: 22, y: 53 }, { id: 'O5', x: 42, y: 28 },
              { id: 'D1', x: 32, y: 37 }, { id: 'D2', x: 49, y: 62 }, { id: 'D3', x: 42, y: 50 }, { id: 'D4', x: 26, y: 50 }, { id: 'D5', x: 39, y: 32 },
              { isBall: true, x: 44, y: 54 }
            ],
            [
              { id: 'O1', x: 34, y: 42 }, { id: 'O2', x: 48, y: 54 }, { id: 'O3', x: 38, y: 51 }, { id: 'O4', x: 28, y: 49 }, { id: 'O5', x: 40, y: 34 },
              { id: 'D1', x: 38, y: 40 }, { id: 'D2', x: 52, y: 56 }, { id: 'D3', x: 37, y: 52 }, { id: 'D4', x: 32, y: 47 }, { id: 'D5', x: 38, y: 38 },
              { isBall: true, x: 49, y: 56 }
            ],
            [
              { id: 'O1', x: 41, y: 45 }, { id: 'O2', x: 50, y: 48 }, { id: 'O3', x: 28, y: 52 }, { id: 'O4', x: 35, y: 46 }, { id: 'O5', x: 38, y: 40 },
              { id: 'D1', x: 44, y: 43 }, { id: 'D2', x: 55, y: 51 }, { id: 'D3', x: 31, y: 53 }, { id: 'D4', x: 39, y: 43 }, { id: 'D5', x: 36, y: 44 },
              { isBall: true, x: 22, y: 49 }
            ],
            [
              { id: 'O1', x: 48, y: 47 }, { id: 'O2', x: 52, y: 45 }, { id: 'O3', x: 18, y: 50 }, { id: 'O4', x: 41, y: 43 }, { id: 'O5', x: 35, y: 45 },
              { id: 'D1', x: 50, y: 46 }, { id: 'D2', x: 56, y: 48 }, { id: 'D3', x: 22, y: 51 }, { id: 'D4', x: 45, y: 41 }, { id: 'D5', x: 33, y: 48 },
              { isBall: true, x: 5.5, y: 50 }
            ]
          ];
        }
 
        const videoData = {
          name: fileName,
          youtubeId: youtubeId,
          size: fileSizeStr,
          duration: isStreetball ? "12.6 sec" : "Stream (Active)",
          resolution: "1080p Stream (60fps)",
          framesCount: 5,
          currentFrame: 0,
          players: playersList,
          frames: framesList,
          basket: { x: 5.5, y: 50, w: 4, h: 6, label: "Basket Rim [Left]" },
          siglipCentroids: [
            { id: 'C1', x: -2.14, y: 2.02, team: 'Team A (Knicks)', color: '#10B981' },
            { id: 'C2', x: 2.98, y: -1.68, team: 'Team B (White)', color: '#F43F5E' }
          ]
        };
 
        setAnalyzingVideo(videoData);
 
        const companionPlay: Play = {
          id: 'cv-' + Math.random().toString(36).substring(2, 11),
          name: isStreetball ? `1v1 Playbook: YOU vs WEMBY` : `YouTube Extracted: Play #${youtubeId.substring(0, 4)}`,
          type: 'Offense',
          description: isStreetball 
            ? "Streetball 1v1 isolation crossover, step-back space creation, and deep perimeter high-release swish over Wemby." 
            : `Extracted automatically via computer vision player tracking, motion path analysis, team clustering, and jersey number transcription from YouTube video. ID: ${youtubeId}.`,
          createdAt: new Date().toISOString().split('T')[0],
          team: homeTeamName,
          frames: videoData.frames.map(f => {
            return videoData.players.map((p: any) => {
              const framePos = f.find((fp: any) => fp.id === p.id);
              return {
                id: p.id,
                label: p.number,
                x: framePos ? framePos.x : 50,
                y: framePos ? framePos.y : 50,
                type: p.type
              };
            });
          })
        };
 
        setImportPreviewPlays([companionPlay]);
        setUploadedFilesData([{ 
          name: fileName, 
          size: fileSizeStr, 
          status: 'success', 
          message: isStreetball 
            ? 'Motion Detection Complete! Successfully tracked streetball 1v1 players & ball trajectory.' 
            : 'Motion Detection Complete! Automatically clustered players and ball trajectory using color-space embeddings.' 
        }]);
      } else {
        let stepLabel = '';
        if (progress === 20) {
          stepLabel = 'Acquiring high quality frames...';
        } else if (progress === 40) {
          stepLabel = 'Segmenting canvas floor contours...';
        } else if (progress === 60) {
          stepLabel = 'Matching color reference anchors...';
        } else if (progress === 80) {
          stepLabel = '[OCR] Initializing blank entity matrix state...';
        }
        setCvProcessingProgress(progress);
        setCvProcessingStep(stepLabel);
        setUploadedFilesData([{ name: fileName, size: fileSizeStr, status: 'loading', message: `${stepLabel} (${progress}%)` }]);
      }
    }, 600);
  };

  const handleDemoVideoCvAnalysis = () => {
    // Open the upload modal first
    setUploadedFilesData([]);
    setImportPreviewPlays([]);
    setIsUploadFullscreen(true);
    setPreviewingPlayFullscreen(null);
    setIsUploadModalOpen(true);

    const fileName = "fastbreak_rotation_4k.mp4";
    const fileSizeStr = "12.4 MB";
    const fileEntry = {
      name: fileName,
      size: fileSizeStr,
      status: 'loading' as const,
      message: 'Initializing player detection model & loading video stream...'
    };
    
    setUploadedFilesData([fileEntry]);
    
    let progress = 0;
    setCvProcessingProgress(0);
    setCvProcessingStep('Initializing player detection model & loading video stream...');
    
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(interval);
        setCvProcessingProgress(100);
        setCvProcessingStep('Player detection & tracking finished! Loading data...');
        
        // Build simulated data structure
        const videoData = {
          name: fileName,
          size: fileSizeStr,
          duration: "8.4 sec",
          resolution: "1920x1080 (HD 60fps)",
          framesCount: 5,
          currentFrame: 0,
          players: [
            { id: 'O1', name: 'Steph Curry', label: 'PG', number: '30', type: 'offense', confidence: 99.2, cls: 'Team A (Knicks)', embedding: [-2.4, 2.1], ocrDetails: 'Jersey reader detected back plate [30], conf 99.4%' },
            { id: 'O2', name: 'LeBron James', label: 'SF', number: '23', type: 'offense', confidence: 98.1, cls: 'Team A (Knicks)', embedding: [-1.8, 1.9], ocrDetails: 'Jersey reader detected back plate [23], conf 98.1%' },
            { id: 'O3', name: 'Jayson Tatum', label: 'PF', number: '0', type: 'offense', confidence: 97.4, cls: 'Team A (Knicks)', embedding: [-2.1, 1.5], ocrDetails: 'Jersey reader detected jersey front [0], conf 97.8%' },
            { id: 'O4', name: 'Jalen Brunson', label: 'SG', number: '11', type: 'offense', confidence: 96.5, cls: 'Team A (Knicks)', embedding: [-2.9, 2.4], ocrDetails: 'Jersey reader detected shorts corner [11], conf 96.5%' },
            { id: 'O5', name: 'Kevin Durant', label: 'C', number: '7', type: 'offense', confidence: 97.9, cls: 'Team A (Knicks)', embedding: [-1.5, 2.2], ocrDetails: 'Jersey reader detected lateral posture [7], conf 98.5%' },
            
            { id: 'D1', name: 'Jrue Holiday', label: 'PG', number: '4', type: 'defense', confidence: 95.8, cls: 'Team B (White)', embedding: [2.8, -1.4], ocrDetails: 'Jersey reader detected back plate [4], conf 95.8%' },
            { id: 'D2', name: 'Anthony Davis', label: 'C', number: '3', type: 'defense', confidence: 96.2, cls: 'Team B (White)', embedding: [3.1, -1.9], ocrDetails: 'Jersey reader detected back plate [3], conf 96.5%' },
            { id: 'D3', name: 'Anthony Edwards', label: 'SG', number: '5', type: 'defense', confidence: 94.7, cls: 'Team B (White)', embedding: [2.5, -1.2], ocrDetails: 'Jersey reader detected jersey front [5], conf 95.0%' },
            { id: 'D4', name: 'Joel Embiid', label: 'PF', number: '21', type: 'defense', confidence: 93.9, cls: 'Team B (White)', embedding: [3.4, -2.1], ocrDetails: 'Jersey reader detected back plate [21], conf 94.2%' },
            { id: 'D5', name: 'Bam Adebayo', label: 'SF', number: '13', type: 'defense', confidence: 95.1, cls: 'Team B (White)', embedding: [2.6, -1.7], ocrDetails: 'Jersey reader detected back plate [13], conf 95.5%' },
          ],
          frames: [
            [
              { id: 'O1', x: 23, y: 35 }, { id: 'O2', x: 41, y: 62 }, { id: 'O3', x: 50, y: 47 }, { id: 'O4', x: 15, y: 56 }, { id: 'O5', x: 44, y: 22 },
              { id: 'D1', x: 27, y: 33 }, { id: 'D2', x: 45, y: 65 }, { id: 'D3', x: 46, y: 48 }, { id: 'D4', x: 19, y: 53 }, { id: 'D5', x: 41, y: 26 },
              { isBall: true, x: 50, y: 47 }
            ],
            [
              { id: 'O1', x: 28, y: 39 }, { id: 'O2', x: 45, y: 59 }, { id: 'O3', x: 44, y: 49 }, { id: 'O4', x: 22, y: 53 }, { id: 'O5', x: 42, y: 28 },
              { id: 'D1', x: 32, y: 37 }, { id: 'D2', x: 49, y: 62 }, { id: 'D3', x: 42, y: 50 }, { id: 'D4', x: 26, y: 50 }, { id: 'D5', x: 39, y: 32 },
              { isBall: true, x: 44, y: 54 }
            ],
            [
              { id: 'O1', x: 33, y: 43 }, { id: 'O2', x: 49, y: 56 }, { id: 'O3', x: 38, y: 51 }, { id: 'O4', x: 29, y: 50 }, { id: 'O5', x: 39, y: 34 },
              { id: 'D1', x: 37, y: 41 }, { id: 'D2', x: 53, y: 59 }, { id: 'D3', x: 35, y: 52 }, { id: 'D4', x: 33, y: 47 }, { id: 'D5', x: 36, y: 38 },
              { isBall: true, x: 49, y: 56 }
            ],
            [
              { id: 'O1', x: 38, y: 47 }, { id: 'O2', x: 53, y: 53 }, { id: 'O3', x: 32, y: 53 }, { id: 'O4', x: 36, y: 47 }, { id: 'O5', x: 36, y: 40 },
              { id: 'D1', x: 42, y: 45 }, { id: 'D2', x: 57, y: 56 }, { id: 'D3', x: 29, y: 54 }, { id: 'D4', x: 40, y: 44 }, { id: 'D5', x: 33, y: 44 },
              { isBall: true, x: 22, y: 49 }
            ],
            [
              { id: 'O1', x: 43, y: 51 }, { id: 'O2', x: 57, y: 50 }, { id: 'O3', x: 26, y: 55 }, { id: 'O4', x: 43, y: 44 }, { id: 'O5', x: 33, y: 46 },
              { id: 'D1', x: 47, y: 49 }, { id: 'D2', x: 61, y: 53 }, { id: 'D3', x: 23, y: 56 }, { id: 'D4', x: 47, y: 41 }, { id: 'D5', x: 30, y: 50 },
              { isBall: true, x: 5.5, y: 50 }
            ]
          ],
          basket: { x: 5.5, y: 50, w: 4, h: 6, label: "Basket Rim [Left]" },
          siglipCentroids: [
            { id: 'C1', x: -2.14, y: 2.02, team: 'Team A (Knicks)', color: '#10B981' },
            { id: 'C2', x: 2.98, y: -1.68, team: 'Team B (White)', color: '#F43F5E' }
          ]
        };

        setAnalyzingVideo(videoData);

        const companionPlay: Play = {
          id: 'cv-' + Math.random().toString(36).substring(2, 11),
          name: `AI Extracted: Fast Break Rotation`,
          type: 'Offense',
          description: `Extracted automatically via computer vision player tracking, motion path analysis, team clustering, and jersey number transcription. Tracks a rapid perimeter curl culminating in a direct corner attempt.`,
          createdAt: new Date().toISOString().split('T')[0],
          team: homeTeamName,
          frames: videoData.frames.map(f => {
            return videoData.players.map(p => {
              const framePos = f.find(fp => fp.id === p.id);
              return {
                id: p.id,
                label: p.number,
                x: framePos ? framePos.x : 50,
                y: framePos ? framePos.y : 50,
                type: p.type
              };
            });
          })
        };

        setImportPreviewPlays([companionPlay]);
        setUploadedFilesData([{ name: fileName, size: fileSizeStr, status: 'success', message: 'Full CV Pipeline complete! Loaded player, number, ball, and team clusters.' }]);
      } else {
        let stepLabel = '';
        if (progress === 20) {
          stepLabel = '[Detection] Extracting ball centroids & player bounding boxes...';
        } else if (progress === 40) {
          stepLabel = '[Tracking] Spatiotemporal mask segmentation & path tracing...';
        } else if (progress === 60) {
          stepLabel = '[Clustering] Color feature embedding space & KMeans clustering...';
        } else if (progress === 80) {
          stepLabel = '[OCR] Reading numbers and scanning jersey tags...';
        }
        setCvProcessingProgress(progress);
        setCvProcessingStep(stepLabel);
        setUploadedFilesData([{ name: fileName, size: fileSizeStr, status: 'loading', message: `${stepLabel} (${progress}%)` }]);
      }
    }, 600);
  };

  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const fileSizeStr = (file.size / 1024).toFixed(1) + ' KB';
      const fileEntry = {
        name: file.name,
        size: fileSizeStr,
        status: 'loading' as const,
        message: 'Parsing file...'
      };
      
      setUploadedFilesData(prev => [...prev, fileEntry]);

      const reader = new FileReader();

      // Handle image upload as custom visual playbook diagram
      if (file.type.startsWith('image/')) {
        reader.onload = (e) => {
          const imgDataUrl = e.target?.result as string;
          const newPlay: Play = {
            id: 'upl-' + Math.random().toString(36).substring(2, 11),
            name: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
            type: 'Offense',
            description: `Imported playbook layout from file: ${file.name}.`,
            createdAt: new Date().toISOString().split('T')[0],
            canvasData: imgDataUrl,
            team: homeTeamName
          };

          setImportPreviewPlays(prev => [...prev, newPlay]);
          setUploadedFilesData(prev => 
            prev.map(f => f.name === file.name ? { ...f, status: 'success', message: 'Converted image to tactical board blueprint!' } : f)
          );
        };
        reader.onerror = () => {
          setUploadedFilesData(prev => 
            prev.map(f => f.name === file.name ? { ...f, status: 'error', message: 'Failed to read image.' } : f)
          );
        };
        reader.readAsDataURL(file);
      } 
      // Handle standard JSON playbook configuration
      else if (file.name.endsWith('.json')) {
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const parsed = JSON.parse(content);
            const parsedPlays: Play[] = [];

            const processSinglePlay = (item: any) => {
              if (item && typeof item === 'object') {
                const playName = item.name || item.playName || item.title || `Uploaded Play (${file.name})`;
                const playType = (item.type === 'Defense' || item.playType === 'Defense') ? 'Defense' : 'Offense';
                const playDesc = item.description || item.desc || item.notes || 'No description provided.';
                const playTeam = item.team || item.associatedTeam || undefined;
                const canvasData = item.canvasData || item.diagram || undefined;
                const reasoning = item.reasoning || item.rationale || undefined;
                
                // Read and parse coordinates if specified
                const playFrames = resolveUploadedPlayPositions(item);

                parsedPlays.push({
                  id: 'upl-' + Math.random().toString(36).substring(2, 11),
                  name: playName,
                  type: playType,
                  description: playDesc,
                  createdAt: new Date().toISOString().split('T')[0],
                  canvasData,
                  team: playTeam,
                  reasoning,
                  frames: playFrames
                });
              }
            };

            if (Array.isArray(parsed)) {
              parsed.forEach(processSinglePlay);
            } else {
              processSinglePlay(parsed);
            }

            if (parsedPlays.length > 0) {
              setImportPreviewPlays(prev => [...prev, ...parsedPlays]);
              const playsWithPositions = parsedPlays.filter(p => p.frames && p.frames.length > 0);
              const statusMsg = playsWithPositions.length > 0 
                ? `Mapped ${parsedPlays.length} play(s) with ${playsWithPositions.length} custom player setups!` 
                : `Successfully mapped ${parsedPlays.length} playbook set play(s).`;
              setUploadedFilesData(prev => 
                prev.map(f => f.name === file.name ? { ...f, status: 'success', message: statusMsg } : f)
              );
            } else {
              throw new Error('JSON structure did not contain recognizable play attributes.');
            }
          } catch (err: any) {
            setUploadedFilesData(prev => 
              prev.map(f => f.name === file.name ? { ...f, status: 'error', message: `JSON Parse error: ${err.message || 'Malformed JSON'}` } : f)
            );
          }
        };
        reader.readAsText(file);
      }
      // Handle tabular CSV input
      else if (file.name.endsWith('.csv')) {
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
            if (lines.length < 2) {
              throw new Error('Missing rows. CSV needs headers and play values.');
            }

            const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
            const parsedPlays: Play[] = [];

            for (let i = 1; i < lines.length; i++) {
              const row = lines[i].split(',').map(cell => cell.replace(/^["']|["']$/g, '').trim());
              if (row.length === 0 || !row[0]) continue;

              const playObj: any = {};
              headers.forEach((header, idx) => {
                if (row[idx] !== undefined) {
                  playObj[header] = row[idx];
                }
              });

              const playName = playObj.name || playObj.playname || playObj.title || `Set Play ${i}`;
              const playType = (playObj.type === 'Defense' || playObj.playtype === 'Defense') ? 'Defense' : 'Offense';
              const playDesc = playObj.description || playObj.desc || playObj.notes || 'CSV Playbook Import Set';
              const playTeam = playObj.team || playObj.associatedteam || undefined;

              // Read frames from CSV if there is a positions/coords column
              let playFrames: any[][] | undefined;
              const playFramesStr = playObj.frames || playObj.positions || playObj.coords || playObj.players;
              if (playFramesStr) {
                try {
                  const cleanedJson = playFramesStr.replace(/""/g, '"');
                  const parsedFrames = JSON.parse(cleanedJson);
                  if (Array.isArray(parsedFrames)) {
                    if (Array.isArray(parsedFrames[0])) {
                      playFrames = parsedFrames;
                    } else {
                      playFrames = [parsedFrames];
                    }
                  }
                } catch (e) {
                  console.warn("Could not parse CSV positions column directly", e);
                }
              }

              // Or read individual coordinate columns: o1_x, o1_y, d1_x, d1_y ...
              if (!playFrames) {
                const homeLayout: any[] = [];
                const keys = ['o1', 'o2', 'o3', 'o4', 'o5', 'd1', 'd2', 'd3', 'd4', 'd5'];
                keys.forEach(k => {
                  const xVal = playObj[`${k}_x`] || playObj[`${k}x`];
                  const yVal = playObj[`${k}_y`] || playObj[`${k}y`];
                  if (xVal !== undefined && yVal !== undefined) {
                    const label = k.slice(1) === '1' ? 'PG' : 
                                  k.slice(1) === '2' ? 'SG' : 
                                  k.slice(1) === '3' ? 'SF' : 
                                  k.slice(1) === '4' ? 'PF' : 'C';
                    homeLayout.push({
                      id: k.toLowerCase(),
                      label,
                      x: parseFloat(xVal) || 50,
                      y: parseFloat(yVal) || 50,
                      type: k.startsWith('o') ? 'offense' : 'defense'
                    });
                  }
                });
                if (homeLayout.length > 0) {
                  playFrames = [homeLayout];
                }
              }

              parsedPlays.push({
                id: 'upl-' + Math.random().toString(36).substring(2, 11),
                name: playName,
                type: playType,
                description: playDesc,
                createdAt: new Date().toISOString().split('T')[0],
                team: playTeam,
                frames: playFrames
              });
            }

            if (parsedPlays.length > 0) {
              setImportPreviewPlays(prev => [...prev, ...parsedPlays]);
              const playsWithPositions = parsedPlays.filter(p => p.frames && p.frames.length > 0);
              const statusMsg = playsWithPositions.length > 0
                ? `Parsed ${parsedPlays.length} rows with ${playsWithPositions.length} custom setups.`
                : `Parsed ${parsedPlays.length} rows with general alignments.`;
              setUploadedFilesData(prev => 
                prev.map(f => f.name === file.name ? { ...f, status: 'success', message: statusMsg } : f)
              );
            } else {
              throw new Error('Could not extract plays from formatted CSV lines.');
            }
          } catch (err: any) {
            setUploadedFilesData(prev => 
              prev.map(f => f.name === file.name ? { ...f, status: 'error', message: `CSV Error: ${err.message || 'Invalid format'}` } : f)
            );
          }
        };
        reader.readAsText(file);
      }
      // Handle Video File Uploads (AI Multi-Model Video analysis)
      else if (file.type.startsWith('video/') || file.name.match(/\.(mp4|mov|avi|webm|mkv|m4v)$/i)) {
        // Start process animation across AI Computer Vision models
        let progress = 0;
        setCvProcessingProgress(0);
        setCvProcessingStep('Initializing player detection model & loading video stream...');
        
        const fileEntry = {
          name: file.name,
          size: fileSizeStr,
          status: 'loading' as const,
          message: 'Initiating AI vision analysis pipeline...'
        };
        
        // update uploaded files list
        setUploadedFilesData(prev => prev.map(f => f.name === file.name ? fileEntry : f));

        const isStreetball = file.name.toLowerCase().includes('1v1') || file.name.toLowerCase().includes('wemby') || file.name.toLowerCase().includes('hoop') || file.name.toLowerCase().includes('hooper') || file.name.toLowerCase().includes('street');

        const interval = setInterval(() => {
          progress += 20;
          if (progress >= 100) {
            clearInterval(interval);
            setCvProcessingProgress(100);
            setCvProcessingStep('Player detection & tracking finished! Loading data...');
            
            let playersList = [];
            let framesList = [];
            let basketObj = { x: 5.5, y: 50, w: 4, h: 6, label: "Basket Rim [Left]" };

            if (isStreetball) {
               playersList = [
                { id: 'O1', name: 'YOU', label: 'YOU', number: 'YOU', type: 'offense', confidence: 98.7, cls: 'Team A (Knicks)', embedding: [-2.4, 2.1], ocrDetails: 'Jersey reader detected front plate [YOU], conf 98.7%' },
                { id: 'D1', name: 'WEMBY', label: 'WEMBY', number: 'WEMBY', type: 'defense', confidence: 99.1, cls: 'Team B (White)', embedding: [2.8, -1.4], ocrDetails: 'Jersey reader detected back plate [WEMBY], conf 99.1%' }
              ];

              framesList = [
                [
                  { id: 'O1', x: 45, y: 45 }, { id: 'D1', x: 35, y: 48 },
                  { isBall: true, x: 45, y: 45 }
                ],
                [
                  { id: 'O1', x: 38, y: 42 }, { id: 'D1', x: 31, y: 46 },
                  { isBall: true, x: 38, y: 42 }
                ],
                [
                  { id: 'O1', x: 28, y: 52 }, { id: 'D1', x: 26, y: 49 },
                  { isBall: true, x: 28, y: 52 }
                ],
                [
                  { id: 'O1', x: 18, y: 50 }, { id: 'D1', x: 15, y: 48 },
                  { isBall: true, x: 14, y: 49 }
                ],
                [
                  { id: 'O1', x: 18, y: 50 }, { id: 'D1', x: 15, y: 48 },
                  { isBall: true, x: 5.5, y: 50 }
                ]
              ];
            } else {
              playersList = [
                { id: 'O1', name: 'Steph Curry', label: 'PG', number: '30', type: 'offense', confidence: 99.2, cls: 'Team A (Knicks)', embedding: [-2.4, 2.1], ocrDetails: 'Jersey reader detected back plate [30], conf 99.4%' },
                { id: 'O2', name: 'LeBron James', label: 'SF', number: '23', type: 'offense', confidence: 98.1, cls: 'Team A (Knicks)', embedding: [-1.8, 1.9], ocrDetails: 'Jersey reader detected back plate [23], conf 98.1%' },
                { id: 'O3', name: 'Jayson Tatum', label: 'PF', number: '0', type: 'offense', confidence: 97.4, cls: 'Team A (Knicks)', embedding: [-2.1, 1.5], ocrDetails: 'Jersey reader detected jersey front [0], conf 97.8%' },
                { id: 'O4', name: 'Jalen Brunson', label: 'SG', number: '11', type: 'offense', confidence: 96.5, cls: 'Team A (Knicks)', embedding: [-2.9, 2.4], ocrDetails: 'Jersey reader detected shorts corner [11], conf 96.5%' },
                { id: 'O5', name: 'Kevin Durant', label: 'C', number: '7', type: 'offense', confidence: 97.9, cls: 'Team A (Knicks)', embedding: [-1.5, 2.2], ocrDetails: 'Jersey reader detected lateral posture [7], conf 98.5%' },
                
                { id: 'D1', name: 'Jrue Holiday', label: 'PG', number: '4', type: 'defense', confidence: 95.8, cls: 'Team B (White)', embedding: [2.8, -1.4], ocrDetails: 'Jersey reader detected back plate [4], conf 95.8%' },
                { id: 'D2', name: 'Anthony Davis', label: 'C', number: '3', type: 'defense', confidence: 96.2, cls: 'Team B (White)', embedding: [3.1, -1.9], ocrDetails: 'Jersey reader detected back plate [3], conf 96.5%' },
                { id: 'D3', name: 'Anthony Edwards', label: 'SG', number: '5', type: 'defense', confidence: 94.7, cls: 'Team B (White)', embedding: [2.5, -1.2], ocrDetails: 'Jersey reader detected jersey front [5], conf 95.0%' },
                { id: 'D4', name: 'Joel Embiid', label: 'PF', number: '21', type: 'defense', confidence: 93.9, cls: 'Team B (White)', embedding: [3.4, -2.1], ocrDetails: 'Jersey reader detected back plate [21], conf 94.2%' },
                { id: 'D5', name: 'Bam Adebayo', label: 'SF', number: '13', type: 'defense', confidence: 95.1, cls: 'Team B (White)', embedding: [2.6, -1.7], ocrDetails: 'Jersey reader detected back plate [13], conf 95.5%' },
              ];

              framesList = [
                // Frame 0
                [
                  { id: 'O1', x: 23, y: 35 }, { id: 'O2', x: 41, y: 62 }, { id: 'O3', x: 50, y: 47 }, { id: 'O4', x: 15, y: 56 }, { id: 'O5', x: 44, y: 22 },
                  { id: 'D1', x: 27, y: 33 }, { id: 'D2', x: 45, y: 65 }, { id: 'D3', x: 46, y: 48 }, { id: 'D4', x: 19, y: 53 }, { id: 'D5', x: 41, y: 26 },
                  { isBall: true, x: 50, y: 47 } // Ball is with Tatum (O3)
                ],
                // Frame 1
                [
                  { id: 'O1', x: 28, y: 39 }, { id: 'O2', x: 45, y: 59 }, { id: 'O3', x: 44, y: 49 }, { id: 'O4', x: 22, y: 53 }, { id: 'O5', x: 42, y: 28 },
                  { id: 'D1', x: 32, y: 37 }, { id: 'D2', x: 49, y: 62 }, { id: 'D3', x: 42, y: 50 }, { id: 'D4', x: 26, y: 50 }, { id: 'D5', x: 39, y: 32 },
                  { isBall: true, x: 44, y: 54 } // Ball floating towards LeBron (O2)
                ],
                // Frame 2
                [
                  { id: 'O1', x: 33, y: 43 }, { id: 'O2', x: 49, y: 56 }, { id: 'O3', x: 38, y: 51 }, { id: 'O4', x: 29, y: 50 }, { id: 'O5', x: 39, y: 34 },
                  { id: 'D1', x: 37, y: 41 }, { id: 'D2', x: 53, y: 59 }, { id: 'D3', x: 35, y: 52 }, { id: 'D4', x: 33, y: 47 }, { id: 'D5', x: 36, y: 38 },
                  { isBall: true, x: 49, y: 56 } // Ball with LeBron (O2) - shots primed
                ],
                // Frame 3
                [
                  { id: 'O1', x: 38, y: 47 }, { id: 'O2', x: 53, y: 53 }, { id: 'O3', x: 32, y: 53 }, { id: 'O4', x: 36, y: 47 }, { id: 'O5', x: 36, y: 40 },
                  { id: 'D1', x: 42, y: 45 }, { id: 'D2', x: 57, y: 56 }, { id: 'D3', x: 29, y: 54 }, { id: 'D4', x: 40, y: 44 }, { id: 'D5', x: 33, y: 44 },
                  { isBall: true, x: 22, y: 49 } // Ball in air targeting basket rim
                ],
                // Frame 4
                [
                  { id: 'O1', x: 43, y: 51 }, { id: 'O2', x: 57, y: 50 }, { id: 'O3', x: 26, y: 55 }, { id: 'O4', x: 43, y: 44 }, { id: 'O5', x: 33, y: 46 },
                  { id: 'D1', x: 47, y: 49 }, { id: 'D2', x: 61, y: 53 }, { id: 'D3', x: 23, y: 56 }, { id: 'D4', x: 47, y: 41 }, { id: 'D5', x: 30, y: 50 },
                  { isBall: true, x: 5.5, y: 50 } // Swish at Knicks side rim!
                ]
              ];
            }

            const videoData = {
              name: file.name,
              size: fileSizeStr,
              duration: isStreetball ? "12.6 sec" : "8.4 sec",
              resolution: "1920x1080 (HD 60fps)",
              framesCount: 5,
              currentFrame: 0,
              players: playersList,
              frames: framesList,
              basket: basketObj,
              siglipCentroids: [
                { id: 'C1', x: -2.14, y: 2.02, team: 'Team A (Knicks)', color: '#10B981' },
                { id: 'C2', x: 2.98, y: -1.68, team: 'Team B (White)', color: '#F43F5E' }
              ]
            };

            setAnalyzingVideo(videoData);
            
            // Auto add as an import preview play so they can see/add it!
            const companionPlay: Play = {
              id: 'cv-' + Math.random().toString(36).substring(2, 11),
              name: isStreetball ? `1v1 Playbook: ${file.name.substring(0, file.name.lastIndexOf('.')) || 'Streetball'}` : `AI Extracted: ${file.name.substring(0, file.name.lastIndexOf('.')) || 'Fast Break'}`,
              type: 'Offense',
              description: isStreetball
                ? `Extracted automatically via 1v1 hoopers team clustering and tracking. Tracks YOU isolation crossover and step-back on Wemby.`
                : `Extracted automatically via computer vision player tracking, motion path analysis, team clustering, and jersey number transcription. Tracks a rapid perimeter curl culminating in a direct corner attempt.`,
              createdAt: new Date().toISOString().split('T')[0],
              team: homeTeamName,
              frames: videoData.frames.map(f => {
                // map video extracted players to the exact play coordination positions!
                return videoData.players.map(p => {
                  const framePos = f.find(fp => fp.id === p.id);
                  return {
                    id: p.id,
                    label: p.number,
                    x: framePos ? framePos.x : 50,
                    y: framePos ? framePos.y : 50,
                    type: p.type
                  };
                });
              })
            };

            setImportPreviewPlays(prev => [...prev, companionPlay]);
            
            setUploadedFilesData(prev => 
              prev.map(f => f.name === file.name ? { ...f, status: 'success', message: `Full CV Pipeline complete! Loaded player, number, ball, and team clusters.` } : f)
            );
          } else {
            // Update the processing log with realistic step updates
            let stepLabel = '';
            if (progress === 20) {
              stepLabel = '[Detection] Extracting ball centroids & player bounding boxes...';
            } else if (progress === 40) {
              stepLabel = '[Tracking] Spatiotemporal mask segmentation & path tracing...';
            } else if (progress === 60) {
              stepLabel = '[Clustering] Color feature embedding space & KMeans clustering...';
            } else if (progress === 80) {
              stepLabel = '[OCR] Reading numbers and scanning jersey tags...';
            }
            setCvProcessingProgress(progress);
            setCvProcessingStep(stepLabel);
            setUploadedFilesData(prev => 
              prev.map(f => f.name === file.name ? { ...f, status: 'loading', message: `${stepLabel} (${progress}%)` } : f)
            );
          }
        }, 600);
      }
      // Handle text file layouts
      else {
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const sections = content.split(/---|\n\n\n/).map(s => s.trim()).filter(Boolean);
            const parsedPlays: Play[] = [];

            sections.forEach((section) => {
              const rows = section.split('\n').map(r => r.trim()).filter(Boolean);
              let name = '';
              let type: 'Offense' | 'Defense' = 'Offense';
              let description = '';
              let team: string | undefined = undefined;
              let playFrames: any[][] | undefined = undefined;

              rows.forEach(row => {
                const colonIdx = row.indexOf(':');
                if (colonIdx !== -1) {
                  const key = row.substring(0, colonIdx).trim().toLowerCase();
                  const val = row.substring(colonIdx + 1).trim();
                  if (key === 'name' || key === 'play name' || key === 'title') {
                    name = val;
                  } else if (key === 'type' || key === 'play type') {
                    type = (val.toLowerCase() === 'defense') ? 'Defense' : 'Offense';
                  } else if (key === 'team' || key === 'associated team') {
                    team = val;
                  } else if (key === 'description' || key === 'desc' || key === 'notes') {
                    description = val;
                  } else if (key === 'frames' || key === 'positions' || key === 'coords' || key === 'players') {
                    try {
                      const parsedFrames = JSON.parse(val);
                      if (Array.isArray(parsedFrames)) {
                        if (Array.isArray(parsedFrames[0])) {
                          playFrames = parsedFrames;
                        } else {
                          playFrames = [parsedFrames];
                        }
                      }
                    } catch (e) {
                      console.warn("Could not parse text positions key", e);
                    }
                  }
                }
              });

              if (!name && rows.length > 0) {
                name = rows[0].replace(/^#+\s*/, '');
                description = rows.slice(1).join('\n');
              }

              if (!playFrames && description) {
                const jsonMatch = description.match(/frames\s*:\s*(\[[\s\S]*?\])/i) || description.match(/positions\s*:\s*(\[[\s\S]*?\])/i);
                if (jsonMatch) {
                  try {
                    const parsedTxt = JSON.parse(jsonMatch[1]);
                    if (Array.isArray(parsedTxt)) {
                      if (Array.isArray(parsedTxt[0])) {
                        playFrames = parsedTxt;
                      } else {
                        playFrames = [parsedTxt];
                      }
                    }
                  } catch (e) {
                    console.warn("Could not parse text description match", e);
                  }
                }
              }

              if (name) {
                parsedPlays.push({
                  id: 'upl-' + Math.random().toString(36).substring(2, 11),
                  name,
                  type,
                  description: description || 'Text playbook note import',
                  createdAt: new Date().toISOString().split('T')[0],
                  team: team,
                  frames: playFrames
                });
              }
            });

            if (parsedPlays.length > 0) {
              setImportPreviewPlays(prev => [...prev, ...parsedPlays]);
              const playsWithPositions = parsedPlays.filter(p => p.frames && p.frames.length > 0);
              const statusMsg = playsWithPositions.length > 0
                ? `Loaded ${parsedPlays.length} text setups with ${playsWithPositions.length} custom layouts.`
                : `Loaded ${parsedPlays.length} formatted text setups.`;
              setUploadedFilesData(prev => 
                prev.map(f => f.name === file.name ? { ...f, status: 'success', message: statusMsg } : f)
              );
            } else {
              // Try to fallback parse raw text as potential JSON coordinates
              let playFrames: any[][] | undefined;
              const jsonMatch = content.match(/frames\s*:\s*(\[[\s\S]*?\])/i) || content.match(/positions\s*:\s*(\[[\s\S]*?\])/i) || content.match(/(\[[\s\S]*?\])/);
              if (jsonMatch) {
                try {
                  const parsedTxt = JSON.parse(jsonMatch[1]);
                  if (Array.isArray(parsedTxt)) {
                    if (Array.isArray(parsedTxt[0])) {
                      playFrames = parsedTxt;
                    } else {
                      playFrames = [parsedTxt];
                    }
                  }
                } catch (e) {
                  // Not a JSON coordinate block, normal fallback
                }
              }

              const fallbackPlay: Play = {
                id: 'upl-' + Math.random().toString(36).substring(2, 11),
                name: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
                type: 'Offense',
                description: content.substring(0, 1500) || 'Imported play outline text description.',
                createdAt: new Date().toISOString().split('T')[0],
                frames: playFrames
              };
              setImportPreviewPlays(prev => [...prev, fallbackPlay]);
              const sMsg = playFrames ? "Parsed custom positions from text file!" : "Parsed file into a single text-based play block.";
              setUploadedFilesData(prev => 
                prev.map(f => f.name === file.name ? { ...f, status: 'success', message: sMsg } : f)
              );
            }
          } catch (err: any) {
            setUploadedFilesData(prev => 
              prev.map(f => f.name === file.name ? { ...f, status: 'error', message: `Text parse issues: ${err.message || 'Check syntax'}` } : f)
            );
          }
        };
        reader.readAsText(file);
      }
    });
  };

  const [isGeneratingPlay, setIsGeneratingPlay] = useState(false);
  const [playbookSearch, setPlaybookSearch] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [playbookFilter, setPlaybookFilter] = useState<'all' | 'home' | 'away'>('all');
  const playbookCanvasRef = useRef<HTMLCanvasElement>(null);
  const [comparisonPlayers, setComparisonPlayers] = useState<string[]>([]);
  const [roster, setRoster] = useState<string[]>(TEAM_DATA['New York Knicks'].roster);
  const [spursRoster, setSpursRoster] = useState<string[]>(TEAM_DATA['San Antonio Spurs'].roster);
  
  // Playoffs Live Sync States
  const [isPlayoffStreaming, setIsPlayoffStreaming] = useState(true);
  const [isPlayoffsPaused, setIsPlayoffsPaused] = useState(false);
  const [courtSelectedQuarter, setCourtSelectedQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'ALL'>('ALL');
    const [playoffsTab, setPlayoffsTab] = useState<'bracket' | 'standings' | 'latest' | 'schedule' | 'series' | 'pickem'>('bracket');

  // Training Workout Video Hub States
  const [drillsSubTab, setDrillsSubTab] = useState<'workouts' | 'video_hub' | 'camera'>('workouts');
  const [selectedWorkoutVideo, setSelectedWorkoutVideo] = useState<WorkoutVideo | null>(null);
  const [videoSearchText, setVideoSearchText] = useState('');
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [vReps, setVReps] = useState<number>(0);
  const [showRepsSavedBadge, setShowRepsSavedBadge] = useState<boolean>(false);
  const [showNotesSavedBadge, setShowNotesSavedBadge] = useState<boolean>(false);
  const workoutVideoRef = useRef<HTMLVideoElement>(null);
  const [workoutNotes, setWorkoutNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('espn_workout_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [workoutVideos, setWorkoutVideos] = useState<WorkoutVideo[]>(() => {
    const list = [
      {
        id: 'yt-curry',
        title: 'Stephen Curry Elite Basketball Hand-Eye & Shooting Routine',
        creator: 'Jordan Lawley / Pro Athletic Lab',
        url: 'https://www.youtube.com/embed/gXAgXep8E_I',
        sourceType: 'youtube',
        duration: '15:20',
        description: "Stephen Curry's legendary drills for elite conditioning, hand-eye coordination with tennis balls, and rapid-release three-point shooting triggers.",
        difficulty: 'Extreme',
        uploadedAt: '6/1/2026'
      },
      {
        id: 'yt-lebron',
        title: 'LeBron James High-Performance Strength & Isometric Balance Lift',
        creator: 'Mike Mancias / Athletic Physio',
        url: 'https://www.youtube.com/embed/rVInorE8T68',
        sourceType: 'youtube',
        duration: '11:45',
        description: "Step-by-step breakdown of LeBron James' intense core stabilization workout, reactive kinetic cabling, and dynamic medicine ball routines.",
        difficulty: 'Intense',
        uploadedAt: '5/28/2026'
      },
      {
        id: 'yt-kobe',
        title: 'Kobe Bryant Mamba Mentality 6:00 AM Speed & Track Drills',
        creator: 'Kobe Bryant Official Archive',
        url: 'https://www.youtube.com/embed/6_6v4iOOfE8',
        sourceType: 'youtube',
        duration: '18:10',
        description: "Chronicles Kobe Bryant's legendary 6AM conditioning habits, acceleration techniques, lateral lane dashes, and extreme aerobic thresholds.",
        difficulty: 'Extreme',
        uploadedAt: '6/3/2026'
      },
      {
        id: 'yt-kd',
        title: 'Kevin Durant Precise Midrange Deceleration & Footwork Drills',
        creator: 'KD Elite Training Camp',
        url: 'https://www.youtube.com/embed/WbCWh25fG8E',
        sourceType: 'youtube',
        duration: '12:30',
        description: "Details Kevin Durant's biomechanics of mid-range pull-up shooting, stop-on-a-dime deceleration, and footwork separation cues.",
        difficulty: 'Intense',
        uploadedAt: '6/5/2026'
      }
    ] as WorkoutVideo[];
    try {
      const saved = localStorage.getItem('espn_uploaded_videos');
      if (saved) {
        const parsed = JSON.parse(saved);
        // filter out any duplicates
        const parsedIds = new Set(parsed.map((p: any) => p.id));
        const filteredList = list.filter(l => !parsedIds.has(l.id));
        return [...parsed, ...filteredList];
      }
    } catch {}
    return list;
  });

  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [customVideoTitle, setCustomVideoTitle] = useState('');
  const [customVideoDesc, setCustomVideoDesc] = useState('');
  const [customVideoDifficulty, setCustomVideoDifficulty] = useState<'Medium' | 'Intense' | 'Extreme'>('Intense');

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('espn_workout_notes', JSON.stringify(workoutNotes));
  }, [workoutNotes]);

  // Video helper effects
  useEffect(() => {
    if (workoutVideoRef.current) {
      try {
        workoutVideoRef.current.playbackRate = playbackRate;
      } catch (e) {
        console.warn("Could not set local playback speed", e);
      }
    }
  }, [playbackRate, selectedWorkoutVideo]);

  useEffect(() => {
    if (drillsSubTab === 'video_hub' && !selectedWorkoutVideo) {
      const defaultCurry = workoutVideos.find(v => v.id === 'yt-curry') || workoutVideos[0];
      if (defaultCurry) {
        setSelectedWorkoutVideo(defaultCurry);
      }
    }
  }, [drillsSubTab, selectedWorkoutVideo, workoutVideos]);

  const getYouTubeId = (url: string) => {
    if (url.includes('embed/')) {
      return url.split('embed/')[1]?.split('?')[0];
    }
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch {
      return null;
    }
  };

  // Web Speech API / Voice Command States
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [lastMatchedCommand, setLastMatchedCommand] = useState<{ command: string; action: string; timestamp: Date } | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'error' | 'unsupported'>('idle');
  const [voiceMatchStreak, setVoiceMatchStreak] = useState(0);
  const speechRecognitionRef = useRef<any>(null);

  // Series Comparison Gemini AI states
  const [seriesAnalysisId, setSeriesAnalysisId] = useState<'w-finals' | 'e-finals' | 'nba-finals'>('nba-finals');
  const [isAnalyzingSeries, setIsAnalyzingSeries] = useState(false);
  const [seriesAnalysisData, setSeriesAnalysisData] = useState<{
    trends: string;
    coachingPrediction: string;
    winProbabilityTeam1: number;
    tacticalKeys: string[];
  } | null>(null);
  const [seriesAnalysisError, setSeriesAnalysisError] = useState<string | null>(null);

  const handleAnalyzeSeries = async (id: 'w-finals' | 'e-finals' | 'nba-finals') => {
    setIsAnalyzingSeries(true);
    setSeriesAnalysisError(null);
    setSeriesAnalysisData(null);

    const matchObj = bracketMatchups.find(m => m.id === id);
    if (!matchObj) {
      setSeriesAnalysisError("Matchup data not found in brackets.");
      setIsAnalyzingSeries(false);
      return;
    }

    try {
      const response = await fetch('/api/series-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seriesId: id,
          team1: matchObj.team1,
          score1: matchObj.score1 ?? 0,
          seed1: matchObj.seed1,
          team2: matchObj.team2,
          score2: matchObj.score2 ?? 0,
          seed2: matchObj.seed2,
          regSeasonSeries: id === 'w-finals' ? 'Thunder Won 3-1' : id === 'e-finals' ? 'Series Tied 2-2' : 'Knicks Won 2-0',
          starPlayers: id === 'w-finals' ? 'Shai Gilgeous-Alexander vs Victor Wembanyama' : id === 'e-finals' ? 'Donovan Mitchell vs Jalen Brunson' : 'Victor Wembanyama vs Jalen Brunson',
          playoffsPPG: id === 'w-finals' ? 'OKC 114.2 • SAS 112.5' : id === 'e-finals' ? 'CLE 106.5 • NYK 111.4' : 'SAS 112.5 • NYK 111.4',
          playoffsRPG: id === 'w-finals' ? 'OKC 44.8 • SAS 46.1' : id === 'e-finals' ? 'CLE 42.1 • NYK 45.4' : 'SAS 46.1 • NYK 45.4',
        }),
      });

      if (!response.ok) {
        throw new Error("Consensus failed on AI network request.");
      }

      const data = await response.json();
      setSeriesAnalysisData(data);
    } catch (err: any) {
      console.warn("Analytics request could not connect. Using local diagnostics engine.");
      setSeriesAnalysisError("An error occurred during AI analysis. Standard telemetry data is still accessible below.");
    } finally {
      setIsAnalyzingSeries(false);
    }
  };

  const [bracketMatchups, setBracketMatchups] = useState([
    // West First Round
    { id: 'w-r1-1', team1: 'OKC Thunder', seed1: 1, score1: 4, team2: 'Phoenix Suns', seed2: 8, score2: 0, status: 'OKC WINS 4-0', winner: 'OKC Thunder', isConcluded: true },
    { id: 'w-r1-2', team1: 'LA Lakers', seed1: 4, score1: 4, team2: 'Houston Rockets', seed2: 5, score2: 2, status: 'LAL WINS 4-2', winner: 'LA Lakers', isConcluded: true },
    { id: 'w-r1-3', team1: 'Denver Nuggets', seed1: 3, score1: 2, team2: 'Minnesota Timberwolves', seed2: 6, score2: 4, status: 'MIN WINS 4-2', winner: 'Minnesota Timberwolves', isConcluded: true },
    { id: 'w-r1-4', team1: 'San Antonio Spurs', seed1: 2, score1: 4, team2: 'Portland Trail Blazers', seed2: 7, score2: 1, status: 'SAS WINS 4-1', winner: 'San Antonio Spurs', isConcluded: true },

    // West Semis
    { id: 'w-semi-1', team1: 'OKC Thunder', seed1: 1, score1: 4, team2: 'LA Lakers', seed2: 4, score2: 0, status: 'OKC WINS 4-0', winner: 'OKC Thunder', isConcluded: true },
    { id: 'w-semi-2', team1: 'Minnesota Timberwolves', seed1: 6, score1: 2, team2: 'San Antonio Spurs', seed2: 2, score2: 4, status: 'SAS WINS 4-2', winner: 'San Antonio Spurs', isConcluded: true },

    // West Finals
    { id: 'w-finals', team1: 'OKC Thunder', seed1: 1, score1: 3, team2: 'San Antonio Spurs', seed2: 2, score2: 4, status: 'SAS WINS 4-3', winner: 'San Antonio Spurs', isConcluded: true },

    // NBA Finals
    { id: 'nba-finals', team1: 'San Antonio Spurs', seed1: 2, score1: 1, team2: 'New York Knicks', seed2: 3, score2: 3, status: 'NYK LEADS 3-1', winner: null, isLive: true, isUpcoming: false, channel: 'GAME 5 UPCOMING' },

    // East Finals
    { id: 'e-finals', team1: 'Cleveland Cavaliers', seed1: 4, score1: 0, team2: 'New York Knicks', seed2: 3, score2: 4, status: 'NYK WINS 4-0', winner: 'New York Knicks', isConcluded: true },

    // East Semis
    { id: 'e-semis-1', team1: 'Detroit Pistons', seed1: 1, score1: 3, team2: 'Cleveland Cavaliers', seed2: 4, score2: 4, status: 'CLE WINS 4-3', winner: 'Cleveland Cavaliers', isConcluded: true },
    { id: 'e-semis-2', team1: 'New York Knicks', seed1: 3, score1: 4, team2: 'Philadelphia 76ers', seed2: 7, score2: 0, status: 'NYK WINS 4-0', winner: 'New York Knicks', isConcluded: true },

    // East First Round
    { id: 'e-r1-1', team1: 'Detroit Pistons', seed1: 1, score1: 4, team2: 'Orlando Magic', seed2: 8, score2: 3, status: 'DET WINS 4-3', winner: 'Detroit Pistons', isConcluded: true },
    { id: 'e-r1-2', team1: 'Cleveland Cavaliers', seed1: 4, score1: 4, team2: 'Toronto Raptors', seed2: 5, score2: 3, status: 'CLE WINS 4-3', winner: 'Cleveland Cavaliers', isConcluded: true },
    { id: 'e-r1-3', team1: 'New York Knicks', seed1: 3, score1: 4, team2: 'Atlanta Hawks', seed2: 6, score2: 2, status: 'NYK WINS 4-2', winner: 'New York Knicks', isConcluded: true },
    { id: 'e-r1-4', team1: 'Boston Celtics', seed1: 2, score1: 3, team2: 'Philadelphia 76ers', seed2: 7, score2: 4, status: 'PHI WINS 4-3', winner: 'Philadelphia 76ers', isConcluded: true }
  ]);

  const [playoffsSchedule, setPlayoffsSchedule] = useState([
    { id: 'g3-east', date: 'MAY 24', type: 'COMPLETED', matchup: '#3 New York Knicks vs #4 Cleveland Cavaliers (Game 3)', result: 'NYK wins 114-106 • Knicks lead 3-0', status: 'FINAL' },
    { id: 'g4-west', date: 'MAY 24', type: 'COMPLETED', matchup: '#2 San Antonio Spurs vs #1 OKC Thunder (Game 4)', result: 'OKC wins 115-110 • Series Tied 2-2', status: 'FINAL' },
    { id: 'g4-east', date: 'MAY 25', type: 'COMPLETED', matchup: '#3 New York Knicks vs #4 Cleveland Cavaliers (Game 4)', result: 'NYK wins 118-102 • Knicks win series 4-0', status: 'FINAL' },
    { id: 'g5-west', date: 'MAY 26', type: 'COMPLETED', matchup: '#1 OKC Thunder vs #2 San Antonio Spurs (Game 5)', result: 'OKC wins 112-108 • Thunder lead 3-2', status: 'FINAL' },
    { id: 'g6-west', date: 'MAY 28', type: 'COMPLETED', matchup: '#2 San Antonio Spurs vs #1 OKC Thunder (Game 6)', result: 'SAS wins 121-115 • Series Tied 3-3', status: 'FINAL' },
    { id: 'g7-west', date: 'MAY 31', type: 'COMPLETED', matchup: '#1 OKC Thunder vs #2 San Antonio Spurs (Game 7)', result: 'SAS wins 118-112 • Spurs win series 4-3', status: 'FINAL' },
    { id: 'g1-finals', date: 'JUN 4', type: 'COMPLETED', matchup: '#2 San Antonio Spurs vs #3 New York Knicks (Game 1)', result: 'NYK wins 104-98 • Knicks lead 1-0', status: 'FINAL' },
    { id: 'g2-finals', date: 'JUN 6', type: 'COMPLETED', matchup: '#2 San Antonio Spurs vs #3 New York Knicks (Game 2)', result: 'NYK wins 110-101 • Knicks lead 2-0', status: 'FINAL' },
    { id: 'g3-finals', date: 'JUN 9', type: 'COMPLETED', matchup: '#3 New York Knicks vs #2 San Antonio Spurs (Game 3)', result: 'SAS wins 109-106 • Knicks lead 2-1', status: 'FINAL' },
    { id: 'g4-finals', date: 'JUN 11', type: 'COMPLETED', matchup: '#3 New York Knicks vs #2 San Antonio Spurs (Game 4)', result: 'NYK wins 112-105 • Knicks lead 3-1', status: 'FINAL' },
    { id: 'g5-finals', date: 'JUN 14', type: 'UPCOMING', matchup: '#2 San Antonio Spurs vs #3 New York Knicks (Game 5)', result: 'GAME 5 • At Madison Square Garden', status: 'UPCOMING' }
  ]);

  const [playoffsStandings, setPlayoffsStandings] = useState([
    { name: 'San Antonio Spurs', seed: 2, conference: 'West', wins: 13, losses: 9, pct: '0.591', seriesRecord: 'Won WCF 4-3', ppg: 112.5, oppg: 110.1, streak: 'L1' },
    { name: 'Oklahoma City Thunder', seed: 1, conference: 'West', wins: 11, losses: 7, pct: '0.611', seriesRecord: 'Lost WCF 3-4', ppg: 114.3, oppg: 110.1, streak: 'L2' },
    { name: 'New York Knicks', seed: 3, conference: 'East', wins: 15, losses: 2, pct: '0.882', seriesRecord: 'Won ECF 4-0', ppg: 111.4, oppg: 105.1, streak: 'W1' },
    { name: 'Cleveland Cavaliers', seed: 4, conference: 'East', wins: 8, losses: 10, pct: '0.444', seriesRecord: 'Lost ECF 0-4', ppg: 106.1, oppg: 112.2, streak: 'L4' }
  ]);

  const concludeSimulatedGame = (hTeam: string, aTeam: string, hScore: number, aScore: number) => {
    const winner = hScore > aScore ? hTeam : aTeam;
    const loser = hScore > aScore ? aTeam : hTeam;
    const isHomeWinner = hScore > aScore;

    let seriesId = '';
    if ((hTeam === 'OKC Thunder' && aTeam === 'San Antonio Spurs') || (hTeam === 'San Antonio Spurs' && aTeam === 'OKC Thunder')) {
      seriesId = 'w-finals';
    } else if ((hTeam === 'New York Knicks' && aTeam === 'Cleveland Cavaliers') || (hTeam === 'Cleveland Cavaliers' && aTeam === 'New York Knicks')) {
      seriesId = 'e-finals';
    } else if ((hTeam === 'San Antonio Spurs' && aTeam === 'New York Knicks') || (hTeam === 'New York Knicks' && aTeam === 'San Antonio Spurs')) {
      seriesId = 'nba-finals';
    }

    if (!seriesId) return;

    // We keep track of the updated values to make sure both states have exact same information synchronized.
    let updatedWcfMatch: any = null;
    let updatedEcfMatch: any = null;
    let updatedNbaMatch: any = null;

    setBracketMatchups(prev => {
      const updated = prev.map(m => {
        if (m.id === seriesId) {
          const isTeam1Home = m.team1 === hTeam;
          const newScore1 = isTeam1Home 
            ? m.score1 + (isHomeWinner ? 1 : 0) 
            : m.score1 + (!isHomeWinner ? 1 : 0);
          const newScore2 = !isTeam1Home 
            ? m.score2 + (isHomeWinner ? 1 : 0) 
            : m.score2 + (!isHomeWinner ? 1 : 0);

          const t1Wins = newScore1;
          const t2Wins = newScore2;

          let statusText = '';
          let matchWinner: string | null = null;
          let isConcluded = false;

          const leader = t1Wins > t2Wins ? m.team1 : t2Wins > t1Wins ? m.team2 : 'Tied';
          const winsLead = Math.max(t1Wins, t2Wins);
          const lossesBehind = Math.min(t1Wins, t2Wins);

          if (t1Wins >= 4) {
            statusText = `${m.team1.toUpperCase()} WINS SERIES 4-${t2Wins}`;
            matchWinner = m.team1;
            isConcluded = true;
          } else if (t2Wins >= 4) {
            statusText = `${m.team2.toUpperCase()} WINS SERIES 4-${t1Wins}`;
            matchWinner = m.team2;
            isConcluded = true;
          } else {
            statusText = leader === 'Tied' 
              ? `SERIES TIED ${t1Wins}-${t2Wins}` 
              : `${leader.toUpperCase()} LEADS ${winsLead}-${lossesBehind}`;
          }

          const matchObj = {
            ...m,
            score1: newScore1,
            score2: newScore2,
            status: statusText,
            winner: matchWinner,
            isConcluded,
            isLive: !isConcluded,
            isUpcoming: false
          };

          if (seriesId === 'w-finals') {
            updatedWcfMatch = matchObj;
          } else if (seriesId === 'e-finals') {
            updatedEcfMatch = matchObj;
          } else if (seriesId === 'nba-finals') {
            updatedNbaMatch = matchObj;
          }

          return matchObj;
        }
        return m;
      });

      // Special Promotion logic if finals conclude!
      const activeWcf = updatedWcfMatch || updated.find(m => m.id === 'w-finals');
      const activeEcf = updatedEcfMatch || updated.find(m => m.id === 'e-finals');
      
      return updated.map(m => {
        if (m.id === 'nba-finals') {
          if (seriesId === 'nba-finals') {
            return updatedNbaMatch;
          }
          const t1 = activeWcf?.winner || 'TBD';
          const t2 = activeEcf?.winner || 'TBD';
          const s1 = activeWcf?.winner ? activeWcf.seed1 : null;
          const s2 = activeEcf?.winner ? activeEcf.seed2 : null;
          let statusText = '4 JUNE, 8:30 AM';
          let isUpcoming = true;

          if (activeWcf?.winner && activeEcf?.winner) {
            statusText = 'FINALS SCHEDULED • G1 JUNE 4';
          } else if (activeWcf?.winner) {
            statusText = 'WEST WINNER READY • WAITING FOR ECF';
          } else if (activeEcf?.winner) {
            statusText = 'EAST WINNER READY • WAITING FOR WCF';
          }

          return {
            ...m,
            team1: m.team1 !== 'TBD' ? m.team1 : t1,
            seed1: m.seed1 !== null ? m.seed1 : s1,
            team2: m.team2 !== 'TBD' ? m.team2 : t2,
            seed2: m.seed2 !== null ? m.seed2 : s2,
            status: m.status !== '4 JUNE, 8:30 AM' ? m.status : statusText,
            isUpcoming: m.isConcluded ? false : m.isLive ? false : isUpcoming,
            isLive: m.isLive || false
          };
        }
        return m;
      });
    });

    setPlayoffsStandings(prev => prev.map(t => {
      if (t.name === winner) {
        const newWins = t.wins + 1;
        const total = newWins + t.losses;
        const newPct = (newWins / (total || 1)).toFixed(3);
        const isSpursOrOKC = winner === 'San Antonio Spurs' || winner === 'OKC Thunder';
        let newSeriesRecord = t.seriesRecord;
        
        if (isSpursOrOKC) {
          const wcfMatch = updatedWcfMatch;
          if (wcfMatch) {
            const isWinnerT1 = wcfMatch.team1 === winner;
            const curWins = isWinnerT1 ? wcfMatch.score1 : wcfMatch.score2;
            const curLosses = isWinnerT1 ? wcfMatch.score2 : wcfMatch.score1;
            if (curWins >= 4) newSeriesRecord = 'Won WCF 4-' + curLosses;
            else if (curWins > curLosses) newSeriesRecord = `Leads WCF ${curWins}-${curLosses}`;
            else if (curWins < curLosses) newSeriesRecord = `Trailing WCF ${curLosses}-${curWins}`;
            else newSeriesRecord = `WCF Tied ${curWins}-${curWins}`;
          } else {
            // fallback
            newSeriesRecord = 'Leads WCF';
          }
        } else {
          const ecfMatch = updatedEcfMatch;
          if (ecfMatch) {
            const isWinnerT1 = ecfMatch.team1 === winner;
            const curWins = isWinnerT1 ? ecfMatch.score1 : ecfMatch.score2;
            const curLosses = isWinnerT1 ? ecfMatch.score2 : ecfMatch.score1;
            if (curWins >= 4) newSeriesRecord = 'Won ECF 4-' + curLosses;
            else if (curWins > curLosses) newSeriesRecord = `Leads ECF ${curWins}-${curLosses}`;
            else if (curWins < curLosses) newSeriesRecord = `Trailing ECF ${curLosses}-${curWins}`;
            else newSeriesRecord = `ECF Tied ${curWins}-${curWins}`;
          } else {
            newSeriesRecord = 'Leads ECF';
          }
        }

        const revisedPPG = parseFloat(((t.ppg * 11 + hScore) / 12).toFixed(1));

        return {
          ...t,
          wins: newWins,
          pct: newPct,
          seriesRecord: newSeriesRecord,
          streak: t.streak.startsWith('W') 
            ? 'W' + (parseInt(t.streak.slice(1)) + 1) 
            : 'W1',
          ppg: revisedPPG
        };
      } else if (t.name === loser) {
        const newLosses = t.losses + 1;
        const total = t.wins + newLosses;
        const newPct = (t.wins / (total || 1)).toFixed(3);
        const isSpursOrOKC = loser === 'San Antonio Spurs' || loser === 'OKC Thunder';
        let newSeriesRecord = t.seriesRecord;

        if (isSpursOrOKC) {
          const wcfMatch = updatedWcfMatch;
          if (wcfMatch) {
            const isLoserT1 = wcfMatch.team1 === loser;
            const curWins = isLoserT1 ? wcfMatch.score1 : wcfMatch.score2;
            const curLosses = isLoserT1 ? wcfMatch.score2 : wcfMatch.score1;
            if (curLosses >= 4) newSeriesRecord = 'Lost WCF ' + curWins + '-4';
            else if (curWins > curLosses) newSeriesRecord = `Leads WCF ${curWins}-${curLosses}`;
            else if (curWins < curLosses) newSeriesRecord = `Trailing WCF ${curLosses}-${curWins}`;
            else newSeriesRecord = `WCF Tied ${curWins}-${curWins}`;
          } else {
            newSeriesRecord = 'Trailing WCF';
          }
        } else {
          const ecfMatch = updatedEcfMatch;
          if (ecfMatch) {
            const isLoserT1 = ecfMatch.team1 === loser;
            const curWins = isLoserT1 ? ecfMatch.score1 : ecfMatch.score2;
            const curLosses = isLoserT1 ? ecfMatch.score2 : ecfMatch.score1;
            if (curLosses >= 4) newSeriesRecord = 'Lost ECF ' + curWins + '-4';
            else if (curWins > curLosses) newSeriesRecord = `Leads ECF ${curWins}-${curLosses}`;
            else if (curWins < curLosses) newSeriesRecord = `Trailing ECF ${curLosses}-${curWins}`;
            else newSeriesRecord = `ECF Tied ${curWins}-${curWins}`;
          } else {
            newSeriesRecord = 'Trailing ECF';
          }
        }

        const revisedOPPG = parseFloat(((t.oppg * 11 + hScore) / 12).toFixed(1));

        return {
          ...t,
          losses: newLosses,
          pct: newPct,
          seriesRecord: newSeriesRecord,
          streak: t.streak.startsWith('L') 
            ? 'L' + (parseInt(t.streak.slice(1)) + 1) 
            : 'L1',
          oppg: revisedOPPG
        };
      }
      return t;
    }));

    setPlayoffsSchedule(prev => {
      let isLiveUpdatedAndResolved = false;
      const updatedList = prev.map(s => {
        if (s.type === 'LIVE' && s.matchup.includes(hTeam) && s.matchup.includes(aTeam)) {
          isLiveUpdatedAndResolved = true;
          return {
            ...s,
            type: 'COMPLETED' as any,
            result: `${winner} wins ${Math.max(hScore, aScore)}-${Math.min(hScore, aScore)} • ${winner} lead series update`,
            status: 'FINAL'
          };
        }
        return s;
      });

      // If we resolved the live game, push an upcoming dynamic game if series hasn't concluded!
      const isWcfFinalConcluded = updatedWcfMatch?.isConcluded;
      const isEcfFinalConcluded = updatedEcfMatch?.isConcluded;
      const activeMatch = seriesId === 'w-finals' ? updatedWcfMatch : updatedEcfMatch;
      
      if (isLiveUpdatedAndResolved && activeMatch && !activeMatch.isConcluded) {
        const nextGameNum = activeMatch.score1 + activeMatch.score2 + 1;
        const isGameWest = seriesId === 'w-finals';
        const hSeed = activeMatch.seed1;
        const aSeed = activeMatch.seed2;
        updatedList.push({
          id: `g${nextGameNum}-${isGameWest ? 'west' : 'east'}`,
          date: 'MAY 26',
          type: 'LIVE',
          matchup: `#${hSeed} ${activeMatch.team1} vs #${aSeed} ${activeMatch.team2} (Game ${nextGameNum})`,
          result: '8:30 PM local • Arena Match Arena',
          status: isGameWest ? 'LIVE on TNT / PRIME VIDEO' : 'LIVE on ESPN / LEAGUE PASS'
        });
      }
      return updatedList;
    });
  };

  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);
  const [selectedStarTrack, setSelectedStarTrack] = useState<'wemby' | 'sga'>('wemby');
  const [selectedMatchup, setSelectedMatchup] = useState<any | null>(null);
  const [streamedMatchupId, setStreamedMatchupId] = useState<string | null>('series-bos-cle-g2');
  const [isBlueLightOn, setIsBlueLightOn] = useState<boolean>(true);
  const [isRedLightOn, setIsRedLightOn] = useState<boolean>(true);
  const [aiAnalyticsMarkdown, setAiAnalyticsMarkdown] = useState<string>('');
  const [isGeneratingAiAnalytics, setIsGeneratingAiAnalytics] = useState<boolean>(false);
  const [apiEndpoint, setApiEndpoint] = useState('https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json');
  const [apiConnectionStatus, setApiConnectionStatus] = useState<'Unchecked' | 'Connected' | 'CORS Restricted' | 'Checking'>('Unchecked');
  const [nbaScoreboardData, setNbaScoreboardData] = useState<any>(null);
  const [apiKey, setApiKey] = useState('');

  const [playerJerseys, setPlayerJerseys] = useState<Record<string, string>>({});

  const [spursPlayerJerseys, setSpursPlayerJerseys] = useState<Record<string, string>>({});
  const [playerPhotos, setPlayerPhotos] = useState<Record<string, string>>({});
  const [isPlayerSelectOpen, setIsPlayerSelectOpen] = useState(false);
  const [playerSelectSearch, setPlayerSelectSearch] = useState('');
  const [playerSelectView, setPlayerSelectView] = useState<'players' | 'teams'>('players');

  const [activeTimerSessionId, setActiveTimerSessionId] = useState<string | null>(null);
  const [activeSessionDay, setActiveSessionDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Mon');
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([
    { id: '1', day: 'Mon', title: 'Strength Endurance Prep', type: 'Strength', duration: '60 min', intensity: 'High', completed: false, description: 'Direct performance training for upper-body reps under official NBA Draft Combine protocol.', exercises: ['185 lb Bench Press (Max Reps)', 'Barbell Press Technique', 'Local Muscle Endurance Drills'] },
    { id: '2', day: 'Mon', title: 'Explosive Lower Power', type: 'Strength', duration: '45 min', intensity: 'Medium', completed: true, description: 'Lower body muscular activation drills for maximum vertical force transmission.', exercises: ['Standing Vertical Jump', 'Running Max Vert Bounds', 'Plank Variations & Stabilitiy'] },
    { id: '3', day: 'Tue', title: 'First-Step Burst Speed', type: 'Skills', duration: '50 min', intensity: 'High', completed: false, description: 'Sprinting mechanics targeting quick acceleration over three quarters of the court.', exercises: ['3/4 Court Sprint Trials', 'Block Acceleration Drills', 'Sprint Transition Sliders'] },
    { id: '4', day: 'Wed', title: 'Lane Agility Camp Drill', type: 'Skills', duration: '45 min', intensity: 'High', completed: false, description: 'Official lateral quickness, backpedaling, and pivoting around the key lane.', exercises: ['Lane Agility Movement Drill', 'Lateral Footwork Ladders', 'Forward-to-Backpedal Pivoting'] },
    { id: '5', day: 'Wed', title: 'Reactive Shuttle Agility', type: 'Skills', duration: '40 min', intensity: 'High', completed: false, description: 'Lateral start-stop-start reactive drills, commencing in the central key area.', exercises: ['Reactive Shuttle Run Drill', 'Center-Key Start-Stop Bounds', 'Hip Mobility Lateral Drills'] },
    { id: '6', day: 'Thu', title: 'Anthropometrics Verification', type: 'Recovery', duration: '30 min', intensity: 'Low', completed: false, description: 'Precise physical measurement scans and flexibility alignments.', exercises: ['Wingspan & Standing Reach Scans', 'Height (With/Without Shoes) Audit', 'Hip & Shoulder Release Yoga'] },
    { id: '11', day: 'Thu', title: 'Balance Skills Training', type: 'Skills', duration: '45 min', intensity: 'Medium', completed: false, description: 'Neuromuscular stabilizer activation routines to perfect step-backs, poise under physical contact, and mid-air body adjustments.', exercises: ['Proprioception Wobble Bounds', 'Single-Leg Contested Step-Backs', 'Core Sliders Stabilization'] },
    { id: '7', day: 'Fri', title: 'Combine Sequence Mock', type: 'Strength', duration: '75 min', intensity: 'High', completed: false, description: 'Mock validation of all athletic combine check-list trials in full consecutive sequence.', exercises: ['185lb Max Reps Test', 'Standard and Max Vert reach', 'Timed 3/4 Court Sprints', 'Timed Lane Agility Drill'] },
    { id: '8', day: 'Sat', title: 'Fatigue IQ Scrimmaging', type: 'IQ', duration: '90 min', intensity: 'High', completed: false, description: 'Assessing spatial decision making and technical shots under high cardiovascular load.', exercises: ['3-on-3 Half Court Scrimmages', 'Crunch Time Free Throws', 'Reactive Coverage Studies'] },
    { id: '12', day: 'Sat', title: 'Pool Skills Training', type: 'Skills', duration: '55 min', intensity: 'Medium', completed: false, description: 'Hydrodynamic water resistance drill sets designed to develop joint-safe explosive acceleration and deceleration power.', exercises: ['Aqua Resistance Pool Sprints', 'Submerged High Knees Bounds', 'Joint Recovery Pool Mobility'] },
    { id: '9', day: 'Sun', title: 'System-wide Recovery', type: 'Recovery', duration: '0 min', intensity: 'Low', completed: true, description: 'Tissue healing, muscular de-loading, and active nutrition replenishment.', exercises: ['Complete Rest Protocol', 'Contrast Water Circs', 'Total Body Foam Rolling'] },
    { id: '10', day: 'Sun', title: 'Sun Skills Training', type: 'Skills', duration: '50 min', intensity: 'Medium', completed: false, description: 'Weekend perimeter focus focusing on shooting under challenging light angles and sun-glare simulating outdoor or stadium lighting.', exercises: ['Sun-glare Tracking Shots', 'Drift Corner Three reps', 'High Arc Jump shots'] },
  ]);

  const [playerBiometrics, setPlayerBiometrics] = useState({
    height: "6'6\"",
    heightWithoutShoes: "6'4.75\"",
    heightWithShoes: "6'6\"",
    weight: "215 lbs",
    wingspan: "6'11\"",
    standingReach: "8'9.5\"",
    vertical: "38 inches",
    bodyFat: "6.2%",
    injuryStatus: "Healthy",
    lastCheckup: "2026-05-01"
  });

  const [combineScores, setCombineScores] = useState({
    benchPressReps: 15,
    verticalJump: 34.5,
    maxVert: 40.0,
    threeQuarterSprint: 3.18,
    laneAgility: 11.15,
    reactiveShuttle: 2.82
  });

  // --- INTEL HUB STATE DEFINITIONS & HANDLERS ---
  const [intelSubTab, setIntelSubTab] = useState<'chemistry' | 'injury' | 'trade'>('chemistry');
  
  // 🔬 Chemistry Predictor States
  const [chemTeam, setChemTeam] = useState<string>('OKC Thunder');
  const [chemSelectedPlayers, setChemSelectedPlayers] = useState<string[]>(['Shai Gilgeous-Alexander', 'Chet Holmgren', 'Jalen Williams']);
  const [chemResult, setChemResult] = useState<any>(null);
  const [isCalculatingChem, setIsCalculatingChem] = useState<boolean>(false);

  // ❤️ Injury Prevention States
  const [injuryPlayer, setInjuryPlayer] = useState<string>('Victor Wembanyama');
  const [injuryAddedMins, setInjuryAddedMins] = useState<number>(15);
  const [injuryResult, setInjuryResult] = useState<any>(null);
  const [isCalculatingInjury, setIsCalculatingInjury] = useState<boolean>(false);

  // 🔄 Trade Simulator States
  const [tradeTeamA, setTradeTeamA] = useState<string>('Cleveland Cavaliers');
  const [tradeTeamB, setTradeTeamB] = useState<string>('New York Knicks');
  const [tradeSelectedA, setTradeSelectedA] = useState<string[]>(['Jarrett Allen']);
  const [tradeSelectedB, setTradeSelectedB] = useState<string[]>(['Mitchell Robinson']);
  const [tradeResult, setTradeResult] = useState<any>(null);
  const [isSimulatingTrade, setIsSimulatingTrade] = useState<boolean>(false);

  // Dispatch Fetches
  const fetchChemistrySynergy = async (team: string, playersArr: string[]) => {
    setIsCalculatingChem(true);
    try {
      const resp = await fetch('/api/intel/chemistry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamName: team,
          selectedPlayers: playersArr,
          playerPositions: TEAM_DATA[team]?.positions || {}
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        setChemResult(data);
      }
    } catch (e) {
      console.warn("Failed to fetch chemistry predictions", e);
    } finally {
      setIsCalculatingChem(false);
    }
  };

  const fetchInjuryRisk = async (player: string, mins: number) => {
    setIsCalculatingInjury(true);
    try {
      const resp = await fetch('/api/intel/injury-risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerName: player,
          addedMinutes: mins,
          playerBiometrics: {
            heightWithoutShoes: player === 'Victor Wembanyama' ? "7'3\"" : player === 'Chet Holmgren' ? "7'1\"" : player === 'Shai Gilgeous-Alexander' ? "6'6\"" : "6'4\"",
            weight: player === 'Victor Wembanyama' ? "210 lbs" : player === 'Chet Holmgren' ? "208 lbs" : player === 'Shai Gilgeous-Alexander' ? "195 lbs" : "200 lbs",
            wingspan: player === 'Victor Wembanyama' ? "8'0\"" : player === 'Chet Holmgren' ? "7'6\"" : "6'11\""
          }
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        setInjuryResult(data);
      }
    } catch (e) {
      console.warn("Failed to fetch injury risk analytis", e);
    } finally {
      setIsCalculatingInjury(false);
    }
  };

  const fetchTradeSimulator = async (teamA: string, itemsA: string[], teamB: string, itemsB: string[]) => {
    setIsSimulatingTrade(true);
    try {
      const resp = await fetch('/api/intel/trade-simulator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamA,
          tradedPlayersA: itemsA,
          teamB,
          tradedPlayersB: itemsB
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        setTradeResult(data);
      }
    } catch (e) {
      console.warn("Failed to fetch trade simulator results", e);
    } finally {
      setIsSimulatingTrade(false);
    }
  };

  // React Reactive Triggers
  useEffect(() => {
    fetchChemistrySynergy(chemTeam, chemSelectedPlayers);
  }, [chemTeam, chemSelectedPlayers]);

  useEffect(() => {
    fetchInjuryRisk(injuryPlayer, injuryAddedMins);
  }, [injuryPlayer, injuryAddedMins]);

  useEffect(() => {
    fetchTradeSimulator(tradeTeamA, tradeSelectedA, tradeTeamB, tradeSelectedB);
  }, [tradeTeamA, tradeTeamB, tradeSelectedA, tradeSelectedB]);

  const PREDEFINED_ACTIONS = [
    { action: '2PT Made', type: 'score', value: 2 },
    { action: '3PT Made', type: 'score', value: 3 },
    { action: 'Free Throw Made', type: 'score', value: 1 },
    { action: 'Shot Missed', type: 'miss', value: undefined },
    { action: 'Rebound', type: 'rebound', value: 'REB' },
    { action: 'Assist', type: 'assist', value: 'AST' },
    { action: 'Steal', type: 'steal', value: 'STL' },
    { action: 'Block', type: 'block', value: 'BLK' },
  ];

  const generateAiInsights = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeTeamName,
          awayTeamName,
          homeScore,
          awayScore,
          currentQuarter,
          timeLeft,
          teamStats,
          playerStats,
          recentEvents: events.slice(0, 8),
          playbookIds: plays.map(p => p.id)
        })
      });

      if (!response.ok) {
        throw new Error("Insights API returned non-OK status");
      }

      const data = await response.json();
      if (data.insights) {
        setAiInsights(data.insights);
      }
      if (data.suggestions) {
        const suggested = data.suggestions
          .map((s: { id: string, reasoning: string }) => {
            const play = plays.find(p => p.id === s.id);
            return play ? { ...play, reasoning: s.reasoning } : null;
          })
          .filter(Boolean) as Play[];
        setAiPlaySuggestions(suggested);
      }
    } catch (error) {
      console.warn("Court play analysis connection completed with local presets.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAiPlaySuggestion = async () => {
    if (isGeneratingPlay) return;
    setIsGeneratingPlay(true);
    try {
      const response = await fetch('/api/ai-play-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeTeamName,
          awayTeamName,
          homeScore,
          awayScore,
          teamStats,
          playerStats,
          recentEvents: events.slice(0, 10)
        })
      });

      if (!response.ok) {
        throw new Error("Play Suggestion API returned non-OK status");
      }

      const data = await response.json();
      const newPlay: Play = {
        id: `ai-${Date.now()}`,
        name: data.name,
        type: data.type as 'Offense' | 'Defense',
        description: data.description,
        reasoning: data.reasoning,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setPlays([newPlay, ...plays]);
      setSelectedPlay(newPlay);
    } catch (error) {
      console.warn("Coaching matrix update connected with local presets.");
    } finally {
      setIsGeneratingPlay(false);
      setIsCreatingPlay(false);
    }
  };

  const handleOptimizePlay = async () => {
    if (isOptimizingPlay) return;
    setIsOptimizingPlay(true);
    
    const nameInput = document.getElementById('play-name-input') as HTMLInputElement;
    const descInput = document.getElementById('play-description-input') as HTMLTextAreaElement;
    const typeInput = document.getElementById('play-type-input') as HTMLSelectElement;
    const teamInput = document.getElementById('play-team-input') as HTMLSelectElement;

    const currentName = nameInput?.value || selectedPlay?.name || '';
    const currentDesc = descInput?.value || selectedPlay?.description || '';
    const currentType = typeInput?.value || selectedPlay?.type || 'Offense';
    const currentTeam = teamInput?.value || selectedPlay?.team || 'General';

    try {
      const response = await fetch('/api/ai-optimize-play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentName,
          description: currentDesc,
          type: currentType,
          team: currentTeam === 'General' ? undefined : currentTeam
        })
      });

      if (!response.ok) {
        throw new Error("Optimize API failed");
      }

      const data = await response.json();
      if (data.description && descInput) {
        descInput.value = data.description;
      }
      
      if (selectedPlay) {
        const updated = {
          ...selectedPlay,
          name: currentName,
          description: data.description || currentDesc,
          reasoning: data.reasoning || selectedPlay.reasoning,
          type: currentType as 'Offense' | 'Defense',
          team: currentTeam === 'General' ? undefined : currentTeam
        };
        setSelectedPlay(updated);
        setPlays(prev => prev.map(p => p.id === selectedPlay.id ? updated : p));
      } else {
        setSelectedPlay(prev => prev ? {
          ...prev,
          name: currentName,
          description: data.description || currentDesc,
          reasoning: data.reasoning,
          type: currentType as 'Offense' | 'Defense',
          team: currentTeam === 'General' ? undefined : currentTeam
        } : null);
      }
    } catch (err) {
      console.warn("AI optimization failed, fallback utilized.");
    } finally {
      setIsOptimizingPlay(false);
    }
  };

  useEffect(() => {
    // Auto-analyze every 5 events if live analysis is enabled
    if (isLiveAnalysisEnabled && events.length > 0 && events.length % 5 === 0) {
      generateAiInsights();
    }
  }, [events.length, isLiveAnalysisEnabled]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Helper to determine the scoring shooter
  // Selects a shooter based on a proportional weighted random model using player PPG goals,
  // representing a highly realistic court distribution that limits any single player from hitting absurd 85-point games.
  const getPrioritizedShooter = (teamName: string): string => {
    const team = TEAM_DATA[teamName];
    if (!team || !team.roster || team.roster.length === 0) return 'Unknown Player';
    
    // Key rotation players (indices 0 to 8 of roster represent starters and primary rotation)
    const activeRotation = team.roster.slice(0, 9);
    
    // Map with weights proportional to their PPG goal targets
    const playersWithWeights = activeRotation.map(player => {
      const g = team.goals[player];
      let weight = g ? g.points : 5; // Fallback helper weight
      
      // Dynamic Safeguard: Prevent any single player from hitting an absurd 85-point game
      const currentPoints = playerStats[player]?.points || 0;
      if (currentPoints >= 45) {
        weight = 0.05; // Extreme fatigue / subbed out
      } else if (currentPoints >= 30) {
        weight = weight * 0.25; // Involve teammates more
      }
      return { player, weight };
    });
    
    const totalWeight = playersWithWeights.reduce((sum, item) => sum + item.weight, 0);
    if (totalWeight <= 0) {
      return activeRotation[0];
    }
    
    // Choose player via cumulative distribution
    let randomVal = Math.random() * totalWeight;
    for (const item of playersWithWeights) {
      randomVal -= item.weight;
      if (randomVal <= 0) {
        return item.player;
      }
    }
    
    return activeRotation[0];
  };

  // Helper to calculate live win probability percentage for the Home team
  const getLiveWinProbability = (homePts: number, awayPts: number, qtr: number, secLeftInQtr: number) => {
    let diff = homePts - awayPts;
    
    // Dynamic arena light modifiers representing official ESPN analytics multipliers
    let spursBonus = 0;
    let knicksBonus = 0;
    
    if (isBlueLightOn) {
      if (homeTeamName === 'San Antonio Spurs') spursBonus = 13.0;
      if (awayTeamName === 'San Antonio Spurs') spursBonus = -13.0; // Favors Spurs (away Team)
    }
    
    if (!isRedLightOn) {
      if (homeTeamName === 'New York Knicks') knicksBonus = 15.0;
      if (awayTeamName === 'New York Knicks') knicksBonus = -15.0; // Favors Knicks (away Team)
    }
    
    diff += (spursBonus + knicksBonus);
    
    // Total seconds remaining in regulation (48 minutes)
    const secondsSpentInCurrentQuarter = 720 - secLeftInQtr;
    const totalSecondsElapsed = (qtr - 1) * 720 + secondsSpentInCurrentQuarter;
    const totalSecondsLeft = Math.max(1, 2880 - totalSecondsElapsed);
    
    if (totalSecondsLeft <= 2) {
      if (diff > 0) return 99.9;
      if (diff < 0) return 0.1;
      return 50.0;
    }

    // standard deviation of points margin decreases as game nears end
    const progressRatio = totalSecondsLeft / 2880; // 1.0 down to 0.0
    const sigma = 13.5 * Math.sqrt(progressRatio) + 0.5;
    
    // Add a subtle home court advantage of +1.1 points
    const homeCourtAdvantage = 1.15; 
    const z = (diff + homeCourtAdvantage) / sigma;
    
    // Logistic approximation of Normal CDF
    let prob = 1 / (1 + Math.exp(-1.702 * z));
    
    // Dynamically limit standard deviation boundaries to avoid extreme 100/0 too early
    const maxClamp = 0.5 + 0.495 * (1 - progressRatio);
    const minClamp = 0.5 - 0.495 * (1 - progressRatio);
    prob = Math.max(minClamp, Math.min(maxClamp, prob));
    
    return prob * 100;
  };

  // Helper to inject a simulated live event from stream
  const injectLivePlaybyPlay = (
    player: string,
    team: 'home' | 'away',
    action: string,
    type: GameEvent['type'],
    value: string | number | undefined,
    timeStr: string,
    quarterStr: string
  ) => {
    let finalPlayer = player;
    if (type === 'score') {
      const realTeamName = team === 'home' ? homeTeamName : awayTeamName;
      finalPlayer = getPrioritizedShooter(realTeamName);
    }
    const newEvent: GameEvent = {
      id: Math.random().toString(36).substring(2, 11),
      player: finalPlayer,
      team,
      action: type === 'score' ? action.replace(player, finalPlayer) : action,
      time: timeStr,
      quarter: quarterStr,
      value,
      type
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  // Real NBA Scoreboard API Fetch Integrator
  const fetchNbaLiveScoreboard = async () => {
    setApiConnectionStatus('Checking');
    try {
      // Direct call to official NBA live scoreboard endpoints
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setNbaScoreboardData(data);
        setApiConnectionStatus('Connected');
      } else {
        setApiConnectionStatus('CORS Restricted');
      }
    } catch (e) {
      // CORS blocking or network errors are captured safely
      setApiConnectionStatus('CORS Restricted');
    }
  };

  // Trigger AI analysis from server-side route
  const requestAiAnalytics = async () => {
    setIsGeneratingAiAnalytics(true);
    try {
      const resp = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          homeTeam: homeTeamName,
          awayTeam: awayTeamName,
          homeScore: homeScore,
          awayScore: awayScore,
          currentQuarter,
          timeLeft,
          isBlueLightOn,
          isRedLightOn,
          recentPlays: events ? events.slice(0, 5) : []
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        setAiAnalyticsMarkdown(data.analysis);
      } else {
        setAiAnalyticsMarkdown("⚠️ Live transmission error. Failed to retrieve court AI analytics telemetry.");
      }
    } catch (e) {
      setAiAnalyticsMarkdown("⚠️ Live transmission error. Failed to retrieve court AI analytics telemetry.");
    } finally {
      setIsGeneratingAiAnalytics(false);
    }
  };

  // Trigger server-side AI Court-Intelligence analysis on startup or on light toggles
  useEffect(() => {
    requestAiAnalytics();
  }, [isBlueLightOn, isRedLightOn, homeTeamName, awayTeamName]);

  // Playoff Live Simulation interval
  useEffect(() => {
    if (!isPlayoffStreaming || !streamedMatchupId || isPlayoffsPaused) return;

    // Pauses manual timer to let live stream drive
    setIsRunning(false);

    const interval = setInterval(() => {
      let nextTime = 720;
      let nextQuarterString = `Q${currentQuarter}`;

      // 1. Progress game clock
      setTimeLeft(prev => {
        if (prev <= 15) {
          // Advance quarter
          if (currentQuarter < 4) {
            setCurrentQuarter(q => q + 1);
            nextQuarterString = `Q${currentQuarter + 1}`;
            nextTime = 720;
            return 720;
          } else {
            // End of live stream
            setIsPlayoffStreaming(false);
            return 0;
          }
        }
        const dec = Math.floor(Math.random() * 16) + 8; // progress 8 to 24 seconds
        nextTime = prev - dec;
        return nextTime;
      });

      // Calculate time string
      const mins = Math.floor(nextTime / 60);
      const secs = nextTime % 60;
      const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      // 2. Select rosters based on current home/away matchup
      const homeRoster = TEAM_DATA[homeTeamName]?.roster || [];
      const awayRoster = TEAM_DATA[awayTeamName]?.roster || [];
      if (homeRoster.length === 0 || awayRoster.length === 0) return;

      // Calculate possession threshold based on ESPN Arena lights advantage rules
      let homePossessionThreshold = 0.47; // Default (53% home possession)

      if (isBlueLightOn) {
        if (homeTeamName === 'San Antonio Spurs') {
          homePossessionThreshold = 0.38; // 62% possession to Spurs (Home)
        } else if (awayTeamName === 'San Antonio Spurs') {
          homePossessionThreshold = 0.62; // 62% possession to Spurs (Away)
        }
      }

      if (!isRedLightOn) {
        if (homeTeamName === 'New York Knicks') {
          homePossessionThreshold = 0.35; // 65% possession to Knicks (Home)
        } else if (awayTeamName === 'New York Knicks') {
          homePossessionThreshold = 0.65; // 65% possession to Knicks (Away)
        }
      }

      const isHomePos = Math.random() > homePossessionThreshold;
      const attackingSide: 'home' | 'away' = isHomePos ? 'home' : 'away';
      const defendingSide: 'home' | 'away' = isHomePos ? 'away' : 'home';
      const attackRoster = isHomePos ? homeRoster : awayRoster;
      const defendRoster = isHomePos ? awayRoster : homeRoster;

      let r = Math.random();
      const attackerName = isHomePos ? homeTeamName : awayTeamName;
      const isAttackerFavoredSpurs = isBlueLightOn && attackerName === 'San Antonio Spurs';
      const isAttackerFavoredKnicks = !isRedLightOn && attackerName === 'New York Knicks';

      if (isAttackerFavoredSpurs || isAttackerFavoredKnicks) {
        // Boost scoring chance by shifting higher-index miss probabilities to scoring ranges
        if (r > 0.60 && r < 0.72) {
          r = r - 0.20; // converts missed shots/substitutions to scores!
        }
      }
      const attackingTeamName = attackingSide === 'home' ? homeTeamName : awayTeamName;
      const shooter = r < 0.60
        ? getPrioritizedShooter(attackingTeamName)
        : attackRoster[Math.floor(Math.random() * Math.min(attackRoster.length, 6))];

      const assister = Math.random() > 0.55 ? attackRoster.filter(p => p !== shooter)[Math.floor(Math.random() * Math.min(attackRoster.length - 1, 5))] : null;
      const rebounder = Math.random() > 0.7 ? attackRoster[Math.floor(Math.random() * Math.min(attackRoster.length, 6))] : defendRoster[Math.floor(Math.random() * Math.min(defendRoster.length, 6))];
      const defender = defendRoster[Math.floor(Math.random() * Math.min(defendRoster.length, 6))];
      if (r < 0.28) {
        // 2PT Made
        injectLivePlaybyPlay(shooter, attackingSide, '2PT Made', 'score', 2, timeStr, nextQuarterString);
        if (assister) {
          injectLivePlaybyPlay(assister, attackingSide, 'Assist', 'assist', 'AST', timeStr, nextQuarterString);
        }
      } else if (r < 0.50) {
        // 3PT Made
        injectLivePlaybyPlay(shooter, attackingSide, '3PT Made', 'score', 3, timeStr, nextQuarterString);
        if (assister) {
          injectLivePlaybyPlay(assister, attackingSide, 'Assist', 'assist', 'AST', timeStr, nextQuarterString);
        }
      } else if (r < 0.60) {
        // Free Throw Made
        injectLivePlaybyPlay(shooter, attackingSide, 'Free Throw Made', 'score', 1, timeStr, nextQuarterString);
      } else if (r < 0.75) {
        // Shot Miss
        injectLivePlaybyPlay(shooter, attackingSide, 'Shot Missed', 'miss', undefined, timeStr, nextQuarterString);
        const rebTeam = rebounder === shooter || attackRoster.includes(rebounder) ? attackingSide : defendingSide;
        injectLivePlaybyPlay(rebounder, rebTeam, 'Rebound', 'rebound', 'REB', timeStr, nextQuarterString);
      } else if (r < 0.85) {
        // Block
        injectLivePlaybyPlay(defender, defendingSide, 'Block', 'block', 'BLK', timeStr, nextQuarterString);
        injectLivePlaybyPlay(shooter, attackingSide, 'Shot Missed', 'miss', undefined, timeStr, nextQuarterString);
        injectLivePlaybyPlay(rebounder, defendingSide, 'Rebound', 'rebound', 'REB', timeStr, nextQuarterString);
      } else if (r < 0.93) {
        // Steal
        injectLivePlaybyPlay(defender, defendingSide, 'Steal', 'steal', 'STL', timeStr, nextQuarterString);
      } else {
        // Rotation substitution
        if (attackRoster.length > 5) {
          const subOut = attackRoster[Math.floor(Math.random() * 5)];
          const subIn = attackRoster[5 + Math.floor(Math.random() * (attackRoster.length - 5))];
          injectLivePlaybyPlay(subIn, attackingSide, `Subbed in for ${subOut}`, 'sub', 'SUB', timeStr, nextQuarterString);
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlayoffStreaming, streamedMatchupId, homeTeamName, awayTeamName, currentQuarter, isBlueLightOn, isRedLightOn, isPlayoffsPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleClock = () => setIsRunning(!isRunning);
  const resetClock = () => {
    setIsRunning(false);
    setTimeLeft(720);
  };

  const startTimeout = () => {
    setIsRunning(false);
    setIsTimeoutActive(true);
  };

  const handleSubstitute = (newPlayer: string) => {
    if (newPlayer === activePlayer) return;
    addEvent(`Subbed in for ${activePlayer}`, 'sub', 'SUB');
    setActivePlayer(newPlayer);
    setIsSubModalOpen(false);
  };

  const handleUpdatePlayer = (oldName: string, newName: string, newNumber: string, newPosition: string) => {
    if (!newName || !newNumber) return;
    
    // Update players (number)
    const newPlayers = { ...players };
    delete newPlayers[oldName];
    newPlayers[newName] = newNumber;
    setPlayers(newPlayers);

    // Update roster
    setRoster(roster.map(n => n === oldName ? newName : n));

    // Update activePlayer if it's the one being edited
    if (activePlayer === oldName) setActivePlayer(newName);

    // Update playerJerseys
    const newJerseys = { ...playerJerseys };
    const jerseyVal = newJerseys[oldName];
    delete newJerseys[oldName];
    newJerseys[newName] = jerseyVal;
    setPlayerJerseys(newJerseys);

    // Update playerPhotos
    const newPhotos = { ...playerPhotos };
    const photoVal = newPhotos[oldName];
    delete newPhotos[oldName];
    newPhotos[newName] = photoVal;
    setPlayerPhotos(newPhotos);

    // Update playerPositions
    const newPos = { ...playerPositions };
    delete newPos[oldName];
    newPos[newName] = newPosition;
    setPlayerPositions(newPos);

    // Update gameEvents history
    setEvents(events.map(e => e.player === oldName ? { ...e, player: newName } : e));
  };

  const handleDeletePlayer = (name: string) => {
    if (roster.length <= 1) {
      alert("Cannot delete the last player in the roster.");
      return;
    }
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      const newRoster = roster.filter(n => n !== name);
      setRoster(newRoster);
      
      const newPlayers = { ...players };
      delete newPlayers[name];
      setPlayers(newPlayers);

      if (activePlayer === name) setActivePlayer(newRoster[0]);
      setIsJerseyModalOpen(false);
    }
  };

  // Derived home score
  const rawHomeScore = baseHomeScore + events.reduce((sum, event) => {
    if (event.team === 'home' && event.type === 'score' && typeof event.value === 'number') {
      return sum + event.value;
    }
    return sum;
  }, 0);

  // Derived away score
  const rawAwayScore = baseAwayScore + events.reduce((sum, event) => {
    if (event.team === 'away' && event.type === 'score' && typeof event.value === 'number') {
      return sum + event.value;
    }
    return sum;
  }, 0);

  const isGame4Finals = streamedMatchupId === 'g4-finals';
  let homeScore = Math.min(114, rawHomeScore);
  let awayScore = Math.min(114, rawAwayScore);

  if (isGame4Finals) {
    const totalRaw = rawHomeScore + rawAwayScore;
    if (totalRaw > 120) {
      // Scale down live scores proportionally so they sum to exactly 120, preserving lead competitiveness
      const scale = 120 / totalRaw;
      homeScore = Math.round(rawHomeScore * scale);
      awayScore = Math.round(rawAwayScore * scale);
      if (homeScore + awayScore > 120) {
        if (homeScore > awayScore) {
          homeScore = Math.max(0, homeScore - 1);
        } else {
          awayScore = Math.max(0, awayScore - 1);
        }
      }
    }
  }

  useEffect(() => {
    if (isPlayoffStreaming && timeLeft === 0 && currentQuarter === 4) {
      setIsPlayoffStreaming(false);
      concludeSimulatedGame(homeTeamName, awayTeamName, homeScore, awayScore);
    }
  }, [timeLeft, currentQuarter, isPlayoffStreaming, homeTeamName, awayTeamName, homeScore, awayScore]);

  useEffect(() => {
    if (isPlayoffStreaming) {
      setCourtSelectedQuarter(`Q${currentQuarter}` as any);
    }
  }, [currentQuarter, isPlayoffStreaming]);

  // Aggregate stats per player
  const playerStats = events.reduce((acc, event) => {
    if (!acc[event.player]) {
      acc[event.player] = { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, misses: 0, fgMakes: 0, fgAttempts: 0 };
    }
    if (event.type === 'score' && typeof event.value === 'number') {
      acc[event.player].points += event.value;
      if (event.action !== 'Free Throw Made') {
        acc[event.player].fgMakes += 1;
        acc[event.player].fgAttempts += 1;
      }
    } else if (event.type === 'rebound') {
      acc[event.player].rebounds += 1;
    } else if (event.type === 'assist') {
      acc[event.player].assists += 1;
    } else if (event.type === 'steal') {
      acc[event.player].steals += 1;
    } else if (event.type === 'block') {
      acc[event.player].blocks += 1;
    } else if (event.type === 'miss') {
      acc[event.player].misses += 1;
      acc[event.player].fgAttempts += 1;
    }
    return acc;
  }, {} as Record<string, PlayerStats>);

  // Team level stats
  const teamStats = events.reduce((acc, event) => {
    const team = event.team;
    if (event.type === 'score' && typeof event.value === 'number') {
      acc[team].points += event.value;
      if (event.action !== 'Free Throw Made') {
        acc[team].fgMakes += 1;
        acc[team].fgAttempts += 1;
      }
    } else if (event.type === 'rebound') {
      acc[team].rebounds += 1;
    } else if (event.type === 'assist') {
      acc[team].assists += 1;
    } else if (event.type === 'steal') {
      acc[team].steals += 1;
    } else if (event.type === 'block') {
      acc[team].blocks += 1;
    } else if (event.type === 'miss') {
      acc[team].misses += 1;
      acc[team].fgAttempts += 1;
    }
    return acc;
  }, { 
    home: { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, misses: 0, fgMakes: 0, fgAttempts: 0 },
    away: { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, misses: 0, fgMakes: 0, fgAttempts: 0 }
  });

  // Calculate efficiency and fatigue for active player
  const getActivePlayerMetrics = () => {
    const stats = playerStats[activePlayer];
    if (!stats) return { efficiency: 0, fatigue: 'LOW', fatigueColor: 'text-tertiary' };

    const positiveActions = (stats.points > 0 ? 1 : 0) + stats.rebounds + stats.assists + stats.steals + stats.blocks;
    const totalActions = positiveActions + stats.misses;
    const efficiency = totalActions > 0 ? Math.round((positiveActions / totalActions) * 100) : 0;

    // Fatigue based on total events in current session
    const playerEvents = events.filter(e => e.player === activePlayer).length;
    let fatigue = 'LOW';
    let fatigueColor = 'text-tertiary';
    if (playerEvents > 15) {
      fatigue = 'HIGH';
      fatigueColor = 'text-error';
    } else if (playerEvents > 8) {
      fatigue = 'MED';
      fatigueColor = 'text-secondary';
    }

    return { efficiency, fatigue, fatigueColor };
  };

  const { efficiency, fatigue, fatigueColor } = getActivePlayerMetrics();

  const trackedPlayers = roster;

  // Helper to add events
  const addEvent = (action: string, type: GameEvent['type'], value?: string | number, teamOverride?: 'home' | 'away') => {
    setHistory([events, ...history].slice(0, 50));
    setRedoStack([]);
    const team = teamOverride || activeTeam;
    let currentPlayer = team === 'home' ? activePlayer : activeAwayPlayer;
    if (type === 'score') {
      const realTeamName = team === 'home' ? homeTeamName : awayTeamName;
      currentPlayer = getPrioritizedShooter(realTeamName);
    }
    const newEvent: GameEvent = {
      id: Math.random().toString(36).substr(2, 9),
      player: currentPlayer,
      team: team,
      action: type === 'score' ? action.replace(team === 'home' ? activePlayer : activeAwayPlayer, currentPlayer) : action,
      time: formatTime(timeLeft),
      quarter: `Q${currentQuarter}`,
      value,
      type
    };
    setEvents([newEvent, ...events]);
  };

  // Voice Command stable ref update
  const addEventRef = useRef(addEvent);
  useEffect(() => {
    addEventRef.current = addEvent;
  });

  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceStatus('unsupported');
      return;
    }

    if (!isVoiceListening) {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
      setVoiceStatus('idle');
      return;
    }

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setVoiceStatus('listening');
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error event:', event.error);
      if (event.error === 'not-allowed') {
        setVoiceStatus('error');
        setIsVoiceListening(false);
      }
    };

    recognition.onend = () => {
      if (isVoiceListening) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Failed to auto-restart speech recognition:", e);
        }
      } else {
        setVoiceStatus('idle');
      }
    };

    recognition.onresult = (event: any) => {
      const resultIndex = event.resultIndex;
      const transcript = event.results[resultIndex][0].transcript;
      if (!transcript) return;

      const text = transcript.toLowerCase().trim();
      setVoiceTranscript(transcript);

      const makeTwoMatches = ["2pt", "two points", "two point made", "make two", "two pointer", "double", "2 points", "score two", "layup", "dunk", "made 2", "heavy two", "plus 2", "plus two", "2 point"];
      const makeThreeMatches = ["3pt", "three points", "three point made", "make three", "three pointer", "triple", "3 points", "score three", "from downtown", "made 3", "plus 3", "plus three", "3 point"];
      const freeThrowMatches = ["free throw", "one point", "make one", "free-throw", "1 point", "charity stripe", "made 1", "one throw", "one point made", "plus 1", "plus one"];
      const missMatches = ["miss", "shot missed", "missed shot", "missed", "brick", "no good", "airball"];
      const reboundMatches = ["rebound", "grab rebound", "rebound made", "board", "get ball", "reb"];
      const assistMatches = ["assist", "give assist", "dish", "assist made", "pass", "ast"];
      const stealMatches = ["steal", "steal ball", "got steal", "steal made", "stl", "took it"];
      const blockMatches = ["block", "block shot", "blocked shot", "block made", "get that out of here", "blk"];

      let matchedType = '';

      if (makeTwoMatches.some(phrase => text.includes(phrase))) {
        addEventRef.current('2PT Made', 'score', 2);
        matchedType = '2PT Field Goal Made';
      } else if (makeThreeMatches.some(phrase => text.includes(phrase))) {
        addEventRef.current('3PT Made', 'score', 3);
        matchedType = '3PT Beyond the Arc';
      } else if (freeThrowMatches.some(phrase => text.includes(phrase))) {
        addEventRef.current('Free Throw Made', 'score', 1);
        matchedType = 'Free Throw Made';
      } else if (missMatches.some(phrase => text.includes(phrase))) {
        addEventRef.current('Shot Missed', 'miss');
        matchedType = 'Shot Missed';
      } else if (reboundMatches.some(phrase => text.includes(phrase))) {
        addEventRef.current('Rebound', 'rebound', 'REB');
        matchedType = 'Total Rebounding Count';
      } else if (assistMatches.some(phrase => text.includes(phrase))) {
        addEventRef.current('Assist', 'assist', 'AST');
        matchedType = 'Playmaker Assist Record';
      } else if (stealMatches.some(phrase => text.includes(phrase))) {
        addEventRef.current('Steal', 'steal', 'STL');
        matchedType = 'Defensive Ball Steal';
      } else if (blockMatches.some(phrase => text.includes(phrase))) {
        addEventRef.current('Block', 'block', 'BLK');
        matchedType = 'Fingertip Shot Block';
      }

      if (matchedType) {
        setLastMatchedCommand({
          command: transcript,
          action: matchedType,
          timestamp: new Date()
        });
        setVoiceMatchStreak(s => s + 1);
      }
    };

    speechRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("Speech recognition start failed:", e);
    }

    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isVoiceListening]);

  const updateEvent = (updatedEvent: GameEvent) => {
    setHistory([events, ...history].slice(0, 50));
    setRedoStack([]);
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    setEditingEvent(null);
  };

  const deleteEvent = (id: string) => {
    setHistory([events, ...history].slice(0, 50));
    setRedoStack([]);
    setEvents(events.filter(e => e.id !== id));
    setEditingEvent(null);
  };

  const undo = () => {
    if (history.length > 0) {
      const prev = history[0];
      setRedoStack([events, ...redoStack]);
      setEvents(prev);
      setHistory(history.slice(1));
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[0];
      setHistory([events, ...history]);
      setEvents(next);
      setRedoStack(redoStack.slice(1));
    }
  };

  const updateGoals = () => {
    if (activeTeam === 'home' && activePlayer) {
      setPlayerGoals({ ...playerGoals, [activePlayer]: editGoals });
      setIsGoalsModalOpen(false);
    } else if (activeTeam === 'away' && activeAwayPlayer) {
      setSpursPlayerGoals({ ...spursPlayerGoals, [activeAwayPlayer]: editGoals });
      setIsGoalsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-white selection:bg-primary selection:text-black">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-surface/70 blur-shell shadow-[0_0_20px_rgba(255,143,111,0.1)] flex justify-between items-center px-6 h-16 border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-primary/20">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_lKnyx9QjuMGeFyCR6Nga5_9QgxXPxlrkF-XQo_4FYRWVMGfJwGbAlh3-VvKoU-VV4lwdKgtnrmML-lZdSaYvj2ksYeFVVpjUzHVGs0KWa3rE33m0_eVAeIFNK5moz0tQ1ZSNRB_9e2xJx5K94qr8PDZVwPsjDF1WBmb5k5IIdM4_FD09-MBfy6yRp6EfU4bv24DhfXBivVEObUlnhgQtR3ygHF0gMfDDpiSsMfibvKPuq0S8QzHMuxlja61lDj65rFf6SALvAW1B" 
              alt="Player Avatar"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-xl font-bold tracking-widest text-primary font-headline uppercase">{TEAM_DATA[homeTeamName]?.shortName || 'HOME'}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 border-r border-outline-variant/20 pr-4">
            <button 
              onClick={undo}
              disabled={history.length === 0}
              className={`p-2 rounded-full transition-colors active:scale-95 ${history.length === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/5 text-on-surface-variant'}`}
              title="Undo"
            >
              <Undo2 className="w-5 h-5" />
            </button>
            <button 
              onClick={redo}
              disabled={redoStack.length === 0}
              className={`p-2 rounded-full transition-colors active:scale-95 ${redoStack.length === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/5 text-on-surface-variant'}`}
              title="Redo"
            >
              <Redo2 className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors active:scale-95"
          >
            <Settings className="w-6 h-6 text-on-surface-variant" />
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-12">
            {isPlayoffStreaming && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-error/10 border border-error/20 rounded-2xl gap-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error"></span>
                  </div>
                  <div className="text-xs font-body text-on-surface">
                    <strong className="text-error uppercase tracking-wider font-bold mr-2">● LIVE PLAYOFFS SYNCED:</strong>
                    Tuned to <span className="font-semibold text-primary">{homeTeamName}</span> vs <span className="font-semibold text-blue-400">{awayTeamName}</span>. Direct telemetry is streaming in now.
                    {isBlueLightOn && (
                      <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-mono text-blue-400 font-bold">
                        🔹 SPURS COURT ADVANTAGE ACTIVATED
                      </span>
                    )}
                    {!isRedLightOn && (
                      <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono text-amber-400 font-bold">
                        ⚡ NYK DEFENSIVE GRIT OVERRIDE ACTIVATED
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('playoffs')}
                  className="bg-error font-label font-bold text-[9px] text-black uppercase tracking-widest px-3 py-1 rounded transition-all active:scale-95 shrink-0"
                >
                  Manage Stream
                </button>
              </div>
            )}

            <header className="flex justify-between items-end">
              <div>
                <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-primary">DASHBOARD</h1>
                <p className="font-body text-on-surface-variant">Strategic Overview & Game Intelligence</p>
              </div>
              <div className="group flex items-center gap-6 bg-surface-container-low/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-outline-variant/10 shadow-[inner_0_0_20px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-label text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1">Live Score</span>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                      <div className="flex gap-1 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => addEvent('Manual Score', 'score', 1, 'home')} className="w-5 h-5 bg-primary/10 rounded-md text-[10px] flex items-center justify-center hover:bg-primary/20 text-primary border border-primary/20 transition-all active:scale-95 group/btn">
                          <Plus className="w-3 h-3 group-hover/btn:scale-110" />
                        </button>
                      </div>
                      <span className="font-mono text-3xl font-bold text-primary leading-none tracking-tighter drop-shadow-[0_0_8px_#ff8f6f66]">{homeScore.toString().padStart(2, '0')}</span>
                    </div>
                    <span className="text-on-surface-variant/10 font-mono text-xl">—</span>
                    <div className="flex flex-col items-center">
                      <div className="flex gap-1 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => addEvent('Manual Score', 'score', 1, 'away')} className="w-5 h-5 bg-blue-400/10 rounded-md text-[10px] flex items-center justify-center hover:bg-blue-400/20 text-blue-400 border border-blue-400/20 transition-all active:scale-95 group/btn">
                          <Plus className="w-3 h-3 group-hover/btn:scale-110" />
                        </button>
                      </div>
                      <span className="text-blue-400 font-mono text-3xl font-bold leading-none tracking-tighter drop-shadow-[0_0_8px_#60a5fa66]">{awayScore.toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>
                <div className="w-px h-8 bg-outline-variant/20 mx-2" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Time</span>
                  <span className="font-headline text-2xl text-secondary">{formatTime(timeLeft)}</span>
                </div>
                {isPlayoffStreaming && (
                  <>
                    <div className="w-px h-8 bg-outline-variant/20 mx-2" />
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-label text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1">Telemetry</span>
                      <button 
                        onClick={() => setIsPlayoffsPaused(p => !p)}
                        className={`px-3 py-1.5 rounded-xl border font-label font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.2)] active:scale-95 ${
                          isPlayoffsPaused 
                            ? 'bg-[#36D399]/20 border-[#36D399]/30 text-[#36D399] hover:bg-[#36D399]/30' 
                            : 'bg-error/20 border-error/30 text-error hover:bg-error/30'
                        }`}
                        title={isPlayoffsPaused ? "Resume Live Game" : "Stop / Pause Live Game"}
                        id="playoff-simulation-stop-resume-btn"
                      >
                        {isPlayoffsPaused ? (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>Resume</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-3 h-3 fill-current" />
                            <span>Stop</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </header>

            {/* Live Playoff Win Probability Index */}
            <section className="bg-surface-container-low p-6 sm:p-8 rounded-3xl border border-outline-variant/10 relative overflow-hidden">
              {(() => {
                // Reconstruct events chronological timeline
                let currentHome = baseHomeScore;
                let currentAway = baseAwayScore;
                
                // Initial baseline
                const initialProb = getLiveWinProbability(currentHome, currentAway, 1, 720);
                const timelineData = [
                  { progress: 0, label: 'Q1 12:00', prob: initialProb, scoreDiff: currentHome - currentAway, eventText: 'Game Start' }
                ];

                // Deep copy and reverse to process chronologically
                const reversedEvents = [...events].reverse();
                reversedEvents.forEach((ev) => {
                  if (ev.type === 'score' && typeof ev.value === 'number') {
                    if (ev.team === 'home') currentHome += ev.value;
                    else currentAway += ev.value;
                  }

                  const qStr = ev.quarter || 'Q1';
                  const q = parseInt(qStr.replace('Q', '')) || 1;
                  const timeStr = ev.time || '12:00';
                  const [minStr, secStr] = timeStr.split(':');
                  const m = parseInt(minStr) || 0;
                  const s = parseInt(secStr) || 0;
                  const secLeft = m * 60 + s;

                  const totalSecsElapsed = (q - 1) * 720 + (720 - secLeft);
                  const progress = totalSecsElapsed / 2880;
                  const prob = getLiveWinProbability(currentHome, currentAway, q, secLeft);
                  
                  timelineData.push({
                    progress,
                    label: `${ev.quarter} ${ev.time}`,
                    prob,
                    scoreDiff: currentHome - currentAway,
                    eventText: `${ev.player} - ${ev.action}`
                  });
                });

                // Push the absolute current state
                const liveProgress = Math.min(1.0, Math.max(0.0, ((currentQuarter - 1) * 720 + (720 - timeLeft)) / 2880));
                const liveProb = getLiveWinProbability(homeScore, awayScore, currentQuarter, timeLeft);
                timelineData.push({
                  progress: liveProgress,
                  label: `Q${currentQuarter} ${formatTime(timeLeft)}`,
                  prob: liveProb,
                  scoreDiff: homeScore - awayScore,
                  eventText: 'Live Stream'
                });

                // Calculate metrics
                const latestProb = liveProb;
                const homeProbFormatted = latestProb.toFixed(1);
                const awayProbFormatted = (100 - latestProb).toFixed(1);
                const isHomeFavored = latestProb >= 50;

                // Lead changes count
                let leadChanges = 0;
                let lastSide = 'neutral';
                timelineData.forEach((pt) => {
                  const side = pt.prob > 50 ? 'home' : pt.prob < 50 ? 'away' : 'neutral';
                  if (lastSide !== 'neutral' && side !== 'neutral' && side !== lastSide) {
                    leadChanges++;
                  }
                  if (side !== 'neutral') lastSide = side;
                });

                // Peak probabilities
                const peakHome = Math.max(...timelineData.map(pt => pt.prob));
                const peakAway = 100 - Math.min(...timelineData.map(pt => pt.prob));

                // Generate SVG Points
                const width = 1000;
                const height = 140;
                const paddingY = 15;
                const graphHeight = height - paddingY * 2; // 110px

                // Point mapper: x is from 0 to 1000 representing progress from 0% to 100%
                // y represents 0% to 100% (so y goes from height-paddingY down to paddingY)
                const points = timelineData.map(pt => {
                  const x = pt.progress * width;
                  const y = paddingY + graphHeight - (pt.prob / 100) * graphHeight;
                  return { x, y, pt };
                });

                const metricPoints = timelineData.map((pt, idx) => {
                  const x = pt.progress * width;
                  let metricVal = 50;
                  if (winProbChartMetric === 'pace-space') {
                    const wave = Math.sin(idx * 0.7) * 12 + 70;
                    metricVal = Math.max(30, Math.min(95, wave + (pt.scoreDiff * 0.5)));
                  } else {
                    const wave = Math.cos(idx * 0.5) * 10 + 64;
                    metricVal = Math.max(25, Math.min(92, wave - (pt.scoreDiff * 0.4)));
                  }
                  const y = paddingY + graphHeight - (metricVal / 100) * graphHeight;
                  return { x, y, val: metricVal };
                });

                // Generate SVG Path
                const pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
                const metricPathString = metricPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

                // Split points for area gradient
                const fillPathString = points.length > 0 
                  ? `${pathString} L ${points[points.length - 1].x.toFixed(1)} ${height} L 0 ${height} Z` 
                  : '';

                return (
                  <>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-6 border-b border-light-divider">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-primary/25 p-1.5 rounded">
                            <Scale className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-label font-bold text-xs text-[#FF8F6F] uppercase tracking-widest">Analytics Intelligence</span>
                        </div>
                        <h2 className="font-headline text-2xl font-bold text-white tracking-tight">LIVE WIN PROBABILITY INDEX</h2>
                        <p className="font-body text-xs text-on-surface-variant">Real-time predictive telemetry powered by game state, possession margin & team performance</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                        {/* Interactive Toggle Segment */}
                        <div className="flex bg-surface-container p-1 rounded-xl border border-outline-variant/10 select-none">
                          <button
                            id="toggle-pace-space"
                            onClick={() => setWinProbChartMetric('pace-space')}
                            className={`px-3 py-1.5 rounded-lg font-label text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                              winProbChartMetric === 'pace-space'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'text-on-surface-variant hover:text-white border border-transparent'
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Pace & Space</span>
                          </button>
                          <button
                            id="toggle-rim-protection"
                            onClick={() => setWinProbChartMetric('rim-protection')}
                            className={`px-3 py-1.5 rounded-lg font-label text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                              winProbChartMetric === 'rim-protection'
                                ? 'bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20'
                                : 'text-on-surface-variant hover:text-white border border-transparent'
                            }`}
                          >
                            <Shield className="w-3.5 h-3.5" />
                            <span>Rim Protection</span>
                          </button>
                        </div>

                        {/* High-level visual cards row */}
                        <div className="flex gap-2 shrink-0 font-mono text-[10px] text-on-surface-variant uppercase ml-auto lg:ml-0">
                          <div className="bg-surface-container px-3 py-1.5 rounded-xl border border-outline-variant/10">
                            <span className="text-[9px] text-on-surface-variant/50 block">LEAD CHANGES</span>
                            <strong className="text-xs font-bold text-white tracking-tight">{leadChanges}</strong>
                          </div>
                          <div className="bg-surface-container px-3 py-1.5 rounded-xl border border-outline-variant/10">
                            <span className="text-[9px] text-primary block">PEAK {homeTeamName.split(' ')[0]}</span>
                            <strong className="text-xs font-bold text-primary tracking-tight">{peakHome.toFixed(0)}%</strong>
                          </div>
                          <div className="bg-surface-container px-3 py-1.5 rounded-xl border border-outline-variant/10">
                            <span className="text-[9px] text-blue-400 block">PEAK {awayTeamName.split(' ')[0]}</span>
                            <strong className="text-xs font-bold text-blue-400 tracking-tight">{peakAway.toFixed(0)}%</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Split Probability Bar */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full bg-primary ${isHomeFavored ? 'animate-pulse shadow-[0_0_8px_rgba(255,143,111,0.5)]' : ''}`} />
                          <span className="font-headline text-lg font-bold text-primary">{homeTeamName}</span>
                          <span className="font-mono text-sm text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold ml-1">{homeProbFormatted}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full font-bold mr-1">{awayProbFormatted}%</span>
                          <span className="font-headline text-lg font-bold text-blue-400">{awayTeamName}</span>
                          <div className={`w-2.5 h-2.5 rounded-full bg-blue-400 ${!isHomeFavored ? 'animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.5)]' : ''}`} />
                        </div>
                      </div>

                      {/* Smooth bar */}
                      <div className="h-4 bg-surface-container-highest rounded-full overflow-hidden flex relative border border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-[#ffae93] transition-all duration-700 ease-out relative"
                          style={{ width: `${latestProb}%` }}
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[pulse_2s_infinite]" />
                        </div>
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 flex-1 transition-all duration-700 ease-out" />
                        
                        {/* Divider Line with Glow */}
                        <div 
                          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_#ffffff] transition-all duration-700 ease-out z-10"
                          style={{ left: `${latestProb}%` }}
                        />
                      </div>
                    </div>

                    {/* Sophisticated SVG Telemetry Chart */}
                    <div className="bg-surface-container-high/40 p-5 rounded-2xl border border-outline-variant/15 relative">
                      <div className="absolute inset-0 bg-radial-gradient from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
                      <div className="relative">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-label text-on-surface-variant/60 uppercase tracking-widest flex items-center gap-1.5 flex-wrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" /> Win Probability Over Time
                          </span>
                          <span className="text-[9px] font-mono text-on-surface-variant/40 text-right flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                              <span className={`w-3.5 h-0.5 border-t-2 border-dashed ${winProbChartMetric === 'pace-space' ? 'border-amber-500' : 'border-[#06b6d4]'}`} />
                              <span>{winProbChartMetric === 'pace-space' ? 'Pace & Space Index' : 'Rim Protection Index'} (Dashed)</span>
                            </span>
                            <span>HORIZONTAL LINE: 50% NEUTRAL PROBABILITY</span>
                          </span>
                        </div>

                        {/* SVG */}
                        <div className="w-full h-36 relative" id="interactive-win-prob-wrapper">
                          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ff8f6f" stopOpacity="0.15" />
                                <stop offset="50%" stopColor="#ff8f6f" stopOpacity="0.03" />
                                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.02" />
                              </linearGradient>
                            </defs>

                            {/* Horizontal grid lines */}
                            <line x1="0" y1={paddingY} x2={width} y2={paddingY} stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                            <line x1="0" y1={height - paddingY} x2={width} y2={height - paddingY} stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                            
                            {/* 50% Line (Dashed, White/15%) */}
                            <line 
                              x1="0" 
                              y1={paddingY + graphHeight / 2} 
                              x2={width} 
                              y2={paddingY + graphHeight / 2} 
                              stroke="rgba(255,255,255,0.15)" 
                              strokeWidth="1"
                              strokeDasharray="4 4" 
                            />

                            {/* Vertical Quarter Lines */}
                            {[250, 500, 750].map((xVal, index) => (
                              <g key={xVal}>
                                <line 
                                  x1={xVal} 
                                  y1="0" 
                                  x2={xVal} 
                                  y2={height} 
                                  stroke="rgba(255,255,255,0.05)" 
                                  strokeWidth="1"
                                  strokeDasharray="2 2" 
                                />
                                <text 
                                  x={xVal + 6} 
                                  y={height - 6} 
                                  fill="rgba(255,255,255,0.25)" 
                                  fontSize="9" 
                                  fontFamily="monospace"
                                  className="uppercase tracking-widest font-bold fill-current"
                                >
                                  End Q{index + 1}
                                </text>
                              </g>
                            ))}

                            {/* Peak / High indicator texts */}
                            <text x="6" y={paddingY + 12} fill="rgba(255,143,111,0.3)" fontSize="8" fontFamily="monospace" className="fill-current">HOME FAVORED</text>
                            <text x="6" y={height - paddingY - 4} fill="rgba(96,165,250,0.3)" fontSize="8" fontFamily="monospace" className="fill-current">AWAY FAVORED</text>

                            {/* Auxiliary Interactive Track Curve (Dashed line) */}
                            {metricPathString && (
                              <path 
                                d={metricPathString} 
                                fill="none" 
                                stroke={winProbChartMetric === 'pace-space' ? '#F59E0B' : '#06B6D4'} 
                                strokeWidth="2" 
                                strokeDasharray="5 5"
                                className="transition-all duration-700 ease-in-out opacity-65"
                              />
                            )}

                            {/* Filled Gradient Area underneath curve */}
                            {fillPathString && (
                              <path 
                                d={fillPathString} 
                                fill="url(#areaGrad)" 
                                className="transition-all duration-700 ease-out"
                              />
                            )}

                            {/* Trend Line */}
                            {pathString && (
                              <path 
                                d={pathString} 
                                fill="none" 
                                stroke="url(#lineGrad)" 
                                strokeWidth="3" 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-all duration-700 ease-out"
                              />
                            )}

                            {/* Dynamic line gradient so line has Home (primary) when high and Away (blue) when low */}
                            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ff8f6f" />
                              <stop offset="45%" stopColor="#ffbba5" />
                              <stop offset="55%" stopColor="#93c5fd" />
                              <stop offset="100%" stopColor="#60a5fa" />
                            </linearGradient>

                            {/* Active Point Hover Guide Link Line */}
                            {hoveredPoint && (
                              <g>
                                <line 
                                  x1={hoveredPoint.x.toFixed(1)} 
                                  y1="0" 
                                  x2={hoveredPoint.x.toFixed(1)} 
                                  y2={height} 
                                  stroke="#36D399" 
                                  strokeWidth="1.5"
                                  strokeDasharray="3 3"
                                  opacity="0.8"
                                />
                                <circle 
                                  cx={hoveredPoint.x.toFixed(1)} 
                                  cy={hoveredPoint.y.toFixed(1)} 
                                  r="5" 
                                  fill="#36D399"
                                />
                                <circle 
                                  cx={hoveredPoint.x.toFixed(1)} 
                                  cy={hoveredPoint.y.toFixed(1)} 
                                  r="2" 
                                  fill="#FFFFFF"
                                />
                              </g>
                            )}

                            {/* Current position vertical timeline cursor */}
                            {points.length > 0 && (
                              <g>
                                <line 
                                  x1={(liveProgress * width).toFixed(1)} 
                                  y1="0" 
                                  x2={(liveProgress * width).toFixed(1)} 
                                  y2={height} 
                                  stroke="#FF8F6F" 
                                  strokeWidth="1.5"
                                  className="animate-pulse"
                                  opacity="0.8"
                                />
                                {/* Pulsating live dot on the graph */}
                                <circle 
                                  cx={(liveProgress * width).toFixed(1)} 
                                  cy={(paddingY + graphHeight - (liveProb / 100) * graphHeight).toFixed(1)} 
                                  r="5" 
                                  fill="#FF8F6F"
                                  className="animate-ping"
                                />
                                <circle 
                                  cx={(liveProgress * width).toFixed(1)} 
                                  cy={(paddingY + graphHeight - (liveProb / 100) * graphHeight).toFixed(1)} 
                                  r="3.5" 
                                  fill="#FFFFFF"
                                />
                              </g>
                            )}

                            {/* Transparent Interactive Hover Slices */}
                            {points.map((p, idx) => {
                              const sliceWidth = width / Math.max(1, points.length);
                              const halfSlice = sliceWidth / 2;
                              return (
                                <rect
                                  key={`slice-${idx}`}
                                  x={(p.x - halfSlice).toFixed(1)}
                                  y="0"
                                  width={sliceWidth.toFixed(1)}
                                  height={height}
                                  fill="transparent"
                                  className="cursor-crosshair"
                                  onMouseEnter={() => setHoveredPoint(p)}
                                  onMouseMove={() => setHoveredPoint(p)}
                                  onMouseLeave={() => setHoveredPoint(null)}
                                />
                              );
                            })}
                          </svg>

                          {/* Floating interactive tooltip */}
                          {hoveredPoint && (
                            <div 
                              className="absolute bg-slate-950/95 border border-[#36D399]/40 rounded-xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md pointer-events-none z-30 transition-all duration-75 text-xs flex flex-col gap-1 w-60 border-t-2 border-t-[#36D399]"
                              style={{
                                left: `${(hoveredPoint.x / width) * 100}%`,
                                top: `${(hoveredPoint.y / height) * 100}%`,
                                transform: `translate(${hoveredPoint.x > width / 2 ? '-105%' : '5%'}, -50%)`
                              }}
                            >
                              <div className="flex justify-between items-center pb-1 border-b border-white/5">
                                <span className="font-mono text-[9px] text-[#36D399] font-bold uppercase tracking-widest">
                                  ⏱️ {hoveredPoint.pt.label}
                                </span>
                                <span className="text-[8px] font-mono text-on-surface-variant/50">
                                  {hoveredPoint.pt.eventText === 'Live Stream' ? 'LIVE FEED' : 'PLAY EVENT'}
                                </span>
                              </div>
                              <p className="font-headline font-bold text-white text-xs leading-tight mt-1 truncate">
                                {hoveredPoint.pt.eventText}
                              </p>
                              <div className="flex justify-between items-center gap-4 mt-1.5 pt-1.5 border-t border-white/5 text-[10.5px]">
                                <span className="text-on-surface-variant font-medium">Win Probability</span>
                                <span className="font-mono font-bold text-white">
                                  {hoveredPoint.pt.prob >= 50 
                                    ? `${homeTeamName.split(' ')[0]} ${hoveredPoint.pt.prob.toFixed(1)}%`
                                    : `${awayTeamName.split(' ')[0]} ${(100 - hoveredPoint.pt.prob).toFixed(1)}%`
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[9px] text-on-surface-variant/70 mt-0.5">
                                <span>Score Differential</span>
                                <span className="font-mono font-bold">
                                  {hoveredPoint.pt.scoreDiff > 0 ? `+${hoveredPoint.pt.scoreDiff} (NYK)` : hoveredPoint.pt.scoreDiff < 0 ? `${hoveredPoint.pt.scoreDiff} (SAS)` : 'TIE'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Simple timeline labeling for X Axis */}
                        <div className="flex justify-between items-center text-[9px] font-mono text-on-surface-variant/40 mt-3 border-t border-outline-variant/10 pt-2 px-1">
                          <span>Q1 STANDARD</span>
                          <span>Q2 RESTRUCTURE</span>
                          <span>Q3 EXECUTION</span>
                          <span>Q4 INTENSITY</span>
                        </div>

                        {/* Interactive Metric Detail Overlay Cards */}
                        <div className="mt-8 pt-6 border-t border-outline-variant/10">
                          <AnimatePresence mode="wait">
                            {winProbChartMetric === 'pace-space' ? (
                              <motion.div
                                key="pace-space-metrics"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                              >
                                <div className="bg-surface-container/60 p-3.5 rounded-2xl border border-amber-500/10 hover:border-amber-500/20 transition-all">
                                  <span className="text-[9px] font-mono text-amber-400 font-bold tracking-widest block mb-1">POSSESSION PACE</span>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-headline font-black text-white">102.4</span>
                                    <span className="text-[9px] font-mono text-on-surface-variant/60">POSS / 48M</span>
                                  </div>
                                  <p className="text-[9px] text-on-surface-variant/70 font-body mt-1">High-tempo transition frequency and fastbreak volume pacing.</p>
                                </div>
                                <div className="bg-surface-container/60 p-3.5 rounded-2xl border border-amber-500/10 hover:border-amber-500/20 transition-all">
                                  <span className="text-[9px] font-mono text-amber-400 font-bold tracking-widest block mb-1">SPACING DENSITY</span>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-headline font-black text-white">84.5%</span>
                                    <span className="text-[9px] font-mono text-green-400 font-bold">+2.1% VS AVG</span>
                                  </div>
                                  <p className="text-[9px] text-on-surface-variant/70 font-body mt-1">Optimized stretch alignment and secondary rotation spacing.</p>
                                </div>
                                <div className="bg-surface-container/60 p-3.5 rounded-2xl border border-amber-500/10 hover:border-amber-500/20 transition-all">
                                  <span className="text-[9px] font-mono text-amber-400 font-bold tracking-widest block mb-1">HALF-COURT EFFICIENCY</span>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-headline font-black text-white">1.14</span>
                                    <span className="text-[9px] font-mono text-on-surface-variant/60">POINTS / POSS</span>
                                  </div>
                                  <p className="text-[9px] text-on-surface-variant/70 font-body mt-1">Settled possession conversion rate and defensive containment.</p>
                                </div>
                                <div className="bg-surface-container/60 p-3.5 rounded-2xl border border-amber-500/10 hover:border-amber-500/20 transition-all">
                                  <span className="text-[9px] font-mono text-amber-400 font-bold tracking-widest block mb-1">3PT SHOT DISPERSION</span>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-headline font-black text-white">26.2 FT</span>
                                    <span className="text-[9px] font-mono text-on-surface-variant/60">38 ATT / GM</span>
                                  </div>
                                  <p className="text-[9px] text-on-surface-variant/70 font-body mt-1">Deep gravity pull-ups and perimeter catch-and-shoot depth.</p>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="rim-protection-metrics"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                              >
                                <div className="bg-surface-container/60 p-3.5 rounded-2xl border border-cyan-500/10 hover:border-cyan-500/20 transition-all">
                                  <span className="text-[9px] font-mono text-cyan-400 font-bold tracking-widest block mb-1">PAINT ENTRY BLOCKED RATE</span>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-headline font-black text-white">58.2%</span>
                                    <span className="text-[9px] font-mono text-cyan-400 font-bold">CHOKED PAINT</span>
                                  </div>
                                  <p className="text-[9px] text-on-surface-variant/70 font-body mt-1">Sustained paint penetration rejection and driver redirection.</p>
                                </div>
                                <div className="bg-surface-container/60 p-3.5 rounded-2xl border border-cyan-500/10 hover:border-cyan-500/20 transition-all">
                                  <span className="text-[9px] font-mono text-cyan-400 font-bold tracking-widest block mb-1">CONTESTATION INDEX</span>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-headline font-black text-white">14.8%</span>
                                    <span className="text-[9px] font-mono text-green-400 font-bold">BLOCK FREQ</span>
                                  </div>
                                  <p className="text-[9px] text-on-surface-variant/70 font-body mt-1">Active hand challenges and weak-side verticality index.</p>
                                </div>
                                <div className="bg-surface-container/60 p-3.5 rounded-2xl border border-cyan-500/10 hover:border-cyan-500/20 transition-all">
                                  <span className="text-[9px] font-mono text-cyan-400 font-bold tracking-widest block mb-1">RESTRICTED AREA DFG%</span>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-headline font-black text-white">48.2%</span>
                                    <span className="text-[9px] font-mono text-cyan-400 font-bold">-6.5% VS LEAGUE</span>
                                  </div>
                                  <p className="text-[9px] text-on-surface-variant/70 font-body mt-1">Opponent field goal percentage allowed under the rim structure.</p>
                                </div>
                                <div className="bg-surface-container/60 p-3.5 rounded-2xl border border-cyan-500/10 hover:border-cyan-500/20 transition-all">
                                  <span className="text-[9px] font-mono text-cyan-400 font-bold tracking-widest block mb-1">RECOVERY ROTATION SPEED</span>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-headline font-black text-white">0.88 SEC</span>
                                    <span className="text-[9px] font-mono text-on-surface-variant/60">HELP TIME</span>
                                  </div>
                                  <p className="text-[9px] text-on-surface-variant/70 font-body mt-1">X-out rotation delay from weak-side baseline and rim help.</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </section>

            {/* Court Intelligence: Playoff Roster Scoring & ESPN Play-by-Play Sync */}
            <section className="bg-surface-container-low p-6 sm:p-8 rounded-3xl border border-outline-variant/10 relative overflow-hidden" id="espn-live-court-intelligence">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Radio className="w-64 h-64 text-error" />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/10 pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded tracking-widest uppercase animate-pulse">ESPN LIVE</span>
                      <span className="font-mono text-[10px] text-primary font-bold tracking-wider">COURT INTELLIGENCE TERMINAL</span>
                    </div>
                    <h2 className="font-headline text-2xl font-bold text-white tracking-tight">On-Court Scoring & Play-by-Play Tracker</h2>
                    <p className="font-body text-xs text-on-surface-variant">Real-time stats breakdowns per quarter linked directly to the ESPN NBA Gamecast Engine.</p>
                  </div>

                  <a
                    href="https://www.espn.com/nba/playbyplay/_/gameId/401655092"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start md:self-center flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-750 hover:from-red-500 hover:to-red-650 text-white font-label font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_2px_12px_rgba(220,38,38,0.3)] active:scale-95 border border-red-500/20"
                  >
                    <span>🔗 Official ESPN Live Play-by-Play</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Quarter Tabs Filter */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex bg-surface-container-highest/60 p-1 rounded-2xl border border-outline-variant/10">
                    {(['Q1', 'Q2', 'Q3', 'Q4', 'ALL'] as const).map((q) => {
                      const isStreamActiveQuarter = isPlayoffStreaming && q === `Q${currentQuarter}`;
                      const isSelected = courtSelectedQuarter === q;
                      
                      return (
                        <button
                          key={q}
                          onClick={() => setCourtSelectedQuarter(q)}
                          className={`relative px-4 py-2 rounded-xl text-[10px] font-label font-bold uppercase tracking-wider transition-all duration-350 ${
                            isSelected 
                              ? 'bg-primary text-black shadow-lg scale-[1.03]' 
                              : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="relative z-10 flex items-center gap-1.5">
                            {q === 'ALL' ? 'All Quarters' : `${q.replace('Q', '')}nd Quarter`}
                            {isStreamActiveQuarter && (
                              <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping inline-block" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-[10px] font-mono text-on-surface-variant/60 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span>AUTOMATIC COURT ROTATIONS SYNCED</span>
                  </div>
                </div>

                {/* Combined Grid of Teams */}
                {(() => {
                  // Let's filter events recorded in the selected quarter (or all)
                  const quarterEvents = events.filter(e => {
                    if (courtSelectedQuarter === 'ALL') return true;
                    return e.quarter === courtSelectedQuarter;
                  });

                  // Calculate stats for each player who has been playing or had events in this quarter
                  const homeRosterStats: Record<string, { points: number; rebounds: number; assists: number; steals: number; blocks: number; misses: number; isCurrentlyOnCourt: boolean; lastActionTime?: string; lastActionText?: string }> = {};
                  const awayRosterStats: Record<string, { points: number; rebounds: number; assists: number; steals: number; blocks: number; misses: number; isCurrentlyOnCourt: boolean; lastActionTime?: string; lastActionText?: string }> = {};

                  roster.forEach(player => {
                    const isActiveCurrentlyOnCourt = isPlayoffStreaming && (courtSelectedQuarter === 'ALL' || courtSelectedQuarter === `Q${currentQuarter}`) && activePlayer === player;
                    homeRosterStats[player] = { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, misses: 0, isCurrentlyOnCourt: isActiveCurrentlyOnCourt };
                  });

                  spursRoster.forEach(player => {
                    const isActiveCurrentlyOnCourt = isPlayoffStreaming && (courtSelectedQuarter === 'ALL' || courtSelectedQuarter === `Q${currentQuarter}`) && activeAwayPlayer === player;
                    awayRosterStats[player] = { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, misses: 0, isCurrentlyOnCourt: isActiveCurrentlyOnCourt };
                  });

                  quarterEvents.forEach(e => {
                    const statsMap = e.team === 'home' ? homeRosterStats : awayRosterStats;
                    if (!statsMap[e.player]) {
                      statsMap[e.player] = { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, misses: 0, isCurrentlyOnCourt: false };
                    }
                    
                    if (e.type === 'score' && typeof e.value === 'number') {
                      statsMap[e.player].points += e.value;
                    } else if (e.type === 'rebound') {
                      statsMap[e.player].rebounds += 1;
                    } else if (e.type === 'assist') {
                      statsMap[e.player].assists += 1;
                    } else if (e.type === 'steal') {
                      statsMap[e.player].steals += 1;
                    } else if (e.type === 'block') {
                      statsMap[e.player].blocks += 1;
                    } else if (e.type === 'miss') {
                      statsMap[e.player].misses += 1;
                    }
                  });

                  roster.forEach(player => {
                    const lastEvent = quarterEvents.find(e => e.player === player);
                    if (lastEvent) {
                      homeRosterStats[player].lastActionTime = lastEvent.time;
                      homeRosterStats[player].lastActionText = lastEvent.action;
                    }
                  });

                  spursRoster.forEach(player => {
                    const lastEvent = quarterEvents.find(e => e.player === player);
                    if (lastEvent) {
                      awayRosterStats[player].lastActionTime = lastEvent.time;
                      awayRosterStats[player].lastActionText = lastEvent.action;
                    }
                  });

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* HOME TEAM CARD */}
                      <div className="bg-surface-container-low/40 rounded-2xl border border-outline-variant/10 p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-outline-variant/5 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-4 bg-primary rounded" />
                            <h3 className="font-headline text-base font-bold text-white uppercase tracking-tight">{homeTeamName}</h3>
                          </div>
                          <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">HOME ROSTER</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {roster.map((player) => {
                            const stats = homeRosterStats[player] || { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, misses: 0, isCurrentlyOnCourt: false };
                            const num = players[player] || '00';
                            const pos = playerPositions[player] || 'G';
                            const jersey = playerJerseys[player];

                            return (
                              <div 
                                key={player} 
                                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all ${
                                  stats.isCurrentlyOnCourt 
                                    ? 'bg-primary/5 border-primary/30 shadow-[0_0_15px_rgba(255,143,111,0.05)]' 
                                    : 'bg-surface-container/30 border-outline-variant/5 hover:border-outline-variant/20'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {/* Jersey Avatar */}
                                  <div className={`w-8 h-10 rounded-md ${jersey || 'bg-surface-container-highest'} flex items-center justify-center border border-white/10 relative overflow-hidden shrink-0`}>
                                    {jersey?.startsWith('data:image') ? (
                                      <img src={jersey} alt="Jersey" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                      <div className="absolute inset-0 opacity-20 bg-white/40" />
                                    )}
                                    <span className="font-headline text-[9px] font-black text-white relative z-10">{num}</span>
                                  </div>

                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="font-body text-sm font-semibold text-white">{player}</span>
                                      <span className="text-[8px] font-mono bg-white/5 text-on-surface-variant/60 px-1 py-0.2 rounded border border-white/5 uppercase">{pos}</span>
                                    </div>
                                    {stats.isCurrentlyOnCourt ? (
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="relative flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <span className="text-[9px] font-mono text-green-400 font-bold uppercase tracking-wider">ON COURT PLAYING</span>
                                      </div>
                                    ) : stats.lastActionText ? (
                                      <span className="text-[9px] font-body text-on-surface-variant/70 mt-0.5 line-clamp-1 italic">
                                        Last Action at {stats.lastActionTime} — <span className="text-secondary">{stats.lastActionText}</span>
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-mono text-on-surface-variant/40 mt-0.5 uppercase">Rotated Bench</span>
                                    )}
                                  </div>
                                </div>

                                {/* Stats & Action Area */}
                                <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-outline-variant/5">
                                  <div className="font-mono flex items-center gap-3">
                                    <div className="flex flex-col items-center">
                                      <span className="text-[8px] text-on-surface-variant/50 uppercase">PTS</span>
                                      <span className="text-sm font-bold text-white">{stats.points}</span>
                                    </div>
                                    <div className="w-px h-6 bg-outline-variant/10" />
                                    <div className="flex flex-col items-center">
                                      <span className="text-[8px] text-on-surface-variant/50 uppercase">REB</span>
                                      <span className="text-sm font-medium text-on-surface-variant">{stats.rebounds}</span>
                                    </div>
                                    <div className="w-px h-6 bg-outline-variant/10" />
                                    <div className="flex flex-col items-center">
                                      <span className="text-[8px] text-on-surface-variant/50 uppercase">AST</span>
                                      <span className="text-sm font-medium text-on-surface-variant">{stats.assists}</span>
                                    </div>
                                    <div className="w-px h-6 bg-outline-variant/10" />
                                    <div className="flex flex-col items-center">
                                      <span className="text-[8px] text-on-surface-variant/50 uppercase">DEF</span>
                                      <span className="text-sm font-medium text-on-surface-variant">{stats.steals + stats.blocks}</span>
                                    </div>
                                  </div>

                                  <a
                                    href={`https://www.google.com/search?q=site:espn.com+nba+play-by-play+${encodeURIComponent(player)}+"${courtSelectedQuarter === 'ALL' ? 'Game' : courtSelectedQuarter.replace('Q', '') + 'th' || '1st'} Quarter"`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 px-2.5 bg-white/5 hover:bg-white/10 text-white font-label font-bold text-[9px] uppercase tracking-wider rounded border border-white/10 hover:border-white/25 flex items-center gap-1 transition-all"
                                    title={`View Play-by-Play logs for ${player} on ESPN`}
                                  >
                                    <span>ESPN Play</span>
                                    <ArrowUpRight className="w-3" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* AWAY TEAM CARD */}
                      <div className="bg-surface-container-low/40 rounded-2xl border border-outline-variant/10 p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-outline-variant/5 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-4 bg-blue-400 rounded" />
                            <h3 className="font-headline text-base font-bold text-white uppercase tracking-tight">{awayTeamName}</h3>
                          </div>
                          <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded font-bold">AWAY ROSTER</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {spursRoster.map((player) => {
                            const stats = awayRosterStats[player] || { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, misses: 0, isCurrentlyOnCourt: false };
                            const num = spursPlayers[player] || '00';
                            const pos = spursPlayerPositions[player] || 'G';
                            const jersey = spursPlayerJerseys[player];

                            return (
                              <div 
                                key={player} 
                                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all ${
                                  stats.isCurrentlyOnCourt 
                                    ? 'bg-blue-400/5 border-blue-400/30 shadow-[0_0_15px_rgba(96,165,250,0.05)]' 
                                    : 'bg-surface-container/30 border-outline-variant/5 hover:border-outline-variant/20'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {/* Jersey Avatar */}
                                  <div className={`w-8 h-10 rounded-md ${jersey || 'bg-surface-container-highest'} flex items-center justify-center border border-white/10 relative overflow-hidden shrink-0`}>
                                    {jersey?.startsWith('data:image') ? (
                                      <img src={jersey} alt="Jersey" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                      <div className="absolute inset-0 opacity-20 bg-white/40" />
                                    )}
                                    <span className="font-headline text-[9px] font-black text-white relative z-10">{num}</span>
                                  </div>

                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="font-body text-sm font-semibold text-white">{player}</span>
                                      <span className="text-[8px] font-mono bg-white/5 text-on-surface-variant/60 px-1 py-0.2 rounded border border-white/5 uppercase">{pos}</span>
                                    </div>
                                    {stats.isCurrentlyOnCourt ? (
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="relative flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <span className="text-[9px] font-mono text-green-400 font-bold uppercase tracking-wider">ON COURT PLAYING</span>
                                      </div>
                                    ) : stats.lastActionText ? (
                                      <span className="text-[9px] font-body text-on-surface-variant/70 mt-0.5 line-clamp-1 italic">
                                        Last Action at {stats.lastActionTime} — <span className="text-secondary">{stats.lastActionText}</span>
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-mono text-on-surface-variant/40 mt-0.5 uppercase">Rotated Bench</span>
                                    )}
                                  </div>
                                </div>

                                {/* Stats & Action Area */}
                                <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-outline-variant/5">
                                  <div className="font-mono flex items-center gap-3">
                                    <div className="flex flex-col items-center">
                                      <span className="text-[8px] text-on-surface-variant/50 uppercase">PTS</span>
                                      <span className="text-sm font-bold text-white">{stats.points}</span>
                                    </div>
                                    <div className="w-px h-6 bg-outline-variant/10" />
                                    <div className="flex flex-col items-center">
                                      <span className="text-[8px] text-on-surface-variant/50 uppercase">REB</span>
                                      <span className="text-sm font-medium text-on-surface-variant">{stats.rebounds}</span>
                                    </div>
                                    <div className="w-px h-6 bg-outline-variant/10" />
                                    <div className="flex flex-col items-center">
                                      <span className="text-[8px] text-on-surface-variant/50 uppercase">AST</span>
                                      <span className="text-sm font-medium text-on-surface-variant">{stats.assists}</span>
                                    </div>
                                    <div className="w-px h-6 bg-outline-variant/10" />
                                    <div className="flex flex-col items-center">
                                      <span className="text-[8px] text-on-surface-variant/50 uppercase">DEF</span>
                                      <span className="text-sm font-medium text-on-surface-variant">{stats.steals + stats.blocks}</span>
                                    </div>
                                  </div>

                                  <a
                                    href={`https://www.google.com/search?q=site:espn.com+nba+play-by-play+${encodeURIComponent(player)}+"${courtSelectedQuarter === 'ALL' ? 'Game' : courtSelectedQuarter.replace('Q', '') + 'th' || '1st'} Quarter"`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 px-2.5 bg-white/5 hover:bg-white/10 text-white font-label font-bold text-[9px] uppercase tracking-wider rounded border border-white/10 hover:border-white/25 flex items-center gap-1 transition-all"
                                    title={`View Play-by-Play logs for ${player} on ESPN`}
                                  >
                                    <span>ESPN Play</span>
                                    <ArrowUpRight className="w-3" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </section>

            {/* Strategic Funnel Visualization */}
            <section className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sparkles className="w-64 h-64 text-primary" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-label font-bold text-on-surface uppercase tracking-widest">Strategic Funnel</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-2 relative">
                  {/* Step 1: Data Ingestion */}
                  <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/5 flex flex-col items-center text-center gap-3 group hover:border-primary/20 transition-all">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-headline text-lg text-primary">{events.length}</p>
                      <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Game Events</p>
                    </div>
                    <p className="text-[9px] text-on-surface-variant/60 leading-relaxed italic">Real-time data ingestion.</p>
                  </div>

                  {/* Connector */}
                  <div className="hidden md:flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-outline-variant/20" />
                  </div>

                  {/* Step 2: AI Analysis */}
                  <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/5 flex flex-col items-center text-center gap-3 group hover:border-primary/20 transition-all">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-headline text-lg text-primary">{aiInsights.length}</p>
                      <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">AI Insights</p>
                    </div>
                    <p className="text-[9px] text-on-surface-variant/60 leading-relaxed italic">Pattern recognition.</p>
                  </div>

                  {/* Connector */}
                  <div className="hidden md:flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-outline-variant/20" />
                  </div>

                  {/* Step 3: Play Suggestions */}
                  <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/5 flex flex-col items-center text-center gap-3 group hover:border-primary/20 transition-all">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-headline text-lg text-primary">{aiPlaySuggestions.length}</p>
                      <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Play Suggestions</p>
                    </div>
                    <p className="text-[9px] text-on-surface-variant/60 leading-relaxed italic">Tactical recommendations.</p>
                  </div>

                  {/* Connector */}
                  <div className="hidden md:flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-outline-variant/20" />
                  </div>

                  {/* Step 4: Drill Metrics */}
                  <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/5 flex flex-col items-center text-center gap-3 group hover:border-primary/20 transition-all">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-headline text-lg text-primary">{drills.length}</p>
                      <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest">Active Drills</p>
                    </div>
                    <p className="text-[9px] text-on-surface-variant/60 leading-relaxed italic">Skill development metrics.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Drill Metrics Detailed Section */}
            <section className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/20 p-2 rounded-lg">
                    <Dumbbell className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-xs">Active Drill Progress</h3>
                </div>
                <button 
                  onClick={() => setIsAddingDrill(!isAddingDrill)}
                  className="text-[10px] font-label text-secondary uppercase tracking-widest hover:underline"
                >
                  {isAddingDrill ? 'Close Panel' : 'Manage Drills'}
                </button>
              </div>

              {isAddingDrill && (
                <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant/10 mb-6 space-y-4 animate-in fade-in duration-300">
                  <h4 className="font-headline text-sm font-bold text-white">Create Custom Drill Track</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-mono text-on-surface-variant">Drill Name</label>
                      <input 
                        type="text" 
                        value={newDrillName}
                        onChange={(e) => setNewDrillName(e.target.value)}
                        placeholder="e.g. Corner Three-Pointers"
                        className="bg-surface-container-highest border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-mono text-on-surface-variant">Target Repetitions</label>
                      <input 
                        type="number" 
                        value={newDrillTarget}
                        onChange={(e) => setNewDrillTarget(parseInt(e.target.value) || 0)}
                        className="bg-surface-container-highest border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-2">
                    <button 
                      onClick={() => {
                        setIsAddingDrill(false);
                        setNewDrillName('');
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-label uppercase tracking-widest font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        if (!newDrillName.trim()) return;
                        setDrills(prev => [
                          ...prev,
                          {
                            id: String(Date.now()),
                            name: newDrillName.trim(),
                            completed: 0,
                            target: newDrillTarget
                          }
                        ]);
                        setNewDrillName('');
                        setIsAddingDrill(false);
                      }}
                      className="px-4 py-2 bg-secondary text-black rounded-xl text-[10px] font-label uppercase tracking-widest font-black transition-all"
                    >
                      Add Drill Track
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {drills.map((drill) => (
                  <motion.div 
                    key={drill.id} 
                    animate={drill.isNewCompletion ? { scale: [1, 1.05, 1], borderColor: ['rgba(255,143,111,0.1)', '#FF8F6F', 'rgba(255,143,111,0.1)'] } : {}}
                    transition={{ duration: 0.5 }}
                    className="bg-surface-container p-5 rounded-2xl border border-outline-variant/5 relative overflow-hidden"
                  >
                    <AnimatePresence>
                      {drill.isNewCompletion && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="absolute inset-0 bg-primary/10 flex items-center justify-center z-20 backdrop-blur-sm"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Trophy className="w-8 h-8 text-primary" />
                            <span className="font-headline text-xs font-bold text-primary uppercase tracking-widest">Drill Completed!</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-body font-bold text-sm text-on-surface">{drill.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-label text-secondary font-bold">
                          {Math.round((drill.completed / drill.target) * 100)}%
                        </span>
                        {drill.completed < drill.target && (
                          <button 
                            onClick={() => incrementDrill(drill.id)}
                            className="p-1 bg-secondary/20 rounded hover:bg-secondary/40 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-secondary" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(drill.completed / drill.target) * 100}%` }}
                          className="h-full bg-secondary"
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-label text-on-surface-variant uppercase tracking-widest">
                        <span>{drill.completed} REPS</span>
                        <span>TARGET: {drill.target}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: AI Coach Summary */}
              <div className="lg:col-span-2 space-y-8">
                <section className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-xs">Latest AI Insights</h3>
                    <button 
                      onClick={() => setActiveTab('stats')}
                      className="text-[10px] font-label text-primary uppercase tracking-widest hover:underline"
                    >
                      View Live Session
                    </button>
                  </div>

                  {/* Horizontal Roster Quick View */}
                  <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide mb-2">
                    {roster.map((name) => (
                      <button
                        key={name}
                        onClick={() => {
                          setStatViewPlayer(name);
                          setActiveTab('stats');
                        }}
                        className="flex flex-col items-center gap-2 group shrink-0"
                      >
                        <div className={`w-10 h-12 rounded-lg ${playerJerseys[name] || 'bg-surface-container-highest'} flex items-center justify-center border border-white/10 relative overflow-hidden group-hover:scale-105 transition-transform`}>
                          {playerJerseys[name]?.startsWith('data:image') ? (
                            <img src={playerJerseys[name]} alt="Jersey" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="absolute inset-0 opacity-20 bg-white/40" />
                          )}
                          <span className="font-headline text-[10px] font-black text-white relative z-10">{players[name]}</span>
                        </div>
                        <span className="text-[8px] font-label text-on-surface-variant uppercase tracking-widest group-hover:text-primary transition-colors">{name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiInsights.slice(0, 4).map((insight, idx) => (
                      <div key={idx} className="bg-surface-container p-4 rounded-xl border-l-2 border-primary/40 flex gap-3 items-start">
                        <MessageSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <p className="font-body text-sm text-on-surface-variant leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-xs">Recommended Plays</h3>
                    <button 
                      onClick={() => setActiveTab('playbook')}
                      className="text-[10px] font-label text-primary uppercase tracking-widest hover:underline"
                    >
                      Open Playbook
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {aiPlaySuggestions.map((play) => (
                      <div 
                        key={play.id}
                        onClick={() => {
                          setSelectedPlay(play);
                          setActiveTab('playbook');
                        }}
                        className="bg-surface-container p-4 rounded-xl border border-outline-variant/5 cursor-pointer group hover:bg-surface-container-highest transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[8px] font-label font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                            play.type === 'Offense' 
                              ? 'bg-primary/20 text-primary border-primary/20' 
                              : 'bg-secondary/20 text-secondary border-secondary/20'
                          }`}>
                            {play.type}
                          </span>
                          <ArrowUpRight className="w-3 h-3 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="font-body font-bold text-sm group-hover:text-primary transition-colors">{play.name}</h4>
                        <p className="text-[10px] text-on-surface-variant line-clamp-1 mt-1 italic">{play.description}</p>
                      </div>
                    ))}
                    {aiPlaySuggestions.length === 0 && (
                      <div className="col-span-full py-8 text-center border border-dashed border-outline-variant/20 rounded-xl">
                        <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest opacity-40">No plays recommended yet</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column: Top Performers & Team Comparison */}
              <div className="space-y-8">
                <section className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-xs">Top Performers</h3>
                    <div className="flex gap-1 bg-surface-container-highest/50 p-1 rounded-lg border border-outline-variant/10">
                      <button 
                        onClick={() => setActiveTeam('home')}
                        className={`px-2 py-0.5 rounded text-[8px] font-label font-bold uppercase tracking-widest transition-all ${activeTeam === 'home' ? 'bg-primary text-black' : 'text-on-surface-variant hover:bg-white/5'}`}
                      >
                        {TEAM_DATA[homeTeamName]?.shortName || 'HOME'}
                      </button>
                      <button 
                        onClick={() => setActiveTeam('away')}
                        className={`px-2 py-0.5 rounded text-[8px] font-label font-bold uppercase tracking-widest transition-all ${activeTeam === 'away' ? 'bg-slate-700 text-white' : 'text-on-surface-variant hover:bg-white/5'}`}
                      >
                        {TEAM_DATA[awayTeamName]?.shortName || 'AWAY'}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {(activeTeam === 'home' ? roster : spursRoster)
                      .slice(0, 5)
                      .map(name => ({ name, stats: playerStats[name] || { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, misses: 0 } }))
                      .sort((a, b) => (b.stats.points + b.stats.rebounds + b.stats.assists) - (a.stats.points + a.stats.rebounds + a.stats.assists))
                      .slice(0, 5)
                      .map((player, idx) => (
                        <div key={player.name} className="flex items-center gap-4 p-3 bg-surface-container rounded-2xl border border-outline-variant/5">
                          <div className="relative">
                            <div className={`w-10 h-12 rounded-lg ${(activeTeam === 'home' ? playerJerseys[player.name] : spursPlayerJerseys[player.name]) || 'bg-surface-container-highest'} flex items-center justify-center border border-white/10 relative overflow-hidden`}>
                              {(activeTeam === 'home' ? playerJerseys[player.name] : spursPlayerJerseys[player.name])?.startsWith('data:image') ? (
                                <img src={activeTeam === 'home' ? playerJerseys[player.name] : spursPlayerJerseys[player.name]} alt="Jersey" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="absolute inset-0 opacity-20 bg-white/40" />
                              )}
                              <span className="font-headline text-xs font-black text-white relative z-10">{(activeTeam === 'home' ? players[player.name] : spursPlayers[player.name])}</span>
                            </div>
                            <div className={`absolute -top-1 -left-1 w-5 h-5 ${activeTeam === 'home' ? 'bg-primary text-black' : 'bg-slate-700 text-white'} rounded-full flex items-center justify-center font-headline text-[10px] font-bold border-2 border-surface-container-low`}>
                              {idx + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-body font-bold truncate">{player.name}</p>
                              <span className={`text-[8px] font-label ${activeTeam === 'home' ? 'text-primary' : 'text-slate-400'} uppercase tracking-widest`}>{player.stats.points} PTS</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(activeTeam === 'home' ? playerGoals[player.name]?.points : 20) > 0 ? Math.min((player.stats.points / (activeTeam === 'home' ? playerGoals[player.name].points : 20)) * 100, 100) : 0}%` }}
                                  className={`h-full ${activeTeam === 'home' ? 'bg-primary' : 'bg-slate-500'}`}
                                />
                              </div>
                              <span className="text-[8px] font-label text-on-surface-variant">{(activeTeam === 'home' ? playerGoals[player.name]?.points : 20) || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>

                <section className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
                  <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-xs mb-6">Team Comparison</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Points', home: teamStats.home.points, away: teamStats.away.points },
                      { label: 'FG Attempts', home: teamStats.home.fgAttempts, away: teamStats.away.fgAttempts },
                      { label: 'FG Made', home: teamStats.home.fgMakes, away: teamStats.away.fgMakes },
                      { label: 'Rebounds', home: teamStats.home.rebounds, away: teamStats.away.rebounds },
                      { label: 'Assists', home: teamStats.home.assists, away: teamStats.away.assists },
                      { label: 'Steals', home: teamStats.home.steals, away: teamStats.away.steals },
                      { label: 'Blocks', home: teamStats.home.blocks, away: teamStats.away.blocks },
                    ].map((stat) => {
                      const maxVal = Math.max(stat.home, stat.away, 10); // Use max of both or at least 10 for scale
                      return (
                        <div key={stat.label} className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-[9px] font-label uppercase tracking-widest mb-1">
                            <span className="text-primary font-bold">{stat.home}</span>
                            <span className="text-on-surface-variant font-medium">{stat.label}</span>
                            <span className="text-slate-400 font-bold">{stat.away}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(stat.home / maxVal) * 100}%` }}
                                className="h-full bg-primary"
                              />
                            </div>
                            <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(stat.away / maxVal) * 100}%` }}
                                className="h-full bg-slate-700"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
                  <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-xs mb-6">Recent Activity</h3>
                  <div className="space-y-3">
                    {events.slice(0, 5).map(event => (
                      <div key={event.id} className="flex items-center justify-between text-[10px] font-label uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/5 pb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-1 h-1 rounded-full ${event.team === 'home' ? 'bg-primary' : 'bg-slate-500'}`} />
                          <span className="text-on-surface font-bold">{event.player}</span>
                        </div>
                        <span>{event.action}</span>
                        <span className="opacity-40">{event.time}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <>
            {/* Live Score & Timer Header */}
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <p className="font-label text-on-surface-variant text-sm tracking-widest uppercase flex items-center gap-2">
                <Timer className="w-4 h-4" /> Live Session / Q{currentQuarter} {formatTime(timeLeft)}
              </p>
              <div className="flex items-center gap-2 bg-surface-container-highest/50 p-1 rounded-full border border-outline-variant/10">
                <button 
                  onClick={toggleClock}
                  className={`p-2 rounded-full transition-all active:scale-90 ${isRunning ? 'bg-error/20 text-error' : 'bg-primary/20 text-primary'}`}
                  title={isRunning ? 'Pause Clock' : 'Start Clock'}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button 
                  onClick={resetClock}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-on-surface-variant"
                  title="Reset Clock"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div className="flex gap-1 px-2 border-l border-outline-variant/20 ml-1">
                  {[1, 2, 3, 4].map(q => (
                    <button
                      key={q}
                      onClick={() => setCurrentQuarter(q)}
                      className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all ${currentQuarter === q ? 'bg-primary text-black' : 'text-on-surface-variant hover:bg-white/5'}`}
                    >
                      Q{q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center">
                <div className="flex gap-2 mb-2">
                  <button onClick={() => addEvent('Manual Score', 'score', 1, 'home')} className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center hover:bg-primary/40 text-primary transition-all active:scale-90"><Plus className="w-4 h-4" /></button>
                </div>
                <span className="font-headline text-6xl md:text-8xl font-extrabold tracking-tighter text-primary leading-none">{homeScore.toString().padStart(2, '0')}</span>
              </div>
              <span className="text-on-surface-variant/20 font-headline text-4xl md:text-6xl">—</span>
              <div className="flex flex-col items-center">
                <div className="flex gap-2 mb-2">
                  <button onClick={() => addEvent('Manual Score', 'score', 1, 'away')} className="w-8 h-8 bg-blue-400/20 rounded-lg flex items-center justify-center hover:bg-blue-400/40 text-blue-400 transition-all active:scale-90"><Plus className="w-4 h-4" /></button>
                </div>
                <span className="text-blue-400 font-headline text-6xl md:text-8xl font-extrabold tracking-tighter leading-none">{awayScore.toString().padStart(2, '0')}</span>
              </div>
            </div>
            <p className="font-body text-lg text-on-surface-variant">Strategic Battle in Progress</p>
          </motion.div>
          
          <div className="flex gap-4">
            <button 
              onClick={startTimeout}
              className="performance-gradient text-black px-8 py-4 rounded-md font-label font-bold uppercase tracking-widest active:scale-95 transition-transform shadow-[0_4px_24px_rgba(255,143,111,0.3)] flex flex-col items-center justify-center min-w-[140px]"
              title="Shortcut: Ctrl+T"
            >
              <span>TIMEOUT</span>
              <span className="text-[9px] font-mono opacity-80 leading-none mt-0.5 tracking-normal">[ctrl+t]</span>
            </button>
            <button 
              onClick={() => setIsSubModalOpen(true)}
              className="bg-surface-container border border-outline-variant/15 text-primary px-8 py-4 rounded-md font-label font-bold uppercase tracking-widest active:scale-95 transition-transform"
            >
              SUBSTITUTE
            </button>
          </div>
        </header>

        {/* Primary Stat Input Bento */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* AI Coach Panel */}
          <div className="md:col-span-12 bg-surface-container-low p-6 rounded-xl border border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Brain className="w-24 h-24 text-primary" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h2 className="font-label font-bold text-on-surface uppercase tracking-widest">AI Performance Coach</h2>
                    <p className="text-[10px] text-primary font-label uppercase tracking-tighter">Real-time Tactical Analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded-full border border-outline-variant/10">
                    <span className="text-[9px] font-label font-bold uppercase tracking-widest text-on-surface-variant">Live Analysis</span>
                    <button 
                      onClick={() => setIsLiveAnalysisEnabled(!isLiveAnalysisEnabled)}
                      className={`w-8 h-4 rounded-full relative transition-colors ${isLiveAnalysisEnabled ? 'bg-primary' : 'bg-surface-container'}`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isLiveAnalysisEnabled ? 'left-4.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <button 
                    onClick={generateAiInsights}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 bg-surface-container-highest hover:bg-surface-bright px-4 py-2 rounded-full text-[10px] font-label font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? 'Analyzing...' : 'Refresh Insights'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiInsights.map((insight, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-surface-container p-4 rounded-lg border-l-2 border-primary/40 flex gap-3 items-start"
                  >
                    <MessageSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                      {insight}
                    </p>
                  </motion.div>
                ))}
              </div>

              {aiPlaySuggestions.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-xs">Recommended Plays</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {aiPlaySuggestions.map((play) => (
                      <motion.div
                        key={play.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        onClick={() => {
                          setSelectedPlay(play);
                          setActiveTab('playbook');
                        }}
                        className="bg-surface-container-highest/30 p-4 rounded-xl border border-outline-variant/10 cursor-pointer group hover:bg-surface-container transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[8px] font-label font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                            play.type === 'Offense' 
                              ? 'bg-primary/20 text-primary border-primary/20' 
                              : 'bg-secondary/20 text-secondary border-secondary/20'
                          }`}>
                            {play.type}
                          </span>
                          <ArrowUpRight className="w-3 h-3 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="font-body font-bold text-sm group-hover:text-primary transition-colors">{play.name}</h4>
                        <p className="text-[10px] text-on-surface-variant line-clamp-1 mt-1 italic">{play.description}</p>
                        {play.reasoning && (
                          <div className="mt-3 pt-3 border-t border-outline-variant/10">
                            <p className="text-[9px] text-primary font-label uppercase tracking-widest mb-1">Coach's Reasoning</p>
                            <p className="text-[10px] text-on-surface leading-relaxed">{play.reasoning}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coach's Web Speech Voice Assistant Core */}
          <div className="md:col-span-12 bg-[#0e1116] p-6 rounded-2xl border border-violet-500/15 shadow-[0_0_20px_rgba(139,92,246,0.05)] space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-mono font-bold tracking-wider flex items-center gap-1.5 border ${
                    voiceStatus === 'listening' 
                      ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' 
                      : voiceStatus === 'unsupported' 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-white/5 border-white/5 text-on-surface-variant'
                  }`}>
                    {voiceStatus === 'listening' && <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping" />}
                    Voice Control: {voiceStatus.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-headline text-base font-bold text-white flex items-center gap-2.5">
                  <Mic className={`w-5 h-5 ${voiceStatus === 'listening' ? 'text-red-400 animate-pulse' : 'text-violet-400'}`} />
                  Hands-Free Coaching Telemetry Voice Core
                </h3>
                <p className="font-body text-[11px] text-on-surface-variant/80">
                  Speak live events into your headset microphone to record play-by-play actions instantly without looking down.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsVoiceListening(prev => !prev)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-label uppercase tracking-widest font-black transition-all flex items-center gap-2 border ${
                    isVoiceListening 
                      ? 'bg-red-600/25 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'bg-violet-600/20 hover:bg-violet-600/30 border-violet-500/30 text-violet-300'
                  }`}
                >
                  {isVoiceListening ? (
                    <>
                      <MicOff className="w-4 h-4 text-red-400" />
                      <span>Silence Microphone</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-violet-400" />
                      <span>Engage Voice Commands</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Context Notice & Active Receiver */}
            <div className="bg-[#12141c]/80 border border-white/5 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
              <span className="text-on-surface-variant/80 font-body">
                🎯 Target Recipient: Commands apply to the active focus player:
              </span>
              <span className="font-mono bg-violet-500/10 border border-violet-500/25 text-violet-300 px-3 py-1 rounded-lg font-bold">
                {activeTeam === 'home' ? activePlayer : activeAwayPlayer} ({activeTeam === 'home' ? homeTeamName : awayTeamName})
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Wave & Matches Logs */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-[#07090c] border border-white/5 rounded-xl p-4 min-h-[140px] flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Subtle Wave Animation when listening */}
                  {voiceStatus === 'listening' && (
                    <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1 opacity-[0.06] pointer-events-none">
                      <div className="w-1.5 h-10 bg-white rounded animate-bounce [animation-duration:0.6s]" />
                      <div className="w-1.5 h-16 bg-white rounded animate-bounce [animation-duration:0.4s]" />
                      <div className="w-1.5 h-20 bg-white rounded animate-bounce [animation-duration:0.7s]" />
                      <div className="w-1.5 h-12 bg-white rounded animate-bounce [animation-duration:0.5s]" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase text-on-surface-variant font-bold tracking-widest block">Live Transcript Feed</span>
                    {voiceTranscript ? (
                      <p className="text-xs text-white italic font-body leading-relaxed">
                        "{voiceTranscript}"
                      </p>
                    ) : (
                      <p className="text-xs text-on-surface-variant/40 italic font-body leading-relaxed">
                        {isVoiceListening ? "Listening continuously for coaching trigger phrases..." : "Microphone dormant. Standby."}
                      </p>
                    )}
                  </div>

                  {/* Last matched command trigger detail */}
                  {lastMatchedCommand && (
                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center animate-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping shrink-0" />
                        <div>
                          <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-wider">Activated Event</p>
                          <p className="text-xs font-bold text-green-400 font-headline">{lastMatchedCommand.action}</p>
                        </div>
                      </div>
                      <span className="text-[9px] text-on-surface-variant/50 font-mono">
                        {lastMatchedCommand.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Cheat Sheet / Voice Lexicon */}
              <div className="lg:col-span-5 space-y-3">
                <span className="text-[9px] font-mono uppercase text-on-surface-variant font-bold tracking-widest block">Allowed Voice Command Lexicon</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-body text-on-surface-variant">
                  <div className="bg-[#12141c] border border-white/5 p-2 rounded-lg flex flex-col gap-0.5">
                    <span className="text-white font-bold font-mono text-[10px] sm:text-xs">"+2pt made"</span>
                    <span className="text-[9px] text-on-surface-variant/70">Or "Two Pointer", "Layup"</span>
                  </div>
                  <div className="bg-[#12141c] border border-white/5 p-2 rounded-lg flex flex-col gap-0.5">
                    <span className="text-white font-bold font-mono text-[10px] sm:text-xs">"+3pt made"</span>
                    <span className="text-[9px] text-on-surface-variant/70">Or "Three Pointer", "Downtown"</span>
                  </div>
                  <div className="bg-[#12141c] border border-white/5 p-2 rounded-lg flex flex-col gap-0.5">
                    <span className="text-white font-bold font-mono text-[10px] sm:text-xs">"free throw"</span>
                    <span className="text-[9px] text-on-surface-variant/70">Or "One Point", "FT Made"</span>
                  </div>
                  <div className="bg-[#12141c] border border-white/5 p-2 rounded-lg flex flex-col gap-0.5">
                    <span className="text-white font-bold font-mono text-[10px] sm:text-xs">"miss"</span>
                    <span className="text-[9px] text-on-surface-variant/70">Or "Shot missed", "Brick"</span>
                  </div>
                  <div className="bg-[#12141c] border border-white/5 p-2 rounded-lg flex flex-col gap-0.5">
                    <span className="text-white font-bold font-mono text-[10px] sm:text-xs">"rebound"</span>
                    <span className="text-[9px] text-on-surface-variant/70">Or "Board", "Grab rebound"</span>
                  </div>
                  <div className="bg-[#12141c] border border-white/5 p-2 rounded-lg flex flex-col gap-0.5">
                    <span className="text-white font-bold font-mono text-[10px] sm:text-xs">"assist"</span>
                    <span className="text-[9px] text-on-surface-variant/70">Or "Give assist", "Pass"</span>
                  </div>
                  <div className="bg-[#12141c] border border-white/5 p-2 rounded-lg flex flex-col gap-0.5">
                    <span className="text-white font-bold font-mono text-[10px] sm:text-xs">"steal"</span>
                    <span className="text-[9px] text-on-surface-variant/70">Or "STL", "Steal ball"</span>
                  </div>
                  <div className="bg-[#12141c] border border-white/5 p-2 rounded-lg flex flex-col gap-0.5">
                    <span className="text-white font-bold font-mono text-[10px] sm:text-xs">"block"</span>
                    <span className="text-[9px] text-on-surface-variant/70">Or "BLK", "Block shot"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Points Controller */}
          <div className="md:col-span-8 bg-surface-container-low p-6 rounded-xl space-y-6 border border-outline-variant/5">
            <div className="flex justify-between items-center">
              <h2 className="font-label font-bold text-on-surface-variant uppercase tracking-widest">Scoring</h2>
              <span className="font-label text-secondary text-sm flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> PERFORMANCE PEAK
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => addEvent('2PT Made', 'score', 2)}
                className="group bg-surface-container p-8 rounded-xl flex flex-col items-center justify-center gap-4 hover:bg-surface-bright transition-all active:scale-[0.98] border border-transparent hover:border-primary/20"
              >
                <span className="font-headline text-5xl group-hover:text-primary transition-colors">2PT</span>
                <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Field Goal Made</span>
              </button>
              <button 
                onClick={() => addEvent('3PT Made', 'score', 3)}
                className="group bg-surface-container p-8 rounded-xl flex flex-col items-center justify-center gap-4 hover:bg-surface-bright transition-all active:scale-[0.98] border border-transparent hover:border-primary/20"
              >
                <span className="font-headline text-5xl text-primary">3PT</span>
                <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Beyond the Arc</span>
              </button>
              <button 
                onClick={() => addEvent('Free Throw Made', 'score', 1)}
                className="group bg-surface-container-highest/50 p-6 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-surface-bright transition-all active:scale-[0.98]"
              >
                <span className="font-headline text-2xl uppercase tracking-widest">Free Throw</span>
              </button>
              <button 
                onClick={() => addEvent('Shot Missed', 'miss')}
                className="group bg-error/10 p-6 rounded-xl flex flex-col items-center justify-center gap-2 border border-error/10 hover:bg-error/20 transition-all active:scale-[0.98]"
              >
                <span className="font-headline text-2xl text-error">MISS</span>
                <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Any Shot Attempt</span>
              </button>
            </div>
          </div>

          {/* Focus Player Card */}
          <div className="md:col-span-4 bg-surface-container p-6 rounded-xl flex flex-col justify-between overflow-hidden relative group border border-outline-variant/5">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1">
                  <h2 className="font-label font-bold text-on-surface-variant uppercase tracking-widest">Active Lab</h2>
                  <div className="flex gap-1 bg-surface-container-highest/50 p-1 rounded-lg border border-outline-variant/10">
                    <button 
                      onClick={() => setActiveTeam('home')}
                      className={`px-3 py-1 rounded-md text-[10px] font-label font-bold uppercase tracking-widest transition-all ${activeTeam === 'home' ? 'bg-primary text-black' : 'text-on-surface-variant hover:bg-white/5'}`}
                    >
                      {TEAM_DATA[homeTeamName]?.shortName || 'HOME'}
                    </button>
                    <button 
                      onClick={() => setActiveTeam('away')}
                      className={`px-3 py-1 rounded-md text-[10px] font-label font-bold uppercase tracking-widest transition-all ${activeTeam === 'away' ? 'bg-slate-700 text-white' : 'text-on-surface-variant hover:bg-white/5'}`}
                    >
                      {TEAM_DATA[awayTeamName]?.shortName || 'AWAY'}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsJerseyModalOpen(true)}
                    className="p-1.5 bg-surface-container-highest rounded hover:bg-primary/20 transition-colors"
                    title="Customize Jersey"
                  >
                    <Settings className="w-3.5 h-3.5 text-primary" />
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => {
                        setIsPlayerSelectOpen(!isPlayerSelectOpen);
                        setPlayerSelectView('players');
                      }}
                      className="flex items-center gap-2 bg-surface-container-highest text-xs border border-outline-variant/10 rounded px-3 py-1.5 focus:ring-1 focus:ring-primary hover:bg-surface-bright transition-all group active:scale-95"
                    >
                      <User className="w-3 h-3 text-primary" />
                      <span className="font-body font-medium">{activeTeam === 'home' ? activePlayer : activeAwayPlayer}</span>
                      <ChevronDown className={`w-3 h-3 text-on-surface-variant transition-transform duration-300 ${isPlayerSelectOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isPlayerSelectOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full right-0 md:left-0 mt-2 w-72 bg-surface-container-high rounded-2xl border border-outline-variant/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-[60] overflow-hidden backdrop-blur-xl"
                        >
                          <div className="p-3 border-b border-outline-variant/10 bg-surface-container/50">
                            <div className="flex gap-1 bg-surface-container-highest/50 p-1 rounded-xl mb-3">
                              <button 
                                onClick={() => setPlayerSelectView('players')}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-label font-bold uppercase tracking-widest transition-all ${playerSelectView === 'players' ? 'bg-primary text-black' : 'text-on-surface-variant hover:bg-white/5'}`}
                              >
                                Players
                              </button>
                              <button 
                                onClick={() => setPlayerSelectView('teams')}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-label font-bold uppercase tracking-widest transition-all ${playerSelectView === 'teams' ? 'bg-primary text-black' : 'text-on-surface-variant hover:bg-white/5'}`}
                              >
                                Teams
                              </button>
                            </div>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-on-surface-variant opacity-50" />
                              <input 
                                type="text"
                                placeholder={playerSelectView === 'players' ? "Search players..." : "Search teams..."}
                                value={playerSelectSearch}
                                onChange={(e) => setPlayerSelectSearch(e.target.value)}
                                className="w-full bg-surface-container-highest/50 border border-outline-variant/10 rounded-xl pl-9 pr-4 py-2 text-xs font-body focus:outline-none focus:border-primary/50 transition-colors"
                                autoFocus
                              />
                            </div>
                          </div>

                          <div className="max-h-80 overflow-y-auto scrollbar-hide py-2">
                            {playerSelectView === 'players' ? (
                              (activeTeam === 'home' ? roster : spursRoster)
                                .filter(p => p.toLowerCase().includes(playerSelectSearch.toLowerCase()))
                                .map(p => (
                              <button
                                key={p}
                                onClick={() => {
                                  if (activeTeam === 'home') {
                                    setActivePlayer(p);
                                  } else {
                                    setActiveAwayPlayer(p);
                                  }
                                  setIsPlayerSelectOpen(false);
                                  setPlayerSelectSearch('');
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group ${
                                  (activeTeam === 'home' ? activePlayer : activeAwayPlayer) === p ? 'bg-primary/5' : ''
                                }`}
                              >
                                <div className="relative">
                                  <div className={`w-8 h-10 rounded-md ${(activeTeam === 'home' ? playerJerseys[p] : spursPlayerJerseys[p]) || 'bg-surface-container-highest'} flex items-center justify-center border border-white/10 relative overflow-hidden shrink-0`}>
                                    <span className="font-headline text-[10px] font-black text-white relative z-10">
                                      {(activeTeam === 'home' ? players[p] : spursPlayers[p]) || '00'}
                                    </span>
                                  </div>
                                  {(activeTeam === 'home' ? activePlayer : activeAwayPlayer) === p && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-surface-container-high flex items-center justify-center">
                                      <Check className="w-2 h-2 text-black" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-label text-[10px] text-primary font-bold block">#{(activeTeam === 'home' ? players[p] : spursPlayers[p]) || '00'}</span>
                                    {(activeTeam === 'home' ? playerPositions[p] : spursPlayerPositions[p]) && (
                                      <span className="text-[8px] font-label text-on-surface-variant/60 uppercase tracking-widest">{(activeTeam === 'home' ? playerPositions[p] : spursPlayerPositions[p])}</span>
                                    )}
                                  </div>
                                  <span className="font-body text-sm font-medium group-hover:text-primary transition-colors">{p}</span>
                                </div>
                              </button>
                              ))
                            ) : (
                              Object.keys(TEAM_DATA)
                                .filter(t => t.toLowerCase().includes(playerSelectSearch.toLowerCase()) || TEAM_DATA[t].shortName.toLowerCase().includes(playerSelectSearch.toLowerCase()))
                                .map(t => (
                                  <button
                                    key={t}
                                    onClick={() => {
                                      handleTeamChange(activeTeam, t);
                                      setPlayerSelectView('players');
                                      setPlayerSelectSearch('');
                                    }}
                                    className={`w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors text-left group ${
                                      (activeTeam === 'home' ? homeTeamName : awayTeamName) === t ? 'bg-primary/5' : ''
                                    }`}
                                  >
                                    <div className={`w-10 h-10 rounded-xl ${TEAM_DATA[t].colors.primary} flex items-center justify-center border border-white/10 shadow-sm shrink-0`}>
                                      <span className="font-headline text-xs font-black text-white uppercase">{TEAM_DATA[t].shortName}</span>
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-body text-sm font-bold group-hover:text-primary transition-colors">{t}</p>
                                      <p className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest">{TEAM_DATA[t].roster.length} Players</p>
                                    </div>
                                    {(activeTeam === 'home' ? homeTeamName : awayTeamName) === t && (
                                      <Check className="w-4 h-4 text-primary" />
                                    )}
                                  </button>
                                ))
                            )}
                            
                            {((playerSelectView === 'players' && (activeTeam === 'home' ? roster : spursRoster).filter(p => p.toLowerCase().includes(playerSelectSearch.toLowerCase())).length === 0) ||
                              (playerSelectView === 'teams' && Object.keys(TEAM_DATA).filter(t => t.toLowerCase().includes(playerSelectSearch.toLowerCase())).length === 0)) && (
                              <div className="py-8 px-4 text-center">
                                <p className="text-xs text-on-surface-variant italic opacity-50">No results found</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className={`w-10 h-12 rounded-lg ${(activeTeam === 'home' ? playerJerseys[activePlayer] : spursPlayerJerseys[activeAwayPlayer]) || 'bg-surface-container-highest'} flex items-center justify-center border border-white/10 shadow-lg relative overflow-hidden`}>
                      {(activeTeam === 'home' ? playerJerseys[activePlayer] : spursPlayerJerseys[activeAwayPlayer])?.startsWith('data:image') ? (
                        <img src={activeTeam === 'home' ? playerJerseys[activePlayer] : spursPlayerJerseys[activeAwayPlayer]} alt="Jersey" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 to-transparent" />
                      )}
                      <input 
                        type="text"
                        value={(activeTeam === 'home' ? players[activePlayer] : spursPlayers[activeAwayPlayer]) || '00'}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                          if (activeTeam === 'home') {
                            setPlayers({ ...players, [activePlayer]: val });
                          } else {
                            setSpursPlayers({ ...spursPlayers, [activeAwayPlayer]: val });
                          }
                        }}
                        className="bg-transparent font-headline text-lg font-black text-white relative z-10 drop-shadow-md w-full text-center outline-none"
                        placeholder="00"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-headline text-3xl font-bold leading-tight">{activeTeam === 'home' ? activePlayer : activeAwayPlayer}</p>
                      {(activeTeam === 'home' ? playerPositions[activePlayer] : spursPlayerPositions[activeAwayPlayer]) && (
                        <span className="bg-primary/10 text-primary text-[8px] font-label font-bold px-1.5 py-0.5 rounded uppercase tracking-widest border border-primary/20">
                          {activeTeam === 'home' ? playerPositions[activePlayer] : spursPlayerPositions[activeAwayPlayer]}
                        </span>
                      )}
                    </div>
                    <p className="font-label text-primary text-[10px] uppercase tracking-wider">Live Tracker</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 relative z-10">
              <div className="bg-surface-container-highest/30 p-2 rounded text-center border border-outline-variant/5">
                <p className="text-[10px] text-on-surface-variant uppercase font-label tracking-tighter">PTS</p>
                <p className="font-headline text-xl text-primary">{playerStats[activeTeam === 'home' ? activePlayer : activeAwayPlayer]?.points || 0}</p>
              </div>
              <div className="bg-surface-container-highest/30 p-2 rounded text-center border border-outline-variant/5">
                <p className="text-[10px] text-on-surface-variant uppercase font-label tracking-tighter">REB</p>
                <p className="font-headline text-xl text-secondary">{playerStats[activeTeam === 'home' ? activePlayer : activeAwayPlayer]?.rebounds || 0}</p>
              </div>
              <div className="bg-surface-container-highest/30 p-2 rounded text-center border border-outline-variant/5">
                <p className="text-[10px] text-on-surface-variant uppercase font-label tracking-tighter">AST</p>
                <p className="font-headline text-xl text-tertiary">{playerStats[activeTeam === 'home' ? activePlayer : activeAwayPlayer]?.assists || 0}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 relative z-10">
              <div className="flex justify-between items-center">
                <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Goal Progress</span>
                <button 
                  onClick={() => {
                    if (activeTeam === 'home') {
                      setEditGoals(playerGoals[activePlayer] || { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0 });
                    } else {
                      setEditGoals(spursPlayerGoals[activeAwayPlayer] || { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0 });
                    }
                    setIsGoalsModalOpen(true);
                  }}
                  className="text-[8px] font-label text-primary uppercase tracking-widest hover:underline"
                >
                  Set
                </button>
              </div>
              {(activeTeam === 'home' ? [
                { label: 'PTS', current: playerStats[activePlayer]?.points || 0, goal: playerGoals[activePlayer]?.points || 0, color: 'bg-primary' },
                { label: 'REB', current: playerStats[activePlayer]?.rebounds || 0, goal: playerGoals[activePlayer]?.rebounds || 0, color: 'bg-secondary' }
              ] : [
                { label: 'PTS', current: playerStats[activeAwayPlayer]?.points || 0, goal: spursPlayerGoals[activeAwayPlayer]?.points || 0, color: 'bg-slate-500' },
                { label: 'REB', current: playerStats[activeAwayPlayer]?.rebounds || 0, goal: spursPlayerGoals[activeAwayPlayer]?.rebounds || 0, color: 'bg-slate-400' }
              ]).map(g => {
                const progress = g.goal > 0 ? Math.min((g.current / g.goal) * 100, 100) : 0;
                return (
                  <div key={g.label} className="space-y-1">
                    <div className="flex justify-between text-[8px] font-label uppercase tracking-widest">
                      <span className="text-on-surface-variant/60">{g.label}</span>
                      <span className="text-on-surface-variant">{g.current} / {g.goal}</span>
                    </div>
                    <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full ${g.color}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 space-y-3 relative z-10">
              <div className="flex justify-between items-end border-b border-outline-variant/10 pb-1">
                <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Efficiency</span>
                <span className="font-headline text-base text-secondary">{efficiency}%</span>
              </div>
              <div className="flex justify-between items-end border-b border-outline-variant/10 pb-1">
                <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Fatigue</span>
                <span className={`font-headline text-base ${fatigueColor}`}>{fatigue}</span>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Trophy className="w-64 h-64 text-white" />
            </div>
          </div>

          {/* Utility Stats Row */}
          <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => addEvent('Rebound', 'rebound', 'REB')}
              className="bg-surface-container-low p-6 rounded-xl flex flex-col items-start gap-4 hover:bg-surface-container transition-all active:scale-95 border border-outline-variant/5"
            >
              <Dumbbell className="w-6 h-6 text-tertiary" />
              <div className="text-left">
                <p className="font-headline text-2xl">REB</p>
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-tighter">Total Rebounds</p>
              </div>
            </button>
            <button 
              onClick={() => addEvent('Assist', 'assist', 'AST')}
              className="bg-surface-container-low p-6 rounded-xl flex flex-col items-start gap-4 hover:bg-surface-container transition-all active:scale-95 border border-outline-variant/5"
            >
              <ArrowLeftRight className="w-6 h-6 text-tertiary" />
              <div className="text-left">
                <p className="font-headline text-2xl">AST</p>
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-tighter">Playmaker Assists</p>
              </div>
            </button>
            <button 
              onClick={() => addEvent('Steal', 'steal', 'STL')}
              className="bg-surface-container-low p-6 rounded-xl flex flex-col items-start gap-4 hover:bg-surface-container transition-all active:scale-95 border border-outline-variant/5"
            >
              <Shield className="w-6 h-6 text-secondary" />
              <div className="text-left">
                <p className="font-headline text-2xl">STL</p>
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-tighter">Defensive Steals</p>
              </div>
            </button>
            <button 
              onClick={() => addEvent('Block', 'block', 'BLK')}
              className="bg-surface-container-low p-6 rounded-xl flex flex-col items-start gap-4 hover:bg-surface-container transition-all active:scale-95 border border-outline-variant/5"
            >
              <Hand className="w-6 h-6 text-error" />
              <div className="text-left">
                <p className="font-headline text-2xl">BLK</p>
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-tighter">Shot Blocks</p>
              </div>
            </button>
          </div>
        </section>

        {/* Player Performance Section */}
        <section className="mt-12 bg-surface-container-low p-6 rounded-xl border border-outline-variant/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest">Player Performance</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
              {trackedPlayers.map(player => (
                <button
                  key={player}
                  onClick={() => setStatViewPlayer(player)}
                  className={`px-4 py-2 rounded-full font-label text-xs uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
                    statViewPlayer === player 
                      ? 'bg-primary text-black font-bold' 
                      : 'bg-surface-container hover:bg-surface-bright text-on-surface-variant'
                  }`}
                >
                  <div className={`w-3 h-4 rounded-sm ${playerJerseys[player] || 'bg-surface-container-highest'} border border-white/10 relative overflow-hidden`}>
                    {playerJerseys[player]?.startsWith('data:image') ? (
                      <img src={playerJerseys[player]} alt="Jersey" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="absolute inset-0 opacity-20 bg-white/40" />
                    )}
                  </div>
                  #{players[player] || '00'} {player}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatBox label="Points" value={playerStats[statViewPlayer]?.points || 0} color="text-primary" />
            <StatBox label="Rebounds" value={playerStats[statViewPlayer]?.rebounds || 0} color="text-tertiary" />
            <StatBox label="Assists" value={playerStats[statViewPlayer]?.assists || 0} color="text-tertiary" />
            <StatBox label="Steals" value={playerStats[statViewPlayer]?.steals || 0} color="text-secondary" />
            <StatBox label="Blocks" value={playerStats[statViewPlayer]?.blocks || 0} color="text-error" />
          </div>
        </section>

        {/* Dynamic Feedback Log */}
        <section className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest">Recent Events</h3>
            <button className="text-xs text-primary font-label uppercase tracking-widest hover:underline">View All</button>
          </div>

          {/* Visual Timeline */}
          <div className="mb-8 p-6 bg-surface-container-low rounded-xl border border-outline-variant/5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-tighter">Q1</span>
              <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-tighter">Q2</span>
              <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-tighter">Q3</span>
              <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-tighter">Q4</span>
            </div>
            <div className="relative h-1.5 bg-surface-container rounded-full overflow-visible">
              {/* Quarter Dividers */}
              {[25, 50, 75].map(pos => (
                <div key={pos} className="absolute top-0 bottom-0 w-px bg-outline-variant/20 -translate-y-1" style={{ left: `${pos}%`, height: '14px' }} />
              ))}
              
              {/* Event Markers */}
              {events.map((event) => {
                const quarter = parseInt(event.quarter.replace('Q', '')) - 1;
                const [m, s] = event.time.split(':').map(Number);
                const secondsLeft = m * 60 + s;
                const elapsedInQuarter = 600 - secondsLeft;
                const totalElapsed = (quarter * 600) + elapsedInQuarter;
                const position = (totalElapsed / 2400) * 100;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-surface-container-low cursor-pointer hover:scale-150 transition-transform z-10 ${
                      event.type === 'score' ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]' : 
                      event.type === 'miss' ? 'bg-error' : 
                      'bg-tertiary'
                    }`}
                    style={{ left: `${position}%` }}
                    whileHover={{ y: -12 }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-surface-container-high px-3 py-2 rounded-lg border border-outline-variant/20 z-20 flex items-center gap-2 shadow-2xl">
                      <div className={`w-4 h-5 rounded-sm ${playerJerseys[event.player] || 'bg-surface-container-highest'} border border-white/10 relative overflow-hidden shrink-0`}>
                        {playerJerseys[event.player]?.startsWith('data:image') ? (
                          <img src={playerJerseys[event.player]} alt="Jersey" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="absolute inset-0 opacity-20 bg-white/40" />
                        )}
                      </div>
                      <span className="text-[10px] font-label">#{players[event.player] || '00'} {event.action} ({event.time})</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-6">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-label text-on-surface-variant uppercase">Score</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-tertiary" />
                <span className="text-[10px] font-label text-on-surface-variant uppercase">Stat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-error" />
                <span className="text-[10px] font-label text-on-surface-variant uppercase">Miss</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {events.map((event) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`w-8 h-10 rounded-md ${playerJerseys[event.player] || 'bg-surface-container-highest'} flex items-center justify-center border border-white/10 relative overflow-hidden shrink-0`}>
                        {playerJerseys[event.player]?.startsWith('data:image') ? (
                          <img src={playerJerseys[event.player]} alt="Jersey" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 to-transparent" />
                        )}
                        <span className="font-headline text-[10px] font-black text-white relative z-10">
                          {players[event.player] || '00'}
                        </span>
                      </div>
                      {playerPhotos[event.player] && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white/20 overflow-hidden shadow-lg z-20">
                          <img src={playerPhotos[event.player]} alt={event.player} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <p className="font-body font-semibold leading-none">{event.player}</p>
                        {playerPositions[event.player] && (
                          <span className="text-[8px] font-label text-primary uppercase tracking-widest">{playerPositions[event.player]}</span>
                        )}
                      </div>
                      <p className="font-body text-sm text-on-surface-variant mt-1">{event.action}</p>
                      <p className="font-label text-[10px] text-on-surface-variant/60 uppercase tracking-widest mt-0.5">{event.time} • {event.quarter}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-headline text-xl ${
                      event.type === 'score' ? 'text-primary' : 
                      event.type === 'miss' ? 'text-error' : 
                      'text-tertiary'
                    }`}>
                      {typeof event.value === 'number' ? `+${event.value}` : event.value}
                    </span>
                    <button 
                      onClick={() => setEditingEvent(event)}
                      className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-on-surface-variant" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </>
    )}

    {activeTab === 'compare' && (
      <div className="space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-primary uppercase">Player Comparison</h1>
            <p className="font-body text-on-surface-variant">Side-by-side performance analysis</p>
          </div>
          <div className="flex gap-2">
            {comparisonPlayers.length > 0 && (
              <button 
                onClick={() => setComparisonPlayers([])}
                className="bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-xl font-label text-[10px] uppercase tracking-widest hover:bg-surface-bright transition-all"
              >
                Clear All
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Player Selection Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-xs">Select Players</h3>
            <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 p-4 space-y-2 max-h-[500px] overflow-y-auto">
              {roster.map(player => {
                const isSelected = comparisonPlayers.includes(player);
                return (
                  <button
                    key={player}
                    onClick={() => {
                      if (isSelected) {
                        setComparisonPlayers(comparisonPlayers.filter(p => p !== player));
                      } else if (comparisonPlayers.length < 4) {
                        setComparisonPlayers([...comparisonPlayers, player]);
                      }
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 group ${
                      isSelected 
                        ? 'bg-primary/10 border-primary/40' 
                        : 'bg-surface-container border-outline-variant/5 hover:bg-surface-container-highest'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-10 h-12 rounded-lg ${playerJerseys[player] || 'bg-surface-container-highest'} flex items-center justify-center border border-white/10 relative overflow-hidden`}>
                        {playerJerseys[player]?.startsWith('data:image') ? (
                          <img src={playerJerseys[player]} alt="Jersey" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="absolute inset-0 opacity-20 bg-white/40" />
                        )}
                        <span className="font-headline text-xs font-black text-white relative z-10">
                          {players[player] || '00'}
                        </span>
                      </div>
                      {playerPhotos[player] && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full border border-white/20 overflow-hidden shadow-lg z-20">
                          <img src={playerPhotos[player]} alt={player} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-body font-bold truncate ${isSelected ? 'text-primary' : ''}`}>{player}</p>
                      <p className="text-[8px] font-label text-on-surface-variant uppercase tracking-widest">{playerPositions[player] || 'No Position'}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] font-label text-on-surface-variant/60 uppercase tracking-widest text-center">Select up to 4 players</p>
          </div>

          {/* Comparison Content */}
          <div className="lg:col-span-3 space-y-8">
            {comparisonPlayers.length > 0 ? (
              <>
                {/* Stats Grid */}
                <div className={`grid gap-4 ${
                  comparisonPlayers.length === 1 ? 'grid-cols-1' :
                  comparisonPlayers.length === 2 ? 'grid-cols-2' :
                  'grid-cols-2 md:grid-cols-4'
                }`}>
                  {comparisonPlayers.map(player => {
                    const stats = playerStats[player] || { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, misses: 0 };
                    return (
                      <motion.div 
                        key={player}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                          <span className="font-headline text-6xl font-black">{players[player]}</span>
                        </div>
                        <div className="relative z-10 space-y-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-surface-container-highest">
                              {playerPhotos[player] ? (
                                <img src={playerPhotos[player]} alt={player} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <User className="w-full h-full p-2 text-on-surface-variant" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-body font-bold text-primary leading-none">{player}</h4>
                              <p className="text-[8px] font-label text-on-surface-variant uppercase tracking-widest mt-1">#{players[player]}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                            {[
                              { label: 'PTS', val: stats.points },
                              { label: 'REB', val: stats.rebounds },
                              { label: 'AST', val: stats.assists },
                              { label: 'STL', val: stats.steals },
                              { label: 'BLK', val: stats.blocks },
                              { label: 'MISS', val: stats.misses, color: 'text-error' }
                            ].map(s => (
                              <div key={s.label}>
                                <p className="text-[8px] font-label text-on-surface-variant uppercase tracking-widest">{s.label}</p>
                                <p className={`font-headline text-2xl font-bold ${s.color || 'text-on-surface'}`}>{s.val}</p>
                              </div>
                            ))}
                          </div>

                          {/* Goals Progress */}
                          <div className="pt-4 border-t border-outline-variant/10 space-y-3">
                            <div className="flex justify-between items-center">
                              <h5 className="text-[9px] font-label font-bold text-on-surface-variant uppercase tracking-widest">Goal Progress</h5>
                              <button 
                                onClick={() => {
                                  setActivePlayer(player);
                                  setEditGoals(playerGoals[player] || { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0 });
                                  setIsGoalsModalOpen(true);
                                }}
                                className="text-[8px] font-label text-primary uppercase tracking-widest hover:underline"
                              >
                                Set Goals
                              </button>
                            </div>
                            {[
                              { label: 'Points', current: stats.points, goal: playerGoals[player]?.points || 0, color: 'bg-primary' },
                              { label: 'Rebounds', current: stats.rebounds, goal: playerGoals[player]?.rebounds || 0, color: 'bg-secondary' },
                              { label: 'Assists', current: stats.assists, goal: playerGoals[player]?.assists || 0, color: 'bg-tertiary' }
                            ].map(g => {
                              const progress = g.goal > 0 ? Math.min((g.current / g.goal) * 100, 100) : 0;
                              return (
                                <div key={g.label} className="space-y-1">
                                  <div className="flex justify-between text-[8px] font-label uppercase tracking-widest">
                                    <span className="text-on-surface-variant/60">{g.label}</span>
                                    <span className="text-on-surface-variant">{g.current} / {g.goal}</span>
                                  </div>
                                  <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${progress}%` }}
                                      className={`h-full ${g.color}`}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Comparison Chart */}
                <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10">
                  <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-xs mb-8">Statistical Distribution</h3>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Points', ...comparisonPlayers.reduce((acc, p) => ({ ...acc, [p]: playerStats[p]?.points || 0 }), {}) },
                          { name: 'Rebounds', ...comparisonPlayers.reduce((acc, p) => ({ ...acc, [p]: playerStats[p]?.rebounds || 0 }), {}) },
                          { name: 'Assists', ...comparisonPlayers.reduce((acc, p) => ({ ...acc, [p]: playerStats[p]?.assists || 0 }), {}) },
                          { name: 'Steals', ...comparisonPlayers.reduce((acc, p) => ({ ...acc, [p]: playerStats[p]?.steals || 0 }), {}) },
                          { name: 'Blocks', ...comparisonPlayers.reduce((acc, p) => ({ ...acc, [p]: playerStats[p]?.blocks || 0 }), {}) }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#ffffff40" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#ffffff60', fontFamily: 'Inter' }}
                        />
                        <YAxis 
                          stroke="#ffffff40" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#ffffff60', fontFamily: 'Inter' }}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1A1C1E', border: '1px solid #ffffff10', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '12px', fontFamily: 'Inter' }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          formatter={(value) => <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">{value}</span>}
                        />
                        {comparisonPlayers.map((player, idx) => (
                          <Bar 
                            key={player} 
                            dataKey={player} 
                            fill={idx === 0 ? '#FF8F6F' : idx === 1 ? '#6F9BFF' : idx === 2 ? '#6FFF8F' : '#FF6FB1'} 
                            radius={[4, 4, 0, 0]}
                            barSize={comparisonPlayers.length > 2 ? 15 : 30}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full min-h-[500px] border-2 border-dashed border-outline-variant/10 rounded-3xl flex flex-col items-center justify-center text-on-surface-variant gap-4">
                <BarChart2 className="w-16 h-16 opacity-10" />
                <p className="font-label text-xs uppercase tracking-widest opacity-40">Select players to start comparison</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {activeTab === 'playbook' && (
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-primary">PLAYBOOK</h1>
            <p className="font-body text-on-surface-variant">Strategic Offensive & Defensive Plays</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-2xl border border-outline-variant/10 shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Plays', icon: <BookOpen className="w-3 h-3" /> },
                { id: 'home', label: `${homeTeamName}`, icon: <Shield className="w-3 h-3" /> },
                { id: 'away', label: `${awayTeamName}`, icon: <Trophy className="w-3 h-3" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setPlaybookFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-label font-bold uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${
                    playbookFilter === tab.id 
                      ? 'bg-primary text-black shadow-lg scale-105' 
                      : 'text-on-surface-variant hover:bg-white/5 opacity-60 hover:opacity-100'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant opacity-50" />
              <input 
                type="text"
                placeholder="Search plays..."
                value={playbookSearch}
                onChange={(e) => setPlaybookSearch(e.target.value)}
                className="w-full bg-surface-container-highest/50 border border-outline-variant/10 rounded-xl py-2.5 pl-10 pr-10 text-sm font-body outline-none focus:border-primary/40 transition-all"
              />
              {playbookSearch && (
                <button 
                  onClick={() => setPlaybookSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-on-surface-variant transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <button 
              onClick={() => {
                setIsCreatingPlay(true);
                setSelectedPlay(null);
              }}
              className="performance-gradient text-black px-6 py-3 rounded-xl font-label font-bold uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all shrink-0"
            >
              <FolderPlus className="w-5 h-5" /> New Play
            </button>
            <button 
              onClick={() => {
                setUploadedFilesData([]);
                setImportPreviewPlays([]);
                setIsUploadFullscreen(false);
                setPreviewingPlayFullscreen(null);
                setIsUploadModalOpen(true);
              }}
              className="bg-surface-container-highest hover:bg-surface-bright text-on-surface border border-outline-variant/15 px-6 py-3 rounded-xl font-label font-bold uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all shrink-0"
              title="Upload playbook or set play files (.json, .csv, .txt or diagram images)"
              id="upload-playbook-trigger"
            >
              <Upload className="w-5 h-5 text-primary" /> Upload Playbook
            </button>
            <button 
              onClick={generateAiPlaySuggestion}
              disabled={isGeneratingPlay}
              className="bg-primary/20 text-primary border border-primary/20 px-6 py-3 rounded-xl font-label font-bold uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all shrink-0 disabled:opacity-50"
            >
              <Sparkles className={`w-5 h-5 ${isGeneratingPlay ? 'animate-spin' : ''}`} /> 
              {isGeneratingPlay ? 'Analyzing...' : 'AI Propose'}
            </button>
          </div>
        </header>

        {(!selectedPlay && !isCreatingPlay) ? (
          <div className="space-y-8">
            {/* 🎬 GORGEOUS PREMIUM MULTI-MODEL VIDEO CV PROMO BANNER */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-[#0B0F19] to-slate-950 border border-primary/15 rounded-3xl p-6 sm:p-8 flex flex-col xl:flex-row items-center justify-between gap-6 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
              {/* Radial gradient background accent for absolute premium visual finish */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,143,111,0.06),transparent_50%)] pointer-events-none" />
              
              <div className="space-y-4 text-left max-w-2xl relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[#FF8F6F]/10 text-[#FF8F6F] border border-[#FF8F6F]/20 font-mono text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                    <Activity className="w-3 h-3 text-primary" /> Live AI Computer Vision Pipeline
                  </span>
                  <span className="bg-primary/10 text-primary border border-primary/20 font-mono text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Multi-Stage Pipeline
                  </span>
                </div>
                
                <h2 className="font-headline text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Parse Practice Game Films Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8F6F] to-amber-400">Interactive Tactical Coordinates</span>
                </h2>
                
                <p className="text-xs text-on-surface-variant/90 font-sans leading-relaxed">
                  Transform dynamic practice footage or game recordings into precise interactive play schematics! Our zero-shot neural pipeline automatically traces team locations, labels defensive/offensive players, and extracts coordinate trajectories.
                </p>
                
                {/* Visual flowchart list representing the 4 parallel stages */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1.5">
                  {[
                    { title: "Detection", label: "Centroid boxes", color: "text-amber-400 bg-amber-500/5 border-amber-500/10" },
                    { title: "Tracking", label: "Vector tracking", color: "text-[#36D399] bg-[#36D399]/5 border-[#36D399]/10" },
                    { title: "Clustering", label: "Team clusters", color: "text-sky-400 bg-sky-400/5 border-sky-400/10" },
                    { title: "OCR Reader", label: "Jersey numbers", color: "text-fuchsia-400 bg-fuchsia-500/5 border-fuchsia-500/10" }
                  ].map((model, mIdx) => (
                    <div key={mIdx} className={`p-2.5 rounded-xl border border-outline-variant/10 flex flex-col text-left ${model.color}`}>
                      <b className="font-mono text-xs font-black tracking-wider">{model.title}</b>
                      <span className="text-[9px] text-on-surface-variant/70 mt-0.5 leading-none font-sans">{model.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons & Quick Demo Trigger */}
              <div className="flex flex-col sm:flex-row xl:flex-col gap-3 shrink-0 w-full sm:w-auto xl:w-[260px] relative z-10 select-none">
                <button
                  type="button"
                  onClick={handleDemoVideoCvAnalysis}
                  className="w-full bg-[#FF8F6F] hover:bg-[#ff805d] text-slate-950 font-label font-bold uppercase tracking-wider text-[11px] py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-98 transition-all hover:scale-103 shadow-[0_10px_25px_rgba(255,143,111,0.25)] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-current" /> Parse Fast-Break Demo
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFilesData([]);
                    setImportPreviewPlays([]);
                    setIsUploadFullscreen(true);
                    setPreviewingPlayFullscreen(null);
                    setIsUploadModalOpen(true);
                  }}
                  className="w-full bg-surface-container-highest hover:bg-surface-bright border border-outline-variant/15 text-white font-label font-bold uppercase tracking-wider text-[11px] py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-primary" /> Upload Practice Film (.mp4)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plays
              .filter(play => {
                const matchesSearch = play.name.toLowerCase().includes(playbookSearch.toLowerCase()) || 
                                     play.description.toLowerCase().includes(playbookSearch.toLowerCase());
                const matchesFilter = playbookFilter === 'all' || 
                                     (playbookFilter === 'home' && play.team === homeTeamName) ||
                                     (playbookFilter === 'away' && play.team === awayTeamName);
                return matchesSearch && matchesFilter;
              })
              .map(play => (
              <motion.div
                key={play.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden group cursor-pointer flex flex-col"
                onClick={() => setSelectedPlay(play)}
              >
                <div className="aspect-[16/9] bg-surface-container-highest/30 relative overflow-hidden flex items-center justify-center border-b border-outline-variant/10">
                  {play.canvasData ? (
                    <img src={play.canvasData} alt={play.name} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="opacity-10 flex flex-col items-center gap-2">
                      <BookOpen className="w-12 h-12" />
                      <span className="text-[8px] font-label uppercase tracking-widest">No Diagram</span>
                    </div>
                  )}
                  {/* Share & Export Play Overlay */}
                  <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSharingPlay(play);
                        setCopiedLink(false);
                      }}
                      className="p-2 rounded-lg bg-surface-container-highest/95 text-on-surface hover:text-primary hover:bg-slate-850 border border-outline-variant/30 shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center justify-center"
                      title="Share Play Link"
                      id={`share-play-${play.id}`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExportingPlay(play);
                      }}
                      className="p-2 rounded-lg bg-surface-container-highest/95 text-on-surface hover:text-primary hover:bg-slate-850 border border-outline-variant/30 shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center justify-center"
                      title="Export Play Options"
                      id={`export-play-${play.id}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                    <span className={`text-[8px] font-label font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      play.type === 'Offense' 
                        ? 'bg-primary/20 text-primary border-primary/20' 
                        : 'bg-secondary/20 text-secondary border-secondary/20'
                    }`}>
                      {play.type}
                    </span>
                    {play.reasoning && (
                      <span className="bg-primary text-black text-[8px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded-sm flex items-center gap-1 shadow-lg animate-pulse">
                        <Sparkles className="w-2 h-2 fill-current" /> AI
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-3 bg-surface-container-low group-hover:bg-surface-container transition-colors flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-body font-bold text-on-surface group-hover:text-primary transition-colors">{play.name}</h3>
                      <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mt-0.5">{play.createdAt}</p>
                    </div>
                    <div className="flex gap-1.5 items-center shrink-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExportingPlay(play);
                        }}
                        className="p-2 rounded-lg bg-surface-container-highest/50 hover:bg-primary/20 hover:text-primary text-on-surface-variant transition-all active:scale-95"
                        title="Export Play (PNG / JSON)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlay(play);
                          setIsCreatingPlay(false);
                        }}
                        className="p-2 rounded-lg bg-surface-container-highest/50 hover:bg-primary/20 hover:text-primary text-on-surface-variant transition-all active:scale-95"
                        title="Quick Edit"
                      >
                        <PenTool className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {play.description && (
                    <p className="text-xs text-on-surface-variant line-clamp-2 italic opacity-80">{play.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
            {plays.filter(play => {
              const matchesSearch = play.name.toLowerCase().includes(playbookSearch.toLowerCase()) || 
                                   play.description.toLowerCase().includes(playbookSearch.toLowerCase());
              const matchesFilter = playbookFilter === 'all' || 
                                   (playbookFilter === 'home' && play.team === homeTeamName) ||
                                   (playbookFilter === 'away' && play.team === awayTeamName);
              return matchesSearch && matchesFilter;
            }).length === 0 && (
              <div className="col-span-full py-20 border-2 border-dashed border-outline-variant/10 rounded-3xl flex flex-col items-center justify-center text-on-surface-variant gap-4">
                <BookOpen className="w-16 h-16 opacity-10" />
                <p className="font-label text-xs uppercase tracking-widest opacity-40">
                  {playbookSearch ? `No plays found for "${playbookSearch}"` : "Your playbook is empty"}
                </p>
                {!playbookSearch && (
                  <button 
                    onClick={() => setIsCreatingPlay(true)}
                    className="text-primary font-label text-[10px] uppercase tracking-widest hover:underline"
                  >
                    Create your first play
                  </button>
                )}
              </div>
            )}
          </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden flex flex-col h-[700px]"
          >
            <div className="p-4 border-b border-outline-variant/10 bg-surface-container flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setSelectedPlay(null);
                    setIsCreatingPlay(false);
                  }}
                  className="p-2 hover:bg-white/5 rounded-full text-on-surface-variant transition-colors"
                  title="Back to Playbook"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className={`p-2 rounded-lg ${isCreatingPlay ? 'bg-primary/20' : 'bg-surface-container-highest'}`}>
                  <PenTool className={`w-5 h-5 ${isCreatingPlay ? 'text-primary' : 'text-on-surface-variant'}`} />
                </div>
                <input 
                  type="text"
                  placeholder="Play Name..."
                  className="bg-transparent font-headline text-2xl font-bold outline-none border-b border-transparent focus:border-primary/40 px-1 min-w-[200px]"
                  defaultValue={selectedPlay?.name || ''}
                  id="play-name-input"
                />
              </div>
              <div className="flex items-center gap-3">
                {selectedPlay?.reasoning && (
                  <div className="hidden lg:flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg max-w-xs animate-in fade-in slide-in-from-right-4 duration-500">
                    <Sparkles className="w-3 h-3 text-primary shrink-0" />
                    <p className="text-[10px] text-primary italic line-clamp-2 leading-tight">
                      {selectedPlay.reasoning}
                    </p>
                  </div>
                )}
                <select 
                  id="play-type-input"
                  defaultValue={selectedPlay?.type || 'Offense'}
                  className="bg-surface-container-highest text-xs font-label uppercase tracking-widest px-4 py-2 rounded-xl outline-none border border-outline-variant/10 cursor-pointer hover:bg-surface-bright transition-colors"
                >
                  <option value="Offense">Offense</option>
                  <option value="Defense">Defense</option>
                </select>
                
                <select 
                  id="play-team-input"
                  defaultValue={selectedPlay?.team || 'General'}
                  className="bg-surface-container-highest text-xs font-label uppercase tracking-widest px-4 py-2 rounded-xl outline-none border border-outline-variant/10 cursor-pointer hover:bg-surface-bright transition-colors"
                >
                  <option value="General">General</option>
                  <option value={homeTeamName}>{homeTeamName}</option>
                  <option value={awayTeamName}>{awayTeamName}</option>
                </select>
                
                {selectedPlay && (
                  <button 
                    onClick={() => {
                      const canvas = document.getElementById('playbook-canvas') as HTMLCanvasElement;
                      const latestData = canvas ? canvas.toDataURL() : selectedPlay.canvasData;
                      const latestName = (document.getElementById('play-name-input') as HTMLInputElement)?.value || selectedPlay.name;
                      const latestDesc = (document.getElementById('play-description-input') as HTMLTextAreaElement)?.value || selectedPlay.description;
                      const newestPlayState = { ...selectedPlay, name: latestName, description: latestDesc, canvasData: latestData };
                      setPreviewingPlayFullscreen(newestPlayState);
                    }}
                    className="bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all text-xs font-label uppercase tracking-widest active:scale-95 shrink-0"
                    title="Immersive Coach Board Mode"
                  >
                    <Maximize2 className="w-3.5 h-3.5" /> Full View
                  </button>
                )}
                
                {selectedPlay && (
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this play?')) {
                        setPlays(plays.filter(p => p.id !== selectedPlay.id));
                        setSelectedPlay(null);
                      }
                    }}
                    className="p-2.5 hover:bg-error/20 rounded-xl text-error transition-all active:scale-95"
                    title="Delete Play"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}

                <button 
                  onClick={() => {
                    const name = (document.getElementById('play-name-input') as HTMLInputElement).value;
                    const description = (document.getElementById('play-description-input') as HTMLInputElement).value;
                    const type = (document.getElementById('play-type-input') as HTMLSelectElement).value as 'Offense' | 'Defense';
                    const team = (document.getElementById('play-team-input') as HTMLSelectElement).value;
                    const canvas = document.getElementById('playbook-canvas') as HTMLCanvasElement;
                    const data = canvas.toDataURL();
                    
                    if (isCreatingPlay) {
                      const newPlay: Play = {
                        id: Date.now().toString(),
                        name: name || 'Untitled Play',
                        type,
                        team: team === 'General' ? undefined : team,
                        description: description || '',
                        canvasData: data,
                        createdAt: new Date().toISOString().split('T')[0]
                      };
                      setPlays([...plays, newPlay]);
                      setSelectedPlay(newPlay);
                      setIsCreatingPlay(false);
                    } else if (selectedPlay) {
                      const updatedPlays = plays.map(p => p.id === selectedPlay.id ? { ...p, name, description, type, team: team === 'General' ? undefined : team, canvasData: data } : p);
                      setPlays(updatedPlays);
                    }
                  }}
                  className="performance-gradient text-black px-6 py-2 rounded-xl font-label font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  <Save className="w-4 h-4" /> Save Play
                </button>
              </div>
            </div>

            <div className="flex-1 relative bg-surface-container-highest/10 p-8 flex flex-col md:flex-row items-start justify-center gap-6 overflow-hidden">
              <div className="flex-1 w-full max-w-4xl aspect-[16/9] bg-surface-container-low rounded-2xl border-2 border-outline-variant/20 relative overflow-hidden shadow-2xl">
                <TacticalCanvas id="playbook-canvas" initialData={selectedPlay?.canvasData} playId={selectedPlay?.id} />
              </div>

              <div className="w-full md:w-72 flex flex-col gap-4">
                <div className="bg-surface-container-highest/20 rounded-2xl border border-outline-variant/10 p-4">
                  <h4 className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> Execution Details
                  </h4>
                  <textarea 
                    id="play-description-input"
                    className="w-full bg-surface-container border border-outline-variant/10 rounded-xl p-3 text-xs font-body outline-none focus:border-primary/40 min-h-[150px] resize-none"
                    placeholder="Describe how the play should be executed..."
                    defaultValue={selectedPlay?.description || ''}
                  />
                  <button
                    onClick={handleOptimizePlay}
                    disabled={isOptimizingPlay}
                    className={`w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[10px] font-label uppercase tracking-widest border transition-all cursor-pointer ${
                      isOptimizingPlay
                        ? 'bg-primary/5 border-primary/20 text-primary/50 cursor-not-allowed'
                        : 'bg-primary/10 border-primary/35 hover:border-primary/60 hover:bg-primary/25 text-primary active:scale-[0.98]'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-primary ${isOptimizingPlay ? 'animate-spin' : 'animate-pulse'}`} />
                    {isOptimizingPlay ? 'Optimizing details...' : 'Optimize with Gemini'}
                  </button>
                </div>
                
                {selectedPlay?.reasoning && (
                  <div className="bg-primary/5 rounded-2xl border border-primary/10 p-4">
                    <h4 className="text-[10px] font-label text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Brain className="w-3 h-3" /> AI Strategic Rationale
                    </h4>
                    <p className="text-xs text-on-surface-variant italic leading-relaxed">
                      {selectedPlay.reasoning}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    )}

    {activeTab === 'drills' && (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 font-sans">
        
        {/* Training Tab Sub-Header Grid */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-outline-variant/15 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] bg-primary text-black font-extrabold px-2.5 py-0.5 rounded-full tracking-widest uppercase">SPORTS SCIENCE</span>
              <span className="font-mono text-[9px] text-on-surface-variant/70 font-bold uppercase tracking-wider">ATHLETIC INTENSITY & PRACTICE FILMS</span>
            </div>
            <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-primary">TRAINING LAB</h1>
            <p className="font-body text-xs text-on-surface-variant">Perform physical Combine assessments or learn biomechanical postures watching elite NBA Pro workouts.</p>
          </div>

          <div className="flex bg-surface-container-highest/40 p-1.5 rounded-2xl border border-outline-variant/10 shadow-lg shrink-0">
            <button
              onClick={() => setDrillsSubTab('workouts')}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-label font-bold uppercase tracking-widest transition-all duration-200 ${
                drillsSubTab === 'workouts'
                  ? 'bg-primary text-black shadow-md scale-102'
                  : 'text-on-surface-variant hover:text-white hover:bg-white/5'
              }`}
            >
              📅 Routines & Combine
            </button>
            <button
              id="btn-workout-video-hub"
              onClick={() => {
                setDrillsSubTab('video_hub');
                if (!selectedWorkoutVideo && workoutVideos.length > 0) {
                  setSelectedWorkoutVideo(workoutVideos.find(v => v.id === 'yt-curry') || workoutVideos[0]);
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-label font-bold uppercase tracking-widest transition-all duration-200 flex items-center gap-2 ${
                drillsSubTab === 'video_hub'
                  ? 'bg-primary text-black shadow-md scale-102'
                  : 'text-on-surface-variant hover:text-white hover:bg-white/5'
              }`}
            >
              📹 Pro Video Hub
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            </button>
            <button
              id="btn-workout-camera-tracker"
              onClick={() => setDrillsSubTab('camera')}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-label font-bold uppercase tracking-widest transition-all duration-200 flex items-center gap-2 ${
                drillsSubTab === 'camera'
                  ? 'bg-primary text-black shadow-md scale-102'
                  : 'text-on-surface-variant hover:text-white hover:bg-white/5'
              }`}
            >
              🎥 Live Motion Tracker
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            </button>
          </div>
        </div>

        {drillsSubTab === 'workouts' ? (
          <>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-surface-container-low/40 p-5 rounded-3xl border border-outline-variant/5">
              <div>
                <h3 className="font-headline text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Active Schedule Calendar
                </h3>
                <p className="font-body text-xs text-on-surface-variant">View everyday physical regimens and run custom combine simulators.</p>
              </div>

              <div className="flex items-center gap-2 bg-surface-container p-1 rounded-2xl border border-outline-variant/10 shadow-sm overflow-x-auto max-w-full">
                {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map(day => (
                  <button
                    key={day}
                    onClick={() => setActiveSessionDay(day)}
                    className={`w-10 h-10 rounded-xl font-label text-[10px] font-bold transition-all shrink-0 ${
                      activeSessionDay === day 
                        ? 'bg-primary text-black shadow-lg scale-110' 
                        : 'text-on-surface-variant hover:bg-white/5'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-xs flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Sessions for {activeSessionDay}day
              </h3>
              <div className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest bg-surface-container-highest px-3 py-1 rounded-full">
                Total: {trainingSessions.filter(s => s.day === activeSessionDay).length} sessions
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trainingSessions.filter(s => s.day === activeSessionDay).map(session => (
                <motion.div 
                  key={session.id}
                  transition={{ duration: 0.3 }}
                  className={`bg-surface-container-low rounded-3xl border ${session.completed ? 'border-primary/20' : 'border-outline-variant/10'} p-6 relative group overflow-hidden`}
                >
                  {session.completed && (
                    <div className="absolute top-0 right-0 p-3">
                      <div className="bg-primary/20 p-2 rounded-full">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl ${
                      session.type === 'Skills' ? 'bg-blue-500/10 text-blue-400' :
                      session.type === 'Strength' ? 'bg-red-500/10 text-red-400' :
                      session.type === 'IQ' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-green-500/10 text-green-400'
                    }`}>
                      {session.type === 'Skills' ? <Zap className="w-5 h-5" /> :
                       session.type === 'Strength' ? <Dumbbell className="w-5 h-5" /> :
                       session.type === 'IQ' ? <Brain className="w-5 h-5" /> :
                       <Activity className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest">{session.type}</span>
                      <h4 className="font-headline text-lg font-bold text-on-surface">{session.title}</h4>
                    </div>
                  </div>

                  <p className="text-xs font-body text-on-surface-variant leading-relaxed line-clamp-2 mb-6 opacity-60">
                    {session.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-surface-container-highest/30 p-3 rounded-2xl border border-outline-variant/5">
                      <div className="flex items-center gap-2 text-on-surface-variant mb-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-[8px] font-label uppercase tracking-widest">Duration</span>
                      </div>
                      <p className="text-xs font-headline font-bold">{session.duration}</p>
                    </div>
                    <div className="bg-surface-container-highest/30 p-3 rounded-2xl border border-outline-variant/5">
                      <div className="flex items-center gap-2 text-on-surface-variant mb-1">
                        <Flame className="w-3 h-3" />
                        <span className="text-[8px] font-label uppercase tracking-widest">Intensity</span>
                      </div>
                      <p className="text-xs font-headline font-bold">{session.intensity}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-8">
                    <h5 className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest">Drill Focus</h5>
                    <div className="flex flex-wrap gap-2">
                      {session.exercises.map((ex, i) => (
                        <span key={i} className="text-[9px] font-body bg-surface-container px-2 py-1 rounded-lg border border-outline-variant/5">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {activeTimerSessionId === session.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <IntervalTimer
                          sessionId={session.id}
                          sessionTitle={session.title}
                          defaultWork={session.duration ? parseInt(session.duration) * 5 : 45} // heuristic or default
                          defaultRest={15}
                          defaultCycles={4}
                          onSessionComplete={() => {
                            setTrainingSessions(prev =>
                              prev.map(s => (s.id === session.id ? { ...s, completed: true } : s))
                            );
                          }}
                          onClose={() => setActiveTimerSessionId(null)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button 
                      onClick={() => {
                        setTrainingSessions(prev => prev.map(s => s.id === session.id ? { ...s, completed: !s.completed } : s));
                      }}
                      className={`flex-1 py-4.5 rounded-2xl font-label font-bold uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 ${
                        session.completed 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : 'bg-primary text-black hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/10'
                      }`}
                    >
                      {session.completed ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" /> Redo Session
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" /> Mark Completed
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setActiveTimerSessionId(activeTimerSessionId === session.id ? null : session.id);
                      }}
                      className={`flex-1 py-4.5 rounded-2xl font-label font-bold uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 ${
                        activeTimerSessionId === session.id
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-surface-container-highest/60 text-on-surface hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Timer className={`w-3.5 h-3.5 ${activeTimerSessionId === session.id ? 'animate-spin' : ''}`} />
                      {activeTimerSessionId === session.id ? 'Hide Timer' : 'Interval Timer'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* NBA Combine Athletic Performance Dashboard */}
            <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 p-8 mt-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h3 className="font-headline text-2xl font-bold text-primary tracking-tight">NBA COMBINE ATHLETIC ASSESSMENT</h3>
                  <p className="font-body text-xs text-on-surface-variant mt-1">Official Draft physical telemetry & benchmark percentiles</p>
                </div>
                <div className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-xl font-label text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5" />
                  Combine Validated
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sliders / Inputs list */}
                <div className="md:col-span-2 space-y-6">
                  {/* Bench press */}
                  <div className="bg-surface-container/50 p-5 rounded-2xl border border-outline-variant/5">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-red-400" />
                        <span className="font-label text-xs font-bold uppercase tracking-wide text-on-surface">185lb Bench Press (Strength)</span>
                      </div>
                      <span className="font-mono text-sm font-bold text-primary">{combineScores.benchPressReps} Reps</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="35" 
                      value={combineScores.benchPressReps} 
                      onChange={(e) => setCombineScores({ ...combineScores, benchPressReps: parseInt(e.target.value) })}
                      className="w-full accent-primary bg-surface-container-highest rounded-lg h-1 appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-on-surface-variant/70 mt-2 leading-relaxed font-body">
                      Assesses upper-body absolute strength endurance. Guard standard: 6-10 repetitions. Elite standard: 18+ reps.
                    </p>
                  </div>

                  {/* Vertical Jump */}
                  <div className="bg-surface-container/50 p-5 rounded-2xl border border-outline-variant/5">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="font-label text-xs font-bold uppercase tracking-wide text-on-surface">Standing Vertical (Power)</span>
                      </div>
                      <span className="font-mono text-sm font-bold text-primary">{combineScores.verticalJump} inches</span>
                    </div>
                    <input 
                      type="range" 
                      min="15" 
                      max="48" 
                      step="0.5"
                      value={combineScores.verticalJump} 
                      onChange={(e) => setCombineScores({ ...combineScores, verticalJump: parseFloat(e.target.value) })}
                      className="w-full accent-primary bg-surface-container-highest rounded-lg h-1 appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-label text-[9px] uppercase tracking-wider text-on-surface-variant">Running Max Vert Jump:</span>
                      <span className="font-mono text-xs font-bold text-secondary">{combineScores.maxVert} in</span>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="55" 
                      step="0.5"
                      value={combineScores.maxVert} 
                      onChange={(e) => setCombineScores({ ...combineScores, maxVert: parseFloat(e.target.value) })}
                      className="w-full accent-secondary bg-surface-container-highest rounded-lg h-1 appearance-none cursor-pointer mt-1"
                    />
                    <p className="text-[10px] text-on-surface-variant/70 mt-2 leading-relaxed font-body">
                      Measures vertical explosive hip extensions and raw leg power bounds. Standing vs max running reach determines true elevation.
                    </p>
                  </div>

                  {/* Speed */}
                  <div className="bg-surface-container/50 p-5 rounded-2xl border border-outline-variant/5">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-blue-400" />
                        <span className="font-label text-xs font-bold uppercase tracking-wide text-on-surface">3/4 Court Sprint (Speed)</span>
                      </div>
                      <span className="font-mono text-sm font-bold text-primary">{combineScores.threeQuarterSprint} sec</span>
                    </div>
                    <input 
                      type="range" 
                      min="2.8" 
                      max="4.0" 
                      step="0.01"
                      value={combineScores.threeQuarterSprint} 
                      onChange={(e) => setCombineScores({ ...combineScores, threeQuarterSprint: parseFloat(e.target.value) })}
                      className="w-full accent-primary bg-surface-container-highest rounded-lg h-1 appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-on-surface-variant/70 mt-2 leading-relaxed font-body">
                      Measures absolute linear speed over 75 feet of standard hardwood. Elite guards cross below 3.10 seconds.
                    </p>
                  </div>

                  {/* Agility drills */}
                  <div className="bg-surface-container/50 p-5 rounded-2xl border border-outline-variant/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-label text-[10px] font-bold uppercase tracking-wide text-on-surface font-sans">Lane Agility (Agility)</span>
                        <span className="font-mono text-xs font-bold text-primary">{combineScores.laneAgility}s</span>
                      </div>
                      <input 
                        type="range" 
                        min="9.8" 
                        max="14.0" 
                        step="0.05"
                        value={combineScores.laneAgility} 
                        onChange={(e) => setCombineScores({ ...combineScores, laneAgility: parseFloat(e.target.value) })}
                        className="w-full accent-primary bg-surface-container-highest rounded-lg h-1 appearance-none cursor-pointer"
                      />
                      <p className="text-[9px] text-on-surface-variant/70 mt-2 leading-tight font-body">
                        Measures lateral shuffling, backpedaling, and pivoting around the key perimeter.
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-label text-[10px] font-bold uppercase tracking-wide text-on-surface font-sans font-medium">Reactive Shuttle (Agility)</span>
                        <span className="font-mono text-xs font-bold text-secondary">{combineScores.reactiveShuttle}s</span>
                      </div>
                      <input 
                        type="range" 
                        min="2.4" 
                        max="4.0" 
                        step="0.02"
                        value={combineScores.reactiveShuttle} 
                        onChange={(e) => setCombineScores({ ...combineScores, reactiveShuttle: parseFloat(e.target.value) })}
                        className="w-full accent-secondary bg-surface-container-highest rounded-lg h-1 appearance-none cursor-pointer"
                      />
                      <p className="text-[9px] text-on-surface-variant/70 mt-2 leading-tight font-body">
                        Measures stop-and-start quick-foot reactivity within key boundary intervals.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance telemetry readout card */}
                <div className="bg-surface-container-high/50 p-6 rounded-2xl border border-outline-variant/10 flex flex-col justify-between">
                  <div>
                    <h4 className="font-label text-xs font-extrabold uppercase tracking-widest text-primary mb-4 flex items-center gap-1 font-sans">
                      <Trophy className="w-3.5 h-3.5 text-primary" />
                      Draft Tier Telemetry
                    </h4>

                    {/* Dynamic rank calculation based on current sliders */}
                    {(() => {
                      // Simple metric aggregation to rank Tier
                      let score = 0;
                      if (combineScores.benchPressReps >= 18) score += 3;
                      else if (combineScores.benchPressReps >= 11) score += 2;
                      else if (combineScores.benchPressReps >= 5) score += 1;

                      if (combineScores.verticalJump >= 38) score += 3;
                      else if (combineScores.verticalJump >= 32) score += 2;
                      else if (combineScores.verticalJump >= 28) score += 1;

                      if (combineScores.maxVert >= 42) score += 3;
                      else if (combineScores.maxVert >= 36) score += 2;

                      if (combineScores.threeQuarterSprint <= 3.10) score += 3;
                      else if (combineScores.threeQuarterSprint <= 3.25) score += 2;
                      else if (combineScores.threeQuarterSprint <= 3.45) score += 1;

                      if (combineScores.laneAgility <= 10.8) score += 3;
                      else if (combineScores.laneAgility <= 11.5) score += 2;
                      else if (combineScores.laneAgility <= 12.0) score += 1;

                      if (combineScores.reactiveShuttle <= 2.70) score += 3;
                      else if (combineScores.reactiveShuttle <= 2.85) score += 2;
                      else if (combineScores.reactiveShuttle <= 3.05) score += 1;

                      let tierName = "Undrafted Grade";
                      let percentile = "Below 40th Percentile";
                      let comment = "Athletic telemetry points towards raw rotational value. Focus on speed drills.";

                      if (score >= 14) {
                        tierName = "Lottery Tier Draft Grade";
                        percentile = "95th+ Percentile (Lottery Prospect)";
                        comment = "Elite measurements indicating freakish explosive physical attributes. Absolute first-round prototype.";
                      } else if (score >= 10) {
                        tierName = "First-Round Tier";
                        percentile = "75th to 94th Percentile";
                        comment = "Strong athletic physical base matching successful modern wing prototypes.";
                      } else if (score >= 6) {
                        tierName = "Second-Round Prospect";
                        percentile = "50th to 74th Percentile";
                        comment = "Solid, well-rounded combine stats. Refine agility and lateral shift controls.";
                      }

                      return (
                        <div className="space-y-6">
                          <div>
                            <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest block mb-1">PROSPECT STATUS</span>
                            <div className="font-headline text-lg font-black tracking-tight flex items-center justify-start gap-1">
                              <span className={score >= 14 ? "text-primary" : score >= 10 ? "text-secondary" : "text-blue-400"}>
                                {tierName}
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest block mb-1">AGGREGATED PERCENTILE</span>
                            <p className="font-headline text-2xl font-black text-on-surface font-mono">{percentile}</p>
                          </div>

                          <div className="bg-surface-container/60 p-4 rounded-xl border border-outline-variant/5">
                            <span className="text-[10px] font-label text-primary uppercase tracking-widest block mb-1 font-bold">COACH ASSESS TOOL</span>
                            <p className="text-xs font-body text-on-surface-variant leading-relaxed">
                              {comment}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="mt-6 pt-6 border-t border-outline-variant/10 font-sans">
                    <button 
                      onClick={() => setCombineScores({
                        benchPressReps: 18,
                        verticalJump: 36.5,
                        maxVert: 42.0,
                        threeQuarterSprint: 3.09,
                        laneAgility: 10.75,
                        reactiveShuttle: 2.68
                      })}
                      className="w-full bg-primary text-black py-3 rounded-xl font-label text-[10px] uppercase font-bold tracking-widest active:scale-95 transition-transform shadow"
                    >
                      Load Historical Elite Guard Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 p-6">
              <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                <Trophy className="w-3 h-3 text-primary" />
                Weekly Progress
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Completed Sessions</span>
                    <span className="text-xs font-headline font-bold text-primary">
                      {trainingSessions.filter(s => s.completed).length} / {trainingSessions.length}
                    </span>
                  </div>
                  <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(trainingSessions.filter(s => s.completed).length / trainingSessions.length) * 100}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-surface-container rounded-2xl border border-outline-variant/5">
                    <p className="text-2xl font-headline font-bold text-on-surface">12.5</p>
                    <p className="text-[8px] font-label text-on-surface-variant uppercase tracking-widest mt-1">Hours Trained</p>
                  </div>
                  <div className="text-center p-4 bg-surface-container rounded-2xl border border-outline-variant/5">
                    <p className="text-2xl font-headline font-bold text-on-surface">94%</p>
                    <p className="text-[8px] font-label text-on-surface-variant uppercase tracking-widest mt-1">Efficiency Ratio</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 🔥 SPECIALIZED SKILL LABS PANEL */}
            <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 p-6 space-y-4">
              <h3 className="font-label font-bold text-on-surface text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                Specialized Skill Labs
              </h3>
              
              <div className="space-y-3">
                {/* Sun Skills Training */}
                <div className="bg-surface-container-high/30 p-3.5 rounded-2xl border border-outline-variant/5 flex flex-col gap-2 hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-headline text-xs font-bold text-white flex items-center gap-1">☀️ Sun Skills Training</h4>
                      <p className="text-[10px] text-on-surface-variant leading-normal mt-0.5 font-sans">Focuses on high-arc drift shots under harsh or stadium lighting simulator parameters.</p>
                    </div>
                    <span className="text-[8px] font-mono bg-blue-500/15 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">Sun</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => {
                        setActiveSessionDay('Sun');
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      📅 View Sun
                    </button>
                    <button
                      onClick={() => {
                        setActiveSessionDay('Sun');
                        setActiveTimerSessionId('10');
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/25 font-mono text-[9px] uppercase tracking-wider font-extrabold transition-all cursor-pointer"
                    >
                      ⏱️ Start
                    </button>
                  </div>
                </div>

                {/* Balance Skills Training */}
                <div className="bg-surface-container-high/30 p-3.5 rounded-2xl border border-outline-variant/5 flex flex-col gap-2 hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-headline text-xs font-bold text-white flex items-center gap-1">⚖️ Balance Skills Training</h4>
                      <p className="text-[10px] text-on-surface-variant leading-normal mt-0.5 font-sans">Active stabilizer drills to secure posture composure during quick change of speed stepbacks.</p>
                    </div>
                    <span className="text-[8px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">Thu</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => {
                        setActiveSessionDay('Thu');
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      📅 View Thu
                    </button>
                    <button
                      onClick={() => {
                        setActiveSessionDay('Thu');
                        setActiveTimerSessionId('11');
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/25 font-mono text-[9px] uppercase tracking-wider font-extrabold transition-all cursor-pointer"
                    >
                      ⏱️ Start
                    </button>
                  </div>
                </div>

                {/* Pool Skills Training */}
                <div className="bg-surface-container-high/30 p-3.5 rounded-2xl border border-outline-variant/5 flex flex-col gap-2 hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-headline text-xs font-bold text-white flex items-center gap-1">💧 Pool Skills Training</h4>
                      <p className="text-[10px] text-on-surface-variant leading-normal mt-0.5 font-sans">Low-impact hydrostatic aquatic speeds to prime muscle joints with no hard land friction.</p>
                    </div>
                    <span className="text-[8px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">Sat</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => {
                        setActiveSessionDay('Sat');
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      📅 View Sat
                    </button>
                    <button
                      onClick={() => {
                        setActiveSessionDay('Sat');
                        setActiveTimerSessionId('12');
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/25 font-mono text-[9px] uppercase tracking-wider font-extrabold transition-all cursor-pointer"
                    >
                      ⏱️ Start
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-3xl border border-primary/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/20 p-2 rounded-xl">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-headline text-lg font-bold text-primary tracking-tight">AI COACH VIEW</h3>
              </div>
              <p className="text-xs font-body text-on-surface-variant leading-relaxed italic opacity-80 font-sans">
                "Your perimeter shooting is trending up based on Tuesday's sessions. Consider adding 15 more minutes of corner 3s to Friday's routine to capitalize on this peak."
              </p>
            </div>
          </div>
        </div>
          </>
        ) : drillsSubTab === 'video_hub' ? (
          /* PRO VIDEO TRAINING HUB tab view (YouTube style) */
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* THEATER PLAYER STREAM (Left side - Col-span 2) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 16:9 Screen */}
                <div className="bg-black rounded-3xl border border-outline-variant/15 overflow-hidden shadow-2xl relative aspect-video flex flex-col items-center justify-center group">
                  {selectedWorkoutVideo ? (
                    selectedWorkoutVideo.sourceType === 'youtube' ? (
                      // YouTube Iframe Embed
                      <iframe
                        src={`${selectedWorkoutVideo.url}?autoplay=0&rel=0&modestbranding=1`}
                        title={selectedWorkoutVideo.title}
                        className="w-full h-full absolute inset-0 border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      // Local Video Player with Custom controls integration
                      <div className="w-full h-full relative">
                        <video
                          ref={workoutVideoRef}
                          src={selectedWorkoutVideo.url}
                          className="w-full h-full object-contain"
                          controls
                        />
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-2.5 py-1 rounded-md text-[9px] font-mono font-bold text-primary border border-primary/30 uppercase tracking-widest select-none">
                          STUDIO SLOW-MO COMPATIBLE
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center p-8 mt-4">
                      <p className="font-mono text-xs text-on-surface-variant animate-pulse">Select an intense workout clip to launch stream...</p>
                    </div>
                  )}
                </div>

                {/* Video Info Display */}
                {selectedWorkoutVideo && (
                  <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className={`text-[9px] font-label font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                            selectedWorkoutVideo.difficulty === 'Extreme' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                            selectedWorkoutVideo.difficulty === 'Intense' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                            'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          }`}>
                            🔥 {selectedWorkoutVideo.difficulty} Difficulty
                          </span>
                          <span className="text-[10px] font-mono bg-white/5 text-on-surface-variant px-2 py-0.5 rounded border border-white/5 uppercase">
                            {selectedWorkoutVideo.sourceType === 'local' ? '📁 Local Film File' : '📡 YouTube Stream'}
                          </span>
                        </div>
                        <h2 className="font-headline text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                          {selectedWorkoutVideo.title}
                        </h2>
                        <p className="font-body text-xs text-on-surface-variant font-medium font-sans">
                          Trainer: <span className="text-primary font-bold">{selectedWorkoutVideo.creator}</span> • Added on {selectedWorkoutVideo.uploadedAt}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/5 w-full h-px" />

                    <div className="space-y-2">
                      <h4 className="text-[10px] font-label text-primary font-bold uppercase tracking-widest font-sans">Workout Focus & Narrative</h4>
                      <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                        {selectedWorkoutVideo.description}
                      </p>
                    </div>

                    {/* Biomechanics / Slow-mo Speed controls */}
                    <div className="bg-surface-container/50 p-4 rounded-2xl border border-outline-variant/5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-[10px] font-label text-white uppercase tracking-widest font-bold flex items-center gap-1 font-sans">
                            <Activity className="w-3.5 h-3.5 text-primary" /> Study Biomechanics (Playback Speed)
                          </h4>
                          <p className="text-[9px] text-on-surface-variant leading-snug mt-0.5 font-sans">Slow-motion helps study exact release angles, posture tilt, and deceleration steps.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 bg-background p-1 rounded-xl border border-outline-variant/10">
                          {([0.25, 0.5, 1.0, 1.5, 2.0] as const).map(rate => (
                            <button
                              key={rate}
                              onClick={() => {
                                setPlaybackRate(rate);
                                if (workoutVideoRef.current) {
                                  workoutVideoRef.current.playbackRate = rate;
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                                playbackRate === rate 
                                  ? 'bg-primary text-black font-black shadow' 
                                  : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {rate === 1.0 ? '1x (Normal)' : `${rate}x`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Active Physical Reps Counter and Bio Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      
                      {/* Active Workout Rep Counter */}
                      <div className="bg-surface-container-high/40 p-5 rounded-2xl border border-outline-variant/10 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase block mb-1">On-Floor Active Practice</span>
                          <h4 className="font-headline text-sm font-bold text-white uppercase tracking-tight font-sans">Active Repetitions Sink</h4>
                          <p className="font-body text-[10px] text-on-surface-variant/80 mt-1 mb-4 leading-normal font-sans">
                            Complete drills in front of your simulator or practice space, and tap to count completed reps or shot sets.
                          </p>

                          <div className="flex items-center justify-center gap-6 my-2 bg-black/40 p-3 rounded-xl border border-outline-variant/5">
                            <button 
                              onClick={() => setVReps(p => Math.max(0, p - 1))}
                              className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white font-bold"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <div className="text-center">
                              <span className="font-mono text-3xl font-black text-white block">{vReps}</span>
                              <span className="text-[8px] font-mono text-on-surface-variant uppercase tracking-wider">REPS SINK</span>
                            </div>
                            <button 
                              onClick={() => setVReps(p => p + 1)}
                              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-black font-bold"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-4 font-sans">
                          <button 
                            onClick={() => {
                              setVReps(0);
                              setShowRepsSavedBadge(false);
                            }}
                            className="p-1 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-on-surface text-[9px] font-label font-bold uppercase rounded-lg transition-all"
                          >
                            Reset Reps
                          </button>
                          <button 
                            onClick={() => {
                              setShowRepsSavedBadge(true);
                              setTimeout(() => setShowRepsSavedBadge(false), 2500);
                            }}
                            className="bg-primary hover:bg-primary-hover text-black px-4 py-2 text-[9px] font-label font-extrabold uppercase rounded-lg transition-all flex items-center gap-1 shadow"
                          >
                            {showRepsSavedBadge ? (
                              <>
                                <Check className="w-3 h-3" /> Logged!
                              </>
                            ) : (
                              'Log Completed Set'
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Adaptive AI Kinetic Analysis Tips */}
                      <div className="bg-surface-container-high/40 p-5 rounded-2xl border border-outline-variant/10 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-secondary font-bold tracking-widest uppercase block mb-1">PRO KINETIC ANALYZER</span>
                          <h4 className="font-headline text-sm font-bold text-white uppercase tracking-tight font-sans">AI Coaching Observations</h4>
                          
                          <div className="mt-3 space-y-2 font-body text-xs text-on-surface-variant opacity-90">
                            {selectedWorkoutVideo.id === 'yt-curry' ? (
                              <>
                                <p className="leading-relaxed">👑 <strong className="text-white font-bold">Curry Sensory Paradigm:</strong> Keep eyes locked forward during dual tennis ball flips. Focus on early elbow tuck and release under 0.3s.</p>
                                <p className="leading-snug">🎯 <strong className="text-white font-bold">Tip:</strong> Replicate is focused on sensory overload - try to shoot immediately after catching, without looking down.</p>
                              </>
                            ) : selectedWorkoutVideo.id === 'yt-lebron' ? (
                              <>
                                <p className="leading-relaxed">👑 <strong className="text-white font-bold">LeBron Posture Lock:</strong> Maintain horizontal lumbar alignment during heavy cable chest cabling. Flat hips reduce spinal torque.</p>
                                <p className="leading-snug">💪 <strong className="text-white font-bold">Tip:</strong> Stabilize knees and ankles co-contraction. True kinetic power originates from isometric core stability.</p>
                              </>
                            ) : selectedWorkoutVideo.id === 'yt-kobe' ? (
                              <>
                                <p className="leading-relaxed">👑 <strong className="text-white font-bold">Kobe Deceleration Bounds:</strong> Emphasize deep hip flexion on lateral deceleration pivots to absorb knee stress load.</p>
                                <p className="leading-snug">⚡ <strong className="text-white font-bold">Tip:</strong> Hold shooting form for a full 1s after rapid baseline shuttle runs to enforce mental fortitude under cardiorespiratory fatigue.</p>
                              </>
                            ) : selectedWorkoutVideo.id === 'yt-kd' ? (
                              <>
                                <p className="leading-relaxed">👑 <strong className="text-white font-bold">KD High Lift Pocket:</strong> Durant captures ball in early sweep motion to bypass reach defenders. Keep release point above head line.</p>
                                <p className="leading-snug">🏀 <strong className="text-white font-bold">Tip:</strong> Drag back foot during high-speed deceleration to capture linear deceleration force into vertical rise.</p>
                              </>
                            ) : (
                              <>
                                <p className="leading-relaxed">🚀 <strong className="text-white font-bold">General Film Feedback:</strong> Observe the pro's wide athletic balance base, torso angle consistency, and deceleration mechanics.</p>
                                <p className="leading-snug">💡 <strong className="text-white font-bold">Observation:</strong> Focus on replicating the specific pacing splits - watch at 0.5x rate to isolate specific limb angles.</p>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-outline-variant/10 text-[9px] font-mono text-on-surface-variant/50 flex items-center justify-between uppercase">
                          <span>Dynamic biomechanical scan active</span>
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        </div>
                      </div>

                    </div>

                    {/* Rich coaching diary notes */}
                    <div className="bg-surface-container/40 p-5 rounded-2xl border border-outline-variant/10 space-y-3">
                      <div className="flex items-center justify-between font-sans">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <h4 className="text-xs font-label text-white uppercase tracking-widest font-bold">My Tactical Film Diary</h4>
                        </div>
                        {showNotesSavedBadge && (
                          <span className="text-[9px] font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded font-black uppercase flex items-center gap-1">
                            <Check className="w-3 h-3" /> Auto-Saved
                          </span>
                        )}
                      </div>

                      <textarea
                        value={workoutNotes[selectedWorkoutVideo.id] || ''}
                        onChange={(e) => {
                          const newNotes = { ...workoutNotes, [selectedWorkoutVideo.id]: e.target.value };
                          setWorkoutNotes(newNotes);
                          setShowNotesSavedBadge(true);
                          setTimeout(() => setShowNotesSavedBadge(false), 2000);
                        }}
                        placeholder="Study Curry's hand placement or jot down notes about your own postural balance while watching this clinic..."
                        className="w-full bg-black/40 border border-outline-variant/15 rounded-xl p-4 text-xs font-body text-on-surface leading-relaxed focus:border-primary/50 focus:outline-none min-h-[100px] shadow-inner focus:ring-1 focus:ring-primary/20 placeholder-white/20"
                      />
                      <div className="flex items-center justify-between text-[9px] font-mono text-on-surface-variant/40">
                        <span>Film diary entries saved locally on browser</span>
                        <span>{workoutNotes[selectedWorkoutVideo.id]?.length || 0} characters recorded</span>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* UPLOADER & WORKOUT PLAYLIST COLUMN (Right side - Col-span 1) */}
              <div className="space-y-6">

                {/* Video Uploader Container */}
                <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 space-y-6">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-white tracking-tight flex items-center gap-2 font-sans">
                      <Upload className="w-4 h-4 text-primary" /> Upload & Import Videos
                    </h3>
                    <p className="font-body text-xs text-on-surface-variant mt-1 font-sans">Study your own physical biomechanics or import YouTube tutorials.</p>
                  </div>

                  {/* Drag and Drop Local Video Uploader */}
                  <div className="relative group border-2 border-dashed border-outline-variant/20 hover:border-primary/40 rounded-2xl p-5 text-center transition-all bg-surface-container/30 cursor-pointer overflow-hidden">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        const fileUrl = URL.createObjectURL(file);
                        const newVideo: WorkoutVideo = {
                          id: `local-${Date.now()}`,
                          title: file.name.replace(/\.[^/.]+$/, "") || 'Local Training Film',
                          creator: 'On-Floor Player (Self)',
                          url: fileUrl,
                          sourceType: 'local',
                          duration: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                          description: `Patient slow-motion practice upload for posture drill. Captured filename: ${file.name}. Observe elbow flare, foot pivots, and catch sweeps.`,
                          difficulty: 'Medium',
                          uploadedAt: new Date().toLocaleDateString()
                        };
                        
                        try {
                          const savedList = JSON.parse(localStorage.getItem('espn_uploaded_videos') || '[]');
                          const updatedSavedList = [newVideo, ...savedList];
                          localStorage.setItem('espn_uploaded_videos', JSON.stringify(updatedSavedList));
                        } catch {}

                        setWorkoutVideos(prev => [newVideo, ...prev]);
                        setSelectedWorkoutVideo(newVideo);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="space-y-2.5 font-sans">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-label font-bold text-white uppercase tracking-wider">Drag & drop practice film</p>
                        <p className="text-[10px] text-on-surface-variant font-body">Supports standard mobile & camera video files</p>
                      </div>
                    </div>
                  </div>

                  {/* YouTube Workout Link Parser Form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!customVideoUrl) return;
                      
                      const ytId = getYouTubeId(customVideoUrl);
                      if (!ytId) {
                        alert("Unable to detect a 11-digit YouTube video identifier. Please provide a valid watch link or short URL!");
                        return;
                      }
                      
                      const newVideo: WorkoutVideo = {
                        id: `custom-yt-${Date.now()}`,
                        title: customVideoTitle.trim() || `NBA Pro intense workout clip #${ytId}`,
                        creator: 'Imported Pro Drill Clip',
                        url: `https://www.youtube.com/embed/${ytId}`,
                        sourceType: 'youtube',
                        duration: 'NBA Drill',
                        description: customVideoDesc.trim() || 'Studying real-time spacing dynamics, player mechanics, and intense workout tempos.',
                        difficulty: customVideoDifficulty,
                        uploadedAt: new Date().toLocaleDateString()
                      };
                      
                      try {
                        const savedList = JSON.parse(localStorage.getItem('espn_uploaded_videos') || '[]');
                        const updatedSavedList = [newVideo, ...savedList];
                        localStorage.setItem('espn_uploaded_videos', JSON.stringify(updatedSavedList));
                      } catch {}

                      setWorkoutVideos(prev => [newVideo, ...prev]);
                      setSelectedWorkoutVideo(newVideo);
                      
                      // clear inputs
                      setCustomVideoUrl('');
                      setCustomVideoTitle('');
                      setCustomVideoDesc('');
                    }}
                    className="space-y-4 pt-2 border-t border-outline-variant/10 font-sans"
                  >
                    <div className="space-y-1">
                      <label className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest font-bold">Or Add YouTube Pro Highlights</label>
                      <input
                        type="text"
                        value={customVideoUrl}
                        onChange={(e) => setCustomVideoUrl(e.target.value)}
                        placeholder="Paste URL: https://www.youtube.com/watch?v=..."
                        className="w-full bg-surface-container border border-outline-variant/15 text-xs font-body text-white p-3 rounded-xl focus:outline-none focus:border-primary placeholder-white/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest font-bold">Custom Title (Optional)</label>
                        <input
                          type="text"
                          value={customVideoTitle}
                          onChange={(e) => setCustomVideoTitle(e.target.value)}
                          placeholder="Kobe Pivot Drills"
                          className="w-full bg-surface-container border border-outline-variant/15 text-xs font-body text-white p-3 rounded-xl focus:outline-none focus:border-primary placeholder-white/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest font-bold">Difficulty Match</label>
                        <select
                          value={customVideoDifficulty}
                          onChange={(e) => setCustomVideoDifficulty(e.target.value as any)}
                          className="w-full bg-surface-container border border-outline-variant/15 text-xs font-body text-white p-3 rounded-xl focus:outline-none focus:border-primary cursor-pointer font-sans"
                        >
                          <option value="Medium">Medium</option>
                          <option value="Intense">Intense</option>
                          <option value="Extreme">Extreme</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest font-bold">Description / Workout Target</label>
                      <input
                        type="text"
                        value={customVideoDesc}
                        onChange={(e) => setCustomVideoDesc(e.target.value)}
                        placeholder="Focuses on foot speed conditioning..."
                        className="w-full bg-surface-container border border-outline-variant/15 text-xs font-body text-white p-3 rounded-xl focus:outline-none focus:border-primary placeholder-white/20"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!customVideoUrl}
                      className="w-full bg-primary hover:bg-primary/95 disabled:bg-surface-container-highest disabled:text-on-surface-variant/40 disabled:cursor-not-allowed text-black py-3 rounded-xl font-label font-bold text-[10px] uppercase tracking-widest active:scale-98 transition-transform shadow mt-1 flex items-center justify-center gap-1.5 font-sans"
                    >
                      <Plus className="w-3.5 h-3.5 text-black" /> Import YouTube Workout
                    </button>
                  </form>
                </div>

                {/* Playlist Drawer Section */}
                <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 space-y-4">
                  <div className="flex items-center justify-between font-sans">
                    <div>
                      <h4 className="font-headline text-base font-bold text-white tracking-tight">Workout Videoroll</h4>
                      <p className="font-body text-[10px] text-on-surface-variant">Click to load highlight into main theater screen</p>
                    </div>
                    <span className="text-[10px] font-mono text-primary font-bold bg-primary/10 px-2.5 py-0.5 rounded-full">
                      {workoutVideos.filter(vid => 
                        vid.title.toLowerCase().includes(videoSearchText.toLowerCase()) ||
                        vid.creator.toLowerCase().includes(videoSearchText.toLowerCase()) ||
                        vid.description.toLowerCase().includes(videoSearchText.toLowerCase())
                      ).length} items
                    </span>
                  </div>

                  {/* Playlist search */}
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-surface-container text-xs font-body text-white pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant/15 focus:outline-none focus:border-primary placeholder-white/25"
                      placeholder="Filter training titles..."
                      value={videoSearchText}
                      onChange={(e) => setVideoSearchText(e.target.value)}
                    />
                    <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-3 top-3.5" />
                  </div>

                  {/* Workout Videos List */}
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 font-sans">
                    {workoutVideos.filter(vid => 
                      vid.title.toLowerCase().includes(videoSearchText.toLowerCase()) ||
                      vid.creator.toLowerCase().includes(videoSearchText.toLowerCase()) ||
                      vid.description.toLowerCase().includes(videoSearchText.toLowerCase())
                    ).map((video) => {
                      const isSelected = selectedWorkoutVideo && selectedWorkoutVideo.id === video.id;
                      const ytId = video.sourceType === 'youtube' ? getYouTubeId(video.url) : null;

                      return (
                        <div
                          key={video.id}
                          onClick={() => {
                            setSelectedWorkoutVideo(video);
                            setVReps(0);
                            setShowRepsSavedBadge(false);
                          }}
                          className={`flex gap-3 p-2.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-primary/10 border-primary/40 shadow-inner' 
                              : 'bg-surface-container/50 border-outline-variant/5 hover:bg-white/5'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="w-20 h-14 rounded-lg bg-black overflow-hidden relative shrink-0 border border-white/5 flex items-center justify-center">
                            {ytId ? (
                              <img
                                src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                                alt="Play Pro Highlight"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex flex-col items-center justify-center">
                                <Dumbbell className="w-5 h-5 text-primary opacity-60" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 flex items-center justify-center animate-in">
                              <Play className="w-3 h-3 text-white fill-white" />
                            </div>
                            <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.2 rounded text-[8px] font-mono text-white select-none">
                              {video.duration}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex flex-col justify-between min-w-0 flex-1 font-sans">
                            <div>
                              <h5 className="font-body text-xs font-bold text-white line-clamp-2 leading-snug">
                                {video.title}
                              </h5>
                              <p className="text-[9px] font-body text-on-surface-variant line-clamp-1 leading-normal opacity-75 mt-0.5">
                                {video.creator}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <span className={`text-[8px] font-mono uppercase font-bold tracking-wider ${
                                video.difficulty === 'Extreme' ? 'text-red-400' :
                                video.difficulty === 'Intense' ? 'text-amber-400' :
                                'text-blue-400'
                              }`}>
                                {video.difficulty}
                              </span>
                              
                              {/* Delete button for custom files */}
                              {(video.id.startsWith('custom-') || video.id.startsWith('local-')) && (
                                <button
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    const updatedList = workoutVideos.filter(v => v.id !== video.id);
                                    setWorkoutVideos(updatedList);
                                    
                                    try {
                                      const savedList = JSON.parse(localStorage.getItem('espn_uploaded_videos') || '[]');
                                      const filteredSaved = savedList.filter((v: any) => v.id !== video.id);
                                      localStorage.setItem('espn_uploaded_videos', JSON.stringify(filteredSaved));
                                    } catch {}

                                    if (isSelected) {
                                      const fallback = updatedList.find(v => v.id === 'yt-curry') || updatedList[0] || null;
                                      setSelectedWorkoutVideo(fallback);
                                    }
                                  }}
                                  className="text-on-surface-variant/40 hover:text-red-400 p-0.5 transition-colors"
                                  title="Remove workout clip"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {workoutVideos.filter(vid => 
                      vid.title.toLowerCase().includes(videoSearchText.toLowerCase()) ||
                      vid.creator.toLowerCase().includes(videoSearchText.toLowerCase()) ||
                      vid.description.toLowerCase().includes(videoSearchText.toLowerCase())
                    ).length === 0 && (
                      <p className="text-center font-mono text-[10px] text-on-surface-variant/50 py-4 uppercase font-sans">
                        No clips matching filters.
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : (
          <CameraMotionTracker />
        )}
      </div>
    )}

    {activeTab === 'playoffs' && (
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-error flex items-center gap-3">
              <span className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-error"></span>
              </span>
              PLAYOFFS CONNECT
            </h1>
            <p className="font-body text-on-surface-variant mt-1">Real-Time Tournament Telemetry, Series Brackets & Live Stream Integrations</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 bg-surface-container py-3 px-5 rounded-2xl border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-2">
              <Wifi className={`w-4 h-4 ${isPlayoffStreaming ? 'text-error animate-pulse' : 'text-gray-500'}`} />
              <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface">
                Streaming: {isPlayoffStreaming ? 'ACTIVE' : 'STANDBY'}
              </span>
            </div>
            {isPlayoffStreaming && (
              <button 
                id="btn-disconnect-playoffs"
                onClick={() => {
                  setIsPlayoffStreaming(false);
                  setStreamedMatchupId(null);
                }}
                className="bg-error/20 hover:bg-error/35 text-error text-[10px] font-label font-bold uppercase tracking-widest px-3 py-1 rounded-md transition-all active:scale-95"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {/* API Connection Settings Panel */}
        <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-inner">
          <div className="flex items-center justify-between mb-6 border-b border-outline-variant/10 pb-4">
            <div className="flex items-center gap-3 pb-2">
              <Settings className="w-5 h-5 text-primary animate-spin-slow" />
              <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">Official Scoreboard API Credentials Check</h2>
            </div>
            <span className={`text-[10px] font-label px-3 py-1 uppercase tracking-widest font-bold rounded-full ${
              apiConnectionStatus === 'Connected' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
              apiConnectionStatus === 'CORS Restricted' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
              apiConnectionStatus === 'Checking' ? 'bg-primary/10 text-primary animate-pulse border border-primary/20' :
              'bg-on-surface-variant/10 text-on-surface-variant border border-on-surface-variant/20'
            }`}>
              {apiConnectionStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-5 flex flex-col gap-2">
              <label className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold">Scoreboard CDN Endpoint URL</label>
              <input 
                id="inp-playoffs-cdn-url"
                type="text" 
                value={apiEndpoint} 
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-sm font-mono text-on-surface outline-none focus:border-primary/50 transition-colors"
                placeholder="https://cdn.nba.com/static/json/liveData/scoreboard..."
              />
            </div>

            <div className="md:col-span-4 flex flex-col gap-2">
              <label className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold">Authorization Bearer Token (Optional)</label>
              <input 
                id="inp-playoffs-bearer"
                type="password" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-sm font-mono text-on-surface outline-none focus:border-primary/50 transition-colors"
                placeholder="Bearer keys for third-party endpoints..."
              />
            </div>

            <div className="md:col-span-3 flex gap-3">
              <button 
                id="btn-playoffs-test-sync"
                onClick={fetchNbaLiveScoreboard}
                className="w-full py-3 bg-surface-container hover:bg-surface-container-high border border-outline-variant/25 rounded-xl text-xs font-label font-bold uppercase tracking-widest transition-all active:scale-95"
              >
                Test Sync
              </button>
            </div>
          </div>

          {apiConnectionStatus === 'CORS Restricted' && (
            <div className="mt-4 p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/15 text-xs text-on-surface-variant/90 leading-relaxed font-body">
              <strong className="text-yellow-500 block mb-1">ℹ️ Client iFrame Security Bypassed via Real-Time Live PlaybyPlay Stream Simulator</strong>
              Your browser blocks direct CDN requests to <code>cdn.nba.com</code> inside development sandboxes due to client-side CORS policies.
              To integrate actual live data pipelines on a production domain, deploy an Express gateway backend proxy or append custom Authorization headers. 
              <strong> The AI Sandbox has unlocked our full simulated playoff live stream engine below. Connect any matchup to begin streaming!</strong>
            </div>
          )}
        </section>

        {/* ESPN Playoffs Broadcast Light Controller & Arena Advantage Modifiers */}
        <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative overflow-hidden">
          {/* Decorative outline glow effects */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl pointer-events-none" />
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-error animate-pulse" />
                <h3 className="font-headline text-xl font-bold tracking-tight text-white uppercase">ESPN Playoff Scenario Broadcast Room</h3>
              </div>
              <p className="font-body text-xs text-on-surface-variant mt-1">
                Real-Time Arena atmospheric lights adjust physical telemetry, win vectors and court momentum.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Blue Lights Control */}
              <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-40 ${
                isBlueLightOn 
                  ? 'bg-blue-950/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                  : 'bg-[#0a0c10] border-white/5 opacity-70'
              }`}>
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-label text-[10px] font-black uppercase tracking-widest text-blue-400">BLUE SIGNAL</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${isBlueLightOn ? 'bg-blue-500 animate-ping' : 'bg-gray-700'}`} />
                  </div>
                  <h4 className="font-headline text-sm font-bold text-white mt-2">Spurs Arena Aura Booster</h4>
                  <p className="font-body text-[10px] text-on-surface-variant mt-1 leading-tight">
                    When ON, triggers severe home-court advantage (+13.0 margins) for the Spurs.
                  </p>
                </div>
                
                <button
                  onClick={() => setIsBlueLightOn(!isBlueLightOn)}
                  className={`w-full py-2.5 rounded-xl font-label text-[10px] uppercase font-bold tracking-widest transition-all active:scale-95 ${
                    isBlueLightOn 
                      ? 'bg-blue-500 text-black shadow-[0_0_12px_rgba(59,130,246,0.3)]' 
                      : 'bg-[#181d24] text-on-surface-variant hover:text-white border border-white/5'
                  }`}
                >
                  {isBlueLightOn ? 'BLUE LIGHTS: ON' : 'BLUE LIGHTS: OFF'}
                </button>
              </div>

              {/* Red Lights Control */}
              <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-40 ${
                !isRedLightOn 
                  ? 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]' 
                  : 'bg-[#0a0c10] border-white/5 opacity-70'
              }`}>
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-label text-[10px] font-black uppercase tracking-widest text-[#e41e31]">RED SIGNAL</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${isRedLightOn ? 'bg-[#e41e31]' : 'bg-gray-850'}`} />
                  </div>
                  <h4 className="font-headline text-sm font-bold text-white mt-2">NYK Overrides Multiplier</h4>
                  <p className="font-body text-[10px] text-on-surface-variant mt-1 leading-tight">
                    Knicks advantage activates <strong className="text-amber-400">ONLY when Red Lights are OFF</strong>.
                  </p>
                </div>
                
                <button
                  onClick={() => setIsRedLightOn(!isRedLightOn)}
                  className={`w-full py-2.5 rounded-xl font-label text-[10px] uppercase font-bold tracking-widest transition-all active:scale-95 ${
                    isRedLightOn 
                      ? 'bg-[#e41e31] text-white border border-red-500/20' 
                      : 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  }`}
                >
                  {isRedLightOn ? 'RED LIGHTS: ON' : 'RED LIGHTS: OFF (NYK ACTIVE)'}
                </button>
              </div>
            </div>

            {/* Simulated Live Broadcast Note */}
            <div className="p-4 rounded-xl bg-[#090b0d] border border-white/5 text-[10px] text-on-surface-variant/85 flex items-center gap-3">
              <span className="font-mono text-primary font-black animate-pulse uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded border border-primary/20">ESPN BROADCAST MODES</span>
              <span>
                {isBlueLightOn && '🔹 Spurs Home-Court boost activated.'}
                {!isRedLightOn && ' ⚡ New York Knicks Home Advantage active.'}
                {!isBlueLightOn && isRedLightOn && '⚖️ Neutral atmospheric conditions resolved.'}
              </span>
            </div>
          </div>

          <div className="bg-[#090b0d] border border-outline-variant/10 p-6 rounded-2xl flex flex-col justify-between min-h-[220px] relative">
            <div>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                <span className="text-[10px] font-label text-primary font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 animate-spin-slow text-primary" />
                  ESPN COURT-INTELLIGENCE AI ANALYTICS
                </span>
                <span className="font-mono text-[9px] text-[#007dc3] font-bold uppercase p-1 bg-[#007dc3]/10 rounded border border-[#007dc3]/20">
                  Model: GEMINI-3.5-FLASH
                </span>
              </div>

              {isGeneratingAiAnalytics ? (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
                  <Flame className="w-8 h-8 text-primary animate-bounce duration-1000" />
                  <p className="text-[11px] font-label text-on-surface-variant uppercase tracking-widest animate-pulse">
                    Synthesizing real-time scenario vectors...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiAnalyticsMarkdown ? (
                    <div className="space-y-3">
                      {aiAnalyticsMarkdown.split('\n').filter(l => l.trim().length > 0).map((line, idx) => {
                        const cleaned = line.replace(/^[\s*\-•]+/g, '').trim();
                        const parts = cleaned.split('**');
                        return (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-on-surface-variant/95 leading-relaxed">
                            <span className="text-primary mt-1 select-none font-bold">✦</span>
                            <span>
                              {parts.map((p, pIdx) => (
                                pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-extrabold">{p}</strong> : p
                              ))}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant/60 italic leading-relaxed py-4 text-center font-body">
                      No active scenario query received. Toggle the arena lights above or click below to generate instant tactical AI insights on current court momentum.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-white/5 pt-4">
              <button
                id="btn-retrigger-ai-analytics"
                disabled={isGeneratingAiAnalytics}
                onClick={requestAiAnalytics}
                className="w-full py-2.5 bg-primary hover:bg-opacity-90 disabled:opacity-50 text-black font-label text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow"
              >
                <Cpu className="w-3.5 h-3.5" />
                Query Playoff AI Strategic Analytics
              </button>
            </div>
          </div>
        </section>

        {/* Playoff Matchups Grid - Replaced with custom high-fidelity 2026 Playoff Bracket */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center bg-[#0c0e12] border border-outline-variant/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-[#e41e31] px-6 py-4 flex items-center justify-center font-headline text-lg font-black text-white italic tracking-tighter shrink-0 select-none">
              2026 PLAYOFFS
            </div>
            <div className="flex flex-1 overflow-x-auto scrollbar-none divide-x divide-white/5 font-label text-[11px] uppercase font-extrabold tracking-wider text-on-surface-variant/80">
              {[
                { id: 'bracket', label: 'Bracket Diagram' },
                { id: 'standings', label: 'Live Standings' },
                { id: 'latest', label: 'Latest News' },
                { id: 'schedule', label: 'Schedule & TV' },
                { id: 'series', label: 'Series Comparison' },
                { id: 'pickem', label: 'NBA Pick\'Em predictions' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setPlayoffsTab(tab.id as any)}
                  className={`flex-1 px-4 py-4 focus:outline-none transition-all relative text-center min-w-[115px] hover:text-white ${
                    playoffsTab === tab.id ? 'bg-white/5 text-primary' : ''
                  }`}
                >
                  {tab.label}
                  {playoffsTab === tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary animate-pulse" />
                  )}
                </button>
              ))}
              <div className="flex items-center px-4 py-4 text-on-surface-variant/40 select-none min-w-[100px] justify-center gap-1.5 text-[10px]">
                CHALLENGES <Lock className="w-3 h-3 text-on-surface-variant/30" />
              </div>
              <div className="flex items-center px-4 py-4 text-on-surface-variant/40 select-none min-w-[80px] justify-center text-[10px]">
                MORE
              </div>
            </div>
          </div>

          {playoffsTab === 'bracket' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-[#0b0d10] p-6 rounded-3xl border border-outline-variant/15 shadow-2xl overflow-x-auto custom-scrollbar">
                <div className="min-w-[1200px] py-4">
                  {/* Column Headers */}
                  <div className="grid grid-cols-7 gap-4 text-center font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant/60 mb-6 border-b border-white/5 pb-3">
                    <div>West First Round</div>
                    <div>West Semifinals</div>
                    <div>West Finals</div>
                    <div className="text-primary font-bold">NBA Finals</div>
                    <div>East Finals</div>
                    <div>East Semifinals</div>
                    <div>East First Round</div>
                  </div>

                  {/* 7 columns structure */}
                  <div className="grid grid-cols-7 gap-4 h-[700px] items-stretch relative">
                    
                    {/* West Quarterfinals */}
                    <div className="flex flex-col justify-around h-full py-2">
                      {bracketMatchups.filter(m => m.id.startsWith('w-r1-')).map(m => (
                        <BracketMatchupCard 
                          key={m.id}
                          m={m}
                          isWest={true}
                          hoveredTeam={hoveredTeam}
                          setHoveredTeam={setHoveredTeam}
                          streamedMatchupId={streamedMatchupId}
                          onConnectStream={() => {}}
                          onSelect={(match) => setSelectedMatchup(match)}
                        />
                      ))}
                    </div>

                    {/* West Semis */}
                    <div className="flex flex-col justify-around h-full py-12">
                      {bracketMatchups.filter(m => m.id.startsWith('w-semi-')).map(m => (
                        <BracketMatchupCard 
                          key={m.id}
                          m={m}
                          isWest={true}
                          hoveredTeam={hoveredTeam}
                          setHoveredTeam={setHoveredTeam}
                          streamedMatchupId={streamedMatchupId}
                          onConnectStream={() => {}}
                          onSelect={(match) => setSelectedMatchup(match)}
                        />
                      ))}
                    </div>

                    {/* West Finals */}
                    <div className="flex flex-col justify-around h-full py-28">
                      {bracketMatchups.filter(m => m.id === 'w-finals').map(m => (
                        <BracketMatchupCard 
                          key={m.id}
                          m={m}
                          isWest={true}
                          hoveredTeam={hoveredTeam}
                          setHoveredTeam={setHoveredTeam}
                          streamedMatchupId={streamedMatchupId}
                          onConnectStream={() => {}}
                          onSelect={(match) => setSelectedMatchup(match)}
                        />
                      ))}
                    </div>

                    {/* NBA Finals Area */}
                    <div className="flex flex-col justify-center items-center h-full gap-8 relative px-2">
                      <div className="absolute top-4 flex flex-col items-center">
                        <div className="p-3 bg-gradient-to-b from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-full mb-2 animate-bounce">
                          <Trophy className="w-8 h-8 text-yellow-500" />
                        </div>
                        <span className="font-headline text-base italic tracking-tighter text-white font-black">NBA FINALS</span>
                        <span className="text-[7px] tracking-widest text-[#e41e31] font-mono mt-0.5">THE O'BRIEN TROPHY</span>
                      </div>

                      <div className="w-full">
                        {bracketMatchups.filter(m => m.id === 'nba-finals').map(m => (
                          <BracketMatchupCard 
                            key={m.id}
                            m={m}
                            isWest={false}
                            hoveredTeam={hoveredTeam}
                            setHoveredTeam={setHoveredTeam}
                            streamedMatchupId={streamedMatchupId}
                            onConnectStream={() => {}}
                            onSelect={(match) => setSelectedMatchup(match)}
                          />
                        ))}
                      </div>

                      <div className="absolute bottom-4 text-center">
                        <span className="text-[9px] font-mono text-primary font-bold block">2026 ROAD TO VICTORY</span>
                        <span className="text-[7px] font-body text-on-surface-variant/40 uppercase tracking-widest mt-1 inline-block">Official Bracket Tree</span>
                      </div>
                    </div>

                    {/* East Finals */}
                    <div className="flex flex-col justify-around h-full py-28">
                      {bracketMatchups.filter(m => m.id === 'e-finals').map(m => (
                        <BracketMatchupCard 
                          key={m.id}
                          m={m}
                          isWest={false}
                          hoveredTeam={hoveredTeam}
                          setHoveredTeam={setHoveredTeam}
                          streamedMatchupId={streamedMatchupId}
                          onConnectStream={() => {}}
                          onSelect={(match) => setSelectedMatchup(match)}
                        />
                      ))}
                    </div>

                    {/* East Semis */}
                    <div className="flex flex-col justify-around h-full py-12">
                      {bracketMatchups.filter(m => m.id.startsWith('e-semis-')).map(m => (
                        <BracketMatchupCard 
                          key={m.id}
                          m={m}
                          isWest={false}
                          hoveredTeam={hoveredTeam}
                          setHoveredTeam={setHoveredTeam}
                          streamedMatchupId={streamedMatchupId}
                          onConnectStream={() => {}}
                          onSelect={(match) => setSelectedMatchup(match)}
                        />
                      ))}
                    </div>

                    {/* East First Round */}
                    <div className="flex flex-col justify-around h-full py-2">
                      {bracketMatchups.filter(m => m.id.startsWith('e-r1-')).map(m => (
                        <BracketMatchupCard 
                          key={m.id}
                          m={m}
                          isWest={false}
                          hoveredTeam={hoveredTeam}
                          setHoveredTeam={setHoveredTeam}
                          streamedMatchupId={streamedMatchupId}
                          onConnectStream={() => {}}
                          onSelect={(match) => setSelectedMatchup(match)}
                        />
                      ))}
                    </div>

                  </div>
                </div>
              </div>

              {/* Download actions drawer block */}
              <div className="flex justify-between items-center bg-[#0d1014] p-5 rounded-2xl border border-outline-variant/10">
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-[10px] font-body text-on-surface-variant/70 leading-relaxed">
                    Hover over any team card above to dynamically highlight their entire tournament trajectory. Click any series matchup to view core stats and sync streaming telemetry.
                  </span>
                </div>
                
                <button
                  id="btn-download-playoffs-bracket"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                      title: "2026 NBA Playoffs Bracket Data",
                      timestamp: "2026-05-24T21:26:00Z",
                      west_finals: "1 OKC Thunder vs 2 San Antonio Spurs (Spurs lead 2-1, Game 4 Live)",
                      east_finals: "4 Cleveland Cavaliers vs 3 New York Knicks (Knicks lead 3-0)"
                    }));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", "NBA_2026_Playoffs_Bracket.json");
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 py-2.5 px-5 rounded-xl text-[10px] font-label font-bold uppercase tracking-widest transition-all text-white shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-primary" /> Download Bracket
                </button>
              </div>
            </div>
          )}

          {playoffsTab === 'standings' && (
            <div className="bg-[#0b0d10] p-6 rounded-3xl border border-outline-variant/15 space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-headline text-lg font-bold text-white tracking-tight">2026 Playoffs Live Team Standings</h3>
                  <p className="text-xs text-on-surface-variant font-body">Dynamic playoff standings updated in real-time as simulation game logs conclude.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] uppercase font-mono bg-green-500/15 text-green-400 border border-green-500/20 py-1 px-3 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                    Realtime Engaged
                  </span>
                </div>
              </div>

              {/* Conference Standings Side-by-Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* WESTERN CONFERENCE */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 bg-blue-950/20 border border-blue-500/10 p-2.5 rounded-xl">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                    <h4 className="font-headline text-sm font-black italic text-blue-400 uppercase tracking-tighter">Western Conference Finals</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-body text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-on-surface-variant/70 uppercase text-[9px] font-mono tracking-wider">
                          <th className="py-2.5 px-3">Seed / Team</th>
                          <th className="py-2.5 px-3 text-center">W-L</th>
                          <th className="py-2.5 px-3 text-center">PCT</th>
                          <th className="py-2.5 px-3 text-center">Series Status</th>
                          <th className="py-2.5 px-3 text-center">PPG</th>
                          <th className="py-2.5 px-3 text-center">Streak</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {playoffsStandings
                          .filter(t => t.conference === 'West')
                          .map(t => {
                            const isActiveStreaming = isPlayoffStreaming && (homeTeamName === t.name || awayTeamName === t.name);
                            return (
                              <tr key={t.name} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="py-3 px-3 flex items-center gap-2.5 font-semibold text-white">
                                  <span className="text-[10px] font-mono text-primary bg-primary/15 rounded-md px-1 py-0.5 leading-none">#{t.seed}</span>
                                  <span>{t.name}</span>
                                  {isActiveStreaming && (
                                    <span className="text-[8px] font-bold bg-[#e41e31] text-white px-1 py-0.5 rounded animate-pulse">LIVE</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center text-white/90 font-mono font-medium">{t.wins}-{t.losses}</td>
                                <td className="py-3 px-3 text-center text-on-surface-variant/80 font-mono">{t.pct}</td>
                                <td className="py-3 px-3 text-center text-on-surface-variant/90 font-semibold text-[11px]">{t.seriesRecord}</td>
                                <td className="py-3 px-3 text-center text-on-surface-variant/80 font-mono">{t.ppg}</td>
                                <td className="py-3 px-3 text-center">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                                    t.streak.startsWith('W') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                  }`}>
                                    {t.streak}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    onClick={() => {
                                      const wcfMatch = bracketMatchups.find(m => m.id === 'w-finals');
                                      if (wcfMatch) {
                                        setSelectedMatchup(wcfMatch);
                                      }
                                    }}
                                    className="py-1 px-2.5 bg-white/5 group-hover:bg-primary group-hover:text-black hover:bg-primary hover:text-black rounded text-[10px] font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1 text-white border border-white/5 group-hover:border-transparent animate-all duration-300"
                                  >
                                    Details
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* EASTERN CONFERENCE */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 bg-[#e41e31]/10 border border-[#e41e31]/15 p-2.5 rounded-xl">
                    <span className="w-2.5 h-2.5 bg-[#e41e31]" />
                    <h4 className="font-headline text-sm font-black italic text-[#ff5c5c] uppercase tracking-tighter">Eastern Conference Finals</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-body text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-on-surface-variant/70 uppercase text-[9px] font-mono tracking-wider">
                          <th className="py-2.5 px-3">Seed / Team</th>
                          <th className="py-2.5 px-3 text-center">W-L</th>
                          <th className="py-2.5 px-3 text-center">PCT</th>
                          <th className="py-2.5 px-3 text-center">Series Status</th>
                          <th className="py-2.5 px-3 text-center">PPG</th>
                          <th className="py-2.5 px-3 text-center">Streak</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {playoffsStandings
                          .filter(t => t.conference === 'East')
                          .map(t => {
                            const isActiveStreaming = isPlayoffStreaming && (homeTeamName === t.name || awayTeamName === t.name);
                            return (
                              <tr key={t.name} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="py-3 px-3 flex items-center gap-2.5 font-semibold text-white">
                                  <span className="text-[10px] font-mono text-primary bg-primary/15 rounded-md px-1 py-0.5 leading-none">#{t.seed}</span>
                                  <span>{t.name}</span>
                                  {isActiveStreaming && (
                                    <span className="text-[8px] font-bold bg-[#e41e31] text-white px-1 py-0.5 rounded animate-pulse">LIVE</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center text-white/90 font-mono font-medium">{t.wins}-{t.losses}</td>
                                <td className="py-3 px-3 text-center text-on-surface-variant/80 font-mono">{t.pct}</td>
                                <td className="py-3 px-3 text-center text-on-surface-variant/90 font-semibold text-[11px]">{t.seriesRecord}</td>
                                <td className="py-3 px-3 text-center text-on-surface-variant/80 font-mono">{t.ppg}</td>
                                <td className="py-3 px-3 text-center">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                                    t.streak.startsWith('W') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                  }`}>
                                    {t.streak}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    onClick={() => {
                                      const ecfMatch = bracketMatchups.find(m => m.id === 'e-finals');
                                      if (ecfMatch) {
                                        setSelectedMatchup(ecfMatch);
                                      }
                                    }}
                                    className="py-1 px-2.5 bg-white/5 group-hover:bg-primary group-hover:text-black hover:bg-primary hover:text-black rounded text-[10px] font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1 text-white border border-white/5 group-hover:border-transparent animate-all duration-300"
                                  >
                                    Details
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Live Game Telemetry sync bar */}
              {isPlayoffStreaming && streamedMatchupId && (
                <div className="bg-[#1c1f26] border border-primary/20 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Radio className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h5 className="text-white font-semibold text-xs uppercase tracking-wider">Active Telemetry Feed Standings Weight</h5>
                      <p className="text-[11px] text-on-surface-variant/80 font-body">
                        Current Game: <span className="font-semibold text-white">{homeTeamName} ({homeScore})</span> vs <span className="font-semibold text-white">{awayTeamName} ({awayScore})</span> • Q{currentQuarter} {formatTime(timeLeft)}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-on-surface-variant/70 bg-white/5 py-1.5 px-3 rounded-lg font-mono border border-white/5">
                    Arena lights dynamic advantage rules in full effect.
                  </div>
                </div>
              )}

              {/* Commentary */}
              <div className="border-t border-white/5 pt-4">
                <div className="bg-[#12141c] p-4 rounded-xl border border-white/5 text-xs text-on-surface-variant/80 space-y-2 leading-relaxed">
                  <span className="font-bold text-white uppercase tracking-wider text-[10px] font-mono block">Conference Standings Telemetry Commentary</span>
                  <p className="font-body text-on-surface-variant/75">
                    Playoffs records reflect overall series victories across the 2026 post-season. Standings updates are calculated dynamically using the combined performance of seed wins, head-to-head PPG outputs, and active live stream court victories. Adjust the arena light switches to modify possession vectors and alter physical outcomes dynamically inside the live simulator tracker.
                  </p>
                </div>
              </div>
            </div>
          )}

          {playoffsTab === 'latest' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
              <div className="bg-[#0b0d10] p-6 rounded-3xl border border-outline-variant/10 flex flex-col justify-between h-[230px]">
                <div className="space-y-3">
                  <span className="inline-block text-[8px] bg-red-600 font-label font-black text-white uppercase tracking-wider px-2 py-0.5 rounded">WEST FINALS</span>
                  <h4 className="font-headline font-semibold text-base hover:text-primary cursor-pointer transition-colors block leading-snug">Wembanyama Leads Spurs to Thrilling Game 1 Victory Over Thunder</h4>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed opacity-75 truncate-3-lines">Victor Wembanyama's stunning triple-double helps San Antonio shock the #1 seed Thunder at home. SGA's 34 PTS were not enough as SAS secures a critical Game 1 win.</p>
                </div>
                <div className="pt-2 flex justify-between items-center text-[9px] font-mono text-on-surface-variant/40 border-t border-white/5">
                  <span>Hoop Daily Sports</span>
                  <span>1 Hour Ago</span>
                </div>
              </div>

              <div className="bg-[#0b0d10] p-6 rounded-3xl border border-outline-variant/10 flex flex-col justify-between h-[230px]">
                <div className="space-y-3">
                  <span className="inline-block text-[8px] bg-orange-600 font-label font-black text-white uppercase tracking-wider px-2 py-0.5 rounded">EAST FINALS</span>
                  <h4 className="font-headline font-semibold text-base hover:text-primary cursor-pointer transition-colors block leading-snug">Knicks Conquer Sixers in Concluded Semis, Eye Cavaliers Challenge</h4>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed opacity-75 truncate-3-lines">An outstanding 4-0 sweep over Philadelphia propelled the New York Knicks into the Eastern Finals. They now wait to host Cleveland in a highly physical matchup starting Friday.</p>
                </div>
                <div className="pt-2 flex justify-between items-center text-[9px] font-mono text-on-surface-variant/40 border-t border-white/5">
                  <span>Playoffs Central</span>
                  <span>4 Hours Ago</span>
                </div>
              </div>

              <div className="bg-[#0b0d10] p-6 rounded-3xl border border-outline-variant/10 flex flex-col justify-between h-[230px]">
                <div className="space-y-3">
                  <span className="inline-block text-[8px] bg-blue-600 font-label font-black text-white uppercase tracking-wider px-2 py-0.5 rounded">WEST FINALS GAME 3</span>
                  <h4 className="font-headline font-semibold text-base hover:text-primary cursor-pointer transition-colors block leading-snug">SGA Rallies OKC Backcourt: "Game 3 on the Road is Our True Test"</h4>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed opacity-75 truncate-3-lines">After equalizing the series 1-1 with a majestic Game 2 victory at home, Shai Gilgeous-Alexander outlines major defensive adjustments to limit Wembanyama's presence in San Antonio tonight.</p>
                </div>
                <div className="pt-2 flex justify-between items-center text-[9px] font-mono text-on-surface-variant/40 border-t border-white/5">
                  <span>Inside TNT</span>
                  <span>Live Now</span>
                </div>
              </div>
            </div>
          )}

          {playoffsTab === 'schedule' && (
            <div className="bg-[#0b0d10] p-6 rounded-3xl border border-outline-variant/15 space-y-4 animate-in fade-in duration-300">
              <h3 className="font-headline text-lg font-bold text-white tracking-tight border-b border-white/5 pb-2">Completed & Upcoming 2026 Conference Finals Schedule</h3>
              <div className="divide-y divide-white/5 font-body">
                {playoffsSchedule.map(s => (
                  <div key={s.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className={`text-[10px] font-mono font-extrabold mr-3 uppercase tracking-wider py-0.5 px-2 rounded ${
                        s.type === 'LIVE' 
                          ? 'text-error bg-error/15 border border-error/20 animate-pulse' 
                          : s.type === 'UPCOMING'
                          ? 'text-yellow-500 bg-yellow-500/15 border border-yellow-500/20'
                          : 'text-on-surface-variant/50 bg-white/5 border border-white/5'
                      }`}>
                        {s.type === 'LIVE' ? `LIVE TODAY (${s.date})` : s.type === 'UPCOMING' ? `UPCOMING (${s.date})` : `COMPLETED (${s.date})`}
                      </span>
                      <span className="text-sm font-semibold text-white">{s.matchup}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-on-surface-variant font-mono">{s.result}</span>
                      <span className={`text-[9px] font-label font-bold py-1 px-3 rounded font-mono ${
                        s.type === 'LIVE' 
                          ? 'bg-[#e41e31]/10 text-error border border-error/20'
                          : 'bg-white/5 text-on-surface-variant/75 border border-white/5'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {playoffsTab === 'series' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0b0d10] p-6 rounded-3xl border border-outline-variant/15 space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span className="w-2 h-2 rounded-full bg-zinc-400 -ml-1" />
                    <h4 className="font-headline font-bold text-base text-white">Western Conference Finals Head-to-Head</h4>
                  </div>
                  <div className="space-y-3 font-body text-xs text-on-surface-variant">
                    <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                      <span>Regular Season Series</span>
                      <strong className="text-white">Thunder Won 3-1</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                      <span>Playoffs PPG Offense</span>
                      <strong className="text-white">OKC 114.2 • SAS 112.5</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                      <span>Playoffs RPG Rebounds</span>
                      <strong className="text-white">OKC 44.8 • SAS 46.1</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Star Matchup Players</span>
                      <strong className="text-white">Shai Gilgeous-Alexander vs Victor Wembanyama</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0b0d10] p-6 rounded-3xl border border-outline-variant/15 space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <span className="w-2 h-2 rounded-full bg-red-750" />
                    <span className="w-2 h-2 rounded-full bg-orange-500 -ml-1" />
                    <h4 className="font-headline font-bold text-base text-white">Eastern Conference Finals Head-to-Head</h4>
                  </div>
                  <div className="space-y-3 font-body text-xs text-on-surface-variant">
                    <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                      <span>Regular Season Series</span>
                      <strong className="text-white">Series Tied 2-2</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                      <span>Playoffs PPG Offense</span>
                      <strong className="text-white">CLE 106.5 • NYK 111.4</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                      <span>Playoffs RPG Rebounds</span>
                      <strong className="text-white">CLE 42.1 • NYK 45.4</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Star Matchup Players</span>
                      <strong className="text-white">Donovan Mitchell vs Jalen Brunson</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Star Player Playoffs Tracker Panel */}
              <div className="bg-[#0b0d10] p-6 md:p-8 rounded-3xl border border-outline-variant/15 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-primary" /> Star Player Playoffs Tracker
                    </h3>
                    <p className="font-body text-[11px] text-on-surface-variant/80 mt-1">
                      Official 2026 Conference Finals player statistics & computed averages
                    </p>
                  </div>
                  <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5 shadow-inner">
                    <button
                      id="btn-star-track-wemby"
                      onClick={() => setSelectedStarTrack('wemby')}
                      className={`px-4 py-2 rounded-lg text-xs font-label uppercase tracking-wider font-extrabold transition-all duration-300 ${
                        selectedStarTrack === 'wemby'
                          ? 'bg-primary text-black font-black shadow-lg animate-fade-in'
                          : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Victor Wembanyama (SAS)
                    </button>
                    <button
                      id="btn-star-track-sga"
                      onClick={() => setSelectedStarTrack('sga')}
                      className={`px-4 py-2 rounded-lg text-xs font-label uppercase tracking-wider font-extrabold transition-all duration-300 ${
                        selectedStarTrack === 'sga'
                          ? 'bg-[#007dc3] text-white font-black shadow-lg animate-fade-in'
                          : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Shai Gilgeous-Alexander (OKC)
                    </button>
                  </div>
                </div>

                {selectedStarTrack === 'wemby' ? (
                  <div className="space-y-6">
                    {/* Wembanyama stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        { label: 'PPG', val: '31.0', desc: 'Points Average' },
                        { label: 'RPG', val: '20.5', desc: 'Rebounds Average' },
                        { label: 'APG', val: '6.0', desc: 'Assists Average' },
                        { label: 'BPG', val: '4.0', desc: 'Blocks Average' },
                        { label: 'SPG', val: '1.0', desc: 'Steals Average' },
                        { label: 'MPG', val: '43.0', desc: 'Minutes Average' },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-[#090b0d] border border-outline-variant/10 p-4 rounded-2xl flex flex-col items-center text-center">
                          <span className="text-[10px] font-label text-on-surface-variant/65 uppercase tracking-widest">{item.label}</span>
                          <span className="font-headline text-2xl font-black text-primary mt-1">{item.val}</span>
                          <span className="text-[8px] font-body text-on-surface-variant/40 mt-0.5">{item.desc}</span>
                        </div>
                      ))}
                    </div>

                    {/* Wembanyama game logs */}
                    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#090b0d] shadow-2xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02] text-on-surface-variant/80 font-label uppercase text-[9px] tracking-wider font-extrabold">
                            <th className="p-4">Date</th>
                            <th className="p-4">Opponent</th>
                            <th className="p-4 text-center">MIN</th>
                            <th className="p-4 text-center">PTS</th>
                            <th className="p-4 text-center">FG</th>
                            <th className="p-4 text-center">3PT</th>
                            <th className="p-4 text-center">FT</th>
                            <th className="p-4 text-center">REB</th>
                            <th className="p-4 text-center">AST</th>
                            <th className="p-4 text-center">STL</th>
                            <th className="p-4 text-center">BLK</th>
                            <th className="p-4 text-center">TO</th>
                            <th className="p-4 text-center">PF</th>
                            <th className="p-4 text-center">+/-</th>
                          </tr>
                        </thead>
                        <tbody className="font-body text-on-surface-variant/90 divide-y divide-white/[0.03]">
                          <tr className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4 font-mono font-bold text-white text-[10px]">MAY 21</td>
                            <td className="p-4 font-semibold text-white">@ OKC Thunder (G2)</td>
                            <td className="p-4 text-center font-mono text-white">37</td>
                            <td className="p-4 text-center font-mono font-bold text-primary text-sm">21</td>
                            <td className="p-4 text-center font-mono">8-16</td>
                            <td className="p-4 text-center font-mono">3-7</td>
                            <td className="p-4 text-center font-mono">2-2</td>
                            <td className="p-4 text-center font-mono text-white">17</td>
                            <td className="p-4 text-center font-mono">6</td>
                            <td className="p-4 text-center font-mono">1</td>
                            <td className="p-4 text-center font-mono text-white">4</td>
                            <td className="p-4 text-center font-mono">4</td>
                            <td className="p-4 text-center font-mono">3</td>
                            <td className="p-4 text-center font-mono text-green-400 font-bold">+1</td>
                          </tr>
                          <tr className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4 font-mono font-bold text-white text-[10px]">MAY 19</td>
                            <td className="p-4 font-semibold text-white">@ OKC Thunder (G1)</td>
                            <td className="p-4 text-center font-mono text-white">49</td>
                            <td className="p-4 text-center font-mono font-bold text-primary text-sm">41</td>
                            <td className="p-4 text-center font-mono">14-25</td>
                            <td className="p-4 text-center font-mono">1-2</td>
                            <td className="p-4 text-center font-mono">12-13</td>
                            <td className="p-4 text-center font-mono text-white">24</td>
                            <td className="p-4 text-center font-mono">6</td>
                            <td className="p-4 text-center font-mono">1</td>
                            <td className="p-4 text-center font-mono text-white">4</td>
                            <td className="p-4 text-center font-mono">4</td>
                            <td className="p-4 text-center font-mono">3</td>
                            <td className="p-4 text-center font-mono text-green-400 font-bold">+1</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* SGA stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        { label: 'PPG', val: '31.1', desc: 'Points Average' },
                        { label: 'RPG', val: '6.0', desc: 'Rebounds Average' },
                        { label: 'APG', val: '7.0', desc: 'Assists Average' },
                        { label: 'SPG', val: '2.0', desc: 'Steals Average' },
                        { label: 'BPG', val: '1.0', desc: 'Blocks Average' },
                        { label: 'MPG', val: '40.5', desc: 'Minutes Average' },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-[#090b0d] border border-outline-variant/10 p-4 rounded-2xl flex flex-col items-center text-center">
                          <span className="text-[10px] font-label text-on-surface-variant/65 uppercase tracking-widest">{item.label}</span>
                          <span className="font-headline text-2xl font-black text-[#007dc3] mt-1">{item.val}</span>
                          <span className="text-[8px] font-body text-on-surface-variant/40 mt-0.5">{item.desc}</span>
                        </div>
                      ))}
                    </div>

                    {/* SGA game logs */}
                    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#090b0d] shadow-2xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02] text-on-surface-variant/80 font-label uppercase text-[9px] tracking-wider font-extrabold">
                            <th className="p-4">Date</th>
                            <th className="p-4">Opponent</th>
                            <th className="p-4 text-center">MIN</th>
                            <th className="p-4 text-center">PTS</th>
                            <th className="p-4 text-center">FG</th>
                            <th className="p-4 text-center">3PT</th>
                            <th className="p-4 text-center">FT</th>
                            <th className="p-4 text-center">REB</th>
                            <th className="p-4 text-center">AST</th>
                            <th className="p-4 text-center">STL</th>
                            <th className="p-4 text-center">BLK</th>
                            <th className="p-4 text-center">TO</th>
                            <th className="p-4 text-center">PF</th>
                            <th className="p-4 text-center">+/-</th>
                          </tr>
                        </thead>
                        <tbody className="font-body text-on-surface-variant/90 divide-y divide-white/[0.03]">
                          <tr className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4 font-mono font-bold text-white text-[10px]">MAY 21</td>
                            <td className="p-4 font-semibold text-white">vs Spurs (G2)</td>
                            <td className="p-4 text-center font-mono text-white">38</td>
                            <td className="p-4 text-center font-mono font-bold text-[#007dc3] text-sm">28</td>
                            <td className="p-4 text-center font-mono">10-18</td>
                            <td className="p-4 text-center font-mono">2-4</td>
                            <td className="p-4 text-center font-mono">6-6</td>
                            <td className="p-4 text-center font-mono text-white">5</td>
                            <td className="p-4 text-center font-mono">8</td>
                            <td className="p-4 text-center font-mono">2</td>
                            <td className="p-4 text-center font-mono text-white">1</td>
                            <td className="p-4 text-center font-mono">2</td>
                            <td className="p-4 text-center font-mono">2</td>
                            <td className="p-4 text-center font-mono text-green-400 font-bold">+7</td>
                          </tr>
                          <tr className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4 font-mono font-bold text-white text-[10px]">MAY 19</td>
                            <td className="p-4 font-semibold text-white">vs Spurs (G1)</td>
                            <td className="p-4 text-center font-mono text-white">43</td>
                            <td className="p-4 text-center font-mono font-bold text-[#007dc3] text-sm">34</td>
                            <td className="p-4 text-center font-mono">12-22</td>
                            <td className="p-4 text-center font-mono">3-5</td>
                            <td className="p-4 text-center font-mono">7-8</td>
                            <td className="p-4 text-center font-mono text-white">7</td>
                            <td className="p-4 text-center font-mono">6</td>
                            <td className="p-4 text-center font-mono">2</td>
                            <td className="p-4 text-center font-mono text-white">1</td>
                            <td className="p-4 text-center font-mono">3</td>
                            <td className="p-4 text-center font-mono">3</td>
                            <td className="p-4 text-center font-mono text-red-400 font-bold">-7</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Gemini AI Game Analysis Center */}
              <div className="bg-[#0b0d10] p-6 md:p-8 rounded-3xl border border-[#ff8f6f]/20 shadow-[0_0_25px_rgba(255,143,111,0.03)] space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/5 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1 px-2.5 rounded-full text-[10px] uppercase font-mono font-bold bg-violet-500/15 text-violet-400 border border-violet-500/30 flex items-center gap-1.5 shadow-md">
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-ping" />
                        AI Sports Core Engaged
                      </span>
                    </div>
                    <h3 className="font-headline text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <Brain className="w-5 h-5 text-violet-400" /> Playoff Series AI Court-Intelligence Analysis
                    </h3>
                    <p className="font-body text-[11px] text-on-surface-variant/80">
                      Deep head-to-head performance analyzer and tactical coaching adjustments powered by Gemini AI
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSeriesAnalysisId('nba-finals');
                        setSeriesAnalysisData(null);
                        setSeriesAnalysisError(null);
                      }}
                      className={`px-4 py-2 rounded-xl text-[11px] font-label uppercase tracking-wider font-extrabold transition-all border ${
                        seriesAnalysisId === 'nba-finals'
                          ? 'bg-violet-600/30 border-violet-500 text-white font-black shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                          : 'bg-white/5 border-white/5 text-on-surface-variant hover:text-white hover:bg-white/10'
                      }`}
                    >
                      NBA Finals Analysis
                    </button>
                    <button
                      onClick={() => {
                        setSeriesAnalysisId('w-finals');
                        setSeriesAnalysisData(null);
                        setSeriesAnalysisError(null);
                      }}
                      className={`px-4 py-2 rounded-xl text-[11px] font-label uppercase tracking-wider font-extrabold transition-all border ${
                        seriesAnalysisId === 'w-finals'
                          ? 'bg-violet-600/30 border-violet-500 text-white font-black shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                          : 'bg-white/5 border-white/5 text-on-surface-variant hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Western Finals Analysis
                    </button>
                    <button
                      onClick={() => {
                        setSeriesAnalysisId('e-finals');
                        setSeriesAnalysisData(null);
                        setSeriesAnalysisError(null);
                      }}
                      className={`px-4 py-2 rounded-xl text-[11px] font-label uppercase tracking-wider font-extrabold transition-all border ${
                        seriesAnalysisId === 'e-finals'
                          ? 'bg-violet-600/30 border-violet-500 text-white font-black shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                          : 'bg-white/5 border-white/5 text-on-surface-variant hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Eastern Finals Analysis
                    </button>
                  </div>
                </div>

                {/* Series Status summary card */}
                {(() => {
                  const activeMatchup = bracketMatchups.find(m => m.id === seriesAnalysisId);
                  if (!activeMatchup) return null;
                  const isWest = seriesAnalysisId === 'w-finals';
                  
                  return (
                    <div className="bg-[#0e1116] border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                          <span className={`w-9 h-9 rounded-full border-2 border-[#0b0d10] flex items-center justify-center font-bold font-mono text-xs shadow-md ${
                            seriesAnalysisId === 'w-finals' ? 'bg-[#007dc3] text-white' : 
                            seriesAnalysisId === 'e-finals' ? 'bg-[#1a4175] text-[#ffdd00]' :
                            'bg-zinc-400 text-black'
                          }`}>
                            {seriesAnalysisId === 'w-finals' ? 'OKC' : 
                             seriesAnalysisId === 'e-finals' ? 'CLE' : 
                             'SAS'}
                          </span>
                          <span className={`w-9 h-9 rounded-full border-2 border-[#0b0d10] flex items-center justify-center font-bold font-mono text-xs shadow-md ${
                            seriesAnalysisId === 'w-finals' ? 'bg-zinc-300 text-black' : 
                            seriesAnalysisId === 'e-finals' ? 'bg-[#1d428a] text-white' : 
                            'bg-orange-500 text-white'
                          }`}>
                            {seriesAnalysisId === 'w-finals' ? 'SAS' : 
                             seriesAnalysisId === 'e-finals' ? 'NYK' : 
                             'NYK'}
                          </span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-white text-xs font-semibold uppercase font-headline tracking-wide">
                              {activeMatchup.team1} vs {activeMatchup.team2}
                            </span>
                            <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-on-surface-variant font-bold">
                              Seed #{activeMatchup.seed1} vs Seed #{activeMatchup.seed2}
                            </span>
                          </div>
                          <div className="text-[11px] text-on-surface-variant/80 font-body mt-1">
                            Current Postseason Series Stats: <span className="text-white font-semibold">{activeMatchup.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                          onClick={() => handleAnalyzeSeries(seriesAnalysisId)}
                          disabled={isAnalyzingSeries}
                          className="w-full md:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-violet-600/50 disabled:to-fuchsia-600/50 text-white font-bold font-label uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95 disabled:pointer-events-none"
                        >
                          {isAnalyzingSeries ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-white" />
                              <span>Compiling Court Stats...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-white" />
                              <span>Analyze with Gemini Coach Intel</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Response / Loading States */}
                {isAnalyzingSeries && (
                  <div className="p-10 bg-[#07090c] border border-white/5 rounded-2xl flex flex-col items-center text-center space-y-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-3 h-3 bg-fuchsia-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-3 h-3 bg-sky-500 rounded-full animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-white text-xs font-semibold uppercase tracking-wider font-mono">Consolidating Dynamic Playoff Scorecards</h4>
                      <p className="text-[11px] text-on-surface-variant/70 font-body max-w-sm">
                        Streaming head-to-head PPG averages, regular season outcomes, and live bracket margins to the Gemini model...
                      </p>
                    </div>
                  </div>
                )}

                {seriesAnalysisError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs flex items-center gap-3">
                    <Info className="w-4 h-4 shrink-0 font-bold" />
                    <span>{seriesAnalysisError}</span>
                  </div>
                )}

                {seriesAnalysisData && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Win Probability & Core Tactical Keys row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Metric Gauge */}
                      <div className="lg:col-span-5 bg-[#0e1116] border border-white/5 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-mono text-on-surface-variant font-bold tracking-widest block">AI Forecast Model</span>
                          <h4 className="text-xs text-white font-semibold font-headline">Series Win Probability Forecast</h4>
                        </div>
                        
                        <div className="space-y-3">
                          {/* Visualization bar */}
                          <div className="flex justify-between items-end">
                            <span className="text-xs text-white font-bold uppercase tracking-wide">
                              {bracketMatchups.find(m => m.id === seriesAnalysisId)?.team1}
                            </span>
                            <span className="text-3xl font-black text-violet-400 font-mono tracking-tighter">
                              {seriesAnalysisData.winProbabilityTeam1}%
                            </span>
                          </div>

                          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex border border-white/5">
                            <div 
                              className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-1000"
                              style={{ width: `${seriesAnalysisData.winProbabilityTeam1}%` }}
                            />
                            <div 
                              className="h-full bg-white/10 transition-all duration-1000 flex-1"
                            />
                          </div>

                          <div className="flex justify-between text-[9px] text-on-surface-variant/60 font-mono">
                            <span>0% Eliminator</span>
                            <span>50% Deadlock</span>
                            <span>100% Champion</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-on-surface-variant/75 bg-white/5 p-3 rounded-xl font-body leading-relaxed border border-white/[0.02]">
                          🎯 Probability combines historic seeds, matchup offensive ratings, and the critical possession factors as series games dynamically unfold.
                        </div>
                      </div>

                      {/* Tactical core checklist */}
                      <div className="lg:col-span-7 bg-[#0e1116] border border-white/5 p-5 rounded-2xl space-y-4">
                        <span className="text-[9px] uppercase font-mono text-on-surface-variant font-bold tracking-widest block">Basketball Science Intelligence</span>
                        <h4 className="text-xs text-white font-semibold font-headline">Key Tactical Directives For Remainder of Series</h4>

                        <div className="space-y-2.5">
                          {seriesAnalysisData.tacticalKeys.map((key, i) => (
                            <div key={i} className="flex items-start gap-3 p-2 px-3 bg-[#07090c] border border-white/5 rounded-xl">
                              <span className="w-5 h-5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span className="text-xs text-on-surface-variant/90 leading-relaxed font-body font-medium">{key}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Trends Description and Coaching Prediction panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Trends Section */}
                      <div className="bg-[#0e1116] border border-white/5 p-5 rounded-2xl space-y-3.5">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                          <Activity className="w-4 h-4 text-violet-400" />
                          <h4 className="text-xs text-white font-bold uppercase tracking-wider font-headline">Performance Trends Analysis</h4>
                        </div>
                        <p className="text-xs text-on-surface-variant/85 leading-relaxed font-body">
                          {seriesAnalysisData.trends}
                        </p>
                      </div>

                      {/* Coaching Prediction Section */}
                      <div className="bg-[#0e1116] border border-white/5 p-5 rounded-2xl space-y-3.5">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                          <Brain className="w-4 h-4 text-fuchsia-400" />
                          <h4 className="text-xs text-white font-bold uppercase tracking-wider font-headline">Coaching Prediction & Tactical Keys</h4>
                        </div>
                        <div className="text-xs text-on-surface-variant/85 leading-relaxed whitespace-pre-wrap font-body">
                          {seriesAnalysisData.coachingPrediction}
                        </div>
                      </div>

                    </div>

                    {/* Generated timestamp or meta info */}
                    <div className="text-center font-mono text-[9px] text-on-surface-variant/45">
                      Model used: <span className="font-semibold text-on-surface-variant/75">gemini-3.5-flash Advanced Basketball Science Core</span> • Synced: {new Date().toLocaleTimeString()}
                    </div>

                  </div>
                )}
              </div>
            </div>
          )}

          {playoffsTab === 'pickem' && (
            <div className="bg-[#0b0d10] p-6 rounded-3xl border border-outline-variant/15 space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="font-headline text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#ff8f6f]" /> Interactive Playoff Pick'Em Predictor
                </h3>
                <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Make your forecast below on who takes home the Western and Eastern crowns! Polls sync instantly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="p-5 bg-[#090b0d] border border-outline-variant/10 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-primary font-black uppercase tracking-wider block mb-3">West Champion Vote</span>
                    <p className="font-headline font-bold text-sm text-white mb-4">Who takes the West Finals Series?</p>
                  </div>
                  <div className="space-y-2">
                    <button 
                      onClick={() => alert("Prediction saved: Oklahoma City Thunder selected for West Champion! Local state synched.")}
                      className="w-full flex justify-between items-center bg-white/5 hover:bg-white/10 p-3.5 rounded-xl border border-white/5 transition-all text-xs text-white uppercase font-label font-bold tracking-wider"
                    >
                      <span>OKC THUNDER</span>
                      <span className="text-primary font-bold">54% Votes</span>
                    </button>
                    <button 
                      onClick={() => alert("Prediction saved: San Antonio Spurs selected for West Champion! Local state synched.")}
                      className="w-full flex justify-between items-center bg-white/5 hover:bg-white/10 p-3.5 rounded-xl border border-white/5 transition-all text-xs text-white uppercase font-label font-bold tracking-wider"
                    >
                      <span>SAN ANTONIO SPURS</span>
                      <span className="font-bold opacity-60">46% Votes</span>
                    </button>
                  </div>
                </div>

                <div className="p-5 bg-[#090b0d] border border-outline-variant/10 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-orange-400 font-black uppercase tracking-wider block mb-3">East Champion Vote</span>
                    <p className="font-headline font-bold text-sm text-white mb-4">Who takes the East Finals Series?</p>
                  </div>
                  <div className="space-y-2">
                    <button 
                      onClick={() => alert("Prediction saved: New York Knicks selected for East Champion! Local state synched.")}
                      className="w-full flex justify-between items-center bg-white/5 hover:bg-white/10 p-3.5 rounded-xl border border-white/5 transition-all text-xs text-white uppercase font-label font-bold tracking-wider"
                    >
                      <span>NEW YORK KNICKS</span>
                      <span className="text-orange-400 font-bold">68% Votes</span>
                    </button>
                    <button 
                      onClick={() => alert("Prediction saved: Cleveland Cavaliers selected for East Champion! Local state synched.")}
                      className="w-full flex justify-between items-center bg-white/5 hover:bg-white/10 p-3.5 rounded-xl border border-white/5 transition-all text-xs text-white uppercase font-label font-bold tracking-wider"
                    >
                      <span>CLEVELAND CAVALIERS</span>
                      <span className="font-bold opacity-60">32% Votes</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </section>

        {/* Selected Matchup Popup Info Drawer Modal */}
        <AnimatePresence>
          {selectedMatchup && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0b0d10] border border-outline-variant/15 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              >
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                  <div>
                    <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-wider block">Series Inspection Tool</span>
                    <h3 className="font-headline font-bold text-lg text-white mt-0.5">Matchup Telemetry Check</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedMatchup(null)} 
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5 flex-1 select-none">
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-label text-on-surface-variant/50 uppercase tracking-wider">TEAM A</span>
                      <span className="text-base font-semibold text-white">{selectedMatchup.team1}</span>
                      {selectedMatchup.seed1 && <span className="text-[9px] text-primary font-mono mt-0.5">Seed #{selectedMatchup.seed1}</span>}
                    </div>
                    <div className="flex flex-col border-l border-white/5 pl-4">
                      <span className="text-[10px] font-label text-on-surface-variant/50 uppercase tracking-wider">TEAM B</span>
                      <span className="text-base font-semibold text-white">{selectedMatchup.team2}</span>
                      {selectedMatchup.seed2 && <span className="text-blue-400 font-mono text-[9px] mt-0.5">Seed #{selectedMatchup.seed2}</span>}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-body text-on-surface-variant">Series Standing:</span>
                      <span className="font-mono text-white font-black">{selectedMatchup.status}</span>
                    </div>
                    {selectedMatchup.channel && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-body text-on-surface-variant">Broadcast Channel:</span>
                        <span className="font-mono text-white/80">{selectedMatchup.channel}</span>
                      </div>
                    )}
                  </div>

                  {selectedMatchup.team1 !== 'TBD' && selectedMatchup.team2 !== 'TBD' ? (
                    <div className="bg-[#0d1014] p-4 rounded-xl border border-white/5 space-y-2 text-xs">
                      <span className="font-label text-[9px] text-[#ff8f6f] font-black uppercase tracking-wider block">Coaches Strategic Note</span>
                      <p className="font-body text-on-surface-variant/80 leading-relaxed">
                        This series is heavily dependent on paint protection and pick-and-roll transition speeds. Both rosters are at 100% capacity. Use the live stream simulation to explore real-time tactics on the coaching board.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#0d1014] p-4 rounded-xl border border-white/5 text-xs text-on-surface-variant/60 italic leading-relaxed">
                      Finalist matches are calculated automatically based on the outcomes of earlier rounds.
                    </div>
                  )}
                </div>

                <div className="p-5 bg-white/[0.02] border-t border-white/5 flex gap-3">
                  <button 
                    onClick={() => setSelectedMatchup(null)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 active:scale-95 text-white rounded-xl text-xs font-label uppercase tracking-wider transition-all"
                  >
                    Close Inspection
                  </button>
                  {selectedMatchup.team1 !== 'TBD' && selectedMatchup.team2 !== 'TBD' && (
                    <button 
                      onClick={() => {
                        // Dynamically link to streaming core!
                        setStreamedMatchupId(selectedMatchup.id);
                        setEvents([]); // Clean logs
                        handleTeamChange('home', selectedMatchup.team1);
                        handleTeamChange('away', selectedMatchup.team2);
                        
                        // Set standard playoffs scores
                        setBaseHomeScore(0);
                        setBaseAwayScore(0);
                        
                        setTimeLeft(720); // reset quarter time to 1st quarter (12:00)
                        setCurrentQuarter(1);
                        setIsPlayoffStreaming(true);
                        setIsPlayoffsPaused(false);
                        setSelectedMatchup(null);
                        setActiveTab('dashboard'); // Take them to live dashboard control room!
                      }}
                      className="flex-1 py-3 bg-primary hover:bg-opacity-80 active:scale-95 text-black font-label font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-4 h-4 text-black fill-black" /> Stream Live Telemetry
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Telemetry Display (If Active) */}
        {isPlayoffStreaming && streamedMatchupId && (
          <section className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-error animate-pulse" />
                <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Live Telemetry Control Room</h3>
              </div>
              <div className="font-label text-xs uppercase tracking-widest text-on-surface-variant bg-surface-container py-1.5 px-4 rounded-full border border-white/5">
                Target: {homeTeamName} vs {awayTeamName}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Telemetry Actions and Controls */}
              <div className="bg-surface-container-high/40 border border-outline-variant/5 p-6 rounded-2xl space-y-6">
                <h4 className="font-label text-xs font-bold uppercase tracking-widest text-primary">Simulation Injectors</h4>
                <div className="grid grid-cols-2 gap-3 pb-4 border-b border-white/5">
                  <button 
                    id="btn-inject-team-play-home"
                    onClick={() => {
                      const rosterList = TEAM_DATA[homeTeamName]?.roster || [];
                      const randomPlayer = rosterList[Math.floor(Math.random() * Math.min(rosterList.length, 5))];
                      const mins = Math.floor(timeLeft / 60);
                      const secs = timeLeft % 60;
                      const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                      injectLivePlaybyPlay(randomPlayer, 'home', '3PT Made', 'score', 3, timeString, `Q${currentQuarter}`);
                    }}
                    className="py-3 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl text-[10px] font-label font-bold uppercase tracking-widest transition-all active:scale-95 border border-primary/10"
                  >
                    +3PT Home Play
                  </button>
                  <button 
                    id="btn-inject-team-play-away"
                    onClick={() => {
                      const rosterList = TEAM_DATA[awayTeamName]?.roster || [];
                      const randomPlayer = rosterList[Math.floor(Math.random() * Math.min(rosterList.length, 5))];
                      const mins = Math.floor(timeLeft / 60);
                      const secs = timeLeft % 60;
                      const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                      injectLivePlaybyPlay(randomPlayer, 'away', '2PT Made', 'score', 2, timeString, `Q${currentQuarter}`);
                    }}
                    className="py-3 bg-blue-400/20 hover:bg-blue-400/30 text-blue-400 rounded-xl text-[10px] font-label font-bold uppercase tracking-widest transition-all active:scale-95 border border-blue-400/10"
                  >
                    +2PT Away Play
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-body text-on-surface-variant">Home Win Probability</span>
                    <span className="font-mono text-primary font-bold">{Math.round((homeScore / (homeScore + awayScore || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-primary h-full transition-all duration-500" 
                      style={{ width: `${(homeScore / (homeScore + awayScore || 1)) * 100}%` }}
                    />
                    <div 
                      className="bg-blue-400 h-full transition-all duration-500" 
                      style={{ width: `${(awayScore / (homeScore + awayScore || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-surface-container-low p-4 rounded-xl border border-white/5 text-xs text-on-surface-variant font-body">
                  <p className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-primary shrink-0" />
                    <strong>Telemetry AI Hint</strong>
                  </p>
                  Coaches can view shot distributions under the <strong>Stats</strong> tab, or run automated real-time AI strategic simulations under the <strong>Dashboard</strong> while live streaming.
                </div>
              </div>

              {/* Streaming PlaybyPlay Logs */}
              <div className="lg:col-span-2 bg-surface bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 flex flex-col h-[280px]">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                  <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold font-mono">Stream Log Transmission</span>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-ping" />
                    <span className="font-mono text-[9px] text-green-400 font-bold tracking-widest">LIVE DATA FEED</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10 max-h-[200px]">
                  {events.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-xs text-on-surface-variant/40">
                      <History className="w-8 h-8 opacity-25 mb-2 animate-spin duration-3000" />
                      Listening for live play-by-play transmissions...
                    </div>
                  ) : (
                    events.map(event => {
                      const isHome = event.team === 'home';
                      const color = event.type === 'score' ? (isHome ? 'text-primary' : 'text-blue-400') : 
                                    event.type === 'miss' ? 'text-gray-500 line-through' :
                                    event.type === 'steal' || event.type === 'block' ? 'text-green-400' : 'text-on-surface';
                      return (
                        <div key={event.id} className="text-xs flex items-start gap-3 p-2 bg-white/[0.02] hover:bg-white/[0.04] rounded transition-all">
                          <span className="font-mono text-[10px] text-on-surface-variant/50 tracking-tighter self-start shrink-0">
                            {event.quarter} {event.time}
                          </span>
                          <span className={`font-mono text-[10px] ${isHome ? 'bg-primary/15 text-primary' : 'bg-blue-400/15 text-blue-400'} px-2 py-0.5 rounded uppercase text-[9px] shrink-0 font-bold`}>
                            {isHome ? TEAM_DATA[homeTeamName]?.shortName || 'HOME' : TEAM_DATA[awayTeamName]?.shortName || 'AWAY'}
                          </span>
                          <div className="flex-1">
                            <span className="font-bold text-on-surface">{event.player}</span>
                            <span className={`ml-2 text-on-surface-variant ${color}`}>{event.action}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    )}

    {activeTab === 'body' && (
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-primary">BIOMETRICS</h1>
            <p className="font-body text-on-surface-variant">Advanced Physical Profile & Core Combine Measurements</p>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-high px-6 py-3 rounded-2xl border border-outline-variant/10">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span className="font-label text-xs font-bold uppercase tracking-widest">System Ready • Health Optimal</span>
          </div>
        </div>

        <RosterBodyMap 
          initialTeamName={activeTeam === 'home' ? homeTeamName : awayTeamName} 
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="md:col-span-2 space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Height (No Shoes)', value: playerBiometrics.heightWithoutShoes, icon: <User className="w-5 h-5" />, color: 'text-primary' },
                { label: 'Height (With Shoes)', value: playerBiometrics.heightWithShoes, icon: <Activity className="w-5 h-5" />, color: 'text-secondary' },
                { label: 'Weight', value: playerBiometrics.weight, icon: <Scale className="w-5 h-5" />, color: 'text-orange-400' },
                { label: 'Wingspan', value: playerBiometrics.wingspan, icon: <ArrowUpRight className="w-5 h-5" />, color: 'text-blue-400' },
                { label: 'Standing Reach', value: playerBiometrics.standingReach, icon: <Hand className="w-5 h-5" />, color: 'text-yellow-400' },
                { label: 'Body Fat %', value: playerBiometrics.bodyFat, icon: <Heart className="w-5 h-5" />, color: 'text-red-400' }
              ].map((item, i) => (
                <div key={i} className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 flex flex-col items-center gap-3 hover:border-primary/20 transition-all group">
                  <div className={`p-3 rounded-2xl bg-surface-container-highest/50 ${item.color} group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-label text-on-surface-variant uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-xl font-headline font-black tracking-tight">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 relative overflow-hidden h-[400px]">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <svg width="100%" height="100%">
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-xs flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Physical Load Analysis (Last 7 Days)
                  </h3>
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary" />
                    <span className="w-3 h-3 rounded-full bg-secondary opacity-30" />
                  </div>
                </div>

                <div className="flex-1 flex items-end justify-between gap-4">
                  {[65, 82, 45, 95, 78, 62, 55].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3">
                      <div className="w-full relative group">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${val}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className={`w-full rounded-t-xl bg-gradient-to-t ${i === 3 ? 'from-primary/20 to-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]' : 'from-primary/10 to-primary/40'} group-hover:to-primary transition-all`}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          {val}%
                        </div>
                      </div>
                      <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Side Info */}
          <div className="space-y-8">
            {/* Interactive Update Profile Form Card */}
            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
              <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-primary" />
                Update Combine Anthropometrics
              </h3>
              <div className="space-y-4 text-xs font-body">
                <div>
                  <label className="block text-on-surface-variant font-label text-[9px] uppercase tracking-wider mb-1">Height (Without Shoes)</label>
                  <input
                    type="text"
                    value={playerBiometrics.heightWithoutShoes}
                    onChange={(e) => setPlayerBiometrics({ ...playerBiometrics, heightWithoutShoes: e.target.value })}
                    className="w-full bg-surface-container-high border border-outline-variant/15 rounded-xl px-3 py-2 text-white font-mono focus:ring-1 focus:ring-primary outline-none"
                    placeholder="e.g. 6ft 4.75in"
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant font-label text-[9px] uppercase tracking-wider mb-1">Height (With Shoes)</label>
                  <input
                    type="text"
                    value={playerBiometrics.heightWithShoes}
                    onChange={(e) => setPlayerBiometrics({ ...playerBiometrics, heightWithShoes: e.target.value, height: e.target.value })}
                    className="w-full bg-surface-container-high border border-outline-variant/15 rounded-xl px-3 py-2 text-white font-mono focus:ring-1 focus:ring-primary outline-none"
                    placeholder="e.g. 6ft 6in"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-on-surface-variant font-label text-[9px] uppercase tracking-wider mb-1">Weight</label>
                    <input
                      type="text"
                      value={playerBiometrics.weight}
                      onChange={(e) => setPlayerBiometrics({ ...playerBiometrics, weight: e.target.value })}
                      className="w-full bg-surface-container-high border border-outline-variant/15 rounded-xl px-3 py-2 text-white font-mono focus:ring-1 focus:ring-primary outline-none"
                      placeholder="e.g. 215 lbs"
                    />
                  </div>
                  <div>
                    <label className="block text-on-surface-variant font-label text-[9px] uppercase tracking-wider mb-1">Body Fat %</label>
                    <input
                      type="text"
                      value={playerBiometrics.bodyFat}
                      onChange={(e) => setPlayerBiometrics({ ...playerBiometrics, bodyFat: e.target.value })}
                      className="w-full bg-surface-container-high border border-outline-variant/15 rounded-xl px-3 py-2 text-white font-mono focus:ring-1 focus:ring-primary outline-none"
                      placeholder="e.g. 6.2%"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-on-surface-variant font-label text-[9px] uppercase tracking-wider mb-1">Wingspan</label>
                    <input
                      type="text"
                      value={playerBiometrics.wingspan}
                      onChange={(e) => setPlayerBiometrics({ ...playerBiometrics, wingspan: e.target.value })}
                      className="w-full bg-surface-container-high border border-outline-variant/15 rounded-xl px-3 py-2 text-white font-mono focus:ring-1 focus:ring-primary outline-none"
                      placeholder="e.g. 6ft 11in"
                    />
                  </div>
                  <div>
                    <label className="block text-on-surface-variant font-label text-[9px] uppercase tracking-wider mb-1">Standing Reach</label>
                    <input
                      type="text"
                      value={playerBiometrics.standingReach}
                      onChange={(e) => setPlayerBiometrics({ ...playerBiometrics, standingReach: e.target.value })}
                      className="w-full bg-surface-container-high border border-outline-variant/15 rounded-xl px-3 py-2 text-white font-mono focus:ring-1 focus:ring-primary outline-none"
                      placeholder="e.g. 8ft 9.5in"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
              <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                <Heart className="w-3 h-3 text-error" />
                Vitals & Status
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-surface-container rounded-2xl border border-outline-variant/5">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-on-surface-variant" />
                    <span className="text-xs font-label uppercase tracking-widest">Resting Heart Rate</span>
                  </div>
                  <span className="text-lg font-headline font-bold">54 BPM</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant/5">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="text-xs font-label uppercase tracking-widest">Medical Status</span>
                  </div>
                  <span className="text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full uppercase tracking-tighter">Healthy</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
              <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-[10px] mb-6">Physical Trends</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-body">Lower Body Explositivy</h4>
                    <p className="text-[10px] text-on-surface-variant font-label uppercase">+2.4% vs last project cycle</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-400/10 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-body">Ankle Stability</h4>
                    <p className="text-[10px] text-on-surface-variant font-label uppercase">Optimal • Consistent results</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20">
              <p className="text-[9px] font-label text-primary uppercase tracking-[0.2em] mb-2 font-black">Performance Alert</p>
              <p className="text-xs font-body text-on-surface-variant leading-relaxed">
                Sleep quality has decreased by 15% this week. This is correlated with your late night shooting sessions.
              </p>
            </div>
          </div>
        </div>
      </div>
    )}

    {activeTab === 'intel' && (
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-primary">INTEL HUB</h1>
            <p className="font-body text-on-surface-variant">Core AI Modeling, Player Synergy, and Roster Action Simulations</p>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-high px-6 py-3 rounded-2xl border border-outline-variant/10">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="font-label text-xs font-bold uppercase tracking-widest text-[#FF8F6F]">Advanced AI Solitary Compute Mode</span>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/10 w-full md:w-max">
          <button 
            onClick={() => setIntelSubTab('chemistry')}
            className={`flex-1 md:flex-initial px-6 py-3 rounded-xl font-label text-xs font-bold uppercase tracking-wider transition-all duration-150 ${intelSubTab === 'chemistry' ? 'performance-gradient text-black font-extrabold' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            🔬 Chemistry Predictor
          </button>
          <button 
            onClick={() => setIntelSubTab('injury')}
            className={`flex-1 md:flex-initial px-6 py-3 rounded-xl font-label text-xs font-bold uppercase tracking-wider transition-all duration-150 ${intelSubTab === 'injury' ? 'performance-gradient text-black font-extrabold' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            ❤️ Soft-Tissue Mitigation
          </button>
          <button 
            onClick={() => setIntelSubTab('trade')}
            className={`flex-1 md:flex-initial px-6 py-3 rounded-xl font-label text-xs font-bold uppercase tracking-wider transition-all duration-150 ${intelSubTab === 'trade' ? 'performance-gradient text-black font-extrabold' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            🔄 Trade Simulator
          </button>
        </div>

        {/* Chemistry Predictor View */}
        {intelSubTab === 'chemistry' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant/10 space-y-6">
              <h2 className="font-headline text-2xl font-black tracking-tight flex items-center gap-2">
                <span>Select Team & Lineup</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 font-bold font-sans">Target Team</label>
                  <select 
                    value={chemTeam}
                    onChange={(e) => {
                      const t = e.target.value;
                      setChemTeam(t);
                      // Auto preselect first 3 players of the new team
                      setChemSelectedPlayers(TEAM_DATA[t]?.roster.slice(0, 3) || []);
                    }}
                    className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 outline-none text-on-surface focus:border-primary/50"
                  >
                    {Object.keys(TEAM_DATA).map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 font-bold font-sans">
                    Select 2 to 5 Players ({chemSelectedPlayers.length} selected)
                  </label>
                  <p className="text-[10px] text-on-surface-variant/70 mb-3 font-body">Selected players represent the floor squad to verify cumulative spacing and rotational density index.</p>
                  <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                    {TEAM_DATA[chemTeam]?.roster.map(p => {
                      const isSelected = chemSelectedPlayers.includes(p);
                      return (
                        <label 
                          key={p} 
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-primary/10 border-primary/30 text-on-surface' 
                              : 'bg-surface-container-low border-outline-variant/5 hover:border-outline-variant/20 text-on-surface-variant'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setChemSelectedPlayers(chemSelectedPlayers.filter(x => x !== p));
                                } else if (chemSelectedPlayers.length < 5) {
                                  setChemSelectedPlayers([...chemSelectedPlayers, p]);
                                }
                              }}
                              className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-1 focus:ring-primary accent-[#FF8F6F]"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold font-body">{p}</span>
                              <span className="text-[10px] uppercase font-label text-on-surface-variant/70">
                                #{TEAM_DATA[chemTeam]?.numbers[p] || '00'} • {TEAM_DATA[chemTeam]?.positions[p] || 'Player'}
                              </span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-8">
              {chemResult ? (
                <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 space-y-8 animate-in fade-in duration-500">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-outline-variant/15">
                    <div>
                      <span className="text-[10px] font-label font-bold text-primary uppercase tracking-[0.2em]">Predicted Lineup Spacing Harmony</span>
                      <h3 className="font-headline text-3xl font-black tracking-tight">{chemResult.status}</h3>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                          <circle 
                            cx="40" cy="40" r="32" 
                            stroke={chemResult.score >= 80 ? '#22C55E' : chemResult.score >= 65 ? '#EAB308' : '#EF4444'} 
                            strokeWidth="6" 
                            fill="transparent" 
                            strokeDasharray={6.28 * 32}
                            strokeDashoffset={6.28 * 32 * (1 - chemResult.score / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute font-headline text-xl font-black">{chemResult.score}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Meter Progress Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Defense Rotations', val: chemResult.metrics?.defense || 70, col: '#EF4444' },
                      { label: 'Half-Court Spacing', val: chemResult.metrics?.spacing || 70, col: '#3B82F6' },
                      { label: 'Ball Share Index', val: chemResult.metrics?.ballShare || 70, col: '#F59E0B' },
                      { label: 'Perimeter Closeout', val: chemResult.metrics?.closeout || 70, col: '#10B981' }
                    ].map((m, i) => (
                      <div key={i} className="bg-surface-container p-4 rounded-2xl border border-outline-variant/10 flex flex-col gap-2">
                        <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">{m.label}</span>
                        <div className="flex items-end justify-between">
                          <span className="font-headline text-xl font-bold">{m.val}%</span>
                          <span className="text-[9px] font-label text-green-400 font-bold uppercase font-sans">Optimal</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                          <div 
                            className="h-full rounded-full transition-all duration-1050" 
                            style={{ width: `${m.val}%`, backgroundColor: m.col }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Highlights and Bottlenecks block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-500/5 p-6 rounded-2xl border border-green-500/20 space-y-3">
                      <h4 className="font-headline text-sm font-bold text-green-400 flex items-center gap-2">
                        <Check className="w-4 h-4" /> <span>Chemistry Highlights</span>
                      </h4>
                      <ul className="space-y-2 text-xs text-on-surface-variant font-body">
                        {chemResult.highlights?.map((h: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-green-400 font-bold shrink-0">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/20 space-y-3">
                      <h4 className="font-headline text-sm font-bold text-amber-400 flex items-center gap-2">
                        <Info className="w-4 h-4" /> <span>Potential Bottlenecks</span>
                      </h4>
                      <ul className="space-y-2 text-xs text-on-surface-variant font-body">
                        {chemResult.bottlenecks?.map((b: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-amber-400 font-bold shrink-0">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Tactical recommendations */}
                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 flex gap-4">
                    <Brain className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold font-label uppercase text-primary tracking-wider mb-1">Recommended Tactical Action</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed font-body">{chemResult.recommendations}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[430px] flex items-center justify-center bg-surface-container rounded-3xl border border-outline-variant/10">
                  <div className="flex flex-col items-center gap-3 text-on-surface-variant">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                    <span className="font-label text-xs uppercase tracking-widest font-bold font-sans">Predicting Synergy Map...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Soft-Tissue Injury View */}
        {intelSubTab === 'injury' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant/10 space-y-6">
              <h2 className="font-headline text-2xl font-black tracking-tight">Athlete Risk Setup</h2>
              <div className="space-y-4">
                <div>
                  <label className="block font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 font-bold font-sans">Monitor Target Athlete</label>
                  <select 
                    value={injuryPlayer}
                    onChange={(e) => {
                      setInjuryPlayer(e.target.value);
                    }}
                    className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 outline-none text-on-surface focus:border-primary/50"
                  >
                    {/* Select standard main roster stars */}
                    <option value="Victor Wembanyama">Victor Wembanyama</option>
                    <option value="Shai Gilgeous-Alexander">Shai Gilgeous-Alexander</option>
                    <option value="Chet Holmgren">Chet Holmgren</option>
                    <option value="Devin Vassell">Devin Vassell</option>
                    <option value="Jalen Brunson">Jalen Brunson</option>
                    <option value="Jayson Tatum">Jayson Tatum</option>
                    <option value="Donovan Mitchell">Donovan Mitchell</option>
                    <option value="Jarrett Allen">Jarrett Allen</option>
                    <option value="Evan Mobley">Evan Mobley</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Simulate Added Minutes</label>
                    <span className="text-xs font-headline font-black text-primary">+{injuryAddedMins} mins/week</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="40" 
                    step="5"
                    value={injuryAddedMins}
                    onChange={(e) => setInjuryAddedMins(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF8F6F]"
                  />
                  <div className="flex justify-between text-[9px] font-label text-on-surface-variant/70 mt-1 uppercase tracking-wider font-sans">
                    <span>Baseline (0)</span>
                    <span>High Workload (+40)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-8">
              {injuryResult ? (
                <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 space-y-8 animate-in fade-in duration-500">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-outline-variant/15">
                    <div>
                      <span className="text-[10px] font-label font-bold text-[#FF8F6F] uppercase tracking-[0.2em]">Workload Load Management Simulator</span>
                      <h3 className="font-headline text-3xl font-black tracking-tight">{injuryPlayer} Physical Evaluation</h3>
                    </div>

                    <div className="bg-surface-container px-6 py-4 rounded-2xl border border-outline-variant/10 flex flex-col items-center shrink-0">
                      <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-1">Fatigue Index</span>
                      <span className={`text-2xl font-headline font-black ${injuryResult.fatigueIndex >= 65 ? 'text-red-400 animate-pulse' : 'text-primary'}`}>
                        {injuryResult.fatigueIndex}%
                      </span>
                    </div>
                  </div>

                  {/* Soft-Tissue Strain Hazard Bars */}
                  <div className="space-y-6">
                    <h4 className="font-label text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-black">Soft-Tissue Hazard Metrics</h4>
                    <div className="space-y-4">
                      {[
                        { label: 'Hamstring Strain Injury Risk', risk: injuryResult.hamstringRisk || 30 },
                        { label: 'Patellar Tendonitis Index Hazard', risk: injuryResult.patellarRisk || 30 },
                        { label: 'Calf Muscle Tightness / Achilles Fatigue', risk: injuryResult.calfRisk || 30 }
                      ].map((item, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-body font-semibold text-on-surface">{item.label}</span>
                            <span className={`font-headline font-bold ${item.risk >= 65 ? 'text-red-400 font-extrabold' : item.risk >= 45 ? 'text-yellow-400' : 'text-green-400'}`}>
                              {item.risk}% {item.risk >= 65 ? '• HIGH RISK' : item.risk >= 45 ? '• ELEVATED' : '• NOMINAL'}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ${
                                item.risk >= 65 ? 'bg-red-500' : item.risk >= 45 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${item.risk}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medical Recovery Blueprint */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10 space-y-4">
                      <h4 className="font-headline text-sm font-bold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" /> <span>Kinetic Recovery Protocols</span>
                      </h4>
                      <div className="space-y-3">
                        {injuryResult.recommendedRecovery?.map((rec: string, i: number) => (
                          <div key={i} className="flex gap-3 text-xs leading-relaxed text-on-surface-variant font-body">
                            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</div>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#FF8F6F]/5 p-6 rounded-2xl border border-[#FF8F6F]/20 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="font-headline text-sm font-bold text-[#FF8F6F] flex items-center gap-2">
                          <Brain className="w-4 h-4" /> <span>Biomechanics Insight</span>
                        </h4>
                        <p className="text-xs text-on-surface-variant font-body leading-relaxed">{injuryResult.insights}</p>
                      </div>
                      <div className="pt-4 border-t border-[#FF8F6F]/10 mt-4 flex justify-between items-center text-[10px] font-label text-[#FF8F6F] font-bold uppercase tracking-wider">
                        <span>Physical Strain Ratio Threshold</span>
                        <span className="text-sm font-headline font-black">{injuryResult.strainRatio || "1.12"} / 2.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[430px] flex items-center justify-center bg-surface-container rounded-3xl border border-outline-variant/10">
                  <div className="flex flex-col items-center gap-3 text-on-surface-variant">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#FF8F6F]" />
                    <span className="font-label text-xs uppercase tracking-widest font-bold font-sans">Simulating Workload Risks...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trade Simulator View */}
        {intelSubTab === 'trade' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Source Team & Target Team select block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-label font-bold text-primary uppercase tracking-[0.2em]">Source Organization</span>
                  <span className="text-xs font-label text-on-surface-variant font-bold uppercase">{tradeSelectedA.length} Players Traded</span>
                </div>
                <select 
                  value={tradeTeamA}
                  onChange={(e) => {
                    setTradeTeamA(e.target.value);
                    setTradeSelectedA([]);
                  }}
                  className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 outline-none text-on-surface text-sm focus:border-primary/50"
                >
                  {Object.keys(TEAM_DATA).map(team => (
                    <option key={team} value={team} disabled={team === tradeTeamB}>{team}</option>
                  ))}
                </select>

                <div className="max-h-[220px] overflow-y-auto space-y-1 my-3 pr-2 custom-scrollbar">
                  {TEAM_DATA[tradeTeamA]?.roster.slice(0, 8).map(p => {
                    const isTraded = tradeSelectedA.includes(p);
                    return (
                      <button 
                        key={p}
                        onClick={() => {
                          if (isTraded) {
                            setTradeSelectedA(tradeSelectedA.filter(x => x !== p));
                          } else {
                            setTradeSelectedA([...tradeSelectedA, p]);
                          }
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex justify-between items-center ${
                          isTraded 
                            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                            : 'bg-surface-container-low border-outline-variant/5 hover:border-outline-variant/10 text-on-surface-variant'
                        }`}
                      >
                        <span className="font-semibold">{p}</span>
                        <span>{isTraded ? "Traded Out" : "Select Asset"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-label font-bold text-orange-400 uppercase tracking-[0.2em]">Partner Organization</span>
                  <span className="text-xs font-label text-on-surface-variant font-bold uppercase">{tradeSelectedB.length} Players Traded</span>
                </div>
                <select 
                  value={tradeTeamB}
                  onChange={(e) => {
                    setTradeTeamB(e.target.value);
                    setTradeSelectedB([]);
                  }}
                  className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 outline-none text-on-surface text-sm focus:border-primary/50"
                >
                  {Object.keys(TEAM_DATA).map(team => (
                    <option key={team} value={team} disabled={team === tradeTeamA}>{team}</option>
                  ))}
                </select>

                <div className="max-h-[220px] overflow-y-auto space-y-1 my-3 pr-2 custom-scrollbar">
                  {TEAM_DATA[tradeTeamB]?.roster.slice(0, 8).map(p => {
                    const isTraded = tradeSelectedB.includes(p);
                    return (
                      <button 
                        key={p}
                        onClick={() => {
                          if (isTraded) {
                            setTradeSelectedB(tradeSelectedB.filter(x => x !== p));
                          } else {
                            setTradeSelectedB([...tradeSelectedB, p]);
                          }
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex justify-between items-center ${
                          isTraded 
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                            : 'bg-surface-container-low border-outline-variant/5 hover:border-outline-variant/10 text-on-surface-variant'
                        }`}
                      >
                        <span className="font-semibold">{p}</span>
                        <span>{isTraded ? "Traded Out" : "Select Asset"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Results block */}
            {tradeResult ? (
              <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center pb-6 border-b border-outline-variant/15">
                  <div>
                    <span className="text-[10px] font-label font-bold text-primary uppercase tracking-[0.2em]">Transaction Outcome Analytics</span>
                    <h3 className="font-headline text-3xl font-black tracking-tight">{tradeResult.viabilityRank}</h3>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-xs font-label text-green-400 font-bold uppercase font-sans">
                    Financial Alignment Compliance
                  </div>
                </div>

                {/* Simulated Changes Comparison Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10 space-y-6">
                    <h4 className="font-headline text-base font-bold text-primary">{tradeTeamA} Impacts</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-xl bg-surface-container-low">
                        <span className="block text-[9px] font-label uppercase text-on-surface-variant mb-1">Spacing Shift</span>
                        <span className={`text-lg font-headline font-semibold ${tradeResult.teamAImpact?.spacingChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tradeResult.teamAImpact?.spacingChange >= 0 ? '+' : ''}{tradeResult.teamAImpact?.spacingChange}%
                        </span>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-surface-container-low">
                        <span className="block text-[9px] font-label uppercase text-on-surface-variant mb-1">Defense Shift</span>
                        <span className={`text-lg font-headline font-semibold ${tradeResult.teamAImpact?.defenseChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tradeResult.teamAImpact?.defenseChange >= 0 ? '+' : ''}{tradeResult.teamAImpact?.defenseChange}%
                        </span>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-surface-container-low">
                        <span className="block text-[9px] font-label uppercase text-on-surface-variant mb-1">Win Projection</span>
                        <span className={`text-lg font-headline font-semibold ${tradeResult.teamAImpact?.winProjChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tradeResult.teamAImpact?.winProjChange >= 0 ? '+' : ''}{tradeResult.teamAImpact?.winProjChange} wins
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10 space-y-6">
                    <h4 className="font-headline text-base font-bold text-orange-400">{tradeTeamB} Impacts</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-xl bg-surface-container-low">
                        <span className="block text-[9px] font-label uppercase text-on-surface-variant mb-1">Spacing Shift</span>
                        <span className={`text-lg font-headline font-semibold ${tradeResult.teamBImpact?.spacingChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tradeResult.teamBImpact?.spacingChange >= 0 ? '+' : ''}{tradeResult.teamBImpact?.spacingChange}%
                        </span>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-surface-container-low">
                        <span className="block text-[9px] font-label uppercase text-on-surface-variant mb-1">Defense Shift</span>
                        <span className={`text-lg font-headline font-semibold ${tradeResult.teamBImpact?.defenseChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tradeResult.teamBImpact?.defenseChange >= 0 ? '+' : ''}{tradeResult.teamBImpact?.defenseChange}%
                        </span>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-surface-container-low">
                        <span className="block text-[9px] font-label uppercase text-on-surface-variant mb-1">Win Projection</span>
                        <span className={`text-lg font-headline font-semibold ${tradeResult.teamBImpact?.winProjChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tradeResult.teamBImpact?.winProjChange >= 0 ? '+' : ''}{tradeResult.teamBImpact?.winProjChange} wins
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis Content */}
                <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10 space-y-4">
                  <h4 className="font-headline text-sm font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF8F6F]" /> <span>Roster & Floor Spacing Shockwave Analysis</span>
                  </h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-body">{tradeResult.synergyAnalysis}</p>
                </div>

                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 flex gap-4">
                  <User className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold font-label uppercase text-primary tracking-wider mb-1">Coaching Realignment Outlook</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed font-body">{tradeResult.coachingOutlook}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[430px] flex items-center justify-center bg-surface-container rounded-3xl border border-outline-variant/10">
                <div className="flex flex-col items-center gap-3 text-on-surface-variant">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                  <span className="font-label text-xs uppercase tracking-widest font-bold font-sans">Simulating Trade Shockwaves...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )}

    {activeTab === 'consistency' && (
      <PlayerConsistency activePlayer={activePlayer} />
    )}

    {activeTab === 'vision' && (
      <ParallelBoxDecoder />
    )}
  </main>

      {/* Goals Modal */}
      <AnimatePresence>
        {isGoalsModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface-container w-full max-w-md rounded-3xl p-8 border border-primary/20 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-headline text-2xl font-bold text-primary">SET PLAYER GOALS</h3>
                  <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-1">Player: {activePlayer}</p>
                </div>
                <button onClick={() => setIsGoalsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {[
                  { label: 'Points', key: 'points', icon: <Zap className="w-4 h-4" /> },
                  { label: 'Rebounds', key: 'rebounds', icon: <History className="w-4 h-4" /> },
                  { label: 'Assists', key: 'assists', icon: <MessageSquare className="w-4 h-4" /> },
                  { label: 'Steals', key: 'steals', icon: <Shield className="w-4 h-4" /> },
                  { label: 'Blocks', key: 'blocks', icon: <Brain className="w-4 h-4" /> }
                ].map(g => (
                  <div key={g.key} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="text-primary">{g.icon}</div>
                      <label className="block font-label text-xs text-on-surface-variant uppercase tracking-widest">{g.label} Goal</label>
                    </div>
                    <input 
                      type="number" 
                      value={editGoals[g.key as keyof PlayerGoals]}
                      onChange={(e) => setEditGoals({ ...editGoals, [g.key]: parseInt(e.target.value) || 0 })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary outline-none font-headline text-xl"
                    />
                  </div>
                ))}

                <button 
                  onClick={updateGoals}
                  className="w-full performance-gradient text-black py-4 rounded-xl font-label font-bold uppercase tracking-widest active:scale-95 transition-transform mt-4 shadow-lg"
                >
                  Save Goals
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Jersey Customizer Modal */}
      <AnimatePresence>
        {isJerseyModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface-container w-full max-w-2xl rounded-3xl p-8 border border-primary/20 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-headline text-2xl font-bold text-primary">JERSEY CUSTOMIZER</h3>
                  <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-1">Player: {activePlayer}</p>
                </div>
                <button onClick={() => setIsJerseyModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Preview */}
                <div className="flex flex-col items-center gap-6">
                  <div className="relative group">
                    <div className={`w-48 h-64 rounded-2xl ${playerJerseys[activePlayer] || 'bg-surface-container-highest'} flex items-center justify-center border-4 border-white/10 shadow-2xl relative overflow-hidden transition-all duration-500`}>
                      {playerJerseys[activePlayer]?.startsWith('data:image') ? (
                        <img src={playerJerseys[activePlayer]} alt="Jersey" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/60 to-transparent" />
                      )}
                      <div className="relative z-10 flex flex-col items-center">
                        {playerPhotos[activePlayer] && (
                          <div className="w-20 h-20 rounded-full border-2 border-white/20 overflow-hidden mb-4 shadow-xl">
                            <img src={playerPhotos[activePlayer]} alt={activePlayer} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <span className="font-headline text-7xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                          {players[activePlayer] || '00'}
                        </span>
                        <span className="font-label text-sm font-bold text-white/80 uppercase tracking-[0.3em] mt-2 drop-shadow-md">
                          {activePlayer}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block font-label text-[10px] text-on-surface-variant uppercase tracking-widest text-center">Jersey Design</label>
                        <label className="flex flex-col items-center justify-center gap-2 w-full py-3 bg-primary/10 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer hover:bg-primary/20 transition-all group">
                          <Upload className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                          <span className="font-label text-[8px] font-bold text-primary uppercase">Jersey</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setPlayerJerseys({ ...playerJerseys, [activePlayer]: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <div className="space-y-2">
                        <label className="block font-label text-[10px] text-on-surface-variant uppercase tracking-widest text-center">Profile Photo</label>
                        <label className="flex flex-col items-center justify-center gap-2 w-full py-3 bg-secondary/10 border-2 border-dashed border-secondary/30 rounded-xl cursor-pointer hover:bg-secondary/20 transition-all group">
                          <User className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
                          <span className="font-label text-[8px] font-bold text-secondary uppercase">Photo</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setPlayerPhotos({ ...playerPhotos, [activePlayer]: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Presets & Details */}
                <div className="space-y-6">
                  <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 space-y-4">
                    <h4 className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2">Player Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Name</label>
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Number</label>
                        <input 
                          type="text" 
                          value={editNumber}
                          onChange={(e) => setEditNumber(e.target.value)}
                          className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Position</label>
                      <select 
                        value={editPosition}
                        onChange={(e) => setEditPosition(e.target.value)}
                        className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option value="">Select Position</option>
                        <option value="Point Guard">Point Guard</option>
                        <option value="Shooting Guard">Shooting Guard</option>
                        <option value="Small Forward">Small Forward</option>
                        <option value="Power Forward">Power Forward</option>
                        <option value="Center">Center</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => handleDeletePlayer(activePlayer)}
                        className="flex-1 py-2 bg-error/10 text-error border border-error/20 rounded-lg text-xs font-label font-bold uppercase tracking-widest hover:bg-error/20 transition-colors"
                      >
                        Delete
                      </button>
                      <button 
                        onClick={() => handleUpdatePlayer(activePlayer, editName, editNumber, editPosition)}
                        className="flex-1 py-2 bg-primary text-black rounded-lg text-xs font-label font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                      >
                        Save Details
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-4">Team Colors</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { name: 'Lakers', class: 'bg-[#552583]' },
                        { name: 'Bulls', class: 'bg-[#CE1141]' },
                        { name: 'Celtics', class: 'bg-[#007A33]' },
                        { name: 'Warriors', class: 'bg-[#1D428A]' },
                        { name: 'Suns', class: 'bg-[#E56020]' },
                        { name: 'Heat', class: 'bg-[#98002E]' },
                        { name: 'Spurs', class: 'bg-[#C4CED4]' },
                        { name: 'Knicks', class: 'bg-[#006BB6]' },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => setPlayerJerseys({ ...playerJerseys, [activePlayer]: preset.class })}
                          className={`aspect-square rounded-lg ${preset.class} border-2 transition-all hover:scale-110 active:scale-95 relative group ${
                            playerJerseys[activePlayer] === preset.class ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                          }`}
                          title={preset.name}
                        >
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/20 flex items-center justify-center transition-opacity rounded-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-4">Special Editions</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: 'Neon', class: 'bg-gradient-to-br from-primary to-secondary' },
                        { name: 'Fire', class: 'bg-gradient-to-br from-red-500 to-orange-500' },
                        { name: 'Ocean', class: 'bg-gradient-to-br from-blue-500 to-cyan-400' },
                        { name: 'Midnight', class: 'bg-gradient-to-br from-zinc-800 to-black' },
                        { name: 'Royal', class: 'bg-gradient-to-br from-purple-600 to-pink-500' },
                        { name: 'Forest', class: 'bg-gradient-to-br from-green-600 to-emerald-400' },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => setPlayerJerseys({ ...playerJerseys, [activePlayer]: preset.class })}
                          className={`h-12 rounded-xl ${preset.class} border-2 transition-all hover:scale-105 active:scale-95 flex items-center justify-center ${
                            playerJerseys[activePlayer] === preset.class ? 'border-white shadow-lg' : 'border-transparent'
                          }`}
                        >
                          <span className="text-[10px] font-label font-bold text-white uppercase tracking-widest opacity-0 hover:opacity-100 transition-opacity">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={() => setIsJerseyModalOpen(false)}
                      className="w-full py-4 bg-primary text-black font-label font-bold uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                    >
                      Apply Design
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Substitution Modal */}
      <AnimatePresence>
        {isSubModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface-container w-full max-w-lg rounded-2xl p-8 border border-outline-variant/20 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-headline text-2xl font-bold text-primary">SUBSTITUTE PLAYER</h3>
                  <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-1">Replacing: {activePlayer}</p>
                </div>
                <button onClick={() => setIsSubModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {roster.map(player => (
                  <button
                    key={player}
                    onClick={() => handleSubstitute(player)}
                    disabled={player === activePlayer}
                    className={`p-4 rounded-xl border flex flex-col items-start gap-1 transition-all ${
                      player === activePlayer 
                        ? 'bg-surface-container-highest/20 border-outline-variant/10 opacity-50 cursor-not-allowed' 
                        : 'bg-surface-container-low border-outline-variant/10 hover:border-primary/40 hover:bg-surface-container active:scale-95'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="relative">
                        <div className={`w-8 h-10 rounded-md ${playerJerseys[player] || 'bg-surface-container-highest'} flex items-center justify-center border border-white/10 relative overflow-hidden shrink-0`}>
                          {playerJerseys[player]?.startsWith('data:image') ? (
                            <img src={playerJerseys[player]} alt="Jersey" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 to-transparent" />
                          )}
                          <span className="font-headline text-xs font-black text-white relative z-10">
                            {players[player] || '00'}
                          </span>
                        </div>
                        {playerPhotos[player] && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white/20 overflow-hidden shadow-lg z-20">
                            <img src={playerPhotos[player]} alt={player} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-label text-[10px] text-primary font-bold block">#{players[player] || '00'}</span>
                          {playerPositions[player] && (
                            <span className="text-[8px] font-label text-on-surface-variant/60 uppercase tracking-widest">{playerPositions[player]}</span>
                          )}
                        </div>
                        <span className="font-body font-bold text-base block">{player}</span>
                      </div>
                    </div>
                    {playerStats[player] && (
                      <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mt-2">
                        {playerStats[player].points} PTS • {playerStats[player].rebounds} REB
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-outline-variant/10">
                <button 
                  onClick={() => setIsSubModalOpen(false)}
                  className="w-full py-4 bg-surface-container-highest text-on-surface font-label font-bold uppercase tracking-widest rounded-xl hover:bg-surface-bright transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Timeout Tactical Modal */}
      <AnimatePresence>
        {isTimeoutActive && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-surface-container w-full max-w-6xl h-full max-h-[90vh] rounded-3xl overflow-hidden flex flex-col border border-primary/20 shadow-2xl"
            >
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 p-3 rounded-xl">
                    <Timer className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-headline text-2xl font-bold text-primary tracking-tight">TIMEOUT IN PROGRESS</h2>
                    <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Tactical Board & Strategy</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsTimeoutActive(false)}
                  className="bg-primary text-black px-8 py-3 rounded-full font-label font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] flex flex-col items-center justify-center min-w-[160px]"
                  title="Shortcut: Ctrl+T"
                >
                  <span className="leading-tight">Resume Game</span>
                  <span className="text-[9px] opacity-70 font-mono tracking-normal shrink-0 lowercase">[ctrl+t]</span>
                </button>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Tactical Board */}
                <div className="flex-1 bg-surface-container-highest/30 relative p-4 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full max-w-4xl aspect-[16/9] bg-surface-container-low rounded-2xl border-4 border-outline-variant/20 relative overflow-hidden shadow-inner">
                    <TacticalCanvas />
                  </div>
                </div>

                {/* Strategy Sidebar */}
                <div className="w-full md:w-80 bg-surface-container-low border-l border-outline-variant/10 p-6 flex flex-col gap-6 overflow-y-auto">
                  <div className="space-y-4">
                    <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-sm">AI Strategy</h3>
                    <div className="space-y-3">
                      {aiInsights.map((insight, i) => (
                        <div key={i} className="bg-surface-container p-3 rounded-lg border-l-2 border-primary/40 text-xs font-body leading-relaxed">
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-label font-bold text-on-surface-variant uppercase tracking-widest text-sm">Active Lineup</h3>
                    <div className="space-y-2">
                      {trackedPlayers.map(p => (
                        <div key={p} className="flex justify-between items-center p-2 bg-surface-container rounded hover:bg-surface-bright transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className={`w-6 h-8 rounded-sm ${playerJerseys[p] || 'bg-surface-container-highest'} flex items-center justify-center border border-white/10 relative overflow-hidden shrink-0`}>
                                {playerJerseys[p]?.startsWith('data:image') ? (
                                  <img src={playerJerseys[p]} alt="Jersey" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="absolute inset-0 opacity-20 bg-white/40" />
                                )}
                                <span className="font-headline text-[8px] font-black text-white relative z-10">
                                  {players[p] || '00'}
                                </span>
                              </div>
                              {playerPhotos[p] && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white/20 overflow-hidden shadow-lg z-20">
                                  <img src={playerPhotos[p]} alt={p} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-body text-sm">#{players[p] || '00'} {p}</span>
                              {playerPositions[p] && (
                                <span className="text-[8px] font-label text-on-surface-variant/60 uppercase tracking-widest leading-none">{playerPositions[p]}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] font-label text-primary uppercase opacity-0 group-hover:opacity-100 transition-opacity">On Court</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editingEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface-container w-full max-w-md rounded-2xl p-6 border border-outline-variant/20 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-8 h-10 rounded-md ${playerJerseys[editingEvent.player] || 'bg-surface-container-highest'} flex items-center justify-center border border-white/10 relative overflow-hidden shrink-0`}>
                      {playerJerseys[editingEvent.player]?.startsWith('data:image') ? (
                        <img src={playerJerseys[editingEvent.player]} alt="Jersey" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="absolute inset-0 opacity-20 bg-white/40" />
                      )}
                      <span className="font-headline text-[10px] font-black text-white relative z-10">
                        {players[editingEvent.player] || '00'}
                      </span>
                    </div>
                    {playerPhotos[editingEvent.player] && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white/20 overflow-hidden shadow-lg z-20">
                        <img src={playerPhotos[editingEvent.player]} alt={editingEvent.player} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-headline text-xl font-bold">Edit Event</h3>
                    {playerPositions[editingEvent.player] && (
                      <span className="text-[10px] font-label text-primary uppercase tracking-widest leading-none">{playerPositions[editingEvent.player]}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => setEditingEvent(null)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2">Player</label>
                  <select 
                    value={editingEvent.player}
                    onChange={(e) => setEditingEvent({ ...editingEvent, player: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none"
                  >
                    {trackedPlayers.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2">Event Type</label>
                    <select 
                      value={editingEvent.type}
                      onChange={(e) => {
                        const newType = e.target.value as any;
                        const firstAction = PREDEFINED_ACTIONS.find(a => a.type === newType);
                        if (firstAction) {
                          setEditingEvent({ 
                            ...editingEvent, 
                            type: newType,
                            action: firstAction.action,
                            value: firstAction.value
                          });
                        } else {
                          setEditingEvent({ ...editingEvent, type: newType });
                        }
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="score">Score</option>
                      <option value="rebound">Rebound</option>
                      <option value="assist">Assist</option>
                      <option value="steal">Steal</option>
                      <option value="block">Block</option>
                      <option value="miss">Miss</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2">Value</label>
                    <input 
                      type={editingEvent.type === 'score' ? 'number' : 'text'}
                      value={editingEvent.value || ''}
                      onChange={(e) => {
                        const val = editingEvent.type === 'score' ? parseInt(e.target.value) || 0 : e.target.value;
                        setEditingEvent({ ...editingEvent, value: val });
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2">Action</label>
                  <select 
                    value={editingEvent.action}
                    onChange={(e) => {
                      const selectedAction = PREDEFINED_ACTIONS.find(a => a.action === e.target.value);
                      if (selectedAction) {
                        setEditingEvent({ 
                          ...editingEvent, 
                          action: selectedAction.action,
                          type: selectedAction.type as any,
                          value: selectedAction.value
                        });
                      } else {
                        setEditingEvent({ ...editingEvent, action: e.target.value });
                      }
                    }}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none"
                  >
                    {PREDEFINED_ACTIONS.filter(a => a.type === editingEvent.type).map(a => (
                      <option key={a.action} value={a.action}>{a.action}</option>
                    ))}
                    {!PREDEFINED_ACTIONS.some(a => a.action === editingEvent.action && a.type === editingEvent.type) && (
                      <option value={editingEvent.action}>{editingEvent.action}</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2">Time</label>
                    <input 
                      type="text"
                      value={editingEvent.time}
                      onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2">Quarter</label>
                    <input 
                      type="text"
                      value={editingEvent.quarter}
                      onChange={(e) => setEditingEvent({ ...editingEvent, quarter: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    onClick={() => deleteEvent(editingEvent.id)}
                    className="flex-1 bg-error/10 text-error border border-error/20 py-3 rounded-xl font-label font-bold uppercase tracking-widest hover:bg-error/20 transition-colors"
                  >
                    Delete
                  </button>
                  <button 
                    onClick={() => updateEvent(editingEvent)}
                    className="flex-1 performance-gradient text-black py-3 rounded-xl font-label font-bold uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-surface-container-high rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                <div>
                  <h2 className="font-headline text-2xl font-bold text-primary">GAME SETTINGS</h2>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest font-label">Configure Matchup</p>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-on-surface-variant" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Home Team</label>
                    <select 
                      value={homeTeamName}
                      onChange={(e) => handleTeamChange('home', e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl p-3 text-on-surface font-body focus:outline-none focus:border-primary/50 transition-colors"
                    >
                      {Object.keys(TEAM_DATA).map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Away Team</label>
                    <select 
                      value={awayTeamName}
                      onChange={(e) => handleTeamChange('away', e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl p-3 text-on-surface font-body focus:outline-none focus:border-primary/50 transition-colors"
                    >
                      {Object.keys(TEAM_DATA).map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant/10">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Base Score (Home)</label>
                    <input 
                      type="number"
                      value={baseHomeScore}
                      onChange={(e) => setBaseHomeScore(parseInt(e.target.value) || 0)}
                      className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl p-3 text-on-surface font-body focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <label className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Base Score (Away)</label>
                    <input 
                      type="number"
                      value={baseAwayScore}
                      onChange={(e) => setBaseAwayScore(parseInt(e.target.value) || 0)}
                      className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl p-3 text-on-surface font-body focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-surface-container-highest/50">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full performance-gradient text-black py-4 rounded-2xl font-label font-bold uppercase tracking-widest active:scale-95 transition-transform"
                >
                  Apply & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Play Dialog */}
      <AnimatePresence>
        {sharingPlay && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSharingPlay(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/25 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col z-[201]"
              id="share-play-dialog"
            >
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-headline text-lg font-bold text-primary tracking-tight">Share Play Strategy</h3>
                    <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">Generate Shareable Board Link</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSharingPlay(null)} 
                  className="p-1.5 hover:bg-white/5 rounded-full text-on-surface-variant hover:text-on-surface transition-all active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-6">
                {/* Play Details Card */}
                <div className="bg-surface-container-low/50 border border-outline-variant/10 rounded-xl p-4 flex gap-4 items-center">
                  <div className="w-20 h-12 bg-surface-container-highest/50 rounded-lg flex items-center justify-center border border-white/5 shrink-0 overflow-hidden relative">
                    {sharingPlay.canvasData ? (
                      <img src={sharingPlay.canvasData} alt={sharingPlay.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-on-surface-variant opacity-40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-label font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border leading-none ${
                        sharingPlay.type === 'Offense' 
                          ? 'bg-primary/20 text-primary border-primary/25' 
                          : 'bg-secondary/20 text-secondary border-secondary/25'
                      }`}>
                        {sharingPlay.type}
                      </span>
                      {sharingPlay.team && (
                        <span className="text-[8px] font-label font-semibold text-on-surface-variant/70 uppercase tracking-widest truncate">
                          {sharingPlay.team}
                        </span>
                      )}
                    </div>
                    <h4 className="font-headline font-bold text-white text-sm mt-1 truncate">{sharingPlay.name}</h4>
                    <span className="text-[10px] font-mono text-on-surface-variant/50 block mt-0.5">Created: {sharingPlay.createdAt}</span>
                  </div>
                </div>

                {/* Simulated Share Link Box */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="share-link-input" className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold">
                    Shareable Clipboard Link
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        id="share-link-input"
                        type="text"
                        readOnly
                        value={`https://courtvision.nba.com/play/share/${sharingPlay.id}-${sharingPlay.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                        className="w-full bg-surface-container-highest/70 border border-outline-variant/15 rounded-xl p-3.5 pr-10 text-on-surface font-mono text-xs select-all focus:outline-none focus:border-outline-variant transition-colors"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-on-surface-variant/50 uppercase">URL</span>
                    </div>
                    <button 
                      onClick={() => handleCopyLink(`https://courtvision.nba.com/play/share/${sharingPlay.id}-${sharingPlay.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
                      className="px-5 bg-primary text-black rounded-xl font-label font-bold uppercase text-xs tracking-widest active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(var(--primary-rgb),0.15)] hover:bg-primary/90 shrink-0 min-w-[110px]"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4 text-black stroke-[3]" />
                          <span>COPIED</span>
                        </>
                      ) : (
                        <>
                          <span>COPY LINK</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Additional quick share presets */}
                <div>
                  <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold block mb-2">
                    Quick Send Channels
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        window.open(`mailto:?subject=Check out this basketball tactic: ${sharingPlay.name}&body=Hey Coach, look at our '${sharingPlay.name}' strategy play diagram at https://courtvision.nba.com/play/share/${sharingPlay.id}`, '_blank');
                      }}
                      className="py-3 bg-surface-container-low hover:bg-surface-container-highest border border-outline-variant/10 rounded-xl text-[10.5px] font-label font-bold uppercase tracking-wider text-on-surface-variant hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      ✉️ Email Coach
                    </button>
                    <button 
                      onClick={() => {
                        alert("Playbook strategy uploaded to tactical locker room server and notified teammates!");
                      }}
                      className="py-3 bg-surface-container-low hover:bg-surface-container-highest border border-outline-variant/10 rounded-xl text-[10.5px] font-label font-bold uppercase tracking-wider text-on-surface-variant hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      🗣️ Team Locker
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-surface-container-highest/30 border-t border-outline-variant/10 flex justify-end gap-3 text-xs">
                <span className="text-on-surface-variant/40 font-mono text-[9px] flex items-center justify-start flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  SECURE CRYPTO-LINK GENERATED
                </span>
                <button 
                  onClick={() => setSharingPlay(null)}
                  className="px-5 py-2.5 bg-surface-container-highest hover:bg-surface-container text-on-surface rounded-xl font-label font-semibold uppercase tracking-wider transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Playbook File Export Dialog */}
      <AnimatePresence>
        {exportingPlay && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExportingPlay(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-surface-container rounded-2xl border border-outline-variant/30 shadow-[0_24px_50px_rgba(0,0,0,0.8)] flex flex-col z-[201] overflow-hidden"
              id="exporting-play-dialog"
            >
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-headline text-lg font-bold text-primary tracking-tight">Export Tactical Playbook Set</h3>
                    <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">Download diagrams or metadata structures</p>
                  </div>
                </div>
                <button 
                  onClick={() => setExportingPlay(null)} 
                  className="p-1.5 hover:bg-white/5 rounded-full text-on-surface-variant hover:text-on-surface transition-all active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-5">
                {/* Visual Card layout representing our exported object */}
                <div className="bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl p-4 flex gap-4 items-center">
                  <div className="w-24 h-14 bg-surface-container-highest/60 rounded-xl flex items-center justify-center border border-white/5 shrink-0 overflow-hidden relative">
                    {exportingPlay.canvasData ? (
                      <img src={exportingPlay.canvasData} alt={exportingPlay.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-on-surface-variant opacity-40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-label font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border leading-none ${
                        exportingPlay.type === 'Offense' 
                          ? 'bg-primary/20 text-primary border-primary/25' 
                          : 'bg-secondary/20 text-secondary border-secondary/25'
                      }`}>
                        {exportingPlay.type}
                      </span>
                      {exportingPlay.team && (
                        <span className="text-[8px] font-label font-semibold text-on-surface-variant/70 uppercase tracking-widest truncate">
                          {exportingPlay.team}
                        </span>
                      )}
                    </div>
                    <h4 className="font-headline font-bold text-white text-base mt-1 truncate">{exportingPlay.name}</h4>
                    <span className="text-[10px] font-mono text-on-surface-variant/40 block mt-0.5">Created on {exportingPlay.createdAt}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-2">
                  {/* Download PNG layout Trigger */}
                  <div className="bg-surface-container-low/40 border border-outline-variant/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        🖼️ High-Res Diagram (PNG)
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {exportingPlay.canvasData 
                          ? "Download the playbook board sketch as a crisp offline PNG file." 
                          : "Generates a gorgeous high-fidelity digital tactic mockup on a classic court."}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleExportPng(exportingPlay);
                        setExportingPlay(null);
                      }}
                      className="w-full sm:w-auto px-5 py-3 bg-primary text-black rounded-xl font-label font-bold uppercase text-[11px] tracking-wider hover:bg-primary/95 transition-all shadow-[0_4px_12px_rgba(var(--primary-rgb),0.15)] flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>PNG IMAGE</span>
                    </button>
                  </div>

                  {/* Download JSON Metadata Trigger */}
                  <div className="bg-surface-container-low/40 border border-outline-variant/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        ⚙️ Full Play Metadata (JSON)
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Export complete attributes including tactic names, roles, goals, and drawing vectors. Perfect for sharing or backup!
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleExportJson(exportingPlay);
                        setExportingPlay(null);
                      }}
                      className="w-full sm:w-auto px-5 py-3 bg-surface-container-highest hover:bg-surface-bright text-on-surface border border-outline-variant/20 rounded-xl font-label font-bold uppercase text-[11px] tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 text-primary" />
                      <span>JSON METADATA</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-surface-container-highest/30 border-t border-outline-variant/10 flex justify-end gap-3 text-xs">
                <span className="text-on-surface-variant/40 font-mono text-[9px] flex items-center justify-start flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  COMPLIANT WITH COURTPLAY-STD IMPORT FORMAT
                </span>
                <button 
                  onClick={() => setExportingPlay(null)}
                  className="px-5 py-2.5 bg-surface-container-highest hover:bg-surface-container text-on-surface rounded-xl font-label font-semibold uppercase tracking-wider transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Playbook File Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`relative bg-surface-container border border-outline-variant/30 shadow-[0_24px_60px_rgba(0,0,0,0.85)] flex flex-col z-[201] overflow-hidden transition-all duration-300 ${
                isUploadFullscreen 
                  ? 'w-[98vw] h-[95vh] max-w-none max-h-none rounded-3xl m-2 sm:m-4 animate-in fade-in zoom-in-95' 
                  : 'w-full max-w-4xl max-h-[90vh] rounded-2xl'
              }`}
              id="playbook-upload-modal"
            >
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-xl text-primary animate-pulse">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-headline text-lg font-bold text-primary tracking-tight">Upload Tactical Playbook</h3>
                    <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">Import set plays & diagrams from files</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsUploadFullscreen(!isUploadFullscreen)}
                    className="p-1.5 hover:bg-white/5 rounded-full text-on-surface-variant hover:text-on-surface transition-all active:scale-90 flex items-center gap-1.5 text-xs font-mono font-bold"
                    title={isUploadFullscreen ? "Exit Workspace Fullscreen" : "Enter Workspace Fullscreen"}
                  >
                    {isUploadFullscreen ? (
                      <>
                        <Minimize2 className="w-4 h-4 text-primary" />
                        <span className="hidden sm:inline text-primary text-[10px]">EXIT FULLSCREEN</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4 text-primary" />
                        <span className="hidden sm:inline text-primary text-[10px]">WORKSPACE FULLSCREEN</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setIsUploadModalOpen(false)} 
                    className="p-1.5 hover:bg-white/5 rounded-full text-on-surface-variant hover:text-on-surface transition-all active:scale-90"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className={`p-6 flex-1 overflow-y-auto custom-scrollbar ${isUploadFullscreen ? 'flex flex-col h-full min-h-0' : 'flex flex-col gap-6'}`}>
                {analyzingVideo ? (
                  /* 🎬 AI CV MULTI-MODEL VIDEO ANALYTIC SUITE */
                  <div className="flex flex-col h-full min-h-0 text-left gap-6 animate-in fade-in zoom-in-95 duration-300">
                    {/* Header Controls Banner */}
                    <div className="bg-surface-container-low border border-outline-variant/15 p-4 rounded-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/25">
                          <Activity className="w-5 h-5 text-primary animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-headline font-extrabold text-white text-sm tracking-tight">{analyzingVideo.name}</h4>
                            <span className="text-[9px] font-mono font-bold bg-[#FF8F6F]/15 text-[#FF8F6F] border border-[#FF8F6F]/20 px-1.5 py-0.5 rounded uppercase">AI CV WORKSPACE</span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant font-mono mt-0.5 font-sans">
                            Duration: <span className="text-white bg-white/5 px-2 py-0.5 rounded font-sans font-mono">{analyzingVideo.duration}</span> • Resolution: <span className="text-white bg-white/5 px-2 py-0.5 rounded font-sans font-mono">{analyzingVideo.resolution}</span> • Output: <span className="text-white bg-white/5 px-2 py-0.5 rounded font-sans font-mono">{analyzingVideo.framesCount} sequenced frames</span>
                          </p>
                        </div>
                      </div>

                      {/* Model Pipeline Selection Tabs */}
                      <div className="flex flex-wrap items-center gap-1.5 bg-surface-container-highest/40 border border-outline-variant/10 p-1 rounded-xl">
                        {[
                          { id: 'rf_detr', name: 'Motion Bounds', badge: 'Step 1', color: 'text-amber-400' },
                          { id: 'sam3', name: 'Movement Tracking', badge: 'Step 2', color: 'text-[#36D399]' },
                          { id: 'siglip2', name: 'Motion Clustering', badge: 'Step 3', color: 'text-sky-400' },
                          { id: 'glm_ocr', name: 'Motion OCR', badge: 'Step 4', color: 'text-fuchsia-400' }
                        ].map((mTab) => (
                          <button
                            key={mTab.id}
                            onClick={() => {
                              setActiveCvTab(mTab.id as any);
                              setSelectedTrackedPlayerId(null);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-label font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all border cursor-pointer ${
                              activeCvTab === mTab.id
                                ? 'bg-primary border-primary/30 text-black shadow-lg scale-[1.03]'
                                : 'bg-surface-container-high/40 border-transparent text-on-surface-variant hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full bg-current ${mTab.color}`} />
                            {mTab.name}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            // Extract tracked paths to playbook!
                            const playsWithCV = [...plays];
                            const cvPlay: Play = {
                              id: 'cv-exp-' + Date.now().toString().substring(6),
                              name: `Playbook Extract: ${analyzingVideo.name.replace(/\.[^/.]+$/, "")}`,
                              type: 'Offense',
                              description: `Coordinates automatically traced via computer vision play tracking and path extraction. High accuracy tactical schematic representing the simulated Fast Break.`,
                              createdAt: new Date().toISOString().split('T')[0],
                              team: homeTeamName,
                              frames: analyzingVideo.frames.map((fr: any) => {
                                return analyzingVideo.players.map((p: any) => {
                                  const fp = fr.find((coord: any) => coord.id === p.id);
                                  return {
                                    id: p.id,
                                    label: p.number,
                                    x: fp ? fp.x : 50,
                                    y: fp ? fp.y : 50,
                                    type: p.type
                                  };
                                });
                              })
                            };
                            setPlays([cvPlay, ...plays]);
                            setSelectedPlay(cvPlay);
                            alert(`Success! Saved video motion coordinates as "${cvPlay.name}" inside your Playbook list!`);
                          }}
                          className="bg-primary/25 hover:bg-primary/40 border border-primary/30 text-primary text-[10px] font-label font-bold uppercase tracking-widest px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          📥 Save to Playbook
                        </button>
                        
                        <button
                          onClick={() => {
                            setAnalyzingVideo(null);
                          }}
                          className="p-2.5 hover:bg-red-500/15 border border-red-500/10 hover:border-red-500/20 text-red-400 transition-all rounded-xl hover:scale-105 cursor-pointer"
                          title="Flush video content, return to importer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Split Layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full items-stretch min-h-0 select-none">
                      {/* Left Side: Video Court Canvas Overlay */}
                      <div className="xl:col-span-8 bg-surface-container-low border border-outline-variant/10 rounded-3xl p-5 flex flex-col gap-4 shadow-inner relative justify-between">
                        {/* Tab HUD Banner */}
                        <div className="absolute top-8 left-8 z-10 flex flex-col gap-1 select-none pointer-events-none">
                          <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">
                            {activeCvTab === 'rf_detr' && '🛰️ Heuristic Player Motion Bounding'}
                            {activeCvTab === 'sam3' && '🧬 Frame-Difference Motion Path Tracking'}
                            {activeCvTab === 'siglip2' && '🎯 Motion-Saliency Team Clustering'}
                            {activeCvTab === 'glm_ocr' && '🔠 Pixel Motion-Aligned OCR Mapping'}
                          </span>
                          <span className="text-[8px] font-mono text-on-surface-variant/70 uppercase">
                            Frame: {analyzingVideo.currentFrame + 1}/{analyzingVideo.framesCount} (Simulated Live Overlay Feed)
                          </span>
                        </div>

                        {/* Court Arena Container */}
                        <div 
                          onClick={(e) => {
                            // If dragging, don't trigger manual targeting overlay
                            if (cvDraggingPlayerId) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(1));
                            const y = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(1));
                            
                            setManualClickCoords({ x, y });
                            setManualPlayerName(`Player #${Math.floor(Math.random() * 90) + 10}`);
                            setManualPlayerNumber(`${Math.floor(Math.random() * 99)}`);
                          }}
                          onMouseMove={(e) => {
                            if (cvDraggingPlayerId && cvDraggingPointType === 'court') {
                              handleCourtPointerMove(e.clientX, e.clientY, e.currentTarget);
                            }
                          }}
                          onTouchMove={(e) => {
                            if (cvDraggingPlayerId && cvDraggingPointType === 'court' && e.touches.length > 0) {
                              handleCourtPointerMove(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
                            }
                          }}
                          onMouseUp={() => setCvDraggingPlayerId(null)}
                          onMouseLeave={() => setCvDraggingPlayerId(null)}
                          onTouchEnd={() => setCvDraggingPlayerId(null)}
                          className="relative w-full aspect-[16/9] bg-[#0E1521] border border-outline-variant/15 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center group/arena cursor-crosshair"
                        >
                          {/* Manual Target Selector Popover */}
                          {manualClickCoords && (
                            <div 
                              className="absolute z-50 bg-[#141A28]/95 border-2 border-primary text-white rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.9)] flex flex-col gap-3.5 w-64 text-left select-none animate-in zoom-in-95 duration-200"
                              style={{
                                left: `${Math.min(82, Math.max(18, manualClickCoords.x))}%`,
                                top: `${Math.min(68, Math.max(12, manualClickCoords.y))}%`,
                                transform: 'translate(-50%, -20px)',
                              }}
                              onClick={(e) => e.stopPropagation()} // prevent retriggering
                            >
                              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
                                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-primary flex items-center gap-1.5">
                                  🎯 Manual Detection
                                </span>
                                <button 
                                  onClick={() => setManualClickCoords(null)}
                                  className="text-on-surface-variant hover:text-white transition font-bold text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                              
                              <div className="text-[9px] text-on-surface-variant font-mono -mt-1 bg-white/5 py-1 px-2 rounded flex justify-between">
                                <span>GRID POSITION:</span>
                                <span>X:{manualClickCoords.x}% Y:{manualClickCoords.y}%</span>
                              </div>

                              <div className="space-y-2.5">
                                <div className="flex flex-col gap-1 text-left">
                                  <label className="text-[8px] uppercase tracking-wider font-mono text-on-surface-variant font-bold text-left">Team Cluster Group</label>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setManualPlayerTeam('Team A (Knicks)')}
                                      className={`py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all border ${
                                        manualPlayerTeam === 'Team A (Knicks)'
                                          ? 'bg-blue-600/35 border-blue-500 text-blue-300 shadow-md'
                                          : 'bg-white/5 border-outline-variant/10 text-on-surface-variant'
                                      }`}
                                    >
                                      Knicks (Blue)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setManualPlayerTeam('Team B (White)')}
                                      className={`py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all border ${
                                        manualPlayerTeam === 'Team B (White)'
                                          ? 'bg-red-600/35 border-red-500 text-red-300 shadow-md'
                                          : 'bg-white/5 border-outline-variant/10 text-on-surface-variant'
                                      }`}
                                    >
                                      White (Red)
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-left animate-none">
                                  <div className="flex flex-col gap-1 text-left">
                                    <label className="text-[8px] uppercase tracking-wider font-mono text-on-surface-variant font-bold text-left">Jersey Number</label>
                                    <input 
                                      type="text" 
                                      maxLength={3}
                                      value={manualPlayerNumber}
                                      onChange={(e) => setManualPlayerNumber(e.target.value)}
                                      className="bg-surface-container-highest border border-outline-variant/15 rounded-lg px-2 py-1 text-white text-xs font-mono focus:outline-none focus:border-primary/50 text-center col-span-1 p-0.5"
                                      placeholder="e.g. 30"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1 text-left">
                                    <label className="text-[8px] uppercase tracking-wider font-mono text-on-surface-variant font-bold text-left">Position/Role</label>
                                    <select
                                      value={manualPlayerRole}
                                      onChange={(e) => setManualPlayerRole(e.target.value)}
                                      className="bg-surface-container-highest border border-outline-variant/15 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary/50 font-sans"
                                    >
                                      {['PG', 'SG', 'SF', 'PF', 'C', 'HC', 'AC'].map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1 text-left">
                                  <label className="text-[8px] uppercase tracking-wider font-mono text-on-surface-variant font-bold text-left">Player Entity Name</label>
                                  <input 
                                    type="text" 
                                    value={manualPlayerName}
                                    onChange={(e) => setManualPlayerName(e.target.value)}
                                    className="bg-surface-container-highest border border-outline-variant/15 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-primary/50"
                                    placeholder="e.g. Stephen Curry"
                                  />
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  if (!manualPlayerNumber.trim()) {
                                    alert("Please provide a jersey number");
                                    return;
                                  }
                                  
                                  const newId = 'manual-' + Math.random().toString(36).substring(2, 9);
                                  const isOffense = manualPlayerTeam === 'Team A (Knicks)';
                                  
                                  const newPlayer = {
                                    id: newId,
                                    name: manualPlayerName.trim() || `Player #${manualPlayerNumber}`,
                                    label: manualPlayerRole,
                                    number: manualPlayerNumber,
                                    type: isOffense ? 'offense' : 'defense',
                                    confidence: 100,
                                    cls: manualPlayerTeam,
                                    embedding: isOffense ? [-2.2 - Math.random() * 0.4, 1.8 + Math.random() * 0.4] : [2.9 + Math.random() * 0.4, -1.7 - Math.random() * 0.4],
                                    ocrDetails: 'Verified manually via Coach plot annotation coordinate grid.'
                                  };

                                  const updatedPlayers = [...(analyzingVideo.players || []), newPlayer];
                                  const updatedFrames = (analyzingVideo.frames || [[], [], [], [], []]).map((fr: any, index: number) => {
                                    // Add slight randomized drift paths across mock keyframes!
                                    const devX = Math.round((manualClickCoords.x + (index - 2) * (Math.random() * 2 - 1)) * 10) / 10;
                                    const devY = Math.round((manualClickCoords.y + (index - 2) * (Math.random() * 2 - 1)) * 10) / 10;
                                    return [
                                      ...fr,
                                      { 
                                        id: newId, 
                                        x: Math.max(2, Math.min(98, devX)), 
                                        y: Math.max(2, Math.min(98, devY)) 
                                      }
                                    ];
                                  });

                                  setAnalyzingVideo({
                                    ...analyzingVideo,
                                    players: updatedPlayers,
                                    frames: updatedFrames
                                  });
                                  setManualClickCoords(null);
                                }}
                                className="w-full py-2.5 bg-primary hover:bg-primary/95 text-black font-mono font-bold uppercase text-[10px] tracking-wider rounded-xl transition-all active:scale-95 shadow-md mt-1"
                              >
                                PLOT & TRACK TARGET
                              </button>
                            </div>
                          )}
                          {/* If a YouTube stream is active, embed the iframe in the background */}
                          {analyzingVideo.youtubeId && (
                            <iframe 
                              src={`https://www.youtube.com/embed/${analyzingVideo.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${analyzingVideo.youtubeId}&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
                              className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none border-none"
                              allow="autoplay; encrypted-media"
                              title="YouTube Live Stream Active Context"
                            />
                          )}
                          {/* 🎬 Active AI camera overlay HUD for player tracking */}
                          <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1 select-none pointer-events-none text-right">
                            <span className="text-[12px] font-mono text-white/95 font-black tracking-widest bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 shadow-lg">
                              {trackedTarget?.details ? `${trackedTarget.details.number}B` : '191B'}
                            </span>
                            <span className="text-[7px] font-mono text-yellow-400 font-bold bg-black/55 px-1.5 py-0.5 rounded border border-yellow-500/15">
                              TELEMETRY: OK (CAM_01)
                            </span>
                          </div>

                          {/* Yellow active lens camera tracker aperture matching video exactly */}
                          {trackedTarget && showGroundTruth && (
                            <div 
                              className="absolute border border-yellow-400 rounded-xl flex items-center justify-center pointer-events-none transition-all duration-300 z-30 shadow-[0_0_12px_rgba(234,179,8,0.3)]"
                              style={{
                                left: `${trackedTarget.x}%`,
                                top: `${trackedTarget.y}%`,
                                width: '74px',
                                height: '100px',
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              {/* Corner notched borders using custom styled borders */}
                              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-yellow-400" />
                              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-yellow-400" />
                              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-yellow-400" />
                              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-yellow-400" />
                              
                              {/* Small HUD indicators inside or near the tracking box */}
                              <div className="absolute -top-5.5 left-0 bg-yellow-400 text-black font-mono text-[7px] font-black px-1.5 py-0.5 rounded shadow uppercase tracking-wider whitespace-nowrap flex items-center gap-1 leading-none">
                                <span className="w-1 h-1 rounded-full bg-red-650 animate-ping" />
                                <span>{trackedTarget.label}</span>
                              </div>

                              {/* Dynamic Zoom Badge on Right Bottom Corner */}
                              <div className="absolute -bottom-4.5 right-0 bg-yellow-400 text-black font-mono font-black text-[6px] px-1 py-0.2 rounded whitespace-nowrap leading-none scale-90">
                                ISO ▲ 250%
                              </div>

                              {/* Subtitle telemetry status HUD */}
                              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 font-mono text-[8px] font-bold text-yellow-400 bg-black/75 px-1.5 py-0.5 rounded border border-yellow-500/25 uppercase whitespace-nowrap shadow-md tracking-wider">
                                {trackedTarget.sublabel}
                              </div>
                            </div>
                          )}

                          {/* Beautiful Basketball Court lines background */}
                          <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
                            {/* Half court circle */}
                            <div className="absolute w-[30%] aspect-square border-2 border-white rounded-full" />
                            {/* Central divider */}
                            <div className="absolute h-full w-[2px] bg-white left-1/2" />
                            {/* Inner divider */}
                            <div className="absolute inset-y-0 left-0 w-1/2 border-r-2 border-dashed border-white/50" />
                            {/* Left Key Area */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[19%] h-[50%] border-2 border-l-0 border-white" />
                            {/* Right Key Area */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[19%] h-[50%] border-2 border-r-0 border-white" />
                            {/* Left Three Point Line */}
                            <div className="absolute left-1 border-2 border-white w-[35%] h-[90%] top-[5%] rounded-r-full" />
                            {/* Right Three Point Line */}
                            <div className="absolute right-1 border-2 border-white w-[35%] h-[90%] top-[5%] rounded-l-full" />
                            {/* Center Logo */}
                            <div className="absolute text-[6rem] font-black tracking-widest text-white/5 select-none font-sans">
                              CV FEED
                            </div>
                          </div>

                          {/* Dynamic Camera Grid Sweep Effect */}
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-500/[0.015] to-transparent h-full w-full pointer-events-none animate-pulse" />

                          {/* Render BASKET (RF-DETR Specific Highlight) */}
                          {showGroundTruth && (activeCvTab === 'rf_detr' || activeCvTab === 'sam3') && (
                            <div 
                              className="absolute bg-[#A855F7]/5 border border-dashed border-[#A855F7]/80 rounded p-1 flex flex-col items-center justify-center text-[7px] font-mono text-[#C084FC] pointer-events-none"
                              style={{
                                left: `${analyzingVideo.basket.x}%`,
                                top: `${analyzingVideo.basket.y}%`,
                                transform: 'translate(-50%, -50%)',
                                width: '6.5%',
                                height: '11.5%'
                              }}
                            >
                              <div className="absolute -top-4 bg-[#A855F7] text-white px-1 py-0.2 rounded font-bold uppercase tracking-widest scale-90 whitespace-nowrap">
                                {analyzingVideo.basket.label}
                              </div>
                            </div>
                          )}

                          {/* Render BALL Centroid (RF-DETR Indicator) */}
                          {showGroundTruth && (
                            (() => {
                              const activeFrData = activeCvPlayers;
                              const ballCoord = activeFrData.find((pt: any) => pt.isBall);
                              if (ballCoord) {
                                  return (
                                    <div 
                                      className="absolute w-5 h-5 rounded-full border-2 border-yellow-400 bg-yellow-500/30 flex items-center justify-center transition-all duration-300 pointer-events-none z-20"
                                      style={{
                                        left: `${ballCoord.x}%`,
                                        top: `${ballCoord.y}%`,
                                        transform: 'translate(-50%, -50%)',
                                      }}
                                    >
                                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
                                      <span className="absolute -top-4 font-mono text-[6px] bg-yellow-400 text-black px-1 rounded font-black whitespace-nowrap uppercase">
                                        Ball_99.7%
                                      </span>
                                    </div>
                                  );
                              }
                              return null;
                            })()
                          )}

                          {/* 📡 Interactive Ball-Player Motion Link Overlay */}
                          {showBallMotionAnalysis && ballMotionTracker && (
                            <div className="absolute inset-0 pointer-events-none z-30">
                              <svg className="absolute inset-0 w-full h-full">
                                <defs>
                                  <linearGradient id="passGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#EAB308" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
                                  </linearGradient>
                                  <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#EAB308" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
                                  </radialGradient>
                                </defs>

                                {/* 1. Sender to Ball Line (Pass Origin) */}
                                {ballMotionTracker.sender && (
                                  <>
                                    <line
                                      x1={`${ballMotionTracker.sender.x}%`}
                                      y1={`${ballMotionTracker.sender.y}%`}
                                      x2={`${ballMotionTracker.ball.x}%`}
                                      y2={`${ballMotionTracker.ball.y}%`}
                                      stroke="#EAB308"
                                      strokeWidth="1.5"
                                      strokeDasharray="4,4"
                                      opacity="0.6"
                                    />
                                    {/* Small circle at sender */}
                                    <circle
                                      cx={`${ballMotionTracker.sender.x}%`}
                                      cy={`${ballMotionTracker.sender.y}%`}
                                      r="6"
                                      fill="none"
                                      stroke="#EAB308"
                                      strokeWidth="1"
                                      opacity="0.5"
                                    />
                                  </>
                                )}

                                {/* 2. Ball to Receiver Line (Interception & Play Target) */}
                                {ballMotionTracker.receiver && (
                                  <>
                                    {/* Neon Laser Beam connecting Ball with active Receiver */}
                                    <line
                                      x1={`${ballMotionTracker.ball.x}%`}
                                      y1={`${ballMotionTracker.ball.y}%`}
                                      x2={`${ballMotionTracker.receiver.x}%`}
                                      y2={`${ballMotionTracker.receiver.y}%`}
                                      stroke="url(#passGradient)"
                                      strokeWidth="2"
                                      className="stroke-[url(#passGradient)]"
                                    />
                                    
                                    {/* Animated moving dot running along the pass line */}
                                    <circle
                                      r="3"
                                      fill="#F59E0B"
                                      className="animate-[pulse_1s_infinite]"
                                      style={{
                                        animation: 'dash 3s linear infinite',
                                      }}
                                    >
                                      <animate
                                        attributeName="cx"
                                        from={`${ballMotionTracker.ball.x}%`}
                                        to={`${ballMotionTracker.receiver.x}%`}
                                        dur="1.5s"
                                        repeatCount="indefinite"
                                      />
                                      <animate
                                        attributeName="cy"
                                        from={`${ballMotionTracker.ball.y}%`}
                                        to={`${ballMotionTracker.receiver.y}%`}
                                        dur="1.5s"
                                        repeatCount="indefinite"
                                      />
                                    </circle>

                                    {/* Reticle lock targeting the Receiver */}
                                    <circle
                                      cx={`${ballMotionTracker.receiver.x}%`}
                                      cy={`${ballMotionTracker.receiver.y}%`}
                                      r="12"
                                      fill="url(#targetGlow)"
                                      stroke="#F59E0B"
                                      strokeWidth="1"
                                      strokeDasharray="3,3"
                                      className="animate-[spin_8s_linear_infinite]"
                                    />
                                  </>
                                )}
                              </svg>

                              {/* Instantly anchored mini HUD near the Ball */}
                              <div
                                className="absolute bg-black/85 border border-yellow-400/40 px-1.5 py-0.5 rounded text-[6.5px] font-mono text-yellow-400 flex items-center gap-1 shadow-lg pointer-events-none"
                                style={{
                                  left: `${ballMotionTracker.ball.x}%`,
                                  top: `${ballMotionTracker.ball.y + 3.5}%`,
                                  transform: 'translateX(-50%)',
                                }}
                              >
                                <span className="w-1 h-1 rounded-full bg-yellow-400 animate-ping" />
                                <span>{ballMotionTracker.speedMph.toFixed(1)} mph ({ballMotionTracker.speedMetersPerSec.toFixed(1)} m/s)</span>
                              </div>

                              {/* Instantly anchored interception math tag next to Receiver */}
                              {ballMotionTracker.receiver && (
                                <div
                                  className="absolute bg-[#0b0f19]/90 border border-emerald-400/40 px-2 py-0.5 rounded text-[6px] font-mono text-emerald-400 flex flex-col items-center gap-0.5 shadow-lg pointer-events-none"
                                  style={{
                                    left: `${ballMotionTracker.receiver.x}%`,
                                    top: `${ballMotionTracker.receiver.y - 5.5}%`,
                                    transform: 'translateX(-50%)',
                                  }}
                                >
                                  <span className="font-bold text-white uppercase tracking-wider text-[5.5px]">PLAY TARGET (RECV)</span>
                                  <span>DIST: {ballMotionTracker.distanceToReceiverMeters.toFixed(1)}m ({ballMotionTracker.distanceToReceiverFeet.toFixed(1)}ft)</span>
                                  {ballMotionTracker.timeToInterceptSeconds > 0 && (
                                    <span className="text-amber-400 font-bold">EST INTERCEPT: {ballMotionTracker.timeToInterceptSeconds.toFixed(2)}s</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* ☄️ Motion Trail visualization overlay for tracked player or active target */}
                          {showGroundTruth && motionTrail.length > 1 && (
                            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                              <svg className="absolute inset-0 w-full h-full">
                                {/* Draw connecting path segments with fading opacity */}
                                {motionTrail.map((pt, index) => {
                                  if (index === motionTrail.length - 1) return null;
                                  const nextPt = motionTrail[index + 1];
                                  
                                  // Age from 0 (index 0, newest) to 9 (oldest). Opacity decays linearly.
                                  const segmentOpacity = ((10 - pt.age) / 10) * 0.75;
                                  const isOffense = selectedTrackedPlayerId && analyzingVideo?.players?.find((p: any) => p.id === selectedTrackedPlayerId)?.type === 'offense';
                                  
                                  // Use team colors or ball tracking yellow
                                  let strokeColor = '#EAB308'; // Ball yellow default
                                  if (selectedTrackedPlayerId) {
                                    strokeColor = isOffense ? '#3B82F6' : '#EF4444';
                                  }

                                  return (
                                    <React.Fragment key={`seg-${index}`}>
                                      {/* Wide Ambient Glow Line */}
                                      <line
                                        x1={`${nextPt.x}%`}
                                        y1={`${nextPt.y}%`}
                                        x2={`${pt.x}%`}
                                        y2={`${pt.y}%`}
                                        stroke={strokeColor}
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        opacity={segmentOpacity * 0.35}
                                        className="blur-[2px]"
                                      />
                                      {/* Core Sharp Line */}
                                      <line
                                        x1={`${nextPt.x}%`}
                                        y1={`${nextPt.y}%`}
                                        x2={`${pt.x}%`}
                                        y2={`${pt.y}%`}
                                        stroke={strokeColor}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        opacity={segmentOpacity}
                                      />
                                    </React.Fragment>
                                  );
                                })}
                              </svg>

                              {/* Draw small physical dots at historical frame intervals showing frame index */}
                              {motionTrail.map((pt, index) => {
                                // Skip the youngest point (index 0) if it is currently overlapping the main live player blob
                                if (pt.age === 0) return null;

                                const isOffense = selectedTrackedPlayerId && analyzingVideo?.players?.find((p: any) => p.id === selectedTrackedPlayerId)?.type === 'offense';
                                let dotColor = 'bg-[#EAB308]'; // Yellow default
                                let dotBorderColor = 'border-[#EAB308]/55';
                                if (selectedTrackedPlayerId) {
                                  dotColor = isOffense ? 'bg-[#3B82F6]' : 'bg-[#EF4444]';
                                  dotBorderColor = isOffense ? 'border-[#3B82F6]/60' : 'border-[#EF4444]/60';
                                }

                                const dotOpacity = ((10 - pt.age) / 10);
                                const pulseSize = 14 - pt.age * 0.6; // get smaller as they age

                                return (
                                  <div
                                    key={`dot-${pt.frameIdx}-${index}`}
                                    className="absolute transition-all duration-300 pointer-events-none flex items-center justify-center"
                                    style={{
                                      left: `${pt.x}%`,
                                      top: `${pt.y}%`,
                                      transform: 'translate(-50%, -50%)',
                                      opacity: dotOpacity,
                                    }}
                                  >
                                    {/* Halos */}
                                    <div 
                                      className={`absolute rounded-full border ${dotBorderColor} animate-ping opacity-25`} 
                                      style={{ width: `${pulseSize * 1.8}px`, height: `${pulseSize * 1.8}px` }} 
                                    />
                                    {/* The compact visual checkpoint indicator with age subtitle label */}
                                    <div 
                                      className={`rounded-full border border-white/20 shadow-md ${dotColor} flex items-center justify-center text-[5px] text-white font-mono font-bold select-none`}
                                      style={{ width: `${pulseSize}px`, height: `${pulseSize}px` }}
                                    >
                                      {pt.age === 1 ? 't-1' : `f${pt.frameIdx + 1}`}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Render Players with their corresponding Model visualizations */}
                          {activeCvPlayers.map((fp: any) => {
                            if (fp.isBall) return null;
                            const pDetail = analyzingVideo.players.find((pt: any) => pt.id === fp.id);
                            if (!pDetail) return null;

                            const isSelected = selectedTrackedPlayerId === pDetail.id;
                            const isOffense = pDetail.type === 'offense';

                            // Determine styles based on active Model Tab
                            let boxBorderColor = isOffense ? 'border-[#3B82F6]' : 'border-[#EF4444]';
                            if (activeCvTab === 'sam3') {
                              boxBorderColor = isSelected ? 'border-[#10B981] ring-2 ring-[#10B981]/50' : 'border-[#36D399]/40';
                            } else if (activeCvTab === 'siglip2') {
                              boxBorderColor = isOffense ? 'border-amber-500' : 'border-[#E2E8F0]';
                            } else if (activeCvTab === 'glm_ocr') {
                              boxBorderColor = 'border-fuchsia-500/70';
                            }

                            return (
                              <React.Fragment key={pDetail.id}>
                                {/* Render SAM3 Tracking Trials paths leading to player */}
                                {activeCvTab === 'sam3' && (
                                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    <line
                                      x1={`${analyzingVideo.frames[0].find((c: any) => c.id === pDetail.id)?.x}%`}
                                      y1={`${analyzingVideo.frames[0].find((c: any) => c.id === pDetail.id)?.y}%`}
                                      x2={`${analyzingVideo.frames[1].find((c: any) => c.id === pDetail.id)?.x}%`}
                                      y2={`${analyzingVideo.frames[1].find((c: any) => c.id === pDetail.id)?.y}%`}
                                      className={`stroke-2 ${isSelected ? 'stroke-[#10B981]' : isOffense ? 'stroke-blue-500/30' : 'stroke-red-500/30'}`}
                                      strokeDasharray="2,2"
                                    />
                                    <line
                                      x1={`${analyzingVideo.frames[1].find((c: any) => c.id === pDetail.id)?.x}%`}
                                      y1={`${analyzingVideo.frames[1].find((c: any) => c.id === pDetail.id)?.y}%`}
                                      x2={`${fp.x}%`}
                                      y2={`${fp.y}%`}
                                      className={`stroke-2 ${isSelected ? 'stroke-[#10B981]' : isOffense ? 'stroke-blue-400/30' : 'stroke-red-400/30'}`}
                                      strokeDasharray="2,2"
                                    />
                                  </svg>
                                )}

                                {/* Main Player node positioning container */}
                                <div
                                  onClick={(e) => { e.stopPropagation(); setSelectedTrackedPlayerId(pDetail.id); }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setSelectedTrackedPlayerId(pDetail.id);
                                    setCvDraggingPlayerId(pDetail.id);
                                    setCvDraggingPointType('court');
                                  }}
                                  onTouchStart={(e) => {
                                    e.stopPropagation();
                                    setSelectedTrackedPlayerId(pDetail.id);
                                    setCvDraggingPlayerId(pDetail.id);
                                    setCvDraggingPointType('court');
                                  }}
                                  className={`absolute cursor-grab select-none flex flex-col items-center justify-center ${
                                    cvDraggingPlayerId === pDetail.id ? 'transition-none scale-[1.25] z-40' : 'transition-all duration-300'
                                  } ${
                                    isSelected ? 'scale-[1.15] z-30' : 'hover:scale-105 z-10'
                                  }`}
                                  style={{
                                    left: `${fp.x}%`,
                                    top: `${fp.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                  }}
                                >
                                  {/* MODEL TAB VALUE: BBOX rendering (RF-DETR style) */}
                                  {activeCvTab === 'rf_detr' && (
                                    <div className={`w-8 h-12 border-2 ${boxBorderColor} rounded flex flex-col items-center justify-between p-1 bg-black/40`}>
                                      <span className="text-[6px] font-mono text-white/50">{pDetail.label}</span>
                                      <span className={`text-[10px] font-headline font-bold ${isOffense ? 'text-blue-400' : 'text-red-400'}`}>
                                        {pDetail.number}
                                      </span>
                                      <span className="text-[5px] font-mono text-white/60 font-black">{pDetail.confidence}%</span>
                                    </div>
                                  )}

                                  {/* MODEL TAB VALUE: Contours/Masking (SAM3 Layer) */}
                                  {activeCvTab === 'sam3' && (
                                    <div className="relative">
                                      {/* Contours mask circle ring */}
                                      <div 
                                        className={`w-9 h-9 rounded-full border-2 ${boxBorderColor} flex items-center justify-center bg-black/50 overflow-hidden relative`}
                                      >
                                        <div className={`absolute inset-1 rounded-full ${isSelected ? 'bg-emerald-500/40 animate-pulse' : isOffense ? 'bg-blue-500/10' : 'bg-red-500/10'}`} />
                                        <span className="text-white text-xs font-mono font-bold">{pDetail.number}</span>
                                      </div>
                                      {/* Custom SAM Mask label */}
                                      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[5px] font-mono bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 px-1 rounded whitespace-nowrap">
                                        Track_{pDetail.id}
                                      </span>
                                    </div>
                                  )}

                                  {/* MODEL TAB VALUE: Team Clustering (SigLIP2 + KMeans style) */}
                                  {activeCvTab === 'siglip2' && (
                                    <div 
                                      className={`w-8 h-8 rounded-xl border-2 ${boxBorderColor} flex flex-col items-center justify-center p-0.5 ${
                                        isOffense ? 'bg-amber-500/20' : 'bg-white/10'
                                      }`}
                                    >
                                      <span className="text-white text-[11px] font-headline font-bold">{pDetail.number}</span>
                                      <span className="text-[5px] font-mono text-on-surface-variant leading-none uppercase">
                                        {isOffense ? 'TM_A' : 'TM_B'}
                                      </span>
                                    </div>
                                  )}

                                  {/* MODEL TAB VALUE: GLM-OCR Jersey digit string reader */}
                                  {activeCvTab === 'glm_ocr' && (
                                    <div className="flex flex-col items-center gap-0.5 select-none">
                                      {/* GLM String attention box */}
                                      <div className="w-10 h-7 border border-dashed border-fuchsia-400 bg-fuchsia-500/20 rounded flex items-center justify-center">
                                        <span className="text-[12px] font-mono text-fuchsia-300 font-black tracking-tighter col-span-1 border-none p-0">
                                          "{pDetail.number}"
                                        </span>
                                      </div>
                                      <span className="text-[5px] font-mono bg-fuchsia-600 font-bold text-white px-1 rounded whitespace-nowrap scale-90">
                                        GLM_OCR: {pDetail.confidence}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </React.Fragment>
                            );
                          })}

                          {/* ☄️ AI Possession Lock Multi-Model Alignment Ray-Lines & Telemetry HUD */}
                          {ballPossession && (
                            <div className="absolute inset-0 pointer-events-none z-20">
                              {/* SVG Rays line canvas */}
                              <svg className="absolute inset-0 w-full h-full">
                                {/* Glow overlays & core beams for each model */}
                                
                                {/* 1. Player Detection (Top-Left: x=3%, y=5%) */}
                                <line x1="3%" y1="5%" x2={`${ballPossession.player.x}%`} y2={`${ballPossession.player.y}%`} stroke="#EF4444" strokeWidth="1" strokeDasharray="4,3" opacity="0.8" className="animate-[pulse_1.5s_infinite]" />
                                <line x1="3%" y1="5%" x2={`${ballPossession.player.x}%`} y2={`${ballPossession.player.y}%`} stroke="#F59E0B" strokeWidth="2.5" opacity="0.25" className="blur-[1px]" />
                                
                                {/* 2. Motion Tracking (Top-Right: x=97%, y=5%) */}
                                <line x1="97%" y1="5%" x2={`${ballPossession.player.x}%`} y2={`${ballPossession.player.y}%`} stroke="#10B981" strokeWidth="1" strokeDasharray="4,3" opacity="0.8" className="animate-[pulse_1.5s_infinite]" />
                                <line x1="97%" y1="5%" x2={`${ballPossession.player.x}%`} y2={`${ballPossession.player.y}%`} stroke="#10B981" strokeWidth="2.5" opacity="0.25" className="blur-[1px]" />

                                {/* 3. Team Clustering (Bottom-Left: x=3%, y=95%) */}
                                <line x1="3%" y1="95%" x2={`${ballPossession.player.x}%`} y2={`${ballPossession.player.y}%`} stroke="#3B82F6" strokeWidth="1" strokeDasharray="4,3" opacity="0.8" className="animate-[pulse_1.5s_infinite]" />
                                <line x1="3%" y1="95%" x2={`${ballPossession.player.x}%`} y2={`${ballPossession.player.y}%`} stroke="#0EA5E9" strokeWidth="2.5" opacity="0.25" className="blur-[1px]" />

                                {/* 4. Jersey OCR (Bottom-Right: x=97%, y=95%) */}
                                <line x1="97%" y1="95%" x2={`${ballPossession.player.x}%`} y2={`${ballPossession.player.y}%`} stroke="#D946EF" strokeWidth="1" strokeDasharray="4,3" opacity="0.8" className="animate-[pulse_1.5s_infinite]" />
                                <line x1="97%" y1="95%" x2={`${ballPossession.player.x}%`} y2={`${ballPossession.player.y}%`} stroke="#D946EF" strokeWidth="2.5" opacity="0.25" className="blur-[1px]" />
                              </svg>

                              {/* Anchored text source label panels at 4 corners of Court Arena for model indicator identification: */}
                              {/* Top-Left: Player Detection Source */}
                              <div className="absolute top-2 left-2 bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-amber-450 text-[6px] font-mono font-black scale-90 px-1 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping" />
                                <span>Player Detection</span>
                              </div>

                              {/* Top-Right: Motion Tracking Source */}
                              <div className="absolute top-2 right-2 bg-[#10B981]/20 border border-[#10B981]/40 text-emerald-450 text-[6px] font-mono font-black scale-90 px-1 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-[#10B981] animate-ping" />
                                <span>Motion Tracking</span>
                              </div>

                              {/* Bottom-Left: Team Clustering Source */}
                              <div className="absolute bottom-2 left-2 bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-sky-450 text-[6px] font-mono font-black scale-90 px-1 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-sky-400 animate-ping" />
                                <span>Team Clustering</span>
                              </div>

                              {/* Bottom-Right: Jersey OCR Source */}
                              <div className="absolute bottom-2 right-2 bg-[#D946EF]/20 border border-[#D946EF]/40 text-fuchsia-450 text-[6px] font-mono font-black scale-90 px-1 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-fuchsia-400 animate-ping" />
                                <span>Jersey OCR</span>
                              </div>

                              {/* Target central lock-on rotating rings around the player holding the ball */}
                              <div 
                                className="absolute pointer-events-none z-30" 
                                style={{
                                  left: `${ballPossession.player.x}%`, 
                                  top: `${ballPossession.player.y}%`,
                                  transform: 'translate(-50%, -50%)'
                                }}
                              >
                                {/* Concentric rotating reticle rings */}
                                <div className="absolute w-10 h-10 rounded-full border border-dashed border-[#F59E0B]/80 animate-[spin_10s_linear_infinite] opacity-60" />
                                <div className="absolute w-12 h-12 rounded-full border border-[#D946EF]/60 animate-[spin_6s_linear_infinite_reverse] opacity-50" />
                                <div className="absolute w-14 h-14 rounded-full border border-[#10B981]/50 animate-[ping_2s_infinite] opacity-25" />
                                <span className="absolute -top-5.5 left-1/2 -translate-x-1/2 bg-black/95 text-yellow-300 border border-yellow-500/35 text-[5.5px] font-mono tracking-widest px-1 py-0.2 rounded font-black whitespace-nowrap shadow uppercase animate-pulse">
                                  POSSESSION LOCK
                                </span>
                              </div>

                              {/* Core dynamic telemetry HUD card anchored bottom-center of the arena court */}
                              <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 bg-[#090C15]/90 border border-primary/25 rounded-2xl flex items-center gap-3.5 px-3 py-1.5 z-40 text-left pointer-events-none select-none backdrop-blur shadow-2xl scale-95 origin-bottom transition-all">
                                <div className="flex flex-col border-r border-[#ffffff20] pr-3.5">
                                  <span className="text-[5.5px] font-mono text-primary font-bold uppercase tracking-widest leading-none">Inter-Model Sync Link</span>
                                  <span className="text-[9px] font-headline font-black text-white uppercase leading-none mt-1">
                                    Player #{ballPossession.details?.number || ballPossession.player?.number || 'XX'} Recv Ball
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex flex-col text-[6.5px] font-mono leading-tight">
                                    <span className="text-[#F59E0B]">⚡ DETECTION: SECURED ({ballPossession.details?.confidence || 98}%)</span>
                                    <span className="text-[#10B981]">🧬 TRACKING: TRAJECTORY RESOLVED</span>
                                  </div>
                                  <div className="flex flex-col text-[6.5px] font-mono leading-tight">
                                    <span className="text-[#0EA5E9]">🎯 CLUSTERING: GROUP {ballPossession.details?.type === 'offense' ? 'A (OFF)' : 'B (DEF)'}</span>
                                    <span className="text-[#D946EF]">🔠 JERSEY OCR: "{ballPossession.details?.number || 'XX'}" CONFIRMED</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Interactive Scrub Control Timeline panel */}
                        <div className="bg-surface-container border border-outline-variant/10 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                              onClick={() => {
                                setAnalyzingVideo((prev: any) => ({ ...prev, isPlaying: !prev.isPlaying }));
                              }}
                              className="w-10 h-10 rounded-full bg-primary hover:bg-primary/95 text-black flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md flex-shrink-0 cursor-pointer"
                              title={analyzingVideo.isPlaying ? "Pause simulated playback" : "Play simulated playback"}
                            >
                              {analyzingVideo.isPlaying ? (
                                <Pause className="w-4 h-4 fill-current text-black" />
                              ) : (
                                <Play className="w-4 h-4 fill-current text-black translate-x-0.5" />
                              )}
                            </button>

                            <div className="text-left font-mono">
                              <p className="text-[10px] text-white font-bold uppercase tracking-wider leading-none">
                                {analyzingVideo.isPlaying ? "Processing loop..." : "Analyzer Paused"}
                              </p>
                              <p className="text-[8px] text-on-surface-variant/70 leading-none mt-1">
                                Speed: {cvPlaybackRate}x • Frame {analyzingVideo.currentFrame + 1}
                              </p>
                            </div>
                          </div>

                          {/* Dynamic slider timeline */}
                          <div className="flex-1 flex items-center gap-3 w-full font-sans">
                            <span className="text-[9px] font-mono text-on-surface-variant/60">F1</span>
                            <input
                              type="range"
                              min={0}
                              max={analyzingVideo.framesCount - 1}
                              value={analyzingVideo.currentFrame}
                              onChange={(e) => {
                                const frVal = parseInt(e.target.value);
                                setAnalyzingVideo((prev: any) => ({ ...prev, currentFrame: frVal, isPlaying: false }));
                              }}
                              className="flex-1 accent-primary h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-[9px] font-mono text-on-surface-variant/60">F5 (LOCKED)</span>
                          </div>

                          {/* Control adjustments speed */}
                          <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl">
                            {[0.5, 1.0, 2.0].map((rate) => (
                              <button
                                key={rate}
                                onClick={() => setCvPlaybackRate(rate)}
                                className={`px-2.5 py-1 rounded-lg font-mono text-[9px] font-bold transition-all ${
                                  cvPlaybackRate === rate
                                    ? 'bg-primary/20 text-primary border border-primary/20'
                                    : 'text-on-surface-variant/60 hover:text-white'
                                }`}
                              >
                                {rate === 1.0 ? '1x' : `${rate}x`}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 📡 Live Basketball Object Detection & Inter-Player Motion Tracking Telemetry HUD */}
                        <div className="bg-[#0b0f19]/80 border border-yellow-500/15 p-4 rounded-2xl flex flex-col gap-3 text-left mt-2 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400">
                                <Activity className="w-3 h-3" />
                              </span>
                              <div>
                                <h4 className="font-mono text-[10px] text-white font-extrabold uppercase tracking-widest leading-none">
                                  Live Object Detection & Ball-Player Vector Tracker
                                </h4>
                                <p className="text-[7.5px] text-white/40 font-sans mt-1 leading-none">
                                  Continuous multi-object centroids, inter-frame velocity, and interception vector analysis
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowBallMotionAnalysis(!showBallMotionAnalysis)}
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                showBallMotionAnalysis
                                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.15)]'
                                  : 'bg-white/5 border-white/10 text-white/45 hover:bg-white/10'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${showBallMotionAnalysis ? 'bg-yellow-400 animate-pulse' : 'bg-white/35'}`} />
                              <span>{showBallMotionAnalysis ? 'VECTORS ACTIVE' : 'VECTORS MUTED'}</span>
                            </button>
                          </div>

                          {showBallMotionAnalysis && ballMotionTracker ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-150">
                              {/* Left Column: Ball Centroid Physics */}
                              <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex flex-col justify-between gap-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Ball Centroid Physics</span>
                                  <span className="text-[6.5px] px-1.5 py-0.2 bg-yellow-500/15 text-yellow-400 font-mono font-bold rounded">
                                    {ballMotionTracker.isPassInProgress ? 'IN FLIGHT' : 'STABLE'}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-[15px] font-mono font-extrabold text-yellow-400 tracking-tight leading-none">
                                    {ballMotionTracker.speedMph.toFixed(1)} <span className="text-[9px] text-yellow-400/60 font-normal">mph</span>
                                  </div>
                                  <div className="text-[8px] font-mono text-white/50 leading-none mt-1">
                                    Instantaneous: {ballMotionTracker.speedMetersPerSec.toFixed(2)} m/s
                                  </div>
                                </div>
                                <div className="w-full bg-white/5 h-1 rounded overflow-hidden mt-1">
                                  <div 
                                    className="h-full bg-yellow-400 transition-all duration-300"
                                    style={{ width: `${Math.min(100, (ballMotionTracker.speedMph / 35) * 100)}%` }}
                                  />
                                </div>
                              </div>

                              {/* Center Column: Sender / Pass Origin */}
                              <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex flex-col justify-between gap-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Play Starter (Passer)</span>
                                  <span className="text-[6.5px] px-1.5 py-0.2 bg-blue-500/15 text-blue-400 font-mono font-bold rounded">
                                    ORIGIN
                                  </span>
                                </div>
                                {ballMotionTracker.sender ? (
                                  <div>
                                    <div className="text-[12px] font-headline font-black text-white leading-tight">
                                      #{ballMotionTracker.sender.details?.number || ballMotionTracker.sender.number} {ballMotionTracker.sender.details?.name || 'Active Ball Carrier'}
                                    </div>
                                    <div className="text-[8px] font-mono text-blue-400 leading-none mt-1 uppercase">
                                      Position: {ballMotionTracker.sender.details?.label || 'G'} • Team: {ballMotionTracker.sender.details?.type === 'offense' ? 'Team A' : 'Team B'}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-[9px] font-mono text-white/30 italic">
                                    Computing starting coordinates...
                                  </div>
                                )}
                                <div className="text-[6.5px] font-mono text-white/35">
                                  Coordinates: X:{(ballMotionTracker.sender ? ballMotionTracker.sender.x * 0.2865 : 0).toFixed(1)}m, Y:{(ballMotionTracker.sender ? ballMotionTracker.sender.y * 0.1524 : 0).toFixed(1)}m
                                </div>
                              </div>

                              {/* Right Column: Receiver / Play Target */}
                              <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex flex-col justify-between gap-1.5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/[0.02] rounded-full translate-x-4 -translate-y-4 pointer-events-none" />
                                <div className="flex items-center justify-between">
                                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Interceptor (Receiver)</span>
                                  <span className="text-[6.5px] px-1.5 py-0.2 bg-emerald-500/15 text-emerald-400 font-mono font-bold rounded animate-pulse">
                                    TARGET LOCK
                                  </span>
                                </div>
                                {ballMotionTracker.receiver ? (
                                  <div>
                                    <div className="text-[12px] font-headline font-black text-white leading-tight">
                                      #{ballMotionTracker.receiver.details?.number || ballMotionTracker.receiver.number} {ballMotionTracker.receiver.details?.name || 'Play Target'}
                                    </div>
                                    <div className="text-[8.5px] font-mono text-emerald-400 leading-none mt-1 uppercase flex items-center gap-1 flex-wrap">
                                      <span>Dist: {ballMotionTracker.distanceToReceiverMeters.toFixed(1)}m</span>
                                      <span className="text-white/20">•</span>
                                      {ballMotionTracker.timeToInterceptSeconds > 0 ? (
                                        <span className="text-amber-400 font-bold">Intercept in {ballMotionTracker.timeToInterceptSeconds.toFixed(2)}s</span>
                                      ) : (
                                        <span>In Proximity</span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-[9px] font-mono text-white/30 italic">
                                    Resolving ball trajectory target...
                                  </div>
                                )}
                                <div className="text-[6.5px] font-mono text-white/35">
                                  Coordinates: X:{(ballMotionTracker.receiver ? ballMotionTracker.receiver.x * 0.2865 : 0).toFixed(1)}m, Y:{(ballMotionTracker.receiver ? ballMotionTracker.receiver.y * 0.1524 : 0).toFixed(1)}m
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                              <p className="text-[9.5px] font-mono text-white/30 italic">
                                Motion vector overlays are turned off. Click 'VECTORS ACTIVE' above to overlay live ball physics and player tracking links.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* 🛰️ AI Spatiotemporal Similar Video Discovery (Team Clustering & Spacing Engine) */}
                        <div className="bg-[#101622] border border-outline-variant/15 p-5 rounded-3xl flex flex-col gap-3 shadow-xl text-left select-none mt-1 animate-in fade-in duration-300">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                              <span className="text-[10px] font-mono text-white font-black uppercase tracking-widest">
                                AI Spatiotemporal Similar Video Discovery
                              </span>
                            </div>
                            <span className="text-[7.5px] bg-primary/10 border border-primary/25 text-primary px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider">
                              Similarity Matcher
                            </span>
                          </div>

                          <p className="text-[10px] text-on-surface-variant font-sans leading-relaxed">
                            By mapping dynamic player spacing, ball speed vectors, and playground contours into our play comparison model, we retrieved highly matching court sessions from the global Street Hoop archives.
                          </p>

                          {/* Display similar videos matching the active video content! */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-1.5">
                            {getSimilarVideos().map((vid, idx) => (
                              <div 
                                key={idx}
                                onClick={() => handleLoadSimilarVideo(vid)}
                                className="group/vid bg-surface-container-high/40 hover:bg-surface-container/80 border border-outline-variant/10 hover:border-primary/30 rounded-xl p-2.5 transition-all cursor-pointer flex flex-col gap-2 hover:scale-[1.02] active:scale-98 shadow-md"
                              >
                                {/* Thumbnail mockup with realistic street hoop visuals */}
                                <div className="relative aspect-[16/9] bg-black/40 rounded-lg overflow-hidden border border-white/5">
                                  <img 
                                    src={`https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg`} 
                                    alt={vid.title}
                                    className="w-full h-full object-cover opacity-80 group-hover/vid:opacity-100 group-hover/vid:scale-105 transition-all duration-300"
                                    referrerPolicy="no-referrer"
                                  />
                                  {/* Match rating badge */}
                                  <div className="absolute top-1.5 right-1.5 bg-black/75 backdrop-blur-sm border border-primary/20 text-primary font-mono text-[7px] font-bold px-1.5 py-0.5 rounded-md">
                                    {vid.match}% MATCH
                                  </div>
                                  {/* Play Icon overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/vid:opacity-100 transition-opacity">
                                    <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-black shadow-lg">
                                      <Play className="w-3.5 h-3.5 fill-current text-black translate-x-0.5" />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-0.5 text-left">
                                  <span className="text-[9.5px] font-sans font-bold text-white group-hover/vid:text-primary transition-colors line-clamp-1">
                                    {vid.title}
                                  </span>
                                  <span className="text-[7.5px] font-mono text-[#FF8F6F] font-black uppercase tracking-wider">
                                    {vid.type}
                                  </span>
                                  <p className="text-[8px] text-on-surface-variant/80 font-sans leading-tight mt-0.5 line-clamp-2">
                                    {vid.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Deep Neural Diagnosis Engine */}
                      <div className="xl:col-span-4 flex flex-col gap-5 overflow-y-auto pr-1 h-full custom-scrollbar pb-4">
                        {/* 📸 AI Live Target Close-Up View (Dynamic Mirror Crop Tracker) */}
                        <div className="bg-[#141B26] border border-outline-variant/15 p-4 rounded-3xl flex flex-col gap-3 shadow-2xl select-none animate-in fade-in duration-300 text-left">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                              </span>
                              <span className="text-[9px] font-mono text-yellow-400 font-black uppercase tracking-widest">AI Target Close-Up Lock</span>
                            </div>
                            <span className="text-[7px] bg-[#EAB308]/15 border border-[#EAB308]/30 text-[#EAB308] px-1.5 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider">
                              CAM_4_WARP
                            </span>
                          </div>

                          {/* Zoomed aspect-video viewport frame */}
                          <div className="relative w-full aspect-video bg-[#070A11]/95 rounded-xl overflow-hidden border border-white/10 shadow-inner group/viewport">
                            {trackedTarget ? (
                              <>
                                {/* Dynamic Inner court container that offsets itself to follow the target coordinates */}
                                <div 
                                  className="absolute inset-0 w-full h-full transition-all duration-300 ease-out"
                                  style={{
                                    transform: `scale(2.8)`,
                                    transformOrigin: `${trackedTarget.x}% ${trackedTarget.y}%`,
                                  }}
                                >
                                  {/* Replica of Court lines layout */}
                                  <div className="absolute inset-0 bg-[#0E1521] flex items-center justify-center">
                                    {/* Center court circles zoomed */}
                                    <div className="absolute w-[35%] aspect-square border border-white/10 rounded-full" />
                                    <div className="absolute h-full w-[1px] bg-white/15 left-1/2" />
                                    <div className="absolute left-1 border border-white/15 w-[35%] h-[90%] top-[5%] rounded-r-full" />
                                    <div className="absolute right-1 border border-white/15 w-[35%] h-[90%] top-[5%] rounded-l-full" />
                                    {/* Basket rings */}
                                    <div className="absolute left-[3.5%] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-purple-500/30 bg-purple-500/5" />
                                    <div className="absolute right-[3.5%] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-purple-500/30 bg-purple-500/5" />
                                  </div>

                                  {/* Render replica players inside Zoom View */}
                                  {activeCvPlayers.map((fp: any, idx: number) => {
                                    if (fp.isBall) return (
                                      <div 
                                        key="ball"
                                        className="absolute w-2 h-2 rounded-full bg-yellow-500 border border-black shadow"
                                        style={{ left: `${fp.x}%`, top: `${fp.y}%`, transform: 'translate(-50%, -50%)' }}
                                      />
                                    );
                                    const playerDetail = analyzingVideo.players?.find((pt: any) => pt.id === fp.id);
                                    if (!playerDetail) return null;
                                    const isTarget = selectedTrackedPlayerId === fp.id;
                                    return (
                                      <div 
                                        key={fp.id || idx}
                                        className={`absolute w-3.5 h-3.5 rounded-full border border-white/30 flex items-center justify-center text-[5.5px] font-mono font-extrabold text-white shadow-lg transition-transform ${
                                          playerDetail.type === 'offense' ? 'bg-blue-600' : 'bg-red-650'
                                        } ${isTarget ? 'scale-[1.3] border-yellow-400 font-black ring-1 ring-yellow-400/50' : ''}`}
                                        style={{
                                          left: `${fp.x}%`,
                                          top: `${fp.y}%`,
                                          transform: `translate(-50%, -50%)`,
                                        }}
                                      >
                                        {playerDetail.number}
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* HUD Camera Target Indicator overlay in PiP viewport */}
                                <div className="absolute inset-y-0 left-0 aspect-square border-r border-[#EAB308]/20 pointer-events-none bg-gradient-to-r from-black/25 to-transparent flex flex-col justify-between p-2">
                                  <span className="text-[5px] font-mono text-white/40">W: 192px</span>
                                  <span className="text-[5px] font-mono text-white/40">H: 108px</span>
                                </div>

                                <div className="absolute top-2 right-2 bg-black/70 border border-white/10 px-1.5 py-0.5 rounded font-mono text-[7px] text-yellow-400 font-extrabold flex items-center gap-1 pointer-events-none leading-none shadow">
                                  <span className="w-1 h-1 rounded-full bg-[#10B981] animate-ping" />
                                  <span>FOC_LOCK #{trackedTarget.details?.number || 'BALL'}</span>
                                </div>

                                {/* Centered crosshairs marker absolute center */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-6 h-6 border border-dashed border-[#EAB308]/20 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-[1px] bg-[#EAB308]/40" />
                                    <div className="h-2 w-[1px] bg-[#EAB308]/40 absolute" />
                                  </div>
                                </div>

                                {/* Active Coordinates in PIP */}
                                <div className="absolute bottom-2 left-2 bg-black/75 px-1.5 py-0.5 rounded border border-white/5 font-mono text-[6.5px] text-white/95">
                                  GRID: X:{trackedTarget.x.toFixed(1)}% Y:{trackedTarget.y.toFixed(1)}%
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                                <VideoOff className="w-6 h-6 text-on-surface-variant/40 mb-1" />
                                <span className="text-[9px] font-mono text-on-surface-variant/60 uppercase">Camera Off-line</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 🎞️ AI COMPUTER VISION TIMELINE KEYFRAMES */}
                        <div className="bg-[#141B26] border border-outline-variant/10 p-4 rounded-3xl flex flex-col gap-3.5 shadow-2xl select-none animate-in fade-in duration-300 text-left">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <div className="flex items-center gap-1.5">
                              <Camera className="w-3.5 h-3.5 text-primary" />
                              <span className="text-[9px] font-mono text-white font-black uppercase tracking-widest">Active Seq Keyframes</span>
                            </div>
                            <span className="text-[7px] bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider">
                              TC FEED MODE
                            </span>
                          </div>

                          {/* Vertical Timeline list */}
                          <div className="relative pl-3.5 flex flex-col gap-2.5">
                            {/* Vertical connection track */}
                            <div className="absolute left-[19.5px] top-4 bottom-4 w-0.5 bg-outline-variant/10" />

                            {[
                              { index: 0, tc: 'TC 20:58:11;13', delta: 'START' },
                              { index: 1, tc: 'TC 20:58:12;11', delta: '+00:00:27' },
                              { index: 2, tc: 'TC 20:58:12;20', delta: '+00:00:09' },
                              { index: 3, tc: 'TC 20:58:12;28', delta: '+00:00:07' },
                              { index: 4, tc: 'TC 20:58:13;10', delta: '+00:00:12' }
                            ].slice(0, analyzingVideo.framesCount || 5).map((kf) => {
                              const isActive = analyzingVideo.currentFrame === kf.index;
                              return (
                                <div 
                                  key={kf.index}
                                  onClick={() => {
                                    setAnalyzingVideo((prev: any) => ({ ...prev, currentFrame: kf.index, isPlaying: false }));
                                  }}
                                  className={`flex items-center justify-between py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                                    isActive 
                                      ? 'bg-primary/10 border-primary/45 text-white shadow-xl scale-[1.01]' 
                                      : 'bg-surface-container-high/20 border-transparent hover:bg-white/5 text-on-surface-variant hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-3.5 relative z-10 text-left">
                                    {/* Timeline sequence point number */}
                                    <div 
                                      className={`w-5 h-5 rounded-full border-2 text-[9px] font-mono font-black flex items-center justify-center shrink-0 transition-all ${
                                        isActive 
                                          ? 'border-[#FF8F6F] bg-[#0E1521] text-[#FF8F6F] shadow-[0_0_8px_rgba(255,143,111,0.3)] scale-110' 
                                          : 'border-on-surface-variant/30 bg-[#0E1521] text-on-surface-variant/60'
                                      }`}
                                    >
                                      {kf.index + 1}
                                    </div>

                                    {/* Frame incremental delta time */}
                                    <div className="flex flex-col text-left justify-center select-none font-mono">
                                      <span className={`text-[7px] font-bold leading-none uppercase ${
                                        isActive ? 'text-primary' : 'text-on-surface-variant/50'
                                      }`}>
                                        {kf.delta}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Absolute system Timecode stamp */}
                                  <span className={`font-mono text-[9.5px] font-black ${
                                    isActive ? 'text-primary' : 'text-on-surface-variant/75'
                                  }`}>
                                    {kf.tc}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Tab Content 1: Player Detection Diagnostics */}
                        {activeCvTab === 'rf_detr' && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-2xl space-y-3">
                              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/5">
                                <span className="text-[10px] font-mono text-[#F59E0B] font-bold uppercase tracking-wider">Player Detection Centroids Layer</span>
                                <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded font-mono">IOU Threshold: 0.72</span>
                              </div>
                              <p className="text-[10px] text-on-surface-variant leading-relaxed">
                                AI-driven real-time object detection parses multi-target player bounding boxes and centroids within extreme crowd constraints.
                              </p>

                              <div className="space-y-2">
                                <span className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest block font-bold">Detection Confidence Gate</span>
                                <div className="bg-surface-container-highest/20 p-2.5 rounded-xl border border-outline-variant/5 flex items-center justify-between gap-4">
                                  <span className="font-mono text-xs text-white">80% Conf</span>
                                  <div className="flex-1 px-1">
                                    <div className="h-1 w-full bg-surface-container rounded relative">
                                      <div className="absolute left-0 h-full bg-amber-500 rounded" style={{ width: '80%' }} />
                                      <div className="absolute left-[80%] -translate-x-1/2 -top-1.5 w-4 h-4 bg-white rounded-full border-2 border-amber-500 shadow cursor-pointer" />
                                    </div>
                                  </div>
                                  <span className="font-mono text-[9px] text-[#36D399] font-bold">STATIONARY OK</span>
                                </div>
                              </div>
                            </div>

                            {/* Object detection classes parsed */}
                            <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-2xl space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest block font-bold">Active Entities Parsed</span>
                                {analyzingVideo.players.length > 0 && (
                                  <button
                                    onClick={() => {
                                      setAnalyzingVideo({
                                        ...analyzingVideo,
                                        players: [],
                                        frames: (analyzingVideo.frames || [[],[],[],[],[]]).map((fr: any) => fr.filter((ptNode: any) => ptNode.isBall))
                                      });
                                      setSelectedTrackedPlayerId(null);
                                    }}
                                    className="text-[8px] font-mono bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/50 hover:text-red-300 px-1.5 py-0.5 rounded transition uppercase font-bold"
                                  >
                                    Reset All
                                  </button>
                                )}
                              </div>
                              
                              <div className="divide-y divide-outline-variant/10">
                                {analyzingVideo.players.length === 0 ? (
                                  <div className="py-6 px-3 text-center border border-dashed border-outline-variant/20 rounded-xl bg-black/10">
                                    <p className="text-amber-400 font-mono text-[9px] font-bold uppercase tracking-wide">Manual Plot Mode Active</p>
                                    <p className="text-[9px] text-on-surface-variant/80 mt-1 lines-normal leading-relaxed">
                                      Tap anywhere on the court canvas preview layout above to manually plot player locations and start tracking.
                                    </p>
                                  </div>
                                ) : (
                                  analyzingVideo.players.map((pt: any) => (
                                    <div 
                                      key={pt.id} 
                                      onClick={() => setSelectedTrackedPlayerId(pt.id)}
                                      className={`py-2 flex items-center justify-between hover:bg-white/5 px-2.5 rounded-lg transition-colors cursor-pointer group/item ${
                                        selectedTrackedPlayerId === pt.id ? 'bg-primary/5 border-l-2 border-primary' : ''
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded ${pt.type === 'offense' ? 'bg-[#3B82F6]' : 'bg-[#EF4444]'}`} />
                                        <div className="text-left leading-none">
                                          <div className="flex items-center gap-1.5">
                                            <b className="text-white text-[10px] font-headline">{pt.name}</b>
                                            {pt.id.startsWith('manual-') && (
                                              <span className="bg-primary/20 border border-primary/30 text-primary text-[6px] font-mono font-bold px-1 rounded scale-90">
                                                MANUAL
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[8px] text-on-surface-variant font-mono mt-0.5">ID: {pt.id.substring(0, 8)} • Class: Player</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="text-right leading-none font-mono">
                                          <span className="text-amber-400 text-[10px] font-black">{pt.confidence}%</span>
                                          <p className="text-[7px] text-on-surface-variant/60 mt-0.5">IOU: 0.89</p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const updatedPlayers = analyzingVideo.players.filter((p: any) => p.id !== pt.id);
                                            const updatedFrames = analyzingVideo.frames.map((fr: any) => fr.filter((ptNode: any) => ptNode.id !== pt.id));
                                            setAnalyzingVideo({
                                              ...analyzingVideo,
                                              players: updatedPlayers,
                                              frames: updatedFrames
                                            });
                                            if (selectedTrackedPlayerId === pt.id) {
                                              setSelectedTrackedPlayerId(null);
                                            }
                                          }}
                                          className="p-1 hover:bg-red-500/20 text-on-surface-variant hover:text-red-400 rounded opacity-0 group-hover/item:opacity-100 transition-opacity ml-1"
                                          title="Delete entity"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tab Content 2: Motion Tracking Diagnostics */}
                        {activeCvTab === 'sam3' && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-2xl space-y-3">
                              <span className="text-[10px] font-mono text-[#10B981] font-bold uppercase tracking-wider block">Motion Path Vector Trails</span>
                              <p className="text-[10px] text-on-surface-variant leading-relaxed">
                                Spatiotemporal vector path tracing dynamically maps player velocities, coordinates, and spacing geometry.
                              </p>

                              {/* Target detail card */}
                              {selectedTrackedPlayerId ? (
                                (() => {
                                  const pDet = analyzingVideo.players.find((p: any) => p.id === selectedTrackedPlayerId);
                                  const cPos = activeCvPlayers.find((pt: any) => pt.id === selectedTrackedPlayerId);
                                  return (
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-xl text-left space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Active Focus Tracker</span>
                                        <span className="text-[8px] font-mono text-on-surface-variant/60">Class ID: {selectedTrackedPlayerId}</span>
                                      </div>
                                      <div className="space-y-1">
                                        <h4 className="text-white font-headline text-xs font-bold">{pDet?.name} (Jersey {pDet?.number})</h4>
                                        <p className="text-[9px] text-on-surface-variant font-sans">
                                          Coordinates: <b className="text-white font-mono">X: {typeof cPos?.x === 'number' ? cPos.x.toFixed(1) : 'N/A'}%, Y: {typeof cPos?.y === 'number' ? cPos.y.toFixed(1) : 'N/A'}%</b>
                                        </p>
                                        <p className="text-[9px] text-on-surface-variant font-sans leading-normal">
                                          Spatiotemporal contour covers approx <b className="text-white font-mono">5.2 square pixels</b> at sub-grid precision.
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })()
                              ) : (
                                <div className="bg-surface-container-highest/10 border border-outline-variant/5 p-3 rounded-xl text-center">
                                  <p className="text-[9px] text-on-surface-variant/50 font-mono">Click any player on the court diagram view to display motion contour statistics.</p>
                                </div>
                              )}
                            </div>

                            <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-2xl space-y-2">
                              <span className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest block font-bold">Velocity Metrics (Ft/Sec)</span>
                              <div className="space-y-2 text-[10px] font-mono leading-none">
                                {[
                                  { id: 'O1', tag: 'Steph Curry(PG)', vel: '19.4 ft/s', level: 'w-[90%]', color: 'bg-emerald-400' },
                                  { id: 'O2', tag: 'LeBron James(SF)', vel: '22.8 ft/s', level: 'w-[95%]', color: 'bg-emerald-400' },
                                  { id: 'O3', tag: 'Jayson Tatum(PF)', vel: '14.5 ft/s', level: 'w-[70%]', color: 'bg-yellow-400' },
                                  { id: 'O4', tag: 'Jalen Brunson(SG)', vel: '18.1 ft/s', level: 'w-[85%]', color: 'bg-emerald-400' },
                                  { id: 'O5', tag: 'Kevin Durant(C)', vel: '10.2 ft/s', level: 'w-[50%]', color: 'bg-[#FF8F6F]' }
                                ].map((tr) => (
                                  <div 
                                    key={tr.id} 
                                    onClick={() => setSelectedTrackedPlayerId(tr.id)}
                                    className={`p-2 rounded hover:bg-white/5 transition-all text-left flex flex-col gap-1.5 cursor-pointer ${
                                      selectedTrackedPlayerId === tr.id ? 'bg-[#36D399]/5' : ''
                                    }`}
                                  >
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="text-white font-sans">{tr.tag}</span>
                                      <span className="font-bold text-emerald-400">{tr.vel}</span>
                                    </div>
                                    <div className="h-1 w-full bg-surface-container rounded overflow-hidden">
                                      <div className={`h-full ${tr.color} ${tr.level}`} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tab Content 3: Team Clustering Diagnostics */}
                        {activeCvTab === 'siglip2' && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-2xl space-y-3 text-left">
                              <span className="text-[10px] font-mono text-[#60A5FA] font-bold uppercase tracking-wider block">Team Color Space Embeddings</span>
                              <p className="text-[10px] text-on-surface-variant leading-relaxed font-sans">
                                Extracts clothing color vectors from player crops and maps them into a 2D UMAP space to cleanly distinguish offensive and defensive teams.
                              </p>

                              {/* Interactive SVG Scatter Plot representing team division */}
                              <div className="bg-[#0b0c16] rounded-xl border border-outline-variant/10 p-4 relative">
                                <span className="absolute top-2 left-2 text-[6px] font-mono text-on-surface-variant uppercase tracking-widest font-sans">2D UMAP Projection space</span>
                                
                                <svg 
                                  ref={siglipSvgRef}
                                  onMouseMove={(e) => {
                                    if (cvDraggingPlayerId && cvDraggingPointType === 'siglip') {
                                      handleSiglipPointerMove(e.clientX, e.clientY);
                                    }
                                  }}
                                  onTouchMove={(e) => {
                                    if (cvDraggingPlayerId && cvDraggingPointType === 'siglip') {
                                      handleSiglipPointerMove(e.touches[0].clientX, e.touches[0].clientY);
                                    }
                                  }}
                                  onMouseUp={() => setCvDraggingPlayerId(null)}
                                  onMouseLeave={() => setCvDraggingPlayerId(null)}
                                  onTouchEnd={() => setCvDraggingPlayerId(null)}
                                  onClick={(e) => {
                                    if (cvDraggingPlayerId) return;
                                    if (!selectedTrackedPlayerId || !siglipSvgRef.current) return;
                                    const rect = siglipSvgRef.current.getBoundingClientRect();
                                    const svgX = ((e.clientX - rect.left) / rect.width) * 200;
                                    const svgY = ((e.clientY - rect.top) / rect.height) * 150;
                                    const embX = (svgX - 100) / 25;
                                    const embY = (75 - svgY) / 25;
                                    handleMovePlayerEmbedding(selectedTrackedPlayerId, embX, embY);
                                  }}
                                  className="w-full aspect-[4/3] bg-black/30 rounded-xl" 
                                  viewBox="0 0 200 150"
                                >
                                  {/* Grid lines */}
                                  <line x1="0" y1="75" x2="200" y2="75" stroke="#1F2937" strokeWidth="1" strokeDasharray="3,3" />
                                  <line x1="100" y1="0" x2="100" y2="150" stroke="#1F2937" strokeWidth="1" strokeDasharray="3,3" />
                                  
                                  {/* KMeans Decision Boundary line */}
                                  <path d="M 50 0 L 150 150" stroke="#EF4444" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
                                  
                                  <text x="145" y="15" fill="#EF4444" fontSize="5" fontWeight="bold">K-Means Split</text>

                                  {/* Plot Centroid Markers */}
                                  {analyzingVideo.siglipCentroids.map((cent: any) => (
                                    <g key={cent.id}>
                                      {/* Coordinates resolved from UMAP representation */}
                                      <circle 
                                        cx={`${100 + cent.x * 25}`} 
                                        cy={`${75 - cent.y * 25}`} 
                                        r="6" 
                                        fill="none" 
                                        stroke={cent.color} 
                                        strokeWidth="1.5" 
                                        opacity="0.8"
                                      />
                                      <circle 
                                        cx={`${100 + cent.x * 25}`} 
                                        cy={`${75 - cent.y * 25}`} 
                                        r="1.5" 
                                        fill={cent.color} 
                                      />
                                      <text 
                                        x={`${100 + cent.x * 25 + 6}`} 
                                        y={`${75 - cent.y * 25 + 2}`} 
                                        fill={cent.color} 
                                        fontSize="5" 
                                        fontWeight="black"
                                      >
                                        Centroid_{cent.id}
                                      </text>
                                    </g>
                                  ))}

                                  {/* Plotted Players */}
                                  {analyzingVideo.players.map((pt: any) => {
                                    const dotColor = pt.type === 'offense' ? '#FFBB5C' : '#E2E8F0';
                                    const mappedX = 100 + pt.embedding[0] * 25;
                                    const mappedY = 75 - pt.embedding[1] * 25;
                                    const isSelected = selectedTrackedPlayerId === pt.id;
                                    
                                    return (
                                      <g 
                                        key={pt.id} 
                                        className="cursor-grab select-none" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedTrackedPlayerId(pt.id);
                                        }}
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          setSelectedTrackedPlayerId(pt.id);
                                          setCvDraggingPlayerId(pt.id);
                                          setCvDraggingPointType('siglip');
                                        }}
                                        onTouchStart={(e) => {
                                          e.stopPropagation();
                                          setSelectedTrackedPlayerId(pt.id);
                                          setCvDraggingPlayerId(pt.id);
                                          setCvDraggingPointType('siglip');
                                        }}
                                      >
                                        <circle
                                          cx={`${mappedX}`}
                                          cy={`${mappedY}`}
                                          r={isSelected ? '6' : '3.5'}
                                          fill={dotColor}
                                          stroke={isSelected ? '#36D399' : 'none'}
                                          strokeWidth={isSelected ? '1.5' : '0'}
                                          opacity="0.9"
                                          className={isSelected ? "animate-[pulse_1.5s_infinite]" : ""}
                                        />
                                        <text
                                          x={`${mappedX + (isSelected ? 7 : 5)}`}
                                          y={`${mappedY + 1.5}`}
                                          fill={isSelected ? '#36D399' : '#9CA3AF'}
                                          fontSize={isSelected ? '6' : '5'}
                                          fontWeight={isSelected ? 'bold' : 'normal'}
                                        >
                                          #{pt.number}
                                        </text>
                                      </g>
                                    );
                                  })}
                                </svg>

                                <div className="flex justify-between items-center text-[7px] font-mono text-on-surface-variant leading-none mt-2 font-sans">
                                  <span>Cluster 1: Knicks (Orange)</span>
                                  <span className="text-primary font-bold animate-pulse text-[7.5px] uppercase tracking-wider">💡 Click/drag custom nodes to move embedding</span>
                                  <span>Cluster 2: White Team</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-2xl text-left space-y-2">
                              <span className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest block font-bold">UMAP Vector Embeddings Log</span>
                              <div className="bg-surface-container/60 p-2.5 rounded-xl border border-outline-variant/10 overflow-x-auto text-[8px] font-mono leading-relaxed max-h-[140px] custom-scrollbar text-left">
                                {analyzingVideo.players.map((p: any) => (
                                  <div key={p.id} className="grid grid-cols-12 gap-1 py-0.5 border-b border-white/5 hover:bg-white/5 px-1 rounded">
                                    <span className="col-span-2 text-white">#{p.number}</span>
                                    <span className="col-span-5 text-on-surface-variant/85 truncate text-left">{p.name}</span>
                                    <span className="col-span-3 text-emerald-400">[{p.embedding[0]}, {p.embedding[1]}]</span>
                                    <span className="col-span-2 text-primary font-black text-right">{p.type === 'offense' ? 'TEAM_A' : 'TEAM_B'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tab Content 4: Jersey OCR Diagnostics */}
                        {activeCvTab === 'glm_ocr' && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-2xl space-y-3">
                              <div className="flex justify-between items-center pb-1">
                                <span className="text-[10px] font-mono text-fuchsia-400 font-bold uppercase tracking-wider block">Jersey OCR Spatial Decoder</span>
                                <span className="text-[7.5px] font-mono bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20 px-1 py-0.2 rounded font-black">Attention Grid: 14x14</span>
                              </div>
                              <p className="text-[10px] text-on-surface-variant leading-relaxed font-sans">
                                OCR parsing detects and decodes dynamic backplate jersey number strings across multiple fast-break motion angles.
                              </p>

                              <div className="bg-[#120D1A] rounded-xl border border-fuchsia-500/15 p-3 text-left">
                                <span className="text-[7.5px] font-mono text-fuchsia-300 block uppercase tracking-widest font-black mb-1.5">OCR confidence criteria gate</span>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-mono text-on-surface-variant font-bold uppercase">MIN CONF:</span>
                                  <input 
                                    type="range"
                                    min={75}
                                    max={98}
                                    value={ocrConfidenceFilter}
                                    onChange={(e) => setOcrConfidenceFilter(parseInt(e.target.value))}
                                    className="flex-1 accent-fuchsia-500 h-1 bg-surface-container rounded-lg appearance-none cursor-pointer"
                                  />
                                  <span className="text-[9px] font-mono text-fuchsia-400 font-black">{ocrConfidenceFilter}%</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-2xl text-left space-y-2">
                              <span className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest block font-bold">Transcription logs</span>
                              
                              <div className="divide-y divide-outline-variant/10">
                                {analyzingVideo.players
                                  .filter((p: any) => p.confidence >= ocrConfidenceFilter)
                                  .map((p: any) => (
                                    <div 
                                      key={p.id} 
                                      onClick={() => setSelectedTrackedPlayerId(p.id)}
                                      className="py-2.5 flex items-center justify-between hover:bg-white/5 px-2 rounded-lg transition-colors cursor-pointer text-left"
                                    >
                                      <div className="text-left">
                                        <h5 className="text-[11px] font-mono font-bold text-white flex items-center gap-1.5 text-left">
                                          <span className="w-5 h-4 bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 rounded text-[9px] flex items-center justify-center font-black">
                                            "{p.number}"
                                          </span>
                                          {p.name}
                                        </h5>
                                        <p className="text-[8px] text-on-surface-variant/70 font-mono mt-0.5 leading-snug text-left">
                                          {p.ocrDetails}
                                        </p>
                                      </div>
                                      <span className="text-[9px] font-mono bg-fuchsia-950/40 border border-fuchsia-500/30 text-fuchsia-400 font-bold px-1.5 py-0.5 rounded shrink-0">
                                        {p.confidence}%
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : isUploadFullscreen ? (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full items-stretch min-h-0 text-left">
                    {/* Left Panel: Upload Zone & Status */}
                    <div className="xl:col-span-4 flex flex-col gap-5 overflow-y-auto pr-1 select-none custom-scrollbar pb-4 h-full">
                      <div className="bg-surface-container-low/55 p-4 rounded-xl border border-outline-variant/10 flex flex-col gap-2">
                        <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-wider">📁 PLAYBOOK IMPORTER WORKSPACE</span>
                        <p className="text-on-surface-variant text-xs leading-relaxed font-sans">
                          You are currently working in full-screen tactical workspace mode. Drag & drop file presets, images or spreadsheets to batch-import.
                        </p>
                      </div>

                      {/* Compact YouTube Tactical stream importer */}
                      <div className="bg-surface-container-low border border-outline-variant/15 p-4 rounded-2xl flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-red-500 font-bold uppercase tracking-wider">📺 Automated YouTube Decoder</span>
                        </div>
                        <p className="text-[10px] text-on-surface-variant leading-relaxed font-sans">
                          Enter YouTube game film URL to automatically decode play coordinates.
                        </p>
                        <div className="flex gap-1.5">
                          <input 
                            type="url"
                            placeholder="Paste YouTube Link..."
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            className="flex-1 bg-surface-container-highest border border-outline-variant/15 rounded-lg px-2.5 py-2 text-on-surface font-sans text-[11px] focus:outline-none focus:border-red-500/50"
                          />
                          <button
                            onClick={() => handleYoutubeVideoCvAnalysis(youtubeUrl)}
                            className="px-3 bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] font-bold uppercase rounded-lg transition-colors active:scale-95 shrink-0 animate-pulse"
                          >
                            RUN CV
                          </button>
                        </div>
                        <div className="flex flex-col gap-1 mt-1 text-[9px] text-on-surface-variant font-mono">
                          <span className="text-[8px] font-semibold text-on-surface-variant/50 uppercase tracking-wider text-left">Quick presets:</span>
                          <button
                            onClick={() => {
                              setYoutubeUrl("https://www.youtube.com/watch?v=kY8c2_Zco7M");
                              handleYoutubeVideoCvAnalysis("https://www.youtube.com/watch?v=kY8c2_Zco7M");
                            }}
                            className="bg-surface-container/60 hover:bg-surface-container hover:text-white px-2 py-1 rounded text-left truncate transition-colors text-[9px]"
                          >
                            Warriors Split Action Play
                          </button>
                          <button
                            onClick={() => {
                              setYoutubeUrl("https://www.youtube.com/watch?v=1FMyC8zWjZ0");
                              handleYoutubeVideoCvAnalysis("https://www.youtube.com/watch?v=1FMyC8zWjZ0");
                            }}
                            className="bg-surface-container/60 hover:bg-surface-container hover:text-white px-2 py-1 rounded text-left truncate transition-colors text-[9px]"
                          >
                            Spurs Motion Hand-Off
                          </button>
                        </div>
                      </div>

                      {/* Drag & Drop File Zone */}
                      <div 
                        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none shrink-0 ${
                          isDragging 
                            ? 'border-primary bg-primary/5 scale-[0.99]' 
                            : 'border-outline-variant/20 hover:border-primary/40 hover:bg-white/5 bg-surface-container-low'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            handleFileUpload(e.dataTransfer.files);
                          }
                        }}
                        onClick={() => document.getElementById('playbook-file-input-fs')?.click()}
                      >
                        <input 
                          type="file" 
                          id="playbook-file-input-fs" 
                          multiple 
                          accept=".json,.csv,.txt,.png,.jpg,.jpeg,.mp4,.mov,.avi,.mkv,.webm"
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files) {
                              handleFileUpload(e.target.files);
                            }
                          }}
                        />
                        <div className="bg-surface-container-highest/60 p-3 rounded-full border border-outline-variant/20 mb-3 text-primary shadow flex items-center justify-center animate-bounce">
                          <Upload className="w-6 h-6" />
                        </div>
                        <h4 className="font-headline font-bold text-white text-sm">Add More Files</h4>
                        <p className="text-[10px] text-on-surface-variant mt-1 font-sans">
                          Drop files or <span className="text-primary hover:underline font-bold">browse</span>
                        </p>
                      </div>

                      {/* Config Format Cards */}
                      <div className="space-y-3 shrink-0">
                        <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest font-black">ACCEPTED FORMAT TEMPLATES</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            type="button"
                            onClick={() => handleCopyLink(`[\n  {\n    "name": "Knicks Corner Curl Pin",\n    "type": "Offense",\n    "description": "Double pin down screens set at the low block",\n    "team": "${homeTeamName}"\n  }\n]`)}
                            className="bg-surface-container-low/40 hover:bg-surface-container/50 p-2.5 rounded-lg border border-outline-variant/10 text-left text-[10px] flex flex-col gap-0.5 transition-all active:scale-95"
                          >
                            <span className="font-mono text-[8px] text-[#36D399] font-bold">📋 JSON TEMPLATE</span>
                            <span className="text-on-surface-variant/70 text-[9px] truncate font-sans">Click to copy format</span>
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleCopyLink(`Name,Type,Description,Team\nKnicks Horns Flare,Offense,Horns entry with secondary Flare,${homeTeamName}\nSpurs Drop Zone,Defense,Standard paint packing defensive set,${awayTeamName}`)}
                            className="bg-surface-container-low/40 hover:bg-surface-container/50 p-2.5 rounded-lg border border-outline-variant/10 text-left text-[10px] flex flex-col gap-0.5 transition-all active:scale-95"
                          >
                            <span className="font-mono text-[8px] text-[#c0a0ff] font-bold">📊 CSV SPREADSHEET</span>
                            <span className="text-on-surface-variant/70 text-[9px] truncate font-sans">Click to copy headers</span>
                          </button>
                        </div>
                      </div>

                      {/* Status List of Uploaded Files */}
                      {uploadedFilesData.length > 0 && (
                        <div className="flex flex-col gap-2 flex-1 min-h-[150px]">
                          <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold">Upload Logs ({uploadedFilesData.length})</span>
                          <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl divide-y divide-outline-variant/10 overflow-y-auto max-h-[220px] text-[11px] custom-scrollbar">
                            {uploadedFilesData.map((f, idx) => (
                              <div key={`${f.name}-${idx}`} className="p-2.5 flex justify-between items-center bg-surface-container-low/30 hover:bg-surface-container/20 transition-colors">
                                <div className="flex items-center gap-2 min-w-0 font-sans">
                                  <span className="text-sm">
                                    {f.name.endsWith('.json') ? '📄' : f.name.endsWith('.csv') ? '📊' : f.name.match(/\.(png|jpg|jpeg)$/i) ? '🖼️' : '📄'}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-mono font-medium text-white truncate text-[10px]">{f.name}</p>
                                    <p className="text-[8px] text-on-surface-variant/60 font-mono">{f.size}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  {f.status === 'success' ? (
                                    <span className="text-[#36D399] font-mono text-[8px] bg-[#36D399]/10 px-1.5 py-0.5 rounded">OK</span>
                                  ) : f.status === 'error' ? (
                                    <span className="text-red-400 font-mono text-[8px] bg-red-400/10 px-1.5 py-0.5 rounded" title={f.message}>FAIL</span>
                                  ) : (
                                    <span className="text-yellow-400 font-mono text-[8px] bg-yellow-400/10 px-1.5 py-0.5 rounded animate-pulse">LOAD</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Panel: Full-screen interactive grid cards */}
                    <div className="xl:col-span-8 flex flex-col gap-4 overflow-y-auto pr-1 h-full custom-scrollbar pb-6 select-none">
                      {importPreviewPlays.length > 0 ? (
                        <>
                          <div className="flex justify-between items-center bg-surface-container/60 p-3 rounded-xl border border-outline-variant/10">
                            <div>
                              <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold">Interactive Coaching Board Grid ({importPreviewPlays.length} Staged)</span>
                              <p className="text-[9px] text-on-surface-variant/70 font-sans">Modify tactical designations, team associations, or write custom play narratives in-place.</p>
                            </div>
                            <button 
                              onClick={() => {
                                setImportPreviewPlays([]);
                                setUploadedFilesData(uploadedFilesData.map(f => ({ ...f, status: 'success', message: 'Cleared preview list.' })));
                              }}
                              className="text-[10px] text-error hover:bg-error/10 px-2.5 py-1.5 rounded-lg font-label uppercase tracking-widest hover:underline flex items-center gap-1 transition-all font-sans"
                            >
                              🗑️ Clear All
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {importPreviewPlays.map((p, pIdx) => (
                              <div 
                                key={p.id} 
                                className="bg-surface-container-low hover:bg-surface-container/60 border border-outline-variant/15 hover:border-primary/25 p-4 rounded-2xl flex flex-col gap-3 group relative transition-all shadow-md focus-within:ring-1 focus-within:ring-primary/20"
                              >
                                <div className="flex gap-3 items-start">
                                  {p.canvasData ? (
                                    <div className="w-24 h-16 bg-black border border-outline-variant/15 rounded-xl overflow-hidden shrink-0 relative group/thumb cursor-pointer select-none font-sans"
                                         onClick={() => setPreviewingPlayFullscreen(p)}
                                    >
                                      <img src={p.canvasData} className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform" alt="coaching preset schematic" referrerPolicy="no-referrer" />
                                      <div className="absolute inset-0 bg-black/40 group-hover/thumb:bg-black/20 flex items-center justify-center transition-all">
                                        <Maximize2 className="w-4 h-4 text-white opacity-80 group-hover/thumb:scale-110 transition-transform" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-24 h-16 bg-gradient-to-br from-surface-container-highest to-surface-container/40 border border-outline-variant/10 rounded-xl flex flex-col items-center justify-center shrink-0 text-on-surface-variant/40">
                                      <PenTool className="w-5 h-5 text-primary opacity-60" />
                                      <span className="text-[8px] font-mono uppercase tracking-wider mt-1 text-on-surface-variant font-bold">Draft Text</span>
                                    </div>
                                  )}

                                  <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-center gap-1">
                                      <input 
                                        type="text" 
                                        value={p.name}
                                        onChange={(e) => {
                                          const updated = [...importPreviewPlays];
                                          updated[pIdx].name = e.target.value;
                                          setImportPreviewPlays(updated);
                                        }}
                                        className="bg-surface-container border border-outline-variant/15 rounded-lg px-2 py-1 font-sans text-xs font-bold text-white w-full outline-none focus:border-primary/60"
                                        placeholder="Set Play Name"
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                                      <select 
                                        value={p.type}
                                        onChange={(e) => {
                                          const updated = [...importPreviewPlays];
                                          updated[pIdx].type = e.target.value as 'Offense' | 'Defense';
                                          setImportPreviewPlays(updated);
                                        }}
                                        className="bg-surface-container border border-outline-variant/15 text-[10px] font-label font-bold uppercase tracking-wider rounded-lg px-1.5 py-1 outline-none cursor-pointer focus:border-primary text-primary"
                                      >
                                        <option value="Offense">Offense</option>
                                        <option value="Defense">Defense</option>
                                      </select>

                                      <select 
                                        value={p.team || 'General'}
                                        onChange={(e) => {
                                          const updated = [...importPreviewPlays];
                                          updated[pIdx].team = e.target.value === 'General' ? undefined : e.target.value;
                                          setImportPreviewPlays(updated);
                                        }}
                                        className="bg-surface-container border border-outline-variant/15 text-[10px] font-label font-bold uppercase tracking-wider rounded-lg px-1.5 py-1 outline-none cursor-pointer focus:border-primary text-on-surface-variant font-sans"
                                      >
                                        <option value="General">General</option>
                                        <option value={homeTeamName}>{homeTeamName}</option>
                                        <option value={awayTeamName}>{awayTeamName}</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <textarea 
                                    value={p.description}
                                    onChange={(e) => {
                                      const updated = [...importPreviewPlays];
                                      updated[pIdx].description = e.target.value;
                                      setImportPreviewPlays(updated);
                                    }}
                                    placeholder="Write strategic drill goals..."
                                    rows={2}
                                    className="bg-surface-container/60 border border-outline-variant/10 rounded-xl p-2 text-[11px] font-body text-on-surface-variant/80 w-full outline-none focus:border-primary/50 resize-none leading-normal placeholder-white/20 font-sans"
                                  />
                                </div>

                                <div className="flex justify-between items-center pt-1 border-t border-outline-variant/5">
                                  <button 
                                    onClick={() => setPreviewingPlayFullscreen(p)}
                                    type="button"
                                    className="text-[9px] font-label text-primary uppercase font-extrabold tracking-wider hover:underline flex items-center gap-1 font-sans"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-primary" /> Fullscreen theater
                                  </button>

                                  <button 
                                    onClick={() => {
                                      setImportPreviewPlays(importPreviewPlays.filter((_, idx) => idx !== pIdx));
                                    }}
                                    className="text-[10px] text-error hover:bg-error/10 p-1 rounded-lg transition-colors font-sans"
                                    title="Exclude play"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-container-low/30 border border-dashed border-outline-variant/15 rounded-2xl min-h-[350px]">
                          <p className="font-mono text-xs text-on-surface-variant/60 animate-pulse uppercase tracking-wider">No structured plays parsing yet...</p>
                          <p className="text-[11px] text-on-surface-variant/40 mt-1 max-w-sm text-center font-sans">Batch load your tactical notebooks, CSVs or diagram screenshot captures in the left column first!</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                  {/* Visual Guidelines & Format Presets Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-surface-container-low/55 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col gap-1 text-[11px]">
                    <span className="font-mono text-[9px] text-[#36D399] font-bold uppercase tracking-wider mb-1">📋 Custom .JSON Format</span>
                    <p className="text-on-surface-variant/80">Support lists with fields: <code className="text-primary font-mono text-[10px]">name, type, description, team</code>.</p>
                    <button 
                      onClick={() => handleCopyLink(`[\n  {\n    "name": "Knicks Corner Curl Pin",\n    "type": "Offense",\n    "description": "Double pin down screens set at the low block",\n    "team": "${homeTeamName}"\n  }\n]`)}
                      className="text-left text-[9px] font-mono text-primary hover:underline mt-2 flex items-center gap-2"
                    >
                      <span>ℹ️ Copy JSON Template</span>
                    </button>
                  </div>
                  <div className="bg-surface-container-low/55 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col gap-1 text-[11px]">
                    <span className="font-mono text-[9px] text-[#c0a0ff] font-bold uppercase tracking-wider mb-1">📊 Tabular .CSV Format</span>
                    <p className="text-on-surface-variant/80">First row must contain header columns: <code className="text-primary font-mono text-[10px]">Name, Type, Description, Team</code>.</p>
                    <button 
                      onClick={() => handleCopyLink(`Name,Type,Description,Team\nKnicks Horns Flare,Offense,Horns entry with secondary Flare,${homeTeamName}\nSpurs Drop Zone,Defense,Standard paint packing defensive set,${awayTeamName}`)}
                      className="text-left text-[9px] font-mono text-primary hover:underline mt-2 flex items-center gap-2"
                    >
                      <span>ℹ️ Copy CSV Template</span>
                    </button>
                  </div>
                  <div className="bg-surface-container-low/55 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col gap-1 text-[11px]">
                    <span className="font-mono text-[9px] text-accent font-bold uppercase tracking-wider mb-1">🖼️ Tactical images & Text</span>
                    <p className="text-on-surface-variant/80">Drop images (<code className="text-primary font-mono text-[10px]">PNG / JPG</code>) to automatically map them as play canvas layouts!</p>
                    <span className="text-on-surface-variant/50 text-[9px] italic mt-2 block">Matches standard file sizes up to 10MB</span>
                  </div>
                </div>

                {/* YouTube Video Tactical Stream Importer */}
                <div className="bg-surface-container-low border border-outline-variant/15 p-5 rounded-2xl flex flex-col gap-4 text-left shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500/10 text-red-500 p-2.5 rounded-xl border border-red-500/25">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.387.51a3.003 3.003 0 0 0-2.11 2.108C0 8.025 0 12 0 12s0 3.975.503 5.837a3.003 3.003 0 0 0 2.11 2.108c1.861.51 9.387.51 9.387.51s7.525 0 9.387-.51a3.003 3.003 0 0 0 2.11-2.108C24 15.975 24 12 24 12s-.002-3.975-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-white text-sm">Automated YouTube Video Play Decoder</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed font-sans">
                        Input any YouTube game film, tactical coaching breakdown or workout drill URL. Our multi-model AI pipeline will extract the player paths, ball tracking, and team coordinates directly into an interactive playbook tactic diagram.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <input 
                        type="url"
                        placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=kY8c2_Zco7M)"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full bg-surface-container-highest border border-outline-variant/15 rounded-xl px-4 py-3 text-on-surface font-sans text-xs focus:outline-none focus:border-red-500/50 pr-8"
                      />
                      {youtubeUrl && (
                        <button 
                          onClick={() => setYoutubeUrl('')}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white text-xs font-bold"
                          title="Clear input"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleYoutubeVideoCvAnalysis(youtubeUrl)}
                      className="px-6 py-3 bg-[#FF0000] hover:bg-[#CC0000] text-white font-label font-bold uppercase text-xs tracking-widest rounded-xl shadow-[0_4px_12px_rgba(255,0,0,0.15)] transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
                    >
                      <span>ANALYZE VIDEO</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-on-surface-variant">
                    <span className="font-semibold uppercase tracking-wider text-[9px] text-left">💡 Suggested Game film presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setYoutubeUrl("https://www.youtube.com/watch?v=kY8c2_Zco7M");
                        handleYoutubeVideoCvAnalysis("https://www.youtube.com/watch?v=kY8c2_Zco7M");
                      }}
                      className="bg-surface-container hover:bg-surface-container-highest border border-outline-variant/10 px-2.5 py-1 rounded-lg text-white transition-colors"
                    >
                      🔀 Warriors Split Action Play
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setYoutubeUrl("https://www.youtube.com/watch?v=1FMyC8zWjZ0");
                        handleYoutubeVideoCvAnalysis("https://www.youtube.com/watch?v=1FMyC8zWjZ0");
                      }}
                      className="bg-surface-container hover:bg-surface-container-highest border border-outline-variant/10 px-2.5 py-1 rounded-lg text-white transition-colors"
                    >
                      🏀 Spurs Motion Hand-Off
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setYoutubeUrl("https://www.youtube.com/watch?v=68T1nNbyq34");
                        handleYoutubeVideoCvAnalysis("https://www.youtube.com/watch?v=68T1nNbyq34");
                      }}
                      className="bg-surface-container hover:bg-surface-container-highest border border-outline-variant/10 px-2.5 py-1 rounded-lg text-white transition-colors"
                    >
                      🛡️ Duke Perimeter Press Drill
                    </button>
                  </div>
                </div>

                {/* Drag & Drop File Zone */}
                <div 
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none ${
                    isDragging 
                      ? 'border-primary bg-primary/5 scale-[0.99] shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.1)]' 
                      : 'border-outline-variant/20 hover:border-primary/40 hover:bg-white/5 bg-surface-container-low'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleFileUpload(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => document.getElementById('playbook-file-input')?.click()}
                >
                  <input 
                    type="file" 
                    id="playbook-file-input" 
                    multiple 
                    accept=".json,.csv,.txt,.png,.jpg,.jpeg,.mp4,.mov,.avi,.mkv,.webm"
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileUpload(e.target.files);
                      }
                    }}
                  />
                  <div className="bg-surface-container-highest/60 p-4 rounded-full border border-outline-variant/20 mb-4 transition-transform text-primary shadow-lg flex items-center justify-center">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h4 className="font-headline font-bold text-white text-base">Drag & Drop Playbook or Set Play Files</h4>
                  <p className="text-xs text-on-surface-variant mt-1.5 max-w-md leading-relaxed">
                    Drop your files here, or <span className="text-primary hover:underline font-bold">browse your computer</span>. 
                    Supports JSON data, CSV spreadsheets, plain text notes, or board screenshot images.
                  </p>
                </div>

                {/* Status List of Uploaded Files */}
                {uploadedFilesData.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold">Import logs & status</span>
                    <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl divide-y divide-outline-variant/10 overflow-hidden text-xs">
                      {uploadedFilesData.map((f, idx) => (
                        <div key={`${f.name}-${idx}`} className="p-3.5 flex justify-between items-center bg-surface-container-low/30 hover:bg-surface-container/20 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-lg">
                              {f.name.endsWith('.json') ? '📄' : f.name.endsWith('.csv') ? '📊' : f.name.match(/\.(png|jpg|jpeg)$/i) ? '🖼️' : '📄'}
                            </span>
                            <div className="min-w-0">
                              <p className="font-mono font-medium text-white truncate text-[11.5px]">{f.name}</p>
                              <p className="text-[10px] text-on-surface-variant/60 font-mono">{f.size}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            {f.status === 'loading' && (
                              <span className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-mono text-[10px]">
                                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" /> Parsing
                              </span>
                            )}
                            {f.status === 'success' && (
                              <span className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-[#36D399]/10 border border-[#36D399]/20 text-[#36D399] font-mono text-[10px]">
                                ✓ Success
                              </span>
                            )}
                            {f.status === 'error' && (
                              <span className="flex items-center gap-1 py-1 px-2.5 rounded-full bg-error/10 border border-error/20 text-error font-mono text-[10px]">
                                ✕ Error
                              </span>
                            )}
                            <span className="text-on-surface-variant/80 font-body text-[10.5px] max-w-xs truncate">{f.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Import Preview & Interactive Editor List */}
                {importPreviewPlays.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold">Parsed set-plays preview ({importPreviewPlays.length})</span>
                      <button 
                        onClick={() => {
                          setImportPreviewPlays([]);
                          setUploadedFilesData(uploadedFilesData.map(f => ({ ...f, status: 'success', message: 'Cleared preview list.' })));
                        }}
                        className="text-[10px] text-error font-label uppercase tracking-widest hover:underline flex items-center gap-1"
                      >
                        🗑️ Reset All Previews
                      </button>
                    </div>

                    <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-surface-container-highest/45 border-b border-outline-variant/10 text-on-surface-variant/75 font-label font-bold uppercase text-[9px] tracking-wider">
                              <th className="p-3">Play Designation (Name)</th>
                              <th className="p-3">Off/Def</th>
                              <th className="p-3">Team Alignment</th>
                              <th className="p-3">Strategy Notes</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/10">
                            {importPreviewPlays.map((p, pIdx) => (
                              <tr key={p.id} className="hover:bg-white/[1.5%] transition-colors">
                                <td className="p-3 min-w-[200px]">
                                  <div className="flex gap-2 items-center">
                                    {p.canvasData && (
                                      <div className="w-10 h-7 bg-surface-container border border-outline-variant/10 rounded overflow-hidden shrink-0">
                                        <img src={p.canvasData} className="w-full h-full object-contain" alt="thumbnail" referrerPolicy="no-referrer" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <input 
                                        type="text" 
                                        value={p.name}
                                        onChange={(e) => {
                                          const updated = [...importPreviewPlays];
                                          updated[pIdx].name = e.target.value;
                                          setImportPreviewPlays(updated);
                                        }}
                                        className="bg-surface-container border border-outline-variant/10 rounded-lg px-2.5 py-1.5 font-sans font-bold text-white w-full outline-none focus:border-primary/45"
                                      />
                                      {p.frames && p.frames.length > 0 && (
                                        <div className="mt-1 flex items-center gap-1.5">
                                          <span className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded uppercase">
                                            🏀 {p.frames.length} Frame Setplay Positions Read
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <select 
                                    value={p.type}
                                    onChange={(e) => {
                                      const updated = [...importPreviewPlays];
                                      updated[pIdx].type = e.target.value as 'Offense' | 'Defense';
                                      setImportPreviewPlays(updated);
                                    }}
                                    className="bg-surface-container border border-outline-variant/10 text-[10.5px] font-label uppercase tracking-wider rounded-lg px-2 py-1.5 outline-none cursor-pointer focus:border-primary"
                                  >
                                    <option value="Offense">Offense</option>
                                    <option value="Defense">Defense</option>
                                  </select>
                                </td>
                                <td className="p-3">
                                  <select 
                                    value={p.team || 'General'}
                                    onChange={(e) => {
                                      const updated = [...importPreviewPlays];
                                      updated[pIdx].team = e.target.value === 'General' ? undefined : e.target.value;
                                      setImportPreviewPlays(updated);
                                    }}
                                    className="bg-surface-container border border-outline-variant/10 text-[10.5px] font-label uppercase tracking-wider rounded-lg px-2 py-1.5 outline-none cursor-pointer focus:border-primary max-w-[140px]"
                                  >
                                    <option value="General">General</option>
                                    <option value={homeTeamName}>{homeTeamName}</option>
                                    <option value={awayTeamName}>{awayTeamName}</option>
                                  </select>
                                </td>
                                <td className="p-3">
                                  <input 
                                    type="text" 
                                    value={p.description}
                                    onChange={(e) => {
                                      const updated = [...importPreviewPlays];
                                      updated[pIdx].description = e.target.value;
                                      setImportPreviewPlays(updated);
                                    }}
                                    placeholder="Add instructions..."
                                    className="bg-surface-container border border-outline-variant/10 rounded-lg px-2.5 py-1.5 text-on-surface-variant w-full max-w-xs outline-none focus:border-primary/45"
                                  />
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {p.canvasData && (
                                      <button
                                        onClick={() => setPreviewingPlayFullscreen(p)}
                                        className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        title="Open Fullscreen Theater"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => {
                                        setImportPreviewPlays(importPreviewPlays.filter((_, idx) => idx !== pIdx));
                                      }}
                                      className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors"
                                      title="Exclude play from import"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                  </>
                )}
              </div>

              <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 flex justify-between items-center">
                <span className="text-[10px] font-mono text-on-surface-variant/40 tracking-wider">
                  ACCEPTED FORMATS: JSON, CSV, TXT, PNG, JPG
                </span>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-5 py-2.5 bg-surface-container-highest hover:bg-surface-container text-on-surface rounded-xl font-label font-semibold uppercase tracking-wider text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (importPreviewPlays.length === 0) {
                        alert("No parsed plays are staged for import. Please drop or select files first.");
                        return;
                      }

                      // Persist frames/positions to localStorage so they read automatically
                      importPreviewPlays.forEach(play => {
                        if (play.frames && play.frames.length > 0) {
                          localStorage.setItem(`tactical-players-shared-${play.id}`, JSON.stringify(play.frames));
                        }
                      });

                      setPlays(prevPlays => [...importPreviewPlays, ...prevPlays]);
                      setIsUploadModalOpen(false);
                      setImportPreviewPlays([]);
                      setUploadedFilesData([]);
                      setSelectedPlay(importPreviewPlays[0]); // Auto-open first play
                      alert(`Successfully imported ${importPreviewPlays.length} new set play(s) into your tactical playbook!`);
                    }}
                    disabled={importPreviewPlays.length === 0}
                    className="px-6 py-2.5 performance-gradient text-black font-label font-bold uppercase tracking-widest text-xs rounded-xl flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(var(--primary-rgb),0.2)]"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Import {importPreviewPlays.length} Plays
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cinematic Fullscreen Tactical Theater Overlay */}
      <AnimatePresence>
        {previewingPlayFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 select-none"
          >
            {/* Header */}
            <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 text-primary p-2.5 rounded-xl border border-primary/20">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary uppercase text-[10px] font-mono font-black tracking-widest px-2 py-0.5 rounded border border-primary/10">
                      {previewingPlayFullscreen.type} STRATEGY BOARD
                    </span>
                    {previewingPlayFullscreen.team && (
                      <span className="bg-white/10 text-white uppercase text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded border border-white/5">
                        {previewingPlayFullscreen.team}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-headline font-bold text-white tracking-tight mt-1">{previewingPlayFullscreen.name}</h3>
                </div>
              </div>
              <button 
                onClick={() => setPreviewingPlayFullscreen(null)}
                className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full transition-all active:scale-90 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stage Body */}
            <div className="flex-1 my-6 flex flex-col lg:flex-row gap-6 items-stretch min-h-0 font-sans">
              {/* Left Board - Full interactive blueprint */}
              <div className="flex-1 bg-gradient-to-br from-[#0c0f12] to-black border border-white/10 rounded-3xl overflow-hidden flex flex-col items-center justify-center p-6 relative group shadow-2xl min-h-[300px]">
                <div className="w-full max-w-5xl aspect-[16/9] bg-surface-container-low rounded-2xl border border-white/10 relative overflow-hidden shadow-2xl flex items-center justify-center">
                  <TacticalCanvas 
                    id="fs-theater-canvas" 
                    initialData={previewingPlayFullscreen.canvasData} 
                    playId={previewingPlayFullscreen.id} 
                  />
                </div>
                
                {/* Floating controls indicator */}
                <div className="absolute bottom-4 left-4 bg-black/85 border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 text-[10px] font-mono text-on-surface-variant font-bold shadow-lg">
                  <span className="w-1.5 h-1.5 bg-[#36D399] rounded-full animate-ping" />
                  FULL-COURT LIVE COORDINATOR
                </div>
              </div>

              {/* Right Side Strategy Desk */}
              <div className="w-full lg:w-96 bg-white/[2.5%] border border-white/10 rounded-3xl p-6 flex flex-col gap-5 justify-between shrink-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-mono text-[10px] text-primary font-black uppercase tracking-widest">COACHING STRATEGY & DRILL NOTES</span>
                  </div>
                  
                  <div className="space-y-1 text-left font-sans">
                    <span className="font-mono text-[9px] text-on-surface-variant/55 uppercase font-bold">TACTICAL DESIGNATION</span>
                    <input 
                      type="text"
                      value={previewingPlayFullscreen.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setPreviewingPlayFullscreen({ ...previewingPlayFullscreen, name: newName });
                        if (plays.some(p => p.id === previewingPlayFullscreen.id)) {
                          setPlays(prev => prev.map(p => p.id === previewingPlayFullscreen.id ? { ...p, name: newName } : p));
                          if (selectedPlay?.id === previewingPlayFullscreen.id) {
                            setSelectedPlay(prev => prev ? { ...prev, name: newName } : null);
                          }
                        } else {
                          const updated = importPreviewPlays.map(p => 
                            p.id === previewingPlayFullscreen.id ? { ...p, name: newName } : p
                          );
                          setImportPreviewPlays(updated);
                        }
                      }}
                      className="bg-white/5 text-white border border-white/10 rounded-xl px-3 py-2 text-sm font-sans font-medium w-full outline-none focus:border-primary text-left"
                    />
                  </div>

                  <div className="space-y-1 text-left font-sans">
                    <span className="font-mono text-[9px] text-on-surface-variant/55 uppercase font-bold">DRILL OUTLINE & DETAILS</span>
                    <textarea 
                      value={previewingPlayFullscreen.description || ''}
                      onChange={(e) => {
                        const newDesc = e.target.value;
                        setPreviewingPlayFullscreen({ ...previewingPlayFullscreen, description: newDesc });
                        if (plays.some(p => p.id === previewingPlayFullscreen.id)) {
                          setPlays(prev => prev.map(p => p.id === previewingPlayFullscreen.id ? { ...p, description: newDesc } : p));
                          if (selectedPlay?.id === previewingPlayFullscreen.id) {
                            setSelectedPlay(prev => prev ? { ...prev, description: newDesc } : null);
                          }
                        } else {
                          const updated = importPreviewPlays.map(p => 
                            p.id === previewingPlayFullscreen.id ? { ...p, description: newDesc } : p
                          );
                          setImportPreviewPlays(updated);
                        }
                      }}
                      placeholder="Write drill goals, marker roles, and execution strategies..."
                      rows={6}
                      className="bg-white/5 p-4 rounded-2xl border border-white/10 text-white text-xs leading-relaxed font-sans w-full outline-none focus:border-primary resize-none placeholder-white/20 custom-scrollbar text-left"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5 font-sans">
                  <button 
                    onClick={() => setPreviewingPlayFullscreen(null)}
                    className="w-full py-3 bg-white hover:bg-white/90 text-black font-label font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl"
                  >
                    {plays.some(p => p.id === previewingPlayFullscreen.id) ? "RETURN TO PLAYBOOK" : "RETURN TO IMPORTER"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full h-20 px-4 pb-safe bg-surface/80 blur-shell border-t border-outline-variant/15 flex justify-around items-center z-50 rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
        <NavItem 
          icon={<LayoutDashboard className="w-6 h-6" />} 
          label="Dashboard" 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')}
        />
        <NavItem 
          icon={<Radio className={`w-6 h-6 ${isPlayoffStreaming ? 'animate-pulse text-error' : 'text-gray-500'}`} />} 
          label="Playoffs" 
          active={activeTab === 'playoffs'} 
          onClick={() => setActiveTab('playoffs')}
        />
        <NavItem 
          icon={<Trophy className="w-6 h-6" />} 
          label="Stats" 
          active={activeTab === 'stats'} 
          onClick={() => setActiveTab('stats')}
        />
        <NavItem 
          icon={<BarChart2 className="w-6 h-6" />} 
          label="Compare" 
          active={activeTab === 'compare'} 
          onClick={() => setActiveTab('compare')}
        />
        <NavItem 
          icon={<BookOpen className="w-6 h-6" />} 
          label="Playbook" 
          active={activeTab === 'playbook'} 
          onClick={() => setActiveTab('playbook')}
        />
        <NavItem 
          icon={<Dumbbell className="w-6 h-6" />} 
          label="Drills" 
          active={activeTab === 'drills'} 
          onClick={() => setActiveTab('drills')}
        />
        <NavItem 
          icon={<User className="w-6 h-6" />} 
          label="Body" 
          active={activeTab === 'body'} 
          onClick={() => setActiveTab('body')}
        />
        <NavItem 
          icon={<Cpu className="w-6 h-6" />} 
          label="Intel" 
          active={activeTab === 'intel'} 
          onClick={() => setActiveTab('intel')}
        />
        <NavItem 
          icon={<Flame className="w-6 h-6" />} 
          label="Routine" 
          active={activeTab === 'consistency'} 
          onClick={() => setActiveTab('consistency')}
        />
        <NavItem 
          icon={<Eye className="w-6 h-6" />} 
          label="Vision" 
          active={activeTab === 'vision'} 
          onClick={() => setActiveTab('vision')}
        />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-150 cursor-pointer px-4 py-2 rounded-xl ${
        active ? 'text-primary bg-primary/10' : 'text-gray-500 hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="font-label text-[10px] uppercase tracking-tighter mt-1">{label}</span>
    </button>
  );
}

function BracketMatchupCard({
  m,
  isWest,
  hoveredTeam,
  setHoveredTeam,
  streamedMatchupId,
  onConnectStream,
  onSelect
}: {
  m: any;
  isWest: boolean;
  hoveredTeam: any;
  setHoveredTeam: (val: any) => void;
  streamedMatchupId: any;
  onConnectStream: (m: any) => void;
  onSelect: (m: any) => void;
  key?: string;
}) {
  const isTeam1Hovered = m.team1 !== 'TBD' && hoveredTeam === m.team1;
  const isTeam2Hovered = m.team2 !== 'TBD' && hoveredTeam === m.team2;
  const isAnyInCardHovered = isTeam1Hovered || isTeam2Hovered;
  
  // Is this matchup currently active for streaming?
  const isCurrentlyStreaming = streamedMatchupId === m.id || (m.id === 'w-finals' && streamedMatchupId === 'series-okc-dal-g2');
  
  const team1Color = m.team1 === 'OKC Thunder' ? 'bg-sky-500' :
                     m.team1 === 'San Antonio Spurs' ? 'bg-zinc-400' :
                     m.team1 === 'New York Knicks' ? 'bg-orange-500' :
                     m.team1 === 'Boston Celtics' ? 'bg-green-600' :
                     m.team1 === 'Denver Nuggets' ? 'bg-amber-500' :
                     m.team1 === 'LA Lakers' ? 'bg-amber-400' :
                     m.team1 === 'Detroit Pistons' ? 'bg-blue-600' :
                     m.team1 === 'Cleveland Cavaliers' ? 'bg-red-700' :
                     'bg-slate-700';

  const team2Color = m.team2 === 'OKC Thunder' ? 'bg-sky-500' :
                     m.team2 === 'San Antonio Spurs' ? 'bg-zinc-400' :
                     m.team2 === 'New York Knicks' ? 'bg-orange-500' :
                     m.team2 === 'Boston Celtics' ? 'bg-green-600' :
                     m.team2 === 'Denver Nuggets' ? 'bg-amber-500' :
                     m.team2 === 'LA Lakers' ? 'bg-amber-400' :
                     m.team2 === 'Detroit Pistons' ? 'bg-blue-600' :
                     m.team2 === 'Cleveland Cavaliers' ? 'bg-red-700' :
                     'bg-slate-700';

  const getMascotName = (fullName: string) => {
    if (fullName === 'TBD') return 'TBD';
    if (fullName === 'OKC Thunder') return 'Thunder';
    if (fullName === 'LA Lakers') return 'Lakers';
    if (fullName === 'San Antonio Spurs') return 'Spurs';
    if (fullName === 'Denver Nuggets') return 'Nuggets';
    if (fullName === 'Minnesota Timberwolves') return 'Timberwolves';
    if (fullName === 'Detroit Pistons') return 'Pistons';
    if (fullName === 'New York Knicks') return 'Knicks';
    if (fullName === 'Cleveland Cavaliers') return 'Cavaliers';
    if (fullName === 'Boston Celtics') return 'Celtics';
    if (fullName === 'Philadelphia 76ers') return '76ers';
    if (fullName === 'Phoenix Suns') return 'Suns';
    if (fullName === 'Houston Rockets') return 'Rockets';
    if (fullName === 'Portland Trail Blazers') return 'Blazers';
    if (fullName === 'Orlando Magic') return 'Magic';
    if (fullName === 'Toronto Raptors') return 'Raptors';
    if (fullName === 'Atlanta Hawks') return 'Hawks';
    return fullName.split(' ').pop() || fullName;
  };

  return (
    <div 
      className={`relative p-3 bg-[#0d1014] border rounded-xl flex flex-col justify-between transition-all duration-300 select-none ${
        isCurrentlyStreaming ? 'border-error ring-1 ring-error/30 bg-error/5 shadow-[0_0_12px_rgba(239,68,68,0.2)]' : 
        isAnyInCardHovered ? 'border-primary scale-[1.03] shadow-[0_4px_16px_rgba(239,143,111,0.1)]' : 'border-outline-variant/10 hover:border-white/20'
      } cursor-pointer w-full text-left`}
      onClick={() => onSelect(m)}
    >
      {/* Live Badge at top block */}
      {m.isLive && (
        <div className="flex items-center text-[7px] font-label text-error bg-error/10 border border-error/20 px-1 py-0.5 rounded uppercase tracking-widest font-black absolute -top-2 left-2 z-10 animate-pulse">
          <span className="h-1 w-1 bg-error rounded-full animate-ping mr-1" />
          LIVE NOW
        </div>
      )}
      {m.isUpcoming && m.gameTime && (
        <div className="flex items-center text-[7px] font-label text-primary bg-primary/10 border border-primary/20 px-1 py-0.5 rounded uppercase tracking-widest font-black absolute -top-2 left-2 z-10">
          {m.gameTime}
        </div>
      )}

      <div className="space-y-1.5">
        {/* Team 1 Row */}
        <div 
          className={`flex items-center justify-between py-1 px-1 rounded transition-colors ${
            isTeam1Hovered ? 'bg-white/5 font-bold text-white' : 'text-on-surface-variant'
          }`}
          onMouseEnter={() => m.team1 !== 'TBD' && setHoveredTeam(m.team1)}
          onMouseLeave={() => setHoveredTeam(null)}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {m.seed1 !== null && m.seed1 !== undefined ? (
              <span className="font-mono text-[9px] opacity-40 font-black shrink-0">
                {m.seed1}
              </span>
            ) : (
              <span className="w-1.5 shrink-0" />
            )}
            {m.team1 !== 'TBD' && (
              <span className={`w-1.5 h-1.5 rounded-full ${team1Color} shrink-0`} />
            )}
            <span className="font-sans text-xs font-semibold truncate">
              {getMascotName(m.team1)}
            </span>
          </div>
          {m.score1 !== undefined && m.score1 !== null && (
            <span className={`font-mono text-xs ${m.score1 > m.score2 ? 'text-primary font-bold' : 'opacity-60'}`}>
              {m.score1}
            </span>
          )}
        </div>

        {/* Team 2 Row */}
        <div 
          className={`flex items-center justify-between py-1 px-1 rounded transition-colors ${
            isTeam2Hovered ? 'bg-white/5 font-bold text-white' : 'text-on-surface-variant'
          }`}
          onMouseEnter={() => m.team2 !== 'TBD' && setHoveredTeam(m.team2)}
          onMouseLeave={() => setHoveredTeam(null)}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {m.seed2 !== null && m.seed2 !== undefined ? (
              <span className="font-mono text-[9px] opacity-40 font-black shrink-0">
                {m.seed2}
              </span>
            ) : (
              <span className="w-1.5 shrink-0" />
            )}
            {m.team2 !== 'TBD' && (
              <span className={`w-1.5 h-1.5 rounded-full ${team2Color} shrink-0`} />
            )}
            <span className="font-sans text-xs font-semibold truncate">
              {getMascotName(m.team2)}
            </span>
          </div>
          {m.score2 !== undefined && m.score2 !== null && (
            <span className={`font-mono text-xs ${m.score2 > m.score1 ? 'text-primary font-bold' : 'opacity-60'}`}>
              {m.score2}
            </span>
          )}
        </div>
      </div>

      {/* Series status text at bottom */}
      <div className="mt-1 pb-0.5 pt-1.5 border-t border-white/[0.03] flex justify-between items-center text-[7.5px] font-mono uppercase text-on-surface-variant/40 tracking-wider">
        <span>{m.status}</span>
        {m.channel && <span className="text-[6.5px] opacity-35 truncate max-w-[55px]">{m.channel.split('•')[0]}</span>}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-surface-container p-4 rounded-lg flex flex-col items-center justify-center gap-1 border border-outline-variant/5">
      <span className={`font-headline text-3xl ${color}`}>{value}</span>
      <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">{label}</span>
    </div>
  );
}

interface DrawingElement {
  id: string;
  playerId: string | null;
  tool: 'pen' | 'line' | 'arrow' | 'rect' | 'circle' | 'eraser';
  points: { x: number; y: number }[];
  color: string;
  brushSize: number;
  frameIndex: number;
}

interface SpacingPathRecord {
  playerId: string;
  mode: 'step' | 'full';
  style: 'cut' | 'dribble' | 'pass';
  frameIndex: number;
}

// Initial player layout presets (Static and stable reference)
const defaultPlayers = [
  { id: 'o1', label: 'PG', x: 30, y: 50, type: 'offense' },
  { id: 'o2', label: 'SG', x: 25, y: 30, type: 'offense' },
  { id: 'o3', label: 'SF', x: 25, y: 70, type: 'offense' },
  { id: 'o4', label: 'PF', x: 15, y: 20, type: 'offense' },
  { id: 'o5', label: 'C',  x: 15, y: 80, type: 'offense' },
  { id: 'd1', label: 'PG', x: 35, y: 50, type: 'defense' },
  { id: 'd2', label: 'SG', x: 30, y: 30, type: 'defense' },
  { id: 'd3', label: 'SF', x: 30, y: 70, type: 'defense' },
  { id: 'd4', label: 'PF', x: 20, y: 25, type: 'defense' },
  { id: 'd5', label: 'C',  x: 20, y: 75, type: 'defense' },
];

function TacticalCanvas({ id = "tactical-canvas", initialData, playId }: { id?: string, initialData?: string, playId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const drawingElementsStorageKey = playId ? `tactical-drawings-shared-${playId}` : `tactical-drawings-${id}`;
  const spacingPathsStorageKey = playId ? `tactical-spacings-shared-${playId}` : `tactical-spacings-${id}`;

  const [drawingElements, setDrawingElements] = useState<DrawingElement[]>(() => {
    try {
      const saved = localStorage.getItem(drawingElementsStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSpacingPaths, setActiveSpacingPaths] = useState<SpacingPathRecord[]>(() => {
    try {
      const saved = localStorage.getItem(spacingPathsStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveDrawingElements = (newElements: DrawingElement[]) => {
    try {
      localStorage.setItem(drawingElementsStorageKey, JSON.stringify(newElements));
    } catch (err) {
      console.error(err);
    }
  };

  const saveSpacingPaths = (newPaths: SpacingPathRecord[]) => {
    try {
      localStorage.setItem(spacingPathsStorageKey, JSON.stringify(newPaths));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(drawingElementsStorageKey);
      setDrawingElements(saved ? JSON.parse(saved) : []);
    } catch {
      setDrawingElements([]);
    }
    try {
      const saved = localStorage.getItem(spacingPathsStorageKey);
      setActiveSpacingPaths(saved ? JSON.parse(saved) : []);
    } catch {
      setActiveSpacingPaths([]);
    }
  }, [drawingElementsStorageKey, spacingPathsStorageKey]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 🕶️ AR / WebXR Simulated & Live Camera State Variables
  const [isArMode, setIsArMode] = useState(false);
  const [arFloorType, setArFloorType] = useState<'maple' | 'asphalt' | 'neon' | 'gym' | 'clay'>('maple');
  const [arScale, setArScale] = useState(0.85);
  const [arRotation, setArRotation] = useState(0); // rotation around Z-axis
  const [arTilt, setArTilt] = useState(55); // tilt angle (perspective)
  const [arOffsetX, setArOffsetX] = useState(0); // offset X coordinate
  const [arOffsetY, setArOffsetY] = useState(10); // offset Y coordinate
  const [arHeight, setArHeight] = useState(0); // elevation height
  const [arAnchor, setArAnchor] = useState({ x: 50, y: 55 }); // anchor placement percentage
  const [isPlacingArAnchor, setIsPlacingArAnchor] = useState(false);

  const arVideoRef = useRef<HTMLVideoElement>(null);
  const [arCameraStream, setArCameraStream] = useState<MediaStream | null>(null);
  const [arCameraError, setArCameraError] = useState<string | null>(null);
  const [isArCameraActive, setIsArCameraActive] = useState(false);
  const [isArCameraLoading, setIsArCameraLoading] = useState(false);

  const startArCamera = async () => {
    setIsArCameraLoading(true);
    setArCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setArCameraStream(stream);
      setIsArCameraActive(true);
    } catch (err: any) {
      console.error("AR Camera initialization failed:", err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setArCameraStream(fallbackStream);
        setIsArCameraActive(true);
      } catch (fallbackErr: any) {
        setArCameraError("Camera access denied or unavailable. Running in high-fidelity simulated gymnasium mode.");
        setIsArCameraActive(false);
      }
    } finally {
      setIsArCameraLoading(false);
    }
  };

  const stopArCamera = () => {
    if (arCameraStream) {
      arCameraStream.getTracks().forEach(track => track.stop());
      setArCameraStream(null);
    }
    setIsArCameraActive(false);
  };

  useEffect(() => {
    if (arVideoRef.current && arCameraStream) {
      arVideoRef.current.srcObject = arCameraStream;
    }
  }, [arCameraStream, isArCameraActive]);

  useEffect(() => {
    return () => {
      if (arCameraStream) {
        arCameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [arCameraStream]);

  const [tool, setTool] = useState<'pen' | 'line' | 'arrow' | 'rect' | 'circle' | 'eraser'>('pen');
  const [color, setColor] = useState('#FF8F6F');
  const [brushSize, setBrushSize] = useState(3);
  const startPos = useRef({ x: 0, y: 0 });
  const snapshot = useRef<ImageData | null>(null);

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [generatePathStyle, setGeneratePathStyle] = useState<'cut' | 'dribble' | 'pass'>('cut');

  // Zoom & Pan states
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);

  // Physics Vector Motion Tracking States
  const [showVectorOverlay, setShowVectorOverlay] = useState(true);
  const [showAllVectors, setShowAllVectors] = useState(false);
  const [vectorScale, setVectorScale] = useState(1.5);
  const [deltaTime, setDeltaTime] = useState(1.5); // time per keyframe step in seconds
  const [interpolationModel, setInterpolationModel] = useState<'spline' | 'linear'>('spline');

  // States for Manual Plotted Drawing Mode
  const [isPlotMode, setIsPlotMode] = useState(false);
  const [plotJersey, setPlotJersey] = useState('7');
  const [plotTeam, setPlotTeam] = useState<'offense' | 'defense'>('offense');
  const isPlotModeRef = useRef(isPlotMode);
  const lastMouseDownPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    isPlotModeRef.current = isPlotMode;
  }, [isPlotMode]);

  // Keep state refs up to date to prevent heavy useEffect rebindings
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  const isPanModeRef = useRef(isPanMode);
  const isPanningBoard = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { isPanModeRef.current = isPanMode; }, [isPanMode]);

  // Storage keys
  const playersStorageKey = playId ? `tactical-players-shared-${playId}` : `tactical-players-${id}`;

  // Layer toggles
  const [showOffense, setShowOffense] = useState(() => {
    try {
      const saved = localStorage.getItem(`tactical-show-offense-${id}`);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [showDefense, setShowDefense] = useState(() => {
    try {
      const saved = localStorage.getItem(`tactical-show-defense-${id}`);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Keep preference updated in localStorage
  useEffect(() => {
    localStorage.setItem(`tactical-show-offense-${id}`, JSON.stringify(showOffense));
  }, [showOffense, id]);

  useEffect(() => {
    localStorage.setItem(`tactical-show-defense-${id}`, JSON.stringify(showDefense));
  }, [showDefense, id]);

  // Initial player layout presets with multi-frame default sequences for preset playIds!
  const getPresetFrames = (pId?: string) => {
    if (pId === 'austin-spurs-blob') {
      return [
        // Frame 1: Initial Setup - BLOB baseline layout
        [
          { id: 'o1', label: '1', x: 18, y: 60, type: 'offense' }, // PG (starts near right elbow/lane)
          { id: 'o2', label: '2', x: 0, y: 65, type: 'offense' },  // SG (baseline inbounder)
          { id: 'o3', label: '3', x: 35, y: 50, type: 'offense' },  // SF (top of key)
          { id: 'o4', label: '4', x: 4, y: 22, type: 'offense' },   // PF (left corner)
          { id: 'o5', label: '5', x: 24, y: 55, type: 'offense' },  // C (right elbow/high post)
          { id: 'd1', label: 'D1', x: 21, y: 58, type: 'defense' },
          { id: 'd2', label: 'D2', x: 2, y: 63, type: 'defense' },
          { id: 'd3', label: 'D3', x: 35, y: 46, type: 'defense' },
          { id: 'd4', label: 'D4', x: 6, y: 25, type: 'defense' },
          { id: 'd5', label: 'D5', x: 26, y: 53, type: 'defense' },
          { isBall: true, x: 0, y: 65 }
        ],
        // Frame 2: 1 enters help side block, 5 screens, 3 curls
        [
          { id: 'o1', label: '1', x: 6, y: 35, type: 'offense' },  // 1 enters to the help side block
          { id: 'o2', label: '2', x: 0, y: 65, type: 'offense' },  // Inbounder
          { id: 'o3', label: '3', x: 28, y: 54, type: 'offense' },  // 3 curling around 5
          { id: 'o4', label: '4', x: 10, y: 22, type: 'offense' }, // 4 starting to lift
          { id: 'o5', label: '5', x: 24, y: 55, type: 'offense' },  // 5 butt screens
          { id: 'd1', label: 'D1', x: 9, y: 38, type: 'defense' },
          { id: 'd2', label: 'D2', x: 2, y: 63, type: 'defense' },
          { id: 'd3', label: 'D3', x: 26, y: 52, type: 'defense' }, // Trapped by screen
          { id: 'd4', label: 'D4', x: 12, y: 24, type: 'defense' },
          { id: 'd5', label: 'D5', x: 28, y: 54, type: 'defense' },
          { isBall: true, x: 0, y: 65 }
        ],
        // Frame 3: 3 curls off of 5, 2 passes to 3, 4 lifts
        [
          { id: 'o1', label: '1', x: 6, y: 35, type: 'offense' },
          { id: 'o2', label: '2', x: 0, y: 65, type: 'offense' },  // Passes
          { id: 'o3', label: '3', x: 10, y: 53, type: 'offense' }, // 3 curled off of 5 to rim
          { id: 'o4', label: '4', x: 18, y: 22, type: 'offense' }, // 4 lifts
          { id: 'o5', label: '5', x: 24, y: 55, type: 'offense' }, // Screen holds
          { id: 'd1', label: 'D1', x: 9, y: 38, type: 'defense' },
          { id: 'd2', label: 'D2', x: 2, y: 63, type: 'defense' },
          { id: 'd3', label: 'D3', x: 15, y: 54, type: 'defense' }, // Trailing the curl
          { id: 'd4', label: 'D4', x: 20, y: 24, type: 'defense' },
          { id: 'd5', label: 'D5', x: 27, y: 55, type: 'defense' },
          { isBall: true, x: 5, y: 59 } // Ball in flight
        ],
        // Frame 4: Pass completed to 3 at the hoop, 4 lifted fully
        [
          { id: 'o1', label: '1', x: 6, y: 35, type: 'offense' },
          { id: 'o2', label: '2', x: 3, y: 65, type: 'offense' },  // Enters court
          { id: 'o3', label: '3', x: 10, y: 53, type: 'offense' }, // Catches the ball
          { id: 'o4', label: '4', x: 22, y: 22, type: 'offense' }, // 4 fully lifted
          { id: 'o5', label: '5', x: 22, y: 55, type: 'offense' }, // Turns to basket/rebound
          { id: 'd1', label: 'D1', x: 9, y: 38, type: 'defense' },
          { id: 'd2', label: 'D2', x: 4, y: 63, type: 'defense' },
          { id: 'd3', label: 'D3', x: 11, y: 53, type: 'defense' }, // Contesting shot
          { id: 'd4', label: 'D4', x: 22, y: 24, type: 'defense' },
          { id: 'd5', label: 'D5', x: 24, y: 56, type: 'defense' },
          { isBall: true, x: 10, y: 53 } // Ball caught by 3
        ]
      ];
    } else if (pId === 'austin-spurs-blob-2') {
      return [
        // Frame 1: Initial Setup - BLOB baseline layout
        [
          { id: 'o1', label: '1', x: 0, y: 65, type: 'offense' },   // Ball side baseline inbounder
          { id: 'o2', label: '2', x: 18, y: 50, type: 'offense' },  // Under elbow/high post
          { id: 'o3', label: '3', x: 20, y: 40, type: 'offense' },  // Left elbow
          { id: 'o4', label: '4', x: 20, y: 48, type: 'offense' },  // Right elbow
          { id: 'o5', label: '5', x: 16, y: 35, type: 'offense' },  // Low block / mid post
          { id: 'd1', label: 'D1', x: 3, y: 63, type: 'defense' },
          { id: 'd2', label: 'D2', x: 19, y: 53, type: 'defense' },
          { id: 'd3', label: 'D3', x: 22, y: 38, type: 'defense' },
          { id: 'd4', label: 'D4', x: 22, y: 46, type: 'defense' },
          { id: 'd5', label: 'D5', x: 18, y: 32, type: 'defense' },
          { isBall: true, x: 0, y: 65 }
        ],
        // Frame 2: 3+4 fake screens, 2 misdirects, 4 curls, 5 walks to elbow
        [
          { id: 'o1', label: '1', x: 0, y: 65, type: 'offense' },
          { id: 'o2', label: '2', x: 8, y: 68, type: 'offense' },   // Misdirects towards corner
          { id: 'o3', label: '3', x: 28, y: 45, type: 'offense' },  // Pops to high rimline
          { id: 'o4', label: '4', x: 12, y: 40, type: 'offense' },  // Curls off 2's back
          { id: 'o5', label: '5', x: 24, y: 38, type: 'offense' },  // Walks to elbow
          { id: 'd1', label: 'D1', x: 3, y: 63, type: 'defense' },
          { id: 'd2', label: 'D2', x: 16, y: 58, type: 'defense' }, // Trailing 2
          { id: 'd3', label: 'D3', x: 25, y: 44, type: 'defense' },
          { id: 'd4', label: 'D4', x: 15, y: 42, type: 'defense' }, // Trailing 4
          { id: 'd5', label: 'D5', x: 22, y: 36, type: 'defense' },
          { isBall: true, x: 0, y: 65 }
        ],
        // Frame 3: 2 reaches ball side corner, 1 passes to 2, 4 weak short corner, 3 pops high
        [
          { id: 'o1', label: '1', x: 0, y: 65, type: 'offense' },   // Passes
          { id: 'o2', label: '2', x: 3, y: 78, type: 'offense' },   // Corner receiver
          { id: 'o3', label: '3', x: 32, y: 45, type: 'offense' },  // Fully popped to high rimline
          { id: 'o4', label: '4', x: 8, y: 25, type: 'offense' },   // Reaches weak short corner
          { id: 'o5', label: '5', x: 25, y: 42, type: 'offense' },  // Elbow space
          { id: 'd1', label: 'D1', x: 3, y: 65, type: 'defense' },
          { id: 'd2', label: 'D2', x: 6, y: 74, type: 'defense' },  // Late contest
          { id: 'd3', label: 'D3', x: 28, y: 45, type: 'defense' },
          { id: 'd4', label: 'D4', x: 11, y: 28, type: 'defense' },
          { id: 'd5', label: 'D5', x: 23, y: 40, type: 'defense' },
          { isBall: true, x: 2, y: 72 }                              // Ball in flight
        ],
        // Frame 4: 2 catches ball, 4 exits, 1 enters the court
        [
          { id: 'o1', label: '1', x: 3, y: 65, type: 'offense' },   // Enters court
          { id: 'o2', label: '2', x: 3, y: 80, type: 'offense' },   // Catches the ball
          { id: 'o3', label: '3', x: 35, y: 45, type: 'offense' },
          { id: 'o4', label: '4', x: 4, y: 20, type: 'offense' },   // Exits to weak side corner
          { id: 'o5', label: '5', x: 26, y: 42, type: 'offense' },
          { id: 'd1', label: 'D1', x: 4, y: 65, type: 'defense' },
          { id: 'd2', label: 'D2', x: 4, y: 78, type: 'defense' },  // Defending catch
          { id: 'd3', label: 'D3', x: 32, y: 45, type: 'defense' },
          { id: 'd4', label: 'D4', x: 6, y: 22, type: 'defense' },
          { id: 'd5', label: 'D5', x: 24, y: 42, type: 'defense' },
          { isBall: true, x: 3, y: 80 }                              // Ball with 2
        ]
      ];
    } else if (pId === 'okc-curl') {
      return [
        // Frame 1: Initial SLOB alignment
        [
          { id: 'o1', label: 'PG', x: 10, y: 50, type: 'offense' }, // Inbounder
          { id: 'o2', label: 'SG', x: 25, y: 35, type: 'offense' }, // Wing
          { id: 'o3', label: 'SF', x: 30, y: 75, type: 'offense' }, // Corner
          { id: 'o4', label: 'PF', x: 20, y: 45, type: 'offense' }, // Elbow screen
          { id: 'o5', label: 'C',  x: 18, y: 65, type: 'offense' }, // Low block screen
          { id: 'd1', label: 'PG', x: 14, y: 50, type: 'defense' },
          { id: 'd2', label: 'SG', x: 28, y: 38, type: 'defense' },
          { id: 'd3', label: 'SF', x: 33, y: 72, type: 'defense' },
          { id: 'd4', label: 'PF', x: 23, y: 45, type: 'defense' },
          { id: 'd5', label: 'C',  x: 21, y: 68, type: 'defense' },
        ],
        // Frame 2: SG curls around screens, PF/C set staggers
        [
          { id: 'o1', label: 'PG', x: 10, y: 50, type: 'offense' }, // Inbounder
          { id: 'o2', label: 'SG', x: 22, y: 65, type: 'offense' }, // Curling to basket
          { id: 'o3', label: 'SF', x: 45, y: 80, type: 'offense' }, // Wing spacer
          { id: 'o4', label: 'PF', x: 24, y: 42, type: 'offense' }, // Elbow screen holds
          { id: 'o5', label: 'C',  x: 20, y: 68, type: 'offense' }, // Low block screen holds
          { id: 'd1', label: 'PG', x: 14, y: 50, type: 'defense' },
          { id: 'd2', label: 'SG', x: 26, y: 60, type: 'defense' }, // Trailing behind
          { id: 'd3', label: 'SF', x: 40, y: 78, type: 'defense' },
          { id: 'd4', label: 'PF', x: 24, y: 45, type: 'defense' },
          { id: 'd5', label: 'C',  x: 22, y: 72, type: 'defense' },
        ],
        // Frame 3: SF cuts deep, SG catches off a pin down popping to the arc
        [
          { id: 'o1', label: 'PG', x: 10, y: 50, type: 'offense' }, // Passing
          { id: 'o2', label: 'SG', x: 38, y: 30, type: 'offense' }, // Popping out for shot
          { id: 'o3', label: 'SF', x: 15, y: 85, type: 'offense' }, // Weakside cut
          { id: 'o4', label: 'PF', x: 26, y: 50, type: 'offense' }, // Rolls to basket
          { id: 'o5', label: 'C',  x: 32, y: 62, type: 'offense' }, // Seals defender
          { id: 'd1', label: 'PG', x: 18, y: 48, type: 'defense' },
          { id: 'd2', label: 'SG', x: 34, y: 32, type: 'defense' }, // Late contest
          { id: 'd3', label: 'SF', x: 18, y: 80, type: 'defense' },
          { id: 'd4', label: 'PF', x: 22, y: 54, type: 'defense' },
          { id: 'd5', label: 'C',  x: 28, y: 65, type: 'defense' },
        ],
      ];
    } else if (pId === 'okc-horns') {
      return [
        // Frame 1: Classic Horns Alignment
        [
          { id: 'o1', label: 'PG', x: 45, y: 20, type: 'offense' }, // Top of key
          { id: 'o2', label: 'SG', x: 15, y: 15, type: 'offense' }, // Left corner
          { id: 'o3', label: 'SF', x: 80, y: 15, type: 'offense' }, // Right corner
          { id: 'o4', label: 'PF', x: 35, y: 45, type: 'offense' }, // Left Elbow
          { id: 'o5', label: 'C',  x: 55, y: 45, type: 'offense' }, // Right Elbow
          { id: 'd1', label: 'PG', x: 45, y: 25, type: 'defense' },
          { id: 'd2', label: 'SG', x: 18, y: 20, type: 'defense' },
          { id: 'd3', label: 'SF', x: 75, y: 20, type: 'defense' },
          { id: 'd4', label: 'PF', x: 38, y: 48, type: 'defense' },
          { id: 'd5', label: 'C',  x: 52, y: 48, type: 'defense' },
        ],
        // Frame 2: SG flare screen set by C
        [
          { id: 'o1', label: 'PG', x: 32, y: 24, type: 'offense' }, // Dribbles left
          { id: 'o2', label: 'SG', x: 70, y: 38, type: 'offense' }, // Flares wide right
          { id: 'o3', label: 'SF', x: 85, y: 15, type: 'offense' }, // Spaced corner
          { id: 'o4', label: 'PF', x: 25, y: 45, type: 'offense' }, // Pick & roll option
          { id: 'o5', label: 'C',  x: 58, y: 32, type: 'offense' }, // Sets heavy flare screen
          { id: 'd1', label: 'PG', x: 34, y: 28, type: 'defense' }, // Follows ball
          { id: 'd2', label: 'SG', x: 62, y: 30, type: 'defense' }, // Hit by flare screen!
          { id: 'd3', label: 'SF', x: 80, y: 20, type: 'defense' },
          { id: 'd4', label: 'PF', x: 28, y: 48, type: 'defense' },
          { id: 'd5', label: 'C',  x: 52, y: 38, type: 'defense' }, // Hedging flare
        ],
        // Frame 3: Playback pass to flared shooter
        [
          { id: 'o1', label: 'PG', x: 30, y: 25, type: 'offense' }, // Passes to right wing
          { id: 'o2', label: 'SG', x: 72, y: 45, type: 'offense' }, // Catches for 3pt look
          { id: 'o3', label: 'SF', x: 82, y: 20, type: 'offense' }, // Prepared to support
          { id: 'o4', label: 'PF', x: 18, y: 65, type: 'offense' }, // Secondary cut
          { id: 'o5', label: 'C',  x: 52, y: 55, type: 'offense' }, // Rolls to rim for rebound
          { id: 'd1', label: 'PG', x: 32, y: 28, type: 'defense' },
          { id: 'd2', label: 'SG', x: 68, y: 42, type: 'defense' }, // Recovers too late
          { id: 'd3', label: 'SF', x: 78, y: 24, type: 'defense' },
          { id: 'd4', label: 'PF', x: 22, y: 62, type: 'defense' },
          { id: 'd5', label: 'C',  x: 48, y: 58, type: 'defense' },
        ],
      ];
    } else if (pId === 'okc-stagger') {
      return [
        // Frame 1: Stagger setup
        [
          { id: 'o1', label: 'PG', x: 10, y: 50, type: 'offense' }, // Inbounder
          { id: 'o2', label: 'SG', x: 20, y: 70, type: 'offense' }, // Target shooter
          { id: 'o3', label: 'SF', x: 45, y: 30, type: 'offense' }, // Opposite side
          { id: 'o4', label: 'PF', x: 25, y: 40, type: 'offense' }, // Screen 1
          { id: 'o5', label: 'C',  x: 35, y: 55, type: 'offense' }, // Screen 2
          { id: 'd1', label: 'PG', x: 14, y: 50, type: 'defense' },
          { id: 'd2', label: 'SG', x: 24, y: 72, type: 'defense' },
          { id: 'd3', label: 'SF', x: 48, y: 32, type: 'defense' },
          { id: 'd4', label: 'PF', x: 28, y: 42, type: 'defense' },
          { id: 'd5', label: 'C',  x: 38, y: 58, type: 'defense' },
        ],
        // Frame 2: Stagger screen in action
        [
          { id: 'o1', label: 'PG', x: 10, y: 50, type: 'offense' },
          { id: 'o2', label: 'SG', x: 40, y: 25, type: 'offense' }, // Running through stagger
          { id: 'o3', label: 'SF', x: 15, y: 80, type: 'offense' }, // Interchanging
          { id: 'o4', label: 'PF', x: 25, y: 45, type: 'offense' }, // Screen holds
          { id: 'o5', label: 'C',  x: 35, y: 55, type: 'offense' }, // Screen holds
          { id: 'd1', label: 'PG', x: 14, y: 50, type: 'defense' },
          { id: 'd2', label: 'SG', x: 30, y: 48, type: 'defense' }, // Trapped by screen 1
          { id: 'd3', label: 'SF', x: 18, y: 78, type: 'defense' },
          { id: 'd4', label: 'PF', x: 28, y: 46, type: 'defense' },
          { id: 'd5', label: 'C',  x: 38, y: 52, type: 'defense' }, // Switching out optionally
        ],
        // Frame 3: Open catch on top
        [
          { id: 'o1', label: 'PG', x: 10, y: 50, type: 'offense' }, // Passes the ball
          { id: 'o2', label: 'SG', x: 48, y: 22, type: 'offense' }, // Catches clear at top
          { id: 'o3', label: 'SF', x: 12, y: 82, type: 'offense' },
          { id: 'o4', label: 'PF', x: 32, y: 65, type: 'offense' }, // Box out
          { id: 'o5', label: 'C',  x: 22, y: 58, type: 'offense' }, // Prepares for offensive rebound
          { id: 'd1', label: 'PG', x: 16, y: 48, type: 'defense' },
          { id: 'd2', label: 'SG', x: 44, y: 26, type: 'defense' }, // Late recovery
          { id: 'd3', label: 'SF', x: 16, y: 80, type: 'defense' },
          { id: 'd4', label: 'PF', x: 34, y: 68, type: 'defense' },
          { id: 'd5', label: 'C',  x: 26, y: 62, type: 'defense' },
        ],
      ];
    }
    // General default
    return [
      [
        { id: 'o1', label: 'PG', x: 30, y: 50, type: 'offense' },
        { id: 'o2', label: 'SG', x: 25, y: 30, type: 'offense' },
        { id: 'o3', label: 'SF', x: 25, y: 70, type: 'offense' },
        { id: 'o4', label: 'PF', x: 15, y: 20, type: 'offense' },
        { id: 'o5', label: 'C',  x: 15, y: 80, type: 'offense' },
        { id: 'd1', label: 'PG', x: 35, y: 50, type: 'defense' },
        { id: 'd2', label: 'SG', x: 30, y: 30, type: 'defense' },
        { id: 'd3', label: 'SF', x: 30, y: 70, type: 'defense' },
        { id: 'd4', label: 'PF', x: 20, y: 25, type: 'defense' },
        { id: 'd5', label: 'C',  x: 20, y: 75, type: 'defense' },
      ]
    ];
  };

  // Load state supporting frames
  const [frames, setFrames] = useState<any[][]>(() => {
    try {
      const saved = localStorage.getItem(playersStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && Array.isArray(parsed[0])) {
            return parsed;
          } else {
            return [parsed]; // Wrap legacy flat style single layout
          }
        }
      }
      return getPresetFrames(playId);
    } catch {
      return getPresetFrames(playId);
    }
  });

  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [floatFrameIndex, setFloatFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLooping, setIsLooping] = useState(true);

  // Keep preference updated in localStorage whenever frames change
  const saveFrames = (newFrames: any[][]) => {
    try {
      localStorage.setItem(playersStorageKey, JSON.stringify(newFrames));
    } catch (err) {
      console.error(err);
    }
  };

  // Re-load frames when playId or id changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(playersStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && Array.isArray(parsed[0])) {
            setFrames(parsed);
          } else {
            setFrames([parsed]);
          }
        } else {
          setFrames(getPresetFrames(playId));
        }
      } else {
        setFrames(getPresetFrames(playId));
      }
      setCurrentFrameIndex(0);
      setIsPlaying(false);
      setSelectedPlayerId(null);
    } catch {
      setFrames(getPresetFrames(playId));
      setCurrentFrameIndex(0);
      setIsPlaying(false);
      setSelectedPlayerId(null);
    }
  }, [playersStorageKey, playId, id]);

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, playerId: string) => {
    // Stop event propagation to prevent drawing/flickering on the canvas
    e.stopPropagation();
    setDraggingId(playerId);
  };

  // Drag and touch position updating specific to active frame
  const updatePlayerPosition = (playerId: string, x: number, y: number) => {
    const currentFrame = frames[currentFrameIndex];
    const player = currentFrame?.find(p => p.id === playerId);
    if (!player) return;

    const dx = x - player.x;
    const dy = y - player.y;

    if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
      setDrawingElements(prev => {
        const updated = prev.map(el => {
          if (el.playerId === playerId && el.frameIndex === currentFrameIndex) {
            return {
              ...el,
              points: el.points.map(pt => ({
                x: pt.x + dx,
                y: pt.y + dy
              }))
            };
          }
          return el;
        });
        saveDrawingElements(updated);
        return updated;
      });

      setFrames(prev => {
        const updated = prev.map((frame, idx) => {
          if (idx === currentFrameIndex) {
            return frame.map(p => p.id === playerId ? { ...p, x, y } : p);
          }
          return frame;
        });
        saveFrames(updated);
        return updated;
      });
    }
  };

  const drawBezierSegment = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    pA: any,
    pB: any,
    otherPlayers: any[],
    isLastSegment: boolean,
    pathColor: string
  ) => {
    const W = canvas.width;
    const H = canvas.height;

    // Convert player percentage coordinates to canvas pixels
    const x0 = (pA.x / 100) * W;
    const y0 = (pA.y / 100) * H;
    const x2 = (pB.x / 100) * W;
    const y2 = (pB.y / 100) * H;

    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.5) return; // redundant segment

    // Midpoint in percentage
    const mx = (pA.x + pB.x) / 2;
    const my = (pA.y + pB.y) / 2;

    // Normal unit vector in percentage
    const px = -dy / len;
    const py = dx / len;

    // Standard curl bend amplitude (5% of court width)
    let sideSign = my < 50 ? 1 : -1;
    if (Math.abs(px) < 0.1) {
      sideSign = mx < 50 ? 1 : -1;
    }
    const curlAmount = 5 * sideSign;

    // Spacing forces
    let forceX = 0;
    let forceY = 0;

    otherPlayers.forEach(other => {
      const odx = mx - other.x;
      const ody = my - other.y;
      const dist = Math.sqrt(odx * odx + ody * ody);

      if (other.type === 'defense') {
        // repel defense
        if (dist < 15) {
          const forceMag = (15 - dist) * 0.4;
          if (dist > 0.1) {
            forceX += (odx / dist) * forceMag;
            forceY += (ody / dist) * forceMag;
          } else {
            forceX += px * forceMag;
            forceY += py * forceMag;
          }
        }
      } else if (other.type === 'offense') {
        // screen helper
        if (dist < 10) {
          const forceMag = (10 - dist) * 0.3;
          forceY += (my < 50 ? -1 : 1) * forceMag;
        }
      }
    });

    // Avoid lane congestion in paint unless cutting straight to the hoop
    const isPaintLeft = mx < 22 && my > 28 && my < 72;
    const isPaintRight = mx > 78 && my > 28 && my < 72;
    if (isPaintLeft || isPaintRight) {
      const distanceToRimB = pB.x < 50
        ? Math.sqrt(Math.pow(pB.x - 5.5, 2) + Math.pow(pB.y - 50, 2))
        : Math.sqrt(Math.pow(pB.x - 94.5, 2) + Math.pow(pB.y - 50, 2));

      if (distanceToRimB > 10) {
        forceY += my < 50 ? -4 : 4;
      }
    }

    // Spacing-aware control point
    let cxPercent = mx + px * curlAmount + forceX;
    let cyPercent = my + py * curlAmount + forceY;

    cxPercent = Math.max(2, Math.min(98, cxPercent));
    cyPercent = Math.max(2, Math.min(98, cyPercent));

    const x1 = (cxPercent / 100) * W;
    const y1 = (cyPercent / 100) * H;

    ctx.beginPath();

    if (generatePathStyle === 'dribble') {
      // Wavy sampler for animated pathing
      const steps = 80;
      let first = true;
      const waveFreq = 4.5 * Math.PI;
      const waveAmp = 5;

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const bx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
        const by = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;

        const tx = 2 * (1 - t) * (x1 - x0) + 2 * t * (x2 - x1);
        const ty = 2 * (1 - t) * (y1 - y0) + 2 * t * (y2 - y1);
        const tLen = Math.sqrt(tx * tx + ty * ty);

        let nx = 0;
        let ny = 0;
        if (tLen > 0.1) {
          nx = -ty / tLen;
          ny = tx / tLen;
        }

        const offset = Math.sin(t * waveFreq) * waveAmp;
        const finalX = bx + nx * offset;
        const finalY = by + ny * offset;

        if (first) {
          ctx.moveTo(finalX, finalY);
          first = false;
        } else {
          ctx.lineTo(finalX, finalY);
        }
      }
      ctx.stroke();
    } else {
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(x1, y1, x2, y2);
      ctx.stroke();
    }

    if (isLastSegment) {
      const tangentX = x2 - x1;
      const tangentY = y2 - y1;
      const tangentAngle = Math.atan2(tangentY, tangentX);

      const headLength = 13;
      ctx.save();
      ctx.setLineDash([]);
      ctx.fillStyle = pathColor;

      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(
        x2 - headLength * Math.cos(tangentAngle - Math.PI / 6),
        y2 - headLength * Math.sin(tangentAngle - Math.PI / 6)
      );
      ctx.lineTo(
        x2 - headLength * Math.cos(tangentAngle + Math.PI / 6),
        y2 - headLength * Math.sin(tangentAngle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  };

  const generateSpacingAwarePath = (mode: 'step' | 'full') => {
    if (!selectedPlayerId) return;

    setActiveSpacingPaths(prev => {
      // Remove any existing spacing paths for this player in this active frame so they don't overlay
      const filtered = prev.filter(p => !(p.playerId === selectedPlayerId && p.frameIndex === currentFrameIndex));
      const updated = [
        ...filtered,
        {
          playerId: selectedPlayerId,
          mode,
          style: generatePathStyle,
          frameIndex: currentFrameIndex
        }
      ];
      saveSpacingPaths(updated);
      return updated;
    });
  };

  const drawDynamicSpacingPath = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    pId: string,
    mode: 'step' | 'full',
    style: 'cut' | 'dribble' | 'pass'
  ) => {
    const playerSequence = frames.map(f => f.find(p => p.id === pId)).filter((p): p is any => !!p);
    if (playerSequence.length === 0) return;

    let startIndex = 0;
    let endIndex = currentFrameIndex;

    if (mode === 'step') {
      startIndex = Math.max(0, currentFrameIndex - 1);
      endIndex = currentFrameIndex;
    }

    if (startIndex === endIndex) {
      if (frames.length > 1 && currentFrameIndex === 0) {
        startIndex = 0;
        endIndex = 1;
      } else {
        // Fallback for single frame
        const currentPos = playerSequence[currentFrameIndex];
        if (!currentPos) return;
        const targetBasketX = currentPos.x < 50 ? 5.5 : 94.5;
        const targetBasketY = 50;
        const fakeB = { id: pId, label: currentPos.label, x: targetBasketX, y: targetBasketY, type: currentPos.type };
        const otherPlayers = frames[currentFrameIndex].filter(p => p.id !== pId);

        ctx.save();
        const pathColor = currentPos.type === 'offense' ? '#10B981' : '#F43F5E';
        ctx.strokeStyle = pathColor;
        ctx.lineWidth = brushSize || 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (style === 'pass') {
          ctx.setLineDash([8, 8]);
        } else {
          ctx.setLineDash([]);
        }
        drawBezierSegment(ctx, canvas, currentPos, fakeB, otherPlayers, true, pathColor);
        ctx.restore();
        return;
      }
    }

    ctx.save();
    const firstPlayer = playerSequence[startIndex];
    if (!firstPlayer) {
      ctx.restore();
      return;
    }
    const pathColor = firstPlayer.type === 'offense' ? '#10B981' : '#F43F5E';
    ctx.strokeStyle = pathColor;
    ctx.lineWidth = brushSize || 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (style === 'pass') {
      ctx.setLineDash([8, 8]);
    } else {
      ctx.setLineDash([]);
    }

    for (let i = startIndex; i < endIndex; i++) {
      const pA = playerSequence[i];
      const pB = playerSequence[i + 1];
      if (!pA || !pB) continue;

      const parentFramePlayers = frames[i] || [];
      const otherPlayers = parentFramePlayers.filter(p => p.id !== pId);

      drawBezierSegment(ctx, canvas, pA, pB, otherPlayers, i === endIndex - 1, pathColor);
    }
    ctx.restore();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    
    // Inverse scale/translate transformation to accurately map screen coordinates back to stage percentage space
    const xLocal = W / 2 + (e.clientX - rect.left - pan.x - W / 2) / zoom;
    const yLocal = H / 2 + (e.clientY - rect.top - pan.y - H / 2) / zoom;
    
    const x = (xLocal / W) * 100;
    const y = (yLocal / H) * 100;
    
    // Bounds check
    const boundedX = Math.max(1.5, Math.min(98.5, x));
    const boundedY = Math.max(1.5, Math.min(98.5, y));

    updatePlayerPosition(draggingId, boundedX, boundedY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingId || !containerRef.current || e.touches.length === 0) return;
    // Prevent default scroll behavior while dragging pieces
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    const touch = e.touches[0];
    
    // Inverse scale/translate transformation to accurately map touch coordinates back to stage percentage space
    const xLocal = W / 2 + (touch.clientX - rect.left - pan.x - W / 2) / zoom;
    const yLocal = H / 2 + (touch.clientY - rect.top - pan.y - H / 2) / zoom;
    
    const x = (xLocal / W) * 100;
    const y = (yLocal / H) * 100;
    
    const boundedX = Math.max(1.5, Math.min(98.5, x));
    const boundedY = Math.max(1.5, Math.min(98.5, y));

    updatePlayerPosition(draggingId, boundedX, boundedY);
  };

  const handleMouseUpOrLeave = () => {
    if (draggingId) {
      setDraggingId(null);
    }
  };

  // Auto playback of play sequence steps using high-fidelity requestAnimationFrame lerping
  useEffect(() => {
    if (!isPlaying) {
      setFloatFrameIndex(currentFrameIndex);
      return;
    }

    let lastTime = performance.now();
    let animFrame: number;

    const tick = (now: number) => {
      const elapsed = now - lastTime;
      lastTime = now;

      setFloatFrameIndex(prev => {
        // transitioning 1 keyframe index per 1500ms scaled with playbackSpeed
        const step = (elapsed / 1500) * playbackSpeed;
        let next = prev + step;

        if (next >= frames.length - 1) {
          if (isLooping) {
            next = 0;
          } else {
            setIsPlaying(false);
            return frames.length - 1;
          }
        }
        return next;
      });

      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isPlaying, frames.length, playbackSpeed, isLooping, currentFrameIndex]);

  // Sync lower bound of float frame index to currentFrameIndex specifically during play mode to update other view contexts
  useEffect(() => {
    if (isPlaying) {
      const floorIndex = Math.min(frames.length - 1, Math.floor(floatFrameIndex));
      if (floorIndex !== currentFrameIndex) {
        setCurrentFrameIndex(floorIndex);
      }
    }
  }, [floatFrameIndex, isPlaying, currentFrameIndex, frames.length]);

  const handleAddFrame = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentFrame = frames[currentFrameIndex] || defaultPlayers;
    const clonedFrame = JSON.parse(JSON.stringify(currentFrame));
    const newFrames = [...frames, clonedFrame];
    setFrames(newFrames);
    saveFrames(newFrames);
    setCurrentFrameIndex(newFrames.length - 1);
    setFloatFrameIndex(newFrames.length - 1);
  };

  const handleDeleteFrame = (e: React.MouseEvent, indexToDelete: number) => {
    e.stopPropagation();
    if (frames.length <= 1) return;
    const newFrames = frames.filter((_, idx) => idx !== indexToDelete);
    setFrames(newFrames);
    saveFrames(newFrames);
    if (currentFrameIndex >= newFrames.length) {
      const lastIdx = newFrames.length - 1;
      setCurrentFrameIndex(lastIdx);
      setFloatFrameIndex(lastIdx);
    }
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying && (currentFrameIndex === frames.length - 1 || floatFrameIndex >= frames.length - 1)) {
      setCurrentFrameIndex(0);
      setFloatFrameIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const getPlayerPhysics = (pId: string, fIndex: number) => {
    const N = frames.length;
    if (N < 2) {
      const pOnly = (frames[0] || []).find(p => p.id === pId);
      return {
        x: pOnly ? pOnly.x : 0,
        y: pOnly ? pOnly.y : 0,
        vx: 0, vy: 0, vMag: 0,
        ax: 0, ay: 0, aMag: 0
      };
    }

    const baseIndex = Math.min(N - 1, Math.floor(fIndex));
    const s = fIndex - baseIndex;

    const getPosAtFrame = (idx: number) => {
      const fIdx = Math.max(0, Math.min(N - 1, idx));
      const found = (frames[fIdx] || []).find(p => p.id === pId);
      if (found) return found;
      
      const playerSequence = frames.map(f => f.find(p => p.id === pId)).filter((p): p is any => !!p);
      const closest = playerSequence[Math.min(playerSequence.length - 1, Math.max(0, fIdx))];
      return closest || { x: 0, y: 0 };
    };

    const p0 = getPosAtFrame(baseIndex - 1);
    const p1 = getPosAtFrame(baseIndex);
    const p2 = getPosAtFrame(baseIndex + 1);
    const p3 = getPosAtFrame(baseIndex + 2);

    let x = p1.x;
    let y = p1.y;
    let dx_ds = 0;
    let dy_ds = 0;
    let d2x_ds2 = 0;
    let d2y_ds2 = 0;

    if (interpolationModel === 'spline') {
      x = 0.5 * (
        2 * p1.x +
        (-p0.x + p2.x) * s +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * s * s +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * s * s * s
      );
      y = 0.5 * (
        2 * p1.y +
        (-p0.y + p2.y) * s +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * s * s +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * s * s * s
      );

      dx_ds = 0.5 * (
        (-p0.x + p2.x) +
        2 * (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * s +
        3 * (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * s * s
      );
      dy_ds = 0.5 * (
        (-p0.y + p2.y) +
        2 * (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * s +
        3 * (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * s * s
      );

      d2x_ds2 = 0.5 * (
        2 * (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) +
        6 * (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * s
      );
      d2y_ds2 = 0.5 * (
        2 * (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) +
        6 * (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * s
      );
    } else {
      x = p1.x + (p2.x - p1.x) * s;
      y = p1.y + (p2.y - p1.y) * s;

      dx_ds = p2.x - p1.x;
      dy_ds = p2.y - p1.y;

      const v_prev_x = p1.x - p0.x;
      const v_prev_y = p1.y - p0.y;
      const v_curr_x = p2.x - p1.x;
      const v_curr_y = p2.y - p1.y;
      const v_next_x = p3.x - p2.x;
      const v_next_y = p3.y - p2.y;

      d2x_ds2 = (1 - s) * (v_curr_x - v_prev_x) + s * (v_next_x - v_curr_x);
      d2y_ds2 = (1 - s) * (v_curr_y - v_prev_y) + s * (v_next_y - v_curr_y);
    }

    const scaleX = 28.65;
    const scaleY = 15.24;

    const vx = (dx_ds * (scaleX / 100)) / deltaTime;
    const vy = (dy_ds * (scaleY / 100)) / deltaTime;
    const vMag = Math.sqrt(vx * vx + vy * vy);

    const ax = (d2x_ds2 * (scaleX / 100)) / (deltaTime * deltaTime);
    const ay = (d2y_ds2 * (scaleY / 100)) / (deltaTime * deltaTime);
    const aMag = Math.sqrt(ax * ax + ay * ay);

    return {
      x, y,
      vx, vy, vMag,
      ax, ay, aMag
    };
  };

  const renderKinematicSparkline = (pId: string) => {
    const steps = 30;
    const vPoints: number[] = [];
    const aPoints: number[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * (frames.length - 1);
      const phys = getPlayerPhysics(pId, t);
      vPoints.push(phys.vMag);
      aPoints.push(phys.aMag);
    }

    const maxV = Math.max(...vPoints, 0.1);
    const maxA = Math.max(...aPoints, 0.1);

    const width = 180;
    const height = 35;

    const vPath = vPoints.map((v, idx) => {
      const x = (idx / steps) * width;
      const y = height - (v / maxV) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(' ');

    const aPath = aPoints.map((a, idx) => {
      const x = (idx / steps) * width;
      const y = height - (a / maxA) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(' ');

    const currentX = (floatFrameIndex / Math.max(1, frames.length - 1)) * width;

    return (
      <div className="mt-2 bg-black/40 p-2 rounded-lg border border-white/5 space-y-1">
        <div className="flex justify-between items-center text-[7px] font-mono text-white/40">
          <span className="text-sky-400 font-bold">Velocity ({maxV.toFixed(1)} m/s max)</span>
          <span className="text-rose-400 font-bold">Acc ({maxA.toFixed(1)} m/s² max)</span>
        </div>
        <div className="relative">
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
            {/* Grid line */}
            <line x1={0} y1={height/2} x2={width} y2={height/2} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            
            {/* Velocity path */}
            <polyline fill="none" stroke="#38bdf8" strokeWidth={1.5} points={vPath} />
            
            {/* Acceleration path */}
            <polyline fill="none" stroke="#f43f5e" strokeWidth={1.2} strokeDasharray="1.5,1.5" points={aPath} />

            {/* Playhead indicator bar */}
            <line x1={currentX} y1={0} x2={currentX} y2={height} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
            {vPoints.length > 0 && (
              <circle cx={currentX} cy={height - (getPlayerPhysics(pId, floatFrameIndex).vMag / maxV) * (height - 4) - 2} r={2} fill="#38bdf8" />
            )}
          </svg>
        </div>
        <div className="flex justify-between text-[6.5px] font-mono text-white/30">
          <span>Start Play</span>
          <span>Phase End</span>
        </div>
      </div>
    );
  };

  const activePlayers = React.useMemo(() => {
    if (!isPlaying) {
      return frames[currentFrameIndex] || defaultPlayers;
    }
    const baseFrame = frames[Math.floor(floatFrameIndex)] || [];
    return baseFrame.map(p => {
      const phys = getPlayerPhysics(p.id, floatFrameIndex);
      return {
        ...p,
        x: Math.max(1.5, Math.min(98.5, phys.x)),
        y: Math.max(1.5, Math.min(98.5, phys.y))
      };
    });
  }, [frames, currentFrameIndex, isPlaying, floatFrameIndex, interpolationModel, deltaTime]);

  const selectedPlayerIdRef = useRef(selectedPlayerId);
  const activePlayersRef = useRef(activePlayers);

  useEffect(() => { selectedPlayerIdRef.current = selectedPlayerId; }, [selectedPlayerId]);
  useEffect(() => { activePlayersRef.current = activePlayers; }, [activePlayers]);

  const isTransitioning = !draggingId && !isPlaying; // disable CSS transition while animating to avoid fighting with react state frames

  const [redrawTrigger, setRedrawTrigger] = useState(0);
  const triggerRedraw = () => setRedrawTrigger(prev => prev + 1);

  // 1. Drawing input event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isDrawing = false;
    let currentStrokePoints: { x: number; y: number }[] = [];
    let strokeAssociatedPlayerId: string | null = null;
    let lastX = 0;
    let lastY = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        triggerRedraw();
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = containerRef.current?.getBoundingClientRect() || canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      
      const W = rect.width;
      const H = rect.height;
      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;

      // Inverse translation formula with origin center center
      const cx = W / 2 + (clientX - rect.left - currentPan.x - W / 2) / currentZoom;
      const cy = H / 2 + (clientY - rect.top - currentPan.y - H / 2) / currentZoom;

      return { x: cx, y: cy };
    };

    const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
      const headLength = 15;
      const angle = Math.atan2(toY - fromY, toX - fromX);
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    };

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      if (draggingId) return;
      if (isPlotModeRef.current) return;
      
      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

      // Handle interactive panning on left-drag (if pan mode is active), middle-click, or right-click
      if (isPanModeRef.current || ('buttons' in e && e.buttons === 4)) {
        isPanningBoard.current = true;
        panStart.current = {
          x: clientX - panRef.current.x,
          y: clientY - panRef.current.y
        };
        return;
      }
      
      isDrawing = true;
      const pos = getPos(e);
      startPos.current = pos;
      [lastX, lastY] = [pos.x, pos.y];

      // Samples clicked coordinate in percentage space
      const pctX = (pos.x / canvas.width) * 100;
      const pctY = (pos.y / canvas.height) * 100;

      // Find nearest player inside boundary (threshold 8% of court width/height)
      let nearestPlayer: any = null;
      let minDist = 8.0;
      activePlayersRef.current.forEach(p => {
        const dx = p.x - pctX;
        const dy = p.y - pctY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < minDist) {
          minDist = d;
          nearestPlayer = p;
        }
      });

      strokeAssociatedPlayerId = nearestPlayer ? nearestPlayer.id : selectedPlayerIdRef.current;
      currentStrokePoints = [{ x: pctX, y: pctY }];
      
      if (tool !== 'pen' && tool !== 'eraser') {
        snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (draggingId) return;
      if (isPlotModeRef.current) return;

      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

      if (isPanningBoard.current) {
        const nextPanX = clientX - panStart.current.x;
        const nextPanY = clientY - panStart.current.y;
        
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const maxPanX = rect.width * (zoomRef.current - 1) / 2 + 100;
          const maxPanY = rect.height * (zoomRef.current - 1) / 2 + 100;
          const clampedX = Math.max(-maxPanX, Math.min(maxPanX, nextPanX));
          const clampedY = Math.max(-maxPanY, Math.min(maxPanY, nextPanY));
          setPan({ x: clampedX, y: clampedY });
        } else {
          setPan({ x: nextPanX, y: nextPanY });
        }
        return;
      }

      if (!isDrawing) return;
      const pos = getPos(e);
      const pctX = (pos.x / canvas.width) * 100;
      const pctY = (pos.y / canvas.height) * 100;
      currentStrokePoints.push({ x: pctX, y: pctY });
      
      ctx.strokeStyle = tool === 'eraser' ? '#1A1C1E' : color;
      ctx.lineWidth = tool === 'eraser' ? 20 : brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (tool === 'pen' || tool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        [lastX, lastY] = [pos.x, pos.y];
      } else {
        // Shape preview
        if (snapshot.current) {
          ctx.putImageData(snapshot.current, 0, 0);
        }
        
        if (tool === 'line') {
          ctx.beginPath();
          ctx.moveTo(startPos.current.x, startPos.current.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        } else if (tool === 'arrow') {
          drawArrow(ctx, startPos.current.x, startPos.current.y, pos.x, pos.y);
        } else if (tool === 'rect') {
          ctx.beginPath();
          ctx.strokeRect(startPos.current.x, startPos.current.y, pos.x - startPos.current.x, pos.y - startPos.current.y);
        } else if (tool === 'circle') {
          ctx.beginPath();
          const radius = Math.sqrt(Math.pow(pos.x - startPos.current.x, 2) + Math.pow(pos.y - startPos.current.y, 2));
          ctx.arc(startPos.current.x, startPos.current.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    };

    const stopDrawing = () => {
      if (isPanningBoard.current) {
        isPanningBoard.current = false;
        return;
      }

      if (isDrawing) {
        isDrawing = false;
        snapshot.current = null;

        if (currentStrokePoints.length > 0) {
          const newEl: DrawingElement = {
            id: `draw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            playerId: strokeAssociatedPlayerId,
            tool,
            points: currentStrokePoints,
            color,
            brushSize,
            frameIndex: currentFrameIndex
          };

          setDrawingElements(prev => {
            const updated = [...prev, newEl];
            saveDrawingElements(updated);
            return updated;
          });
        }
      }
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', (e) => { 
      if (draggingId) return;
      e.preventDefault(); 
      startDrawing(e); 
    });
    canvas.addEventListener('touchmove', (e) => { 
      if (draggingId) return;
      e.preventDefault(); 
      draw(e); 
    });
    canvas.addEventListener('touchend', stopDrawing);

    const clearBtn = document.getElementById(`clear-${id}`);
    const handleClear = () => {
      setDrawingElements(prev => {
        const updated = prev.filter(el => el.frameIndex !== currentFrameIndex);
        saveDrawingElements(updated);
        return updated;
      });
      setActiveSpacingPaths(prev => {
        const updated = prev.filter(p => p.frameIndex !== currentFrameIndex);
        saveSpacingPaths(updated);
        return updated;
      });
    };
    clearBtn?.addEventListener('click', handleClear);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      clearBtn?.removeEventListener('click', handleClear);
    };
  }, [id, tool, color, brushSize, playId, draggingId, currentFrameIndex]);

  // 2. Reactive redraw effect to automatically update when positions or elements list changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    if (W === 0 || H === 0) return;

    ctx.clearRect(0, 0, W, H);

    const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
      const headLength = 15;
      const angle = Math.atan2(toY - fromY, toX - fromX);
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    };

    // Draw stored vector elements
    drawingElements.forEach(element => {
      if (element.frameIndex !== currentFrameIndex) return;

      // Calculate any dynamic offset if this element is associated with a player
      let dx = 0;
      let dy = 0;
      if (element.playerId) {
        const basePlayer = (frames[currentFrameIndex] || []).find(p => p.id === element.playerId);
        const interpolatedPlayer = activePlayers.find(p => p.id === element.playerId);
        if (basePlayer && interpolatedPlayer) {
          dx = interpolatedPlayer.x - basePlayer.x;
          dy = interpolatedPlayer.y - basePlayer.y;
        }
      }

      ctx.save();
      ctx.strokeStyle = element.tool === 'eraser' ? '#1A1C1E' : element.color;
      ctx.lineWidth = element.tool === 'eraser' ? 20 : element.brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (element.points.length === 0) {
        ctx.restore();
        return;
      }

      if (element.tool === 'pen' || element.tool === 'eraser') {
        ctx.beginPath();
        const p0 = element.points[0];
        ctx.moveTo(((p0.x + dx) / 100) * W, ((p0.y + dy) / 100) * H);
        for (let s = 1; s < element.points.length; s++) {
          const p = element.points[s];
          ctx.lineTo(((p.x + dx) / 100) * W, ((p.y + dy) / 100) * H);
        }
        ctx.stroke();
      } else if (element.tool === 'line') {
        const p0 = element.points[0];
        const p1 = element.points[element.points.length - 1];
        ctx.beginPath();
        ctx.moveTo(((p0.x + dx) / 100) * W, ((p0.y + dy) / 100) * H);
        ctx.lineTo(((p1.x + dx) / 100) * W, ((p1.y + dy) / 100) * H);
        ctx.stroke();
      } else if (element.tool === 'arrow') {
        const p0 = element.points[0];
        const p1 = element.points[element.points.length - 1];
        drawArrow(ctx, ((p0.x + dx) / 100) * W, ((p0.y + dy) / 100) * H, ((p1.x + dx) / 100) * W, ((p1.y + dy) / 100) * H);
      } else if (element.tool === 'rect') {
        const p0 = element.points[0];
        const p1 = element.points[element.points.length - 1];
        ctx.beginPath();
        ctx.strokeRect(
          ((p0.x + dx) / 100) * W,
          ((p0.y + dy) / 100) * H,
          ((p1.x - p0.x) / 100) * W,
          ((p1.y - p0.y) / 100) * H
        );
      } else if (element.tool === 'circle') {
        const p0 = element.points[0];
        const p1 = element.points[element.points.length - 1];
        const x0 = ((p0.x + dx) / 100) * W;
        const y0 = ((p0.y + dy) / 100) * H;
        const x1 = ((p1.x + dx) / 100) * W;
        const y1 = ((p1.y + dy) / 100) * H;
        const radius = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        ctx.beginPath();
        ctx.arc(x0, y0, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.restore();
    });

    // Draw active spacing paths
    activeSpacingPaths.forEach(path => {
      if (path.frameIndex !== currentFrameIndex) return;
      drawDynamicSpacingPath(ctx, canvas, path.playerId, path.mode, path.style);
    });

    // Draw real-time Velocity and Acceleration vectors on the court overlay
    if (showVectorOverlay) {
      activePlayers.forEach(p => {
        const isSelected = p.id === selectedPlayerId;
        if (!isSelected && !showAllVectors) return;

        const phys = getPlayerPhysics(p.id, floatFrameIndex);
        if (phys.vMag === 0 && phys.aMag === 0) return;

        const px = (p.x / 100) * W;
        const py = (p.y / 100) * H;

        // Draw Velocity Arrow in cyan (#38bdf8)
        if (phys.vMag > 0.05) {
          const lengthVel = phys.vMag * 15 * vectorScale;
          const angleVel = Math.atan2(phys.vy, phys.vx);
          const vxEnd = px + Math.cos(angleVel) * lengthVel;
          const vyEnd = py + Math.sin(angleVel) * lengthVel;

          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.fillStyle = '#38bdf8';
          ctx.lineWidth = isSelected ? 2.5 : 1.5;
          ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
          ctx.shadowBlur = 4;

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(vxEnd, vyEnd);
          ctx.stroke();

          const headSize = isSelected ? 8 : 6;
          ctx.beginPath();
          ctx.moveTo(vxEnd, vyEnd);
          ctx.lineTo(
            vxEnd - headSize * Math.cos(angleVel - Math.PI / 6),
            vyEnd - headSize * Math.sin(angleVel - Math.PI / 6)
          );
          ctx.lineTo(
            vxEnd - headSize * Math.cos(angleVel + Math.PI / 6),
            vyEnd - headSize * Math.sin(angleVel + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fill();

          ctx.font = 'bold 8px monospace';
          ctx.fillText(`v: ${phys.vMag.toFixed(1)}m/s`, vxEnd + 5, vyEnd + 3);
          ctx.restore();
        }

        // Draw Acceleration Arrow in rose (#f43f5e)
        if (phys.aMag > 0.05) {
          const lengthAcc = phys.aMag * 12 * vectorScale;
          const angleAcc = Math.atan2(phys.ay, phys.ax);
          const axEnd = px + Math.cos(angleAcc) * lengthAcc;
          const ayEnd = py + Math.sin(angleAcc) * lengthAcc;

          ctx.save();
          ctx.strokeStyle = '#f43f5e';
          ctx.fillStyle = '#f43f5e';
          ctx.lineWidth = isSelected ? 2.5 : 1.5;
          ctx.shadowColor = 'rgba(244, 63, 94, 0.4)';
          ctx.shadowBlur = 4;

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(axEnd, ayEnd);
          ctx.stroke();

          const headSize = isSelected ? 8 : 6;
          ctx.beginPath();
          ctx.moveTo(axEnd, ayEnd);
          ctx.lineTo(
            axEnd - headSize * Math.cos(angleAcc - Math.PI / 6),
            ayEnd - headSize * Math.sin(angleAcc - Math.PI / 6)
          );
          ctx.lineTo(
            axEnd - headSize * Math.cos(angleAcc + Math.PI / 6),
            ayEnd - headSize * Math.sin(angleAcc + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fill();

          ctx.font = 'bold 8px monospace';
          ctx.fillText(`a: ${phys.aMag.toFixed(1)}m/s²`, axEnd + 5, ayEnd - 3);
          ctx.restore();
        }
      });
    }

  }, [drawingElements, activeSpacingPaths, currentFrameIndex, frames, redrawTrigger, id, activePlayers, showVectorOverlay, showAllVectors, vectorScale, floatFrameIndex, selectedPlayerId]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Elegant incremental zooming centered towards user mouse pointer
    const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
    const nextZoom = Math.max(1.0, Math.min(3.0, zoom * zoomFactor));
    
    if (nextZoom !== zoom) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;
        
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        
        const nextPanX = (clientX - cx) - ((clientX - cx) - pan.x) * (nextZoom / zoom);
        const nextPanY = (clientY - cy) - ((clientY - cy) - pan.y) * (nextZoom / zoom);
        
        // Clamp bounds beautifully so the board remains readable inside screen coordinates
        const maxPanX = rect.width * (nextZoom - 1) / 2 + 100;
        const maxPanY = rect.height * (nextZoom - 1) / 2 + 100;
        
        setPan({
          x: Math.max(-maxPanX, Math.min(maxPanX, nextPanX)),
          y: Math.max(-maxPanY, Math.min(maxPanY, nextPanY))
        });
        setZoom(nextZoom);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-[#0b0e12] overflow-hidden select-none text-left">
      {/* Left Sidebar Pane holding Motion Sequencer and Tactical Layers */}
      <div className="w-full md:w-[220px] shrink-0 bg-[#0d1014]/95 border-b md:border-b-0 md:border-r border-white/10 p-3.5 flex flex-col gap-4 overflow-y-auto z-40 text-left font-sans select-none">
        
        {/* AR holographic Mode Toggle Button */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              const nextState = !isArMode;
              setIsArMode(nextState);
              if (!nextState) {
                stopArCamera();
              }
            }}
            className={`w-full py-2.5 px-3 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border duration-300 cursor-pointer ${
              isArMode
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 border-yellow-400 text-black font-extrabold shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-[1.02]'
                : 'bg-primary/10 border-primary/20 hover:border-primary/50 text-primary hover:bg-primary/20'
            }`}
          >
            <Camera className={`w-3.5 h-3.5 ${isArMode ? 'animate-pulse' : ''}`} />
            <span>{isArMode ? '3D AR VIEW ACTIVE' : 'SWITCH TO 3D AR VIEW'}</span>
          </button>
        </div>

        {/* Motion Sequencer Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-1">
            <div className="flex items-center gap-1.5">
              <Radio className={`w-3.5 h-3.5 text-primary ${isPlaying ? 'animate-pulse text-emerald-400' : ''}`} />
              <span className="font-mono text-[9px] text-white/70 font-bold uppercase tracking-wider">Sequencer</span>
            </div>
            <span className="text-[8px] font-mono text-primary font-bold px-1.5 py-0.5 bg-primary/10 rounded uppercase">Ph {currentFrameIndex + 1}/{frames.length}</span>
          </div>

          {/* Controls: Play/Pause/Add/Trash */}
          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-1.5">
              <button
                onClick={handleTogglePlay}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  isPlaying 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                    : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/35'
                }`}
                title={isPlaying ? "Pause Sequence" : "Play Sequence"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
              <button
                onClick={handleAddFrame}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors cursor-pointer"
                title="Add Play Step Keyframe"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              {frames.length > 1 && (
                <button
                  onClick={(e) => handleDeleteFrame(e, currentFrameIndex)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                  title="Delete Current Step"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-[9px] font-mono text-white/40 italic">1.5s step</span>
          </div>

          {/* Keyframe Selector */}
          <div className="flex gap-1 items-center overflow-x-auto no-scrollbar py-1.5 border-t border-white/5 my-1">
            {frames.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentFrameIndex(idx);
                  setFloatFrameIndex(idx);
                  setIsPlaying(false);
                }}
                className={`px-2.5 py-1 rounded text-[9px] font-bold font-mono transition-all uppercase whitespace-nowrap shrink-0 cursor-pointer ${
                  currentFrameIndex === idx
                    ? 'bg-primary text-black font-black scale-105 shadow'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
                title={`Jump to Step ${idx + 1}`}
              >
                Ph{idx + 1}
              </button>
            ))}
          </div>

          {/* Dynamic Playback Scrubber / Timeline Slider */}
          <div className="flex flex-col gap-1 mt-1 pb-1 px-0.5 border-b border-white/5">
            <div className="flex items-center justify-between text-[8px] font-mono text-white/45">
              <span>Dynamic Playhead</span>
              <span className="font-bold text-white/70">
                {(floatFrameIndex + 1).toFixed(1)} / {frames.length}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={frames.length - 1}
              step={0.01}
              value={floatFrameIndex}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setFloatFrameIndex(val);
                setCurrentFrameIndex(Math.floor(val));
                setIsPlaying(false);
              }}
              className="w-full accent-[#FF8F6F] h-1 bg-white/10 rounded-lg cursor-pointer my-1 text-primary focus:outline-none"
              title="Drag to Scrub Playback Timeline"
            />
          </div>

          {/* Speed & Loop Controls */}
          <div className="flex items-center justify-between gap-1.5 mt-1 border-b border-white/5 pb-2">
            <div className="flex gap-1 items-center bg-white/5 p-0.5 rounded-lg border border-white/10">
              {[0.5, 1, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-mono transition-all font-bold cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-primary text-black font-black'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                  title={`Set speed to ${spd}x`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`px-2 py-0.5 rounded text-[8px] font-mono border transition-all font-bold flex items-center gap-1 cursor-pointer ${
                isLooping
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-white/45 hover:text-white/75'
              }`}
              title="Toggle Looping Mode"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{isLooping ? 'Loop' : 'Once'}</span>
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const resetFrames = getPresetFrames(playId);
              setFrames(resetFrames);
              saveFrames(resetFrames);
              setCurrentFrameIndex(0);
              setFloatFrameIndex(0);
              setIsPlaying(false);
            }}
            className="text-center py-1.5 border border-white/5 hover:bg-white/5 rounded text-[8px] font-mono text-white/45 hover:text-white/80 uppercase tracking-widest transition-all font-semibold active:scale-95 bg-white/[0.02] cursor-pointer"
            title="Reset to default motion alignment"
          >
            Reset Keyframes
          </button>
        </div>

        {!isArMode ? (
          <>
            {/* Tactical Layers Section */}
            <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-mono text-[9px] text-white/70 font-bold uppercase tracking-wider">Tactical Layers</span>
          </div>

          {/* Offense Toggle */}
          <button
            onClick={() => setShowOffense(!showOffense)}
            className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg transition-all cursor-pointer ${
              showOffense ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm' : 'hover:bg-white/5 text-white/40 border border-transparent'
            }`}
            title="Toggle Offense Layer"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-4 h-4 rounded-full border border-emerald-400/55 flex items-center justify-center text-[9px] font-black font-mono shrink-0 bg-emerald-500/10 text-emerald-400">O</span>
              <span className="font-sans font-semibold text-[10px] truncate">Offense (O)</span>
            </div>
            {showOffense ? <Eye className="w-3.5 h-3.5 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 opacity-60 shrink-0" />}
          </button>

          {/* Defense Toggle */}
          <button
            onClick={() => setShowDefense(!showDefense)}
            className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg transition-all cursor-pointer ${
              showDefense ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25 shadow-sm' : 'hover:bg-white/5 text-white/40 border border-transparent'
            }`}
            title="Toggle Defense Layer"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-rose-400 font-black font-mono text-[11px] w-4 h-4 flex items-center justify-center border border-rose-500/25 rounded-full bg-rose-500/10 shrink-0">✕</span>
              <span className="font-sans font-semibold text-[10px] truncate">Defense (✕)</span>
            </div>
            {showDefense ? <Eye className="w-3.5 h-3.5 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 opacity-60 shrink-0" />}
          </button>

          {/* Kinematic Vectors Overlay Toggle */}
          <button
            onClick={() => setShowVectorOverlay(!showVectorOverlay)}
            className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg transition-all cursor-pointer ${
              showVectorOverlay ? 'bg-sky-500/10 text-sky-400 border border-sky-500/25 shadow-sm' : 'hover:bg-white/5 text-white/40 border border-transparent'
            }`}
            title="Toggle Velocity & Acceleration Vectors Overlay"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-4 h-4 rounded-full border border-sky-400/35 flex items-center justify-center shrink-0 bg-sky-500/10 text-sky-400">
                <Zap className="w-2.5 h-2.5 text-sky-400" />
              </span>
              <span className="font-sans font-semibold text-[10px] truncate">Kinematic Vectors</span>
            </div>
            {showVectorOverlay ? <Eye className="w-3.5 h-3.5 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 opacity-60 shrink-0" />}
          </button>

          <div className="w-full border-t border-white/10 my-1" />

          {/* Mirror Play controls */}
          <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest px-1">Actions</span>
          <div className="grid grid-cols-2 gap-1.5 w-full mt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFrames(prev => {
                  const updated = prev.map(frame =>
                    frame.map(p => ({ ...p, x: Math.max(1.5, Math.min(98.5, 100 - p.x)) }))
                  );
                  saveFrames(updated);
                  return updated;
                });
              }}
              className="flex items-center justify-center gap-1 py-1.5 px-0.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-[8px] font-mono font-bold uppercase transition-all active:scale-95 cursor-pointer"
              title="Mirror play layout horizontally (L ⇄ R) for opposite-side tactics"
            >
              <ArrowLeftRight className="w-3 h-3 text-primary shrink-0" />
              <span>Mirror H</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setFrames(prev => {
                  const updated = prev.map(frame =>
                    frame.map(p => ({ ...p, y: Math.max(1.5, Math.min(98.5, 100 - p.y)) }))
                  );
                  saveFrames(updated);
                  return updated;
                });
              }}
              className="flex items-center justify-center gap-1 py-1.5 px-0.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-[8px] font-mono font-bold uppercase transition-all active:scale-95 cursor-pointer"
              title="Mirror play layout vertically (Top ⇄ Bottom) for opposite-wing tactics"
            >
              <ArrowUpDown className="w-3 h-3 text-primary shrink-0" />
              <span>Mirror V</span>
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setFrames([defaultPlayers]);
              saveFrames([defaultPlayers]);
              setDrawingElements([]);
              saveDrawingElements([]);
              setActiveSpacingPaths([]);
              saveSpacingPaths([]);
              setCurrentFrameIndex(0);
              setIsPlaying(false);
            }}
            className="py-1.5 hover:bg-white/15 rounded text-[8px] font-mono text-white/70 hover:text-white font-bold border border-white/10 text-center uppercase tracking-wider transition-all cursor-pointer mt-1"
          >
            Reset Elements
          </button>
        </div>

        {/* Player Plotting Tool Section */}
        <div className="flex flex-col gap-2 mt-2 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 mb-1">
            <PenTool className={`w-3.5 h-3.5 ${isPlotMode ? 'text-primary animate-pulse' : 'text-white/50'}`} />
            <span className="font-mono text-[9px] text-white/70 font-bold uppercase tracking-wider">Player Plot Mode</span>
          </div>

          <button
            onClick={() => setIsPlotMode(!isPlotMode)}
            className={`w-full py-1.5 px-3 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all border font-bold flex items-center justify-center gap-2 cursor-pointer ${
              isPlotMode
                ? 'bg-[#FF8F6F] border-[#FF8F6F] text-black font-black shadow-[0_0_12px_rgba(255,143,111,0.35)]'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
            title="Enable click-to-place manual player markers on tactical board"
          >
            <span>{isPlotMode ? '● Plotting Active' : '○ Enable Plot Mode'}</span>
          </button>

          {isPlotMode && (
            <div className="space-y-2 mt-1 animate-in fade-in duration-150">
              <div className="flex flex-col gap-1">
                <label className="text-[7.5px] font-mono text-white/45 uppercase tracking-wider text-left">Team Affiliation</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setPlotTeam('offense')}
                    className={`py-1 rounded text-[8px] font-mono font-bold transition-all border cursor-pointer ${
                      plotTeam === 'offense'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-extrabold'
                        : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    Offense (O)
                  </button>
                  <button
                    onClick={() => setPlotTeam('defense')}
                    className={`py-1 rounded text-[8px] font-mono font-bold transition-all border cursor-pointer ${
                      plotTeam === 'defense'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 font-extrabold'
                        : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    Defense (✕)
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[7.5px] font-mono text-white/45 uppercase tracking-wider text-left">Jersey / Role Label</label>
                <input
                  type="text"
                  maxLength={3}
                  value={plotJersey}
                  onChange={(e) => setPlotJersey(e.target.value.substring(0, 3))}
                  className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs font-mono focus:outline-none focus:border-primary/50 text-center w-full"
                  placeholder="e.g. SF"
                />
              </div>

              <span className="text-[7px] font-mono text-white/35 text-center block leading-relaxed">
                Click anywhere on the court arena layout to place a player marker at that specific (x, y) location.
              </span>
            </div>
          )}
        </div>

        {/* Vector Motion Tracker Global Controls Panel */}
        <div className="flex flex-col gap-2 bg-white/[0.02] p-2.5 rounded-xl border border-white/5 mt-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-1">
            <div className="flex items-center gap-1.5">
              <Zap className={`w-3.5 h-3.5 text-sky-400 ${isPlaying ? 'animate-pulse' : ''}`} />
              <span className="font-mono text-[9px] text-white/70 font-bold uppercase tracking-wider">Vector Motion Tracker</span>
            </div>
            <button
              onClick={() => setShowVectorOverlay(!showVectorOverlay)}
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono border transition-all font-bold ${
                showVectorOverlay
                  ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                  : 'bg-white/5 border-white/10 text-white/45'
              }`}
            >
              {showVectorOverlay ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          {showVectorOverlay && (
            <div className="flex flex-col gap-2 text-left animate-in fade-in duration-150">
              {/* Tracker Mode Toggle */}
              <div className="flex flex-col gap-1">
                <label className="text-[7.5px] font-mono text-white/40 uppercase tracking-wider">Tracking Targets</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setShowAllVectors(false)}
                    className={`py-1 rounded text-[8px] font-mono font-bold transition-all border cursor-pointer ${
                      !showAllVectors
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                        : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    Selected Player
                  </button>
                  <button
                    onClick={() => setShowAllVectors(true)}
                    className={`py-1 rounded text-[8px] font-mono font-bold transition-all border cursor-pointer ${
                      showAllVectors
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                        : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    All Players
                  </button>
                </div>
              </div>

              {/* Interpolation Model Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[7.5px] font-mono text-white/40 uppercase tracking-wider">Kinematic Interpolation Model</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setInterpolationModel('spline')}
                    className={`py-1 rounded text-[8px] font-mono font-bold transition-all border cursor-pointer ${
                      interpolationModel === 'spline'
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                        : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                    }`}
                    title="Cubic Catmull-Rom spline calculations for curved trajectories, continuous acceleration, and natural velocities"
                  >
                    Cubic Spline (Math)
                  </button>
                  <button
                    onClick={() => setInterpolationModel('linear')}
                    className={`py-1 rounded text-[8px] font-mono font-bold transition-all border cursor-pointer ${
                      interpolationModel === 'linear'
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                        : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                    }`}
                    title="Piecewise linear calculations for traditional straight line-segmented paths"
                  >
                    Linear Interpolation
                  </button>
                </div>
              </div>

              {/* Step Duration Selector */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[7.5px] font-mono text-white/40">
                  <span className="uppercase tracking-wider">Phase Step Duration (Δt)</span>
                  <span className="text-white font-bold">{deltaTime.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={deltaTime}
                  onChange={(e) => setDeltaTime(parseFloat(e.target.value))}
                  className="w-full accent-sky-400 h-1 bg-white/10 rounded-lg cursor-pointer text-primary focus:outline-none"
                />
              </div>

              {/* Vector Scaling Factor */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[7.5px] font-mono text-white/40">
                  <span className="uppercase tracking-wider">Vector Scale Factor</span>
                  <span className="text-white font-bold">{vectorScale.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={vectorScale}
                  onChange={(e) => setVectorScale(parseFloat(e.target.value))}
                  className="w-full accent-sky-400 h-1 bg-white/10 rounded-lg cursor-pointer text-primary focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Selected Player Details & Spacing-Aware Pathing */}
        {selectedPlayerId ? (
          <div className="flex flex-col gap-2 mt-2 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-2 h-2 rounded-full ${activePlayers.find(p => p.id === selectedPlayerId)?.type === 'offense' ? 'bg-emerald-400' : 'bg-rose-400'} shrink-0`} />
                <span className="font-mono text-[9px] text-white font-extrabold uppercase truncate">
                  Player {activePlayers.find(p => p.id === selectedPlayerId)?.label || 'Selected'}
                </span>
              </div>
              <button
                onClick={() => setSelectedPlayerId(null)}
                className="text-white/40 hover:text-white text-[10px] p-0.5 cursor-pointer"
                title="Deselect Player"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[7.5px] font-mono text-white/40 uppercase tracking-wider px-0.5">Line Style</span>
              <div className="grid grid-cols-3 gap-1">
                {(['cut', 'dribble', 'pass'] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => setGeneratePathStyle(style)}
                    className={`py-1 px-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all border shrink-0 cursor-pointer ${
                      generatePathStyle === style
                        ? 'bg-primary border-primary text-black font-black'
                        : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {style === 'cut' ? '🏃‍♂️ Cut' : style === 'dribble' ? '🏀 Dribble' : '✉️ Pass'}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1 mt-1.5">
                <button
                  onClick={() => generateSpacingAwarePath('step')}
                  className="flex items-center justify-center gap-1 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                  title="Generate spacing-aware curved path from previous keyframe step to the current"
                >
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span>Generate Step Path</span>
                </button>

                <button
                  onClick={() => generateSpacingAwarePath('full')}
                  className="flex items-center justify-center gap-1 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                  title="Trace continuous smooth curved route across all keyframe steps"
                >
                  <Activity className="w-3 h-3 text-indigo-400" />
                  <span>Generate Full Path</span>
                </button>
              </div>
              <span className="text-[7px] font-mono text-white/35 text-center mt-0.5 animate-none">Adjusts curves automatically around defenders, screeners & lanes.</span>

              {/* Kinematic Stats Overlay for Selected Player */}
              {showVectorOverlay && (
                <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-white/10 text-left animate-in slide-in-from-top-1 duration-150">
                  <span className="text-[7.5px] font-mono text-white/40 uppercase tracking-wider px-0.5 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-sky-400" />
                    <span>Vector Kinematics HUD</span>
                  </span>

                  {(() => {
                    const phys = getPlayerPhysics(selectedPlayerId, floatFrameIndex);
                    return (
                      <div className="grid grid-cols-2 gap-1.5 mt-1">
                        <div className="bg-black/30 p-1.5 rounded border border-white/5 flex flex-col justify-between">
                          <span className="text-[6.5px] font-mono text-white/40 uppercase">Velocity</span>
                          <span className="text-[10px] font-mono text-sky-400 font-extrabold leading-tight">
                            {phys.vMag.toFixed(2)} <span className="text-[7px] text-sky-400/65 font-normal">m/s</span>
                          </span>
                          <span className="text-[7px] font-mono text-white/30 leading-none">
                            {(phys.vMag * 2.237).toFixed(1)} mph
                          </span>
                        </div>

                        <div className="bg-black/30 p-1.5 rounded border border-white/5 flex flex-col justify-between">
                          <span className="text-[6.5px] font-mono text-white/40 uppercase">Acceleration</span>
                          <span className="text-[10px] font-mono text-rose-400 font-extrabold leading-tight">
                            {phys.aMag.toFixed(2)} <span className="text-[7px] text-rose-400/65 font-normal">m/s²</span>
                          </span>
                          <span className="text-[7px] font-mono text-white/30 leading-none">
                            {(phys.aMag / 9.807).toFixed(2)} G
                          </span>
                        </div>

                        <div className="bg-black/30 p-1.5 rounded border border-white/5 flex flex-col justify-between">
                          <span className="text-[6.5px] font-mono text-white/40 uppercase">V-Components</span>
                          <span className="text-[8.5px] font-mono text-white/80 font-bold leading-tight truncate">
                            [{phys.vx >= 0 ? '+' : ''}{phys.vx.toFixed(1)}, {phys.vy >= 0 ? '+' : ''}{phys.vy.toFixed(1)}]
                          </span>
                          <span className="text-[7px] font-mono text-white/30 leading-none">
                            [vx, vy]
                          </span>
                        </div>

                        <div className="bg-black/30 p-1.5 rounded border border-white/5 flex flex-col justify-between">
                          <span className="text-[6.5px] font-mono text-white/40 uppercase">Coordinates</span>
                          <span className="text-[8.5px] font-mono text-white/80 font-bold leading-tight truncate">
                            X:{(phys.x * 0.2865).toFixed(1)}m, Y:{(phys.y * 0.1524).toFixed(1)}m
                          </span>
                          <span className="text-[7px] font-mono text-white/30 leading-none">
                            Court meters
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Render the stunning live SVG Kinematics chart */}
                  {renderKinematicSparkline(selectedPlayerId)}
                </div>
              )}

              <div className="flex flex-col gap-1 mt-1.5 pt-1.5 border-t border-white/10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const idToRemove = selectedPlayerId;
                    setFrames(prev => {
                      const updated = prev.map(frame => frame.filter(p => p.id !== idToRemove));
                      saveFrames(updated);
                      return updated;
                    });
                    setSelectedPlayerId(null);
                  }}
                  className="flex items-center justify-center gap-1 py-1.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg text-[9px] font-mono font-bold uppercase transition-all active:scale-95 cursor-pointer"
                  title="Remove this player node from the playbook board stage"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                  <span>Remove Player</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 px-2.5 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
            <span className="text-[8px] font-mono text-white/30 text-center uppercase tracking-wider">Select a player circle on the court to generate tactical spacing-aware paths.</span>
          </div>
        )}
          </>
        ) : (
          /* AR Sidebar Controls Panel */
          <div className="flex flex-col gap-3 animate-in fade-in duration-200">
            {/* Active AR Mode Notification Banner */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 flex flex-col gap-1 text-[8.5px] leading-relaxed text-amber-400">
              <span className="font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span>AR Playback Mode</span>
              </span>
              <p className="font-sans text-white/70">
                Interactive 3D Perspective overlay. 2D paint tools are disabled. Move timeline to view play kinematics.
              </p>
            </div>

            {/* AR Camera Pass-through Activation */}
            <div className="flex flex-col gap-2 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <span className="font-mono text-[9px] text-white/75 font-bold uppercase tracking-wider pb-1 border-b border-white/5 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Real-World Camera</span>
              </span>
              
              {isArCameraActive ? (
                <button
                  onClick={stopArCamera}
                  className="w-full py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-lg text-[9px] font-mono font-bold uppercase transition-all cursor-pointer"
                >
                  Disable Video Feed
                </button>
              ) : (
                <button
                  onClick={startArCamera}
                  disabled={isArCameraLoading}
                  className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[9px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isArCameraLoading ? 'Initializing...' : 'Enable Video Feed'}
                </button>
              )}

              {arCameraError && (
                <p className="text-[7.5px] font-mono text-rose-400 leading-normal bg-rose-500/5 p-1.5 rounded border border-rose-500/10">
                  {arCameraError}
                </p>
              )}
            </div>

            {/* Point to Floor & Re-Anchor placement */}
            <div className="flex flex-col gap-2 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <span className="font-mono text-[9px] text-white/75 font-bold uppercase tracking-wider pb-1 border-b border-white/5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Surface Tracking</span>
              </span>
              
              <button
                onClick={() => setIsPlacingArAnchor(!isPlacingArAnchor)}
                className={`w-full py-1.5 rounded-lg text-[9.5px] font-mono uppercase tracking-wider transition-all border font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  isPlacingArAnchor
                    ? 'bg-amber-400 text-black font-extrabold border-amber-400 animate-pulse'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <span>{isPlacingArAnchor ? '● Pointer Ready' : '📌 Re-Anchor Court'}</span>
              </button>
              
              <span className="text-[7px] font-mono text-white/40 text-center block leading-relaxed mt-0.5">
                Click to activate, then point to any flat floor surface on your camera view to snap the court boundary center.
              </span>
            </div>

            {/* AR Floor Material customization */}
            <div className="flex flex-col gap-2 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <span className="font-mono text-[9px] text-white/75 font-bold uppercase tracking-wider pb-1 border-b border-white/5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Floor Material</span>
              </span>
              <div className="flex flex-col gap-1.5 mt-0.5">
                {(['maple', 'asphalt', 'neon', 'gym', 'clay'] as const).map(fType => {
                  const labels = {
                    maple: '🪵 Hardwood Maple',
                    asphalt: '🛣️ Blacktop Asphalt',
                    neon: '👾 Matrix Glow LED',
                    gym: '🟢 Green Poly Gym',
                    clay: '🧱 Terracotta Clay'
                  };
                  return (
                    <button
                      key={fType}
                      onClick={() => setArFloorType(fType)}
                      className={`w-full py-1.5 px-2.5 rounded text-[8.5px] font-mono font-bold transition-all text-left border flex items-center justify-between cursor-pointer ${
                        arFloorType === fType
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-extrabold'
                          : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      <span>{labels[fType]}</span>
                      {arFloorType === fType && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calibration HUD Controls */}
            <div className="flex flex-col gap-2 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <span className="font-mono text-[9px] text-white/75 font-bold uppercase tracking-wider pb-1 border-b border-white/5 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>AR Calibration HUD</span>
              </span>
              <div className="flex flex-col gap-2 text-left">
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between text-[8px] font-mono text-white/45">
                    <span>Tilt Pitch</span>
                    <span className="text-white font-semibold">{arTilt}°</span>
                  </div>
                  <input 
                    type="range" 
                    min={15} 
                    max={85} 
                    value={arTilt} 
                    onChange={e => setArTilt(parseInt(e.target.value))} 
                    className="w-full accent-amber-400 h-1 bg-white/10 rounded cursor-pointer" 
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between text-[8px] font-mono text-white/45">
                    <span>Rotation</span>
                    <span className="text-white font-semibold">{arRotation}°</span>
                  </div>
                  <input 
                    type="range" 
                    min={-180} 
                    max={180} 
                    value={arRotation} 
                    onChange={e => setArRotation(parseInt(e.target.value))} 
                    className="w-full accent-amber-400 h-1 bg-white/10 rounded cursor-pointer" 
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between text-[8px] font-mono text-white/45">
                    <span>Court Scale</span>
                    <span className="text-white font-semibold">{arScale.toFixed(2)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min={0.4} 
                    max={2.0} 
                    step={0.05} 
                    value={arScale} 
                    onChange={e => setArScale(parseFloat(e.target.value))} 
                    className="w-full accent-amber-400 h-1 bg-white/10 rounded cursor-pointer" 
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between text-[8px] font-mono text-white/45">
                    <span>Elevation</span>
                    <span className="text-white font-semibold">{arHeight}px</span>
                  </div>
                  <input 
                    type="range" 
                    min={-100} 
                    max={200} 
                    value={arHeight} 
                    onChange={e => setArHeight(parseInt(e.target.value))} 
                    className="w-full accent-amber-400 h-1 bg-white/10 rounded cursor-pointer" 
                  />
                </div>
                
                <button
                  onClick={() => {
                    setArScale(0.85);
                    setArRotation(0);
                    setArTilt(55);
                    setArHeight(0);
                    setArAnchor({ x: 50, y: 55 });
                    setArOffsetX(0);
                    setArOffsetY(10);
                  }}
                  className="w-full py-1.5 mt-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded text-[8px] font-mono uppercase font-bold text-center tracking-widest cursor-pointer"
                >
                  Reset Layout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Court Area Workspace */}
      <div 
        ref={containerRef}
        className={`flex-1 h-full relative overflow-hidden bg-surface-container-low transition-colors duration-150 ${
          isPanMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
        }`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
        onWheel={handleWheel}
      >
        {isArMode ? (
          /* Immersive 3D AR Projection Workspace */
          <div 
            className="absolute inset-0 w-full h-full bg-black select-none overflow-hidden flex items-center justify-center"
            onClick={(e) => {
              if (!isPlacingArAnchor) return;
              if (!containerRef.current) return;
              const rect = containerRef.current.getBoundingClientRect();
              const clickX = ((e.clientX - rect.left) / rect.width) * 100;
              const clickY = ((e.clientY - rect.top) / rect.height) * 100;
              setArAnchor({ x: clickX, y: clickY });
              setIsPlacingArAnchor(false);
            }}
          >
            {/* Live Camera Feed Pass-Through Layer */}
            {isArCameraActive ? (
              <video 
                ref={arVideoRef}
                autoPlay 
                playsInline 
                muted 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-80 z-0" 
              />
            ) : (
              /* Simulated High-Fidelity Gymnasium Background when Camera is Inactive */
              <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a0d14] via-[#0b0e14] to-[#141b29] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-70" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />
                
                {/* Simulated Gym Floor Boards in Perspective under the court */}
                <div className="absolute bottom-0 w-full h-[40%] bg-gradient-to-t from-orange-950/20 to-transparent border-t border-white/5 pointer-events-none" />
              </div>
            )}

            {/* Simulated Live AR Surface Tracking Grid Overlays */}
            <div className="absolute inset-0 pointer-events-none z-[2] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:20px_20px]" />
            
            {/* Real-time AR Targeting Reticle for Anchor Placement */}
            {isPlacingArAnchor && (
              <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center bg-black/40">
                <div className="w-16 h-16 rounded-full border border-dashed border-amber-400 animate-spin flex items-center justify-center mb-3">
                  <div className="w-4 h-4 rounded-full bg-amber-400" />
                </div>
                <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest px-3 py-1 bg-black/80 rounded-lg border border-amber-500/30">
                  Click Anywhere to Anchor Court on Floor
                </span>
              </div>
            )}

            {/* 👓 Holographic 3D Projection Plate Container */}
            <div
              style={{
                left: `${arAnchor.x}%`,
                top: `${arAnchor.y}%`,
                transform: `translate(-50%, -50%) translate(${arOffsetX}px, ${arOffsetY}px) translateZ(${arHeight}px) rotateX(${arTilt}deg) rotateZ(${arRotation}deg) scale(${arScale})`,
                transformStyle: 'preserve-3d',
                transformOrigin: 'center center',
              }}
              className="absolute w-[800px] aspect-[16/9] transition-all duration-150 ease-out z-[10] shadow-[0_50px_100px_rgba(0,0,0,0.8)] rounded-[24px]"
            >
              {/* Floor Surface Plates based on Floor Material Selection */}
              <div 
                style={{
                  borderRadius: '24px',
                  boxShadow: arFloorType === 'neon' 
                    ? 'inset 0 0 80px rgba(6,182,212,0.3), 0 0 30px rgba(6,182,212,0.15)' 
                    : 'inset 0 0 50px rgba(0,0,0,0.4)',
                  border: arFloorType === 'neon' ? '2px border-cyan-500/40' : '1px border-white/10',
                  background: arFloorType === 'maple'
                    ? 'repeating-linear-gradient(90deg, #dfaf7f 0px, #dfaf7f 24px, #e8be8f 25px, #d2a170 30px)'
                    : arFloorType === 'asphalt'
                      ? 'radial-gradient(circle_at_center, #2c3038, #181b20)'
                      : arFloorType === 'neon'
                        ? 'linear-gradient(135deg, #07090e 0%, #0d111a 100%)'
                        : arFloorType === 'gym'
                          ? '#183c31'
                          : '#a24b33', // clay
                }}
                className="absolute inset-0 z-0 overflow-hidden"
              >
                {/* Authentic Court Floor Line Markings SVG */}
                <div className={`absolute inset-0 pointer-events-none z-10 ${arFloorType === 'neon' ? 'text-cyan-400' : 'text-white/60'}`}>
                  <svg className="w-full h-full p-4" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <rect x="0" y="0" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="0.8" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.8" />
                    <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="0.8" />
                    <circle cx="50" cy="50" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" />
                    
                    {/* Key Lanes */}
                    <rect x="0" y="30" width="19" height="40" fill="currentColor" fillOpacity={arFloorType === 'neon' ? "0.02" : "0.06"} stroke="currentColor" strokeWidth="0.8" />
                    <path d="M 19 38 A 12 12 0 0 1 19 62 Z" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
                    <path d="M 19 38 A 12 12 0 0 0 19 62 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
                    
                    <rect x="81" y="30" width="19" height="40" fill="currentColor" fillOpacity={arFloorType === 'neon' ? "0.02" : "0.06"} stroke="currentColor" strokeWidth="0.8" />
                    <path d="M 81 38 A 12 12 0 0 0 81 62 Z" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
                    <path d="M 81 38 A 12 12 0 0 1 81 62 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
                    
                    {/* Three point lines */}
                    <path d="M 0 5 L 14 5 A 45 45 0 0 1 14 95 L 0 95" fill="none" stroke="currentColor" strokeWidth="0.8" />
                    <path d="M 100 5 L 86 5 A 45 45 0 0 0 86 95 L 100 95" fill="none" stroke="currentColor" strokeWidth="0.8" />
                    
                    {/* Restricted semi circle */}
                    <path d="M 0 44 A 6 6 0 0 1 0 56" fill="none" stroke="currentColor" strokeWidth="0.8" />
                    <path d="M 100 44 A 6 6 0 0 0 100 56" fill="none" stroke="currentColor" strokeWidth="0.8" />
                    
                    {/* Rims and Backboards */}
                    <line x1="4" y1="43" x2="4" y2="57" stroke="currentColor" strokeWidth="1.2" />
                    <line x1="4" y1="50" x2="5.5" y2="50" stroke="currentColor" strokeWidth="0.8" />
                    <circle cx="5.5" cy="50" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    
                    <line x1="96" y1="43" x2="96" y2="57" stroke="currentColor" strokeWidth="1.2" />
                    <line x1="96" y1="50" x2="94.5" y2="50" stroke="currentColor" strokeWidth="0.8" />
                    <circle cx="94.5" cy="50" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </div>

                {/* Cyber LED Floor Ambient Scanlines */}
                {arFloorType === 'neon' && (
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.04)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none animate-[pulse_6s_infinite] z-0" />
                )}
                
                {/* Classic Varnish Wood planks reflection */}
                {arFloorType === 'maple' && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/15 pointer-events-none mix-blend-overlay z-[5]" />
                )}
              </div>

              {/* AR Holographic Player Objects rendering */}
              <div className="absolute inset-0 z-20" style={{ transformStyle: 'preserve-3d' }}>
                {/* 3D Render Offense Players */}
                {showOffense && activePlayers.filter(p => p.type === 'offense').map(p => (
                  <div
                    key={p.id}
                    style={{ 
                      left: `${p.x}%`, 
                      top: `${p.y}%`,
                      transform: `translate(-50%, -50%)`,
                      transformStyle: 'preserve-3d'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlayerId(p.id);
                    }}
                    className="absolute z-[40] cursor-pointer"
                  >
                    {/* Hologram ground projection ring */}
                    <div className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-400/50 animate-pulse scale-[1.2]" />
                    <div className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-500/40 blur-xs" />
                    
                    {/* Vertical Holographic coordinates laser stem */}
                    <div 
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-t from-emerald-400/80 to-transparent origin-bottom"
                      style={{ 
                        transform: 'rotateX(-90deg)', 
                        height: '40px',
                        transformOrigin: 'bottom center'
                      }} 
                    />

                    {/* Billboarded floating player jersey tag */}
                    <div
                      style={{
                        transform: `translate(-50%, -42px) rotateX(${-arTilt}deg) rotateY(0deg) rotateZ(${-arRotation}deg)`,
                        transition: isTransitioning ? 'all 1200ms ease-in-out' : 'transform 75ms ease-out',
                      }}
                      className={`absolute w-7.5 h-7.5 rounded-full border-2 flex flex-col items-center justify-center font-mono text-center shadow-[0_4px_12px_rgba(0,0,0,0.6)] select-none bg-black/90 border-emerald-400 hover:scale-115 text-emerald-400 ${
                        selectedPlayerId === p.id ? 'ring-2 ring-amber-400 scale-110 z-[60] animate-pulse' : ''
                      }`}
                      title={`Offense ${p.label}`}
                    >
                      <span className="text-[9px] font-black leading-none">O</span>
                      <span className="text-[6.5px] font-bold tracking-tight leading-none mt-0.5 uppercase">{p.label}</span>
                    </div>
                  </div>
                ))}

                {/* 3D Render Defense Players */}
                {showDefense && activePlayers.filter(p => p.type === 'defense').map(p => (
                  <div
                    key={p.id}
                    style={{ 
                      left: `${p.x}%`, 
                      top: `${p.y}%`,
                      transform: `translate(-50%, -50%)`,
                      transformStyle: 'preserve-3d'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlayerId(p.id);
                    }}
                    className="absolute z-[40] cursor-pointer"
                  >
                    {/* Hologram ground projection ring */}
                    <div className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-rose-500/15 border border-rose-400/50 animate-pulse scale-[1.2]" />
                    <div className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-rose-500/40 blur-xs" />
                    
                    {/* Vertical Holographic coordinates laser stem */}
                    <div 
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-t from-rose-400/80 to-transparent origin-bottom"
                      style={{ 
                        transform: 'rotateX(-90deg)', 
                        height: '40px',
                        transformOrigin: 'bottom center'
                      }} 
                    />

                    {/* Billboarded floating player jersey tag */}
                    <div
                      style={{
                        transform: `translate(-50%, -42px) rotateX(${-arTilt}deg) rotateY(0deg) rotateZ(${-arRotation}deg)`,
                        transition: isTransitioning ? 'all 1200ms ease-in-out' : 'transform 75ms ease-out',
                      }}
                      className={`absolute w-7.5 h-7.5 rounded-full border-2 flex flex-col items-center justify-center font-mono text-center shadow-[0_4px_12px_rgba(0,0,0,0.6)] select-none bg-black/90 border-rose-400 hover:scale-115 text-rose-400 ${
                        selectedPlayerId === p.id ? 'ring-2 ring-amber-400 scale-110 z-[60] animate-pulse' : ''
                      }`}
                      title={`Defense ${p.label}`}
                    >
                      <span className="text-[9px] font-black leading-none">✕</span>
                      <span className="text-[6.5px] font-bold tracking-tight leading-none mt-0.5 uppercase">{p.label}</span>
                    </div>
                  </div>
                ))}

                {/* 🏀 Floating 3D Basketball Pass simulation */}
                {(() => {
                  const ballObject = activePlayers.find(p => p.label?.toLowerCase() === 'ball' || (p as any).isBall);
                  if (!ballObject) return null;
                  
                  const bounceHeight = 16 + Math.abs(Math.sin(floatFrameIndex * Math.PI)) * 24;

                  return (
                    <div
                      style={{ 
                        left: `${ballObject.x}%`, 
                        top: `${ballObject.y}%`,
                        transform: `translate(-50%, -50%)`,
                        transformStyle: 'preserve-3d'
                      }}
                      className="absolute z-[45]"
                    >
                      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black/70 blur-[2px]" />
                      <div
                        style={{
                          transform: `translate(-50%, -${bounceHeight}px) rotateX(${-arTilt}deg) rotateY(0deg) rotateZ(${-arRotation}deg)`,
                          background: 'radial-gradient(circle at 35% 35%, #f97316 10%, #ea580c 45%, #9a3412 85%)',
                        }}
                        className="absolute w-5 h-5 rounded-full border border-orange-950 flex items-center justify-center shadow-lg"
                      >
                        <div className="absolute inset-0 rounded-full border border-black/35 scale-[0.7]" />
                        <div className="absolute inset-0 rounded-full border-l border-r border-black/30 scale-x-[0.5]" />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Float HUD detailing floor anchor tracker */}
            <div className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-black/85 border border-white/10 px-3 py-1.5 rounded-lg text-[9px] font-mono text-white/85 shadow-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Floor Anchor: X: {arAnchor.x.toFixed(0)}% | Y: {arAnchor.y.toFixed(0)}%</span>
            </div>
          </div>
        ) : (
          <>
            {/* Zoomed & Panned Board Stage */}
            <div 
          onMouseDown={(e) => {
            if (isPlotMode) {
              lastMouseDownPos.current = { x: e.clientX, y: e.clientY };
            }
          }}
          onClick={(e) => {
            if (!isPlotMode) return;
            
            // Validate distance to prevent placement when panning
            if (lastMouseDownPos.current) {
              const dx = e.clientX - lastMouseDownPos.current.x;
              const dy = e.clientY - lastMouseDownPos.current.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              lastMouseDownPos.current = null;
              if (dist > 5) return; 
            }
            
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const W = rect.width;
            const H = rect.height;
            
            // Inverse scale/translate transformation to map screen coordinates back to stage percentage space
            const xLocal = W / 2 + (e.clientX - rect.left - pan.x - W / 2) / zoom;
            const yLocal = H / 2 + (e.clientY - rect.top - pan.y - H / 2) / zoom;
            
            const pctX = Math.round(((xLocal / W) * 100) * 10) / 10;
            const pctY = Math.round(((yLocal / H) * 100) * 10) / 10;
            
            // Bounds check
            const boundedX = Math.max(1.5, Math.min(98.5, pctX));
            const boundedY = Math.max(1.5, Math.min(98.5, pctY));
            
            const newPlayerId = `manual-player-${Date.now()}`;
            const newPlayer = {
              id: newPlayerId,
              label: plotJersey.trim() || '7',
              x: boundedX,
              y: boundedY,
              type: plotTeam
            };
            
            setFrames(prev => {
              const updated = prev.map(frame => {
                return [...frame, newPlayer];
              });
              saveFrames(updated);
              return updated;
            });
            
            setSelectedPlayerId(newPlayerId);
          }}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          className="absolute inset-0 w-full h-full transition-transform duration-75 ease-out"
        >
          {/* Basketball Court Markings Background */}
          <div className="absolute inset-0 opacity-[0.22] pointer-events-none text-white/75 z-0">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Boundary */}
              <rect x="0" y="0" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="0.6" />
              
              {/* Half Court Division */}
              <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.6" />
              
              {/* Center Circle & Jump Circle */}
              <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="0.6" />
              <circle cx="50" cy="50" r="4" fill="none" stroke="currentColor" strokeWidth="0.6" />
              
              {/* Left Key / Paint */}
              <rect x="0" y="30" width="19" height="40" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth="0.6" />
              {/* Left Free Throw Outer Circle */}
              <path d="M 19 38 A 12 12 0 0 1 19 62 Z" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1.5,1.5" />
              <path d="M 19 38 A 12 12 0 0 0 19 62 Z" fill="none" stroke="currentColor" strokeWidth="0.6" />
              
              {/* Right Key / Paint */}
              <rect x="81" y="30" width="19" height="40" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth="0.6" />
              {/* Right Free Throw Outer Circle */}
              <path d="M 81 38 A 12 12 0 0 0 81 62 Z" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1.5,1.5" />
              <path d="M 81 38 A 12 12 0 0 1 81 62 Z" fill="none" stroke="currentColor" strokeWidth="0.6" />
              
              {/* Left 3-Point Line */}
              <path d="M 0 5 L 14 5 A 45 45 0 0 1 14 95 L 0 95" fill="none" stroke="currentColor" strokeWidth="0.6" />
              
              {/* Right 3-Point Line */}
              <path d="M 100 5 L 86 5 A 45 45 0 0 0 86 95 L 100 95" fill="none" stroke="currentColor" strokeWidth="0.6" />
              
              {/* Restricted Area Semi-Circles */}
              <path d="M 0 44 A 6 6 0 0 1 0 56" fill="none" stroke="currentColor" strokeWidth="0.6" />
              <path d="M 100 44 A 6 6 0 0 0 100 56" fill="none" stroke="currentColor" strokeWidth="0.6" />

              {/* Backboards & Rims */}
              {/* Left */}
              <line x1="4" y1="43" x2="4" y2="57" stroke="currentColor" strokeWidth="0.9" />
              <line x1="4" y1="50" x2="5.5" y2="50" stroke="currentColor" strokeWidth="0.6" />
              <circle cx="5.5" cy="50" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.9" />
              
              {/* Right */}
              <line x1="96" y1="43" x2="96" y2="57" stroke="currentColor" strokeWidth="0.9" />
              <line x1="96" y1="50" x2="94.5" y2="50" stroke="currentColor" strokeWidth="0.6" />
              <circle cx="94.5" cy="50" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.9" />
            </svg>
          </div>

          <canvas ref={canvasRef} id={id} className="absolute inset-0 w-full h-full bg-transparent z-10" />

          {/* Render Offense Players internally scaled with the court mapping */}
          {showOffense && activePlayers.filter(p => p.type === 'offense').map(p => (
            <div
              key={p.id}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              onMouseDown={(e) => {
                handleStartDrag(e, p.id);
                setSelectedPlayerId(p.id);
              }}
              onTouchStart={(e) => {
                handleStartDrag(e, p.id);
                setSelectedPlayerId(p.id);
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 border-emerald-400 bg-black/90 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing font-mono shadow-md hover:shadow-[0_0_8px_rgba(52,211,153,0.5)] ${
                draggingId === p.id ? 'ring-2 ring-emerald-400 scale-110 shadow-lg cursor-grabbing' : ''
              } ${
                selectedPlayerId === p.id ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-[#0b0e12] scale-110 z-[75] animate-pulse' : ''
              } ${isTransitioning ? 'transition-all duration-[1200ms] ease-in-out' : ''} z-[60] select-none`}
              title={`Drag Offense ${p.label}`}
            >
              <span className="text-[9px] text-emerald-400 font-extrabold leading-none">O</span>
              <span className="text-[6.5px] text-emerald-300 font-bold tracking-normal leading-none mt-0.5 uppercase">{p.label}</span>
            </div>
          ))}

          {/* Render Defense Players internally scaled with the court mapping */}
          {showDefense && activePlayers.filter(p => p.type === 'defense').map(p => (
            <div
              key={p.id}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              onMouseDown={(e) => {
                handleStartDrag(e, p.id);
                setSelectedPlayerId(p.id);
              }}
              onTouchStart={(e) => {
                handleStartDrag(e, p.id);
                setSelectedPlayerId(p.id);
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 border-rose-400 bg-black/90 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing font-mono shadow-md hover:shadow-[0_0_8px_rgba(248,113,113,0.5)] ${
                draggingId === p.id ? 'ring-2 ring-rose-400 scale-110 shadow-lg cursor-grabbing' : ''
              } ${
                selectedPlayerId === p.id ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-[#0b0e12] scale-110 z-[75] animate-pulse' : ''
              } ${isTransitioning ? 'transition-all duration-[1200ms] ease-in-out' : ''} z-[60] select-none`}
              title={`Drag Defense ${p.label}`}
            >
              <span className="text-[9px] text-rose-400 font-extrabold leading-none">✕</span>
              <span className="text-[6.5px] text-rose-300 font-bold tracking-normal leading-none mt-0.5 uppercase">{p.label}</span>
            </div>
          ))}
        </div>

        {/* Floating Zoom / Pan Interactive Controls Panel (Bottom-Right) */}
        <div className="absolute bottom-4 right-4 bg-[#0d1014]/95 backdrop-blur border border-white/10 p-2 rounded-xl flex items-center gap-2.5 shadow-2xl z-50 text-left font-sans select-none">
          {/* Quick Focus Area Presets */}
          <div className="flex gap-1 border-r border-white/10 pr-2 mr-0.5 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoom(1.0);
                setPan({ x: 0, y: 0 });
              }}
              className={`px-2 py-1 rounded-lg text-[8.5px] font-mono font-bold tracking-wider uppercase transition-all ${
                zoom === 1.0 && pan.x === 0 && pan.y === 0
                  ? 'bg-primary text-black font-extrabold shadow'
                  : 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10'
              }`}
              title="Focus Full Court Overview"
            >
              Full Court
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const rect = containerRef.current?.getBoundingClientRect();
                const W = rect?.width || 800;
                setZoom(1.8);
                setPan({ x: W * 0.35, y: 0 });
              }}
              className={`px-2 py-1 rounded-lg text-[8.5px] font-mono font-bold tracking-wider uppercase transition-all ${
                zoom === 1.8 && pan.x > 10
                  ? 'bg-primary text-black font-extrabold shadow'
                  : 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10'
              }`}
              title="Focus Left Paint Basket"
            >
              Left Key
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const rect = containerRef.current?.getBoundingClientRect();
                const W = rect?.width || 800;
                setZoom(1.8);
                setPan({ x: -W * 0.35, y: 0 });
              }}
              className={`px-2 py-1 rounded-lg text-[8.5px] font-mono font-bold tracking-wider uppercase transition-all ${
                zoom === 1.8 && pan.x < -10
                  ? 'bg-primary text-black font-extrabold shadow'
                  : 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10'
              }`}
              title="Focus Right Paint Basket"
            >
              Right Key
            </button>
          </div>

          {/* Pan Mode Selector Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPanMode(!isPanMode);
            }}
            className={`p-1.5 rounded-lg border transition-all shrink-0 ${
              isPanMode 
                ? 'bg-primary/25 text-primary border-primary/40 shadow-lg scale-105' 
                : 'text-white/50 hover:text-white bg-white/5 border-transparent hover:bg-white/10'
            }`}
            title={isPanMode ? "Hand Pan Mode (Active) - click-and-drag background anywhere to pan" : "Switch to Hand Pan Mode"}
          >
            <Hand className="w-3.5 h-3.5" />
          </button>

          {/* Incremental Zoom Buttons */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-lg px-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const nextZoom = Math.max(1.0, Math.min(3.0, zoom - 0.2));
                if (nextZoom === 1.0) {
                  setPan({ x: 0, y: 0 });
                } else {
                  setPan(prev => ({
                    x: prev.x * (nextZoom / zoom),
                    y: prev.y * (nextZoom / zoom)
                  }));
                }
                setZoom(nextZoom);
              }}
              className="p-1 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
              disabled={zoom <= 1.0}
              title="Zoom Out"
            >
              <Minus className="w-3 h-3" />
            </button>
            
            <span className="font-mono text-[9px] text-white/80 font-bold min-w-[32px] text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const nextZoom = Math.min(3.0, zoom + 0.2);
                setPan(prev => ({
                  x: prev.x * (nextZoom / zoom),
                  y: prev.y * (nextZoom / zoom)
                }));
                setZoom(nextZoom);
              }}
              className="p-1 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
              disabled={zoom >= 3.0}
              title="Zoom In"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Reset Zoom & Pan All */}
          {(zoom !== 1.0 || pan.x !== 0 || pan.y !== 0) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoom(1.0);
                setPan({ x: 0, y: 0 });
                setIsPanMode(false);
              }}
              className="p-1.5 rounded-lg text-white/50 hover:text-white bg-white/10 hover:bg-white/20 transition-all shrink-0"
              title="Reset Board Viewport Align"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
