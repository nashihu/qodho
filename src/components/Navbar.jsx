"use client";

import React from 'react';
import { Calendar, BookOpen, PlusCircle, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'lifetime', label: 'Ringkasan Lifetime', icon: Calculator },
    { id: 'manual', label: 'Tambah Qodho Udzur', icon: PlusCircle },
    { id: 'articles', label: 'Artikel & Panduan', icon: BookOpen },
  ];

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

        <nav className="flex items-center gap-1.5 bg-emerald-950/60 p-1.5 rounded-xl border border-emerald-800/80 w-full md:w-auto overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
            href="/kalkulator"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-bold bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-700 transition-colors whitespace-nowrap ml-1"
          >
            <Calculator className="w-4 h-4 text-emerald-300" />
            <span>Kalkulator</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
