import { notFound } from 'next/navigation';
import { getArticleBySlug } from '@/lib/firebase/articles';
import BenchmarkTable from '@/components/BenchmarkTable';
import TerminalBox from '@/components/TerminalBox';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DissectionPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="layout-grid">
      <main className="content-area">
        <div className="mb-4">
          <Link href="/" className="font-mono text-xs font-bold uppercase text-[#cb4035] hover:underline">
            &larr; Back to Publications
          </Link>
        </div>

        <div className="category-tag">{article.category}</div>
        <h1 className="hero-title">{article.title}</h1>
        <div className="article-meta">
          AUTHOR: <span>{article.author}</span> // TOPIC: <span>{article.topic}</span> // READ TIME: <span>{article.readTime}</span>
        </div>

        <p className="lead">{article.lead}</p>

        {article.body && article.body.map((paragraph, index) => (
          <p key={index} className="article-body-p">
            {paragraph}
          </p>
        ))}

        {article.pullquote && (
          <div className="pullquote">&ldquo;{article.pullquote}&rdquo;</div>
        )}

        {article.benchmarks && article.benchmarks.length > 0 && (
          <BenchmarkTable benchmarks={article.benchmarks} />
        )}

        {article.flameGraphLines && article.flameGraphLines.length > 0 && (
          <TerminalBox 
            header={article.flameGraphHeader} 
            lines={article.flameGraphLines} 
          />
        )}
      </main>

      <Sidebar />
    </div>
  );
}
