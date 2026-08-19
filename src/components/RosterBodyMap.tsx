import { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Activity, 
  Users, 
  Sparkles, 
  ChevronRight, 
  TrendingUp, 
  Scale, 
  User, 
  Sliders, 
  Flame, 
  Brain,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TEAM_DATA, Team } from '../teams';

interface RosterBodyMapProps {
  initialTeamName?: string;
  onPlayerSelect?: (playerName: string) => void;
}

// Deterministic injury generator for any roster athlete
function getPlayerInjuryMetrics(playerName: string, teamName: string, position: string, workloadModifier: number = 0) {
  let seed = 0;
  for (let i = 0; i < playerName.length; i++) {
    seed += playerName.charCodeAt(i);
  }

  const isCenter = position.toLowerCase().includes('center');
  const isForward = position.toLowerCase().includes('forward');
  const isGuard = position.toLowerCase().includes('guard');

  // Base fatigue level (40-75) + simulated extra workload miles
  let baseFatigue = 40 + (seed % 35) + workloadModifier;
  baseFatigue = Math.min(100, Math.max(10, baseFatigue));

  // Stress equations
  let shoulderRisk = 20 + ((seed * 3) % 40) + (isGuard ? 15 : 5) + (workloadModifier * 0.8);
  let spineRisk = 30 + ((seed * 7) % 45) + (isCenter ? 18 : 5) + (workloadModifier * 0.9);
  let hipRisk = 25 + ((seed * 11) % 40) + (isForward ? 12 : 5) + (workloadModifier * 0.7);
  let hamstringRisk = 30 + ((seed * 13) % 45) + (isGuard ? 20 : 5) + (workloadModifier * 1.2);
  let kneeRisk = 35 + ((seed * 17) % 45) + (isCenter ? 20 : isForward ? 10 : 0) + (workloadModifier * 1.3);
  let ankleRisk = 30 + ((seed * 19) % 50) + (isGuard ? 18 : isCenter ? 5 : 0) + (workloadModifier * 1.1);
  let footRisk = 20 + ((seed * 23) % 45) + (isCenter ? 22 : 0) + (workloadModifier * 1.0);
  let headRisk = 10 + (seed % 20) + (workloadModifier * 0.3);

  // Marquee star calibration
  if (playerName === 'Victor Wembanyama') {
    kneeRisk = 75 + (workloadModifier * 1.2);
    footRisk = 65 + (workloadModifier * 1.1);
    hamstringRisk = 40 + (workloadModifier * 0.8);
    ankleRisk = 55 + (workloadModifier * 0.9);
    spineRisk = 48 + (workloadModifier * 0.7);
  } else if (playerName === 'Jalen Brunson') {
    ankleRisk = 74 + (workloadModifier * 1.3);
    hamstringRisk = 66 + (workloadModifier * 1.2);
    kneeRisk = 52 + (workloadModifier * 0.9);
    shoulderRisk = 45 + (workloadModifier * 0.6);
  } else if (playerName === 'Chet Holmgren') {
    footRisk = 72 + (workloadModifier * 1.1);
    kneeRisk = 62 + (workloadModifier * 1.0);
    spineRisk = 44 + (workloadModifier * 0.8);
    shoulderRisk = 48 + (workloadModifier * 0.7);
  } else if (playerName === 'Shai Gilgeous-Alexander') {
    hamstringRisk = 70 + (workloadModifier * 1.2);
    ankleRisk = 65 + (workloadModifier * 1.1);
    kneeRisk = 48 + (workloadModifier * 0.8);
  } else if (playerName === 'Kawhi Leonard') {
    kneeRisk = 82 + (workloadModifier * 0.9);
    hamstringRisk = 65 + (workloadModifier * 0.8);
    ankleRisk = 55 + (workloadModifier * 0.7);
  } else if (playerName === 'Joel Embiid') {
    kneeRisk = 85 + (workloadModifier * 1.0);
    footRisk = 75 + (workloadModifier * 1.1);
    spineRisk = 68 + (workloadModifier * 0.8);
  } else if (playerName === 'Stephen Curry') {
    ankleRisk = 62 + (workloadModifier * 1.1);
    hamstringRisk = 56 + (workloadModifier * 0.9);
  }

  // Clamping
  shoulderRisk = Math.min(99, Math.max(10, Math.round(shoulderRisk)));
  spineRisk = Math.min(99, Math.max(10, Math.round(spineRisk)));
  hipRisk = Math.min(99, Math.max(10, Math.round(hipRisk)));
  hamstringRisk = Math.min(99, Math.max(10, Math.round(hamstringRisk)));
  kneeRisk = Math.min(99, Math.max(10, Math.round(kneeRisk)));
  ankleRisk = Math.min(99, Math.max(10, Math.round(ankleRisk)));
  footRisk = Math.min(99, Math.max(10, Math.round(footRisk)));
  headRisk = Math.min(99, Math.max(10, Math.round(headRisk)));

  const risksSummarized = [
    { zoneKey: 'head', label: 'Head & Neck', score: headRisk, desc: 'Concussion & cervical strain monitoring' },
    { zoneKey: 'shoulder', label: 'Shoulders', score: shoulderRisk, desc: 'Rotator cuff & AC joint loading' },
    { zoneKey: 'spine', label: 'Spine & Lower Back', score: spineRisk, desc: 'Somatic lumber fatigue & disk safety' },
    { zoneKey: 'hip', label: 'Hips & Groin', score: hipRisk, desc: 'Adductor strain & lateral pelvic limits' },
    { zoneKey: 'hamstring', label: 'Hamstrings', score: hamstringRisk, desc: 'Eccentric deceleration strain & fiber pull fatigue' },
    { zoneKey: 'knee', label: 'Knees', score: kneeRisk, desc: 'Patellar tendonitis, loading stress & collateral ligaments' },
    { zoneKey: 'ankle', label: 'Ankles', score: ankleRisk, desc: 'Inversion/eversion stability & Achilles fatigue' },
    { zoneKey: 'foot', label: 'Feet', score: footRisk, desc: 'Plantar loading & navicular stress threshold' }
  ];

  const primaryConcern = [...risksSummarized].sort((a, b) => b.score - a.score)[0];
  const avgRisk = Math.round(
    (headRisk + shoulderRisk + spineRisk + hipRisk + hamstringRisk + kneeRisk + ankleRisk + footRisk) / 8
  );

  return {
    playerName,
    position,
    baseFatigue,
    head: headRisk,
    shoulder: shoulderRisk,
    spine: spineRisk,
    hip: hipRisk,
    hamstring: hamstringRisk,
    knee: kneeRisk,
    ankle: ankleRisk,
    foot: footRisk,
    avgRisk,
    primaryConcern,
    risks: risksSummarized
  };
}

export default function RosterBodyMap({ initialTeamName = 'New York Knicks', onPlayerSelect }: RosterBodyMapProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>(initialTeamName);
  const [searchText, setSearchText] = useState<string>('');
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [activePlayerName, setActivePlayerName] = useState<string | null>(null);
  const [workloadModifier, setWorkloadModifier] = useState<number>(0);
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'ELEVATED'>('ALL');

  // Load selected team roster
  const team = TEAM_DATA[selectedTeam];
  const roster = team?.roster || [];
  const positions = team?.positions || {};

  // Compute injury metrics for ALL roster players simultaneously
  const rosterMetrics = useMemo(() => {
    return roster.map(player => 
      getPlayerInjuryMetrics(player, selectedTeam, positions[player] || 'Player', workloadModifier)
    );
  }, [roster, selectedTeam, positions, workloadModifier]);

  // Aggregate risk statistics per body zone across the entire roster simultaneously
  const zoneAggregates = useMemo(() => {
    const keys = ['head', 'shoulder', 'spine', 'hip', 'hamstring', 'knee', 'ankle', 'foot'] as const;
    const totals: Record<string, { total: number; high: number; elevated: number; nominal: number; players: { name: string; score: number; pos: string }[] }> = {};
    
    keys.forEach(k => {
      totals[k] = { total: 0, high: 0, elevated: 0, nominal: 0, players: [] };
    });

    rosterMetrics.forEach(pMetrics => {
      keys.forEach(k => {
        const score = pMetrics[k];
        let tier: 'high' | 'elevated' | 'nominal' = 'nominal';
        if (score >= 65) tier = 'high';
        else if (score >= 45) tier = 'elevated';

        totals[k][tier]++;
        totals[k].total += score;
        totals[k].players.push({
          name: pMetrics.playerName,
          score,
          pos: pMetrics.position
        });
      });
    });

    // Average values and sort players per zone
    keys.forEach(k => {
      totals[k].players.sort((a, b) => b.score - a.score);
    });

    return totals;
  }, [rosterMetrics]);

  // Handle active player profile metrics if selected
  const activePlayerData = useMemo(() => {
    if (!activePlayerName) return null;
    return rosterMetrics.find(p => p.playerName === activePlayerName) || null;
  }, [activePlayerName, rosterMetrics]);

  // Color matching classes helper
  const getScoreColor = (score: number) => {
    if (score >= 65) return 'text-red-400 bg-red-400/10 border-red-500/20';
    if (score >= 45) return 'text-amber-400 bg-amber-400/10 border-amber-500/20';
    return 'text-green-400 bg-green-400/10 border-green-500/25';
  };

  const getPulsingIndicator = (score: number) => {
    if (score >= 65) return 'bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse';
    if (score >= 45) return 'bg-amber-500 shadow-[0_0_10px_#f59e0b]';
    return 'bg-green-500 shadow-[0_0_8px_#10b981]';
  };

  // Filter roster players for active sidebar
  const filteredRosterMetrics = useMemo(() => {
    return rosterMetrics.filter(p => {
      const matchesSearch = p.playerName.toLowerCase().includes(searchText.toLowerCase());
      if (!matchesSearch) return false;
      if (riskFilter === 'HIGH') return p.avgRisk >= 60 || p.primaryConcern.score >= 65;
      if (riskFilter === 'ELEVATED') return p.avgRisk >= 45;
      return true;
    });
  }, [rosterMetrics, searchText, riskFilter]);

  // Predefined SVG Hotspots coordinates for Human outlines
  // Normalized on a 150x400 coordinate canvas
  const anteriorHotspots = [
    { key: 'head', cx: 75, cy: 38, radius: 10, label: 'Head & Neck' },
    { key: 'shoulder', cx: 48, cy: 75, radius: 8, label: 'Shoulders (R)' },
    { key: 'shoulder2', keyAlias: 'shoulder', cx: 102, cy: 75, radius: 8, label: 'Shoulders (L)' },
    { key: 'hip', cx: 75, cy: 165, radius: 10, label: 'Hips & Groin' },
    { key: 'knee', cx: 58, cy: 260, radius: 8, label: 'Knee (R)' },
    { key: 'knee2', keyAlias: 'knee', cx: 92, cy: 260, radius: 8, label: 'Knee (L)' },
    { key: 'ankle', cx: 58, cy: 345, radius: 7, label: 'Ankle (R)' },
    { key: 'ankle2', keyAlias: 'ankle', cx: 92, cy: 345, radius: 7, label: 'Ankle (L)' },
    { key: 'foot', cx: 58, cy: 375, radius: 7, label: 'Foot & Arch (R)' },
    { key: 'foot2', keyAlias: 'foot', cx: 92, cy: 375, radius: 7, label: 'Foot & Arch (L)' }
  ];

  const posteriorHotspots = [
    { key: 'head', cx: 75, cy: 38, radius: 10, label: 'Neck & Cervical' },
    { key: 'spine', cx: 75, cy: 115, radius: 10, label: 'Spine & Lower Back' },
    { key: 'hamstring', cx: 58, cy: 215, radius: 10, label: 'Hamstring (R)' },
    { key: 'hamstring2', keyAlias: 'hamstring', cx: 92, cy: 215, radius: 10, label: 'Hamstring (L)' },
    { key: 'ankle', cx: 58, cy: 345, radius: 7, label: 'Achilles Heel (R)' },
    { key: 'ankle2', keyAlias: 'ankle', cx: 92, cy: 345, radius: 7, label: 'Achilles Heel (L)' }
  ];

  return (
    <div className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-6 md:p-8 space-y-8 relative overflow-hidden" id="roster-injury-risk-portal">
      {/* Decorative matrix style grid */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="body-map-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#body-map-grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-outline-variant/10">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#FF8F6F]">
            <Activity className="w-5 h-5 animate-pulse" />
            <span className="font-label text-xs font-bold uppercase tracking-[0.2em]">Somatic Load Center</span>
          </div>
          <h2 className="font-headline text-3xl font-black text-white tracking-tight">Roster Injury Risk Map</h2>
          <p className="font-body text-xs text-on-surface-variant max-w-xl">
            Simultaneous physical medical status mapping for all roster members. Click on body region sensors or select individual athletes to explore specific soft-tissue strain indexes.
          </p>
        </div>

        {/* Dynamic Controls Selector */}
        <div className="grid grid-cols-2 sm:flex items-center gap-3 w-full lg:w-auto">
          <div>
            <label className="block text-[8px] font-label text-on-surface-variant uppercase tracking-widest font-bold mb-1">Select Analysis Unit</label>
            <select
              value={selectedTeam}
              onChange={(e) => {
                setSelectedTeam(e.target.value);
                setActivePlayerName(null);
                setActiveZone(null);
              }}
              className="bg-surface-container border border-outline-variant/15 rounded-xl px-3 py-2 text-xs font-headline font-bold text-white focus:ring-1 focus:ring-primary outline-none"
            >
              {Object.keys(TEAM_DATA).map(teamKey => (
                <option key={teamKey} value={teamKey}>{TEAM_DATA[teamKey].name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 sm:w-44">
            <label className="block text-[8px] font-label text-on-surface-variant uppercase tracking-widest font-bold mb-1">Global Fatigue Simulator</label>
            <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/15 rounded-xl px-3 py-1.5">
              <span className="font-mono text-xs text-primary font-bold">+{workloadModifier}</span>
              <input
                type="range"
                min="0"
                max="25"
                step="5"
                value={workloadModifier}
                onChange={(e) => setWorkloadModifier(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF8F6F]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Highly Styled interactive Dual SVG Body Figure (Anterior & Posterior) */}
        <div className="lg:col-span-4 bg-surface-container/30 border border-white/[0.03] rounded-2xl p-6 flex flex-col justify-between space-y-6 relative min-h-[500px]">
          <div className="flex justify-between items-center bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
            <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-primary rounded-full animate-ping" />
              Interactive Anatomical Map
            </span>
            <button 
              onClick={() => { setActiveZone(null); setActivePlayerName(null); }}
              className="text-[9px] text-[#FF8F6F] font-bold hover:underline font-label uppercase"
            >
              Reset Filter
            </button>
          </div>

          {/* Core figures drawing layout */}
          <div className="flex justify-around items-center gap-4 flex-1 py-4">
            
            {/* Anterior (Front) View */}
            <div className="flex flex-col items-center space-y-2 select-none relative">
              <span className="text-[9px] font-label font-bold text-on-surface-variant/70 uppercase tracking-widest">Anterior View</span>
              <div className="w-[140px] h-[370px] relative">
                {/* Clean Sci-Fi vector body skeleton outline */}
                <svg viewBox="0 0 150 400" className="w-full h-full text-slate-800 opacity-80" stroke="#FF8F6F" strokeWidth="1" fill="none">
                  {/* Stylized Human silhouette head-to-toe */}
                  <path d="M 75 15 C 70 15, 68 22, 68 30 C 68 40, 72 45, 75 45 C 78 45, 82 40, 82 30 C 82 22, 80 15, 75 15 Z" strokeWidth="1.5" className="fill-surface-container-highest/60" />
                  {/* Neck */}
                  <path d="M 71 45 L 71 52 L 79 52 L 79 45" />
                  {/* Chest & Torso */}
                  <path d="M 50 64 C 65 60, 85 60, 100 64 L 105 130 C 100 142, 90 148, 75 148 C 60 148, 50 142, 45 130 Z" strokeWidth="1.5" className="fill-surface-container-highest/20" />
                  {/* Arms */}
                  <path d="M 45 66 C 36 82, 32 105, 34 135 L 30 144" />
                  <path d="M 105 66 C 114 82, 118 105, 116 135 L 120 144" />
                  {/* Pelvis */}
                  <path d="M 45 130 L 48 165 L 102 165 L 105 130 Z" />
                  {/* Legs */}
                  <path d="M 52 165 L 56 250 L 58 270 L 58 340 L 53 372 M 53 372 Q 53 378, 45 378" strokeWidth="1.5" />
                  <path d="M 98 165 L 94 250 L 92 270 L 92 340 L 97 372 M 97 372 Q 97 378, 105 378" strokeWidth="1.5" />
                </svg>

                {/* Draw interactable circular overlay sensor rings on Anterior view */}
                {anteriorHotspots.map((item, idx) => {
                  const resolvedKey = item.keyAlias || item.key;
                  const score = activePlayerData ? activePlayerData[resolvedKey as keyof typeof activePlayerData] as number : zoneAggregates[resolvedKey]?.total / roster.length || 30;
                  const activeClass = activeZone === resolvedKey ? 'border-[#FF8F6F] scale-125 bg-primary/25 bg-red-400/20' : 'border-outline-variant/30 bg-surface-container-high/60 hover:border-white/50 hover:scale-110';
                  const pStyle = getPulsingIndicator(score);
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveZone(resolvedKey);
                        setActivePlayerName(null);
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border flex items-center justify-center p-1.5 transition-all outline-none group ${activeClass}`}
                      style={{ left: `${item.cx}%`, top: `${item.cy}%` }}
                      title={`${item.label}: ${Math.round(score)}% average strain`}
                    >
                      <span className={`w-3 h-3 rounded-full flex items-center justify-center ${pStyle}`}>
                        {/* Display glowing sum counts when no player is selected */}
                        {!activePlayerName && zoneAggregates[resolvedKey] && (
                          <span className="text-[7px] text-white font-black leading-none absolute scale-[0.8] mb-0.5">
                            {zoneAggregates[resolvedKey].high + zoneAggregates[resolvedKey].elevated}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Posterior (Back) View */}
            <div className="flex flex-col items-center space-y-2 select-none relative">
              <span className="text-[9px] font-label font-bold text-on-surface-variant/70 uppercase tracking-widest">Posterior View</span>
              <div className="w-[140px] h-[370px] relative">
                {/* Back outline schema */}
                <svg viewBox="0 0 150 400" className="w-full h-full text-slate-800 opacity-80" stroke="#FF8F6F" strokeWidth="1" fill="none">
                  {/* Head */}
                  <path d="M 75 15 C 70 15, 68 22, 68 30 C 68 40, 72 45, 75 45 C 78 45, 82 40, 82 30 C 82 22, 80 15, 75 15 Z" strokeWidth="1.5" className="fill-surface-container-highest/60" />
                  {/* Back Neck */}
                  <path d="M 71 45 L 71 52 L 79 52 L 79 45" />
                  {/* Back Shoulder line & spine */}
                  <path d="M 50 64 C 65 60, 85 60, 100 64 L 105 130 C 100 142, 90 148, 75 148 C 60 148, 50 142, 45 130 Z" strokeWidth="1.5" className="fill-surface-container-highest/20" />
                  <path d="M 75 52 L 75 160" strokeDasharray="3 3" />
                  {/* Gluteus / lower pelvis */}
                  <path d="M 45 130 Q 75 140, 105 130 L 102 165 C 100 178, 50 178, 48 165 Z" />
                  {/* Back legs / hamstrings & calves model */}
                  <path d="M 52 165 L 56 250 L 58 270 L 58 340 L 53 372" strokeWidth="1.5" />
                  <path d="M 98 165 L 94 250 L 92 270 L 92 340 L 97 372" strokeWidth="1.5" />
                </svg>

                {/* Draw posterior overlay indicators */}
                {posteriorHotspots.map((item, idx) => {
                  const resolvedKey = item.keyAlias || item.key;
                  const score = activePlayerData ? activePlayerData[resolvedKey as keyof typeof activePlayerData] as number : zoneAggregates[resolvedKey]?.total / roster.length || 30;
                  const activeClass = activeZone === resolvedKey ? 'border-[#FF8F6F] scale-125 bg-primary/25 bg-red-400/20' : 'border-outline-variant/30 bg-surface-container-high/60 hover:border-white/50 hover:scale-110';
                  const pStyle = getPulsingIndicator(score);

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveZone(resolvedKey);
                        setActivePlayerName(null);
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border flex items-center justify-center p-1.5 transition-all outline-none group ${activeClass}`}
                      style={{ left: `${item.cx}%`, top: `${item.cy}%` }}
                      title={`${item.label}: ${Math.round(score)}% average strain`}
                    >
                      <span className={`w-3 h-3 rounded-full flex items-center justify-center ${pStyle}`}>
                        {!activePlayerName && zoneAggregates[resolvedKey] && (
                          <span className="text-[7px] text-white font-black leading-none absolute scale-[0.8] mb-0.5">
                            {zoneAggregates[resolvedKey].high + zoneAggregates[resolvedKey].elevated}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <p className="text-[10px] text-on-surface-variant/60 italic text-center font-body bg-white/[0.01] p-2.5 rounded-lg border border-white/5">
            Glow centers indicate average risk. Badges show count of players with elevated load.
          </p>
        </div>

        {/* MIDDLE COLUMN: Simultaneous Injury Roster Matrix & Search */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container/60 border border-outline-variant/10 rounded-2xl p-4 space-y-4">
            
            {/* Search and Filters Header */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-on-surface-variant/40 outline-none focus:border-primary/50 transition-all font-body"
                  placeholder="Query roster athletes..."
                />
              </div>

              {/* Injury Risk Tab Levels */}
              <div className="flex gap-1 bg-surface-container-high p-1 rounded-xl border border-white/5">
                {[
                  { id: 'ALL', label: 'All Roster' },
                  { id: 'HIGH', label: 'High Precaution' },
                  { id: 'ELEVATED', label: 'Elevated Only' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setRiskFilter(tab.id as any)}
                    className={`flex-1 py-1.5 rounded-lg font-label text-[9px] font-bold uppercase tracking-wider transition-all ${riskFilter === tab.id ? 'bg-primary text-black font-extrabold shadow-sm' : 'text-on-surface-variant hover:text-white'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated simultaneously highlighted roster list */}
            <h3 className="font-label text-[9px] text-on-surface-variant uppercase tracking-widest font-black flex items-center justify-between">
              <span>Active Biosensory Log ({filteredRosterMetrics.length} players)</span>
              <span>Primary strain zone</span>
            </h3>

            <div className="overflow-y-auto max-h-[360px] pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-white/5">
              {filteredRosterMetrics.length === 0 ? (
                <div className="py-12 text-center text-xs text-on-surface-variant/40 font-body">No athletes matching criteria.</div>
              ) : (
                filteredRosterMetrics.map((player) => {
                  const isCurActive = activePlayerName === player.playerName;
                  const severityStyle = getScoreColor(player.avgRisk);
                  
                  return (
                    <button
                      key={player.playerName}
                      onClick={() => {
                        setActivePlayerName(isCurActive ? null : player.playerName);
                        setActiveZone(null);
                        if (onPlayerSelect) onPlayerSelect(player.playerName);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border flex flex-col justify-between transition-all group ${
                        isCurActive 
                          ? 'bg-primary/10 border-primary/40 shadow-inner' 
                          : 'bg-surface-container border-outline-variant/5 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-surface-container-highest/60 flex items-center justify-center border border-white/5 font-mono text-[10px] font-bold text-primary group-hover:scale-105 transition-transform">
                            {TEAM_DATA[selectedTeam].numbers[player.playerName] || '00'}
                          </div>
                          <div>
                            <p className="font-headline text-xs font-bold text-white group-hover:text-primary transition-colors leading-tight">
                              {player.playerName}
                            </p>
                            <p className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest mt-0.5 leading-none">
                              {player.position}
                            </p>
                          </div>
                        </div>

                        {/* Top primary concern indicator badge */}
                        <div className="text-right">
                          <span className={`text-[9px] font-label font-bold px-2 py-1 rounded-md border uppercase tracking-wider ${getScoreColor(player.primaryConcern.score)}`}>
                            {player.primaryConcern.score}% {player.primaryConcern.label}
                          </span>
                        </div>
                      </div>

                      {/* Small inline telemetry bars */}
                      <div className="w-full grid grid-cols-4 gap-1.5 mt-3 pt-2.5 border-t border-white/[0.03]">
                        {[
                          { key: 'knee', short: 'Knee' },
                          { key: 'hamstring', short: 'Ham' },
                          { key: 'ankle', short: 'Ank' },
                          { key: 'foot', short: 'Foot' }
                        ].map((part) => {
                          const val = player[part.key as keyof typeof player] as number;
                          const barCol = val >= 65 ? 'bg-red-500' : val >= 45 ? 'bg-amber-500' : 'bg-green-500';
                          return (
                            <div key={part.key} className="flex flex-col gap-0.5">
                              <div className="flex justify-between items-center text-[7.5px] font-mono text-on-surface-variant leading-none">
                                <span>{part.short}</span>
                                <span className={val >= 65 ? 'text-red-400 font-bold' : val >= 45 ? 'text-amber-400' : 'text-green-400'}>{val}%</span>
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-0.5">
                                <div className={`h-full rounded-full ${barCol}`} style={{ width: `${val}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Detailed Biomechanical Feedback & Kinetic Protocols */}
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            
            {/* Case A: Specific Joint/Zone Selected via SVG Hotspot */}
            {activeZone && !activePlayerName && (
              <motion.div
                key="zone-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 space-y-6 h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <div>
                      <span className="text-[9px] font-label font-bold text-primary uppercase tracking-[0.2em]">Joint Precaution Focus</span>
                      <h3 className="font-headline text-2xl font-black text-white capitalize leading-tight">
                        {activeZone === 'head' ? 'Head & Cervical' : 
                         activeZone === 'shoulder' ? 'Rotator Shoulders' : 
                         activeZone === 'spine' ? 'Lower Back Spine' : 
                         activeZone === 'hip' ? 'Groin & Hips' : 
                         activeZone} Loading
                      </h3>
                    </div>
                    <button 
                      onClick={() => setActiveZone(null)}
                      className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-on-surface-variant font-label"
                    >
                      Close ×
                    </button>
                  </div>

                  {/* Summary of affected players on active team */}
                  <div className="mt-5 space-y-4">
                    <p className="text-[11px] text-on-surface-variant font-body leading-relaxed">
                      Athletic workload analysis of the <strong className="text-white">{TEAM_DATA[selectedTeam].name}</strong> at the <strong className="capitalize text-primary font-bold">{activeZone}</strong> segment. Currently highlighting roster vulnerability rankings simultaneously:
                    </p>

                    {/* mini player list focused on active zone */}
                    <div className="space-y-2 mt-4 max-h-[290px] overflow-y-auto pr-1">
                      {zoneAggregates[activeZone]?.players.slice(0, 10).map((player, idx) => {
                        const tierCol = player.score >= 65 ? 'text-red-400 font-extrabold' : player.score >= 45 ? 'text-amber-400' : 'text-green-400';
                        return (
                          <div 
                            key={idx} 
                            onClick={() => {
                              setActivePlayerName(player.name);
                              setActiveZone(null);
                            }}
                            className="flex justify-between items-center p-2.5 bg-white/[0.01] hover:bg-white/[0.04] rounded-lg border border-white/5 text-xs transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[9px] text-on-surface-variant/50">#{idx + 1}</span>
                              <p className="font-bold text-white font-body text-xs">{player.name}</p>
                              <span className="text-[8px] font-label text-on-surface-variant/40 uppercase">{player.pos}</span>
                            </div>
                            <span className={`font-mono font-bold text-xs ${tierCol}`}>{player.score}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-[#FF8F6F]/5 p-4 rounded-xl border border-[#FF8F6F]/10 space-y-1.5 mt-4">
                  <h5 className="font-label text-[9px] text-[#FF8F6F] uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" /> Kinetic Prevention Scheme
                  </h5>
                  <p className="text-[10px] text-on-surface-variant font-body leading-normal">
                    Schedule eccentric alignment repetitions targeting localized joint {activeZone} fibers to optimize rebound loading stability.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Case B: Particular Player Selected via list or click */}
            {activePlayerName && activePlayerData && (
              <motion.div
                key="player-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 space-y-5 h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start pb-4 border-b border-white/5">
                    <div>
                      <span className="text-[9px] font-label font-bold text-primary uppercase tracking-[0.2em]">Physio Evaluation Record</span>
                      <h3 className="font-headline text-xl font-black text-white leading-tight mt-0.5">{activePlayerName}</h3>
                      <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mt-1">
                        #{TEAM_DATA[selectedTeam].numbers[activePlayerName] || '00'} • {activePlayerData.position}
                      </p>
                    </div>
                    <button 
                      onClick={() => setActivePlayerName(null)}
                      className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-on-surface-variant font-label"
                    >
                      Close ×
                    </button>
                  </div>

                  {/* Player specific telemetry breakdown */}
                  <div className="space-y-4.5 mt-4">
                    <div className="flex justify-between items-center p-3.5 bg-white/[0.02] rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-primary" />
                        <span className="text-xs text-on-surface-variant font-body">Synthetic Fatigue Ratio</span>
                      </div>
                      <span className={`font-mono font-black text-lg ${activePlayerData.baseFatigue >= 70 ? 'text-red-400' : 'text-primary'}`}>
                        {activePlayerData.baseFatigue}%
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-label text-[9px] text-on-surface-variant/70 uppercase tracking-widest font-bold">Biomechanical Hazard Matrix</h4>
                      
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {activePlayerData.risks.map((risk) => {
                          const riskCol = risk.score >= 65 ? 'text-red-400 font-black' : risk.score >= 45 ? 'text-amber-400 font-bold' : 'text-green-400';
                          const progressCol = risk.score >= 65 ? 'bg-red-500' : risk.score >= 45 ? 'bg-amber-500' : 'bg-green-500';
                          return (
                            <div key={risk.zoneKey} className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-body text-white/90 text-xs font-semibold">{risk.label}</span>
                                <span className={`font-mono text-xs ${riskCol}`}>{risk.score}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${progressCol}`} style={{ width: `${risk.score}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Precautionary recoveries actions */}
                <div className="bg-[#FF8F6F]/5 border border-[#FF8F6F]/15 rounded-xl p-4 mt-4 space-y-2">
                  <h4 className="text-[10px] font-label font-bold text-[#FF8F6F] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> Core Physical Precaution
                  </h4>
                  <p className="text-[10.5px] text-on-surface-variant/90 leading-normal font-body">
                    {activePlayerName} shows elevated stress at the <strong className="text-white capitalize font-semibold">{activePlayerData.primaryConcern.label}</strong> joint. Limit direct explosive unilateral force in deceleration routines for next 48 hours.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Case C: No Selection - Displays general roster summary stats */}
            {!activeZone && !activePlayerName && (
              <motion.div
                key="default-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 flex flex-col justify-between h-full min-h-[460px] "
              >
                <div className="space-y-6">
                  <div className="pb-3 border-b border-white/5">
                    <span className="text-[9px] font-label font-bold text-primary uppercase tracking-[0.2em]">Roster Risk Report summary</span>
                    <h3 className="font-headline text-xl font-black text-white leading-none mt-1">Medical Diagnostics</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-container p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                      <span className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest leading-none">High Injury Hazard</span>
                      <p className="font-mono text-3xl font-black text-red-400 mt-2">
                        {rosterMetrics.filter(p => p.primaryConcern.score >= 65).length}
                      </p>
                      <span className="text-[8px] font-label text-on-surface-variant/50 mt-1 uppercase">Roster members</span>
                    </div>

                    <div className="bg-surface-container p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                      <span className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest leading-none">Elevated Warning</span>
                      <p className="font-mono text-3xl font-black text-amber-400 mt-2">
                        {rosterMetrics.filter(p => p.avgRisk >= 48 && p.primaryConcern.score < 65).length}
                      </p>
                      <span className="text-[8px] font-label text-on-surface-variant/50 mt-1 uppercase">Roster members</span>
                    </div>
                  </div>

                  {/* List of top 3 vulnerable athletes on team */}
                  <div className="space-y-3">
                    <h4 className="font-label text-[10px] text-on-surface-variant/70 uppercase tracking-widest font-black flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" /> Most Fatigued Candidates
                    </h4>
                    
                    <div className="space-y-2">
                      {[...rosterMetrics]
                        .sort((a, b) => b.avgRisk - a.avgRisk)
                        .slice(0, 3)
                        .map((cand, idx) => (
                          <div 
                            key={cand.playerName} 
                            onClick={() => setActivePlayerName(cand.playerName)}
                            className="p-3 bg-surface-container hover:bg-white/[0.04] rounded-xl border border-white/5 flex items-center justify-between text-xs transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-primary font-mono font-bold">#{cand.position.charAt(0)}</span>
                              <p className="font-bold text-white group-hover:text-primary transition-colors font-body">{cand.playerName}</p>
                            </div>
                            <span className="text-red-400 font-mono font-black text-xs">{cand.avgRisk}% Avg</span>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Team wide mitigation advice */}
                <div className="bg-primary/5 border border-primary/25 rounded-md p-4 mt-6 flex gap-3 items-start">
                  <Sparkles className="w-5 h-5 text-primary shrink-0 animate-pulse mt-0.5" />
                  <div>
                    <h4 className="font-label text-[10px] text-primary uppercase tracking-wider font-extrabold leading-none mb-1">Roster Recommendation</h4>
                    <p className="text-[10px] text-on-surface-variant font-body leading-normal">
                      The dynamic workload is computed with a +{workloadModifier} modifier. To alleviate tissue strain, schedule lower-body active release yoga periods in consecutive recovery tabs.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
