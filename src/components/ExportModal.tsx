import React, { useState } from 'react';
import { exportAllJavaLabsAsZip, downloadBlob } from '../utils/zipExporter';
import { JAVA_LABS } from '../data/javaLabs';
import { X, Download, Check, Terminal, FolderArchive, FileCode } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const handleDownloadAllZip = async () => {
    setDownloadingZip(true);
    try {
      const blob = await exportAllJavaLabsAsZip();
      downloadBlob(blob, 'BIT_Network_Programming_Java_Labs.zip');
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingZip(false);
    }
  };

  const compileCommand = 'javac java/*/*.java';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-display">
              Export Complete Java Coursework Project
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Main Action Banner */}
          <div className="p-5 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Full Java Coursework Archive (.ZIP)</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Includes all 7 labs, 14 Java source files, Makefile, and terminal README guide.
                </p>
              </div>
              <button
                onClick={handleDownloadAllZip}
                disabled={downloadingZip}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingZip ? 'Packaging Zip...' : 'Download .ZIP'}</span>
              </button>
            </div>
          </div>

          {/* Quick Terminal Compilation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Compilation Command</span>
            </h4>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-cyan-300 flex items-center justify-between">
              <span>{compileCommand}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(compileCommand);
                  setCopiedCmd(true);
                  setTimeout(() => setCopiedCmd(false), 2000);
                }}
                className="flex items-center gap-1 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Catalog list of included files */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Included Java Files ({JAVA_LABS.length * 2} source files)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {JAVA_LABS.map((lab) => (
                <div
                  key={lab.id}
                  className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg flex items-center justify-between"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="text-white font-semibold flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{lab.serverFileName}</span>
                    </div>
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{lab.clientFileName}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-sans uppercase shrink-0">
                    {lab.protocol}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
