"use client";

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert("Please fill all required fields.");
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
        <h2 className="text-2xl md:text-3xl font-bold font-urdu text-islamic-gold">
          {t('navContact')}
        </h2>
        <p className="text-xs md:text-sm text-stone-300 mt-2">
          Get in touch with the administrative office of Markazi Darul Ifta Bareilly Shareef.
        </p>
      </section>

      {/* Info Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-islamic-gold/10 text-islamic-gold flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Address</h4>
          <div className="text-[10px] text-slate-500 leading-relaxed text-center space-y-2">
            <div><strong>Address 1:</strong> No 82, Dargah Aala Hazrat, Saudagaran, Bareilly Shareef India</div>
            <div><strong>Address 2:</strong> Center of Islamic Studies Jamiatur Raza, Mathurapur, C B Ganj, Bareilly Shareef India</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-islamic-gold/10 text-islamic-gold flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Phone & WhatsApp</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-mono">
            +91 9411699786 <br />
            +91 9411699786 (WhatsApp)
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-islamic-gold/10 text-islamic-gold flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Email</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            askmuftijamiaturraza@gmail.com
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-islamic-gold/10 text-islamic-gold flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Office Hours</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Saturday - Thursday: 9:00 AM - 5:00 PM <br />
            <span className="text-red-500 font-semibold">(Friday Closed)</span>
          </p>
        </div>
      </section>

      {/* Map & Form Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Form */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-lg">Send us a Message</h3>
          <p className="text-xs text-slate-500">For general administrative inquiries, feedback, or publication requests.</p>
          
          {success && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-4 rounded flex items-center space-x-2 rtl:space-x-reverse">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Your message has been sent successfully. We will respond shortly!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Your Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-stone-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-islamic-gold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Email Address <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-stone-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-islamic-gold"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Subject</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-stone-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-islamic-gold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Message <span className="text-red-500">*</span></label>
              <textarea 
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-stone-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-islamic-gold font-urdu"
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="px-5 py-2 bg-islamic-green hover:bg-islamic-darkGreen text-white text-xs font-bold rounded shadow transition-colors flex items-center space-x-1.5 rtl:space-x-reverse"
              >
                <Send className="w-3.5 h-3.5 text-islamic-gold" />
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Map Mockup */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4 h-full flex flex-col">
          <h3 className="font-bold text-slate-800 text-lg">Office Location</h3>
          <p className="text-xs text-slate-500">Located near the holy shrine (Dargah) of Aala Hazrat Imam Ahmad Raza Khan in Bareilly.</p>
          <div className="flex-grow bg-stone-100 border border-stone-200 rounded-lg min-h-[250px] flex items-center justify-center relative overflow-hidden">
            {/* Visual representation of map */}
            <div className="absolute inset-0 bg-cover opacity-60 bg-center" style={{ backgroundImage: `radial-gradient(#c29b38 1px, transparent 0), radial-gradient(#064e3b 1px, transparent 0)`, backgroundSize: '20px 20px' }}></div>
            <div className="relative z-10 text-center p-4 bg-white/90 backdrop-blur rounded border border-islamic-gold/30 shadow-md max-w-xs space-y-2">
              <MapPin className="w-8 h-8 text-islamic-gold mx-auto" />
              <h4 className="font-bold text-xs text-slate-800">Markazi Darul Ifta</h4>
              <p className="text-[10px] text-slate-500 font-urdu">سوداگران، بریلی شریف، اتر پردیش، انڈیا</p>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-islamic-green hover:underline font-bold block"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
