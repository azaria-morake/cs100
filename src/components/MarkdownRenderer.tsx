'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
}

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const textToCopy = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="terminal-box my-6 relative group">
      <div className="flex justify-between items-center text-xs font-mono border-b border-white/20 pb-2 mb-3 text-[#cb4035] font-bold">
        <span>&gt; SOURCE_SPEC {language ? `[${language.toUpperCase()}]` : ''}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-[#f4f1ea] hover:text-[#cb4035] px-2 py-0.5 border border-white/30 text-[10px] uppercase font-bold"
        >
          {copied ? '✓ COPIED' : 'COPY CODE'}
        </button>
      </div>
      <pre className="font-mono text-xs overflow-x-auto text-[#f4f1ea] leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className="prose-custom space-y-4 text-[#1b1a19]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-8 mb-4 border-b border-[#1b1a19] pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-6 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-black uppercase tracking-tight mt-5 mb-2 text-[#cb4035]">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="article-body-p text-base leading-relaxed mb-4">{children}</p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="pullquote my-6">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="benchmark-table">{children}</table>
            </div>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-2 font-sans mb-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-2 font-mono text-sm mb-4">{children}</ol>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className && typeof children === 'string';
            if (isInline) {
              return (
                <code
                  className="bg-[#1b1a19] text-[#f4f1ea] px-1.5 py-0.5 font-mono text-xs font-bold rounded-none"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return <CodeBlock className={className}>{children}</CodeBlock>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
