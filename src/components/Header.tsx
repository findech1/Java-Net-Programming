import React from 'react';
import { Download } from 'lucide-react';

interface HeaderProps {
  activeTab: 'lab' | 'viewer' | 'generator' | 'inspector' | 'guide';
  setActiveTab: (tab: 'lab' | 'viewer' | 'generator' | 'inspector' | 'guide') => void;
  onExportClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onExportClick }) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      {/* Zone 1: Single text element wordmark */}
      <div 
        onClick={() => setActiveTab('lab')}
        className="text-lg font-bold tracking-tight text-white font-display cursor-pointer whitespace-nowrap shrink-0 hover:text-cyan-400 transition-colors"
      >
        BIT NetProg Studio
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('lab')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'lab' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Interactive Lab
        </button>
        <button
          onClick={() => setActiveTab('viewer')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'viewer' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Java Code Viewer
        </button>
        <button
          onClick={() => setActiveTab('generator')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'generator' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Code Architect
        </button>
        <button
          onClick={() => setActiveTab('inspector')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'inspector' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Packet Inspector
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'guide' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          BIT Study Guide
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onExportClick}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-500/20 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Java Project</span>
        </button>
      </div>
    </header>
  );
};
