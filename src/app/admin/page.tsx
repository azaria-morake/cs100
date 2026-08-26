'use client';

import { useState, useEffect, useCallback } from 'react';
import { Article, BenchmarkRow, Paper } from '@/lib/types';
import { useAuth } from '@/lib/firebase/authContext';
import { getArticles, saveArticle, deleteArticle, seedDefaultArticleToFirestore } from '@/lib/firebase/articles';
import { getPapers, savePaper, deletePaper, seedDefaultPapersToFirestore } from '@/lib/firebase/papers';
import BenchmarkTable from '@/components/BenchmarkTable';
import TerminalBox from '@/components/TerminalBox';
import MarkdownRenderer from '@/components/MarkdownRenderer';

const initialArticleState: Article = {
  title: '',
  slug: '',
  category: 'SYSTEM DISSECTION // CASE STUDY #105',
  author: 'DR. ALAN VECTOR',
  topic: 'DISTRIBUTED SYSTEMS',
  readTime: '8 MIN',
  lead: '',
  body: [''],
  markdownContent: '### Theoretical Analysis\n\n```rust\npub fn execute() {\n    // In-memory zero overhead computation\n}\n```\n\n$$\\mathcal{O}(1) \\ll \\mathcal{O}(\\log N)$$',
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
  isFeatured: false,
};

const initialPaperState: Paper = {
  id: '',
  title: '',
  doi: '10.1978/DCS.',
  authors: 'Dr. Alan Vector',
  year: 2026,
  pages: 16,
  category: 'DISTRIBUTED SYSTEMS',
  abstract: '',
  bibtex: '',
};

export default function AdminPage() {
  const { user, loading, isConfigured, signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser, error: authError, clearError } = useAuth();

  // Auth form states
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // CMS Navigation Tab
  const [activeSection, setActiveSection] = useState<'articles' | 'papers'>('articles');
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'preview'>('list');

  // Articles state
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [formData, setFormData] = useState<Article>(initialArticleState);
  const [rawBody, setRawBody] = useState('');
  const [rawFlameLines, setRawFlameLines] = useState(initialArticleState.flameGraphLines?.join('\n') || '');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Papers state
  const [papersList, setPapersList] = useState<Paper[]>([]);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [paperForm, setPaperForm] = useState<Paper>(initialPaperState);
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAllData = useCallback(async () => {
    setLoadingArticles(true);
    setLoadingPapers(true);
    try {
      const [articles, papers] = await Promise.all([getArticles(), getPapers()]);
      setArticlesList(articles);
      setPapersList(papers);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoadingArticles(false);
      setLoadingPapers(false);
    }
  }, []);

  useEffect(() => {
    if (user || demoMode) {
      fetchAllData();
    }
  }, [user, demoMode, fetchAllData]);

  // Auth submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSubmitting(true);
    clearError();
    try {
      if (authMode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch {
      // Handled by AuthContext
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthSubmitting(true);
    clearError();
    try {
      await signInWithGoogle();
    } catch {
      // Handled by AuthContext
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Article handlers
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

  const handleEditArticle = (art: Article) => {
    setEditingId(art.id || art.slug);
    setFormData(art);
    setRawBody(art.body ? art.body.join('\n\n') : '');
    setRawFlameLines(art.flameGraphLines ? art.flameGraphLines.join('\n') : '');
    setActiveTab('editor');
    setStatusMessage(null);
  };

  const handleNewArticle = () => {
    setEditingId(null);
    setFormData(initialArticleState);
    setRawBody('');
    setRawFlameLines(initialArticleState.flameGraphLines?.join('\n') || '');
    setActiveTab('editor');
    setStatusMessage(null);
  };

  const handleDeleteArticle = async (id?: string) => {
    if (!id) return;
    if (!confirm(`Delete editorial "${id}"?`)) return;

    try {
      setArticlesList((prev) => prev.filter((a) => (a.id || a.slug) !== id));
      await deleteArticle(id);
      setStatusMessage({ type: 'success', text: `Article ${id} deleted permanently.` });
      fetchAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      setStatusMessage({ type: 'error', text: msg });
      fetchAllData();
    }
  };

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const bodyParagraphs = rawBody.split('\n\n').map((p) => p.trim()).filter((p) => p.length > 0);
    const flameLines = rawFlameLines.split('\n').map((line) => line.trimEnd()).filter((line) => line.length > 0);

    const payload: Article = {
      ...formData,
      id: editingId || formData.id || formData.slug,
      body: bodyParagraphs.length > 0 ? bodyParagraphs : formData.body,
      flameGraphLines: flameLines,
    };

    try {
      if (!isConfigured) {
        setStatusMessage({
          type: 'info',
          text: 'Firebase environment variables not set. Form validated in offline mode.',
        });
      } else {
        const id = await saveArticle(payload);
        setStatusMessage({
          type: 'success',
          text: `Editorial published successfully to Cloud Firestore (ID: ${id})`,
        });
        fetchAllData();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setStatusMessage({ type: 'error', text: `Publication failed: ${errorMsg}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paper handlers
  const handlePaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const id = await savePaper(paperForm);
      setStatusMessage({ type: 'success', text: `Paper saved to Firestore (ID: ${id})` });
      fetchAllData();
      setEditingPaperId(null);
      setPaperForm(initialPaperState);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setStatusMessage({ type: 'error', text: `Paper save failed: ${errorMsg}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPaper = (p: Paper) => {
    setEditingPaperId(p.id);
    setPaperForm(p);
    setStatusMessage(null);
  };

  const handleDeletePaper = async (id: string) => {
    if (!confirm(`Delete paper "${id}"?`)) return;
    try {
      setPapersList((prev) => prev.filter((p) => p.id !== id));
      await deletePaper(id);
      setStatusMessage({ type: 'success', text: `Paper "${id}" deleted permanently.` });
      fetchAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      setStatusMessage({ type: 'error', text: msg });
      fetchAllData();
    }
  };

  const autoGenerateBibtex = () => {
    const bib = `@article{${paperForm.id ? paperForm.id.replace(/-/g, '_') : 'paper_' + Date.now()},
  author    = {${paperForm.authors || 'Unknown'}},
  title     = {${paperForm.title || 'Untitled'}},
  journal   = {Distant CS Proceedings on Computational Systems},
  volume    = {78},
  pages     = {1--${paperForm.pages || 16}},
  year      = {${paperForm.year || 2026}},
  doi       = {${paperForm.doi || '10.1978/DCS.00000'}}
}`;
    setPaperForm((prev) => ({ ...prev, bibtex: bib }));
  };

  const handleSeedPapers = async () => {
    try {
      setIsSubmitting(true);
      await seedDefaultPapersToFirestore();
      setStatusMessage({ type: 'success', text: 'Sample papers seeded into Cloud Firestore successfully!' });
      fetchAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Seeding failed';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeedArticle = async () => {
    try {
      setIsSubmitting(true);
      await seedDefaultArticleToFirestore();
      setStatusMessage({ type: 'success', text: 'Sample dissection seeded into Cloud Firestore successfully!' });
      fetchAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Seeding failed';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center font-mono">
        <div className="category-tag">SYSTEM AUTH</div>
        <p className="mt-4">VERIFYING SECURITY CREDENTIALS...</p>
      </div>
    );
  }

  // Auth Gate
  if (!user && !demoMode) {
    return (
      <div className="p-6 md:p-12 max-w-xl mx-auto w-full">
        <div className="p-8 border-2 border-[#1b1a19] bg-[#f4f1ea] shadow-[6px_6px_0px_rgba(27,26,25,1)]">
          <div className="category-tag">ACCESS CONTROL // EDITORIAL GATE</div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight my-3">
            Editorial Node Sign-In
          </h1>
          <p className="text-sm text-[#6f6b64] font-mono mb-6">
            Authentication required to modify publication articles, benchmarks, and formal papers.
          </p>

          {authError && (
            <div className="p-3 mb-6 bg-red-100 border border-red-800 text-red-900 font-mono text-xs">
              &gt; AUTH_ERROR: {authError}
            </div>
          )}

          <div className="space-y-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authSubmitting}
              className="w-full py-3 px-4 bg-[#1b1a19] text-[#f4f1ea] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#cb4035] transition flex items-center justify-center gap-3 border border-[#1b1a19]"
            >
              <span>&gt;</span> SIGN IN WITH GOOGLE ACCOUNT
            </button>

            <div className="relative text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1b1a19]/20"></div>
              </div>
              <span className="relative bg-[#f4f1ea] px-3 font-mono text-xs text-[#6f6b64]">
                OR EMAIL DISPATCH
              </span>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-1">Editorial Email</label>
                <input
                  type="email"
                  required
                  placeholder="editor@distantcs.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-[#1b1a19] font-mono text-sm bg-white"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-1">Passcode / Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-[#1b1a19] font-mono text-sm bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3 bg-[#cb4035] text-white font-mono text-xs font-black uppercase tracking-wider border-2 border-[#1b1a19] hover:bg-[#1b1a19] transition"
              >
                {authSubmitting ? 'AUTHENTICATING...' : authMode === 'signin' ? 'SIGN IN TO EDITORIAL SUITE →' : 'REGISTER NEW CREDENTIALS →'}
              </button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                  clearError();
                }}
                className="font-mono text-xs text-[#cb4035] hover:underline"
              >
                {authMode === 'signin' ? 'Need to register a new admin account? Switch to Register' : 'Already have credentials? Switch to Sign In'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      {/* Top Admin User Bar */}
      <div className="p-3 mb-6 border-2 border-[#1b1a19] bg-[#1b1a19] text-[#f4f1ea] flex justify-between items-center flex-wrap gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-green-400 inline-block animate-pulse"></span>
          <span>OPERATOR: <strong>{user?.email || 'ADMIN'}</strong></span>
          <span className="text-[#6f6b64]">|</span>
          <span>SYSTEM: <strong>CLOUD FIRESTORE ONLINE</strong></span>
        </div>

        <div className="flex items-center gap-3">
          {demoMode && (
            <button onClick={() => setDemoMode(false)} className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white uppercase text-xs">
              Exit Demo
            </button>
          )}
          {user && (
            <button onClick={signOutUser} className="px-3 py-1 bg-[#cb4035] hover:bg-red-700 text-white font-bold uppercase text-xs">
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Top Module Switcher */}
      <div className="flex gap-3 mb-6 font-mono text-xs font-bold uppercase">
        <button
          onClick={() => setActiveSection('articles')}
          className={`px-4 py-2 border-2 border-[#1b1a19] transition ${
            activeSection === 'articles' ? 'bg-[#1b1a19] text-white' : 'bg-white hover:bg-[#f4f1ea]'
          }`}
        >
          📰 Editorials & Dissections ({articlesList.length})
        </button>
        <button
          onClick={() => setActiveSection('papers')}
          className={`px-4 py-2 border-2 border-[#1b1a19] transition ${
            activeSection === 'papers' ? 'bg-[#1b1a19] text-white' : 'bg-white hover:bg-[#f4f1ea]'
          }`}
        >
          📄 Formal Papers Archive ({papersList.length})
        </button>
      </div>

      {/* Status Alerts */}
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

      {/* SECTION 1: EDITORIALS */}
      {activeSection === 'articles' && (
        <div>
          {/* Sub Navigation Tabs */}
          <div className="flex border-b-2 border-[#1b1a19] mb-8 bg-[#1b1a19] overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                activeTab === 'list' ? 'bg-[#cb4035] text-white' : 'text-[#f4f1ea] hover:bg-white/10'
              }`}
            >
              1. Manage Articles ({articlesList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                activeTab === 'editor' ? 'bg-[#cb4035] text-white' : 'text-[#f4f1ea] hover:bg-white/10'
              }`}
            >
              2. {editingId ? `Edit "${formData.title || editingId}"` : 'Compose Editorial'}
            </button>
            <button
              type="button"
              onClick={() => {
                const bodyParagraphs = rawBody.split('\n\n').map((p) => p.trim()).filter((p) => p.length > 0);
                const flameLines = rawFlameLines.split('\n').map((l) => l.trimEnd()).filter((l) => l.length > 0);
                setFormData((prev) => ({
                  ...prev,
                  body: bodyParagraphs.length > 0 ? bodyParagraphs : prev.body,
                  flameGraphLines: flameLines,
                }));
                setActiveTab('preview');
              }}
              className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                activeTab === 'preview' ? 'bg-[#cb4035] text-white' : 'text-[#f4f1ea] hover:bg-white/10'
              }`}
            >
              3. Live Reader Preview
            </button>
          </div>

          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h2 className="font-mono text-sm font-bold uppercase text-[#1b1a19]">
                  Published & Seeded Editorials
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSeedArticle}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 border border-[#1b1a19] bg-white hover:bg-[#f4f1ea] font-mono text-xs font-bold uppercase"
                  >
                    ⚡ Seed Sample Dissection
                  </button>
                  <button onClick={handleNewArticle} className="px-3 py-1.5 bg-[#cb4035] text-white font-mono text-xs font-bold uppercase">
                    + New Dissection
                  </button>
                </div>
              </div>

              {loadingArticles ? (
                <div className="p-8 text-center font-mono text-sm">LOADING FROM FIRESTORE...</div>
              ) : (
                <div className="border-2 border-[#1b1a19] bg-white overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#1b1a19] text-[#f4f1ea] font-mono text-xs uppercase">
                        <th className="p-3 border-r border-white/20">Title</th>
                        <th className="p-3 border-r border-white/20">Route</th>
                        <th className="p-3 border-r border-white/20">Author</th>
                        <th className="p-3 border-r border-white/20">Date</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b1a19]/20 font-mono text-xs">
                      {articlesList.map((art) => (
                        <tr key={art.slug} className="hover:bg-[#f4f1ea]/80">
                          <td className="p-3 font-bold font-sans text-sm">{art.title}</td>
                          <td className="p-3 text-[#6f6b64]">/dissections/{art.slug}</td>
                          <td className="p-3">{art.author}</td>
                          <td className="p-3">{art.publishedAt}</td>
                          <td className="p-3 text-right space-x-2 whitespace-nowrap">
                            <button onClick={() => handleEditArticle(art)} className="px-2.5 py-1 bg-[#1b1a19] text-white hover:bg-[#cb4035] font-bold">
                              EDIT
                            </button>
                            <button onClick={() => handleDeleteArticle(art.id || art.slug)} className="px-2.5 py-1 bg-red-700 text-white hover:bg-red-800 font-bold">
                              DEL
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'editor' && (
            <form onSubmit={handleArticleSubmit} className="space-y-6">
              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-[#1b1a19] bg-white/50">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase mb-1">Editorial Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Title..."
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full p-2 border border-[#1b1a19] font-sans font-bold bg-[#f4f1ea]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full p-2 border border-[#1b1a19] font-mono text-sm bg-[#f4f1ea]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase mb-1">Category / Tag</label>
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
                    <label className="block font-mono text-xs font-bold uppercase mb-1">Author</label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full p-2 border border-[#1b1a19] font-mono text-xs bg-[#f4f1ea]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase mb-1">Topic</label>
                    <input
                      type="text"
                      required
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full p-2 border border-[#1b1a19] font-mono text-xs bg-[#f4f1ea]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase mb-1">Read Time</label>
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
                  <label className="block font-mono text-xs font-bold uppercase mb-1">Lead Paragraph (Hook)</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.lead}
                    onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                    className="w-full p-2 border border-[#1b1a19] bg-[#f4f1ea] font-medium"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase mb-1">Pullquote</label>
                  <input
                    type="text"
                    value={formData.pullquote || ''}
                    onChange={(e) => setFormData({ ...formData, pullquote: e.target.value })}
                    className="w-full p-2 border border-[#1b1a19] bg-[#f4f1ea] italic"
                  />
                </div>
              </div>

              {/* Rich Markdown & LaTeX Editor */}
              <div className="p-4 border border-[#1b1a19] bg-white/50 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-mono text-xs font-bold uppercase text-[#cb4035]">
                    Rich Markdown, Code Snippets & LaTeX Math Content
                  </label>
                  <span className="font-mono text-[10px] text-[#6f6b64]">SUPPORTS ```RUST, C, ASM, $$...$$</span>
                </div>
                <textarea
                  rows={8}
                  placeholder="### Deep Technical Analysis&#10;&#10;```rust&#10;pub fn cache_aligned() { ... }&#10;```&#10;&#10;$$P_{99} \ge \sum L_i$$"
                  value={formData.markdownContent || ''}
                  onChange={(e) => setFormData({ ...formData, markdownContent: e.target.value })}
                  className="w-full p-3 border border-[#1b1a19] bg-[#141312] text-[#f4f1ea] font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Benchmarks */}
              <div className="p-4 border border-[#1b1a19] bg-white/50 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-xs font-bold uppercase">Latency Benchmarks</label>
                  <button type="button" onClick={addBenchmarkRow} className="px-3 py-1 font-mono text-xs font-bold bg-[#1b1a19] text-white hover:bg-[#cb4035]">
                    + Add Row
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.benchmarks?.map((row, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={row.architecture}
                        onChange={(e) => handleBenchmarkChange(idx, 'architecture', e.target.value)}
                        className="flex-2 p-1.5 border border-[#1b1a19] bg-[#f4f1ea] font-bold text-xs"
                      />
                      <input
                        type="text"
                        value={row.p50}
                        onChange={(e) => handleBenchmarkChange(idx, 'p50', e.target.value)}
                        className="w-24 p-1.5 border border-[#1b1a19] bg-[#f4f1ea] font-mono text-xs"
                      />
                      <input
                        type="text"
                        value={row.p99}
                        onChange={(e) => handleBenchmarkChange(idx, 'p99', e.target.value)}
                        className="w-24 p-1.5 border border-[#1b1a19] bg-[#f4f1ea] font-mono text-xs"
                      />
                      <input
                        type="text"
                        value={row.memory}
                        onChange={(e) => handleBenchmarkChange(idx, 'memory', e.target.value)}
                        className="w-24 p-1.5 border border-[#1b1a19] bg-[#f4f1ea] font-mono text-xs"
                      />
                      <button type="button" onClick={() => removeBenchmarkRow(idx)} className="px-2 py-1 bg-red-700 text-white font-mono text-xs">
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flame Graph Trace */}
              <div className="p-4 border border-[#1b1a19] bg-white/50 space-y-2">
                <label className="block font-mono text-xs font-bold uppercase mb-1">Flame Graph Trace</label>
                <input
                  type="text"
                  value={formData.flameGraphHeader}
                  onChange={(e) => setFormData({ ...formData, flameGraphHeader: e.target.value })}
                  className="w-full p-2 border border-[#1b1a19] bg-[#141312] text-[#cb4035] font-mono text-xs font-bold"
                />
                <textarea
                  rows={4}
                  value={rawFlameLines}
                  onChange={(e) => setRawFlameLines(e.target.value)}
                  className="w-full p-2 border border-[#1b1a19] bg-[#141312] text-[#f4f1ea] font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-[#cb4035] text-white font-mono text-sm font-black uppercase tracking-widest border-2 border-[#1b1a19] hover:bg-[#1b1a19] transition"
                >
                  {isSubmitting ? 'TRANSMITTING TO FIRESTORE...' : editingId ? 'UPDATE DISSECTION →' : 'PUBLISH DISSECTION →'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'preview' && (
            <div className="p-8 border-2 border-[#1b1a19] bg-[#f4f1ea]">
              <div className="category-tag">{formData.category}</div>
              <h1 className="hero-title">{formData.title}</h1>
              <div className="article-meta">
                AUTHOR: <span>{formData.author}</span> // TOPIC: <span>{formData.topic}</span> // READ TIME: <span>{formData.readTime}</span>
              </div>
              <p className="lead">{formData.lead}</p>
              {formData.pullquote && <div className="pullquote">&ldquo;{formData.pullquote}&rdquo;</div>}
              {formData.benchmarks && <BenchmarkTable benchmarks={formData.benchmarks} />}
              {formData.flameGraphLines && <TerminalBox header={formData.flameGraphHeader} lines={formData.flameGraphLines} />}
              {formData.markdownContent && (
                <div className="mt-8 pt-6 border-t border-[#1b1a19]/20">
                  <MarkdownRenderer content={formData.markdownContent} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: PAPERS ARCHIVE */}
      {activeSection === 'papers' && (
        <div className="space-y-8">
          <div className="border-2 border-[#1b1a19] bg-white/70 p-6">
            <h2 className="font-mono text-sm font-bold uppercase text-[#cb4035] mb-4">
              {editingPaperId ? `Editing Paper: ${editingPaperId}` : 'Submit Peer-Reviewed Paper Specification'}
            </h2>

            <form onSubmit={handlePaperSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase mb-1">Paper Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aether-Net: Deterministic Consensus..."
                    value={paperForm.title}
                    onChange={(e) => setPaperForm({ ...paperForm, title: e.target.value })}
                    className="w-full p-2 border border-[#1b1a19] font-sans font-bold bg-[#f4f1ea]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase mb-1">DOI Identifier</label>
                  <input
                    type="text"
                    required
                    value={paperForm.doi}
                    onChange={(e) => setPaperForm({ ...paperForm, doi: e.target.value })}
                    className="w-full p-2 border border-[#1b1a19] font-mono text-xs bg-[#f4f1ea]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase mb-1">Authors</label>
                  <input
                    type="text"
                    required
                    value={paperForm.authors || ''}
                    onChange={(e) => setPaperForm({ ...paperForm, authors: e.target.value })}
                    className="w-full p-2 border border-[#1b1a19] font-mono text-xs bg-[#f4f1ea]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase mb-1">Year</label>
                    <input
                      type="number"
                      value={paperForm.year || 2026}
                      onChange={(e) => setPaperForm({ ...paperForm, year: Number(e.target.value) })}
                      className="w-full p-2 border border-[#1b1a19] font-mono text-xs bg-[#f4f1ea]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase mb-1">Pages</label>
                    <input
                      type="number"
                      value={paperForm.pages || 14}
                      onChange={(e) => setPaperForm({ ...paperForm, pages: Number(e.target.value) })}
                      className="w-full p-2 border border-[#1b1a19] font-mono text-xs bg-[#f4f1ea]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase mb-1">Category</label>
                    <input
                      type="text"
                      value={paperForm.category || 'DISTRIBUTED SYSTEMS'}
                      onChange={(e) => setPaperForm({ ...paperForm, category: e.target.value })}
                      className="w-full p-2 border border-[#1b1a19] font-mono text-xs bg-[#f4f1ea]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-1">Paper Abstract</label>
                <textarea
                  rows={3}
                  value={paperForm.abstract || ''}
                  onChange={(e) => setPaperForm({ ...paperForm, abstract: e.target.value })}
                  className="w-full p-2 border border-[#1b1a19] bg-[#f4f1ea] text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-mono text-xs font-bold uppercase">BibTeX Citation Entry</label>
                  <button type="button" onClick={autoGenerateBibtex} className="font-mono text-xs text-[#cb4035] hover:underline font-bold">
                    [⚡ Auto-Generate BibTeX]
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={paperForm.bibtex || ''}
                  onChange={(e) => setPaperForm({ ...paperForm, bibtex: e.target.value })}
                  className="w-full p-2 border border-[#1b1a19] bg-[#141312] text-[#70d68a] font-mono text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                {editingPaperId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPaperId(null);
                      setPaperForm(initialPaperState);
                    }}
                    className="font-mono text-xs text-[#6f6b64] hover:underline"
                  >
                    Cancel Edit
                  </button>
                ) : <div></div>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#cb4035] text-white font-mono text-xs font-bold uppercase hover:bg-[#1b1a19] transition"
                >
                  {isSubmitting ? 'SAVING...' : editingPaperId ? 'UPDATE PAPER RECORD →' : 'PUBLISH PAPER RECORD →'}
                </button>
              </div>
            </form>
          </div>

          {/* Papers Data Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center flex-wrap gap-2 font-mono text-xs">
              <span className="font-bold text-[#1b1a19] uppercase">
                Active Formal Papers in Firestore ({papersList.length})
              </span>
              <button
                type="button"
                onClick={handleSeedPapers}
                disabled={isSubmitting}
                className="px-3 py-1.5 border border-[#1b1a19] bg-white hover:bg-[#f4f1ea] font-mono text-xs font-bold uppercase"
              >
                ⚡ Seed 3 Sample Papers to Firestore
              </button>
            </div>

            <div className="border-2 border-[#1b1a19] bg-white overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm font-mono text-xs">
              <thead>
                <tr className="bg-[#1b1a19] text-[#f4f1ea] uppercase">
                  <th className="p-3">Title</th>
                  <th className="p-3">DOI</th>
                  <th className="p-3">Authors</th>
                  <th className="p-3">Year</th>
                  <th className="p-3">Pages</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b1a19]/20">
                {papersList.map((p) => (
                  <tr key={p.id} className="hover:bg-[#f4f1ea]/80">
                    <td className="p-3 font-bold font-sans text-sm">{p.title}</td>
                    <td className="p-3 text-[#cb4035]">{p.doi}</td>
                    <td className="p-3">{p.authors}</td>
                    <td className="p-3">{p.year}</td>
                    <td className="p-3">{p.pages}</td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <button onClick={() => handleEditPaper(p)} className="px-2.5 py-1 bg-[#1b1a19] text-white hover:bg-[#cb4035] font-bold">
                        EDIT
                      </button>
                      <button onClick={() => handleDeletePaper(p.id)} className="px-2.5 py-1 bg-red-700 text-white hover:bg-red-800 font-bold">
                        DEL
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
