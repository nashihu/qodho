"use client";

import React, { useState, useRef } from 'react';
import { Download, Upload, ShieldCheck, FileJson, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function BackupRestoreModal({ isOpen, onClose }) {
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle Export / Backup JSON
  const handleExportBackup = () => {
    try {
      const lifetimeData = localStorage.getItem('qodho_lifetime_data');
      const manualData = localStorage.getItem('qodho_manual_data');

      const backupObj = {
        app: 'qodho-sholat-app',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        data: {
          qodho_lifetime_data: lifetimeData ? JSON.parse(lifetimeData) : null,
          qodho_manual_data: manualData ? JSON.parse(manualData) : []
        }
      };

      const jsonStr = JSON.stringify(backupObj, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const todayStr = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `qodho_backup_${todayStr}.json`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: 'File backup (.json) berhasil diunduh dan disimpan!'
      });
    } catch (err) {
      console.error('Export failed:', err);
      setStatusMessage({
        type: 'error',
        text: 'Gagal mengeksport file backup. Pastikan penyimpanan browser diizinkan.'
      });
    }
  };

  // Trigger file picker
  const triggerFileInput = () => {
    setStatusMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle Import / Restore JSON File
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setStatusMessage({
        type: 'error',
        text: 'Format file tidak valid. Harap pilih file cadangan berformat .json'
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') throw new Error('Invalid file content');

        const parsed = JSON.parse(content);
        
        let lifetimePayload = null;
        let manualPayload = null;

        // Support structured format or raw keys
        if (parsed.data) {
          lifetimePayload = parsed.data.qodho_lifetime_data;
          manualPayload = parsed.data.qodho_manual_data;
        } else if (parsed.qodho_lifetime_data || parsed.qodho_manual_data) {
          lifetimePayload = parsed.qodho_lifetime_data;
          manualPayload = parsed.qodho_manual_data;
        } else if (parsed.periods || parsed.completed) {
          // Direct lifetime data object fallback
          lifetimePayload = parsed;
        }

        if (!lifetimePayload && !manualPayload) {
          throw new Error('File JSON tidak berisi data qodho yang valid');
        }

        const confirmRestore = window.confirm(
          'Apakah Anda yakin ingin memulihkan data dari file ini?\nData saat ini di browser akan diperbarui dengan isi file backup.'
        );

        if (!confirmRestore) {
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        setIsRestoring(true);

        if (lifetimePayload) {
          localStorage.setItem('qodho_lifetime_data', JSON.stringify(lifetimePayload));
        }
        if (manualPayload) {
          localStorage.setItem('qodho_manual_data', JSON.stringify(manualPayload));
        }

        // Dispatch storage update events to notify all active React components
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('qodho_updated'));

        setStatusMessage({
          type: 'success',
          text: 'Data qodho sholat berhasil dipulihkan dari file backup!'
        });
      } catch (err) {
        console.error('Import failed:', err);
        setStatusMessage({
          type: 'error',
          text: `Gagal memulihkan data: ${err.message || 'File JSON rusak atau tidak valid'}`
        });
      } finally {
        setIsRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setStatusMessage({
        type: 'error',
        text: 'Gagal membaca file dari perangkat Anda.'
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-2xl text-emerald-800">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Backup & Restore Data</h3>
              <p className="text-xs text-slate-500">Pindahkan data qodho antar browser / perangkat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="my-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            Data disimpan aman di <span className="font-semibold text-slate-800">localStorage</span> perangkat ini. Gunakan fitur ini untuk mengunduh salinan cadangan (.json) atau memulihkannya jika berpindah HP/Laptop.
          </p>
        </div>

        {/* Alert status message */}
        {statusMessage && (
          <div
            className={`mb-4 p-3.5 rounded-2xl border flex items-center gap-3 text-xs font-medium animate-in slide-in-from-top-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Export / Download Backup */}
          <button
            onClick={handleExportBackup}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-2xl shadow-md border border-emerald-800 transition-all flex items-center justify-center gap-2.5 text-sm active:scale-[0.98]"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span>Unduh File Backup (.json)</span>
          </button>

          {/* Import / Restore Backup */}
          <button
            onClick={triggerFileInput}
            disabled={isRestoring}
            className="w-full bg-white hover:bg-slate-50 border-2 border-dashed border-emerald-300 hover:border-emerald-500 text-emerald-900 font-bold py-3 px-4 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2.5 text-sm disabled:opacity-50 active:scale-[0.98]"
          >
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>{isRestoring ? 'Memulihkan Data...' : 'Pulihkan Data (Upload .json)'}</span>
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Tutup Windows
          </button>
        </div>
      </div>
    </div>
  );
}
