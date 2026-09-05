import React, { useState } from 'react';
import { Radio, ArrowRight, ShieldCheck, AlertOctagon, CheckCircle2, Layers, Clock, Zap, Wrench } from 'lucide-react';
import { Corridor, MaintenanceRequest, MegaShadowBlock } from '../types/railway';
import { compare2dVs1dDBSCAN } from '../algorithms/dbscanCluster';

interface Step2SpatialDBSCANProps {
  megaBlocks: MegaShadowBlock[];
  requests: MaintenanceRequest[];
  selectedCorridor: Corridor;
  onProceedToStep3: () => void;
  selectedBlockId: string | null;
  onSelectBlockId: (id: string) => void;
}

export const Step2SpatialDBSCAN: React.FC<Step2SpatialDBSCANProps> = ({
  megaBlocks,
  requests,
  selectedCorridor,
  onProceedToStep3,
  selectedBlockId,
  onSelectBlockId,
}) => {
  const [activeComparisonView, setActiveComparisonView] = useState<'CORRIDOR_RIBBON' | 'COMPARISON_ANALYSIS'>('CORRIDOR_RIBBON');

  const { flawed2dClusters, linear1dBenefits } = compare2dVs1dDBSCAN(requests);

  const activeBlock = megaBlocks.find((b) => b.id === selectedBlockId) || megaBlocks[0];

  // Helper for linear coordinate ribbon mapping (KP 120 -> KP 220)
  const ribbonKpMin = 120;
  const ribbonKpMax = 220;
  const ribbonKpSpan = ribbonKpMax - ribbonKpMin;

  const kpToPercent = (kp: number) => {
    return Math.min(100, Math.max(0, ((kp - ribbonKpMin) / ribbonKpSpan) * 100));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Algorithm Explanation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                SPATIAL OPTIMIZATION
              </span>
              <h2 className="text-lg font-bold text-white">
                Linear Graph-Topology DBSCAN Clustering Engine
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Maps coordinates directly onto a <strong>1D Directed Acyclic Graph (DAG) Network Space</strong> using the
              formal distance formula: <code className="text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">D_graph(i, j) = | KP(i) - KP(j) | [Enforced only if LineID_i == LineID_j]</code>. Combines
              multi-department demands into unified <strong>Integrated Mega Shadow Blocks</strong>, shutting down track exactly once!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg bg-slate-800 p-1 border border-slate-700">
              <button
                onClick={() => setActiveComparisonView('CORRIDOR_RIBBON')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                  activeComparisonView === 'CORRIDOR_RIBBON'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1D Track Ribbon
              </button>
              <button
                onClick={() => setActiveComparisonView('COMPARISON_ANALYSIS')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                  activeComparisonView === 'COMPARISON_ANALYSIS'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2D vs 1D Flaw Analysis
              </button>
            </div>

            <button
              onClick={onProceedToStep3}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition cursor-pointer"
            >
              <span>Overrun Risk Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {activeComparisonView === 'CORRIDOR_RIBBON' ? (
        <>
          {/* Visual 1D Linear Track DAG Corridor Ribbon */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>1D DAG Network Topology Ribbon (Aligarh Jn — Tundla Jn Section)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Individual P-Way, S&T, and OHE requisitions snapped to physical track lines (KP 120.0 to KP 220.0)
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                  <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500"></span> Civil (P-Way)
                </span>
                <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
                  <span className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-500"></span> S&T
                </span>
                <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
                  <span className="w-3 h-3 rounded bg-indigo-500/30 border border-indigo-500"></span> OHE
                </span>
                <span className="flex items-center gap-1.5 text-red-400 font-medium">
                  <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500"></span> Clustered Mega Block
                </span>
              </div>
            </div>

            {/* Track Ribbon Graphic Area */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 relative select-none">
              {/* Station Markers */}
              <div className="relative h-6 mb-4 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <div
                  className="absolute transform -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${kpToPercent(126.0)}%` }}
                >
                  <span className="text-white font-bold">ALJN (KP 126.0)</span>
                  <div className="w-0.5 h-3 bg-blue-400"></div>
                </div>
                <div
                  className="absolute transform -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${kpToPercent(165.0)}%` }}
                >
                  <span className="text-slate-400">Hathras (KP 165.0)</span>
                  <div className="w-0.5 h-3 bg-slate-600"></div>
                </div>
                <div
                  className="absolute transform -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${kpToPercent(205.0)}%` }}
                >
                  <span className="text-white font-bold">TDL (KP 205.0)</span>
                  <div className="w-0.5 h-3 bg-blue-400"></div>
                </div>
              </div>

              {/* TRACK 1: UP_MAIN */}
              <div className="space-y-1 mb-6">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    UP MAIN TRACK (Direction: Towards Delhi)
                  </span>
                  <span className="text-[11px] text-red-400 font-mono">
                    Integrated Mega Shadow Block A Active (KP 142.0 — KP 148.5)
                  </span>
                </div>

                {/* Track Line Rail visualization */}
                <div className="relative h-12 bg-slate-900 rounded-lg border border-slate-800 flex items-center px-2 overflow-hidden">
                  {/* Two Steel Rail Lines */}
                  <div className="absolute left-0 right-0 top-3 h-0.5 bg-slate-700"></div>
                  <div className="absolute left-0 right-0 bottom-3 h-0.5 bg-slate-700"></div>

                  {/* Sleepers Hash Pattern */}
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, #64748b 0, #64748b 2px, transparent 2px, transparent 14px)',
                    }}
                  ></div>

                  {/* Highlight Clustered Mega Block A Zone */}
                  <div
                    className="absolute top-1 bottom-1 rounded border-2 border-dashed border-red-500 bg-red-500/20 backdrop-blur-xs flex items-center justify-center cursor-pointer transition hover:bg-red-500/30"
                    style={{
                      left: `${kpToPercent(142.0)}%`,
                      width: `${kpToPercent(148.5) - kpToPercent(142.0)}%`,
                    }}
                    onClick={() => onSelectBlockId('MEGA-BLOCK-A')}
                  >
                    <span className="text-[10px] font-bold text-red-200 tracking-wider uppercase px-1 bg-red-950/80 rounded border border-red-500/60 shadow">
                      Mega Block A
                    </span>
                  </div>

                  {/* Individual Sub-tickets inside Cluster */}
                  {/* BCM Deep Screening (KP 142.4 to 148.2) */}
                  <div
                    className="absolute top-2 h-2 rounded bg-amber-400 shadow-sm"
                    title="Civil P-Way: BCM Deep Screening (KP 142.4 - 148.2)"
                    style={{
                      left: `${kpToPercent(142.4)}%`,
                      width: `${kpToPercent(148.2) - kpToPercent(142.4)}%`,
                    }}
                  ></div>

                  {/* Point Machine 104A Overhaul (KP 143.0 to 145.5) */}
                  <div
                    className="absolute top-5 h-2 rounded bg-cyan-400 shadow-sm"
                    title="S&T: Point Machine 104A Overhaul (KP 143.0 - 145.5)"
                    style={{
                      left: `${kpToPercent(143.0)}%`,
                      width: `${kpToPercent(145.5) - kpToPercent(143.0)}%`,
                    }}
                  ></div>

                  {/* Catenary Wire Dropper (KP 142.0 to 148.5) */}
                  <div
                    className="absolute bottom-2 h-2 rounded bg-indigo-400 shadow-sm"
                    title="OHE Traction: Contact Wire Renewal (KP 142.0 - 148.5)"
                    style={{
                      left: `${kpToPercent(142.0)}%`,
                      width: `${kpToPercent(148.5) - kpToPercent(142.0)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* TRACK 2: DN_MAIN (Parallel track - kept independent!) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    DN MAIN TRACK (Direction: Towards Kanpur)
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    Open for Bi-Directional Single Line Flows (Emergency Weld at KP 144 isolated)
                  </span>
                </div>

                <div className="relative h-12 bg-slate-900 rounded-lg border border-slate-800 flex items-center px-2 overflow-hidden">
                  <div className="absolute left-0 right-0 top-3 h-0.5 bg-slate-700"></div>
                  <div className="absolute left-0 right-0 bottom-3 h-0.5 bg-slate-700"></div>

                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, #64748b 0, #64748b 2px, transparent 2px, transparent 14px)',
                    }}
                  ></div>

                  {/* Isolated DN_MAIN Weld repair (KP 143.8 to 144.5) */}
                  <div
                    className="absolute top-1 bottom-1 rounded border border-amber-500 bg-amber-500/20 flex items-center justify-center px-1"
                    style={{
                      left: `${kpToPercent(143.8)}%`,
                      width: `${Math.max(3, kpToPercent(144.5) - kpToPercent(143.8))}%`,
                    }}
                    title="DN MAIN: Emergency Weld Repair (Strictly kept on separate DAG line!)"
                  >
                    <span className="text-[9px] font-bold text-amber-200">Weld</span>
                  </div>

                  {/* Flow Arrow indicating bi-directional traffic */}
                  <div className="absolute left-[70%] text-xs font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                    <span>Bi-Directional Corridor Flow ⇄</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mega Shadow Block Cards & Spatial Consolidation Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Clustered Mega Blocks List */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Unified Integrated Mega Shadow Blocks</span>
                <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Total Possession Savings: +69% Track Capacity Saved
                </span>
              </h3>

              <div className="space-y-3">
                {megaBlocks.map((block) => {
                  const isSelected = (selectedBlockId || megaBlocks[0]?.id) === block.id;

                  return (
                    <div
                      key={block.id}
                      onClick={() => onSelectBlockId(block.id)}
                      className={`p-4 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                          : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono font-bold text-xs border border-red-500/30">
                            {block.id}
                          </span>
                          <h4 className="text-sm font-bold text-white">{block.name}</h4>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                          {block.capacitySavedPct}% Capacity Saved
                        </span>
                      </div>

                      <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-slate-900/60 p-2 rounded border border-slate-700/50">
                          <span className="text-slate-400 text-[11px] block">Track Section</span>
                          <span className="font-mono text-slate-200 font-semibold">
                            KP {block.kpStart} — KP {block.kpEnd}
                          </span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded border border-slate-700/50">
                          <span className="text-slate-400 text-[11px] block">Shutdown Window</span>
                          <span className="font-mono text-blue-300 font-semibold">
                            {block.optimizedWindow.start} — {block.optimizedWindow.end}
                          </span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded border border-slate-700/50">
                          <span className="text-slate-400 text-[11px] block">Unified Duration</span>
                          <span className="font-mono text-amber-300 font-semibold">
                            {block.optimizedWindow.durationMin}m (vs {block.rawCombinedDurationMin}m raw)
                          </span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded border border-slate-700/50">
                          <span className="text-slate-400 text-[11px] block">Verticals Merged</span>
                          <span className="font-semibold text-purple-300">
                            {block.departmentsInvolved.length} Verticals
                          </span>
                        </div>
                      </div>

                      {/* Requests bundled inside */}
                      <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-slate-400">Bundled tickets:</span>
                        {block.assignedRequests.map((req) => (
                          <span
                            key={req.id}
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 text-slate-300 border border-slate-700"
                          >
                            {req.id} ({req.department.slice(0, 3)})
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Block Detailed Inspection */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Cluster Efficiency Breakdown</span>
              </h3>

              {activeBlock && (
                <div className="space-y-3.5 text-xs">
                  <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                    <span className="text-slate-400 block mb-1 font-medium">Mathematical Savings Formula:</span>
                    <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                      Saved Time = ∑(T_req) - T_unified
                      <br />
                      = {activeBlock.rawCombinedDurationMin}m - {activeBlock.optimizedWindow.durationMin}m
                      <br />
                      = <strong className="text-emerald-400">+{activeBlock.efficiencySavingsMin} minutes</strong> of
                      uninterrupted train transit preserved!
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-300">
                      <span>Isolated Corridor Length:</span>
                      <strong className="text-white font-mono">{activeBlock.isolatedTrackLengthKm} km</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Station Interlocking Boundary:</span>
                      <strong className="text-white font-mono">
                        {activeBlock.stationFrom} ↔ {activeBlock.stationTo}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Shared Gang Headcount:</span>
                      <strong className="text-white font-mono">
                        {activeBlock.assignedRequests.reduce((acc, r) => acc + r.gangCount, 0)} personnel
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Traction Power Status:</span>
                      <strong className="text-red-400 font-semibold">25kV Cut & Grounded</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <button
                      onClick={onProceedToStep3}
                      className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <span>Forward to Risk Analytics & Dynamic Buffers</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Flawed 2D vs Proposed 1D Analysis Panel */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Flawed 2D Euclidean */}
          <div className="bg-red-950/20 border border-red-500/40 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertOctagon className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wide">
                Conventional 2D Euclidean Plane Clustering (Flawed)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Traditional spatial algorithms calculate 2D Euclidean straight-line distance:
              <br />
              <code className="text-red-300 font-mono text-[11px] block mt-1 bg-red-950/60 p-2 rounded border border-red-500/30">
                D_2D(A, B) = √[ (lat_A - lat_B)² + (lon_A - lon_B)² ]
              </code>
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-red-500/20">
                <strong className="text-red-400 block mb-1">Fatal Rail Infrastructure Failure:</strong>
                Calculates distance purely in air space. Because an UP line and a DN line run 15 meters apart, standard
                2D algorithms combine them into a single cluster.
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-red-500/20">
                <strong className="text-red-400 block mb-1">Consequence:</strong>
                Simultaneously shuts down BOTH directions of a high-density double corridor, cutting throughput to 0%
                and causing severe gridlock across northern India.
              </div>
            </div>
          </div>

          {/* Proposed 1D Linear Graph DAG */}
          <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wide">
                Proposed 1D Linear Graph-Topology DBSCAN (RailOptima AI)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Snaps requests to 1D network coordinates governed by physical track connectivity:
              <br />
              <code className="text-emerald-300 font-mono text-[11px] block mt-1 bg-emerald-950/60 p-2 rounded border border-emerald-500/30">
                D_graph(i, j) = | KP(i) - KP(j) | [Enforced only if LineID_i == LineID_j]
              </code>
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-emerald-500/20">
                <strong className="text-emerald-400 block mb-1">Topology-Constrained Safety:</strong>
                Parallel tracks are mathematically isolated. UP_MAIN works are clustered together, while DN_MAIN remains
                unimpeded for bi-directional single line operations.
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-emerald-500/20">
                <strong className="text-emerald-400 block mb-1">Real-World Operational Outcome:</strong>
                Multi-vertical teams enter the block simultaneously under a single Electronic Caution Order, saving 69%
                track possession hours.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
