"use client";

import React, { useState, useEffect } from 'react';
import { getFatwaDetails } from '../../actions/public';
import { Clock, Tag, Printer, ArrowLeft, BookOpen, User, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function FatwaDetails({ params }: { params: { id: string } }) {
  const { language } = useLanguage();
  const [fatwa, setFatwa] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hijriOffset, setHijriOffset] = useState(0);
  const [selectedPrintLanguage, setSelectedPrintLanguage] = useState<'ur' | 'en' | 'both'>('ur');

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

  const getHijriDateString = (dateVal: string | Date, langMode: 'ur' | 'en' = language) => {
    try {
      const d = new Date(dateVal);
      d.setDate(d.getDate() + hijriOffset);
      const formatter = new Intl.DateTimeFormat(
        langMode === 'ur' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US-u-ca-islamic-umalqura', 
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

  const getGregorianDateString = (dateVal: string | Date, langMode: 'ur' | 'en' = language) => {
    try {
      const d = new Date(dateVal);
      if (langMode === 'ur') {
        return d.toLocaleDateString('ur-PK', { day: 'numeric', month: 'long', year: 'numeric' });
      }
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
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

  const handleTriggerPrint = (mode: 'ur' | 'en' | 'both') => {
    setSelectedPrintLanguage(mode);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.print();
      }
    }, 150);
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

  const createdDate = fatwa.publishedAt || fatwa.createdAt;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none">
      
      {/* On-Screen Action Toolbar (Hidden during print) */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
        <Link 
          href="/" 
          className="flex items-center space-x-1.5 rtl:space-x-reverse text-xs text-slate-500 hover:text-islamic-green font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'en' ? 'Back to Search Archive' : 'آرکائیو پر واپس جائیں'}</span>
        </Link>

        {/* Print Buttons Options */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse flex-wrap justify-center">
          <span className="text-xs font-bold text-slate-600 mr-1">
            {language === 'en' ? 'Print Options:' : 'پرنٹ کا انتخاب:'}
          </span>

          <button 
            onClick={() => handleTriggerPrint('ur')}
            className="px-3 py-1.5 bg-islamic-green hover:bg-islamic-darkGreen text-white rounded text-xs font-bold shadow flex items-center space-x-1 rtl:space-x-reverse transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-islamic-gold" />
            <span>پرنٹ اردو فتویٰ (Urdu)</span>
          </button>

          <button 
            onClick={() => handleTriggerPrint('en')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold shadow flex items-center space-x-1 rtl:space-x-reverse transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-islamic-gold" />
            <span>Print English Fatwa</span>
          </button>

          <button 
            onClick={() => handleTriggerPrint('both')}
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-bold shadow flex items-center space-x-1 rtl:space-x-reverse transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-islamic-gold" />
            <span>{language === 'en' ? 'Print Both (2 Pages)' : 'دو صفحات پرنٹ کریں'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ON-SCREEN INTERACTIVE VIEW / URDU SHEET VIEW (When not in English print) */}
      {/* ========================================================================= */}
      <article 
        dir="rtl"
        className={`bg-white rounded-xl border border-stone-200 shadow-lg p-6 md:p-10 space-y-8 relative overflow-hidden print:border-0 print:shadow-none print:p-0 text-right font-urdu ${
          selectedPrintLanguage === 'en' ? 'print:hidden' : 'block'
        }`}
      >
        
        {/* Certificate Stamp Emblem (Watermark) */}
        <div className="absolute top-6 left-6 opacity-5 print:opacity-10 pointer-events-none w-28 h-28 border-4 border-double border-islamic-gold rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold font-urdu text-islamic-gold">مفتی</span>
        </div>

        {/* Clean Document Print Header (Text-based as requested) */}
        <div className="border-b-2 border-double border-islamic-gold/40 pb-6 text-center space-y-2">
          <div className="text-xs uppercase font-bold text-islamic-gold tracking-widest font-sans">
            Official Islamic Ruling (الاستفتاء)
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-islamic-green font-urdu">
            {language === 'en' ? 'Markazi Darul Ifta, Bareilly Shareef' : 'مرکزی دارالافتاء، بریلی شریف'}
          </h1>
          <p className="text-xs text-stone-500 font-urdu">
            {language === 'en'
              ? 'Under Dargah Aala Hazrat Imam Ahmad Raza Khan Al-Qadri, Saudagaran, Bareilly (UP), India'
              : 'زیر اہتمام درگاہ اعلیٰ حضرت امام احمد رضا خان القادری، سوداگران، بریلی شریف (یو پی) انڈیا'
            }
          </p>
          
          {/* Detailed Print Metadata Bar (Fatwa No, Hijri Date, Gregorian Date, Views) */}
          <div className="flex justify-center items-center gap-3 md:gap-5 text-xs text-slate-600 pt-3 flex-wrap border-t border-stone-100 mt-2">
            <span><strong>فتویٰ نمبر (Fatwa No):</strong> <span className="font-mono">{fatwa.fatwaNumber}</span></span>
            <span>•</span>
            <span><strong>ہجری تاریخ (Hijri):</strong> <span className="font-urdu">{getHijriDateString(createdDate, 'ur')}</span></span>
            <span>•</span>
            <span><strong>عیسوی تاریخ (Date):</strong> <span className="font-sans">{getGregorianDateString(createdDate, 'en')}</span></span>
            <span>•</span>
            <span className="flex items-center space-x-1"><Eye className="w-3.5 h-3.5 text-islamic-gold mr-0.5" /><span>{fatwa.views} {language === 'en' ? 'views' : 'مشاہدات'}</span></span>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-lg border border-stone-200/50 text-xs text-slate-600">
          <div>
            <strong>زمرہ (Category):</strong> {fatwa.category?.nameUr} ({fatwa.category?.nameEn})
          </div>
          <div>
            <strong>ذیلی زمرہ (Sub-Category):</strong> {fatwa.subCategory?.nameUr} ({fatwa.subCategory?.nameEn})
          </div>
          <div>
            <strong>فقہ (Jurisprudence):</strong> <span className="font-urdu">فقہ حنفی (مستند دارالافتاء)</span>
          </div>
          <div>
            <strong>جواب بحوالہ (Mufti Answerer):</strong> <span className="font-urdu">{fatwa.answeredBy?.nameUr}</span>
          </div>
        </div>

        {/* Question Section */}
        <div className="space-y-3 print-avoid-break">
          <h3 className="text-sm font-bold uppercase tracking-wider text-islamic-gold border-r-2 border-islamic-gold pr-2 font-urdu">
            الاستفتاء (سوال)
          </h3>
          <div className="bg-stone-50 p-5 rounded-lg border border-stone-100 italic text-slate-800 leading-relaxed font-urdu text-base md:text-lg">
            "{fatwa.question?.questionText || 'تفصیلات دستیاب نہیں۔'}"
          </div>
          <div className="text-[11px] text-slate-400 font-urdu">
            مستفتی (سائل): <strong>{fatwa.question?.name || 'گمنام سائل'}</strong> ({fatwa.question?.city || 'نامعلوم شہر'})
          </div>
        </div>

        {/* Urdu Answer Section */}
        <div className="space-y-4 print-avoid-break">
          <h3 className="text-sm font-bold uppercase tracking-wider text-islamic-gold border-r-2 border-islamic-gold pr-2 font-urdu">
            الجواب بعون الملک الوہاب (اردو فتویٰ)
          </h3>
          
          <div className="bg-emerald-50/10 p-6 rounded-lg border border-emerald-500/10 space-y-4">
            <p className="text-lg md:text-xl font-urdu text-slate-900 leading-loose text-justify whitespace-pre-wrap font-semibold">
              {fatwa.answerUr}
            </p>
          </div>
        </div>

        {/* References Section */}
        {fatwa.references && fatwa.references.length > 0 && (
          <div className="space-y-3 border-t border-stone-200 pt-6 print-avoid-break">
            <h3 className="text-sm font-bold uppercase tracking-wider text-islamic-gold flex items-center space-x-2 font-urdu">
              <BookOpen className="w-4 h-4" />
              <span>مآخذ و مراجع (Theological References)</span>
            </h3>
            <div className="space-y-2">
              {fatwa.references.map((ref: any) => (
                <div key={ref.id} className="bg-stone-50/50 p-4 rounded border border-stone-200/40 text-xs text-slate-700 space-y-1">
                  <div className="flex justify-between items-center flex-wrap gap-1 font-semibold font-urdu text-slate-800">
                    <span>کتاب: {ref.bookTitle}</span>
                    <span>قسم: {ref.type}</span>
                  </div>
                  {ref.volume && ref.page && (
                    <div className="font-mono text-[10px] text-slate-500">
                      جلد {ref.volume}، صفحہ {ref.page} (Vol. {ref.volume}, Pg {ref.page})
                    </div>
                  )}
                  <p className="italic font-urdu text-slate-800 leading-relaxed mt-1 text-sm">
                    {ref.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attestation Stamps & Signature Section */}
        <div className="border-t border-stone-200 pt-8 mt-12 grid grid-cols-2 gap-4 text-center text-xs print-avoid-break">
          <div className="space-y-6">
            <div className="font-bold text-slate-800 font-urdu text-sm">الجواب صحیح</div>
            <div className="w-28 h-14 border border-stone-300 rounded mx-auto flex items-center justify-center text-[10px] text-stone-400 italic font-urdu">
              مہر دارالافتاء
            </div>
            <div className="font-urdu text-slate-600 font-semibold">دارالافتاء بورد، بریلی شریف</div>
          </div>
          <div className="space-y-6">
            <div className="font-bold text-slate-800 font-urdu text-sm">کاتبُہ (مفتیِ جواب دہندہ)</div>
            <div className="font-urdu font-bold text-islamic-green text-base">
              {fatwa.answeredBy?.nameUr}
            </div>
            <div className="text-slate-500 text-[10px] font-mono">
              ملازم نمبر: {fatwa.answeredBy?.employeeId}
            </div>
          </div>
        </div>

      </article>

      {/* ========================================================================= */}
      {/* 2. ENGLISH FATWA PRINT SHEET (With Required Translation Declaration) */}
      {/* ========================================================================= */}
      <article 
        dir="ltr"
        className={`bg-white rounded-xl border border-stone-200 shadow-lg p-6 md:p-10 space-y-8 relative overflow-hidden print:border-0 print:shadow-none print:p-0 text-left font-sans ${
          selectedPrintLanguage === 'en' 
            ? 'block' 
            : selectedPrintLanguage === 'both' 
              ? 'block print:break-before-page mt-12' 
              : 'hidden print:hidden'
        }`}
      >
        
        {/* Document Header */}
        <div className="border-b-2 border-double border-islamic-gold/40 pb-6 text-center space-y-2">
          <div className="text-xs uppercase font-bold text-islamic-gold tracking-widest font-sans">
            Official Islamic Ruling (English Translation)
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-islamic-green font-sans">
            Markazi Darul Ifta, Bareilly Shareef
          </h1>
          <p className="text-xs text-stone-500 font-sans">
            Under Dargah Aala Hazrat Imam Ahmad Raza Khan Al-Qadri, Saudagaran, Bareilly (UP), India
          </p>
          
          {/* Detailed Print Metadata Bar (Fatwa No, Hijri Date, Gregorian Date, Views) */}
          <div className="flex justify-center items-center gap-3 md:gap-5 text-xs text-slate-600 pt-3 flex-wrap border-t border-stone-100 mt-2 font-mono">
            <span><strong>Fatwa No:</strong> {fatwa.fatwaNumber}</span>
            <span>•</span>
            <span><strong>Hijri Date:</strong> {getHijriDateString(createdDate, 'en')}</span>
            <span>•</span>
            <span><strong>Normal Date:</strong> {getGregorianDateString(createdDate, 'en')}</span>
            <span>•</span>
            <span className="flex items-center space-x-1"><Eye className="w-3.5 h-3.5 text-islamic-gold mr-0.5" /><span>{fatwa.views} views</span></span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* MANDATORY DECLARATION / DISCLAIMER BOX FOR ENGLISH VERSION */}
        {/* ===================================================================== */}
        <div className="bg-amber-50 border-2 border-amber-400/90 rounded-lg p-4 text-center space-y-2 print-avoid-break shadow-sm">
          <div className="flex items-center justify-center space-x-1.5 text-amber-900 font-bold text-xs uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>MANDATORY TRANSLATION NOTICE / ضروری اعلانیہ</span>
          </div>
          <p className="text-xs md:text-sm text-amber-900 font-bold leading-relaxed px-2">
            "Please match the fatwa with urdu version, English version is only translation and may be with some issue of understanding. So please consider Urdu fatwa as authentic Fatwa."
          </p>
          <p className="text-xs text-amber-900 font-urdu pt-1">
            "برائے مہربانی اس فتوے کو اردو ورژن سے ملا لیں۔ انگریزی ورژن صرف ترجمہ ہے اور فہم میں بعض مسائل ہو سکتے ہیں۔ لہٰذا اردو فتوے کو ہی مستند فتویٰ تصور کریں۔"
          </p>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-lg border border-stone-200/50 text-xs text-slate-600 font-sans">
          <div>
            <strong>Category:</strong> {fatwa.category?.nameEn}
          </div>
          <div>
            <strong>Sub-Category:</strong> {fatwa.subCategory?.nameEn}
          </div>
          <div>
            <strong>Jurisprudence:</strong> Hanafi School of Islamic Law (Bareilly Shareef)
          </div>
          <div>
            <strong>Reviewed & Approved By:</strong> {fatwa.answeredBy?.nameEn}
          </div>
        </div>

        {/* English Question Section */}
        <div className="space-y-3 print-avoid-break">
          <h3 className="text-sm font-bold uppercase tracking-wider text-islamic-gold border-l-2 border-islamic-gold pl-2">
            The Question Details
          </h3>
          <div className="bg-stone-50 p-5 rounded-lg border border-stone-100 italic text-slate-800 leading-relaxed text-sm md:text-base">
            "{fatwa.question?.questionText || 'Question details not available.'}"
          </div>
          <div className="text-[11px] text-slate-500">
            Submitted by: <strong>{fatwa.question?.name || 'Anonymous'}</strong> ({fatwa.question?.city || 'Unknown City'})
          </div>
        </div>

        {/* English Answer Section */}
        <div className="space-y-4 print-avoid-break">
          <h3 className="text-sm font-bold uppercase tracking-wider text-islamic-gold border-l-2 border-islamic-gold pl-2">
            The English Ruling (Translated Text)
          </h3>
          
          <div className="bg-stone-50 p-6 rounded-lg border border-stone-200/60 space-y-4">
            <p className="text-sm md:text-base text-slate-800 leading-relaxed text-justify whitespace-pre-wrap font-sans">
              {fatwa.answerEn}
            </p>
          </div>
        </div>

        {/* References Section */}
        {fatwa.references && fatwa.references.length > 0 && (
          <div className="space-y-3 border-t border-stone-200 pt-6 print-avoid-break">
            <h3 className="text-sm font-bold uppercase tracking-wider text-islamic-gold flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Theological References</span>
            </h3>
            <div className="space-y-2">
              {fatwa.references.map((ref: any) => (
                <div key={ref.id} className="bg-stone-50/50 p-4 rounded border border-stone-200/40 text-xs text-slate-700 space-y-1">
                  <div className="flex justify-between items-center flex-wrap gap-1 font-semibold text-slate-800">
                    <span>Reference Book: {ref.bookTitle}</span>
                    <span>Type: {ref.type}</span>
                  </div>
                  {ref.volume && ref.page && (
                    <div className="font-mono text-[10px] text-slate-500">
                      Vol. {ref.volume}, Page {ref.page}
                    </div>
                  )}
                  <p className="italic text-slate-800 leading-relaxed mt-1 text-xs">
                    {ref.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attestation Stamps & Signature Section */}
        <div className="border-t border-stone-200 pt-8 mt-12 grid grid-cols-2 gap-4 text-center text-xs print-avoid-break">
          <div className="space-y-6">
            <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">Al-Jawab As-Sahih (Correct Ruling)</div>
            <div className="w-28 h-14 border border-stone-300 rounded mx-auto flex items-center justify-center text-[10px] text-stone-400 italic">
              Verification Stamp
            </div>
            <div className="text-slate-600 font-semibold text-xs">Darul Ifta Scholars Board</div>
          </div>
          <div className="space-y-6">
            <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">Katibuhu (Answered By)</div>
            <div className="font-bold text-islamic-green text-sm">
              {fatwa.answeredBy?.nameEn}
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
