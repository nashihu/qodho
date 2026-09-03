import React from 'react';
import { ARTICLES } from '../../data/articles';
import Link from 'next/link';
import { BookOpen, Calendar, Clock, User, ArrowRight, Home } from 'lucide-react';

export const metadata = {
  title: 'Artikel & Panduan Sholat Fardhu dan Qodho | Qodho Tracker',
  description: 'Kumpulan artikel panduan sholat fardhu, tata cara sholat tasbih, dan hukum mengqodho sholat yang terlewat.',
  openGraph: {
    title: 'Artikel & Panduan Sholat Fardhu dan Qodho',
    description: 'Panduan lengkap tata cara bacaan sholat, sholat tasbih, dan hukum qodho sholat.',
  }
};

export default function ArtikelListPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke App Qodho</span>
          </Link>
        </div>

        <div className="bg-emerald-950 text-white rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl md:text-3xl font-extrabold">Artikel & Panduan Islami</h1>
          </div>
          <p className="text-sm text-emerald-300">
            Halaman publik SEO-friendly dengan HTML ter-render sempurna untuk mesin pencari dan media sosial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ARTICLES.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-56 w-full bg-slate-100">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 left-4 bg-emerald-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {article.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readTime}</span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 hover:text-emerald-700 transition-colors">
                    <Link href={`/artikel/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-50 mt-4">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" /> {article.author}
                </span>

                <Link
                  href={`/artikel/${article.slug}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow"
                >
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
