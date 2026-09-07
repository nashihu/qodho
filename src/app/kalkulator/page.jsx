"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, ArrowLeft, Save, Info, RotateCcw, CheckCircle2, Calendar as CalendarIcon, Clock, Sparkles, CheckSquare, Square } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

const PRAYER_OPTIONS = [
  { id: 'subuh', label: 'Subuh', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'dzuhur', label: 'Dzuhur', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'ashar', label: 'Ashar', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'maghrib', label: 'Maghrib', color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { id: 'isya', label: 'Isya', color: 'text-purple-600 bg-purple-50 border-purple-200' },
];

export default function KalkulatorPage() {
  const router = useRouter();

  // Helper to format date object to YYYY-MM-DD
  const formatDateToInput = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to get date N years ago from today
  const getPastDate = (yearsAgo) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - yearsAgo);
    return formatDateToInput(d);
  };

  const todayStr = formatDateToInput(new Date());

  const [startDate, setStartDate] = useState(getPastDate(1));
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedPrayers, setSelectedPrayers] = useState({
    subuh: true,
    dzuhur: true,
    ashar: true,
    maghrib: true,
    isya: true,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load current saved values from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('qodho_lifetime_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.startDate) setStartDate(parsed.startDate);
        if (parsed.endDate) setEndDate(parsed.endDate);
        else if (typeof parsed.years === 'number') {
          setStartDate(getPastDate(parsed.years || 1));
          setEndDate(todayStr);
        }
        if (parsed.selectedPrayers) {
          setSelectedPrayers(parsed.selectedPrayers);
        }
      }
    } catch (e) {
      console.error('Failed to load lifetime data', e);
    }
  }, []);

  // Calculate day difference between startDate and endDate
  const calculateDays = (startStr, endStr) => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end.getTime() - start.getTime();
    if (isNaN(diffMs) || diffMs < 0) return 0;
    return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  };

  const totalDays = calculateDays(startDate, endDate);
  const selectedPrayerCount = Object.values(selectedPrayers).filter(Boolean).length;
  const initialTotalPrayers = totalDays * selectedPrayerCount;

  // Approximate years and months for human readable display
  const equivYears = Math.floor(totalDays / 365);
  const equivMonths = Math.floor((totalDays % 365) / 30.41);

  // Toggle single prayer checkbox
  const togglePrayer = (id) => {
    setSelectedPrayers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Toggle all prayers ON or OFF
  const toggleAllPrayers = (selectAll) => {
    setSelectedPrayers({
      subuh: selectAll,
      dzuhur: selectAll,
      ashar: selectAll,
      maghrib: selectAll,
      isya: selectAll
    });
  };

  // Apply quick date range presets
  const handleApplyPreset = (yearsAgo) => {
    setStartDate(getPastDate(yearsAgo));
    setEndDate(todayStr);
  };

  const handleSaveAndReturn = (e) => {
    e.preventDefault();
    try {
      const existing = localStorage.getItem('qodho_lifetime_data');
      let completed = { subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 };
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.completed) completed = parsed.completed;
      }

      const newData = {
        startDate,
        endDate,
        totalDays,
        years: equivYears,
        months: equivMonths,
        selectedPrayers,
        completed
      };

      localStorage.setItem('qodho_lifetime_data', JSON.stringify(newData));

      // Dispatch custom event to notify home dashboard & calendar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('qodho_updated'));
        window.dispatchEvent(new Event('storage'));
      }

      setSavedSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 450);
    } catch (err) {
      console.error('Failed to save calculator settings', err);
    }
  };

  const handleReset = () => {
    if (confirm('Reset input durasi dan pilihan sholat ke default?')) {
      setStartDate(getPastDate(1));
      setEndDate(todayStr);
      setSelectedPrayers({
        subuh: true,
        dzuhur: true,
        ashar: true,
        maghrib: true,
        isya: true
      });
    }
  };

  // Format date for readable display (e.g. 5 September 2025)
  const formatReadableDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
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
              <p className="text-xs text-emerald-300">Pilih rentang tanggal & waktu sholat fardhu spesifik yang terlewat (*Subuh, Dzuhur, Ashar, Maghrib, Isya*)</p>
            </div>
          </div>
        </div>

        {/* Calculator Form */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-emerald-100 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-600" />
                <span>Rentang Tanggal & Pilihan Waktu Sholat</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Atur tanggal dan pilih hanya sholat yang benar-benar ditinggalkan</p>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors flex items-center gap-1 font-medium shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <form onSubmit={handleSaveAndReturn} className="space-y-6">
            {/* Quick Preset Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Preset Cepat Durasi:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '1 Tahun Terakhir', years: 1 },
                  { label: '2 Tahun Terakhir', years: 2 },
                  { label: '3 Tahun Terakhir', years: 3 },
                  { label: '5 Tahun Terakhir', years: 5 },
                  { label: '10 Tahun Terakhir', years: 10 },
                ].map((preset) => (
                  <button
                    key={preset.years}
                    type="button"
                    onClick={() => handleApplyPreset(preset.years)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-emerald-600" />
                  <span>Tanggal Mulai Tidak Sholat (Start Date)</span>
                </label>
                <input
                  type="date"
                  max={endDate || todayStr}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900 font-semibold text-sm shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-emerald-600" />
                  <span>Tanggal Akhir / Hari Ini (End Date)</span>
                </label>
                <input
                  type="date"
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900 font-semibold text-sm shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Prayer Selection Checkboxes Section */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Pilih Waktu Sholat Yang Ditinggalkan:</span>
                </label>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleAllPrayers(true)}
                    className="text-emerald-700 hover:underline"
                  >
                    Pilih Semua
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => toggleAllPrayers(false)}
                    className="text-slate-500 hover:underline"
                  >
                    Hapus Semua
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {PRAYER_OPTIONS.map((p) => {
                  const isChecked = !!selectedPrayers[p.id];
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePrayer(p.id)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isChecked
                          ? `${p.color} border-2 shadow-sm font-bold scale-[1.02]`
                          : 'bg-slate-50 border-slate-200 text-slate-400 font-medium hover:border-slate-300'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs">{p.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400">
                *Hanya waktu sholat yang dicentang yang akan dihitung dan ditagihkan sebagai utang qodho.
              </p>
            </div>

            {/* Calculation Result Preview Box */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
                <div className="flex items-center gap-2 text-emerald-950">
                  <Info className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span className="text-sm font-bold">Hasil Perhitungan Estimasi:</span>
                </div>
                <div className="text-xs font-semibold text-emerald-900 bg-white px-3 py-1 rounded-full border border-emerald-200">
                  {formatReadableDate(startDate)} &mdash; {formatReadableDate(endDate)} ({selectedPrayerCount}/5 Waktu Sholat)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">Total Hari (Durasi)</div>
                  <div className="text-xl font-extrabold text-emerald-900">{totalDays.toLocaleString('id-ID')} <span className="text-xs font-normal">hari</span></div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                    (~{equivYears} thn {equivMonths > 0 ? `${equivMonths} bln` : ''})
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">Per Waktu Sholat Terpilih</div>
                  <div className="text-xl font-extrabold text-emerald-900">{totalDays.toLocaleString('id-ID')} <span className="text-xs font-normal">kali</span></div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {PRAYER_OPTIONS.filter(p => selectedPrayers[p.id]).map(p => p.label).join(', ') || 'Belum ada sholat dipilih'}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">Total Utang Qodho</div>
                  <div className="text-xl font-extrabold text-emerald-950">{initialTotalPrayers.toLocaleString('id-ID')} <span className="text-xs font-normal">kali</span></div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">{totalDays} hari &times; {selectedPrayerCount} waktu sholat</div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={totalDays <= 0 || selectedPrayerCount === 0}
                className={`w-full font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-base active:scale-[0.99] disabled:opacity-50 ${
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
