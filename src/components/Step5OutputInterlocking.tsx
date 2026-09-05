import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Unlock, CheckCircle2, Copy, Printer, QrCode, FileText, Zap, Radio, KeyRound } from 'lucide-react';
import { InterlockingToken, MegaShadowBlock } from '../types/railway';
import { generateInterlockingToken } from '../algorithms/interlockingCrypto';

interface Step5OutputInterlockingProps {
  megaBlocks: MegaShadowBlock[];
  selectedBlockId: string | null;
  onSelectBlockId: (id: string) => void;
  onLockBlockInterlocking: (blockId: string, token: InterlockingToken) => void;
}

export const Step5OutputInterlocking: React.FC<Step5OutputInterlockingProps> = ({
  megaBlocks,
  selectedBlockId,
  onSelectBlockId,
  onLockBlockInterlocking,
}) => {
  const currentBlock = megaBlocks.find((b) => b.id === selectedBlockId) || megaBlocks[0];

  const [isHandshaking, setIsHandshaking] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [token, setToken] = useState<InterlockingToken | null>(currentBlock?.interlockingToken || null);

  // Initialize or fetch token
  const handleTriggerInterlockingLockout = async () => {
    if (!currentBlock) return;
    setIsHandshaking(true);

    // Simulate 1.2s air-gapped cryptographic handshake to Siemens/Ansaldo EI Rack
    setTimeout(async () => {
      const genToken = await generateInterlockingToken(currentBlock);
      setToken(genToken);
      onLockBlockInterlocking(currentBlock.id, genToken);
      setIsHandshaking(false);
    }, 1200);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (!currentBlock) {
    return <div className="text-slate-400 p-8">No Mega Block available for interlocking generation.</div>;
  }

  const isLocked = currentBlock.status === 'LOCKED_EI' || !!token;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Step 5: Output Layer
              </span>
              <h2 className="text-lg font-bold text-white">
                Read-Only VDU Console Electronic Ticket & Station Interlocking Handshake
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Replaces vulnerable paper forms and radio voice sign-offs with an automated, cryptographically signed
              validation protocol. Packages parameters into a read-only JSON token secured with a <strong>SHA-256 validation hash</strong>,
              transmitting instructions directly to the <strong>Station Electronic Interlocking (EI)</strong> to physically lock signals and switches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerInterlockingLockout}
              disabled={isHandshaking || isLocked}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition shadow-lg cursor-pointer ${
                isLocked
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
              }`}
            >
              {isLocked ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Interlocking Lockout ACTIVE</span>
                </>
              ) : isHandshaking ? (
                <>
                  <KeyRound className="w-4 h-4 animate-spin" />
                  <span>Hashing & Transmitting...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Transmit EI Cryptographic Lockout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: VDU Mimic Panel (Left) & Digital Caution Ticket (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Station Electronic Interlocking (EI) VDU Mimic Console (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Station Electronic Interlocking (EI) VDU Mimic Console
              </h3>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <span>Rack: EI-ALJN-R02</span>
              <span>•</span>
              <span className={isLocked ? 'text-red-400 font-bold' : 'text-slate-400'}>
                {isLocked ? 'SECTION INTERLOCKED' : 'NORMAL'}
              </span>
            </div>
          </div>

          {/* Graphical Signaling Mimic Board */}
          <div className="bg-black/90 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-5">
            {/* UP MAIN Track Section in Station Interlocking */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>UP MAIN LINE (ALJN ⇄ TDL BLOCK SECTION)</span>
                <span className={isLocked ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {isLocked ? '● TRACK OCCUPIED / LOCKED OUT' : '○ TRACK CLEAR'}
                </span>
              </div>

              {/* Physical Mimic Track Circuit Graphic */}
              <div className="relative h-14 bg-slate-950 rounded border border-slate-800 flex items-center px-4 overflow-hidden">
                {/* Track line (Red when locked out, Green when normal) */}
                <div
                  className={`absolute left-0 right-0 h-1.5 transition-colors duration-500 ${
                    isLocked ? 'bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.8)]' : 'bg-emerald-600'
                  }`}
                ></div>

                {/* Signal S-14 (Starter) */}
                <div className="absolute left-10 flex flex-col items-center">
                  <div className="text-[10px] text-slate-400 font-bold mb-1">S-14</div>
                  <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center p-0.5">
                    <div
                      className={`w-3 h-3 rounded-full transition ${
                        isLocked
                          ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                          : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                      }`}
                    ></div>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1">{isLocked ? 'RED' : 'GRN'}</span>
                </div>

                {/* Point Switch 102A/B */}
                <div className="absolute left-[38%] flex flex-col items-center">
                  <div className="text-[10px] text-amber-400 font-bold mb-1">PT 102A</div>
                  <div
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isLocked
                        ? 'bg-red-950/80 text-red-300 border-red-500'
                        : 'bg-slate-900 text-slate-300 border-slate-700'
                    }`}
                  >
                    {isLocked ? 'CLAMPED NORMAL' : 'UNLOCKED'}
                  </div>
                </div>

                {/* Signal S-18 (Advanced Starter - Route Boundary) */}
                <div className="absolute right-12 flex flex-col items-center">
                  <div className="text-[10px] text-slate-400 font-bold mb-1">S-18</div>
                  <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center p-0.5">
                    <div
                      className={`w-3 h-3 rounded-full transition ${
                        isLocked
                          ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                          : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                      }`}
                    ></div>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1">{isLocked ? 'RED' : 'GRN'}</span>
                </div>
              </div>
            </div>

            {/* Traction OHE 25kV Status & Hardware Lock Relays */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs">
                  <Zap className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-slate-300 font-bold">25kV OHE Circuit Breaker</span>
                </div>
                <div className="text-sm font-bold font-mono text-red-400">
                  {isLocked ? 'TRIPPED & EARTHED' : 'ENERGIZED (25,000V)'}
                </div>
                <span className="text-[10px] text-slate-500 block">Feeder: ALJN-FP-03 Isolated</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-300 font-bold">Physical Point Clamps</span>
                </div>
                <div className="text-sm font-bold font-mono text-amber-300">
                  {isLocked ? 'PADLOCK ENGAGED (2/2)' : 'STANDBY ARMED'}
                </div>
                <span className="text-[10px] text-slate-500 block">Switch point motor isolated</span>
              </div>
            </div>

            {/* Electronic Interlocking Command Log Stream */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1 max-h-36 overflow-y-auto">
              <div className="text-blue-400 font-bold">[EI-SYSTEM-STREAM 2026-09-05]</div>
              {isLocked ? (
                <>
                  <div className="text-emerald-400">✔ SHA-256 Handshake Verified by Station Interlocking Processor</div>
                  <div className="text-red-400">🔒 Command: LOCK_ROUTE_SECTION(UP_MAIN, KP 142.0 - 148.5)</div>
                  <div className="text-red-400">🔒 S-14 Aspect forced to DANGER [Relay K14-DP DE-ENERGIZED]</div>
                  <div className="text-red-400">🔒 S-18 Aspect forced to DANGER [Relay K18-DP DE-ENERGIZED]</div>
                  <div className="text-amber-400">🔒 Point 102A Detection Circuit Opened (Derailment Safeguard)</div>
                  <div className="text-emerald-400">✔ Station Master Console Acknowledged. Authority Form T/409 Validated.</div>
                </>
              ) : (
                <div className="text-slate-500">
                  Awaiting automated cryptographic SHA-256 handshake token from RailOptima AI middleware...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Official Electronic Caution Order & Block Permit (IR Form T/409) (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Electronic Block Permit & Caution Ticket
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
              IR Form T/409
            </span>
          </div>

          {/* Ticket Body */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3.5 text-xs text-slate-300">
            {/* Indian Railways Heading */}
            <div className="text-center pb-2 border-b border-slate-800">
              <div className="text-[11px] font-bold tracking-widest text-slate-200 uppercase">
                GOVERNMENT OF INDIA — MINISTRY OF RAILWAYS
              </div>
              <div className="text-[10px] text-slate-400">
                NORTH CENTRAL RAILWAY • DIVISIONAL CONTROL OFFICE (PRAYAGRAJ)
              </div>
              <div className="text-xs font-bold text-amber-400 mt-1">
                INTEGRATED MULTI-DEPARTMENTAL TRACK POSSESSION PERMIT
              </div>
            </div>

            {/* Token ID & Timestamps */}
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Permit Token ID:</span>
                <strong className="text-white">
                  {token?.tokenId || `E-TICKET-${currentBlock.id}-948102`}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time Authorized:</span>
                <span className="text-emerald-400 font-bold">
                  {currentBlock.optimizedWindow.start} — {currentBlock.optimizedWindow.end} (
                  {currentBlock.riskAssessment?.recommendedTotalTimeMin ?? currentBlock.optimizedWindow.durationMin}m)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Track & Kilometre Limits:</span>
                <span className="text-amber-300 font-bold">
                  {currentBlock.lineId} (KP {currentBlock.kpStart} — KP {currentBlock.kpEnd})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Interlocked Stations:</span>
                <span className="text-slate-200 font-bold">
                  {currentBlock.stationFrom} ↔ {currentBlock.stationTo}
                </span>
              </div>
            </div>

            {/* SHA-256 Cryptographic Hash Stamp */}
            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  SHA-256 Cryptographic Hash
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      token?.sha256Hash || 'e8b0a94f1c7d23a54b912c019d3f82a170a45e99814bfb2298c0d9a65fe09a12'
                    )
                  }
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedHash ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-[10px] text-slate-300 break-all leading-tight">
                {token?.sha256Hash || 'e8b0a94f1c7d23a54b912c019d3f82a170a45e99814bfb2298c0d9a65fe09a12'}
              </div>
            </div>

            {/* Imposed Restrictions & Authorized Vertical Teams */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block">Imposed Caution:</span>
                <strong className="text-amber-400">SR 30 km/h (Adjacent Line)</strong>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block">Traction Status:</span>
                <strong className="text-red-400">Power Cut Confirmed</strong>
              </div>
            </div>

            {/* Digital Signature & QR Stamp */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                  <QrCode className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Signed Digitally By:</div>
                  <div className="font-bold text-slate-200">Sr. DOM / HDC Operating Desk</div>
                  <div className="text-[9px] text-emerald-400 font-mono">Status: Authenticated</div>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                title="Print Caution Order"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print T/409</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
