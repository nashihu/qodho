"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, ArrowLeft, Save, Info, RotateCcw, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function KalkulatorPage() {
  const router = useRouter();
  const [years, setYears] = useState(1);
  const [months, setMonths] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load current values from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('qodho_lifetime_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.years === 'number') setYears(parsed.years);
        if (typeof parsed.months === 'number') setMonths(parsed.months);
      }
    } catch (e) {
      console.error('Failed to load lifetime data', e);
    }
  }, []);

  const totalDays = Math.max(0, Math.floor((years || 0) * 365 + (months || 0) * 30.41));
  const totalPerPrayer = totalDays;
  const initialTotalPrayers = totalDays * 5;

  const handleSaveAndReturn = (e) => {
    e.preventDefault();
    try {
      const existing = localStorage.getItem('qodho_lifetime_data');
      let completed = { subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 };
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.completed) completed = parsed.completed;
      }

      const newData = { years: Number(years), months: Number(months), completed };
      localStorage.setItem('qodho_lifetime_data', JSON.stringify(newData));

      // Dispatch custom event to notify listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('qodho_updated'));
        window.dispatchEvent(new Event('storage'));
      }

      setSavedSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 400);
    } catch (err) {
      console.error('Failed to save calculator settings', err);
    }
  };

  const handleReset = () => {
    if (confirm('Reset input durasi menjadi 1 tahun?')) {
      setYears(1);
      setMonths(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activeTab="" setActiveTab={() => router.push('/')} />

      <div className="max-w-3xl mx-auto px-4 py-8 w-full flex-1 space-y-6">
        {/* Header navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold text-slate-700 hover:text-emerald-800 bg-white border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Batal & Kembali ke Home</span>
          </Link>
        </div>

        {/* Page Banner */}
        <div className="bg-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-emerald-800">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="bg-emerald-800 p-3 rounded-2xl border border-emerald-700 shadow-inner">
              <Calculator className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-wide">Kalkulator Durasi Qodho</h1>
              <p className="text-xs text-emerald-300">Hitung estimasi total hutang sholat fardhu berdasarkan tahun & bulan</p>
            </div>
          </div>
        </div>

        {/* Calculator Form */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-emerald-100 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Hitung Durasi Tidak Sholat</h2>
              <p className="text-xs text-slate-500">Masukkan estimasi lama waktu sholat fardhu yang pernah ditinggalkan</p>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <form onSubmit={handleSaveAndReturn} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jumlah Tahun (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={years}
                  onChange={(e) => setYears(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900 font-bold text-base shadow-sm"
                  placeholder="Contoh: 1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tambahan Bulan (Months)
                </label>
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={months}
                  onChange={(e) => setMonths(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900 font-bold text-base shadow-sm"
                  placeholder="Contoh: 0"
                />
              </div>
            </div>

            {/* Calculation Result Preview Box */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/90 space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-900">
                <Info className="w-5 h-5 text-emerald-700 shrink-0" />
                <span className="text-sm font-bold">Hasil Perhitungan Estimasi:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">Total Hari</div>
                  <div className="text-xl font-extrabold text-emerald-900">{totalDays.toLocaleString('id-ID')} <span className="text-xs font-normal">hari</span></div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">Per Waktu Sholat</div>
                  <div className="text-xl font-extrabold text-emerald-900">{totalPerPrayer.toLocaleString('id-ID')} <span className="text-xs font-normal">kali</span></div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">Total 5 Sholat Fardhu</div>
                  <div className="text-xl font-extrabold text-emerald-950">{initialTotalPrayers.toLocaleString('id-ID')} <span className="text-xs font-normal">kali</span></div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className={`w-full font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-base active:scale-[0.99] ${
                  savedSuccess
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    <span>Tersimpan! Mengalihkan ke Home...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Simpan & Kembali ke Home</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
