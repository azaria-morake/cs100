import EditorialBanner from '@/components/EditorialBanner';
import BenchmarkTable from '@/components/BenchmarkTable';
import TerminalBox from '@/components/TerminalBox';
import Sidebar from '@/components/Sidebar';
import { getArticles } from '@/lib/firebase/articles';
import Link from 'next/link';

export default async function HomePage() {
  const articles = await getArticles();
  const featured = articles[0];

  return (
    <>
      <EditorialBanner />

      <div className="layout-grid">
        {/* Main Column: Featured Article */}
        <main className="content-area">
          <div className="category-tag">{featured.category}</div>
          <h1 className="hero-title">{featured.title}</h1>
          <div className="article-meta">
            AUTHOR: <span>{featured.author}</span> // TOPIC: <span>{featured.topic}</span> // READ TIME: <span>{featured.readTime}</span>
          </div>

          <p className="lead">{featured.lead}</p>

          {featured.body && featured.body.map((paragraph, index) => (
            <p key={index} className="article-body-p">
              {paragraph}
            </p>
          ))}

          {featured.pullquote && (
            <div className="pullquote">&ldquo;{featured.pullquote}&rdquo;</div>
          )}

          {/* Benchmark Table */}
          {featured.benchmarks && featured.benchmarks.length > 0 && (
            <BenchmarkTable benchmarks={featured.benchmarks} />
          )}

          {/* Terminal Diagnostic Dump */}
          {featured.flameGraphLines && featured.flameGraphLines.length > 0 && (
            <TerminalBox 
              header={featured.flameGraphHeader} 
              lines={featured.flameGraphLines} 
            />
          )}

          {articles.length > 1 && (
            <div className="mt-12 pt-8 border-t-2 border-[#1b1a19]">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#6f6b64] mb-4">
                RECENT EDITORIAL DISSECTIONS
              </div>
              <div className="space-y-4">
                {articles.slice(1).map((article) => (
                  <div key={article.slug} className="p-4 border border-[#1b1a19]/30 hover:border-[#1b1a19] bg-white/40">
                    <Link href={`/dissections/${article.slug}`} className="font-bold text-lg hover:text-[#cb4035] block">
                      {article.title}
                    </Link>
                    <div className="font-mono text-xs text-[#6f6b64] mt-1">
                      {article.category} • By {article.author} • {article.readTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </>
  );
}
