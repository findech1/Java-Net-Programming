import React, { useState } from 'react';
import { Packet } from '../types/network';
import { Activity, Filter, Trash2, ArrowRight } from 'lucide-react';

interface PacketInspectorProps {
  packets: Packet[];
  onClear: () => void;
}

export const PacketInspector: React.FC<PacketInspectorProps> = ({ packets, onClear }) => {
  const [selectedPacketId, setSelectedPacketId] = useState<string | null>(
    packets.length > 0 ? packets[packets.length - 1].id : null
  );
  const [filterType, setFilterType] = useState<'ALL' | 'DATA' | 'HANDSHAKE'>('ALL');

  const filteredPackets = packets.filter((p) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'DATA') return p.type === 'DATA' || p.type === 'UDP_DATAGRAM';
    if (filterType === 'HANDSHAKE') return ['SYN', 'SYN_ACK', 'ACK', 'FIN', 'FIN_ACK'].includes(p.type);
    return true;
  });

  const selectedPacket = packets.find((p) => p.id === selectedPacketId) || packets[packets.length - 1];

  // Helper to generate mock hex dump of payload
  const renderHexDump = (payload?: string) => {
    if (!payload) return 'No application payload (Control/Handshake segment)';
    const bytes = Array.from(payload).map((ch) => ch.charCodeAt(0));
    const hex = bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ');
    return `HEX:  ${hex}\nTEXT: ${payload}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div>
          <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Network Packet & Frame Inspector</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time inspection of Layer 4 TCP/UDP segments and Layer 7 socket application payloads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                filterType === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({packets.length})
            </button>
            <button
              onClick={() => setFilterType('HANDSHAKE')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                filterType === 'HANDSHAKE' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Handshakes
            </button>
            <button
              onClick={() => setFilterType('DATA')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                filterType === 'DATA' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Data Payloads
            </button>
          </div>

          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900 border border-rose-800/80 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Trace</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Packet Table on Left, Deep Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Packet Table (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[520px]">
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Captured Network Frames</span>
            <span className="text-[11px] font-mono text-slate-400">Total: {filteredPackets.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-xs divide-y divide-slate-800/60">
            {filteredPackets.length === 0 ? (
              <div className="p-8 text-center text-slate-600 italic">
                No network packets recorded yet. Trigger events in the Interactive Lab to inspect live frames.
              </div>
            ) : (
              filteredPackets.map((pkt, idx) => {
                const isSelected = selectedPacket?.id === pkt.id;
                return (
                  <div
                    key={pkt.id}
                    onClick={() => setSelectedPacketId(pkt.id)}
                    className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/40 border-l-2 border-cyan-400 text-white'
                        : 'hover:bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-600 w-6 tabular-nums">{idx + 1}</span>
                      <span className="text-slate-500 text-[11px]">{pkt.timestamp}</span>
                      <span className={`px-1.5 py-0.5 text-[10px] rounded font-bold ${
                        pkt.type === 'DATA'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : pkt.type.includes('SYN')
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {pkt.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] truncate flex-1">
                      <span className="text-slate-400">{pkt.source}</span>
                      <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                      <span className="text-slate-400">{pkt.destination}</span>
                    </div>

                    <div className="text-right shrink-0 text-[11px]">
                      <span className="text-slate-400 tabular-nums">{pkt.byteSize} bytes</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Deep Frame Dissector (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 h-[520px] overflow-y-auto">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>Frame Dissector & Protocol Stack</span>
            {selectedPacket && (
              <span className="text-xs font-mono text-cyan-400">
                {selectedPacket.protocol} · {selectedPacket.type}
              </span>
            )}
          </h2>

          {selectedPacket ? (
            <div className="space-y-4 text-xs font-mono">
              {/* Layer 4: Transport Header */}
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider font-sans">
                  Layer 4: Transport Header ({selectedPacket.protocol})
                </div>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Source Socket:</span>
                    <span className="text-white">{selectedPacket.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destination Socket:</span>
                    <span className="text-white">{selectedPacket.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Frame Type:</span>
                    <span className="text-emerald-400 font-bold">{selectedPacket.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Segment Length:</span>
                    <span className="text-white tabular-nums">{selectedPacket.byteSize} bytes</span>
                  </div>
                  {selectedPacket.flags && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">TCP Flags:</span>
                      <span className="text-cyan-400">[{selectedPacket.flags.join(', ')}]</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Layer 7: Application Socket Payload */}
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider font-sans">
                  Layer 7: Application Socket Payload
                </div>
                <pre className="p-2.5 bg-slate-950 rounded border border-slate-800/90 text-slate-200 text-[11px] whitespace-pre-wrap leading-relaxed">
                  {renderHexDump(selectedPacket.payload)}
                </pre>
              </div>

              {/* Educational Note */}
              <div className="p-3 bg-cyan-950/20 rounded-lg border border-cyan-900/40 text-[11px] text-slate-300 font-sans space-y-1">
                <strong className="text-cyan-400">BIT Coursework Concept:</strong>
                <p className="leading-relaxed">
                  {selectedPacket.type === 'SYN' && 'SYN initiates the TCP 3-way handshake. The client chooses an Initial Sequence Number (ISN) and sets SYN=1.'}
                  {selectedPacket.type === 'SYN_ACK' && 'SYN-ACK indicates server acknowledgment and server ISN proposal. Port is in SYN_RCVD state.'}
                  {selectedPacket.type === 'ACK' && 'Final handshake step. Connection state transitions to ESTABLISHED on both endpoints.'}
                  {selectedPacket.type === 'DATA' && 'Streaming socket data transported over TCP stream. BufferedReader.readLine() unblocks when \\n arrives.'}
                  {selectedPacket.type === 'FIN' && 'Graceful half-close initiated by client sending FIN packet. Socket transitions to FIN_WAIT state.'}
                  {selectedPacket.type === 'UDP_DATAGRAM' && 'Connectionless UDP DatagramPacket. Transmitted directly with destination IP and port without handshake.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs text-center py-12">
              Select a packet from the trace table to inspect protocol headers.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
