'use client';

import { useState, useEffect, useCallback } from 'react';
import { Article, BenchmarkRow } from '@/lib/types';
import { useAuth } from '@/lib/firebase/authContext';
import { getArticles, saveArticle, deleteArticle } from '@/lib/firebase/articles';
import BenchmarkTable from '@/components/BenchmarkTable';
import TerminalBox from '@/components/TerminalBox';

const initialArticleState: Article = {
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
  isFeatured: false,
};

export default function AdminPage() {
  const { user, loading, isConfigured, signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser, error: authError, clearError } = useAuth();

  // Auth form states
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // CMS states
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'preview'>('list');
  const [formData, setFormData] = useState<Article>(initialArticleState);
  const [rawBody, setRawBody] = useState('');
  const [rawFlameLines, setRawFlameLines] = useState(
    initialArticleState.flameGraphLines?.join('\n') || ''
  );
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchArticleList = useCallback(async () => {
    setLoadingArticles(true);
    try {
      const list = await getArticles();
      setArticlesList(list);
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoadingArticles(false);
    }
  }, []);

  useEffect(() => {
    if (user || demoMode) {
      fetchArticleList();
    }
  }, [user, demoMode, fetchArticleList]);

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
      // Error handled by AuthContext
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
      // Error handled by AuthContext
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Form title change -> auto generate slug
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

  // Benchmarks editor
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

  // Start editing existing article
  const handleEditArticle = (art: Article) => {
    setEditingId(art.id || art.slug);
    setFormData(art);
    setRawBody(art.body ? art.body.join('\n\n') : '');
    setRawFlameLines(art.flameGraphLines ? art.flameGraphLines.join('\n') : '');
    setActiveTab('editor');
    setStatusMessage(null);
  };

  // New article reset
  const handleNewArticle = () => {
    setEditingId(null);
    setFormData(initialArticleState);
    setRawBody('');
    setRawFlameLines(initialArticleState.flameGraphLines?.join('\n') || '');
    setActiveTab('editor');
    setStatusMessage(null);
  };

  // Delete article
  const handleDeleteArticle = async (id?: string) => {
    if (!id) return;
    if (!confirm(`Are you sure you want to delete this editorial (${id})?`)) return;

    try {
      await deleteArticle(id);
      setStatusMessage({ type: 'success', text: `Article ${id} deleted successfully.` });
      fetchArticleList();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      setStatusMessage({ type: 'error', text: msg });
    }
  };

  // Save / Publish
  const handleFormSubmit = async (e: React.FormEvent) => {
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
      id: editingId || formData.id || formData.slug,
      body: bodyParagraphs.length > 0 ? bodyParagraphs : formData.body,
      flameGraphLines: flameLines,
    };

    try {
      if (!isConfigured) {
        setStatusMessage({
          type: 'info',
          text: 'Firebase environment variables not set. Form validated successfully in offline preview mode.',
        });
      } else {
        const id = await saveArticle(payload);
        setStatusMessage({
          type: 'success',
          text: `Editorial published successfully to Cloud Firestore (ID: ${id})`,
        });
        fetchArticleList();
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

  // Loading screen
  if (loading) {
    return (
      <div className="p-16 text-center font-mono">
        <div className="category-tag">SYSTEM AUTH</div>
        <p className="mt-4">VERIFYING SECURITY CREDENTIALS...</p>
      </div>
    );
  }

  // --- AUTH GATE: When not logged in and not in demo mode ---
  if (!user && !demoMode) {
    return (
      <div className="p-6 md:p-12 max-w-xl mx-auto w-full">
        <div className="p-8 border-2 border-[#1b1a19] bg-[#f4f1ea] shadow-[6px_6px_0px_rgba(27,26,25,1)]">
          <div className="category-tag">ACCESS CONTROL // EDITORIAL GATE</div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight my-3">
            Editorial Node Sign-In
          </h1>
          <p className="text-sm text-[#6f6b64] font-mono mb-6">
            Authentication required to modify publication articles, benchmarks, and telemetry records.
          </p>

          {authError && (
            <div className="p-3 mb-6 bg-red-100 border border-red-800 text-red-900 font-mono text-xs">
              &gt; AUTH_ERROR: {authError}
            </div>
          )}

          {isConfigured ? (
            <div className="space-y-6">
              {/* Google Sign In */}
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

              {/* Email/Password Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase mb-1">
                    Editorial Email
                  </label>
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
                  <label className="block font-mono text-xs font-bold uppercase mb-1">
                    Passcode / Password
                  </label>
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
                  {authSubmitting
                    ? 'AUTHENTICATING...'
                    : authMode === 'signin'
                    ? 'SIGN IN TO EDITORIAL SUITE →'
                    : 'REGISTER NEW CREDENTIALS →'}
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
                  {authMode === 'signin'
                    ? 'Need to register a new admin account? Switch to Register'
                    : 'Already have credentials? Switch to Sign In'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 border border-[#1b1a19] bg-amber-50 text-amber-900">
                <div className="font-bold mb-1">[!] FIREBASE CONFIGURATION NOT LOADED</div>
                <p>Add your project keys to <code>.env.local</code> to enable Cloud Firestore & Google Auth.</p>
              </div>
              <button
                type="button"
                onClick={() => setDemoMode(true)}
                className="w-full py-3 bg-[#1b1a19] text-white font-bold uppercase hover:bg-[#cb4035] transition"
              >
                ENTER OFFLINE PREVIEW / DEMO MODE →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- LOGGED-IN ADMIN CMS ---
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      {/* Top Admin User Bar */}
      <div className="p-3 mb-6 border-2 border-[#1b1a19] bg-[#1b1a19] text-[#f4f1ea] flex justify-between items-center flex-wrap gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-green-400 inline-block animate-pulse"></span>
          <span>OPERATOR: <strong>{user?.email || (demoMode ? 'OFFLINE_DEMO_OPERATOR' : 'ADMIN')}</strong></span>
          <span className="text-[#6f6b64]">|</span>
          <span>STATUS: <strong>AUTHORIZED</strong></span>
        </div>

        <div className="flex items-center gap-3">
          {demoMode && (
            <button
              onClick={() => setDemoMode(false)}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white uppercase text-xs"
            >
              Exit Demo Mode
            </button>
          )}
          {user && (
            <button
              onClick={signOutUser}
              className="px-3 py-1 bg-[#cb4035] hover:bg-red-700 text-white font-bold uppercase text-xs"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Main CMS Header */}
      <div className="border-b-2 border-[#1b1a19] pb-4 mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="category-tag">CONTROL NODE // EDITORIAL DISPATCH</div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Editorial CMS</h1>
        </div>

        <button
          type="button"
          onClick={handleNewArticle}
          className="px-4 py-2 bg-[#cb4035] text-white font-mono text-xs font-bold uppercase border border-[#1b1a19] hover:bg-[#1b1a19] transition"
        >
          + Create New Dissection
        </button>
      </div>

      {/* Navigation Tabs */}
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
          3. Live Publication Preview
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

      {/* TAB 1: ARTICLES LIST */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-mono text-sm font-bold uppercase text-[#1b1a19]">
              Published & Seeded Editorials
            </h2>
            <button
              onClick={fetchArticleList}
              disabled={loadingArticles}
              className="font-mono text-xs text-[#cb4035] hover:underline"
            >
              [Refresh List]
            </button>
          </div>

          {loadingArticles ? (
            <div className="p-8 text-center font-mono text-sm">LOADING ARTICLES FROM FIRESTORE...</div>
          ) : (
            <div className="border-2 border-[#1b1a19] bg-white overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#1b1a19] text-[#f4f1ea] font-mono text-xs uppercase">
                    <th className="p-3 border-r border-white/20">Title</th>
                    <th className="p-3 border-r border-white/20">Slug / Route</th>
                    <th className="p-3 border-r border-white/20">Category</th>
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
                      <td className="p-3">{art.category}</td>
                      <td className="p-3">{art.author}</td>
                      <td className="p-3">{art.publishedAt}</td>
                      <td className="p-3 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleEditArticle(art)}
                          className="px-2.5 py-1 bg-[#1b1a19] text-white hover:bg-[#cb4035] font-bold"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(art.id || art.slug)}
                          className="px-2.5 py-1 bg-red-700 text-white hover:bg-red-800 font-bold"
                        >
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

      {/* TAB 2: COMPOSE / EDIT FORM */}
      {activeTab === 'editor' && (
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-mono text-sm font-bold uppercase text-[#1b1a19]">
              {editingId ? `Editing: ${editingId}` : 'New Editorial Specification'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={handleNewArticle}
                className="font-mono text-xs text-[#cb4035] hover:underline"
              >
                [Cancel Edit / Switch to New Article]
              </button>
            )}
          </div>

          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-[#1b1a19] bg-white/50">
            <div>
              <label className="block font-mono text-xs font-bold uppercase mb-1">
                Editorial Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Evaluating Cache Locality vs Big O Complexity"
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
                placeholder="e.g. cache-locality-vs-big-o"
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
              placeholder="We audited a standard e-commerce transaction pipeline...&#10;&#10;In next week's issue, we break down the assembly generated..."
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
              {isSubmitting
                ? 'TRANSMITTING TO FIRESTORE...'
                : editingId
                ? 'UPDATE EDITORIAL SPECIFICATION →'
                : 'PUBLISH EDITORIAL DISSECTION →'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: LIVE PREVIEW */}
      {activeTab === 'preview' && (
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
