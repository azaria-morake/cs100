import Sidebar from '@/components/Sidebar';
import { defaultPapers } from '@/lib/defaultData';

export default function PapersPage() {
  return (
    <div className="layout-grid">
      <main className="content-area">
        <div className="category-tag">SECTION // PEER-REVIEWED ARCHIVE</div>
        <h1 className="hero-title">Formal Papers & Publications</h1>
        <p className="lead">
          Reproducible systems proofs, consensus architectures, and empirical hardware utilization benchmarks.
        </p>

        <div className="space-y-6 mt-8">
          {defaultPapers.map((paper) => (
            <div key={paper.id} id={paper.id} className="p-6 border-2 border-[#1b1a19] bg-white/40">
              <div className="font-mono text-xs font-bold text-[#cb4035] mb-2 uppercase">
                PEER-REVIEWED SPECIFICATION // DOI: {paper.doi}
              </div>
              <h2 className="text-2xl font-black mb-3">{paper.title}</h2>
              <p className="text-sm text-[#1b1a19] mb-4">
                Abstract: Rigorous mathematical analysis and deterministic simulations on asymmetrical latency networks.
              </p>
              <div className="font-mono text-xs text-[#6f6b64]">
                FORMAT: PDF [{paper.pages} PAGES] • HARNESS: REPRODUCIBLE C HARNESS AVAILABLE
              </div>
            </div>
          ))}
        </div>
      </main>
      <Sidebar />
    </div>
  );
}
