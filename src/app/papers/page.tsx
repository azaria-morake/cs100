'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Paper } from '@/lib/types';
import { getPapers } from '@/lib/firebase/papers';
import { defaultPapers } from '@/lib/defaultData';

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>(defaultPapers);
  const [activeBibtex, setActiveBibtex] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadPapers() {
      const data = await getPapers();
      setPapers(data);
    }
    loadPapers();
  }, []);

  const handleCopyBibtex = (paper: Paper) => {
    const defaultBib = `@article{${paper.id.replace(/-/g, '_')},
  author    = {${paper.authors || 'Unknown'}},
  title     = {${paper.title}},
  journal   = {Distant CS Proceedings on Computational Systems},
  volume    = {78},
  pages     = {1--${paper.pages}},
  year      = {${paper.year || 2026}},
  doi       = {${paper.doi}}
}`;

    const bibtexString = paper.bibtex || defaultBib;
    navigator.clipboard.writeText(bibtexString);
    setCopiedId(paper.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPapers = papers.filter((paper) => {
    const query = searchQuery.toLowerCase();
    return (
      paper.title.toLowerCase().includes(query) ||
      (paper.authors && paper.authors.toLowerCase().includes(query)) ||
      paper.doi.toLowerCase().includes(query) ||
      (paper.category && paper.category.toLowerCase().includes(query))
    );
  });

  return (
    <div className="layout-grid">
      <main className="content-area">
        <div className="category-tag">SECTION // PEER-REVIEWED ARCHIVE</div>
        <h1 className="hero-title">Formal Papers & Publications</h1>
        <p className="lead">
          Peer-reviewed mathematical specifications, formal memory models, and reproducible systems architectures.
        </p>

        {/* Search & Filter Bar */}
        <div className="my-6 p-4 border border-[#1b1a19] bg-white/60 flex justify-between items-center flex-wrap gap-4 font-mono text-xs">
          <div className="flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Search by title, author, DOI, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-[#1b1a19] bg-[#f4f1ea] focus:outline-none focus:ring-2 focus:ring-[#cb4035]"
            />
          </div>
          <div className="text-[#6f6b64]">
            INDEXED ARCHIVE: <strong>{filteredPapers.length} / {papers.length} PAPERS</strong>
          </div>
        </div>

        {/* Papers List */}
        {filteredPapers.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-[#1b1a19]/40 text-center font-mono text-xs text-[#6f6b64] my-8">
            &gt; NO FORMAL PAPERS RECORDED IN THIS ARCHIVE.
          </div>
        ) : (
          <div className="space-y-8 mt-6">
            {filteredPapers.map((paper) => (
            <article key={paper.id} id={paper.id} className="p-6 border-2 border-[#1b1a19] bg-white/70 shadow-[4px_4px_0px_rgba(27,26,25,0.1)]">
              <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
                <span className="font-mono text-xs font-bold text-[#cb4035] uppercase">
                  {paper.category || 'FORMAL SPECIFICATION'} // DOI: {paper.doi}
                </span>
                <span className="font-mono text-xs bg-[#1b1a19] text-[#f4f1ea] px-2 py-0.5 font-bold">
                  VOL. 78 ({paper.year || 2026})
                </span>
              </div>

              <h2 className="text-2xl font-black mb-2 tracking-tight text-[#1b1a19] hover:text-[#cb4035] transition">
                {paper.title}
              </h2>

              <div className="font-mono text-xs text-[#6f6b64] mb-4">
                AUTHORS: <strong>{paper.authors || 'Distant CS Research Group'}</strong> • PAGES: {paper.pages}
              </div>

              {paper.abstract && (
                <div className="my-3 text-sm leading-relaxed text-[#1b1a19] bg-[#f4f1ea]/80 p-3 border-l-2 border-[#1b1a19]">
                  <strong className="font-mono text-xs text-[#6f6b64] block mb-1">ABSTRACT:</strong>
                  {paper.abstract}
                </div>
              )}

              {/* Action Toolbar */}
              <div className="mt-4 pt-3 border-t border-[#1b1a19]/20 flex justify-between items-center flex-wrap gap-3 font-mono text-xs">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyBibtex(paper)}
                    className="px-3 py-1.5 bg-[#1b1a19] text-white hover:bg-[#cb4035] font-bold uppercase transition"
                  >
                    {copiedId === paper.id ? '✓ BIBTEX COPIED' : 'COPY BIBTEX CITATION'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveBibtex(activeBibtex === paper.id ? null : paper.id)}
                    className="px-3 py-1.5 border border-[#1b1a19] hover:bg-[#1b1a19] hover:text-white uppercase font-bold transition"
                  >
                    {activeBibtex === paper.id ? 'HIDE BIBTEX' : 'VIEW BIBTEX'}
                  </button>
                </div>

                <a
                  href={paper.pdfUrl || `#${paper.id}`}
                  className="font-bold text-[#cb4035] hover:underline uppercase"
                >
                  DOWNLOAD PDF [{paper.pages} PAGES] &rarr;
                </a>
              </div>

              {/* Collapsible BibTeX Drawer */}
              {activeBibtex === paper.id && (
                <div className="mt-4 p-4 bg-[#141312] text-[#70d68a] font-mono text-xs overflow-x-auto border border-[#1b1a19]">
                  <div className="text-white/60 mb-2 border-b border-white/10 pb-1 text-[10px] uppercase">
                    BIBTEX CITATION RECORD
                  </div>
                  <pre>{paper.bibtex || `@article{${paper.id.replace(/-/g, '_')},
  author    = {${paper.authors || 'Unknown'}},
  title     = {${paper.title}},
  journal   = {Distant CS Proceedings on Computational Systems},
  volume    = {78},
  pages     = {1--${paper.pages}},
  year      = {${paper.year || 2026}},
  doi       = {${paper.doi}}
}`}</pre>
                </div>
              )}
            </article>
          ))}
        </div>
        )}
      </main>
      <Sidebar />
    </div>
  );
}
