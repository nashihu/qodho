"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  CheckCircle2, 
  RotateCcw, 
  Plus, 
  Minus, 
  Edit3, 
  Flame, 
  Sparkles, 
  Calendar, 
  Info, 
  Ban, 
  Layers, 
  FileJson,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { computePeriodsRequirement } from '../utils/qodhoCalculator';
import BackupRestoreModal from './BackupRestoreModal';

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
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

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

  const confirmReset = () => {
    setCompleted({ subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 });
    setPeriods([]);
    setStartDate('');
    setEndDate('');
    setCustomTotalDays(null);
    setYears(0);
    setMonths(0);
    setSelectedPrayers({
      subuh: true,
      dzuhur: true,
      ashar: true,
      maghrib: true,
      isya: true,
    });
    try {
      localStorage.removeItem('qodho_lifetime_data');
    } catch (e) {
      console.error('Failed to remove lifetime data on reset:', e);
    }
    window.dispatchEvent(new Event('qodho_updated'));
    setIsResetModalOpen(false);
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
    <div className="space-y-6 sm:space-y-8">
      {/* Zero State Onboarding Card if no duration set */}
      {totalDays === 0 ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-xs border border-emerald-100 text-center max-w-2xl mx-auto my-4 sm:my-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-emerald-100/80 shadow-inner">
            <Calculator className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Mulai Hitung Qodho Sholat Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2.5 max-w-lg mx-auto leading-relaxed">
            Tentukan perkiraan masa baligh, periode tidak sholat, atau udzur syar&apos;i untuk memulai pencatatan hutang sholat fardhu.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/kalkulator"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95"
            >
              <span>Hitung Utang Sholat Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setIsBackupOpen(true)}
              className="w-full sm:w-auto text-emerald-800 hover:bg-emerald-50 py-3 px-5 rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-2 font-bold text-xs sm:text-sm bg-white active:scale-95"
            >
              <FileJson className="w-4 h-4 text-emerald-700" />
              <span>Restore Backup JSON</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Active Calculation Summary Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-emerald-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-800 shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-bold text-slate-800">Estimasi Durasi Qodho</h2>
                  {displayStartDate && displayEndDate ? (
                    <span className="text-[11px] sm:text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-700" />
                      {formatReadableDate(displayStartDate)} &mdash; {formatReadableDate(displayEndDate)} ({totalDays.toLocaleString('id-ID')} Hari Unik)
                    </span>
                  ) : (
                    <span className="text-[11px] sm:text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                      {years} Tahun {months > 0 ? `${months} Bulan` : ''}
                    </span>
                  )}
                  {hasPeriods && (
                    <span className="text-[11px] sm:text-xs bg-emerald-800 text-white font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
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
                className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Kalkulator Durasi</span>
              </Link>
              <button
                onClick={() => setIsBackupOpen(true)}
                className="text-xs text-emerald-800 hover:bg-emerald-50 px-3.5 py-2.5 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 font-bold bg-emerald-50/50 active:scale-95"
                title="Backup & Restore Data JSON"
              >
                <FileJson className="w-3.5 h-3.5 text-emerald-700" />
                <span>Backup Data</span>
              </button>
            </div>
          </div>

          {/* Overview Progress Card (Compacted on mobile) */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none hidden sm:block">
              <Sparkles className="w-64 h-64 text-white" />
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
              <div className="space-y-0.5 sm:space-y-1">
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-200 uppercase tracking-wider block truncate">
                  Total Utang
                </span>
                <div className="text-lg sm:text-2xl md:text-3xl font-extrabold truncate">
                  {initialTotalPrayers.toLocaleString('id-ID')} <span className="text-[11px] sm:text-sm font-normal text-emerald-200">kali</span>
                </div>
                <p className="text-xs text-emerald-300 hidden md:block">Total seluruh periode waktu sholat terpilih</p>
              </div>

              <div className="space-y-0.5 sm:space-y-1">
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-200 uppercase tracking-wider block truncate">
                  Sudah Di-Qodho
                </span>
                <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-emerald-300 flex items-center gap-1 sm:gap-2 truncate">
                  <span>{totalCompleted.toLocaleString('id-ID')}</span>
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                </div>
                <p className="text-xs text-emerald-300 hidden md:block">Progress keberhasilan qodho</p>
              </div>

              <div className="space-y-0.5 sm:space-y-1">
                <span className="text-[10px] sm:text-xs font-semibold text-rose-300 uppercase tracking-wider block truncate">
                  Sisa Utang
                </span>
                <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-rose-200 truncate">
                  {totalRemaining.toLocaleString('id-ID')} <span className="text-[11px] sm:text-sm font-normal text-rose-300">kali</span>
                </div>
                <p className="text-xs text-emerald-300 hidden md:block">Counter otomatis berkurang tiap klik</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-emerald-700/60 space-y-1.5 sm:space-y-2 relative z-10">
              <div className="flex justify-between text-[11px] sm:text-xs text-emerald-200 font-medium">
                <span>Persentase Terselesaikan</span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="w-full bg-emerald-950/80 rounded-full h-2.5 sm:h-3 p-0.5 border border-emerald-700">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Prayer Counters Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>Counter Qodho Per Waktu Sholat</span>
              </h3>
              <span className="text-xs text-slate-500">
                Catat capaian sholat qodho yang telah Anda tunaikan
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {PRAYERS.map((prayer) => {
                const initialForPrayer = getInitialForPrayer(prayer.id);
                const isSelected = initialForPrayer > 0;
                const done = completed[prayer.id] || 0;
                const remaining = Math.max(0, initialForPrayer - done);
                const isLunas = isSelected && remaining === 0;
                const prayerPercent = initialForPrayer > 0 
                  ? Math.min(100, Math.round((done / initialForPrayer) * 100))
                  : (isSelected ? 0 : 100);

                return (
                  <div
                    key={prayer.id}
                    className={`bg-white rounded-2xl p-4 sm:p-5 shadow-xs border transition-all flex flex-col justify-between ${
                      isSelected ? 'border-slate-100 hover:shadow-md' : 'border-slate-200 bg-slate-50/60 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${prayer.badge}`}>
                          {prayer.name}
                        </span>
                        {isLunas ? (
                          <span className="text-[11px] sm:text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Alhamdulillah Lunas
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">
                            {isSelected ? `${done} / ${initialForPrayer} Selesai` : '0 Utang'}
                          </span>
                        )}
                      </div>

                      {isLunas ? (
                        <div className="my-2">
                          <div className="text-xs text-emerald-700 font-medium mb-1">Status Sholat:</div>
                          <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 tracking-tight flex items-center gap-1.5">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span>Lunas (0 Tersisa)</span>
                          </div>
                        </div>
                      ) : isSelected ? (
                        <div className="my-2">
                          <div className="text-xs text-slate-500 mb-1">Sisa yang harus di-qodho:</div>
                          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            {remaining.toLocaleString('id-ID')}
                            <span className="text-xs font-normal text-slate-500 ml-1">kali lagi</span>
                          </div>
                        </div>
                      ) : (
                        <div className="my-3 py-1 flex items-center gap-2 text-xs text-slate-500 font-semibold">
                          <Ban className="w-4 h-4 text-slate-400 shrink-0" />
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
                        disabled={!isSelected || isLunas}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-xs border border-emerald-700 transition-all flex items-center justify-center gap-2 text-sm active:scale-95 min-h-[44px]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>{isLunas ? 'Alhamdulillah Lunas' : '+1 Qodho Selesai'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleIncrement(prayer.id, 5)}
                          disabled={!isSelected || isLunas}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-semibold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 min-h-[38px] active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+5 Selesai</span>
                        </button>
                        <button
                          onClick={() => handleIncrement(prayer.id, -1)}
                          disabled={!isSelected || done <= 0}
                          className="bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed font-semibold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 border border-slate-200 min-h-[38px] active:scale-95"
                          title="Batal / Kurangi hitungan selesai"
                        >
                          <Minus className="w-3.5 h-3.5" />
                          <span>-1 Koreksi</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Danger Zone Accordion (Reset Progress) */}
          <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs mt-6">
            <button
              onClick={() => setIsDangerZoneOpen(!isDangerZoneOpen)}
              className="w-full px-5 py-4 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span>Pengaturan Lanjutan &amp; Zona Bahaya</span>
              </div>
              {isDangerZoneOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {isDangerZoneOpen && (
              <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-rose-950">
                      Reset Progress Qodho Lifetime
                    </h4>
                    <p className="text-xs text-rose-800/90 mt-1 max-w-xl">
                      Mengembalikan seluruh hitungan sholat yang telah di-qodho menjadi 0. Konfigurasi tanggal, periode, dan target utang juga terhapus.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsResetModalOpen(true)}
                    className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Progress Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Confirmation Modal for Reset */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3.5 text-rose-600 mb-3">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Konfirmasi Reset Progres
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              Apakah Anda yakin ingin meriset seluruh hitungan sholat qodho yang telah diselesaikan menjadi <strong className="text-slate-800">0 kali</strong>? Data periode tanggal dan konfigurasi waktu Anda juga akan terhapus.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmReset}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs active:scale-95"
              >
                Ya, Reset Progres
              </button>
            </div>
          </div>
        </div>
      )}

      <BackupRestoreModal isOpen={isBackupOpen} onClose={() => setIsBackupOpen(false)} />
    </div>
  );
}

