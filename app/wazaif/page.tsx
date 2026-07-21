"use client";

import React, { useState, useEffect } from 'react';
import { getWazaif } from '../actions/public';
import { Heart, BookOpen, Clock, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { formatDateSafe } from '../utils/date';

const wazifaTranslations: Record<string, {
  titleUr: string;
  methodUr: string;
  benefitsUr: string;
  referencesUr: string;
}> = {
  'Wazifa for Rizq and Prosperity': {
    titleUr: 'وظیفہ برائے وسعتِ رزق و برکت',
    methodUr: 'روزانہ فجر کی نماز کے بعد 111 بار اول و آخر 11 مرتبہ درود شریف کے ساتھ پڑھیں۔',
    benefitsUr: 'رزق میں برکت، مالی مشکلات کے حل اور روزگار کے نئے دروازے کھولنے کے لیے انتہائی مجرب ہے۔',
    referencesUr: 'اوراد و وظائف درگاہ اعلیٰ حضرت'
  },
  'Wazifa for Relief from Anxiety and Stress': {
    titleUr: 'وظیفہ برائے دفعِ پریشانی و سکونِ قلب',
    methodUr: 'روزانہ کسی بھی وقت باوضو حالت میں 313 بار پڑھیں۔',
    benefitsUr: 'خوف، گھبراہٹ، ذہنی تناؤ اور سخت ترین مصائب و مشکلات سے نجات حاصل ہوتی ہے۔',
    referencesUr: 'سورۃ آل عمران، آیت 173'
  }
};

const categoryTranslations: Record<string, string> = {
  'Rizq (Sustenance)': 'رزق و برکت',
  'Peace of Mind': 'سکونِ قلب و دفعِ پریشانی'
};

export default function Wazaif() {
  const { language, t } = useLanguage();
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

  const getWazifaTitle = (wazifa: any) => {
    if (language === 'ur') {
      return wazifaTranslations[wazifa.title]?.titleUr || wazifa.title;
    }
    return wazifa.title;
  };

  const getWazifaMethod = (wazifa: any) => {
    if (language === 'ur') {
      return wazifaTranslations[wazifa.title]?.methodUr || wazifa.method;
    }
    return wazifa.method;
  };

  const getWazifaBenefits = (wazifa: any) => {
    if (language === 'ur') {
      return wazifaTranslations[wazifa.title]?.benefitsUr || wazifa.benefits;
    }
    return wazifa.benefits;
  };

  const getWazifaReference = (wazifa: any) => {
    if (language === 'ur') {
      return wazifaTranslations[wazifa.title]?.referencesUr || wazifa.references;
    }
    return wazifa.references;
  };

  const getCategoryDisplay = (cat: string) => {
    if (language === 'ur') {
      return categoryTranslations[cat] || cat;
    }
    return cat;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-islamic-green to-islamic-darkGreen text-white p-8 rounded-xl border-b border-islamic-gold shadow-md">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium font-urdu text-islamic-gold leading-normal">
          {t('wazifaTitle')}
        </h2>
        <p className="text-base md:text-lg text-stone-200 mt-3 font-urdu leading-relaxed font-normal">
          {t('wazifaSubtitle')}
        </p>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-medium text-slate-800 text-base md:text-lg font-urdu border-b border-stone-200 pb-2">
            {t('wazifaFilterTitle')}
          </h3>
          <div className="flex flex-wrap lg:flex-col gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2.5 rounded text-left rtl:text-right text-sm md:text-base font-normal font-urdu transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-islamic-gold text-white'
                  : 'bg-white border border-stone-200 text-slate-700 hover:bg-stone-50'
              }`}
            >
              {t('wazifaAll')}
            </button>
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded text-left rtl:text-right text-sm md:text-base font-normal font-urdu transition-colors ${
                  selectedCategory === cat
                    ? 'bg-islamic-gold text-white'
                    : 'bg-white border border-stone-200 text-slate-700 hover:bg-stone-50'
                }`}
              >
                {getCategoryDisplay(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Wazaif List */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-base md:text-lg font-urdu">{t('wazifaLoading')}</div>
          ) : wazaif.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-base md:text-lg font-urdu border border-dashed border-stone-300 rounded-lg bg-white">
              {t('wazifaNoResults')}
            </div>
          ) : (
            <div className="space-y-6">
              {wazaif.map((wazifa) => (
                <div key={wazifa.id} className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-stone-200 space-y-5 hover:border-islamic-gold transition-colors">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-3 flex-wrap gap-2 text-xs md:text-sm text-slate-400">
                    <span className="px-3 py-1 bg-islamic-gold/15 text-islamic-darkGold rounded font-normal font-urdu text-xs md:text-sm">
                      {getCategoryDisplay(wazifa.category)}
                    </span>
                    <span className="flex items-center space-x-1.5 rtl:space-x-reverse font-urdu">
                      <Clock className="w-4 h-4 text-stone-400" />
                      <span>{formatDateSafe(wazifa.publishDate, language)}</span>
                    </span>
                  </div>

                  <h3 className="font-medium text-slate-800 text-xl md:text-2xl font-urdu leading-snug">
                    {getWazifaTitle(wazifa)}
                  </h3>

                  {/* Arabic Text of Wazeefa in Arabic Font */}
                  <div className="bg-gradient-to-r from-stone-50 to-stone-100 rounded-xl p-6 md:p-8 text-center border border-stone-200/60 shadow-inner">
                    <p className="text-2xl md:text-4xl lg:text-5xl font-arabic text-islamic-green leading-loose select-all font-normal">
                      {wazifa.arabicText}
                    </p>
                  </div>

                  {/* Translations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-stone-50/60 p-4 md:p-5 rounded-lg border border-stone-100 space-y-1.5">
                      <strong className="text-islamic-darkGold text-sm md:text-base font-urdu font-medium block">{t('wazifaUrduTrans')}</strong>
                      <p className="text-slate-700 text-base md:text-lg leading-loose font-urdu font-normal">{wazifa.translationUr}</p>
                    </div>
                    <div className="bg-stone-50/60 p-4 md:p-5 rounded-lg border border-stone-100 space-y-1.5">
                      <strong className="text-islamic-darkGold text-xs md:text-sm uppercase tracking-wide font-semibold block">{t('wazifaEngTrans')}</strong>
                      <p className="text-slate-700 text-xs md:text-sm leading-relaxed italic">{wazifa.translationEn}</p>
                    </div>
                  </div>

                  {/* Methods & Benefits */}
                  <div className="space-y-3 border-t border-stone-100 pt-4 text-sm md:text-base text-slate-700">
                    <p className="leading-relaxed">
                      <strong className="text-slate-900 font-urdu font-medium text-sm md:text-base inline-block mr-1 rtl:ml-1">{t('wazifaMethod')}</strong>{' '}
                      <span className="font-urdu font-normal text-base md:text-lg">{getWazifaMethod(wazifa)}</span>
                    </p>
                    <p className="leading-relaxed">
                      <strong className="text-slate-900 font-urdu font-medium text-sm md:text-base inline-block mr-1 rtl:ml-1">{t('wazifaBenefits')}</strong>{' '}
                      <span className="font-urdu font-normal text-base md:text-lg">{getWazifaBenefits(wazifa)}</span>
                    </p>
                    {wazifa.references && (
                      <p className="text-xs md:text-sm text-slate-500 mt-2 font-urdu">
                        <strong className="font-medium text-slate-700">{t('wazifaSource')}</strong>{' '}
                        <span className="font-normal">{getWazifaReference(wazifa)}</span>
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
