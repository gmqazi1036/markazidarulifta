"use client";

import React, { useState, useEffect } from 'react';
import { getWazaif } from '../actions/public';
import { Heart, BookOpen, Clock, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { formatDateSafe } from '../utils/date';

export default function Wazaif() {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [wazaif, setWazaif] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadWazaif() {
      setLoading(true);
      const res = await getWazaif(selectedCategory);
      if (res.success && res.data) {
        setWazaif(res.data);
        if (res.categories) {
          setCategories(res.categories);
        }
      }
      setLoading(false);
    }
    loadWazaif();
  }, [selectedCategory]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-islamic-green to-islamic-darkGreen text-white p-8 rounded-xl border-b border-islamic-gold shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold font-urdu text-islamic-gold">
          Spiritual Wazaif & Remedies
        </h2>
        <p className="text-xs md:text-sm text-stone-300 mt-2">
          A collection of authenticated spiritual remedies, prayers, and Duas compiled from classical Islamic texts and guidelines of Dargah Aala Hazrat.
        </p>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-stone-200 pb-2">Filter Category</h3>
          <div className="flex flex-wrap lg:flex-col gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded text-left text-xs font-bold transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-islamic-gold text-white'
                  : 'bg-white border border-stone-200 text-slate-600 hover:bg-stone-50'
              }`}
            >
              All Wazaif
            </button>
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded text-left text-xs font-bold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-islamic-gold text-white'
                    : 'bg-white border border-stone-200 text-slate-600 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Wazaif List */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">Loading wazaif...</div>
          ) : wazaif.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm border border-dashed border-stone-300 rounded bg-white">
              No Wazaif found in this category.
            </div>
          ) : (
            <div className="space-y-6">
              {wazaif.map((wazifa) => (
                <div key={wazifa.id} className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 space-y-4 hover:border-islamic-gold transition-colors">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-3 flex-wrap gap-2 text-xs text-slate-400">
                    <span className="px-2 py-0.5 bg-islamic-gold/15 text-islamic-darkGold rounded font-bold uppercase tracking-wider text-[10px]">
                      {wazifa.category}
                    </span>
                    <span className="flex items-center space-x-1.5 rtl:space-x-reverse">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDateSafe(wazifa.publishDate, language)}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-base md:text-lg">
                    {wazifa.title}
                  </h3>

                  {/* Arabic Text (Centered and large) */}
                  <div className="bg-gradient-to-r from-stone-50 to-stone-100 rounded-lg p-6 text-center border border-stone-200/50">
                    <p className="text-xl md:text-3xl font-urdu text-islamic-green leading-loose font-bold tracking-wide select-all">
                      {wazifa.arabicText}
                    </p>
                  </div>

                  {/* Translations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                    <div className="bg-stone-50/50 p-4 rounded border border-stone-100 space-y-1">
                      <strong className="text-islamic-darkGold text-xs uppercase tracking-wide">Urdu Translation:</strong>
                      <p className="text-slate-700 leading-relaxed font-urdu">{wazifa.translationUr}</p>
                    </div>
                    <div className="bg-stone-50/50 p-4 rounded border border-stone-100 space-y-1">
                      <strong className="text-islamic-darkGold text-xs uppercase tracking-wide">English Translation:</strong>
                      <p className="text-slate-700 leading-relaxed italic">{wazifa.translationEn}</p>
                    </div>
                  </div>

                  {/* Methods & Benefits */}
                  <div className="space-y-2 border-t border-stone-100 pt-3 text-xs md:text-sm text-slate-600">
                    <p>
                      <strong className="text-slate-800">Recitation Method:</strong> {wazifa.method}
                    </p>
                    <p>
                      <strong className="text-slate-800">Benefits & Virtue:</strong> {wazifa.benefits}
                    </p>
                    {wazifa.references && (
                      <p className="text-[10px] text-slate-400 mt-2">
                        <strong>Source Reference:</strong> {wazifa.references}
                      </p>
                    )}
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
