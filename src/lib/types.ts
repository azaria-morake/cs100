export interface BenchmarkRow {
  architecture: string;
  p50: string;
  p99: string;
  memory: string;
}

export interface Article {
  id?: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  topic: string;
  readTime: string;
  lead: string;
  body: string[];
  markdownContent?: string;
  pullquote?: string;
  benchmarks?: BenchmarkRow[];
  flameGraphHeader?: string;
  flameGraphLines?: string[];
  publishedAt: string;
  isFeatured?: boolean;
}

export interface Paper {
  id: string;
  title: string;
  doi: string;
  authors?: string;
  year?: number;
  abstract?: string;
  pages: number;
  pdfUrl?: string;
  bibtex?: string;
  category?: string;
}

export interface TelemetryData {
  node: string;
  runtime: string;
  allocatedMem: string;
  cpuEfficiency: string;
  invocationOverhead: string;
  status: string;
}
