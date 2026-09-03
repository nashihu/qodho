import React from 'react';
import { ARTICLES } from '../../../data/articles';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User, Share2, BookOpen } from 'lucide-react';

export async function generateStaticParams() {
  return ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }) {
  const article = ARTICLES.find((a) => a.slug === params.slug);
  if (!article) return {};

  return {
    title: `${article.title} | Qodho Tracker`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.image }],
    },
  };
}

export default function ArticleDetailPage({ params }) {
  const article = ARTICLES.find((a) => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  // Schema.org JSON-LD for Search Engine Optimization
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    image: [article.image],
    datePublished: '2026-09-03T00:00:00+07:00',
    author: [{ '@type': 'Person', name: article.author }],
    description: article.excerpt,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/artikel"
            className="text-xs font-bold text-slate-700 hover:text-emerald-800 bg-white border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Artikel</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Ke Aplikasi Qodho</span>
          </Link>
        </div>

        <article className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100">
          <div className="relative h-72 md:h-96 w-full bg-slate-100">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-6 left-6 bg-emerald-900/90 text-white text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-sm">
              {article.category}
            </span>
          </div>

          <div className="p-6 md:p-10 space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-b border-slate-100 pb-4">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <User className="w-4 h-4 text-emerald-600" /> {article.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {article.date}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {article.readTime}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {article.title}
            </h1>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 leading-relaxed font-medium">
              <strong className="block mb-1 text-emerald-950">Ringkasan Artikel:</strong>
              {article.excerpt}
            </div>

            <div
              className="prose prose-emerald max-w-none text-slate-800 text-sm leading-relaxed space-y-4 pt-2"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
