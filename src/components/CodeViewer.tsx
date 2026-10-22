import React, { useState } from 'react';
import { JAVA_LABS } from '../data/javaLabs';
import { JavaLab } from '../types/network';
import { downloadTextFile } from '../utils/zipExporter';
import { Copy, Check, Download, Play, Terminal, BookOpen, Cpu } from 'lucide-react';

interface CodeViewerProps {
  selectedLab: JavaLab;
  onSelectLab: (lab: JavaLab) => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ selectedLab, onSelectLab }) => {
  const [activeFileTab, setActiveFileTab] = useState<'server' | 'client' | 'terminal'>('server');
  const [copied, setCopied] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileResult, setCompileResult] = useState<{ success: boolean; output: string } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{ serverOutput: string; clientOutput: string } | null>(null);

  const currentCode = activeFileTab === 'server' ? selectedLab.serverCode : selectedLab.clientCode;
  const currentFileName = activeFileTab === 'server' ? selectedLab.serverFileName : selectedLab.clientFileName;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadTextFile(currentCode, currentFileName);
  };

  const handleRunRealJavac = async () => {
    setIsCompiling(true);
    setCompileResult(null);
    try {
      const res = await fetch('/api/java/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setCompileResult({
        success: data.success,
        output: data.stdout || data.stderr || 'Compilation complete.',
      });
    } catch (err: any) {
      setCompileResult({
        success: false,
        output: 'Failed to contact JVM backend: ' + err.message,
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleExecuteRealJVM = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    try {
      const res = await fetch('/api/java/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labId: selectedLab.id,
          clientInput: 'BIT_SOCKET_PACKET_TEST',
        }),
      });
      const data = await res.json();
      setExecutionResult({
        serverOutput: data.serverOutput || 'Server finished execution.',
        clientOutput: data.clientOutput || 'Client finished execution.',
      });
    } catch (err: any) {
      setExecutionResult({
        serverOutput: 'Execution error: ' + err.message,
        clientOutput: '',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Lab Selector Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800">
        {JAVA_LABS.map((lab) => (
          <button
            key={lab.id}
            onClick={() => {
              onSelectLab(lab);
              setCompileResult(null);
              setExecutionResult(null);
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedLab.id === lab.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            {lab.title.split(':')[0]}
          </button>
        ))}
      </div>

      {/* Lab Header Card */}
      <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white font-display">
              {selectedLab.title}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="font-semibold text-cyan-400">{selectedLab.protocol} Protocol</span>
              <span aria-hidden="true">·</span>
              <span>Category: {selectedLab.category}</span>
              <span aria-hidden="true">·</span>
              <span>Level: {selectedLab.difficulty}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunRealJavac}
              disabled={isCompiling}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Runs javac in OpenJDK 17 on the Linux container"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isCompiling ? 'Compiling...' : 'Compile javac'}</span>
            </button>
            <button
              onClick={handleExecuteRealJVM}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-sm shadow-emerald-900/30 disabled:opacity-50"
              title="Runs server and client on live OpenJDK 17 JVM"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isExecuting ? 'Running JVM...' : 'Run on Real JVM'}</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          {selectedLab.description}
        </p>

        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs text-slate-300">
          <span className="font-semibold text-cyan-300">Coursework Objective: </span>
          {selectedLab.objective}
        </div>
      </div>

      {/* Compiler / Execution Output Drawer */}
      {compileResult && (
        <div className="p-4 bg-slate-950 border border-cyan-900/40 rounded-xl space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4" /> OpenJDK 17.0.20.1 javac Compiler Output
            </span>
            <button
              onClick={() => setCompileResult(null)}
              className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <pre className="p-3 bg-slate-900/90 rounded border border-slate-800 text-slate-200 overflow-x-auto whitespace-pre-wrap">
            {compileResult.output}
          </pre>
        </div>
      )}

      {executionResult && (
        <div className="p-4 bg-slate-950 border border-emerald-900/40 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="font-bold flex items-center gap-2">
              <Play className="w-4 h-4" /> Real JVM Execution Output (Server & Client on Linux)
            </span>
            <button
              onClick={() => setExecutionResult(null)}
              className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-slate-400 font-semibold text-[11px]">Server stdout (Background process)</div>
              <pre className="p-3 bg-slate-900/90 rounded border border-slate-800 text-slate-200 overflow-x-auto h-48 overflow-y-auto whitespace-pre-wrap">
                {executionResult.serverOutput}
              </pre>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400 font-semibold text-[11px]">Client stdout & stdin</div>
              <pre className="p-3 bg-slate-900/90 rounded border border-slate-800 text-cyan-200 overflow-x-auto h-48 overflow-y-auto whitespace-pre-wrap">
                {executionResult.clientOutput}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Code Tabs & Action Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveFileTab('server')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                activeFileTab === 'server'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {selectedLab.serverFileName} (Server)
            </button>
            <button
              onClick={() => setActiveFileTab('client')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                activeFileTab === 'client'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {selectedLab.clientFileName} (Client)
            </button>
            <button
              onClick={() => setActiveFileTab('terminal')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFileTab === 'terminal'
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Terminal Run Guide</span>
            </button>
          </div>

          {activeFileTab !== 'terminal' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded transition-colors cursor-pointer"
                title="Copy code to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded transition-colors cursor-pointer"
                title="Download .java file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .java</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeFileTab === 'terminal' ? (
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                1. Compile with javac
              </h3>
              <p className="text-xs text-slate-400">
                Compile both server and client classes using Java 17+ compiler:
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 flex items-center justify-between">
                <span>{selectedLab.terminalRunInstructions.compile}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedLab.terminalRunInstructions.compile);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                2. Terminal 1: Launch Server
              </h3>
              <p className="text-xs text-slate-400">
                Start the server socket listener first before connecting any clients:
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 flex items-center justify-between">
                <span>{selectedLab.terminalRunInstructions.runServer}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedLab.terminalRunInstructions.runServer);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                3. Terminal 2: Launch Client
              </h3>
              <p className="text-xs text-slate-400">
                Open a new terminal window or tab and launch the client to connect:
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-purple-300 flex items-center justify-between">
                <span>{selectedLab.terminalRunInstructions.runClient}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedLab.terminalRunInstructions.runClient);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="p-4 font-mono text-xs overflow-x-auto text-slate-200 bg-slate-950 max-h-[600px] overflow-y-auto leading-relaxed">
              <pre className="whitespace-pre">
                {currentCode.split('\n').map((line, idx) => (
                  <div key={idx} className="flex hover:bg-slate-900/60 -mx-4 px-4 py-0.5">
                    <span className="w-12 text-slate-600 select-none text-right pr-4 shrink-0 tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="flex-1 font-mono">{line}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Key Concepts Pedagogical Panel */}
      <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>BIT Pedagogical Breakdown: Key Methods in this Lab</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {selectedLab.keyConcepts.map((concept, i) => (
            <div key={i} className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 space-y-1">
              <div className="font-mono text-xs font-bold text-cyan-300">
                {concept.methodOrClass}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {concept.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
