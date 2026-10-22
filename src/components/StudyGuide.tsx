import React, { useState } from 'react';
import { DEADLY_SOCKET_BUGS, EXAM_QUIZ_QUESTIONS } from '../data/studyNotes';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, BookOpen } from 'lucide-react';

export const StudyGuide: React.FC = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    EXAM_QUIZ_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="space-y-10">
      {/* Overview Card */}
      <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
        <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span>BIT Network Programming Study Guide & Exam Prep</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Curated reference guide covering the essential core theory, architectural comparisons, notorious socket pitfalls, and 10 interactive exam revision questions for Bachelor of Information Technology students.
        </p>
      </div>

      {/* Section 1: Socket Lifecycle Architecture */}
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
        <h2 className="text-base font-bold text-white font-display border-b border-slate-800 pb-2">
          1. TCP Socket API Lifecycle & Method Sequence
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-cyan-300 font-mono">SERVER SIDE (ServerSocket)</h3>
            <ol className="text-xs text-slate-300 space-y-2.5">
              <li className="flex gap-2">
                <span className="font-bold text-cyan-400">1.</span>
                <div>
                  <code className="text-white font-bold">new ServerSocket(port)</code>
                  <div className="text-slate-400">Allocates OS endpoint and binds to local port.</div>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-cyan-400">2.</span>
                <div>
                  <code className="text-white font-bold">serverSocket.accept()</code>
                  <div className="text-slate-400">Blocks until a client requests connection. Completes 3-way handshake and returns new dedicated <code className="text-cyan-300">Socket</code>.</div>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-cyan-400">3.</span>
                <div>
                  <code className="text-white font-bold">socket.getInputStream() / getOutputStream()</code>
                  <div className="text-slate-400">Wrapped into <code className="text-cyan-300">BufferedReader</code> and <code className="text-cyan-300">PrintWriter</code>.</div>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-cyan-400">4.</span>
                <div>
                  <code className="text-white font-bold">socket.close()</code>
                  <div className="text-slate-400">Transmits FIN packet and releases connection resources.</div>
                </div>
              </li>
            </ol>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-emerald-300 font-mono">CLIENT SIDE (Socket)</h3>
            <ol className="text-xs text-slate-300 space-y-2.5">
              <li className="flex gap-2">
                <span className="font-bold text-emerald-400">1.</span>
                <div>
                  <code className="text-white font-bold">new Socket(serverHost, serverPort)</code>
                  <div className="text-slate-400">Binds to ephemeral local port and initiates TCP 3-way handshake (SYN). Blocks until handshake completes.</div>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-emerald-400">2.</span>
                <div>
                  <code className="text-white font-bold">socket.getOutputStream()</code>
                  <div className="text-slate-400">Sends requests to server via <code className="text-emerald-300">PrintWriter.println()</code>.</div>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-emerald-400">3.</span>
                <div>
                  <code className="text-white font-bold">socket.getInputStream()</code>
                  <div className="text-slate-400">Reads server responses via <code className="text-emerald-300">BufferedReader.readLine()</code>.</div>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-emerald-400">4.</span>
                <div>
                  <code className="text-white font-bold">socket.close()</code>
                  <div className="text-slate-400">Closes client end of socket. Signals EOF to server.</div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Section 2: TCP vs UDP Comparison Matrix */}
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
        <h2 className="text-base font-bold text-white font-display border-b border-slate-800 pb-2">
          2. TCP vs UDP Protocol Comparison Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/60">
                <th className="p-3">Feature</th>
                <th className="p-3 text-cyan-400">TCP (Transmission Control Protocol)</th>
                <th className="p-3 text-amber-400">UDP (User Datagram Protocol)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-white">Connection Model</td>
                <td className="p-3">Connection-oriented (Requires 3-way handshake)</td>
                <td className="p-3">Connectionless (Packets sent immediately)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Reliability & Guarantees</td>
                <td className="p-3">Guaranteed delivery, automatic retransmissions, error checking</td>
                <td className="p-3">Unreliable (Best-effort; packets can be lost, reordered, or duplicated)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Data Transmission Unit</td>
                <td className="p-3">Continuous byte stream (no packet boundary preservation)</td>
                <td className="p-3">Discrete datagram packets (individual packet boundaries preserved)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Java Classes</td>
                <td className="p-3 font-mono text-cyan-300">ServerSocket, Socket</td>
                <td className="p-3 font-mono text-amber-300">DatagramSocket, DatagramPacket</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Header Overhead</td>
                <td className="p-3">20 to 60 bytes</td>
                <td className="p-3">8 bytes fixed</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Typical Coursework Use</td>
                <td className="p-3">Web HTTP servers, chat rooms, financial & student databases</td>
                <td className="p-3">DNS lookup, real-time gaming, audio/video streaming, IoT telemetry</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: The 7 Deadly Java Socket Pitfalls */}
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-6">
        <div className="border-b border-slate-800 pb-2">
          <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>3. The 7 Deadly Java Socket Pitfalls (University Lab Edition)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Common runtime bugs that cause student network assignments to hang, crash, or fail lab evaluations.
          </p>
        </div>

        <div className="space-y-6">
          {DEADLY_SOCKET_BUGS.map((bug) => (
            <div key={bug.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="text-sm font-bold text-white">{bug.title}</h3>
                <span className="text-[11px] text-amber-400 font-mono">Symptom: {bug.symptom}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-slate-400">Root Cause: </strong>{bug.cause}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg space-y-1">
                  <div className="text-[10px] text-rose-400 font-bold uppercase font-sans">Common Student Bug</div>
                  <pre className="text-rose-200/90 whitespace-pre-wrap">{bug.badSnippet}</pre>
                </div>

                <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg space-y-1">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase font-sans">Correct Implementation</div>
                  <pre className="text-emerald-200/90 whitespace-pre-wrap">{bug.fixedSnippet}</pre>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded border border-slate-800/80 text-xs text-cyan-300 font-sans">
                💡 <strong>Exam Tip:</strong> {bug.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Interactive BIT Exam Quiz */}
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <span>4. Interactive BIT Network Programming Exam Quiz (10 Questions)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Test your mastery of Java socket APIs, concurrency, and transport layer mechanics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {showResults && (
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded border border-emerald-800">
                Score: {calculateScore()} / {EXAM_QUIZ_QUESTIONS.length}
              </span>
            )}
            <button
              onClick={() => setShowResults(!showResults)}
              className="px-4 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors cursor-pointer"
            >
              {showResults ? 'Hide Answers' : 'Check Answers & Explanations'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {EXAM_QUIZ_QUESTIONS.map((q, idx) => {
            const userChoice = selectedAnswers[q.id];
            const isAnswered = userChoice !== undefined;
            const isCorrect = userChoice === q.correctIndex;

            return (
              <div key={q.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xs font-semibold text-white leading-relaxed">
                    <span className="text-cyan-400 font-mono mr-2">Q{idx + 1}.</span>
                    {q.question}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 uppercase">
                    {q.category}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {q.options.map((opt, optIdx) => {
                    let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700';

                    if (showResults) {
                      if (optIdx === q.correctIndex) {
                        btnStyle = 'bg-emerald-950/50 border-emerald-600 text-emerald-300 font-semibold';
                      } else if (userChoice === optIdx) {
                        btnStyle = 'bg-rose-950/50 border-rose-600 text-rose-300';
                      }
                    } else if (userChoice === optIdx) {
                      btnStyle = 'bg-cyan-950/60 border-cyan-500 text-cyan-200';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full p-2.5 text-xs text-left rounded-lg border transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {showResults && optIdx === q.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {showResults && userChoice === optIdx && optIdx !== q.correctIndex && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {showResults && (
                  <div className={`p-3 rounded-lg text-xs leading-relaxed border ${
                    isCorrect ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}>
                    <strong className="text-white">Explanation: </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
