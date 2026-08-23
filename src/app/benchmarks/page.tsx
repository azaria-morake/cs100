import Sidebar from '@/components/Sidebar';
import BenchmarkTable from '@/components/BenchmarkTable';
import { defaultFeaturedArticle } from '@/lib/defaultData';

export default function BenchmarksPage() {
  return (
    <div className="layout-grid">
      <main className="content-area">
        <div className="category-tag">SECTION // EMPIRICAL BENCHMARKS</div>
        <h1 className="hero-title">Latency & Allocations Suite</h1>
        <p className="lead">
          Real-world hardware telemetry testing across architectures, memory models, and serialization protocols.
        </p>

        <div className="mt-8">
          <h2 className="text-xl font-black uppercase mb-4">Suite #104: Monolith vs Distributed RPC Latency</h2>
          <BenchmarkTable benchmarks={defaultFeaturedArticle.benchmarks} />
        </div>
      </main>
      <Sidebar />
    </div>
  );
}
