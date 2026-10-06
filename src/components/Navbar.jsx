"use client";

import React from 'react';
import { Calendar, BookOpen, PlusCircle, Calculator, CalendarDays, LogOut, User, FileJson, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import BackupRestoreModal from './BackupRestoreModal';
import RegisterModal from './RegisterModal';
import ThankYouModal from './ThankYouModal';

import { encryptText } from '../utils/crypto';

export default function Navbar({ activeTab, setActiveTab }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isBackupOpen, setIsBackupOpen] = React.useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = React.useState(false);
  const [checkedEmails, setCheckedEmails] = React.useState({});
  const [activeUserEmail, setActiveUserEmail] = React.useState('');

  const tabs = [
    { id: 'lifetime', label: 'Ringkasan Lifetime', icon: Calculator },
    { id: 'manual', label: 'Tambah Qodho Udzur', icon: PlusCircle },
    { id: 'articles', label: 'Artikel & Panduan', icon: BookOpen },
  ];

  const handleTabClick = (tabId) => {
    if (pathname === '/') {
      if (typeof setActiveTab === 'function') {
        setActiveTab(tabId);
      }
    } else {
      router.push(`/?tab=${tabId}`);
    }
  };

  // Helper to encrypt and store user state in localStorage key 'user'
  const saveUserCache = (emailStr, isRegisteredBool) => {
    try {
      const serverPubKey = process.env.NEXT_PUBLIC_SERVER_PUBLIC_KEY || 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEJDOxpPvSiQClTvWDT1OujRiFa370WltNtTHHBiNHBNioXHLSdAQNiM2+pmua4F1ZUdpjSBEdvG6bp+VCUbHUIg==';
      const payloadStr = JSON.stringify({ email: emailStr, isRegistered: isRegisteredBool });
      const { encryptedData, clientPublicKey } = encryptText(payloadStr, serverPubKey);
      localStorage.setItem('user', JSON.stringify({ data: encryptedData, clientPublicKey }));
    } catch (err) {
      console.error('Failed to save encrypted user cache:', err);
    }
  };

  // Check user registration status whenever Google session is active
  React.useEffect(() => {
    const rawGoogleEmail = session?.user?.email;
    if (!rawGoogleEmail || checkedEmails[rawGoogleEmail]) return;

    const runUserVerificationFlow = async () => {
      // 1. Check if localStorage key 'user' exists
      const cachedUserData = localStorage.getItem('user');

      if (cachedUserData) {
        try {
          const parsed = JSON.parse(cachedUserData);
          if (parsed?.data && parsed?.clientPublicKey) {
            // Call POST /api/decrypt (pure in-memory crypto, zero PSQL hits)
            const decryptRes = await fetch('/api/decrypt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                data: parsed.data,
                clientPublicKey: parsed.clientPublicKey,
              }),
            });

            const decryptData = await decryptRes.json();
            const decryptedString = decryptData?.decrypted;

            if (decryptRes.ok && decryptedString && decryptedString.trim().length > 0) {
              let cachePayload = null;
              try {
                cachePayload = JSON.parse(decryptedString);
              } catch {
                cachePayload = { email: decryptedString.trim(), isRegistered: true };
              }

              if (cachePayload?.email && typeof cachePayload?.isRegistered === 'boolean') {
                // CACHE HIT!
                setActiveUserEmail(cachePayload.email);
                setCheckedEmails((prev) => ({ ...prev, [rawGoogleEmail]: true }));

                if (cachePayload.isRegistered === false) {
                  // User is not registered yet -> Open RegisterModal
                  setIsRegisterOpen(true);
                }
                // Do NOT hit /api/check-user-exists!
                return;
              }
            }
          }
        } catch (err) {
          console.warn('Decryption cache check failed, clearing invalid cache key:', err);
        }

        // If decryption failed or payload is invalid, delete key 'user'
        localStorage.removeItem('user');
      }

      // 2. Cache MISS or decryption error: hit POST /api/check-user-exists
      try {
        const checkRes = await fetch('/api/check-user-exists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: rawGoogleEmail }),
        });

        const checkData = await checkRes.json();
        setCheckedEmails((prev) => ({ ...prev, [rawGoogleEmail]: true }));

        if (!checkRes.ok || checkData.error) {
          alert('Terjadi kesalahan, kami sedang memperbaikinya');
          return;
        }

        if (checkData.exists === false) {
          // Scenario A: User is not registered in database -> Cache isRegistered: false
          saveUserCache(rawGoogleEmail, false);
          setIsRegisterOpen(true);
        } else if (checkData.exists === true) {
          // Scenario B: User is registered in database -> Cache isRegistered: true
          setActiveUserEmail(rawGoogleEmail);
          saveUserCache(rawGoogleEmail, true);
        }
      } catch (err) {
        console.error('Check user error:', err);
        alert('Terjadi kesalahan, kami sedang memperbaikinya');
      }
    };

    runUserVerificationFlow();
  }, [session, checkedEmails]);

  const handleRegisterClick = () => {
    // Delete key 'user' from localStorage when clicking "Daftar Lisensi"
    localStorage.removeItem('user');
    if (!session) {
      signIn('google');
    } else {
      setIsRegisterOpen(true);
    }
  };

  const renderAuthSection = () => {
    if (status === 'loading') {
      return <div className="h-8 md:h-9 w-24 md:w-28 bg-emerald-800/60 animate-pulse rounded-lg border border-emerald-700"></div>;
    }
    if (session) {
      return (
        <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-700 rounded-xl px-2.5 py-1.5 shadow-sm">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-7 h-7 rounded-full border border-emerald-500 object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white border border-emerald-500">
              <User className="w-4 h-4 text-emerald-200" />
            </div>
          )}
          <span className="text-xs font-medium text-emerald-100 max-w-[100px] truncate hidden sm:inline">
            {session.user?.name || 'User'}
          </span>
          <button
            onClick={() => signOut()}
            title="Keluar / Sign Out"
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-300 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => signIn('google')}
        className="flex items-center gap-1.5 sm:gap-2 bg-white text-slate-700 hover:bg-slate-100 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-md border border-slate-200 hover:shadow-lg active:scale-95"
      >
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
          />
        </svg>
        <span>Masuk<span className="hidden sm:inline"> dengan Google</span></span>
      </button>
    );
  };

  return (
    <>
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          {/* Top row on mobile: Logo (left) + Auth section (right) */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="bg-emerald-700 p-2 sm:p-2.5 rounded-xl shadow-inner border border-emerald-600 group-hover:bg-emerald-600 transition-colors">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-100" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-wide flex items-center gap-2">
                  Qodho Tracker
                </h1>
                <p className="text-[11px] sm:text-xs text-emerald-300 hidden sm:block">
                  Catat dan lunasi utang sholat fardhu secara sistematis
                </p>
              </div>
            </Link>

            {/* Mobile Auth button */}
            <div className="md:hidden flex items-center">
              {renderAuthSection()}
            </div>
          </div>

          {/* Nav tabs (Row 2 on mobile, right side on desktop) */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <nav className="flex items-center gap-1.5 bg-emerald-950/60 p-1.5 rounded-xl border border-emerald-800/80 w-full md:w-auto overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname === '/' && activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap ${isActive
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-emerald-300 hover:text-white hover:bg-emerald-800/50'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <Link
                href="/kalender"
                className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-bold border transition-colors whitespace-nowrap ml-1 ${pathname === '/kalender'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border-emerald-700'
                  }`}
              >
                <CalendarDays className="w-4 h-4 text-emerald-300" />
                <span>Kalender</span>
              </Link>
            </nav>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center">
              {renderAuthSection()}
            </div>
          </div>
        </div>
      </header>
      <BackupRestoreModal isOpen={isBackupOpen} onClose={() => setIsBackupOpen(false)} />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={() => {
          setIsRegisterOpen(false);
          setIsThankYouOpen(true);
        }}
      />
      <ThankYouModal
        isOpen={isThankYouOpen}
        onClose={() => setIsThankYouOpen(false)}
      />
    </>
  );
}
