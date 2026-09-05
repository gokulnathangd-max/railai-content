import React, { useState, useEffect } from 'react';
import { Cpu, ArrowRight, AlertTriangle, ShieldCheck, TrendingUp, Sliders, CloudRain, Activity, Layers } from 'lucide-react';
import { MegaShadowBlock, RiskAssessment } from '../types/railway';
import { runXGBoostOverrunRegression, OverrunRegressorInputs } from '../algorithms/xgboostRisk';

interface Step3RiskXGBoostProps {
  megaBlocks: MegaShadowBlock[];
  selectedBlockId: string | null;
  onSelectBlockId: (id: string) => void;
  onUpdateBlockRisk: (blockId: string, risk: RiskAssessment) => void;
  onProceedToStep4: () => void;
}

export const Step3RiskXGBoost: React.FC<Step3RiskXGBoostProps> = ({
  megaBlocks,
  selectedBlockId,
  onSelectBlockId,
  onUpdateBlockRisk,
  onProceedToStep4,
}) => {
  const currentBlock = megaBlocks.find((b) => b.id === selectedBlockId) || megaBlocks[0];

  // Interactive Model Feature State
  const [machineAge, setMachineAge] = useState<number>(7);
  const [crewExperience, setCrewExperience] = useState<number>(8);
  const [gradient, setGradient] = useState<OverrunRegressorInputs['trackGradientType']>('MILD_FALLING');
  const [weather, setWeather] = useState<OverrunRegressorInputs['weatherSeverity']>('CLEAR');
  const [nightShift, setNightShift] = useState<boolean>(true);

  // Compute Risk on input change
  const [assessment, setAssessment] = useState<RiskAssessment>(() => {
    return runXGBoostOverrunRegression(currentBlock, {
      machineAgeYears: machineAge,
      crewExperienceYears: crewExperience,
      trackGradientType: gradient,
      weatherSeverity: weather,
      nightShiftFactor: nightShift,
    });
  });

  useEffect(() => {
    if (!currentBlock) return;
    const res = runXGBoostOverrunRegression(currentBlock, {
      machineAgeYears: machineAge,
      crewExperienceYears: crewExperience,
      trackGradientType: gradient,
      weatherSeverity: weather,
      nightShiftFactor: nightShift,
    });
    setAssessment(res);
    onUpdateBlockRisk(currentBlock.id, res);
  }, [currentBlock?.id, machineAge, crewExperience, gradient, weather, nightShift]);

  if (!currentBlock) {
    return <div className="text-slate-400 p-8">No Mega Block available for risk evaluation.</div>;
  }

  // Visual SVG completion curve helpers
  const curvePoints = assessment.completionCurve;
  const minTime = curvePoints[0]?.timeMin || 120;
  const maxTime = curvePoints[curvePoints.length - 1]?.timeMin || 240;
  const timeSpan = maxTime - minTime || 1;

  const svgWidth = 500;
  const svgHeight = 200;
  const padding = 35;

  const getSvgX = (t: number) => padding + ((t - minTime) / timeSpan) * (svgWidth - padding * 2);
  const getSvgY = (prob: number) => svgHeight - padding - (prob / 100) * (svgHeight - padding * 2);

  const polylinePoints = curvePoints
    .map((pt) => `${getSvgX(pt.timeMin)},${getSvgY(pt.probabilityPct)}`)
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                RISK & OVERRUN ANALYTICS
              </span>
              <h2 className="text-lg font-bold text-white">
                Stochastic Overrun Risk & Dynamic Buffer Regressor
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Evaluates the consolidated maintenance blocks through an ensemble machine learning regressor:
              <code className="text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px] ml-1">
                T_buffer = f_XGBoost(Crew_ID, Machine_Age, Track_Gradient, Weather_Telemetry)
              </code>
              . Dynamically injects calculated safety buffers to form a <strong>self-healing timetable</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Block Selector */}
            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400">Target Block:</span>
              <select
                value={currentBlock.id}
                onChange={(e) => onSelectBlockId(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer font-mono"
              >
                {megaBlocks.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.id} ({b.lineId})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onProceedToStep4}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition cursor-pointer"
            >
              <span>Corridor Dispatch (MILP)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls & Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive XGBoost Feature Parameters (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Real-Time Model Feature Telemetry</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Live Regression</span>
          </div>

          {/* Feature 1: Heavy Machinery Age */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Machine Age (BCM/CSM Hydraulic Wear)</span>
              <span className="text-amber-400 font-mono font-bold">{machineAge} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={machineAge}
              onChange={(e) => setMachineAge(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1 yr (Prime)</span>
              <span>8 yrs (Overhaul due)</span>
              <span>15 yrs (High wear)</span>
            </div>
          </div>

          {/* Feature 2: Crew Gang Experience */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Gang Seniority & Experience</span>
              <span className="text-blue-400 font-mono font-bold">{crewExperience} Years Avg</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={crewExperience}
              onChange={(e) => setCrewExperience(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Feature 3: Track Gradient */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium block">
              Track Gradient & Physical Curvature
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'LEVEL', label: 'Level (0‰)' },
                { id: 'MILD_FALLING', label: '1 in 150 (Falling)' },
                { id: 'STEEP_FALLING', label: '1 in 100 (Steep)' },
                { id: 'RISING', label: '1 in 200 (Rising)' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGradient(g.id as any)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border text-left transition cursor-pointer ${
                    gradient === g.id
                      ? 'bg-blue-600/20 text-blue-300 border-blue-500'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/60'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feature 4: Weather Telemetry */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium block">
              Weather Telemetry (Doppler Radar & Humidity)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'CLEAR', label: 'Clear Night (18°C)' },
                { id: 'MIST_LIGHT_RAIN', label: 'Mist / Drizzle' },
                { id: 'DENSE_FOG', label: 'Dense Fog (<50m)' },
                { id: 'EXTREME_HEAT_COLD', label: 'Extreme Heat (42°C)' },
              ].map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWeather(w.id as any)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border text-left transition cursor-pointer ${
                    weather === w.id
                      ? 'bg-blue-600/20 text-blue-300 border-blue-500'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/60'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feature 5: Circadian Night Shift */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700">
            <div>
              <span className="text-xs font-medium text-slate-200 block">Night-Shift Circadian Variance</span>
              <span className="text-[11px] text-slate-400">Midnight shift (00:00 — 05:00) human fatigue buffer</span>
            </div>
            <input
              type="checkbox"
              checked={nightShift}
              onChange={(e) => setNightShift(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0 cursor-pointer h-4 w-4"
            />
          </div>
        </div>

        {/* Right Column: Probability Curve & Dynamic Buffer Output (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Overrun Risk Assessment Hero Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
                  Target: {currentBlock.id} ({currentBlock.lineId})
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>Stochastic Risk Tier:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-extrabold ${
                      assessment.riskCategory === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : assessment.riskCategory === 'MODERATE'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {assessment.riskCategory} OVERRUN RISK
                  </span>
                </h3>
              </div>

              {/* Injected Buffer KPI */}
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Dynamic Self-Healing Buffer</span>
                <div className="text-2xl font-black text-amber-400 font-mono flex items-baseline justify-end gap-1">
                  <span>+{assessment.calculatedBufferMin}</span>
                  <span className="text-xs font-normal text-slate-400">min injected</span>
                </div>
              </div>
            </div>

            {/* Completion Probability Curve (SVG) */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-slate-200">
                  Calculated Completion Probability Curve P(T ≤ t)
                </span>
                <span className="font-mono text-emerald-400">Model Confidence: 94.2%</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 relative overflow-hidden">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44">
                  {/* Grid Lines */}
                  <line
                    x1={padding}
                    y1={svgHeight - padding}
                    x2={svgWidth - padding}
                    y2={svgHeight - padding}
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  <line
                    x1={padding}
                    y1={padding}
                    x2={padding}
                    y2={svgHeight - padding}
                    stroke="#334155"
                    strokeWidth="1"
                  />

                  {/* 50% line */}
                  <line
                    x1={padding}
                    y1={getSvgY(50)}
                    x2={svgWidth - padding}
                    y2={getSvgY(50)}
                    stroke="#475569"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  {/* 90% line */}
                  <line
                    x1={padding}
                    y1={getSvgY(90)}
                    x2={svgWidth - padding}
                    y2={getSvgY(90)}
                    stroke="#475569"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />

                  {/* Raw Base Duration Marker (e.g. 180m) */}
                  <line
                    x1={getSvgX(assessment.baseDurationMin)}
                    y1={padding}
                    x2={getSvgX(assessment.baseDurationMin)}
                    y2={svgHeight - padding}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                  />
                  <text
                    x={getSvgX(assessment.baseDurationMin) - 4}
                    y={padding + 14}
                    fill="#ef4444"
                    fontSize="9"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    Raw: {assessment.baseDurationMin}m
                  </text>

                  {/* Self-Healing Buffered Time Marker */}
                  <line
                    x1={getSvgX(assessment.recommendedTotalTimeMin)}
                    y1={padding}
                    x2={getSvgX(assessment.recommendedTotalTimeMin)}
                    y2={svgHeight - padding}
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  <text
                    x={getSvgX(assessment.recommendedTotalTimeMin) + 5}
                    y={padding + 14}
                    fill="#10b981"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    Buffered: {assessment.recommendedTotalTimeMin}m (95% safe)
                  </text>

                  {/* The Sigmoidal Completion Curve */}
                  <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" points={polylinePoints} />

                  {/* Points on curve */}
                  {curvePoints.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={getSvgX(pt.timeMin)}
                      cy={getSvgY(pt.probabilityPct)}
                      r="3.5"
                      fill="#3b82f6"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Axis labels */}
                  <text x={padding} y={svgHeight - 10} fill="#94a3b8" fontSize="9" fontFamily="monospace">
                    {minTime}m
                  </text>
                  <text
                    x={svgWidth - padding}
                    y={svgHeight - 10}
                    fill="#94a3b8"
                    fontSize="9"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {maxTime}m
                  </text>
                  <text x={10} y={getSvgY(50) + 3} fill="#94a3b8" fontSize="8" fontFamily="monospace">
                    50%
                  </text>
                  <text x={10} y={getSvgY(90) + 3} fill="#94a3b8" fontSize="8" fontFamily="monospace">
                    90%
                  </text>
                </svg>
              </div>

              {/* Self-Healing Recommendation Explanation */}
              <div className="mt-3 p-3 bg-slate-800/80 rounded-lg border border-slate-700 text-xs text-slate-300 leading-relaxed">
                <span className="text-amber-400 font-bold block mb-1">
                  Self-Healing Timetable Adjustment Rule:
                </span>
                {assessment.selfHealingRecommendation}
              </div>
            </div>
          </div>

          {/* Feature Importance & Attribution Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              XGBoost Feature Weight Attribution
            </h4>

            <div className="space-y-2">
              {assessment.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-200">{feat.feature}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({feat.value})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{feat.explanation}</p>
                  </div>

                  <div className="font-mono font-bold text-xs ml-4">
                    {feat.impactScore > 0 ? (
                      <span className="text-amber-400">+{feat.impactScore}m</span>
                    ) : feat.impactScore < 0 ? (
                      <span className="text-emerald-400">{feat.impactScore}m</span>
                    ) : (
                      <span className="text-slate-500">0m</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
