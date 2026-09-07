"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, ArrowLeft, Save, Info, RotateCcw, CheckCircle2, Calendar as CalendarIcon, Clock, Sparkles, CheckSquare, Square, Plus, Trash2, Layers } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { computePeriodsRequirement } from '../../utils/qodhoCalculator';

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

  // Helper to get date N months ago from today
  const getPastDateByMonths = (monthsAgo) => {
    const d = new Date();
    d.setMonth(d.getMonth() - monthsAgo);
    return formatDateToInput(d);
  };

  const todayStr = formatDateToInput(new Date());

  const [periods, setPeriods] = useState([]);
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
        if (parsed.periods && Array.isArray(parsed.periods) && parsed.periods.length > 0) {
          setPeriods(parsed.periods);
        } else if (parsed.startDate && parsed.endDate) {
          // Convert legacy single range to initial period item
          const legacyPeriod = {
            id: 'legacy-1',
            startDate: parsed.startDate,
            endDate: parsed.endDate,
            selectedPrayers: parsed.selectedPrayers || { subuh: true, dzuhur: true, ashar: true, maghrib: true, isya: true }
          };
          setPeriods([legacyPeriod]);
        }
      }
    } catch (e) {
      console.error('Failed to load lifetime data', e);
    }
  }, []);

  // Compute active preview by merging existing periods + currently edited period form
  const currentFormPeriod = {
    id: 'current-form',
    startDate,
    endDate,
    selectedPrayers
  };

  // Combined preview including current form entry if valid
  const formDays = (() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    if (isNaN(diff) || diff < 0) return 0;
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24))) + 1;
  })();

  const allPeriodsPreview = formDays > 0 ? [...periods, currentFormPeriod] : periods;
  const mergedRequirement = computePeriodsRequirement(allPeriodsPreview);

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
  const handleApplyPreset = (preset) => {
    if (preset.months) {
      setStartDate(getPastDateByMonths(preset.months));
    } else if (preset.years) {
      setStartDate(getPastDate(preset.years));
    }
    setEndDate(todayStr);
  };

  const handleAddCurrentPeriodOnly = () => {
    if (formDays <= 0) return;
    const newPeriod = {
      id: Date.now().toString(),
      startDate,
      endDate,
      selectedPrayers
    };
    setPeriods(prev => [...prev, newPeriod]);
  };

  const handleDeletePeriod = (id) => {
    setPeriods(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveAndReturn = (e) => {
    e.preventDefault();
    try {
      let finalPeriods = [...periods];

      // If user filled in the form, append it to periods
      if (formDays > 0) {
        const newPeriod = {
          id: Date.now().toString(),
          startDate,
          endDate,
          selectedPrayers
        };
        finalPeriods.push(newPeriod);
      }

      if (finalPeriods.length === 0) {
        alert('Silakan tentukan minimal 1 periode sholat terlewat.');
        return;
      }

      const existing = localStorage.getItem('qodho_lifetime_data');
      let completed = { subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 };
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.completed) completed = parsed.completed; // PRESERVE COUNTER!
      }

      const merged = computePeriodsRequirement(finalPeriods);

      const newData = {
        periods: finalPeriods,
        startDate: merged.minStartDate,
        endDate: merged.maxEndDate,
        totalDays: merged.totalDays,
        selectedPrayers: {
          subuh: merged.totalPrayers.subuh > 0,
          dzuhur: merged.totalPrayers.dzuhur > 0,
          ashar: merged.totalPrayers.ashar > 0,
          maghrib: merged.totalPrayers.maghrib > 0,
          isya: merged.totalPrayers.isya > 0,
        },
        completed // PRESERVED EXACTLY!
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

  const handleResetAll = () => {
    if (confirm('Reset semua periode yang telah dikonfigurasi? (Progress sholat yang telah di-qodho tidak akan terhapus)')) {
      setPeriods([]);
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
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
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
              <h1 className="text-2xl font-extrabold tracking-wide">Kalkulator Durasi Qodho Multi-Periode</h1>
              <p className="text-xs text-emerald-300">Tambah beberapa periode waktu tidak sholat (misal: Agustus Subuh saja, September Isya saja). Overlap akan digabung otomatis.</p>
            </div>
          </div>
        </div>

        {/* Saved Periods List */}
        {periods.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Daftar Periode Yang Telah Ditambahkan ({periods.length})</span>
              </h3>
              <button
                onClick={handleResetAll}
                className="text-xs text-rose-600 hover:text-rose-800 px-2 py-1 rounded transition-colors font-semibold"
              >
                Reset Semua
              </button>
            </div>

            <div className="space-y-3">
              {periods.map((p, idx) => {
                const activeNames = PRAYER_OPTIONS.filter(opt => p.selectedPrayers?.[opt.id]).map(opt => opt.label);
                return (
                  <div
                    key={p.id || idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>Periode {idx + 1}: {formatReadableDate(p.startDate)} &mdash; {formatReadableDate(p.endDate)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {activeNames.map(name => (
                          <span key={name} className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePeriod(p.id)}
                      className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                      title="Hapus Periode Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Calculator Form to Add New Period */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-emerald-100 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>Form Tambah Periode Sholat Terlewat Baru</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Tentukan rentang tanggal dan sholat fardhu yang terlewat untuk periode ini</p>
            </div>
          </div>

          <form onSubmit={handleSaveAndReturn} className="space-y-6">
            {/* Quick Preset Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Preset Cepat Durasi:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '1 Bulan Terakhir', months: 1 },
                  { label: '3 Bulan Terakhir', months: 3 },
                  { label: '1 Tahun Terakhir', years: 1 },
                  { label: '2 Tahun Terakhir', years: 2 },
                  { label: '3 Tahun Terakhir', years: 3 },
                  { label: '5 Tahun Terakhir', years: 5 },
                  { label: '10 Tahun Terakhir', years: 10 },
                ].map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
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
                  <span>Tanggal Mulai (Start Date)</span>
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
                  <span>Tanggal Akhir (End Date)</span>
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
                  <span>Sholat Yang Ditinggalkan Pada Periode Ini:</span>
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
            </div>

            {/* Combined Calculation Preview Box */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
                <div className="flex items-center gap-2 text-emerald-950">
                  <Info className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span className="text-sm font-bold">Hasil Penggabungan Overlap (Total Akumulasi):</span>
                </div>
                <div className="text-xs font-semibold text-emerald-900 bg-white px-3 py-1 rounded-full border border-emerald-200">
                  {mergedRequirement.totalDays.toLocaleString('id-ID')} Hari Unik (Overlap Digabung)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">Total Hari Unik</div>
                  <div className="text-xl font-extrabold text-emerald-900">{mergedRequirement.totalDays.toLocaleString('id-ID')} <span className="text-xs font-normal">hari</span></div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {formatReadableDate(mergedRequirement.minStartDate)} &mdash; {formatReadableDate(mergedRequirement.maxEndDate)}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">Rincian Per Sholat</div>
                  <div className="text-xs font-bold text-slate-700 space-y-0.5 mt-1">
                    <div>Subuh: {mergedRequirement.totalPrayers.subuh} kali</div>
                    <div>Dzuhur: {mergedRequirement.totalPrayers.dzuhur} kali</div>
                    <div>Ashar: {mergedRequirement.totalPrayers.ashar} kali</div>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium">Total Akumulasi Utang Qodho</div>
                  <div className="text-xl font-extrabold text-emerald-950">{mergedRequirement.overallTotalPrayers.toLocaleString('id-ID')} <span className="text-xs font-normal">kali</span></div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">Maghrib: {mergedRequirement.totalPrayers.maghrib}x | Isya: {mergedRequirement.totalPrayers.isya}x</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddCurrentPeriodOnly}
                disabled={formDays <= 0}
                className="flex-1 font-bold py-3 px-5 rounded-2xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Periode Lagi</span>
              </button>

              <button
                type="submit"
                disabled={allPeriodsPreview.length === 0}
                className={`flex-1 font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-base active:scale-[0.99] disabled:opacity-50 ${
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
                    <span>Tambah & Kembali ke Home</span>
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
