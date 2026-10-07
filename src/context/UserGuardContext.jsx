"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { encryptText } from '../utils/crypto';
import AlertModal from '../components/AlertModal';

const UserGuardContext = createContext({
  isRegistered: false,
  isChecking: true,
  isRegisterOpen: false,
  setIsRegisterOpen: () => {},
  isThankYouOpen: false,
  setIsThankYouOpen: () => {},
  guardAction: (callback) => {},
  saveUserCache: () => {},
  onRegisterSuccess: () => {},
  clearUserCache: () => {},
  checkUserRegistration: () => {},
  showAlert: (message, onConfirm, title) => {},
});

export function UserGuardProvider({ children }) {
  const { data: session } = useSession();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const [checkedEmails, setCheckedEmails] = useState({});

  // Alert Modal State
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: 'Perhatian',
    message: '',
    onConfirm: null,
  });

  const showAlert = useCallback((message, onConfirm = null, title = 'Perhatian') => {
    setAlertConfig({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const saveUserCache = useCallback((emailStr, isRegisteredBool) => {
    try {
      const serverPubKey = process.env.NEXT_PUBLIC_SERVER_PUBLIC_KEY || 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEJDOxpPvSiQClTvWDT1OujRiFa370WltNtTHHBiNHBNioXHLSdAQNiM2+pmua4F1ZUdpjSBEdvG6bp+VCUbHUIg==';
      const payloadStr = JSON.stringify({ email: emailStr, isRegistered: isRegisteredBool });
      const { encryptedData, clientPublicKey } = encryptText(payloadStr, serverPubKey);
      localStorage.setItem('user', JSON.stringify({ data: encryptedData, clientPublicKey }));
    } catch (err) {
      console.error('Failed to save encrypted user cache:', err);
    }
  }, []);

  const clearUserCache = useCallback(() => {
    localStorage.removeItem('user');
    setIsRegistered(false);
  }, []);

  const runUserVerificationFlow = useCallback(async (rawGoogleEmail) => {
    setIsChecking(true);

    // 1. Check if localStorage key 'user' exists
    const cachedUserData = localStorage.getItem('user');

    if (cachedUserData) {
      try {
        const parsed = JSON.parse(cachedUserData);
        if (parsed?.data && parsed?.clientPublicKey) {
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
              setIsRegistered(cachePayload.isRegistered);
              setCheckedEmails((prev) => ({ ...prev, [rawGoogleEmail]: true }));
              setIsChecking(false);

              if (cachePayload.isRegistered === false) {
                setIsRegisterOpen(true);
              }
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Decryption cache check failed, clearing invalid cache key:', err);
      }

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
        setIsChecking(false);
        showAlert('Terjadi kesalahan saat memeriksa akun, kami sedang memperbaikinya.');
        return;
      }

      if (checkData.exists === false) {
        saveUserCache(rawGoogleEmail, false);
        setIsRegistered(false);
        setIsRegisterOpen(true);
      } else if (checkData.exists === true) {
        saveUserCache(rawGoogleEmail, true);
        setIsRegistered(true);
      }
    } catch (err) {
      console.error('Check user error:', err);
      showAlert('Terjadi kesalahan jaringan, silakan coba lagi.');
    } finally {
      setIsChecking(false);
    }
  }, [saveUserCache, showAlert]);

  useEffect(() => {
    const rawGoogleEmail = session?.user?.email;
    if (!rawGoogleEmail) {
      setIsRegistered(false);
      setIsChecking(false);
      return;
    }

    if (!checkedEmails[rawGoogleEmail]) {
      runUserVerificationFlow(rawGoogleEmail);
    }
  }, [session, checkedEmails, runUserVerificationFlow]);

  const guardAction = useCallback((actionCallback) => {
    if (!session?.user?.email) {
      showAlert(
        "Sign in dengan Google dan aktivasi lisensi diperlukan untuk menggunakan fitur ini.",
        () => signIn("google")
      );
      return false;
    }

    if (!isRegistered) {
      showAlert(
        "Aktivasi lisensi diperlukan untuk menggunakan fitur ini.",
        () => setIsRegisterOpen(true)
      );
      return false;
    }

    if (typeof actionCallback === 'function') {
      actionCallback();
    }
    return true;
  }, [session, isRegistered, showAlert]);

  const onRegisterSuccess = useCallback(() => {
    setIsRegistered(true);
    setIsRegisterOpen(false);
    setIsThankYouOpen(true);
  }, []);

  return (
    <UserGuardContext.Provider
      value={{
        isRegistered,
        isChecking,
        isRegisterOpen,
        setIsRegisterOpen,
        isThankYouOpen,
        setIsThankYouOpen,
        guardAction,
        saveUserCache,
        clearUserCache,
        onRegisterSuccess,
        checkUserRegistration: runUserVerificationFlow,
        showAlert,
      }}
    >
      {children}
      <AlertModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onClose={closeAlert}
      />
    </UserGuardContext.Provider>
  );
}

export function useUserGuard() {
  return useContext(UserGuardContext);
}
