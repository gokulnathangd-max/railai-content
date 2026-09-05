import { Department, MaintenanceRequest, MegaShadowBlock, TrackLineId } from '../types/railway';

export interface DbscanClusterOptions {
  epsKp: number; // Max distance along same track in km (default 5.0 km)
  temporalOverlapToleranceMin: number; // Max minutes separation between preferred windows (default 60 min)
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const norm = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Linear Graph-Topology Distance strictly adheres to SIH 2026 Blueprint Step 2:
 * D_graph(i, j) = | KP(i) - KP(j) | [Enforced only if LineID_i == LineID_j]
 * Returns Infinity if on different lines (e.g. UP_MAIN vs DN_MAIN)
 */
export function calculateLinearTrackGraphDistance(
  reqA: MaintenanceRequest,
  reqB: MaintenanceRequest
): number {
  if (reqA.lineId !== reqB.lineId) {
    return Infinity; // Disconnected DAG edges - CANNOT BE CLUSTERED!
  }

  // Interval distance on 1D linear track graph
  const aStart = Math.min(reqA.kpStart, reqA.kpEnd);
  const aEnd = Math.max(reqA.kpStart, reqA.kpEnd);
  const bStart = Math.min(reqB.kpStart, reqB.kpEnd);
  const bEnd = Math.max(reqB.kpStart, reqB.kpEnd);

  // If intervals overlap or touch
  if (aStart <= bEnd && bStart <= aEnd) {
    return 0; // Directly overlapping physical track span
  }

  // Otherwise gap between boundaries
  return Math.max(0, Math.max(aStart - bEnd, bStart - aEnd));
}

/**
 * Checks if preferred operational time windows overlap or intersect within tolerance
 */
export function checkTemporalIntersection(
  reqA: MaintenanceRequest,
  reqB: MaintenanceRequest,
  toleranceMin: number = 45
): boolean {
  const aStart = timeToMinutes(reqA.preferredStartTime);
  const aEnd = timeToMinutes(reqA.preferredEndTime);
  const bStart = timeToMinutes(reqB.preferredStartTime);
  const bEnd = timeToMinutes(reqB.preferredEndTime);

  // Check window intersection with tolerance
  const overlap = Math.min(aEnd, bEnd) - Math.max(aStart, bStart);
  return overlap >= -toleranceMin;
}

/**
 * Linear Graph-Topology DBSCAN Clustering Engine
 */
export function runLinearGraphDBSCAN(
  requests: MaintenanceRequest[],
  options: Partial<DbscanClusterOptions> = {}
): {
  megaBlocks: MegaShadowBlock[];
  unclusteredRequests: MaintenanceRequest[];
  totalSavedDisruptionMin: number;
  overallCapacitySavedPct: number;
} {
  const epsKp = options.epsKp ?? 5.0; // 5 km track neighborhood
  const tempTolerance = options.temporalOverlapToleranceMin ?? 45;

  const visited = new Set<string>();
  const clusters: MaintenanceRequest[][] = [];

  for (const req of requests) {
    if (visited.has(req.id)) continue;
    visited.add(req.id);

    // Find linear track neighbors
    const neighbors = requests.filter((other) => {
      if (other.id === req.id) return false;
      const dist = calculateLinearTrackGraphDistance(req, other);
      const tempOverlap = checkTemporalIntersection(req, other, tempTolerance);
      return dist <= epsKp && tempOverlap;
    });

    if (neighbors.length === 0) {
      // Single isolated maintenance block
      clusters.push([req]);
    } else {
      const currentCluster = [req];
      const queue = [...neighbors];

      for (let i = 0; i < queue.length; i++) {
        const neighbor = queue[i];
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);

          const secondaryNeighbors = requests.filter((other) => {
            if (other.id === neighbor.id || visited.has(other.id)) return false;
            const dist = calculateLinearTrackGraphDistance(neighbor, other);
            const tempOverlap = checkTemporalIntersection(neighbor, other, tempTolerance);
            return dist <= epsKp && tempOverlap;
          });

          queue.push(...secondaryNeighbors);
        }
        if (!currentCluster.some((c) => c.id === neighbor.id)) {
          currentCluster.push(neighbor);
        }
      }

      clusters.push(currentCluster);
    }
  }

  // Convert clusters into Integrated Mega Shadow Blocks
  let totalRawDurationMin = 0;
  let totalOptimizedDurationMin = 0;

  const megaBlocks: MegaShadowBlock[] = clusters.map((clusterReqs, idx) => {
    const lineId: TrackLineId = clusterReqs[0].lineId;
    const corridorId = clusterReqs[0].corridorId;
    const stationFrom = clusterReqs[0].stationFrom;
    const stationTo = clusterReqs[0].stationTo;

    const kpMin = Math.min(...clusterReqs.map((r) => Math.min(r.kpStart, r.kpEnd)));
    const kpMax = Math.max(...clusterReqs.map((r) => Math.max(r.kpStart, r.kpEnd)));

    // Time window calculation
    const startMins = clusterReqs.map((r) => timeToMinutes(r.preferredStartTime));
    const endMins = clusterReqs.map((r) => timeToMinutes(r.preferredEndTime));
    const rawDurations = clusterReqs.map((r) => r.requestedDurationMin);

    const clusterStartMin = Math.min(...startMins);
    const clusterEndMin = Math.max(...endMins);
    const unifiedDurationMin = Math.max(...rawDurations, clusterEndMin - clusterStartMin);

    const rawSumDurationMin = rawDurations.reduce((acc, v) => acc + v, 0);
    const savedDurationMin = Math.max(0, rawSumDurationMin - unifiedDurationMin);
    const capacitySavedPct = rawSumDurationMin > 0 ? Math.round((savedDurationMin / rawSumDurationMin) * 100) : 0;

    totalRawDurationMin += rawSumDurationMin;
    totalOptimizedDurationMin += unifiedDurationMin;

    const depts = Array.from(new Set(clusterReqs.map((r) => r.department))) as Department[];

    return {
      id: `MEGA-BLOCK-${String.fromCharCode(65 + idx)}`,
      name: `Integrated Mega Shadow Block ${String.fromCharCode(65 + idx)} (${lineId.replace('_', ' ')})`,
      corridorId,
      lineId,
      kpStart: Number(kpMin.toFixed(1)),
      kpEnd: Number(kpMax.toFixed(1)),
      stationFrom,
      stationTo,
      assignedRequests: clusterReqs,
      departmentsInvolved: depts,
      rawCombinedDurationMin: rawSumDurationMin,
      optimizedWindow: {
        start: minutesToTime(clusterStartMin),
        end: minutesToTime(clusterStartMin + unifiedDurationMin),
        durationMin: unifiedDurationMin,
      },
      isolatedTrackLengthKm: Number((kpMax - kpMin).toFixed(2)),
      efficiencySavingsMin: savedDurationMin,
      capacitySavedPct,
      status: 'PENDING_EVALUATION',
    };
  });

  const totalSavedDisruptionMin = Math.max(0, totalRawDurationMin - totalOptimizedDurationMin);
  const overallCapacitySavedPct =
    totalRawDurationMin > 0 ? Math.round((totalSavedDisruptionMin / totalRawDurationMin) * 100) : 0;

  return {
    megaBlocks,
    unclusteredRequests: requests.filter((r) => !megaBlocks.some((b) => b.assignedRequests.some((ar) => ar.id === r.id))),
    totalSavedDisruptionMin,
    overallCapacitySavedPct,
  };
}

/**
 * Generates an educational comparison showing why 2D Euclidean fails vs 1D Linear DAG
 */
export function compare2dVs1dDBSCAN(requests: MaintenanceRequest[]) {
  // 2D Euclidean grouping ignores LineID and groups parallel tracks
  const flawed2dClusters = [
    {
      name: 'Flawed 2D Euclidean Geographic Cluster',
      errorExplanation: 'Inappropriately merges UP_MAIN (P-Way BCM) and DN_MAIN (Emergency Weld) simply because GPS coordinates are 15 meters apart in 2D space. Shutting down both tracks simultaneously cripples entire division throughput!',
      falselyGroupedTracks: ['UP_MAIN', 'DN_MAIN'],
      riskSeverity: 'CRITICAL HAZARD - ZERO CAPACITY LOSS',
    },
  ];

  const linear1dBenefits = [
    {
      title: 'Topology-Aware Snapping',
      description: 'D_graph(i, j) = |KP(i) - KP(j)| strictly enforces LineID_i == LineID_j. Parallel tracks remain independent.',
    },
    {
      title: 'Bi-Directional Redirection Feasibility',
      description: 'By isolating only UP_MAIN, the parallel DN_MAIN track can be dynamically converted into a bi-directional time-expanded corridor.',
    },
    {
      title: 'Single Joint Possession Permit',
      description: 'P-Way, S&T, and OHE enter the same isolated section under a single Station Master Interlocking token.',
    },
  ];

  return { flawed2dClusters, linear1dBenefits };
}
