import React, { useState, useEffect } from 'react';
import { ShieldCheck, Train, Radio, Sparkles, FileText, Cpu, Clock, Layers } from 'lucide-react';
import { Corridor } from '../types/railway';

interface HeaderProps {
  corridors: Corridor[];
  selectedCorridor: Corridor;
  onSelectCorridor: (corridor: Corridor) => void;
  onOpenAdvisor: () => void;
  onOpenNovelty: () => void;
  activeStep: number;
  onSelectStep: (step: number) => void;
  onRunFullPipeline: () => void;
  isPipelineRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  corridors,
  selectedCorridor,
  onSelectCorridor,
  onOpenAdvisor,
  onOpenNovelty,
  activeStep,
  onSelectStep,
  onRunFullPipeline,
  isPipelineRunning,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl">
      {/* Indian National Tricolor Official Header Accent Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-slate-100 to-emerald-600"></div>

      {/* Top Ministry of Railways & Government of India Official Identity Strip */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-amber-400 tracking-wider text-xs">भारत सरकार</span>
            <span className="text-slate-600">|</span>
            <span className="font-semibold text-slate-200 tracking-wide text-[11px]">GOVERNMENT OF INDIA</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <div className="hidden sm:flex items-center space-x-2 text-slate-300 text-xs">
            <span className="font-serif text-slate-300 text-xs">रेल मंत्रालय</span>
            <span className="text-slate-600">|</span>
            <span className="font-medium text-slate-200 text-[11px]">MINISTRY OF RAILWAYS</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-[11px]">RAILWAY BOARD</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            CRIS / COA CONNECTED
          </span>

          <div className="flex items-center space-x-1.5 text-emerald-400 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] font-medium">EI Interlocking Online</span>
          </div>

          <div className="flex items-center space-x-1.5 text-slate-300 font-mono text-[11px] bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentTime || '02:00:00 IST'}</span>
          </div>
        </div>
      </div>

      {/* Main Navigation & Portal Title Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Official Portal Classification */}
        <div className="flex items-center space-x-3">
          <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-blue-700 to-slate-900 flex items-center justify-center shadow-lg border border-blue-500/30">
            <Train className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                RailOptima
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-600/40 uppercase tracking-wide">
                  NR-TIBPS Portal
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              National Rail Traffic & Integrated Block Planning System • High-Density Corridors
            </p>
          </div>
        </div>

        {/* Corridor Selector & Primary Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Corridor Selection Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-slate-400 font-medium hidden md:inline">Corridor:</span>
            <select
              value={selectedCorridor.id}
              onChange={(e) => {
                const found = corridors.find((c) => c.id === e.target.value);
                if (found) onSelectCorridor(found);
              }}
              aria-label="Select railway corridor"
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              {corridors.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name} ({c.zone})
                </option>
              ))}
            </select>
          </div>

          {/* Full Pipeline Action Button */}
          <button
            onClick={onRunFullPipeline}
            disabled={isPipelineRunning}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            <Cpu className={`w-3.5 h-3.5 ${isPipelineRunning ? 'animate-spin' : ''}`} />
            <span>{isPipelineRunning ? 'Computing Optimization...' : 'Run Optimization'}</span>
          </button>

          {/* Operations AI Advisor Button */}
          <button
            onClick={onOpenAdvisor}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Operations Advisor</span>
          </button>

          {/* Operating Rules & Technical Benchmark */}
          <button
            onClick={onOpenNovelty}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Operating Rules & Specs</span>
          </button>
        </div>
      </div>

      {/* Enterprise Operational Navigation Ribbon without "Step" labeling */}
      <div className="bg-slate-950/95 border-t border-slate-800 px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto space-x-2 py-0.5 no-scrollbar">
          {[
            { step: 0, label: 'Corridor Overview', short: 'Overview', icon: Layers },
            { step: 1, label: 'Maintenance Demands', short: 'Requisitions', icon: FileText },
            { step: 2, label: 'Spatial Block Consolidation', short: 'Spatial Clust.', icon: Radio },
            { step: 3, label: 'Overrun Risk Analytics', short: 'Risk Regress.', icon: Cpu },
            { step: 4, label: 'Corridor Flow Dispatch (MILP)', short: 'Flow Dispatch', icon: Train },
            { step: 5, label: 'Interlocking & Form T/409', short: 'Interlocking', icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => onSelectStep(item.step)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold ring-1 ring-blue-400/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="hidden md:inline">{item.label}</span>
                <span className="md:hidden">{item.short}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
