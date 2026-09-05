import React, { useState, useMemo, useCallback } from 'react';
import {
  HIGH_DENSITY_CORRIDORS,
  GHAZIABAD_KANPUR_CORRIDOR,
  INITIAL_MAINTENANCE_REQUESTS,
  INITIAL_TRAIN_SCHEDULE,
} from './data/corridors';
import {
  Corridor,
  InterlockingToken,
  MaintenanceRequest,
  MegaShadowBlock,
  MilpOptimizationResult,
  RiskAssessment,
} from './types/railway';
import { runLinearGraphDBSCAN } from './algorithms/dbscanCluster';
import { runXGBoostOverrunRegression } from './algorithms/xgboostRisk';
import { solveMilpCorridorRouting } from './algorithms/milpRouting';

import { Header } from './components/Header';
import { CorridorStatsBar } from './components/CorridorStatsBar';
import { PipelineOverview } from './components/PipelineOverview';
import { Step1InputLayer } from './components/Step1InputLayer';
import { Step2SpatialDBSCAN } from './components/Step2SpatialDBSCAN';
import { Step3RiskXGBoost } from './components/Step3RiskXGBoost';
import { Step4RoutingMILP } from './components/Step4RoutingMILP';
import { Step5OutputInterlocking } from './components/Step5OutputInterlocking';
import { AiStrategicAdvisor } from './components/AiStrategicAdvisor';
import { NoveltyComparisonModal } from './components/NoveltyComparisonModal';

export default function App() {
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor>(GHAZIABAD_KANPUR_CORRIDOR);
  const [requests, setRequests] = useState<MaintenanceRequest[]>(INITIAL_MAINTENANCE_REQUESTS);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>('MEGA-BLOCK-A');
  const [isPipelineRunning, setIsPipelineRunning] = useState<boolean>(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);
  const [isNoveltyOpen, setIsNoveltyOpen] = useState<boolean>(false);

  // 1. Run 1D Linear Graph DBSCAN clustering
  const baseMegaBlocks = useMemo(() => {
    return runLinearGraphDBSCAN(requests).megaBlocks;
  }, [requests]);

  // Keep track of risk overrides and interlocking tokens per block
  const [blockRiskOverrides, setBlockRiskOverrides] = useState<Record<string, RiskAssessment>>({});
  const [blockTokens, setBlockTokens] = useState<Record<string, InterlockingToken>>({});

  // Merge computed mega blocks with any active risk evaluations and tokens
  const megaBlocks = useMemo(() => {
    return baseMegaBlocks.map((block) => {
      const risk =
        blockRiskOverrides[block.id] ||
        runXGBoostOverrunRegression(block, {
          machineAgeYears: 7,
          crewExperienceYears: 8,
          trackGradientType: 'MILD_FALLING',
          weatherSeverity: 'CLEAR',
          nightShiftFactor: true,
        });

      const token = blockTokens[block.id];
      return {
        ...block,
        riskAssessment: risk,
        status: token ? ('LOCKED_EI' as const) : block.status,
        interlockingToken: token || block.interlockingToken,
      };
    });
  }, [baseMegaBlocks, blockRiskOverrides, blockTokens]);

  // 2. Run Google OR-Tools MILP Solver for corridor routing
  const milpResult = useMemo<MilpOptimizationResult>(() => {
    return solveMilpCorridorRouting(megaBlocks, INITIAL_TRAIN_SCHEDULE, selectedCorridor.id);
  }, [selectedCorridor.id, megaBlocks]);

  // Aggregate KPI metrics
  const totalSavedDisruptionMin = useMemo(() => {
    return megaBlocks.reduce((acc, b) => acc + b.efficiencySavingsMin, 0);
  }, [megaBlocks]);

  const overallCapacitySavedPct = useMemo(() => {
    if (megaBlocks.length === 0) return 0;
    const avg = megaBlocks.reduce((acc, b) => acc + b.capacitySavedPct, 0) / megaBlocks.length;
    return Math.round(avg);
  }, [megaBlocks]);

  // Handlers
  const handleAddRequest = useCallback((newReq: MaintenanceRequest) => {
    setRequests((prev) => [newReq, ...prev]);
  }, []);

  const handleDeleteRequest = useCallback((id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleUpdateBlockRisk = useCallback((blockId: string, risk: RiskAssessment) => {
    setBlockRiskOverrides((prev) => ({ ...prev, [blockId]: risk }));
  }, []);

  const handleLockBlockInterlocking = useCallback((blockId: string, token: InterlockingToken) => {
    setBlockTokens((prev) => ({ ...prev, [blockId]: token }));
  }, []);

  const handleRunFullPipeline = useCallback(() => {
    setIsPipelineRunning(true);
    // Smooth visual simulation through the 5 steps
    setTimeout(() => {
      setActiveStep(1);
    }, 400);
    setTimeout(() => {
      setActiveStep(2);
    }, 1100);
    setTimeout(() => {
      setActiveStep(3);
    }, 1800);
    setTimeout(() => {
      setActiveStep(4);
    }, 2500);
    setTimeout(() => {
      setActiveStep(5);
      setIsPipelineRunning(false);
    }, 3200);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header & Architecture Step Ribbon */}
      <Header
        corridors={HIGH_DENSITY_CORRIDORS}
        selectedCorridor={selectedCorridor}
        onSelectCorridor={(corridor) => {
          setSelectedCorridor(corridor);
          setBlockRiskOverrides({});
          setBlockTokens({});
        }}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenNovelty={() => setIsNoveltyOpen(true)}
        activeStep={activeStep}
        onSelectStep={setActiveStep}
        onRunFullPipeline={handleRunFullPipeline}
        isPipelineRunning={isPipelineRunning}
      />

      {/* Operational KPI Strip */}
      <CorridorStatsBar
        megaBlocks={megaBlocks}
        milpResult={milpResult}
        totalSavedDisruptionMin={totalSavedDisruptionMin}
        overallCapacitySavedPct={overallCapacitySavedPct}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeStep === 0 && (
          <PipelineOverview
            selectedCorridor={selectedCorridor}
            requests={requests}
            megaBlocks={megaBlocks}
            milpResult={milpResult}
            onSelectStep={setActiveStep}
            onRunFullPipeline={handleRunFullPipeline}
            isPipelineRunning={isPipelineRunning}
            onOpenAdvisor={() => setIsAdvisorOpen(true)}
            onOpenNovelty={() => setIsNoveltyOpen(true)}
          />
        )}

        {activeStep === 1 && (
          <Step1InputLayer
            requests={requests}
            onAddRequest={handleAddRequest}
            onDeleteRequest={handleDeleteRequest}
            onProceedToStep2={() => setActiveStep(2)}
            selectedCorridor={selectedCorridor}
          />
        )}

        {activeStep === 2 && (
          <Step2SpatialDBSCAN
            megaBlocks={megaBlocks}
            requests={requests}
            selectedCorridor={selectedCorridor}
            onProceedToStep3={() => setActiveStep(3)}
            selectedBlockId={selectedBlockId}
            onSelectBlockId={setSelectedBlockId}
          />
        )}

        {activeStep === 3 && (
          <Step3RiskXGBoost
            megaBlocks={megaBlocks}
            selectedBlockId={selectedBlockId}
            onSelectBlockId={setSelectedBlockId}
            onUpdateBlockRisk={handleUpdateBlockRisk}
            onProceedToStep4={() => setActiveStep(4)}
          />
        )}

        {activeStep === 4 && (
          <Step4RoutingMILP
            milpResult={milpResult}
            selectedCorridor={selectedCorridor}
            megaBlocks={megaBlocks}
            onProceedToStep5={() => setActiveStep(5)}
          />
        )}

        {activeStep === 5 && (
          <Step5OutputInterlocking
            megaBlocks={megaBlocks}
            selectedBlockId={selectedBlockId}
            onSelectBlockId={setSelectedBlockId}
            onLockBlockInterlocking={handleLockBlockInterlocking}
          />
        )}
      </main>

      {/* AI Strategic Advisor Drawer/Modal */}
      <AiStrategicAdvisor
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        selectedCorridor={selectedCorridor}
        megaBlocks={megaBlocks}
        trains={milpResult?.trainSchedules || INITIAL_TRAIN_SCHEDULE}
      />

      {/* SIH 2026 Novelty Matrix Modal */}
      <NoveltyComparisonModal isOpen={isNoveltyOpen} onClose={() => setIsNoveltyOpen(false)} />

      {/* Footer Strip */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            RailOptima AI • Smart India Hackathon (SIH 2026) Problem Statement PS27 • Ministry of Railways
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Linear Graph DBSCAN + Stochastic XGBoost + Google OR-Tools MILP + SHA-256 EI
          </div>
        </div>
      </footer>
    </div>
  );
}
