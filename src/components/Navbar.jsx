"use client";

import React from 'react';
import { Calendar, BookOpen, PlusCircle, Calculator, CalendarDays, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Navbar({ activeTab, setActiveTab }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const tabs = [
    { id: 'lifetime', label: 'Ringkasan Lifetime', icon: Calculator },
    { id: 'manual', label: 'Tambah Qodho Udzur', icon: PlusCircle },
    { id: 'articles', label: 'Artikel & Panduan', icon: BookOpen },
  ];

  const handleTabClick = (tabId) => {
    if (pathname === '/') {
      if (typeof setActiveTab === 'function') {
        setActiveTab(tabId);
      }
    } else {
      router.push(`/?tab=${tabId}`);
    }
  };

  return (
    <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-emerald-700 p-2.5 rounded-xl shadow-inner border border-emerald-600 group-hover:bg-emerald-600 transition-colors">
            <Calendar className="w-6 h-6 text-emerald-100" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide flex items-center gap-2">
              Qodho Tracker <span className="text-xs bg-emerald-700 text-emerald-200 px-2 py-0.5 rounded-full font-medium border border-emerald-600">Prototype</span>
            </h1>
            <p className="text-xs text-emerald-300">Catat dan lunasi utang sholat fardhu secara sistematis</p>
          </div>
        </Link>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <nav className="flex items-center gap-1.5 bg-emerald-950/60 p-1.5 rounded-xl border border-emerald-800/80 w-full md:w-auto overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === '/' && activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-emerald-300 hover:text-white hover:bg-emerald-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <Link
              href="/kalender"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-bold border transition-colors whitespace-nowrap ml-1 ${
                pathname === '/kalender'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border-emerald-700'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-emerald-300" />
              <span>Kalender</span>
            </Link>

            <Link
              href="/kalkulator"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-bold border transition-colors whitespace-nowrap ${
                pathname === '/kalkulator'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border-emerald-700'
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-300" />
              <span>Kalkulator</span>
            </Link>
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center">
            {status === 'loading' ? (
              <div className="h-9 w-28 bg-emerald-800/60 animate-pulse rounded-lg border border-emerald-700"></div>
            ) : session ? (
              <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-700 rounded-xl px-2.5 py-1.5 shadow-sm">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-7 h-7 rounded-full border border-emerald-500 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white border border-emerald-500">
                    <User className="w-4 h-4 text-emerald-200" />
                  </div>
                )}
                <span className="text-xs font-medium text-emerald-100 max-w-[100px] truncate hidden sm:inline">
                  {session.user?.name || 'User'}
                </span>
                <button
                  onClick={() => signOut()}
                  title="Keluar / Sign Out"
                  className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-300 hover:text-rose-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="flex items-center gap-2 bg-white text-slate-700 hover:bg-slate-100 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-md border border-slate-200 hover:shadow-lg active:scale-95"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                <span>Masuk dengan Google</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
