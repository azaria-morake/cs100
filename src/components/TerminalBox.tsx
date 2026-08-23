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
  if (!lines || lines.length === 0) return null;

  return (
    <div className="terminal-box">
      <div className="terminal-header">{header}</div>
      <div className="space-y-1">
        {lines.map((line, idx) => {
          const isAlert = line.includes("ALERT") || line.includes("failed");
          return (
            <div key={idx} className={isAlert ? "text-[#ff6b6b]" : ""}>
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}
