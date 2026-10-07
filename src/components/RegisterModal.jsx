"use client";

import React, { useState } from 'react';
import { KeyRound, Mail, CheckCircle2, AlertCircle, X, Loader2, Sparkles, User, ShoppingCart, ExternalLink } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { encryptText } from '../utils/crypto';

export default function RegisterModal({ isOpen, onClose, onSuccess }) {
  const { data: session } = useSession();
  const [license, setLicense] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  if (!isOpen) return null;

  const userEmail = session?.user?.email || '';
  const userName = session?.user?.name || 'Pengguna Google';
  const userImage = session?.user?.image || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanLicense = license.trim();

    if (!userEmail) {
      setStatusMessage({
        type: 'error',
        text: 'Sign in dengan Google diperlukan untuk daftar lisensi.'
      });
      return;
    }

    if (!cleanLicense) {
      setStatusMessage({ type: 'error', text: 'Kode lisensi wajib diisi.' });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,
          license: cleanLicense
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatusMessage({
          type: 'error',
          text: data.message || 'Gagal mendaftarkan lisensi.'
        });
        return;
      }

      // Encrypt user email, isRegistered: true, and expiredAt timestamp into localStorage key 'user'
      try {
        const serverPubKey = process.env.NEXT_PUBLIC_SERVER_PUBLIC_KEY || 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEJDOxpPvSiQClTvWDT1OujRiFa370WltNtTHHBiNHBNioXHLSdAQNiM2+pmua4F1ZUdpjSBEdvG6bp+VCUbHUIg==';
        const expiredAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days TTL
        const payloadStr = JSON.stringify({ email: userEmail, isRegistered: true, expiredAt });
        const { encryptedData, clientPublicKey } = encryptText(payloadStr, serverPubKey);
        localStorage.setItem('user', JSON.stringify({ data: encryptedData, clientPublicKey }));
      } catch (encErr) {
        console.error('Failed to save encrypted user cache:', encErr);
      }

      // Clear license field on success
      setLicense('');

      // Immediately close RegisterModal and trigger Thank You modal
      if (typeof onSuccess === 'function') {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Register API error:', err);
      setStatusMessage({
        type: 'error',
        text: 'Terjadi kesalahan jaringan, silakan coba lagi.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2.5 rounded-2xl text-amber-800">
              <KeyRound className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Registrasi Lisensi</h3>
              <p className="text-xs text-slate-500">Aktivasi akun dengan kode lisensi Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Info Card (Read-only Google Account Info) */}
        <div className="mt-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="w-9 h-9 rounded-full border border-emerald-400 object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white border border-emerald-500 shrink-0">
                <User className="w-5 h-5 text-emerald-100" />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-bold text-emerald-950 truncate">{userName}</div>
              <div className="text-xs font-medium text-emerald-700 truncate flex items-center gap-1">
                <Mail className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{userEmail}</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-1 rounded-full shrink-0 border border-emerald-300">
            Google Connected
          </span>
        </div>

        {/* Purchase License Link Card */}
        <div className="mt-4 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-amber-500 text-white p-2.5 rounded-xl shadow-xs shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800">Belum Punya Lisensi?</div>
              <div className="text-[11px] text-slate-600 truncate">Beli kode lisensi resmi di Mayar</div>
            </div>
          </div>
          <a
            href="https://qodho.myr.id/app/qodho-app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs border border-amber-700 transition-all shrink-0 active:scale-95"
          >
            <span>Beli Lisensi</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Status Message Alert */}
        {statusMessage && (
          <div
            className={`mt-4 p-3.5 rounded-2xl border flex items-center gap-3 text-xs font-medium animate-in slide-in-from-top-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* License Code Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kode Lisensi Mayar <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder="Masukkan Kode Lisensi (Contoh: 1B3C278AD4FD08FA)"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-slate-800 text-sm font-mono uppercase tracking-wider transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Lisensi akan ditautkan ke akun Google <span className="font-semibold text-slate-700">{userEmail}</span>.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-2xl shadow-md border border-amber-700 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                  <span>Memproses Registrasi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Daftarkan Lisensi</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Batal & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
