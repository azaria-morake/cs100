import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="flex items-center gap-3 flex-wrap">
        <span>&copy; {new Date().getFullYear()} DISTANT CS PUBLICATIONS. UNCOMPROMISING SYSTEMS ARCHITECTURE.</span>
        <span className="text-white/30">|</span>
        <Link href="/feed.xml" className="text-[#ff6b6b] hover:underline">
          RSS 2.0 SYNDICATION
        </Link>
      </div>
      <span>ALL PROOFS REPRODUCIBLE</span>
    </footer>
  );
}
