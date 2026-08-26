import Link from 'next/link';

export default function TopStrip() {
  return (
    <div className="top-strip">
      <div className="flex items-center gap-4 flex-wrap">
        <span>DISTANT CS PUBLICATION NODE // EST. 1978</span>
        <span className="hidden md:inline text-white/30">|</span>
        <span>SYSTEM STATUS: UNCOMPROMISED</span>
      </div>

      <div className="flex items-center gap-4">
        <span>PEER REVIEW: ACTIVE</span>
        <span className="text-white/30">|</span>
        <Link href="/feed.xml" className="text-[#ff6b6b] hover:underline font-bold flex items-center gap-1">
          <span>📡 RSS FEED</span>
        </Link>
      </div>
    </div>
  );
}
