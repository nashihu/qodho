"use client";

import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function AlertModal({ isOpen, onClose, title = "Perhatian", message, onConfirm }) {
  if (!isOpen) return null;

  const handleOk = () => {
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 relative overflow-hidden text-center animate-in zoom-in-95 duration-150">
        {/* Top Header Icon */}
        <div className="mx-auto w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 mb-4 border border-amber-200/80 shadow-xs">
          <AlertCircle className="w-7 h-7 text-amber-600" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
          {message}
        </p>

        {/* OK Action Button */}
        <button
          onClick={handleOk}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md border border-amber-700 transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
        >
          <span>OK</span>
        </button>
      </div>
    </div>
  );
}
