import React from 'react';
import { Layers, FileText, Radio, Cpu, Train, ShieldCheck, ArrowRight, Play, CheckCircle2, TrendingUp, Zap } from 'lucide-react';
import { Corridor, MaintenanceRequest, MegaShadowBlock, MilpOptimizationResult } from '../types/railway';

interface PipelineOverviewProps {
  selectedCorridor: Corridor;
  requests: MaintenanceRequest[];
  megaBlocks: MegaShadowBlock[];
  milpResult: MilpOptimizationResult | null;
  onSelectStep: (step: number) => void;
  onRunFullPipeline: () => void;
  isPipelineRunning: boolean;
  onOpenAdvisor: () => void;
  onOpenNovelty: () => void;
}

export const PipelineOverview: React.FC<PipelineOverviewProps> = ({
  selectedCorridor,
  requests,
  megaBlocks,
  milpResult,
  onSelectStep,
  onRunFullPipeline,
  isPipelineRunning,
  onOpenAdvisor,
  onOpenNovelty,
}) => {
  const steps = [
    {
      num: 1,
      title: 'Module 1: Demand Logging',
      subtitle: 'Multi-Department Requisition Intake',
      desc: 'Ingests unified digital requisitions from Civil (P-Way), S&T, and OHE verticals with explicit KP boundaries.',
      icon: FileText,
      status: `${requests.length} Requests Ingested`,
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    },
    {
      num: 2,
      title: 'Module 2: Spatial Consolidation',
      subtitle: '1D Linear Graph-Topology Clustering',
      desc: 'Enforces D_graph(i, j) = |KP(i) - KP(j)| strictly on matching LineID, safely consolidating parallel tracks.',
      icon: Radio,
      status: `${megaBlocks.length} Mega Blocks Clustered`,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      num: 3,
      title: 'Module 3: Overrun Analytics',
      subtitle: 'Stochastic Overrun Risk Regressor',
      desc: 'Computes completion probability curves P(T ≤ t) via crew, machine age & weather, injecting self-healing buffers.',
      icon: Cpu,
      status: '+24m Buffer Injected',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      num: 4,
      title: 'Module 4: Corridor Dispatch',
      subtitle: 'Time-Expanded Network Flow (MILP)',
      desc: 'Minimizes train delay with priority weights (W_t=10 Vande Bharat protected) and bi-directional single line routing.',
      icon: Train,
      status: `${milpResult?.totalTrainDelayMin || 0}m Total Delay`,
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
    {
      num: 5,
      title: 'Module 5: Safety Interlocking',
      subtitle: 'VDU Console & SHA-256 E-Permit',
      desc: 'Cryptographic validation tokens transmitted directly to Station Interlocking to lock signals at danger and issue Form T/409.',
      icon: ShieldCheck,
      status: 'EI Handshake Ready',
      badgeColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 pointer-events-none flex items-center justify-center">
          <Train className="w-80 h-80 text-blue-400" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
              MINISTRY OF RAILWAYS • HIGH-DENSITY CORRIDOR OPERATIONS
            </span>
            <span className="text-xs text-slate-400 font-medium">Railway Board • CRIS</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
            Automated Spatio-Temporal Integrated Block Planning System
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Eliminating fragmented, ad-hoc railway maintenance with an integrated mathematical architecture: 1D Graph-Topology
            clustering, machine learning overrun risk assessment, time-expanded MILP network flow routing, and cryptographic Electronic
            Interlocking safety tokens under Indian Railways General Rules.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onRunFullPipeline}
              disabled={isPipelineRunning}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition disabled:opacity-50 cursor-pointer"
            >
              <Play className={`w-4 h-4 ${isPipelineRunning ? 'animate-spin' : ''}`} />
              <span>{isPipelineRunning ? 'Optimizing Corridor Schedule...' : 'Execute Integrated Optimization'}</span>
            </button>

            <button
              onClick={() => onSelectStep(1)}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <span>Review Maintenance Demands</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenNovelty}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Operating Standards & Tech Specs</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5-Step Visual Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              onClick={() => onSelectStep(step.num)}
              className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 p-4 rounded-xl shadow-sm transition hover:shadow-md cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${step.badgeColor}`}>
                    {step.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{step.title}</div>
                <h4 className="text-sm font-bold text-white mt-0.5 group-hover:text-blue-300 transition">
                  {step.subtitle}
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{step.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-blue-400 font-semibold">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Corridor Overview & Real-World Novelty Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Corridor Profile (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Corridor Topological Profile</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">{selectedCorridor.id}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Railway Section:</span>
              <strong className="text-white">{selectedCorridor.name}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Zonal Administration:</span>
              <strong className="text-white">{selectedCorridor.zone}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Track Geometry:</span>
              <span className="text-slate-200 font-mono">
                {selectedCorridor.tracks.join(', ')}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Total Route Span:</span>
              <span className="text-slate-200 font-mono font-bold">
                {selectedCorridor.lengthKm} km (KP {selectedCorridor.startKp} to {selectedCorridor.endKp})
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Speed & Utilization:</span>
              <span className="text-amber-400 font-bold">
                {selectedCorridor.maxPermissibleSpeedKmph} km/h (165% Line Utilization)
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium mb-2">Interlocking Station Nodes:</div>
            <div className="flex flex-wrap gap-1.5">
              {selectedCorridor.stations.map((stn) => (
                <span
                  key={stn.code}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700"
                >
                  {stn.code} ({stn.kp}km)
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Operating Standards & Paradigm Benchmark */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Operating Standards Benchmark: Manual Planning vs RailOptima Integrated System</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">Standard Operating Protocol</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 font-medium">Operational Dimension</th>
                  <th className="pb-2 font-medium text-red-400">Conventional Practice</th>
                  <th className="pb-2 font-medium text-emerald-400">RailOptima Integrated System</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-2.5 font-semibold text-white">Spatial Consolidation</td>
                  <td className="py-2.5 text-slate-400">Fragmented manual ledgers; 3 separate track closures</td>
                  <td className="py-2.5 text-emerald-300 font-medium">1D Graph DBSCAN; unified Mega Shadow Blocks</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-semibold text-white">Buffer Allocation</td>
                  <td className="py-2.5 text-slate-400">Static rule-of-thumb (+30m guessed by controllers)</td>
                  <td className="py-2.5 text-emerald-300 font-medium">XGBoost ML regressor based on weather & machine wear</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-semibold text-white">Corridor Routing</td>
                  <td className="py-2.5 text-slate-400">Heuristic manual dispatching; cascade detention</td>
                  <td className="py-2.5 text-emerald-300 font-medium">MILP Network Flow (Google OR-Tools) with bi-dir routing</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-semibold text-white">Interlocking Safety</td>
                  <td className="py-2.5 text-slate-400">Paper Caution Orders (T/409) & radio voice sign-off</td>
                  <td className="py-2.5 text-emerald-300 font-medium">Air-gapped SHA-256 token locking signals at danger</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
