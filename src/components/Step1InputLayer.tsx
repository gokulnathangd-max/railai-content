import React, { useState } from 'react';
import { Plus, Wrench, Radio, Zap, AlertTriangle, CheckCircle, Clock, Trash2, ArrowRight } from 'lucide-react';
import { Corridor, Department, MaintenanceRequest, PriorityLevel, TrackLineId } from '../types/railway';

interface Step1InputLayerProps {
  requests: MaintenanceRequest[];
  onAddRequest: (req: MaintenanceRequest) => void;
  onDeleteRequest: (id: string) => void;
  onProceedToStep2: () => void;
  selectedCorridor: Corridor;
}

export const Step1InputLayer: React.FC<Step1InputLayerProps> = ({
  requests,
  onAddRequest,
  onDeleteRequest,
  onProceedToStep2,
  selectedCorridor,
}) => {
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<Department | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [department, setDepartment] = useState<Department>('CIVIL_PWAY');
  const [title, setTitle] = useState('');
  const [activityType, setActivityType] = useState('Track Deep Screening & Geotextile Laying');
  const [lineId, setLineId] = useState<TrackLineId>('UP_MAIN');
  const [stationFrom, setStationFrom] = useState(selectedCorridor.stations[1]?.code || 'ALJN');
  const [stationTo, setStationTo] = useState(selectedCorridor.stations[2]?.code || 'TDL');
  const [kpStart, setKpStart] = useState<number>(142.4);
  const [kpEnd, setKpEnd] = useState<number>(148.2);
  const [durationMin, setDurationMin] = useState<number>(180);
  const [startTime, setStartTime] = useState('01:00');
  const [endTime, setEndTime] = useState('04:00');
  const [machinery, setMachinery] = useState('BCM-08, BRM-12');
  const [crewId, setCrewId] = useState('GANG-NCR-PW-44');
  const [gangCount, setGangCount] = useState(24);
  const [requiresTractionCut, setRequiresTractionCut] = useState(false);
  const [speedRestriction, setSpeedRestriction] = useState<number | undefined>(30);
  const [priority, setPriority] = useState<PriorityLevel>('SAFETY_CRITICAL');
  const [machineAgeYears, setMachineAgeYears] = useState(6);
  const [trackGradient, setTrackGradient] = useState('1 in 150 Falling');

  const filteredRequests = requests.filter((r) =>
    selectedDeptFilter === 'ALL' ? true : r.department === selectedDeptFilter
  );

  const handleDepartmentChange = (dept: Department) => {
    setDepartment(dept);
    if (dept === 'CIVIL_PWAY') {
      setTitle('Ballast Cleaning Machine (BCM) Deep Screening');
      setActivityType('Track Deep Screening & Geotextile Laying');
      setMachinery('BCM-08, BRM-12 Ballast Regulator');
      setRequiresTractionCut(false);
      setSpeedRestriction(30);
    } else if (dept === 'SNT_SIGNAL') {
      setTitle('Point Machine Overhaul & Digital Axle Counter Calibration');
      setActivityType('Switch Point Motor Overhaul & Dual Glued Joint Testing');
      setMachinery('S&T Diagnostic Van-03, Axle Calibration Unit');
      setRequiresTractionCut(false);
      setSpeedRestriction(undefined);
    } else if (dept === 'OHE_TRACTION') {
      setTitle('Overhead Catenary Wire Dropper Renewal & Portal Inspection');
      setActivityType('Overhead Contact Wire Tensioning & Power Isolation');
      setMachinery('Tower Wagon TW-NCR-11, Ladder Trolley LT-04');
      setRequiresTractionCut(true);
      setSpeedRestriction(undefined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: MaintenanceRequest = {
      id: `REQ-${department.slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      department,
      title: title || `${department} Track Work`,
      activityType,
      corridorId: selectedCorridor.id,
      lineId,
      stationFrom,
      stationTo,
      kpStart: Number(kpStart),
      kpEnd: Number(kpEnd),
      requestedDurationMin: Number(durationMin),
      preferredStartTime: startTime,
      preferredEndTime: endTime,
      machineryIds: machinery.split(',').map((s) => s.trim()).filter(Boolean),
      crewId,
      gangCount: Number(gangCount),
      requiresTractionCut,
      imposedSpeedRestrictionKmph: speedRestriction ? Number(speedRestriction) : undefined,
      priority,
      status: 'PENDING',
      machineAgeYears: Number(machineAgeYears),
      trackGradient,
      weatherCondition: 'Clear Night, 18°C',
      submittedAt: new Date().toISOString(),
    };

    onAddRequest(newReq);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Description */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                DIVISIONAL REQUISITIONS
              </span>
              <h2 className="text-lg font-bold text-white">
                Multi-Department Maintenance Demand Portal
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Official intake interface for Indian Railways divisional engineering departments. Ingests verified requisition
              schedules across <strong>Civil (Permanent Way)</strong>,{' '}
              <strong>Signaling & Telecommunication (S&T)</strong>, and <strong>Traction/Overhead Equipment (OHE)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Maintenance Demand</span>
            </button>

            <button
              onClick={onProceedToStep2}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition cursor-pointer"
            >
              <span>Consolidate Blocks (1D Graph)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Department Filter Strip */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Filter Vertical:</span>
            <div className="inline-flex rounded-lg bg-slate-800/80 p-1 border border-slate-700">
              {[
                { id: 'ALL', label: `All Verticals (${requests.length})` },
                { id: 'CIVIL_PWAY', label: 'Civil / P-Way' },
                { id: 'SNT_SIGNAL', label: 'S&T (Signals)' },
                { id: 'OHE_TRACTION', label: 'OHE (Traction)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDeptFilter(tab.id as any)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                    selectedDeptFilter === tab.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{requests.length} pending maintenance demands awaiting spatial-temporal clustering</span>
          </div>
        </div>
      </div>

      {/* Maintenance Request Cards / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Active Maintenance Requisitions</span>
            <span className="text-xs font-normal text-slate-400 font-mono">
              ({filteredRequests.length} listed)
            </span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Corridor: {selectedCorridor.name}
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {filteredRequests.map((req) => {
            const isCivil = req.department === 'CIVIL_PWAY';
            const isSnt = req.department === 'SNT_SIGNAL';
            const isOhe = req.department === 'OHE_TRACTION';

            return (
              <div
                key={req.id}
                className="p-5 hover:bg-slate-800/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Department Icon & Activity */}
                <div className="flex items-start space-x-3.5 max-w-xl">
                  <div
                    className={`p-2.5 rounded-lg border mt-0.5 ${
                      isCivil
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : isSnt
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                    }`}
                  >
                    {isCivil && <Wrench className="w-5 h-5" />}
                    {isSnt && <Radio className="w-5 h-5" />}
                    {isOhe && <Zap className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isCivil
                            ? 'bg-amber-500/20 text-amber-300'
                            : isSnt
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-indigo-500/20 text-indigo-300'
                        }`}
                      >
                        {isCivil ? 'CIVIL (P-WAY)' : isSnt ? 'S&T (SIGNALING)' : 'OHE (TRACTION)'}
                      </span>
                      <span className="font-mono text-xs text-slate-400">{req.id}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          req.priority === 'EMERGENCY'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-slate-700/60 text-slate-300'
                        }`}
                      >
                        {req.priority}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white mt-1">{req.title}</h4>
                    <p className="text-xs text-slate-400">{req.activityType}</p>

                    {/* Spatial and Technical Parameters */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700 font-mono">
                        Line: {req.lineId}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-mono">
                        Limits: KP {req.kpStart} — KP {req.kpEnd} ({(req.kpEnd - req.kpStart).toFixed(1)} km)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        Stations: {req.stationFrom} → {req.stationTo}
                      </span>
                      {req.requiresTractionCut && (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-semibold flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Power Cut Required
                        </span>
                      )}
                      {req.imposedSpeedRestrictionKmph && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                          SR: {req.imposedSpeedRestrictionKmph} km/h
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Logistics, Preferred Window & Actions */}
                <div className="flex items-end md:items-center justify-between md:justify-end gap-5">
                  <div className="text-right">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-mono justify-end">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>
                        {req.preferredStartTime} — {req.preferredEndTime} ({req.requestedDurationMin}m)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Gang: <span className="text-slate-200">{req.crewId}</span> ({req.gangCount} men)
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                      Machinery: <span className="text-slate-300">{req.machineryIds.join(', ')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteRequest(req.id)}
                    title="Delete Request"
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Maintenance Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Log Field Maintenance Requisition
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Department Vertical Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Technical Vertical / Branch
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CIVIL_PWAY', label: 'Civil (P-Way)', icon: Wrench },
                    { id: 'SNT_SIGNAL', label: 'S&T (Signal)', icon: Radio },
                    { id: 'OHE_TRACTION', label: 'OHE (Traction)', icon: Zap },
                  ].map((dept) => {
                    const Icon = dept.icon;
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => handleDepartmentChange(dept.id as Department)}
                        className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                          department === dept.id
                            ? 'bg-blue-600/20 text-blue-300 border-blue-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/60'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{dept.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Activity Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Work Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Activity Specification
                  </label>
                  <input
                    type="text"
                    required
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Track Line & Spatial Bounds */}
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/70 space-y-3">
                <div className="text-xs font-semibold text-blue-400">
                  Spatial Bounds (Linear DAG Network Space)
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Track Line ID</label>
                    <select
                      value={lineId}
                      onChange={(e) => setLineId(e.target.value as TrackLineId)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="UP_MAIN">UP_MAIN (Direction 1)</option>
                      <option value="DN_MAIN">DN_MAIN (Direction 2)</option>
                      <option value="3RD_LINE">3RD_LINE</option>
                      <option value="LOOP_LINE_UP">LOOP_LINE_UP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">From Station</label>
                    <input
                      type="text"
                      value={stationFrom}
                      onChange={(e) => setStationFrom(e.target.value.toUpperCase())}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">To Station</label>
                    <input
                      type="text"
                      value={stationTo}
                      onChange={(e) => setStationTo(e.target.value.toUpperCase())}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Kilometre Post Start (KP)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={kpStart}
                      onChange={(e) => setKpStart(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Kilometre Post End (KP)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={kpEnd}
                      onChange={(e) => setKpEnd(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Time Window & Demands */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Preferred Start
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Preferred End
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    value={durationMin}
                    onChange={(e) => setDurationMin(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Heavy Machinery & Gang count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Heavy Machinery IDs
                  </label>
                  <input
                    type="text"
                    value={machinery}
                    onChange={(e) => setMachinery(e.target.value)}
                    placeholder="e.g. BCM-08, CSM-12"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Crew Gang ID & Headcount
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={crewId}
                      onChange={(e) => setCrewId(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                    />
                    <input
                      type="number"
                      value={gangCount}
                      onChange={(e) => setGangCount(Number(e.target.value))}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Physical Track Variables (for XGBoost model) */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Machine Age (Years)</label>
                  <input
                    type="number"
                    value={machineAgeYears}
                    onChange={(e) => setMachineAgeYears(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Track Gradient</label>
                  <input
                    type="text"
                    value={trackGradient}
                    onChange={(e) => setTrackGradient(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Speed Restriction (km/h)</label>
                  <input
                    type="number"
                    placeholder="None"
                    value={speedRestriction || ''}
                    onChange={(e) => setSpeedRestriction(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Traction cut checkbox */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="oheCut"
                  checked={requiresTractionCut}
                  onChange={(e) => setRequiresTractionCut(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="oheCut" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Requires 25kV Traction Power Cut & Overhead Earthing Discharge
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition cursor-pointer"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
