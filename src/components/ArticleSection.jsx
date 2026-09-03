"use client";

import React, { useState } from 'react';
import { ARTICLES } from '../data/articles';
import { BookOpen, Clock, Calendar, User, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

export default function ArticleSection() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-emerald-950 text-white rounded-2xl p-6 shadow-md border border-emerald-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-800 p-3 rounded-xl border border-emerald-700">
            <BookOpen className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wide">Artikel & Panduan Sholat</h2>
            <p className="text-xs text-emerald-300">Pengetahuan mendalam mengenai bacaan sholat, sholat tasbih, dan fiqih qodho sholat</p>
          </div>
        </div>
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ARTICLES.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col group"
          >
            {/* Image Container */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
              {/* Using standard img tag with exact requested URLs */}
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-emerald-900/80 backdrop-blur-sm text-emerald-100 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-700">
                {article.category}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {article.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readTime}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <User className="w-3.5 h-3.5 text-emerald-600" /> {article.author}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/artikel/${article.slug}`}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline"
                  >
                    SEO Link
                  </Link>
                  <button
                    onClick={() => setSelectedArticle(article)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Baca</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 relative my-auto animate-in fade-in zoom-in duration-200">
            {/* Header Image */}
            <div className="relative h-64 w-full bg-slate-100">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 bg-slate-900/70 text-white p-2 rounded-full hover:bg-slate-900 transition-colors shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 bg-emerald-900/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                {selectedArticle.category}
              </div>
            </div>

            {/* Article Body */}
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-4 text-xs text-slate-500 border-b border-slate-100 pb-3">
                <span className="flex items-center gap-1"><User className="w-4 h-4 text-emerald-600" /> {selectedArticle.author}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {selectedArticle.date}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedArticle.readTime}</span>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                {selectedArticle.title}
              </h2>

              <div
                className="prose prose-emerald max-w-none text-sm text-slate-700 space-y-3 pt-2"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />

              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <Link
                  href={`/artikel/${selectedArticle.slug}`}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  Buka Halaman Artikel Terpisah (Full SEO Route) →
                </Link>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
                >
                  Tutup Artikel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
