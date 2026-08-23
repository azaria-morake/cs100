import Link from 'next/link';
import { Paper, TelemetryData } from '@/lib/types';
import { defaultPapers, defaultTelemetry } from '@/lib/defaultData';

interface SidebarProps {
  papers?: Paper[];
  telemetry?: TelemetryData;
}

export default function Sidebar({
  papers = defaultPapers,
  telemetry = defaultTelemetry,
}: SidebarProps) {
  return (
    <aside className="sidebar-area">
      {/* Formal Papers Widget */}
      <div className="widget">
        <div className="widget-heading">
          <span>PEER-REVIEWED PAPERS</span>
          <span>VOL. 78</span>
        </div>

        {papers.map((paper) => (
          <div key={paper.id} className="paper-item">
            <Link href={`/papers#${paper.id}`}>{paper.title}</Link>
            <div className="paper-meta">
              DOI: {paper.doi} // PDF [{paper.pages} PAGES]
            </div>
          </div>
        ))}
      </div>

      {/* Telemetry Widget */}
      <div className="widget">
        <div className="widget-heading">
          <span>NETWORK AUDIT RUNTIME</span>
          <span>[LIVE]</span>
        </div>
        <div className="telemetry-card">
          &gt; NODE: {telemetry.node}
          <br />
          &gt; RUNTIME: {telemetry.runtime}
          <br />
          &gt; ALLOCATED MEM: {telemetry.allocatedMem}
          <br />
          &gt; CPU EFFICIENCY: {telemetry.cpuEfficiency}
          <br />
          &gt; INVOCATION OVERHEAD: {telemetry.invocationOverhead}
          <br />
          <span className="red-alert">&gt; STATUS: {telemetry.status}</span>
        </div>
      </div>

      {/* Submission Box */}
      <div className="widget">
        <div className="widget-heading">
          <span>CONTRIBUTIONS</span>
        </div>
        <p style={{ fontSize: '0.88rem', marginBottom: '12px' }}>
          We accept unsolicited technical dissections and proofs. Submissions
          must include reproducible benchmark harnesses. Marketing copy will be
          rejected without reply.
        </p>
        <Link
          href="/admin"
          style={{
            fontWeight: 800,
            color: 'var(--red)',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
          }}
        >
          Submit Paper Specs &rarr;
        </Link>
      </div>
    </aside>
  );
}
