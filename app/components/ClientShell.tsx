"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage, LanguageProvider } from '../context/LanguageContext';
import { Globe, BookOpen, MapPin, Info, Home as HomeIcon, LogIn, LogOut, CheckCircle, User } from 'lucide-react';
import { getMe, UserSession } from '../actions/auth';
import { getGlobalHijriOffset } from '../actions/public';

const TasbeehIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="4" r="1.2" fill="currentColor" />
    <circle cx="15.5" cy="5.2" r="1.2" fill="currentColor" />
    <circle cx="18" cy="8" r="1.2" fill="currentColor" />
    <circle cx="18.5" cy="11.5" r="1.2" fill="currentColor" />
    <circle cx="17" cy="15" r="1.2" fill="currentColor" />
    <circle cx="14" cy="17.5" r="1.2" fill="currentColor" />
    <circle cx="10" cy="17.5" r="1.2" fill="currentColor" />
    <circle cx="7" cy="15" r="1.2" fill="currentColor" />
    <circle cx="5.5" cy="11.5" r="1.2" fill="currentColor" />
    <circle cx="6" cy="8" r="1.2" fill="currentColor" />
    <circle cx="8.5" cy="5.2" r="1.2" fill="currentColor" />
    <path d="M12 18.7v2.8" />
    <path d="M10 21.5l2 2 2-2" />
  </svg>
);

const InnerShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, setLanguage, t, isRtl } = useLanguage();
  const pathname = usePathname();

  const [hijriOffset, setHijriOffset] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const s = await getMe();
        setSession(s);
      } catch (e) {
        console.error(e);
      }
    }
    fetchSession();
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    async function loadOffset() {
      try {
        const offset = await getGlobalHijriOffset();
        setHijriOffset(offset);
      } catch (e) {
        console.error(e);
      }
    }
    loadOffset();
  }, [pathname]);

  const getHijriDateString = () => {
    try {
      const d = new Date();
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
      return '';
    }
  };

  const isLinkActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  const navItems = [
    { nameKey: 'navHome', href: '/', icon: HomeIcon },
    { nameKey: 'navIntro', href: '/introduction', icon: Info },
    { nameKey: 'navPublishing', href: '/publishing', icon: BookOpen },
    { nameKey: 'navWazaif', href: '/wazaif', icon: TasbeehIcon },
    { nameKey: 'navContact', href: '/contact', icon: MapPin }
  ];

  // Helper to check if currently in Mufti/Admin portal
  const isPortal = pathname.startsWith('/portal');

  return (
    <div className={`min-h-screen flex flex-col islamic-pattern ${isRtl ? 'font-urdu' : 'font-sans'}`}>
      
      {/* Top Bar Branding */}
      <div className="bg-stone-50 text-slate-600 py-2 px-4 text-xs md:text-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          
          <div className="flex items-center space-x-3 rtl:space-x-reverse flex-wrap justify-center sm:justify-start">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="inline-block w-2 h-2 rounded-full bg-islamic-gold animate-pulse"></span>
              <span>
                {language === 'en' ? (
                  <>Under the Aegis of <strong className="font-bold text-slate-800">Imam Ahmad Raza Trust</strong></>
                ) : (
                  <>زیر اہتمام <strong className="font-bold text-slate-800 font-urdu">امام احمد رضا ٹرسٹ</strong></>
                )}
              </span>
            </div>
            {mounted && pathname === '/' && (
              <>
                <span className="text-stone-300 hidden sm:inline">|</span>
                <div className={`flex items-center space-x-1.5 rtl:space-x-reverse ${
                  language === 'ur' 
                    ? 'text-sm sm:text-base font-bold text-slate-700 font-urdu' 
                    : 'text-slate-500 font-medium text-[11px] sm:text-xs'
                }`}>
                  <span>{getHijriDateString()}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Switcher */}
            <button 
              onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
              className="flex items-center space-x-1 rtl:space-x-reverse text-slate-600 hover:text-islamic-green transition-colors font-medium text-xs sm:text-sm"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>{language === 'en' ? 'اردو (Urdu)' : 'English'}</span>
            </button>

            {/* Portal Link */}
            {isPortal && (
              <Link 
                href="/portal/login" 
                className="flex items-center space-x-1 rtl:space-x-reverse text-slate-600 hover:text-islamic-green transition-colors font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Hero Header Banner */}
      <header className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto p-0">
          <Link href="/">
            <img 
              src="/mdi-hero-banner.webp" 
              alt="Markazi Darul Ifta Bareilly Sharif" 
              className="w-full h-auto object-contain block mx-auto"
            />
          </Link>
        </div>
      </header>

      {/* Sticky Navigation Menu */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-14">
            <div className="flex space-x-3 sm:space-x-6 md:space-x-8 rtl:space-x-reverse w-full justify-center md:justify-start">
              {navItems.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 transition-all ${
                      language === 'ur'
                        ? 'text-sm sm:text-base md:text-lg font-bold font-urdu'
                        : 'text-[11px] sm:text-sm font-medium'
                    } ${
                      active
                        ? 'border-islamic-gold text-islamic-green font-bold'
                        : 'border-transparent text-slate-600 hover:text-islamic-green hover:border-islamic-gold/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 ml-1 rtl:mr-1 rtl:ml-1 sm:rtl:ml-2" />
                    <span>{t(item.nameKey)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-islamic-darkGreen text-stone-200 border-t-4 border-islamic-gold py-12 px-4 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-islamic-gold mb-3">{t('brandName')}</h3>
            <p className="text-xs md:text-sm text-stone-300 leading-relaxed font-urdu">
              {t('trustName')}
            </p>
            <div className="text-xs text-stone-400 mt-3 space-y-2">
              <div><strong>Address 1:</strong> No 82, Dargah Aala Hazrat, Saudagaran, Bareilly Shareef India</div>
              <div><strong>Address 2:</strong> Center of Islamic Studies Jamiatur Raza, Mathurapur, C B Ganj, Bareilly Shareef India</div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-islamic-gold uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs md:text-sm text-stone-300">
              <li><Link href="/" className="hover:text-islamic-gold transition-colors">{t('navHome')}</Link></li>
              <li><Link href="/introduction" className="hover:text-islamic-gold transition-colors">{t('navIntro')}</Link></li>
              <li><Link href="/publishing" className="hover:text-islamic-gold transition-colors">{t('navPublishing')}</Link></li>
              <li><Link href="/contact" className="hover:text-islamic-gold transition-colors">{t('navContact')}</Link></li>
              <li><Link href="/wazaif" className="hover:text-islamic-gold transition-colors">{t('navWazaif')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-islamic-gold uppercase tracking-wider mb-3">Preservation & Authority</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Every Fatwa issued through Markazi Darul Ifta is reviewed and approved by certified Hanafi Muftis. The database is designed for permanent preservation, authentication, organization, and public dissemination.
            </p>
            <div className="flex items-center space-x-2 rtl:space-x-reverse mt-4 text-islamic-gold text-xs">
              <CheckCircle className="w-4 h-4" />
              <span>Certified Hanafi Jurisprudence (Bareilly Shareef)</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-islamic-gold/20 mt-8 pt-6 text-center text-xs text-stone-400 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} Markazi Darul Ifta, Bareilly Shareef. All Rights Reserved.</p>
          <Link 
            href="/portal/login" 
            className="flex items-center space-x-1 rtl:space-x-reverse text-stone-400 hover:text-islamic-gold transition-colors font-medium text-[11px]"
          >
            <User className="w-3.5 h-3.5" />
            <span>Portal Login</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export const ClientShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LanguageProvider>
      <InnerShell>{children}</InnerShell>
    </LanguageProvider>
  );
};
