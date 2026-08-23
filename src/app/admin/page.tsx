'use client';

import { useState } from 'react';
import { Article, BenchmarkRow } from '@/lib/types';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { saveArticle } from '@/lib/firebase/articles';
import BenchmarkTable from '@/components/BenchmarkTable';
import TerminalBox from '@/components/TerminalBox';

export default function AdminPage() {
  const [formData, setFormData] = useState<Article>({
    title: '',
    slug: '',
    category: 'SYSTEM DISSECTION // CASE STUDY #105',
    author: 'DR. ALAN VECTOR',
    topic: 'DISTRIBUTED SYSTEMS',
    readTime: '8 MIN',
    lead: '',
    body: [''],
    pullquote: '',
    benchmarks: [
      { architecture: 'Unified In-Memory State Machine', p50: '0.40 ms', p99: '1.10 ms', memory: '128 MB' },
      { architecture: 'HTTP Microservices (12 Nodes)', p50: '98.00 ms', p99: '420.50 ms', memory: '8.4 GB' },
    ],
    flameGraphHeader: '> FLAME_GRAPH_AUDIT: P99_TRACE',
    flameGraphLines: [
      '[0.00ms] HTTP POST /entrypoint',
      '  ├── [18.20ms] PROTOBUF_DECODE',
      '  └── [85.40ms] RPC_CALL: Worker-02 (ALERT)'
    ],
    publishedAt: new Date().toISOString().split('T')[0],
  });

  const [rawBody, setRawBody] = useState('');
  const [rawFlameLines, setRawFlameLines] = useState(
    formData.flameGraphLines?.join('\n') || ''
  );
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const autoSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug === '' || prev.slug === autoSlug.slice(0, -1) ? autoSlug : prev.slug,
    }));
  };

  const handleBenchmarkChange = (index: number, field: keyof BenchmarkRow, value: string) => {
    const updated = [...(formData.benchmarks || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, benchmarks: updated }));
  };

  const addBenchmarkRow = () => {
    setFormData((prev) => ({
      ...prev,
      benchmarks: [
        ...(prev.benchmarks || []),
        { architecture: 'New Architecture Model', p50: '0.00 ms', p99: '0.00 ms', memory: '0 MB' },
      ],
    }));
  };

  const removeBenchmarkRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benchmarks: (prev.benchmarks || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const bodyParagraphs = rawBody
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const flameLines = rawFlameLines
      .split('\n')
      .map((line) => line.trimEnd())
      .filter((line) => line.length > 0);

    const payload: Article = {
      ...formData,
      body: bodyParagraphs.length > 0 ? bodyParagraphs : formData.body,
      flameGraphLines: flameLines,
    };

    try {
      if (!isFirebaseConfigured) {
        setStatusMessage({
          type: 'info',
          text: 'Firebase environment variables not detected. To publish to Cloud Firestore, fill in your credentials in .env.local.',
        });
      } else {
        const id = await saveArticle(payload);
        setStatusMessage({
          type: 'success',
          text: `Editorial published successfully to Firestore with ID: ${id}`,
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setStatusMessage({
        type: 'error',
        text: `Publication failed: ${errorMsg}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
      {/* Header bar */}
      <div className="border-b-2 border-[#1b1a19] pb-4 mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="category-tag">CONTROL NODE // EDITORIAL DISPATCH</div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Editorial CMS</h1>
        </div>
        
        {/* Status Badge */}
        <div className="font-mono text-xs p-2 border border-[#1b1a19] bg-white">
          FIREBASE BACKEND:{' '}
          {isFirebaseConfigured ? (
            <span className="text-green-600 font-bold">ONLINE & CONNECTED</span>
          ) : (
            <span className="text-[#cb4035] font-bold">AWAITING .ENV CREDENTIALS</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-[#1b1a19] mb-8 bg-[#1b1a19]">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'editor'
              ? 'bg-[#cb4035] text-white'
              : 'text-[#f4f1ea] hover:bg-white/10'
          }`}
        >
          1. Editorial Form
        </button>
        <button
          type="button"
          onClick={() => {
            const bodyParagraphs = rawBody
              .split('\n\n')
              .map((p) => p.trim())
              .filter((p) => p.length > 0);
            const flameLines = rawFlameLines
              .split('\n')
              .map((line) => line.trimEnd())
              .filter((line) => line.length > 0);
            setFormData((prev) => ({
              ...prev,
              body: bodyParagraphs.length > 0 ? bodyParagraphs : prev.body,
              flameGraphLines: flameLines,
            }));
            setActiveTab('preview');
          }}
          className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'preview'
              ? 'bg-[#cb4035] text-white'
              : 'text-[#f4f1ea] hover:bg-white/10'
          }`}
        >
          2. Live Publication Preview
        </button>
      </div>

      {/* Status alerts */}
      {statusMessage && (
        <div
          className={`p-4 mb-6 border-2 border-[#1b1a19] font-mono text-sm ${
            statusMessage.type === 'success'
              ? 'bg-green-100 text-green-900 border-green-800'
              : statusMessage.type === 'error'
              ? 'bg-red-100 text-red-900 border-red-800'
              : 'bg-amber-100 text-amber-900 border-amber-800'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {activeTab === 'editor' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-[#1b1a19] bg-white/50">
            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-1">
                Editorial Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Your Microservices Architecture is Just Bad OOP at Scale"
                value={formData.title}
                onChange={handleTitleChange}
                className="w-full p-2 border border-[#1b1a19] font-sans font-bold bg-[#f4f1ea] focus:outline-none focus:ring-2 focus:ring-[#cb4035]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-1">
                URL Slug
              </label>
              <input
                type="text"
                required
                placeholder="e.g. bad-oop-at-scale"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full p-2 border border-[#1b1a19] font-mono text-sm bg-[#f4f1ea] focus:outline-none focus:ring-2 focus:ring-[#cb4035]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-1">
                Category / Volume Tag
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border border-[#1b1a19] font-mono text-xs bg-[#f4f1ea]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-1">
                  Author
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full p-2 border border-[#1b1a19] font-mono text-xs bg-[#f4f1ea]"
                />
              </div>
              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full p-2 border border-[#1b1a19] font-mono text-xs bg-[#f4f1ea]"
                />
              </div>
              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-1">
                  Read Time
                </label>
                <input
                  type="text"
                  required
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  className="w-full p-2 border border-[#1b1a19] font-mono text-xs bg-[#f4f1ea]"
                />
              </div>
            </div>
          </div>

          {/* Lead & Pullquote */}
          <div className="space-y-4 p-4 border border-[#1b1a19] bg-white/50">
            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-1">
                Lead Paragraph (Hook)
              </label>
              <textarea
                rows={3}
                required
                placeholder="By trading in-memory function invocations for uncompressed HTTP REST hops..."
                value={formData.lead}
                onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                className="w-full p-2 border border-[#1b1a19] bg-[#f4f1ea] font-medium"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-1">
                Pullquote (Callout)
              </label>
              <input
                type="text"
                placeholder="An algorithm is a strategy to reach a goal under constraints..."
                value={formData.pullquote || ''}
                onChange={(e) => setFormData({ ...formData, pullquote: e.target.value })}
                className="w-full p-2 border border-[#1b1a19] bg-[#f4f1ea] italic"
              />
            </div>
          </div>

          {/* Main Body */}
          <div className="p-4 border border-[#1b1a19] bg-white/50">
            <label className="block font-mono text-xs font-bold uppercase mb-1">
              Body Text (Separate paragraphs with double newlines)
            </label>
            <textarea
              rows={6}
              placeholder="We audited a standard e-commerce transaction pipeline operating across 18 distinct microservices...&#10;&#10;In next week's issue, we break down the assembly generated by popular ORM frameworks..."
              value={rawBody}
              onChange={(e) => setRawBody(e.target.value)}
              className="w-full p-2 border border-[#1b1a19] bg-[#f4f1ea] font-mono text-sm leading-relaxed"
            />
          </div>

          {/* Benchmark Table Editor */}
          <div className="p-4 border border-[#1b1a19] bg-white/50 space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-mono text-xs font-bold uppercase">
                Latency & Resource Benchmarks
              </label>
              <button
                type="button"
                onClick={addBenchmarkRow}
                className="px-3 py-1 font-mono text-xs font-bold bg-[#1b1a19] text-white hover:bg-[#cb4035]"
              >
                + Add Benchmark Row
              </button>
            </div>

            <div className="space-y-2">
              {formData.benchmarks?.map((row, idx) => (
                <div key={idx} className="flex gap-2 items-center flex-wrap md:flex-nowrap">
                  <input
                    type="text"
                    placeholder="Architecture Model"
                    value={row.architecture}
                    onChange={(e) => handleBenchmarkChange(idx, 'architecture', e.target.value)}
                    className="flex-2 p-1.5 border border-[#1b1a19] bg-[#f4f1ea] font-bold text-xs"
                  />
                  <input
                    type="text"
                    placeholder="p50 Latency"
                    value={row.p50}
                    onChange={(e) => handleBenchmarkChange(idx, 'p50', e.target.value)}
                    className="w-24 p-1.5 border border-[#1b1a19] bg-[#f4f1ea] font-mono text-xs"
                  />
                  <input
                    type="text"
                    placeholder="p99 Latency"
                    value={row.p99}
                    onChange={(e) => handleBenchmarkChange(idx, 'p99', e.target.value)}
                    className="w-24 p-1.5 border border-[#1b1a19] bg-[#f4f1ea] font-mono text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Memory"
                    value={row.memory}
                    onChange={(e) => handleBenchmarkChange(idx, 'memory', e.target.value)}
                    className="w-24 p-1.5 border border-[#1b1a19] bg-[#f4f1ea] font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeBenchmarkRow(idx)}
                    className="px-2 py-1.5 bg-red-700 text-white font-mono text-xs hover:bg-red-800"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Flame Graph Trace */}
          <div className="p-4 border border-[#1b1a19] bg-white/50 space-y-2">
            <label className="block font-mono text-xs font-bold uppercase mb-1">
              Terminal Diagnostic Trace (ASCII Tree)
            </label>
            <input
              type="text"
              placeholder="Header (e.g. > FLAME_GRAPH_AUDIT: CHECKOUT_TRACE_P99)"
              value={formData.flameGraphHeader}
              onChange={(e) => setFormData({ ...formData, flameGraphHeader: e.target.value })}
              className="w-full p-2 border border-[#1b1a19] bg-[#141312] text-[#cb4035] font-mono text-xs font-bold"
            />
            <textarea
              rows={4}
              placeholder="[0.00ms] HTTP POST /checkout&#10;  ├── [42.10ms] JSON_SERIALIZE&#10;  └── [579.40ms] RETRY_STORM (ALERT)"
              value={rawFlameLines}
              onChange={(e) => setRawFlameLines(e.target.value)}
              className="w-full p-2 border border-[#1b1a19] bg-[#141312] text-[#f4f1ea] font-mono text-xs leading-relaxed"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-[#cb4035] text-white font-mono text-sm font-black uppercase tracking-widest border-2 border-[#1b1a19] hover:bg-[#1b1a19] transition disabled:opacity-50"
            >
              {isSubmitting ? 'TRANSMITTING TO FIRESTORE...' : 'PUBLISH EDITORIAL DISSECTION →'}
            </button>
          </div>
        </form>
      ) : (
        /* Preview Tab */
        <div className="p-8 border-2 border-[#1b1a19] bg-[#f4f1ea]">
          <div className="category-tag">{formData.category || 'SYSTEM DISSECTION'}</div>
          <h1 className="hero-title">{formData.title || 'Untitled Editorial Dissection'}</h1>
          <div className="article-meta">
            AUTHOR: <span>{formData.author}</span> // TOPIC: <span>{formData.topic}</span> // READ TIME: <span>{formData.readTime}</span>
          </div>

          <p className="lead">{formData.lead || 'No lead paragraph provided.'}</p>

          {formData.body?.map((paragraph, index) => (
            <p key={index} className="article-body-p">
              {paragraph}
            </p>
          ))}

          {formData.pullquote && (
            <div className="pullquote">&ldquo;{formData.pullquote}&rdquo;</div>
          )}

          {formData.benchmarks && formData.benchmarks.length > 0 && (
            <BenchmarkTable benchmarks={formData.benchmarks} />
          )}

          {formData.flameGraphLines && formData.flameGraphLines.length > 0 && (
            <TerminalBox 
              header={formData.flameGraphHeader} 
              lines={formData.flameGraphLines} 
            />
          )}
        </div>
      )}
    </div>
  );
}
