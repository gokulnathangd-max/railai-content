import React, { useState } from 'react';
import { Train, ArrowRight, CheckCircle2, ShieldCheck, Zap, Clock, GitCommit, Layers, AlertTriangle } from 'lucide-react';
import { Corridor, MegaShadowBlock, MilpOptimizationResult, Train as TrainType } from '../types/railway';
import { TRAIN_CLASS_PRIORITIES } from '../algorithms/milpRouting';

interface Step4RoutingMILPProps {
  milpResult: MilpOptimizationResult | null;
  selectedCorridor: Corridor;
  megaBlocks: MegaShadowBlock[];
  onProceedToStep5: () => void;
}

export const Step4RoutingMILP: React.FC<Step4RoutingMILPProps> = ({
  milpResult,
  selectedCorridor,
  megaBlocks,
  onProceedToStep5,
}) => {
  const [selectedTrainNo, setSelectedTrainNo] = useState<string | null>(null);

  if (!milpResult) {
    return <div className="text-slate-400 p-8">No MILP optimization result available.</div>;
  }

  const { trains, loopClearings, objectiveValueZ, totalTrainDelayMin, computationTimeMs } = {
    trains: milpResult.trainSchedules,
    loopClearings: milpResult.loopClearings,
    objectiveValueZ: milpResult.objectiveValueZ,
    totalTrainDelayMin: milpResult.totalTrainDelayMin,
    computationTimeMs: milpResult.computationTimeMs,
  };

  const selectedTrain = trains.find((t) => t.trainNo === selectedTrainNo) || trains[0];

  // Marey / String-Line Chart Geometry Setup
  const stations = selectedCorridor.stations;
  const minKp = stations[0]?.kp ?? 20;
  const maxKp = stations[stations.length - 1]?.kp ?? 432;
  const kpRange = maxKp - minKp;

  const startHour = 0;
  const endHour = 8;
  const totalMinutes = (endHour - startHour) * 60;

  const chartWidth = 720;
  const chartHeight = 360;
  const margin = { top: 30, right: 30, bottom: 40, left: 60 };

  const getXByKp = (kp: number) => {
    return margin.left + ((kp - minKp) / kpRange) * (chartWidth - margin.left - margin.right);
  };

  const getYByTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const mins = h * 60 + m - startHour * 60;
    const clampedMins = Math.max(0, Math.min(totalMinutes, mins));
    return margin.top + (clampedMins / totalMinutes) * (chartHeight - margin.top - margin.bottom);
  };

  // Block coordinates for shading
  const activeBlock = megaBlocks[0];
  const blockX1 = activeBlock ? getXByKp(activeBlock.kpStart) : 0;
  const blockX2 = activeBlock ? getXByKp(activeBlock.kpEnd) : 0;
  const blockY1 = activeBlock ? getYByTime(activeBlock.optimizedWindow.start) : 0;
  const blockDuration = activeBlock?.riskAssessment?.recommendedTotalTimeMin ?? activeBlock?.optimizedWindow.durationMin ?? 180;
  const blockEndMinutes = (activeBlock ? Number(activeBlock.optimizedWindow.start.split(':')[0]) * 60 + Number(activeBlock.optimizedWindow.start.split(':')[1]) : 60) + blockDuration;
  const blockEndH = Math.floor(blockEndMinutes / 60);
  const blockEndM = blockEndMinutes % 60;
  const blockEndTimeStr = `${blockEndH.toString().padStart(2, '0')}:${blockEndM.toString().padStart(2, '0')}`;
  const blockY2 = getYByTime(blockEndTimeStr);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                NETWORK FLOW OPTIMIZATION
              </span>
              <h2 className="text-lg font-bold text-white">
                Corridor Dispatch & Traffic Precedence Engine (MILP)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Mixed-Integer Linear Programming duplicates physical tracks into discrete 1-minute intervals. Formulates:
              <code className="text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px] ml-1">
                Minimize Z = ∑ (W_t × Delay_t) + ∑ (W_b × [T_req - T_alloc])
              </code>
              . When a track is isolated, converts remaining track into a <strong>Bi-directional Time-Expanded Corridor</strong> with automated loop clearings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onProceedToStep5}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition cursor-pointer"
            >
              <span>Authorize Interlocking & Form T/409</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards: Objective Value, Delays, Bi-Directional Status */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">MILP Objective Value (Z)</div>
          <div className="text-xl font-bold text-white font-mono mt-0.5 flex items-baseline gap-1.5">
            <span>{objectiveValueZ}</span>
            <span className="text-xs text-emerald-400 font-normal">Optimal Solution</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Solved in {computationTimeMs}ms via OR-Tools</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">Vande Bharat / Rajdhani Delay</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
            0.0 min
          </div>
          <div className="text-[10px] text-slate-400 mt-1">W_t = 10.0 Hard Constraint Protected</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">Corridor Configuration</div>
          <div className="text-xl font-bold text-amber-300 mt-0.5">
            Bi-Dir Single Line
          </div>
          <div className="text-[10px] text-slate-400 mt-1">DN_MAIN handling alternating flows</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">Station Loop Clearings</div>
          <div className="text-xl font-bold text-purple-400 font-mono mt-0.5">
            {loopClearings.length} Rakes Stabled
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Held in sidings for high-speed overtakes</div>
        </div>
      </div>

      {/* The Marey / String-Line Time-Distance Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Time-Distance (Marey / String-Line) Train Trajectory Diagram</span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive 2D space-time coordinate grid showing trains bypassing the active Mega Shadow Block
            </p>
          </div>

          {/* Train Class Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {Object.entries(TRAIN_CLASS_PRIORITIES).map(([cls, info]) => (
              <span key={cls} className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-0.5 rounded" style={{ backgroundColor: info.color }}></span>
                <span>{info.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">({info.weight})</span>
              </span>
            ))}
          </div>
        </div>

        {/* SVG Stringline Graph */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[650px] h-80">
            {/* Background Station Lines (Vertical) */}
            {stations.map((stn) => {
              const x = getXByKp(stn.kp);
              return (
                <g key={stn.code}>
                  <line
                    x1={x}
                    y1={margin.top}
                    x2={x}
                    y2={chartHeight - margin.bottom}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={x}
                    y={margin.top - 10}
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {stn.code} ({stn.kp}km)
                  </text>
                </g>
              );
            })}

            {/* Background Time Lines (Horizontal) */}
            {Array.from({ length: endHour - startHour + 1 }).map((_, idx) => {
              const hour = startHour + idx;
              const timeStr = `${hour.toString().padStart(2, '0')}:00`;
              const y = getYByTime(timeStr);
              return (
                <g key={hour}>
                  <line
                    x1={margin.left}
                    y1={y}
                    x2={chartWidth - margin.right}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <text
                    x={margin.left - 10}
                    y={y + 3}
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {timeStr}
                  </text>
                </g>
              );
            })}

            {/* Shaded Red Zone: Active Mega Shadow Block on UP_MAIN */}
            {activeBlock && (
              <g>
                <rect
                  x={Math.min(blockX1, blockX2)}
                  y={Math.min(blockY1, blockY2)}
                  width={Math.max(12, Math.abs(blockX2 - blockX1))}
                  height={Math.max(20, Math.abs(blockY2 - blockY1))}
                  fill="rgba(239, 68, 68, 0.25)"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  rx="4"
                />
                <text
                  x={(blockX1 + blockX2) / 2}
                  y={(blockY1 + blockY2) / 2}
                  fill="#fca5a5"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  BLOCK A ZONE
                </text>
              </g>
            )}

            {/* Train Trajectory Stringlines */}
            {trains.map((train) => {
              const isSelected = selectedTrainNo === train.trainNo;
              const color = TRAIN_CLASS_PRIORITIES[train.trainClass].color;

              const points = train.pathNodes
                .map((node) => {
                  const stn = stations.find((s) => s.code === node.stationCode);
                  if (!stn) return null;
                  const x = getXByKp(stn.kp);
                  const y = getYByTime(node.optimizedDeparture || node.scheduledDeparture);
                  return `${x},${y}`;
                })
                .filter(Boolean)
                .join(' ');

              return (
                <g key={train.trainNo} onClick={() => setSelectedTrainNo(train.trainNo)} className="cursor-pointer">
                  <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth={isSelected ? 3.5 : 2}
                    opacity={isSelected ? 1.0 : 0.85}
                    points={points}
                  />
                  {/* Small train node dots */}
                  {train.pathNodes.map((node, i) => {
                    const stn = stations.find((s) => s.code === node.stationCode);
                    if (!stn) return null;
                    const cx = getXByKp(stn.kp);
                    const cy = getYByTime(node.optimizedDeparture || node.scheduledDeparture);
                    return (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={node.action === 'WAIT_IN_LOOP' ? 4.5 : 2.5}
                        fill={node.action === 'WAIT_IN_LOOP' ? '#f59e0b' : color}
                        stroke="#0f172a"
                        strokeWidth="1"
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Loop Line Clearings and Selected Train Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Loop Line Stabling Log (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Station Loop Line Clearing Events (Precedence Overtakes)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">MILP Scheduled</span>
          </div>

          <div className="space-y-3">
            {loopClearings.map((event) => (
              <div
                key={event.id}
                className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold font-mono">
                      {event.stationCode} {event.loopLineName}
                    </span>
                    <span className="text-slate-300 font-semibold">Held Train #{event.heldTrainNo}</span>
                  </div>
                  <span className="font-mono text-amber-400 font-semibold">
                    Held {event.heldDurationMin}m ({event.heldWindow.start} — {event.heldWindow.end})
                  </span>
                </div>

                <div className="text-slate-300 flex items-center gap-2">
                  <span className="text-slate-400">Overtaken by:</span>
                  <strong className="text-blue-300 font-mono">
                    #{event.priorityTrainNo} {event.priorityTrainName}
                  </strong>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-800">
                  {event.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Train Details & Regulation Path (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Train className="w-4 h-4 text-blue-400" />
              <span>Fleet Regulation Inspector</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Select on Graph</span>
          </div>

          {selectedTrain && (
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    #{selectedTrain.trainNo} {selectedTrain.trainName}
                  </h4>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {selectedTrain.origin} → {selectedTrain.destination}
                  </span>
                </div>
                <span
                  className="px-2.5 py-1 rounded text-[11px] font-bold text-white"
                  style={{ backgroundColor: TRAIN_CLASS_PRIORITIES[selectedTrain.trainClass].color }}
                >
                  Priority {selectedTrain.priorityWeight}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
                <div>
                  <span className="text-slate-400 text-[11px] block">Calculated Delay</span>
                  <span
                    className={`font-bold font-mono ${
                      selectedTrain.totalDelayMin === 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    +{selectedTrain.totalDelayMin} mins
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Operating Status</span>
                  <span className="font-semibold text-slate-200">
                    {selectedTrain.regulationStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Station Stop Timeline */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-medium block">Corridor Trajectory:</span>
                <div className="divide-y divide-slate-800 bg-slate-950 rounded-lg border border-slate-800 p-2">
                  {selectedTrain.pathNodes.map((node, i) => (
                    <div key={i} className="py-1.5 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-300 font-mono">{node.stationCode}</span>
                      <span className="text-slate-400">{node.platformOrLoop}</span>
                      <span className="font-mono text-blue-300 font-semibold">
                        {node.optimizedArrival} / {node.optimizedDeparture}
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
  );
};
