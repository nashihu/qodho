"use client";

import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar, AlertCircle, CheckCircle, Trash2, Clock, Check, Filter } from 'lucide-react';
import { useUserGuard } from '../context/UserGuardContext';

const PRAYER_NAMES = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];
const REASONS = ['Sakit', 'Musafir (Bepergian)', 'Tertidur / Lupa', 'Lainnya'];

export default function ManualMissedPrayer() {
  const { guardAction } = useUserGuard();
  const [items, setItems] = useState([]);
  const [prayer, setPrayer] = useState('Subuh');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('Sakit');
  const [count, setCount] = useState(1);
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'completed'

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('qodho_manual_data');
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        // Initial sample data for demonstration
        const sampleData = [
          {
            id: '1',
            prayer: 'Subuh',
            date: '2026-09-02',
            reason: 'Tertidur / Lupa',
            initialCount: 1,
            remainingCount: 1,
            note: 'Alarm mati saat kram',
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            prayer: 'Ashar',
            date: '2026-08-25',
            reason: 'Musafir (Bepergian)',
            initialCount: 2,
            remainingCount: 0,
            note: 'Macet di jalan tol',
            status: 'completed',
            createdAt: new Date().toISOString()
          }
        ];
        setItems(sampleData);
        localStorage.setItem('qodho_manual_data', JSON.stringify(sampleData));
      }
    } catch (e) {
      console.error('Failed to load manual data', e);
    }
  };

  // Load from localStorage on mount & listen to updates
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

  // Save to localStorage
  const saveItems = (newItems) => {
    setItems(newItems);
    try {
      localStorage.setItem('qodho_manual_data', JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save manual data', e);
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (count <= 0) return;

    guardAction(() => {
      const newItem = {
        id: Date.now().toString(),
        prayer,
        date,
        reason,
        initialCount: Number(count),
        remainingCount: Number(count),
        note: note.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      saveItems([newItem, ...items]);
      setCount(1);
      setNote('');
    });
  };

  const handleQodhoClick = (id) => {
    guardAction(() => {
      const updated = items.map(item => {
        if (item.id === id && item.remainingCount > 0) {
          const nextCount = item.remainingCount - 1;
          return {
            ...item,
            remainingCount: nextCount,
            status: nextCount === 0 ? 'completed' : 'pending'
          };
        }
        return item;
      });
      saveItems(updated);
    });
  };

  const handleDelete = (id) => {
    guardAction(() => {
      if (confirm('Hapus catatan sholat udzur ini?')) {
        saveItems(items.filter(item => item.id !== id));
      }
    });
  };

  const filteredItems = items.filter(item => {
    if (filter === 'pending') return item.remainingCount > 0;
    if (filter === 'completed') return item.remainingCount === 0;
    return true;
  });

  const totalPendingUdzur = items.reduce((acc, curr) => acc + curr.remainingCount, 0);

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-white p-2.5 rounded-xl shadow-sm">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-amber-950">Catatan Sholat Terlewat Karena Udzur</h2>
            <p className="text-xs text-amber-800">Catat sholat fardhu spesifik yang terlewat akibat halangan syar'i (sakit, perjalanan, dll)</p>
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-amber-200 shadow-sm text-right shrink-0">
          <div className="text-xs text-amber-700 font-medium">Total Udzur Belum Di-qodho</div>
          <div className="text-xl font-black text-amber-900">{totalPendingUdzur} <span className="text-xs font-normal">kali</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Tambah Udzur Baru */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-amber-600" />
            <span>Tambah Catatan Udzur</span>
          </h3>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Sholat</label>
              <select
                value={prayer}
                onChange={(e) => setPrayer(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 focus:bg-white font-semibold text-slate-800 transition-all"
              >
                {PRAYER_NAMES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Kekejadian</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 focus:bg-white text-slate-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alasan / Udzur Syar&apos;i</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 focus:bg-white text-slate-800 transition-all"
              >
                {REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Sholat Terlewat</label>
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-500 focus:bg-white font-bold text-slate-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Macet di tol Cikampek, atau demam tinggi 38.5C"
                rows="2"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-amber-500 focus:bg-white text-slate-800 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simpan Catatan Udzur</span>
            </button>
          </form>
        </div>

        {/* Daftar Catatan Udzur */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Daftar Sholat Terlewat</span>
            </h3>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setFilter('pending')}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filter === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Belum Qodho
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filter === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Selesai
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-bold text-slate-700">Tidak Ada Catatan Dalam Kategori Ini</p>
              <p className="text-xs text-slate-500 mt-1">Alhamdulillah, tidak ada utang sholat udzur yang perlu dilunasi.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    item.remainingCount === 0
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-100 hover:border-amber-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{item.prayer}</span>
                      <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                        {item.reason}
                      </span>
                      {item.remainingCount === 0 && (
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> Lunas
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.date}</span>
                      {item.note && <span className="text-slate-400">&bull; &quot;{item.note}&quot;</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Sisa Utang</div>
                      <div className="text-sm font-extrabold text-slate-800">
                        {item.remainingCount} <span className="text-xs font-normal text-slate-500">/ {item.initialCount}</span>
                      </div>
                    </div>

                    {item.remainingCount > 0 ? (
                      <button
                        onClick={() => handleQodhoClick(item.id)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Cicil -1</span>
                      </button>
                    ) : (
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
