import React, { useState } from 'react';
import { JavaLab, Packet, ClientSession } from '../types/network';
import { Play, Square, RefreshCw, Send, Terminal, ShieldAlert } from 'lucide-react';

interface InteractiveLabProps {
  currentLab: JavaLab;
  packets: Packet[];
  onAddPacket: (packet: Packet) => void;
  onClearPackets: () => void;
}

export const InteractiveLab: React.FC<InteractiveLabProps> = ({
  currentLab,
  packets,
  onAddPacket,
  onClearPackets,
}) => {
  // Server state
  const [serverStatus, setServerStatus] = useState<'STOPPED' | 'LISTENING' | 'ACTIVE'>('LISTENING');
  const [serverPort, setServerPort] = useState<number>(5000);
  const [serverLogs, setServerLogs] = useState<string[]>([
    `[SERVER INIT] OpenJDK 17.0.20.1 ServerSocket bound to port 5000`,
    `[SERVER LISTEN] Listening for incoming ${currentLab.protocol} connections...`,
  ]);

  // Clients state
  const [clients, setClients] = useState<ClientSession[]>([
    {
      id: 'c1',
      name: 'Client 1 (Alice)',
      clientPort: 53210,
      state: 'CONNECTED',
      color: '#38bdf8',
      messagesSent: 2,
      messagesReceived: 2,
      bytesTransferred: 96,
      consoleHistory: [
        { id: '1', timestamp: '10:39:12', direction: 'SYS', text: 'Connecting to 127.0.0.1:5000...' },
        { id: '2', timestamp: '10:39:12', direction: 'IN', text: 'SERVER 200: Connected to Java TCP Echo Server.' },
        { id: '3', timestamp: '10:39:15', direction: 'OUT', text: 'Hello from Alice!' },
        { id: '4', timestamp: '10:39:15', direction: 'IN', text: 'ECHO: Hello from Alice!' },
      ],
    },
    {
      id: 'c2',
      name: 'Client 2 (Bob)',
      clientPort: 53211,
      state: 'DISCONNECTED',
      color: '#34d399',
      messagesSent: 0,
      messagesReceived: 0,
      bytesTransferred: 0,
      consoleHistory: [],
    },
    {
      id: 'c3',
      name: 'Client 3 (Charlie)',
      clientPort: 53212,
      state: 'DISCONNECTED',
      color: '#f472b6',
      messagesSent: 0,
      messagesReceived: 0,
      bytesTransferred: 0,
      consoleHistory: [],
    },
  ]);

  const [activeClientId, setActiveClientId] = useState<string>('c1');
  const [clientInputText, setClientInputText] = useState<string>('');
  const [isSimulatingLatency, setIsSimulatingLatency] = useState<boolean>(false);
  const [packetLossSimulation, setPacketLossSimulation] = useState<boolean>(false);

  const activeClient = clients.find((c) => c.id === activeClientId) || clients[0];

  // Helper to append server log
  const logServer = (msg: string) => {
    setServerLogs((prev) => [...prev.slice(-100), msg]);
  };

  // Helper to append client log
  const logClient = (clientId: string, direction: 'IN' | 'OUT' | 'SYS', text: string) => {
    const time = new Date().toLocaleTimeString();
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          return {
            ...c,
            consoleHistory: [...c.consoleHistory.slice(-50), { id: Math.random().toString(), timestamp: time, direction, text }],
          };
        }
        return c;
      })
    );
  };

  // Start / Stop Server
  const toggleServer = () => {
    if (serverStatus === 'STOPPED') {
      setServerStatus('LISTENING');
      logServer(`[SERVER START] ServerSocket created on port ${serverPort}`);
      logServer(`[SERVER LISTEN] ServerSocket.accept() blocking on main thread...`);
    } else {
      setServerStatus('STOPPED');
      logServer(`[SERVER STOP] serverSocket.close() called. Port ${serverPort} released.`);
      // Disconnect all clients
      setClients((prev) =>
        prev.map((c) => ({
          ...c,
          state: 'DISCONNECTED',
          consoleHistory: [...c.consoleHistory, {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString(),
            direction: 'SYS',
            text: 'Server socket closed by remote host.'
          }],
        }))
      );
    }
  };

  // Connect client
  const connectClient = (client: ClientSession) => {
    if (serverStatus === 'STOPPED') {
      logClient(client.id, 'SYS', `java.net.ConnectException: Connection refused (Server is not listening on port ${serverPort})`);
      return;
    }

    logClient(client.id, 'SYS', `Initiating TCP 3-way handshake to 127.0.0.1:${serverPort}...`);

    // 1. SYN
    onAddPacket({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      protocol: currentLab.protocol,
      source: `127.0.0.1:${client.clientPort}`,
      destination: `127.0.0.1:${serverPort}`,
      type: 'SYN',
      flags: ['SYN'],
      byteSize: 40,
      direction: 'CLIENT_TO_SERVER',
    });

    // 2. SYN-ACK & ACK after delay
    setTimeout(() => {
      onAddPacket({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        protocol: currentLab.protocol,
        source: `127.0.0.1:${serverPort}`,
        destination: `127.0.0.1:${client.clientPort}`,
        type: 'SYN_ACK',
        flags: ['SYN', 'ACK'],
        byteSize: 40,
        direction: 'SERVER_TO_CLIENT',
      });

      onAddPacket({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        protocol: currentLab.protocol,
        source: `127.0.0.1:${client.clientPort}`,
        destination: `127.0.0.1:${serverPort}`,
        type: 'ACK',
        flags: ['ACK'],
        byteSize: 32,
        direction: 'CLIENT_TO_SERVER',
      });

      setClients((prev) =>
        prev.map((c) => (c.id === client.id ? { ...c, state: 'CONNECTED' } : c))
      );
      logServer(`[ACCEPT] Client connected: ${client.name} (Port: ${client.clientPort})`);
      logClient(client.id, 'IN', `SERVER 200: Connected to Java ${currentLab.title.split(':')[1] || 'Server'}`);
    }, isSimulatingLatency ? 500 : 150);
  };

  // Disconnect client
  const disconnectClient = (client: ClientSession) => {
    logClient(client.id, 'OUT', 'BYE');
    onAddPacket({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      protocol: currentLab.protocol,
      source: `127.0.0.1:${client.clientPort}`,
      destination: `127.0.0.1:${serverPort}`,
      type: 'FIN',
      flags: ['FIN', 'ACK'],
      byteSize: 32,
      direction: 'CLIENT_TO_SERVER',
    });

    setTimeout(() => {
      onAddPacket({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        protocol: currentLab.protocol,
        source: `127.0.0.1:${serverPort}`,
        destination: `127.0.0.1:${client.clientPort}`,
        type: 'FIN_ACK',
        flags: ['ACK'],
        byteSize: 32,
        direction: 'SERVER_TO_CLIENT',
      });

      setClients((prev) =>
        prev.map((c) => (c.id === client.id ? { ...c, state: 'DISCONNECTED' } : c))
      );
      logServer(`[DISCONNECT] ${client.name} closed socket cleanly.`);
      logClient(client.id, 'SYS', 'Socket closed. Connection terminated.');
    }, 100);
  };

  // Send message from active client to server
  const sendMessage = (customMsg?: string) => {
    const textToSend = customMsg !== undefined ? customMsg : clientInputText;
    if (!textToSend.trim()) return;

    if (activeClient.state !== 'CONNECTED') {
      logClient(activeClient.id, 'SYS', 'Cannot send data: Socket is not connected!');
      return;
    }

    logClient(activeClient.id, 'OUT', textToSend);
    setClientInputText('');

    if (packetLossSimulation) {
      logClient(activeClient.id, 'SYS', '[PACKET DROPPED] Simulated network packet loss in transit!');
      return;
    }

    // Packet sent
    onAddPacket({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      protocol: currentLab.protocol,
      source: `127.0.0.1:${activeClient.clientPort}`,
      destination: `127.0.0.1:${serverPort}`,
      type: 'DATA',
      payload: textToSend,
      byteSize: textToSend.length + 32,
      direction: 'CLIENT_TO_SERVER',
    });

    logServer(`[THREAD POOL] Worker thread received from ${activeClient.name}: "${textToSend}"`);

    // Server reply simulation
    const delay = isSimulatingLatency ? 400 : 100;
    setTimeout(() => {
      let reply = '';
      if (textToSend.trim().toUpperCase() === 'BYE') {
        disconnectClient(activeClient);
        return;
      } else if (textToSend.startsWith('GET_STUDENT ')) {
        const id = textToSend.replace('GET_STUDENT ', '').trim();
        reply = `200_OK|${id}|Alice Chen|BSc Information Tech|GPA:3.92|CLEARED`;
      } else if (textToSend === 'LIST_IDS') {
        reply = '200_OK|BIT-2024-001,BIT-2024-042,BIT-2024-108,BIT-2024-215';
      } else if (textToSend.startsWith('/join ')) {
        reply = `>>> [SYSTEM] ${activeClient.name} joined the room.`;
      } else {
        reply = `ECHO: ${textToSend}`;
      }

      onAddPacket({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        protocol: currentLab.protocol,
        source: `127.0.0.1:${serverPort}`,
        destination: `127.0.0.1:${activeClient.clientPort}`,
        type: 'DATA',
        payload: reply,
        byteSize: reply.length + 32,
        direction: 'SERVER_TO_CLIENT',
      });

      logClient(activeClient.id, 'IN', reply);
      logServer(`[SENT to ${activeClient.name}] "${reply}"`);

      // Update counters
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === activeClient.id) {
            return {
              ...c,
              messagesSent: c.messagesSent + 1,
              messagesReceived: c.messagesReceived + 1,
              bytesTransferred: c.bytesTransferred + textToSend.length + reply.length,
            };
          }
          return c;
        })
      );
    }, delay);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleServer}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              serverStatus !== 'STOPPED'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold'
            }`}
          >
            {serverStatus !== 'STOPPED' ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Server</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Server</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Port:</span>
            <input
              type="number"
              value={serverPort}
              onChange={(e) => setServerPort(parseInt(e.target.value, 10) || 5000)}
              disabled={serverStatus !== 'STOPPED'}
              className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono text-center text-xs text-white disabled:opacity-50"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span aria-hidden="true">·</span>
            <span>State: <strong className="text-cyan-400">{serverStatus}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Protocol: <strong className="text-white">{currentLab.protocol}</strong></span>
          </div>
        </div>

        {/* Network Simulation Tweaks */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isSimulatingLatency}
              onChange={(e) => setIsSimulatingLatency(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>+300ms Latency</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={packetLossSimulation}
              onChange={(e) => setPacketLossSimulation(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-rose-500 focus:ring-0"
            />
            <span>Drop Packets</span>
          </label>

          <button
            onClick={() => {
              setServerLogs([]);
              setClients((prev) =>
                prev.map((c) => ({
                  ...c,
                  consoleHistory: [],
                  messagesSent: 0,
                  messagesReceived: 0,
                  bytesTransferred: 0,
                }))
              );
              onClearPackets();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
            title="Reset simulation logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Logs</span>
          </button>
        </div>
      </div>

      {/* Network Topology Visualizer */}
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-900">
          <span className="font-semibold text-slate-300">Client-Server Socket Topology</span>
          <span>Packets Captured: <strong className="text-cyan-400 font-mono">{packets.length}</strong></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Server Node Card */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono">ServerSocket</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                serverStatus === 'LISTENING' ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800' : 'text-slate-400 bg-slate-800'
              }`}>
                {serverStatus}
              </span>
            </div>
            <div className="text-xs text-slate-400 space-y-0.5 font-mono">
              <div>IP: 127.0.0.1 (localhost)</div>
              <div>Port: {serverPort}</div>
              <div>Backlog: 50 connections</div>
              <div>Active Clients: {clients.filter((c) => c.state === 'CONNECTED').length}</div>
            </div>
          </div>

          {/* Center Packet Channel */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 text-center space-y-2">
            <div className="text-xs text-slate-400 font-semibold">Virtual Network Pipe</div>
            <div className="w-full flex items-center justify-between px-2 text-[11px] font-mono text-cyan-400">
              <span>Client</span>
              <span className="text-slate-500">⇄ {currentLab.protocol} ⇄</span>
              <span>Server</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500 animate-pulse opacity-70" />
            </div>
            <div className="text-[11px] text-slate-400">
              {packets.length > 0 ? (
                <span>Last: <code className="text-white font-mono">{packets[packets.length - 1].type}</code> ({packets[packets.length - 1].byteSize}B)</span>
              ) : (
                <span>Ready for packet transmission</span>
              )}
            </div>
          </div>

          {/* Connected Clients Node List */}
          <div className="space-y-2">
            {clients.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveClientId(c.id)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  activeClientId === c.id
                    ? 'bg-slate-900 border-cyan-500/60 shadow-sm shadow-cyan-950'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Port: {c.clientPort} · {c.messagesSent} msgs
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {c.state === 'CONNECTED' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        disconnectClient(c);
                      }}
                      className="px-2 py-0.5 text-[11px] text-rose-400 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800 rounded transition-colors cursor-pointer"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        connectClient(c);
                      }}
                      className="px-2 py-0.5 text-[11px] text-emerald-400 hover:text-white bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 rounded transition-colors cursor-pointer"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Live Terminals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terminal 1: Server Console */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[400px]">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white font-mono">
                Server Process (Port: {serverPort})
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {serverStatus === 'LISTENING' ? '● RUNNING' : '■ STOPPED'}
            </span>
          </div>

          <div className="flex-1 p-3 font-mono text-xs text-slate-300 overflow-y-auto space-y-1 bg-slate-950/90 leading-relaxed">
            {serverLogs.map((log, i) => (
              <div key={i} className="text-slate-300">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Terminal 2: Client Interactive Console */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[400px]">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white font-mono">
                {activeClient.name}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveClientId(c.id)}
                  className={`px-2 py-0.5 text-[11px] rounded transition-colors cursor-pointer font-mono ${
                    activeClientId === c.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Console History */}
          <div className="flex-1 p-3 font-mono text-xs overflow-y-auto space-y-1.5 bg-slate-950/90 leading-relaxed">
            {activeClient.consoleHistory.length === 0 ? (
              <div className="text-slate-600 italic">
                Terminal idle. Click 'Connect' or type a message below to transmit.
              </div>
            ) : (
              activeClient.consoleHistory.map((item) => (
                <div key={item.id} className="flex gap-2">
                  <span className="text-slate-600 select-none text-[10px] pt-0.5">
                    {item.timestamp}
                  </span>
                  <span
                    className={
                      item.direction === 'IN'
                        ? 'text-cyan-300'
                        : item.direction === 'OUT'
                        ? 'text-emerald-300 font-semibold'
                        : 'text-amber-400/90'
                    }
                  >
                    {item.direction === 'OUT' ? '> ' : item.direction === 'IN' ? '< ' : 'ℹ '}
                    {item.text}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div className="px-3 py-1.5 bg-slate-900/60 border-t border-slate-800/80 flex flex-wrap gap-1.5">
            <button
              onClick={() => sendMessage('Hello Server!')}
              disabled={activeClient.state !== 'CONNECTED'}
              className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer disabled:opacity-40"
            >
              "Hello Server!"
            </button>
            <button
              onClick={() => sendMessage('GET_STUDENT BIT-2024-001')}
              disabled={activeClient.state !== 'CONNECTED'}
              className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer disabled:opacity-40"
            >
              "GET_STUDENT"
            </button>
            <button
              onClick={() => sendMessage('/users')}
              disabled={activeClient.state !== 'CONNECTED'}
              className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer disabled:opacity-40"
            >
              "/users"
            </button>
            <button
              onClick={() => sendMessage('BYE')}
              disabled={activeClient.state !== 'CONNECTED'}
              className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-rose-300 rounded cursor-pointer disabled:opacity-40"
            >
              "BYE"
            </button>
          </div>

          {/* User Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 p-2.5 bg-slate-900 border-t border-slate-800"
          >
            <input
              type="text"
              value={clientInputText}
              onChange={(e) => setClientInputText(e.target.value)}
              placeholder={
                activeClient.state === 'CONNECTED'
                  ? 'Type message to send to server...'
                  : 'Connect client socket first...'
              }
              disabled={activeClient.state !== 'CONNECTED'}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={activeClient.state !== 'CONNECTED' || !clientInputText.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded transition-colors cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
