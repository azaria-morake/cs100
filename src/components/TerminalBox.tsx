'use client';

import React, { useState } from 'react';

interface TerminalBoxProps {
  header?: string;
  lines?: string[];
}

export default function TerminalBox({
  header = "> FLAME_GRAPH_AUDIT: CHECKOUT_TRACE_P99",
  lines = [
    "[0.00ms] HTTP POST /checkout/commit",
    "  ├── [42.10ms] JSON_SERIALIZE (OrderPayload, 4.2KB)",
    "  ├── [98.40ms] TLS_HANDSHAKE + DNS (Auth-Service.internal)",
    "  ├── [120.30ms] DB_POOL_ACQUIRE_TIMEOUT (Lock contention on user_token)",
    "  └── [579.40ms] CASCADING_RETRY_STORM: Payment-Gateway Node 4 failed (ALERT)"
  ]
}: TerminalBoxProps) {
  const [collapsedNodes, setCollapsedNodes] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!lines || lines.length === 0) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleNode = (idx: number) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="terminal-box my-6">
      {/* Terminal Top Control Bar */}
      <div className="flex justify-between items-center flex-wrap gap-2 text-xs border-b border-white/20 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 inline-block"></span>
          <span className="h-2 w-2 rounded-full bg-yellow-500 inline-block"></span>
          <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
          <span className="terminal-header ml-2 mb-0 border-b-0 pb-0">{header}</span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Filter trace nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#1b1a19] text-[#f4f1ea] border border-white/30 px-2 py-0.5 font-mono text-[11px] focus:outline-none focus:border-[#cb4035]"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="px-2 py-0.5 border border-white/30 font-mono text-[10px] uppercase font-bold text-[#f4f1ea] hover:text-[#cb4035] hover:border-[#cb4035] transition"
          >
            {copied ? '✓ COPIED TRACE' : 'COPY RAW'}
          </button>
        </div>
      </div>

      {/* Trace Log Nodes */}
      <div className="space-y-1.5 font-mono text-xs overflow-x-auto leading-relaxed">
        {lines.map((line, idx) => {
          const isAlert = line.includes("ALERT") || line.includes("failed") || line.includes("TIMEOUT");
          const isParent = line.includes("├──") || line.includes("└──") || idx === 0;
          const matchesSearch = searchTerm === '' || line.toLowerCase().includes(searchTerm.toLowerCase());

          if (!matchesSearch) return null;

          // Extract timing if present, e.g. [579.40ms]
          const timingMatch = line.match(/\[(\d+\.?\d*ms)\]/);
          const timing = timingMatch ? timingMatch[1] : null;

          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-1 rounded transition ${
                isAlert ? 'bg-red-950/50 text-[#ff6b6b] font-bold border-l-2 border-[#ff6b6b]' : 'hover:bg-white/5 text-[#f4f1ea]'
              }`}
            >
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => isParent && toggleNode(idx)}>
                {isParent && (
                  <span className="text-[10px] text-[#6f6b64] select-none">
                    {collapsedNodes[idx] ? '▶' : '▼'}
                  </span>
                )}
                <span>{line}</span>
              </div>

              {timing && (
                <span className="text-[10px] text-[#6f6b64] font-mono select-none hidden sm:inline-block">
                  {timing}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center text-[10px] text-[#6f6b64] font-mono">
        <span>TRACE ENGINE: NATIVE FLAME HOOK v4.2</span>
        <span>TOTAL NODES: {lines.length}</span>
      </div>
    </div>
  );
}
