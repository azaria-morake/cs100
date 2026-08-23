import Sidebar from '@/components/Sidebar';

export default function PrinciplesPage() {
  return (
    <div className="layout-grid">
      <main className="content-area">
        <div className="category-tag">SECTION // FIRST PRINCIPLES</div>
        <h1 className="hero-title">First Principles of Computing</h1>
        <p className="lead">
          Foundational laws of computer architecture, mechanical sympathy, and the cost of abstraction.
        </p>
        <div className="pullquote">
          "Hardware is deterministic. Software is the practice of managing constraints."
        </div>
      </main>
      <Sidebar />
    </div>
  );
}
