"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function KalenderPage() {
  const router = useRouter();

  // Selected Month state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Qodho data from localStorage
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customTotalDays, setCustomTotalDays] = useState(null);
  const [years, setYears] = useState(1);
  const [months, setMonths] = useState(0);
  const [completed, setCompleted] = useState({
    subuh: 0,
    dzuhur: 0,
    ashar: 0,
    maghrib: 0,
    isya: 0,
  });

  const [selectedDayDetail, setSelectedDayDetail] = useState(null);

  const loadData = () => {
    try {
      const saved = localStorage.getItem('qodho_lifetime_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.startDate) setStartDate(parsed.startDate);
        if (parsed.endDate) setEndDate(parsed.endDate);
        if (typeof parsed.totalDays === 'number') setCustomTotalDays(parsed.totalDays);
        if (typeof parsed.years === 'number') setYears(parsed.years);
        if (typeof parsed.months === 'number') setMonths(parsed.months);
        if (parsed.completed) setCompleted(parsed.completed);

        // If startDate exists, initialize calendar view to startDate month
        if (parsed.startDate) {
          const d = new Date(parsed.startDate);
          if (!isNaN(d.getTime())) {
            setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
          }
        }
      }
    } catch (e) {
      console.error('Failed to load Qodho data for calendar', e);
    }
  };

  useEffect(() => {
    loadData();

    const handleStorageUpdate = () => loadData();
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('qodho_updated', handleStorageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('qodho_updated', handleStorageUpdate);
    };
  }, []);

  // Compute overall Qodho stats
  const computedDays = Math.max(0, Math.floor((years || 0) * 365 + (months || 0) * 30.41));
  const totalDays = customTotalDays !== null && customTotalDays !== undefined ? customTotalDays : computedDays;

  // Helper to format Date to YYYY-MM-DD
  const formatDateStr = (year, month, day) => {
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Get status for a specific date (YYYY-MM-DD) based on individual 5 prayers
  const getDayStatus = (dateStr) => {
    if (!startDate || !endDate || !dateStr) return { type: 'normal' };

    const target = new Date(dateStr).getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (isNaN(target) || isNaN(start) || isNaN(end)) return { type: 'normal' };

    // Check if target date is outside range
    if (target < start || target > end) {
      return { type: 'normal' };
    }

    // Calculate dayIndex from startDate (0-indexed)
    const dayIndex = Math.round((target - start) / (1000 * 60 * 60 * 24));

    const subuhDone = (completed?.subuh || 0) > dayIndex;
    const dzuhurDone = (completed?.dzuhur || 0) > dayIndex;
    const asharDone = (completed?.ashar || 0) > dayIndex;
    const maghribDone = (completed?.maghrib || 0) > dayIndex;
    const isyaDone = (completed?.isya || 0) > dayIndex;

    const prayersPaid = (subuhDone ? 1 : 0) + (dzuhurDone ? 1 : 0) + (asharDone ? 1 : 0) + (maghribDone ? 1 : 0) + (isyaDone ? 1 : 0);

    const prayerDetails = {
      subuh: subuhDone,
      dzuhur: dzuhurDone,
      ashar: asharDone,
      maghrib: maghribDone,
      isya: isyaDone
    };

    if (prayersPaid === 5) {
      return { type: 'green', prayersPaid: 5, label: 'Lunas (5/5 Sholat)', prayerDetails };
    } else if (prayersPaid > 0) {
      return {
        type: 'partial',
        prayersPaid,
        label: `Progress (${prayersPaid}/5 Sholat)`,
        prayerDetails
      };
    } else {
      return { type: 'red', prayersPaid: 0, label: 'Utang (0/5 Sholat)', prayerDetails };
    }
  };

  // Navigation handlers for calendar month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  const jumpToStartDate = () => {
    if (startDate) {
      const d = new Date(startDate);
      if (!isNaN(d.getTime())) {
        setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    }
  };

  // Calendar Grid Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Get day of week for 1st day (0 = Sunday, 1 = Monday ... 6 = Saturday)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek < 0) startDayOfWeek = 6;

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  const daysArray = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  // Count month stats
  let monthGreenCount = 0;
  let monthPartialCount = 0;
  let monthRedCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = formatDateStr(year, month, d);
    const st = getDayStatus(dStr);
    if (st.type === 'green') monthGreenCount++;
    else if (st.type === 'partial') monthPartialCount++;
    else if (st.type === 'red') monthRedCount++;
  }

  // Compute total days in range that are 5/5 green vs partial vs red
  let totalGreenDays = 0;
  let totalPartialDays = 0;
  let totalRedDays = 0;

  if (startDate && endDate) {
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    if (!isNaN(startMs) && !isNaN(endMs) && endMs >= startMs) {
      const numDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
      for (let i = 0; i < numDays; i++) {
        const subuhDone = (completed?.subuh || 0) > i;
        const dzuhurDone = (completed?.dzuhur || 0) > i;
        const asharDone = (completed?.ashar || 0) > i;
        const maghribDone = (completed?.maghrib || 0) > i;
        const isyaDone = (completed?.isya || 0) > i;

        const paid = (subuhDone ? 1 : 0) + (dzuhurDone ? 1 : 0) + (asharDone ? 1 : 0) + (maghribDone ? 1 : 0) + (isyaDone ? 1 : 0);
        if (paid === 5) totalGreenDays++;
        else if (paid > 0) totalPartialDays++;
        else totalRedDays++;
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activeTab="kalender" setActiveTab={() => {}} />

      <div className="max-w-4xl mx-auto px-4 py-8 w-full flex-1 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold text-slate-700 hover:text-emerald-800 bg-white border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
          {startDate && (
            <button
              onClick={jumpToStartDate}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Ke Tanggal Mulai Qodho</span>
            </button>
          )}
        </div>

        {/* Page Banner */}
        <div className="bg-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-emerald-800 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Sparkles className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-800 p-3.5 rounded-2xl border border-emerald-700 shadow-inner shrink-0">
                <CalendarIcon className="w-8 h-8 text-emerald-300" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-wide">Kalender Qodho Sholat</h1>
                <p className="text-xs text-emerald-300 mt-1">
                  Setiap hari melacak 5 sholat (*Subuh, Dzuhur, Ashar, Maghrib, Isya*). Lunas jika kelima sholat selesai.
                </p>
              </div>
            </div>

            {/* Overview Badges */}
            <div className="grid grid-cols-3 gap-2 w-full md:w-auto bg-emerald-900/80 p-2.5 rounded-2xl border border-emerald-800/80 text-center">
              <div className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-800/60">
                <div className="text-[10px] text-rose-300 font-medium">Belum Di-Qodho</div>
                <div className="text-base font-extrabold text-rose-200">
                  {totalRedDays} <span className="text-[10px]">hari</span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800/60">
                <div className="text-[10px] text-amber-300 font-medium">Progress</div>
                <div className="text-base font-extrabold text-amber-200">
                  {totalPartialDays} <span className="text-[10px]">hari</span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-700/60">
                <div className="text-[10px] text-emerald-300 font-medium">Lunas (5/5)</div>
                <div className="text-base font-extrabold text-emerald-200">
                  {totalGreenDays} <span className="text-[10px]">hari</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicator Legend Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
          <span className="text-slate-500 font-bold flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-600" />
            Indikator Status Hari:
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-md bg-white border border-slate-300 shadow-xs inline-block"></span>
              <span className="text-slate-700">Hari Normal (White)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-md bg-rose-500 inline-block shadow-xs"></span>
              <span className="text-slate-700">Utang Full (0/5 Red)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-md bg-amber-400 inline-block shadow-xs"></span>
              <span className="text-slate-700">Sebagian (1/5 s.d 4/5 Opacity)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-md bg-emerald-500 inline-block shadow-xs"></span>
              <span className="text-slate-700">Lunas (5/5 Green)</span>
            </div>
          </div>
        </div>

        {/* Main Calendar Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-emerald-100 space-y-6">
          {/* Calendar Controller Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-wide">
                {monthNames[month]} {year}
              </h2>
              <button
                onClick={jumpToToday}
                className="text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-full transition-colors"
              >
                Bulan Ini
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            {weekDays.map((d, idx) => (
              <div key={idx} className="py-1.5">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {daysArray.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-14 rounded-2xl bg-slate-50/50"></div>;
              }

              const dateStr = formatDateStr(year, month, day);
              const status = getDayStatus(dateStr);
              const isToday = dateStr === formatDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

              // Dynamic styling based on status type & partial opacity
              let cellClasses = 'bg-white border-slate-200 text-slate-800 hover:border-emerald-400';
              let badgeText = null;

              if (status.type === 'green') {
                cellClasses = 'bg-emerald-500 border-emerald-600 text-white font-black shadow-sm hover:bg-emerald-600';
                badgeText = '✓ 5/5';
              } else if (status.type === 'red') {
                cellClasses = 'bg-rose-500 border-rose-600 text-white font-black shadow-sm hover:bg-rose-600';
                badgeText = '0/5';
              } else if (status.type === 'partial') {
                if (status.prayersPaid === 1) {
                  cellClasses = 'bg-rose-400/60 border-2 border-rose-500 text-rose-950 font-black hover:bg-rose-400/80';
                  badgeText = '1/5';
                } else if (status.prayersPaid === 2) {
                  cellClasses = 'bg-amber-400/70 border-2 border-amber-500 text-amber-950 font-black hover:bg-amber-400/90';
                  badgeText = '2/5';
                } else if (status.prayersPaid === 3) {
                  cellClasses = 'bg-emerald-400/70 border-2 border-emerald-500 text-emerald-950 font-black hover:bg-emerald-400/90';
                  badgeText = '3/5';
                } else if (status.prayersPaid === 4) {
                  cellClasses = 'bg-emerald-500/85 border-2 border-emerald-600 text-white font-black hover:bg-emerald-500';
                  badgeText = '4/5';
                }
              }

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDayDetail({ day, dateStr, status })}
                  className={`h-14 rounded-2xl border p-2 flex flex-col justify-between items-center transition-all duration-200 relative group text-xs ${cellClasses} ${
                    isToday ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
                  }`}
                >
                  <span className="font-bold self-start text-xs leading-none">{day}</span>
                  {badgeText && (
                    <span className="text-[10px] font-extrabold tracking-tight">
                      {badgeText}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Month Summary Bar */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span>Ringkasan {monthNames[month]} {year}:</span>
            <div className="flex items-center gap-3 font-semibold">
              <span className="text-emerald-700">🟢 {monthGreenCount} Hari Lunas (5/5)</span>
              <span className="text-amber-700">🟡 {monthPartialCount} Hari Progress</span>
              <span className="text-rose-700">🔴 {monthRedCount} Hari Utang</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Day Detail Modal */}
      {selectedDayDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-600" />
                <span>Detail Sholat Per Tanggal</span>
              </h3>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-bold px-2 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-slate-500 font-medium">Tanggal:</div>
              <div className="text-lg font-extrabold text-slate-900">
                {new Date(selectedDayDetail.dateStr).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>

              {/* Status Header */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs text-slate-500 font-semibold">Status Keseluruhan:</div>
                <div className="text-sm font-black flex items-center gap-2">
                  {selectedDayDetail.status.type === 'green' && (
                    <span className="text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5" /> 🟢 Lunas (5/5 Sholat Selesai)
                    </span>
                  )}
                  {selectedDayDetail.status.type === 'partial' && (
                    <span className="text-amber-600 flex items-center gap-1.5">
                      <Clock className="w-5 h-5" /> 🟡 Progress ({selectedDayDetail.status.prayersPaid}/5 Sholat Terbayar)
                    </span>
                  )}
                  {selectedDayDetail.status.type === 'red' && (
                    <span className="text-rose-600 flex items-center gap-1.5">
                      <AlertCircle className="w-5 h-5" /> 🔴 Belum Di-qodho (0/5 Sholat Terbayar)
                    </span>
                  )}
                  {selectedDayDetail.status.type === 'normal' && (
                    <span className="text-slate-600 flex items-center gap-1.5">
                      ⚪ Hari Normal (Di luar rentang waktu utang sholat)
                    </span>
                  )}
                </div>
              </div>

              {/* Individual 5 Prayers Breakdown Checklist */}
              {selectedDayDetail.status.type !== 'normal' && selectedDayDetail.status.prayerDetails && (
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-bold text-slate-700">Rincian 5 Waktu Sholat:</div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { key: 'subuh', label: 'Subuh' },
                      { key: 'dzuhur', label: 'Dzuhur' },
                      { key: 'ashar', label: 'Ashar' },
                      { key: 'maghrib', label: 'Maghrib' },
                      { key: 'isya', label: 'Isya' },
                    ].map((p) => {
                      const isDone = selectedDayDetail.status.prayerDetails[p.key];
                      return (
                        <div
                          key={p.key}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors ${
                            isDone
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50 border-rose-200 text-rose-900'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {isDone ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <X className="w-4 h-4 text-rose-500" />
                            )}
                            {p.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            isDone ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                          }`}>
                            {isDone ? 'Sudah Qodho' : 'Belum Qodho'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <Link
                href="/"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow text-xs text-center transition-all"
              >
                Ke Dashboard untuk Qodho
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
