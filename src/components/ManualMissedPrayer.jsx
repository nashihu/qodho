"use client";

import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar, AlertCircle, CheckCircle, Trash2, Clock, Check, Filter } from 'lucide-react';

const PRAYER_NAMES = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];
const REASONS = ['Sakit', 'Musafir (Bepergian)', 'Tertidur / Lupa', 'Lainnya'];

export default function ManualMissedPrayer() {
  const [items, setItems] = useState([]);
  const [prayer, setPrayer] = useState('Subuh');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('Sakit');
  const [count, setCount] = useState(1);
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'completed'

  // Load from localStorage
  useEffect(() => {
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
  };

  const handleQodhoClick = (id) => {
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
  };

  const handleDelete = (id) => {
    if (confirm('Hapus catatan sholat udzur ini?')) {
      saveItems(items.filter(item => item.id !== id));
    }
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

      {/* Form Input Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          <span>Tambah Sholat Udzur Baru</span>
        </h3>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Waktu Sholat</label>
            <select
              value={prayer}
              onChange={(e) => setPrayer(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-800 font-medium text-sm"
            >
              {PRAYER_NAMES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Terlewat</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-800 font-medium text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan / Udzur</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-800 font-medium text-sm"
            >
              {REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Sholat (Jumlah)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-800 font-medium text-sm"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Saat sakit di rumah sakit, belum sempat jama'"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-800 text-sm"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simpan Catatan</span>
            </button>
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>Daftar Sholat Udzur Ditambahkan</span>
          </h3>

          {/* Filter Tab */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'pending' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Belum Di-Qodho
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'completed' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sudah Lunas
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'all' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada data sholat udzur</p>
            <p className="text-xs text-slate-400 mt-1">Semua catatan sholat udzur sesuai filter telah terselesaikan atau belum diinput</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => {
              const isDone = item.remainingCount === 0;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isDone
                      ? 'bg-slate-50 border-slate-200 opacity-75'
                      : 'bg-white border-emerald-100 hover:border-emerald-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 ${
                      isDone ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.prayer}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{item.prayer} ({item.initialCount}x)</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                          {item.reason}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.date}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-xs text-slate-600 mt-1 italic font-sans">"{item.note}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Sisa belum qodho:</div>
                      <div className={`text-base font-extrabold ${isDone ? 'text-slate-500' : 'text-emerald-700'}`}>
                        {item.remainingCount} / {item.initialCount} kali
                      </div>
                    </div>

                    {!isDone ? (
                      <button
                        onClick={() => handleQodhoClick(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Klik Qodho 1x (-1)</span>
                      </button>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Lunas
                      </span>
                    )}

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
