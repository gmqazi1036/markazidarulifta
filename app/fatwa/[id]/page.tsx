"use client";

import React, { useState, useEffect } from 'react';
import { getFatwaDetails } from '../../actions/public';
import { Clock, Tag, Printer, ArrowLeft, BookOpen, User, Eye, Landmark } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function FatwaDetails({ params }: { params: { id: string } }) {
  const { language } = useLanguage();
  const [fatwa, setFatwa] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hijriOffset, setHijriOffset] = useState(0);

  useEffect(() => {
    async function loadOffset() {
      try {
        const { getGlobalHijriOffset } = await import('../../actions/public');
        const offset = await getGlobalHijriOffset();
        setHijriOffset(offset);
      } catch (e) {
        console.error(e);
      }
    }
    loadOffset();
  }, []);

  const getHijriDateString = (dateVal: string | Date) => {
    try {
      const d = new Date(dateVal);
      d.setDate(d.getDate() + hijriOffset);
      const formatter = new Intl.DateTimeFormat(
        language === 'ur' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US-u-ca-islamic-umalqura', 
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }
      );
      return formatter.format(d);
    } catch (e) {
      return new Date(dateVal).toLocaleDateString();
    }
  };

  useEffect(() => {
    async function loadFatwa() {
      setLoading(true);
      const res = await getFatwaDetails(params.id);
      if (res.success && res.data) {
        setFatwa(res.data);
      } else {
        setError(res.error || 'Fatwa not found');
      }
      setLoading(false);
    }
    loadFatwa();
  }, [params.id]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500 text-sm">Loading Fatwa details...</div>;
  }

  if (error || !fatwa) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-red-500 font-bold">{error || 'Fatwa not found'}</p>
        <Link href="/" className="text-xs text-islamic-green hover:underline">
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in print:shadow-none print:border-none print:p-0">
      {/* Back button & Action Toolbar */}
      <div className="flex justify-between items-center print:hidden">
        <Link 
          href="/" 
          className="flex items-center space-x-1.5 rtl:space-x-reverse text-xs text-slate-500 hover:text-islamic-green font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search Archive</span>
        </Link>

        <button 
          onClick={handlePrint}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold shadow flex items-center space-x-1.5 rtl:space-x-reverse transition-colors"
        >
          <Printer className="w-4 h-4 text-islamic-gold" />
          <span>Print Fatwa Document</span>
        </button>
      </div>

      {/* Main Fatwa Sheet */}
      <article className="bg-white rounded-xl border border-stone-200 shadow-lg p-6 md:p-10 space-y-8 relative overflow-hidden print:border-0 print:shadow-none">
        
        {/* Certificate Emblem (Absolute positioned for premium look) */}
        <div className="absolute top-6 right-6 opacity-5 print:opacity-10 pointer-events-none w-28 h-28 border-4 border-double border-islamic-gold rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold font-urdu text-islamic-gold">مفتی</span>
        </div>

        {/* Document Header (For print authenticity) */}
        <div className="border-b-2 border-double border-islamic-gold/40 pb-6 text-center space-y-2">
          <div className="text-xs uppercase font-bold text-islamic-gold tracking-widest">Official Islamic Ruling (الاستفتاء)</div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-islamic-green font-urdu">Markazi Darul Ifta, Bareilly Shareef</h1>
          <p className="text-xs text-stone-500">Under Dargah Aala Hazrat Imam Ahmad Raza Khan Al-Qadri, Saudagaran, Bareilly (UP), India</p>
          
          <div className="flex justify-center items-center gap-4 text-xs text-slate-500 pt-2 font-mono flex-wrap">
            <span><strong>Fatwa No:</strong> {fatwa.fatwaNumber}</span>
            <span>•</span>
            <span><strong>Hijri Date:</strong> {getHijriDateString(fatwa.publishedAt || fatwa.createdAt)}</span>
            <span>•</span>
            <span className="flex items-center space-x-1"><Eye className="w-3.5 h-3.5" /><span>{fatwa.views} views</span></span>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-lg border border-stone-200/50 text-xs text-slate-600">
          <div>
            <strong>Category:</strong> {fatwa.category?.nameEn} ({fatwa.category?.nameUr})
          </div>
          <div>
            <strong>Sub-Category:</strong> {fatwa.subCategory?.nameEn} ({fatwa.subCategory?.nameUr})
          </div>
          <div>
            <strong>Jurisprudence:</strong> Fiqh Hanafi (Hanafi School)
          </div>
          <div>
            <strong>Mufti Answerer:</strong> {fatwa.answeredBy?.nameEn} ({fatwa.answeredBy?.nameUr})
          </div>
        </div>

        {/* 1. Question Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-islamic-gold border-l-2 border-islamic-gold pl-2 rtl:border-l-0 rtl:border-r-2 rtl:border-islamic-gold rtl:pl-0 rtl:pr-2">
            The Question / سوال
          </h3>
          <div className="bg-stone-50 p-5 rounded-lg border border-stone-100 italic text-slate-700 leading-relaxed font-urdu text-sm md:text-base">
            "{fatwa.question?.questionText || 'Details not available.'}"
          </div>
          <div className="text-[10px] text-slate-400">
            Submitted by: <strong>{fatwa.question?.name || 'Anonymous'}</strong> ({fatwa.question?.city || 'Unknown City'})
          </div>
        </div>

        {/* 2. Answer Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-islamic-gold border-l-2 border-islamic-gold pl-2 rtl:border-l-0 rtl:border-r-2 rtl:border-islamic-gold rtl:pl-0 rtl:pr-2">
            The Answer / جواب
          </h3>
          
          {/* Urdu Answer (Arabic / Urdu text gets priority in readability) */}
          <div className="bg-emerald-50/10 p-6 rounded-lg border border-emerald-500/10 space-y-4">
            <h4 className="font-bold text-xs text-islamic-green uppercase tracking-wider">Urdu Ruling (الجواب بعون الملک الوھاب)</h4>
            <p className="text-base md:text-xl font-urdu text-slate-800 leading-loose text-justify whitespace-pre-wrap select-all font-semibold">
              {fatwa.answerUr}
            </p>
          </div>

          {/* English Answer */}
          <div className="bg-stone-50/40 p-6 rounded-lg border border-stone-200/50 space-y-3">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">English Translation</h4>
            <p className="text-sm md:text-base text-slate-700 leading-relaxed text-justify whitespace-pre-wrap">
              {fatwa.answerEn}
            </p>
          </div>
        </div>

        {/* 3. References Section */}
        {fatwa.references && fatwa.references.length > 0 && (
          <div className="space-y-3 border-t border-stone-200 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-islamic-gold flex items-center space-x-2 rtl:space-x-reverse">
              <BookOpen className="w-4 h-4" />
              <span>Theological References / مآخذ و مراجع</span>
            </h3>
            <div className="space-y-2">
              {fatwa.references.map((ref: any, idx: number) => (
                <div key={ref.id} className="bg-stone-50/50 p-4 rounded border border-stone-200/40 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between items-center flex-wrap gap-1 font-semibold text-slate-800">
                    <span>Reference Book: {ref.bookTitle}</span>
                    <span>Type: {ref.type}</span>
                  </div>
                  {ref.volume && ref.page && (
                    <div className="font-mono text-[10px]">
                      Vol. {ref.volume}, Page {ref.page}
                    </div>
                  )}
                  <p className="italic font-urdu text-slate-700 leading-relaxed mt-1 text-sm">
                    {ref.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attestation Stamps/Footer */}
        <div className="border-t border-stone-200 pt-8 mt-12 grid grid-cols-2 gap-4 text-center text-xs">
          <div className="space-y-6">
            <div className="font-bold text-slate-800">Al-Jawab As-Sahih</div>
            <div className="w-24 h-12 border border-stone-300 rounded mx-auto flex items-center justify-center text-[10px] text-stone-400 italic">
              Verification Stamp
            </div>
            <div className="font-urdu text-slate-500 font-semibold">دارالافتاء بورد</div>
          </div>
          <div className="space-y-6">
            <div className="font-bold text-slate-800">Katibuhu (Answered By)</div>
            <div className="font-urdu font-bold text-islamic-green text-sm">
              {fatwa.answeredBy?.nameUr}
            </div>
            <div className="text-slate-500 text-[10px] font-mono">
              Emp ID: {fatwa.answeredBy?.employeeId}
            </div>
          </div>
        </div>

      </article>
    </div>
  );
}
