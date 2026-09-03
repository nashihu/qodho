"use client";

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import LifetimeSummary from '../components/LifetimeSummary';
import ManualMissedPrayer from '../components/ManualMissedPrayer';
import ArticleSection from '../components/ArticleSection';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('lifetime');

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
