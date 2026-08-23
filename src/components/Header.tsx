import Link from 'next/link';

export default function Header() {
  return (
    <header className="masthead">
      <Link href="/" className="logo-container">
        <span className="logo-distant">Distant</span>
        <span className="logo-cs">CS</span>
      </Link>
      <div className="masthead-meta">
        EDITORIAL MOTTO: NO FEAR. NO FAVOR.<br />
        RESOURCE-AGNOSTIC COMPUTATIONAL THEORY
      </div>
    </header>
  );
}
