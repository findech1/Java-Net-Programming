/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { InteractiveLab } from './components/InteractiveLab';
import { CodeViewer } from './components/CodeViewer';
import { CodeGenerator } from './components/CodeGenerator';
import { PacketInspector } from './components/PacketInspector';
import { StudyGuide } from './components/StudyGuide';
import { ExportModal } from './components/ExportModal';
import { JAVA_LABS } from './data/javaLabs';
import { JavaLab, Packet } from './types/network';

export default function App() {
  const [activeTab, setActiveTab] = useState<'lab' | 'viewer' | 'generator' | 'inspector' | 'guide'>('lab');
  const [selectedLab, setSelectedLab] = useState<JavaLab>(JAVA_LABS[0]);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Initial demonstration packets
  const [packets, setPackets] = useState<Packet[]>([
    {
      id: 'pkt-1',
      timestamp: '10:39:10',
      protocol: 'TCP',
      source: '127.0.0.1:53210',
      destination: '127.0.0.1:5000',
      type: 'SYN',
      flags: ['SYN'],
      byteSize: 40,
      direction: 'CLIENT_TO_SERVER',
    },
    {
      id: 'pkt-2',
      timestamp: '10:39:10',
      protocol: 'TCP',
      source: '127.0.0.1:5000',
      destination: '127.0.0.1:53210',
      type: 'SYN_ACK',
      flags: ['SYN', 'ACK'],
      byteSize: 40,
      direction: 'SERVER_TO_CLIENT',
    },
    {
      id: 'pkt-3',
      timestamp: '10:39:11',
      protocol: 'TCP',
      source: '127.0.0.1:53210',
      destination: '127.0.0.1:5000',
      type: 'ACK',
      flags: ['ACK'],
      byteSize: 32,
      direction: 'CLIENT_TO_SERVER',
    },
    {
      id: 'pkt-4',
      timestamp: '10:39:12',
      protocol: 'TCP',
      source: '127.0.0.1:5000',
      destination: '127.0.0.1:53210',
      type: 'DATA',
      payload: 'SERVER 200: Connected to Java TCP Echo Server.',
      byteSize: 78,
      direction: 'SERVER_TO_CLIENT',
    },
    {
      id: 'pkt-5',
      timestamp: '10:39:15',
      protocol: 'TCP',
      source: '127.0.0.1:53210',
      destination: '127.0.0.1:5000',
      type: 'DATA',
      payload: 'Hello from Alice!',
      byteSize: 49,
      direction: 'CLIENT_TO_SERVER',
    },
    {
      id: 'pkt-6',
      timestamp: '10:39:15',
      protocol: 'TCP',
      source: '127.0.0.1:5000',
      destination: '127.0.0.1:53210',
      type: 'DATA',
      payload: 'ECHO: Hello from Alice!',
      byteSize: 55,
      direction: 'SERVER_TO_CLIENT',
    },
  ]);

  const handleAddPacket = (packet: Packet) => {
    setPackets((prev) => [...prev.slice(-99), packet]);
  };

  const handleClearPackets = () => {
    setPackets([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportClick={() => setIsExportOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'lab' && (
          <InteractiveLab
            currentLab={selectedLab}
            packets={packets}
            onAddPacket={handleAddPacket}
            onClearPackets={handleClearPackets}
          />
        )}

        {activeTab === 'viewer' && (
          <CodeViewer
            selectedLab={selectedLab}
            onSelectLab={(lab) => setSelectedLab(lab)}
          />
        )}

        {activeTab === 'generator' && <CodeGenerator />}

        {activeTab === 'inspector' && (
          <PacketInspector
            packets={packets}
            onClear={handleClearPackets}
          />
        )}

        {activeTab === 'guide' && <StudyGuide />}
      </main>

      {/* Footer conforming to anti-slop guidelines */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-6 py-6 text-center text-xs text-slate-400">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span>Bachelor of Information Technology (BIT)</span>
          <span aria-hidden="true">·</span>
          <span>Network Programming & Distributed Systems</span>
          <span aria-hidden="true">·</span>
          <span>Java Sockets & Channels (JDK 17)</span>
        </div>
      </footer>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
