import Sidebar from '@/components/Sidebar';

export default function ManifestoPage() {
  return (
    <div className="layout-grid">
      <main className="content-area">
        <div className="category-tag">EDITORIAL // MANIFESTO</div>
        <h1 className="hero-title">No Fear. No Favor.</h1>
        <p className="lead">
          Why Distant CS exists: To champion resource-agnostic computational theory and reject architectural dogma.
        </p>
        <div className="pullquote">
          "Distributing state across 20 network boundaries when your data fits in single-socket L3 cache is not engineering—it is negligence."
        </div>
      </main>
      <Sidebar />
    </div>
  );
}
