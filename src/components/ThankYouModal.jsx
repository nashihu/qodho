"use client";

import React from 'react';
import { CheckCircle2, Sparkles, HeartHandshake, X, ShieldCheck } from 'lucide-react';

export default function ThankYouModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-emerald-100 relative overflow-hidden text-center">
        {/* Decorative Top Accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-100 rounded-full blur-2xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-100 rounded-full blur-2xl opacity-60 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow-inner border border-emerald-200 animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Lisensi Aktif</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Terima Kasih!
        </h3>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Terima kasih telah mendaftarkan lisensi Anda. Akun Anda telah berhasil diaktivasi secara penuh. Selamat menggunakan <span className="font-semibold text-emerald-800">Qodho Tracker</span>!
        </p>

        {/* Feature badge summary */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 mb-6 text-left flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-slate-800">Akses Penuh Terbuka</div>
            <div className="text-slate-500 text-[11px]">Seluruh fitur pencatatan dan estimasi qodho kini dapat Anda gunakan.</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl shadow-md border border-emerald-700 transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Mulai Gunakan Aplikasi</span>
        </button>
      </div>
    </div>
  );
}
