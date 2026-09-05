import React from 'react';
import { X, CheckCircle2, XCircle, ShieldCheck, Cpu, Lightbulb, FileText } from 'lucide-react';

interface NoveltyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoveltyComparisonModal: React.FC<NoveltyComparisonModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                SIH 2026 Problem Statement PS27 — Novelty & Architectural Blueprint
              </h3>
              <p className="text-xs text-slate-400">
                Automated Spatio-Temporal Integrated Block Planning Engine for High-Density Corridors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Key Novelty Matrix Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Core Architectural Comparison Matrix</span>
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                    <th className="p-3 font-semibold">Technical Dimension</th>
                    <th className="p-3 font-semibold text-red-400">Conventional Approach</th>
                    <th className="p-3 font-semibold text-emerald-400">RailOptima AI Architecture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  <tr>
                    <td className="p-3 font-bold text-white">1. Spatial Grouping</td>
                    <td className="p-3 text-slate-400">
                      Fragmented manual requests logged independently by P-Way, S&T, and OHE. Results in 3 separate track shutdowns.
                    </td>
                    <td className="p-3 text-emerald-300">
                      <strong>1D Linear Graph DBSCAN</strong> constrained to matching LineID. Automatically clusters concurrent demands into unified Mega Shadow Blocks.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">2. Buffer Allocation</td>
                    <td className="p-3 text-slate-400">
                      Static rule-of-thumb (+30 mins guessed by sectional controllers), leading to frequent overruns or idle track waste.
                    </td>
                    <td className="p-3 text-emerald-300">
                      <strong>Stochastic XGBoost Regressor</strong> predicts P(T ≤ t) curves based on machine age, crew experience, gradient, and weather.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">3. Routing Optimization</td>
                    <td className="p-3 text-slate-400">
                      Heuristic dispatching and manual phone coordination between station masters; cascading passenger delays.
                    </td>
                    <td className="p-3 text-emerald-300">
                      <strong>Time-Expanded MILP Network Flow (Google OR-Tools)</strong> with strict priority weights (Vande Bharat = 10.0) and bi-directional single line corridor switching.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">4. Interlocking Safety</td>
                    <td className="p-3 text-slate-400">
                      Vulnerable paper forms (T/409 Caution Order) and radio sign-offs prone to human miscommunication.
                    </td>
                    <td className="p-3 text-emerald-300">
                      <strong>Air-gapped SHA-256 cryptographic token</strong> sent to Station Electronic Interlocking (EI) racks to lock signals and point switches at danger.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Why Pure AI (Deep RL / Genetic Algorithms) Fails */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>Why Hybrid Operations Research (OR) Beats Black-Box AI in Railways</span>
            </h4>
            <p className="text-slate-300 leading-relaxed">
              In safety-critical passenger rail environments carrying over 23 million daily riders, black-box Deep
              Reinforcement Learning (DRL) and Genetic Algorithms are unacceptable due to three fundamental disqualifiers:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>
                <strong className="text-slate-200">Zero Hallucination Tolerance:</strong> MILP solvers guarantee 100%
                mathematical feasibility with no signal conflicts, head-on collisions, or phantom routes.
              </li>
              <li>
                <strong className="text-slate-200">Global Optimality Guarantees:</strong> OR-Tools explores branch-and-bound
                cuts, proving mathematical bounds rather than getting trapped in local heuristic minima.
              </li>
              <li>
                <strong className="text-slate-200">Auditable Explainability:</strong> Every loop clearing and delay penalty
                is explicitly traced to objective function weights (W_t), compliant with Indian Railways General Rules.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Close Blueprint Reference
          </button>
        </div>
      </div>
    </div>
  );
};
