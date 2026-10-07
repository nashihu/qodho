"use client";

import React, { useState, useRef } from 'react';
import { Download, Upload, ShieldCheck, FileJson, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useUserGuard } from '../context/UserGuardContext';

export default function BackupRestoreModal({ isOpen, onClose }) {
  const { guardAction } = useUserGuard();
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle Export / Backup JSON
  const handleExportBackup = () => {
    guardAction(() => {
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
    });
  };

  // Trigger file picker
  const triggerFileInput = () => {
    guardAction(() => {
      setStatusMessage(null);
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    });
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

        if (!lifetimePayload && (!manualPayload || !Array.isArray(manualPayload))) {
          setStatusMessage({
            type: 'error',
            text: 'Isi file JSON tidak sesuai dengan struktur cadangan Qodho App.'
          });
          return;
        }

        setIsRestoring(true);

        if (lifetimePayload) {
          localStorage.setItem('qodho_lifetime_data', JSON.stringify(lifetimePayload));
        }

        if (manualPayload && Array.isArray(manualPayload)) {
          localStorage.setItem('qodho_manual_data', JSON.stringify(manualPayload));
        }

        // Notify app to refresh
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('qodho_updated'));
          window.dispatchEvent(new Event('storage'));
        }

        setStatusMessage({
          type: 'success',
          text: 'Data cadangan berhasil dipulihkan (restore)! Aplikasi akan memperbarui tampilan.'
        });

        setTimeout(() => {
          setIsRestoring(false);
          onClose();
        }, 1200);

      } catch (err) {
        console.error('Import failed:', err);
        setStatusMessage({
          type: 'error',
          text: 'Gagal memproses file JSON. File mungkin rusak atau tidak valid.'
        });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 relative overflow-hidden space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-2xl text-emerald-800">
              <FileJson className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Backup & Restore Data JSON</h3>
              <p className="text-xs text-slate-500">Amankan data hitungan qodho Anda ke file lokal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alert Status Message */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs font-medium animate-in slide-in-from-top-2 ${
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

        {/* Backup Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Backup (Export) */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
            <div className="space-y-2">
              <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Download Backup</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Unduh seluruh data qodho lifetime dan catatan udzur dalam format file <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px] font-mono text-slate-700">.json</code>.
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl shadow-xs border border-emerald-700 transition-all text-xs flex items-center justify-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor JSON</span>
            </button>
          </div>

          {/* Card 2: Restore (Import) */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
            <div className="space-y-2">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Restore Data</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pulihkan data dari file <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px] font-mono text-slate-700">.json</code> cadangan yang telah Anda unduh sebelumnya.
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />
            <button
              onClick={triggerFileInput}
              disabled={isRestoring}
              className="w-full bg-white hover:bg-slate-100 text-slate-800 font-bold py-2.5 px-3 rounded-xl border border-slate-300 transition-all text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>{isRestoring ? 'Memulihkan...' : 'Impor File JSON'}</span>
            </button>
          </div>
        </div>

        {/* Security Note Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-start gap-2.5 text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Data cadangan disimpan secara lokal di perangkat Anda. Disarankan melakukan backup secara berkala untuk mencegah hilangnya riwayat qodho.
          </p>
        </div>
      </div>
    </div>
  );
}
