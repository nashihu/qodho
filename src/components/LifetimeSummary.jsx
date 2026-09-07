"use client";

import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle2, RotateCcw, Plus, Minus, Edit3, Flame, Sparkles, Calendar, Info, Ban, Layers } from 'lucide-react';
import Link from 'next/link';
import { computePeriodsRequirement } from '../utils/qodhoCalculator';

const PRAYERS = [
  { id: 'subuh', name: 'Subuh', color: 'from-blue-600 to-indigo-700', badge: 'bg-blue-100 text-blue-800' },
  { id: 'dzuhur', name: 'Dzuhur', color: 'from-amber-500 to-orange-600', badge: 'bg-amber-100 text-amber-800' },
  { id: 'ashar', name: 'Ashar', color: 'from-emerald-600 to-teal-700', badge: 'bg-emerald-100 text-emerald-800' },
  { id: 'maghrib', name: 'Maghrib', color: 'from-rose-600 to-red-700', badge: 'bg-rose-100 text-rose-800' },
  { id: 'isya', name: 'Isya', color: 'from-purple-600 to-indigo-900', badge: 'bg-purple-100 text-purple-800' },
];

export default function LifetimeSummary() {
  const [periods, setPeriods] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customTotalDays, setCustomTotalDays] = useState(null);
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(0);
  const [selectedPrayers, setSelectedPrayers] = useState({
    subuh: true,
    dzuhur: true,
    ashar: true,
    maghrib: true,
    isya: true,
  });
  const [completed, setCompleted] = useState({
    subuh: 0,
    dzuhur: 0,
    ashar: 0,
    maghrib: 0,
    isya: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('qodho_lifetime_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.periods && Array.isArray(parsed.periods)) setPeriods(parsed.periods);
        if (parsed.startDate) setStartDate(parsed.startDate);
        if (parsed.endDate) setEndDate(parsed.endDate);
        if (typeof parsed.totalDays === 'number') setCustomTotalDays(parsed.totalDays);
        if (typeof parsed.years === 'number') setYears(parsed.years);
        if (typeof parsed.months === 'number') setMonths(parsed.months);
        if (parsed.selectedPrayers) setSelectedPrayers(parsed.selectedPrayers);
        if (parsed.completed) setCompleted(parsed.completed);
      }
    } catch (e) {
      console.error('Failed to load lifetime data', e);
    } finally {
      setIsLoaded(true);
    }
  };

  // Load from localStorage on mount & when storage event fires
  useEffect(() => {
    loadFromLocalStorage();

    const handleStorageUpdate = () => {
      loadFromLocalStorage();
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('qodho_updated', handleStorageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('qodho_updated', handleStorageUpdate);
    };
  }, []);

  // Save to localStorage ONLY AFTER initial load (preserve completed!)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const saved = localStorage.getItem('qodho_lifetime_data');
      let existingPeriods = periods;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.periods) existingPeriods = parsed.periods;
      }

      const payload = {
        periods: existingPeriods,
        startDate,
        endDate,
        totalDays: customTotalDays,
        years,
        months,
        selectedPrayers,
        completed
      };
      localStorage.setItem('qodho_lifetime_data', JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save lifetime data', e);
    }
  }, [periods, startDate, endDate, customTotalDays, years, months, selectedPrayers, completed, isLoaded]);

  // Calculate targets based on periods or legacy state
  const hasPeriods = periods && periods.length > 0;
  const merged = hasPeriods ? computePeriodsRequirement(periods) : null;

  const displayStartDate = hasPeriods ? merged.minStartDate : startDate;
  const displayEndDate = hasPeriods ? merged.maxEndDate : endDate;
  const totalDays = hasPeriods ? merged.totalDays : (customTotalDays !== null && customTotalDays !== undefined ? customTotalDays : Math.max(0, Math.floor((years || 0) * 365 + (months || 0) * 30.41)));

  const getInitialForPrayer = (prayerId) => {
    if (hasPeriods && merged) {
      return merged.totalPrayers[prayerId] || 0;
    }
    return (selectedPrayers && selectedPrayers[prayerId] === false) ? 0 : totalDays;
  };

  const initialTotalPrayers = hasPeriods && merged 
    ? merged.overallTotalPrayers 
    : PRAYERS.reduce((acc, p) => acc + getInitialForPrayer(p.id), 0);

  const totalCompleted = Object.values(completed).reduce((a, b) => a + b, 0);
  const totalRemaining = Math.max(0, initialTotalPrayers - totalCompleted);
  const progressPercent = initialTotalPrayers > 0 
    ? Math.min(100, Math.round((totalCompleted / initialTotalPrayers) * 100))
    : 0;

  const handleIncrement = (prayerId, amount = 1) => {
    setCompleted(prev => ({
      ...prev,
      [prayerId]: Math.max(0, (prev[prayerId] || 0) + amount)
    }));
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin meriset hitungan sholat qodho lifetime? (Periode waktu tidak akan terhapus)')) {
      setCompleted({ subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 });
    }
  };

  const formatReadableDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Zero State Onboarding Banner if no duration set */}
      {totalDays === 0 && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-amber-500 text-white p-2.5 rounded-xl shrink-0 shadow-xs">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">Belum Ada Durasi Qodho Yang Diatur</h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Hitungan default sholat fardhu masih 0. Atur periode tanggal atau waktu tidak sholat di Kalkulator Durasi.
              </p>
            </div>
          </div>
          <Link
            href="/kalkulator"
            className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all text-center shrink-0"
          >
            Atur Durasi di Kalkulator
          </Link>
        </div>
      )}

      {/* Calculation Summary Bar & Link to Kalkulator Page */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-800 shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-800">Estimasi Durasi Qodho</h2>
              {displayStartDate && displayEndDate ? (
                <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-700" />
                  {formatReadableDate(displayStartDate)} &mdash; {formatReadableDate(displayEndDate)} ({totalDays.toLocaleString('id-ID')} Hari Unik)
                </span>
              ) : (
                <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                  {years} Tahun {months > 0 ? `${months} Bulan` : ''}
                </span>
              )}
              {hasPeriods && (
                <span className="text-xs bg-emerald-800 text-white font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {periods.length} Periode Overlap Digabung
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Total {totalDays.toLocaleString('id-ID')} hari ({initialTotalPrayers.toLocaleString('id-ID')} total utang sholat terpilih)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Link
            href="/kalkulator"
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Kalkulator Durasi</span>
          </Link>
          <button
            onClick={handleReset}
            className="text-xs text-rose-700 hover:text-rose-900 hover:bg-rose-50 px-3 py-2.5 rounded-xl border border-rose-200 transition-colors flex items-center gap-1 font-medium"
            title="Reset Progress Qodho"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Overview Progress Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Total Hutang Sholat</span>
            <div className="text-3xl font-extrabold">{initialTotalPrayers.toLocaleString('id-ID')} <span className="text-sm font-normal text-emerald-200">kali</span></div>
            <p className="text-xs text-emerald-300">Total seluruh periode waktu sholat terpilih</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Sudah Di-Qodho</span>
            <div className="text-3xl font-extrabold text-emerald-300 flex items-center gap-2">
              {totalCompleted.toLocaleString('id-ID')}
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-xs text-emerald-300">Progress keberhasilan qodho</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Sisa Harus Di-Qodho</span>
            <div className="text-3xl font-extrabold text-rose-200">{totalRemaining.toLocaleString('id-ID')} <span className="text-sm font-normal text-rose-300">kali</span></div>
            <p className="text-xs text-emerald-300">Counter otomatis berkurang tiap klik</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 pt-4 border-t border-emerald-700/60 space-y-2 relative z-10">
          <div className="flex justify-between text-xs text-emerald-200 font-medium">
            <span>Persentase Terselesaikan</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full bg-emerald-950/80 rounded-full h-3 p-0.5 border border-emerald-700">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Prayer Counters Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>Counter Qodho Per Waktu Sholat</span>
          </h3>
          <span className="text-xs text-slate-500">Klik tombol "-1 Qodho" tiap kali selesai sholat qodho</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRAYERS.map((prayer) => {
            const initialForPrayer = getInitialForPrayer(prayer.id);
            const isSelected = initialForPrayer > 0;
            const done = completed[prayer.id] || 0;
            const remaining = Math.max(0, initialForPrayer - done);
            const prayerPercent = initialForPrayer > 0 
              ? Math.min(100, Math.round((done / initialForPrayer) * 100))
              : (isSelected ? 0 : 100);

            return (
              <div
                key={prayer.id}
                className={`bg-white rounded-2xl p-5 shadow-sm border transition-shadow flex flex-col justify-between ${
                  isSelected ? 'border-slate-100 hover:shadow-md' : 'border-slate-200 bg-slate-50/60 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${prayer.badge}`}>
                      {prayer.name}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {isSelected ? `${done} / ${initialForPrayer} Selesai` : '0 Utang'}
                    </span>
                  </div>

                  {isSelected ? (
                    <div className="my-2">
                      <div className="text-xs text-slate-500 mb-1">Sisa yang harus di-qodho:</div>
                      <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {remaining.toLocaleString('id-ID')}
                        <span className="text-xs font-normal text-slate-500 ml-1">kali lagi</span>
                      </div>
                    </div>
                  ) : (
                    <div className="my-3 py-1 flex items-center gap-2 text-xs text-slate-500 font-semibold">
                      <Ban className="w-4 h-4 text-slate-400" />
                      <span>Sholat ini tidak ada utang pada periode terpilih</span>
                    </div>
                  )}

                  {/* Prayer progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 my-3 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${prayer.color} transition-all duration-300`}
                      style={{ width: isSelected ? `${prayerPercent}%` : '0%' }}
                    />
                  </div>
                </div>

                {/* Counter Buttons */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => handleIncrement(prayer.id, 1)}
                    disabled={!isSelected}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-2.5 px-4 rounded-xl shadow border border-emerald-700 disabled:border-slate-300 transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Sudah Qodho {prayer.name} (-1)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleIncrement(prayer.id, 5)}
                      disabled={!isSelected}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+5 Qodho</span>
                    </button>
                    <button
                      onClick={() => handleIncrement(prayer.id, -1)}
                      disabled={!isSelected || done <= 0}
                      className="bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 disabled:opacity-40 font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 border border-slate-200"
                      title="Batal / Kurangi hitungan selesai"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>Koreksi</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
