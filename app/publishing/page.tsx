"use client";

import React, { useState, useEffect } from 'react';
import { getBooks } from '../actions/public';
import { BookOpen, Search, Download, FileText, ArrowRight, Library, Book } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { formatDateSafe } from '../utils/date';

export default function Publishing() {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBooks() {
      setLoading(true);
      const res = await getBooks({ query, type: selectedType, category: selectedCategory });
      if (res.success && res.data) {
        setBooks(res.data);
        if (res.categories) {
          setCategories(res.categories);
        }
      }
      setLoading(false);
    }
    loadBooks();
  }, [query, selectedType, selectedCategory]);

  const getTypeLabel = (typeStr: string) => {
    if (typeStr === 'BOOK') return t('pubBooks');
    if (typeStr === 'MAGAZINE') return t('pubMagazines');
    if (typeStr === 'RESEARCH_PAPER') return t('pubResearchPapers');
    return typeStr;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-islamic-green to-islamic-darkGreen text-white p-8 rounded-xl border-b border-islamic-gold shadow-md">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium font-urdu text-islamic-gold leading-normal">
          {t('pubTitle')}
        </h2>
        <p className="text-base md:text-lg text-stone-200 mt-3 font-urdu leading-relaxed">
          {t('pubSubtitle')}
        </p>
      </section>

      {/* Intro Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-2 bg-white rounded-xl p-6 md:p-8 shadow-sm border border-stone-200 space-y-4">
          <h3 className="font-semibold text-slate-800 text-xl md:text-2xl flex items-center space-x-2 rtl:space-x-reverse font-urdu">
            <Library className="w-6 h-6 text-islamic-gold flex-shrink-0" />
            <span>{t('pubLitTitle')}</span>
          </h3>
          <p className="text-base md:text-lg text-slate-700 font-urdu leading-loose">
            {t('pubLitText1')}
          </p>
          <p className="text-base md:text-lg text-slate-700 font-urdu leading-loose">
            {language === 'ur' ? (
              <>
                مزید برآں، ہم ماہنامہ تحقیقی مجلہ <span className="font-semibold text-islamic-green">"ماہنامہ سنی دنیا"</span> شائع کرتے ہیں، جس میں علمی و تحقیقی مضامین اور عصر حاضر کے مسائل پر مبنی فتاویٰ شامل ہوتے ہیں۔
              </>
            ) : (
              <>
                Additionally, we publish the monthly research journal <span className="italic font-semibold text-islamic-green">"Monthly Sunni Duniya" Urdu Magazine</span>, containing peer-reviewed research papers and contemporary Fatwas addressing current affairs.
              </>
            )}
          </p>
        </div>
        <div className="bg-gradient-to-br from-islamic-green/10 to-islamic-gold/10 p-6 md:p-8 rounded-xl border border-islamic-gold/20 flex flex-col justify-between">
          <div>
            <h4 className="font-semibold text-islamic-green text-lg md:text-xl font-urdu flex items-center space-x-1.5 rtl:space-x-reverse">
              <Book className="w-5 h-5 text-islamic-gold flex-shrink-0" />
              <span>{t('pubBookstoreTitle')}</span>
            </h4>
            <p className="text-sm md:text-base text-slate-600 mt-3 font-urdu leading-relaxed">
              {t('pubBookstoreText')}
            </p>
          </div>
          <div className="text-sm md:text-base font-semibold text-islamic-gold flex items-center space-x-1.5 rtl:space-x-reverse mt-6 border-t border-stone-200/60 pt-4 font-urdu">
            <span>{t('pubComingSoon')}</span>
            <ArrowRight className="w-4 h-4 text-islamic-gold rtl:rotate-180" />
          </div>
        </div>
      </section>

      {/* Catalog Search & Filters */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 space-y-5">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow space-y-1.5 w-full">
            <label className="text-sm md:text-base font-semibold text-slate-700 font-urdu">{t('pubSearchLabel')}</label>
            <div className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('pubSearchPlaceholder')}
                className="w-full border border-stone-300 rounded-lg px-3 py-2.5 pl-9 text-base md:text-lg font-urdu focus:outline-none focus:border-islamic-gold"
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
            </div>
          </div>
          <div className="w-full md:w-52 space-y-1.5">
            <label className="text-sm md:text-base font-semibold text-slate-700 font-urdu">{t('pubTypeLabel')}</label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-base md:text-lg font-urdu bg-white focus:outline-none focus:border-islamic-gold"
            >
              <option value="all">{t('pubAllTypes')}</option>
              <option value="BOOK">{t('pubBooks')}</option>
              <option value="MAGAZINE">{t('pubMagazines')}</option>
              <option value="RESEARCH_PAPER">{t('pubResearchPapers')}</option>
            </select>
          </div>
          <div className="w-full md:w-52 space-y-1.5">
            <label className="text-sm md:text-base font-semibold text-slate-700 font-urdu">{t('pubCategoryLabel')}</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-base md:text-lg font-urdu bg-white focus:outline-none focus:border-islamic-gold"
            >
              <option value="all">{t('pubAllCategories')}</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Catalog List */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-base md:text-lg font-urdu">{t('pubLoadingCatalog')}</div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-base md:text-lg font-urdu border border-dashed border-stone-300 rounded-lg">
            {t('pubNoResults')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {books.map((book) => (
              <div key={book.id} className="bg-stone-50 rounded-lg p-5 border border-stone-200 flex flex-col justify-between hover:border-islamic-gold transition-colors">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-semibold text-slate-400 font-urdu">
                    <span>{book.category}</span>
                    <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 rounded text-sm font-urdu font-normal">
                      {getTypeLabel(book.type)}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-lg md:text-xl font-urdu leading-snug">
                    {book.title}
                  </h4>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed font-urdu">
                    {book.description || (language === 'ur' ? 'اس جلد کے لیے کوئی تفصیل دستیاب نہیں ہے۔' : 'No description available for this volume.')}
                  </p>
                  <p className="text-sm text-slate-400 font-urdu">
                    {language === 'ur' ? 'تاریخِ اشاعت: ' : 'Published: '}{formatDateSafe(book.publishedDate, language)}
                  </p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-stone-200 flex justify-end">
                  <a 
                    href={book.downloadUrl || '#'} 
                    onClick={() => alert(t('pubDownloadingMsg'))}
                    className="px-4 py-2 bg-islamic-green hover:bg-islamic-darkGreen text-white text-sm md:text-base font-normal font-urdu rounded-md shadow transition-colors flex items-center space-x-1.5 rtl:space-x-reverse"
                  >
                    <Download className="w-4 h-4 text-islamic-gold" />
                    <span>{t('pubDownloadPdf')}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
