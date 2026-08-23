import Sidebar from '@/components/Sidebar';
import TerminalBox from '@/components/TerminalBox';
import { defaultFeaturedArticle } from '@/lib/defaultData';

export default function AuditsPage() {
  return (
    <div className="layout-grid">
      <main className="content-area">
        <div className="category-tag">SECTION // SYSTEM AUDITS</div>
        <h1 className="hero-title">Real-World Flame Graph Audits</h1>
        <p className="lead">
          Deconstructing production traces, lock contentions, and serialization bottlenecks.
        </p>
        <div className="mt-8">
          <TerminalBox header={defaultFeaturedArticle.flameGraphHeader} lines={defaultFeaturedArticle.flameGraphLines} />
        </div>
      </main>
      <Sidebar />
    </div>
  );
}
