"use client";

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const { language, t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert(language === 'ur' ? "براہ کرم تمام ضروری خانوں کو پر کریں۔" : "Please fill all required fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-islamic-green to-islamic-darkGreen text-white p-8 rounded-xl border-b border-islamic-gold shadow-md">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium font-urdu text-islamic-gold leading-normal">
          {t('navContact')}
        </h2>
        <p className="text-base md:text-lg text-stone-200 mt-3 font-urdu leading-relaxed font-normal">
          {t('contactSubtitle')}
        </p>
      </section>

      {/* Info Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-islamic-gold/10 text-islamic-gold flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h4 className="font-medium text-slate-800 text-base md:text-lg font-urdu">{t('contactAddressTitle')}</h4>
          <div className="text-xs md:text-sm text-slate-600 leading-relaxed text-center space-y-2 font-urdu font-normal">
            <div><strong className="font-medium text-slate-800">{t('contactAddr1Lbl')}</strong> {t('contactAddr1Txt')}</div>
            <div><strong className="font-medium text-slate-800">{t('contactAddr2Lbl')}</strong> {t('contactAddr2Txt')}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-islamic-gold/10 text-islamic-gold flex items-center justify-center">
            <Phone className="w-6 h-6" />
          </div>
          <h4 className="font-medium text-slate-800 text-base md:text-lg font-urdu">{t('contactPhoneTitle')}</h4>
          {/* Bi-Directional Isolation (<bdi dir="ltr">) forces +91 to stay on the left of mobile number */}
          <div className="text-sm md:text-base text-slate-800 font-sans font-medium tracking-wide text-center space-y-1">
            <p className="hover:text-islamic-green transition-colors">
              <bdi dir="ltr" className="inline-block" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>+91 9058879712</bdi>
            </p>
            <p className="hover:text-islamic-green transition-colors">
              <bdi dir="ltr" className="inline-block" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>0581-2458543</bdi>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-islamic-gold/10 text-islamic-gold flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <h4 className="font-medium text-slate-800 text-base md:text-lg font-urdu">{t('contactEmailTitle')}</h4>
          <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-sans">
            askmuftijamiaturraza@gmail.com
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-islamic-gold/10 text-islamic-gold flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h4 className="font-medium text-slate-800 text-base md:text-lg font-urdu">{t('contactHoursTitle')}</h4>
          <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-urdu font-normal">
            {t('contactHoursTxt')} <br />
            <span className="text-red-600 font-medium">{t('contactClosedTxt')}</span>
          </p>
        </div>
      </section>

      {/* Map & Form Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Form */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-stone-200 shadow-sm space-y-5">
          <h3 className="font-medium text-slate-800 text-xl md:text-2xl font-urdu">{t('contactFormTitle')}</h3>
          <p className="text-xs md:text-sm text-slate-600 font-urdu font-normal">{t('contactFormSubtitle')}</p>
          
          {success && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs md:text-sm p-4 rounded-lg flex items-center space-x-2 rtl:space-x-reverse font-urdu font-normal">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{t('contactSuccessMsg')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-medium text-slate-700 font-urdu">{t('contactLblName')} <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm md:text-base font-urdu focus:outline-none focus:border-islamic-gold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-medium text-slate-700 font-urdu">{t('contactLblEmail')} <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm md:text-base font-urdu focus:outline-none focus:border-islamic-gold"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs md:text-sm font-medium text-slate-700 font-urdu">{t('contactLblSubject')}</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm md:text-base font-urdu focus:outline-none focus:border-islamic-gold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs md:text-sm font-medium text-slate-700 font-urdu">{t('contactLblMessage')} <span className="text-red-500">*</span></label>
              <textarea 
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm md:text-base font-urdu focus:outline-none focus:border-islamic-gold leading-relaxed"
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2.5 bg-islamic-green hover:bg-islamic-darkGreen text-white text-xs md:text-sm font-normal font-urdu rounded-md shadow transition-colors flex items-center space-x-1.5 rtl:space-x-reverse"
              >
                <Send className="w-4 h-4 text-islamic-gold" />
                <span>{loading ? t('contactBtnSending') : t('contactBtnSend')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Map Mockup */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-stone-200 shadow-sm space-y-4 h-full flex flex-col">
          <h3 className="font-medium text-slate-800 text-xl md:text-2xl font-urdu">{t('contactLocationTitle')}</h3>
          <p className="text-xs md:text-sm text-slate-600 font-urdu font-normal">{t('contactLocationSub')}</p>
          <div className="flex-grow bg-stone-100 border border-stone-200 rounded-lg min-h-[250px] flex items-center justify-center relative overflow-hidden">
            {/* Visual representation of map */}
            <div className="absolute inset-0 bg-cover opacity-60 bg-center" style={{ backgroundImage: `radial-gradient(#c29b38 1px, transparent 0), radial-gradient(#064e3b 1px, transparent 0)`, backgroundSize: '20px 20px' }}></div>
            <div className="relative z-10 text-center p-5 bg-white/95 backdrop-blur rounded-xl border border-islamic-gold/30 shadow-md max-w-xs space-y-2">
              <MapPin className="w-8 h-8 text-islamic-gold mx-auto" />
              <h4 className="font-medium text-sm md:text-base text-slate-800 font-urdu">{t('brandName')}</h4>
              <p className="text-xs md:text-sm text-slate-600 font-urdu font-normal">{t('contactLocationAddress')}</p>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs md:text-sm text-islamic-green hover:underline font-normal font-urdu block pt-1"
              >
                {t('contactOpenMaps')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
