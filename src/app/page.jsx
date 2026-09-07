"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import LifetimeSummary from '../components/LifetimeSummary';
import ManualMissedPrayer from '../components/ManualMissedPrayer';
import ArticleSection from '../components/ArticleSection';

function HomeContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('lifetime');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['lifetime', 'manual', 'articles'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
        {activeTab === 'lifetime' && <LifetimeSummary />}
        {activeTab === 'manual' && <ManualMissedPrayer />}
        {activeTab === 'articles' && <ArticleSection />}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center text-slate-500 font-semibold">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
