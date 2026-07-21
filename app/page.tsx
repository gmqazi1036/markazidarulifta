"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from './context/LanguageContext';
import { searchFatwas, askQuestion, getCategoriesWithCounts, trackQuestion, getBooks } from './actions/public';
import { 
  Search, HelpCircle, FileText, Send, BookOpen, Clock, Tag, ExternalLink, 
  ShieldCheck, Heart, CheckCircle, Award, Check, Users, Shield, ArrowRight,
  BookOpenCheck, Calendar, Activity, BookMarked
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { formatDateSafe } from './utils/date';

const ContinuousCounter: React.FC<{ target: number; suffix?: string; duration?: number }> = ({ target, suffix = '', duration = 1500 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    const totalSteps = 40;
    const stepTime = duration / totalSteps;
    let step = 0;
    let timer: NodeJS.Timeout;
    let repeatTimeout: NodeJS.Timeout;

    const run = () => {
      step = 0;
      setCount(0);
      timer = setInterval(() => {
        step++;
        const progress = step / totalSteps;
        const easeProgress = progress * (2 - progress);
        const currentCount = Math.floor(end * easeProgress);
        setCount(currentCount);

        if (step >= totalSteps) {
          clearInterval(timer);
          setCount(end);
          repeatTimeout = setTimeout(() => {
            run();
          }, 3000);
        }
      }, stepTime);
    };

    run();

    return () => {
      clearInterval(timer);
      clearTimeout(repeatTimeout);
    };
  }, [target, duration]);

  return (
    <span>{count.toLocaleString()}{suffix}</span>
  );
};

export default function Home() {
  const { t, isRtl, language } = useLanguage();

  // Typing Animation State
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    const fullText = language === 'en' ? 'Markazi Darul Ifta, Bareilly Shareef' : 'مرکزی دارالافتاء، بریلی شریف';
    let index = 0;
    setTypedText('');
    let typingInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const startTyping = () => {
      index = 0;
      setTypedText('');
      typingInterval = setInterval(() => {
        setTypedText((prev) => {
          if (index < fullText.length) {
            return fullText.slice(0, index + 1);
          }
          clearInterval(typingInterval);
          // Wait 3 seconds, then restart typing loop repeatedly
          timeoutId = setTimeout(() => {
            startTyping();
          }, 3000);
          return prev;
        });
        index++;
      }, 75);
    };

    startTyping();

    return () => {
      clearInterval(typingInterval);
      clearTimeout(timeoutId);
    };
  }, [language]);

  // Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategoriesList, setSubCategoriesList] = useState<any[]>([]);
  const [fatwaResults, setFatwaResults] = useState<any[]>([]);
  const [latestFatwas, setLatestFatwas] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);

  // Search States
  const [keyword, setKeyword] = useState('');
  const [fatwaNumber, setFatwaNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'views'>('date');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Ask Question States
  const [askName, setAskName] = useState('');
  const [askPhone, setAskPhone] = useState('');
  const [askEmail, setAskEmail] = useState('');
  const [askCity, setAskCity] = useState('');
  const [askText, setAskText] = useState('');
  const [attachment, setAttachment] = useState<{ name: string; base64: string } | null>(null);
  const [askLoading, setAskLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<{ trackingNumber: string; status: string } | null>(null);

  // Track Question States
  const [trackNumber, setTrackNumber] = useState('');
  const [trackedQuestion, setTrackedQuestion] = useState<any>(null);
  const [trackError, setTrackError] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);

  // Featured Categories List (13 categories)
  const featuredCategories = [
    { nameEn: "Aqeedah (Beliefs)", nameUr: "عقائد", icon: Shield, dbName: "Aqeedah" },
    { nameEn: "Taharah (Purity)", nameUr: "طہارت", icon: ShieldCheck, dbName: "Taharah" },
    { nameEn: "Salah (Prayer)", nameUr: "نماز", icon: Clock, dbName: "Salah" },
    { nameEn: "Zakat (Almsgiving)", nameUr: "زکوٰۃ", icon: Tag, dbName: "Zakat" },
    { nameEn: "Sawm (Fasting)", nameUr: "روزہ", icon: Calendar, dbName: "Sawm" },
    { nameEn: "Hajj (Pilgrimage)", nameUr: "حج", icon: GlobeIcon, dbName: "Hajj" },
    { nameEn: "Nikah (Marriage)", nameUr: "نکاح", icon: Heart, dbName: "Nikah" },
    { nameEn: "Talaq (Divorce)", nameUr: "طلاق", icon: HelpCircle, dbName: "Talaq" },
    { nameEn: "Bay' (Business & Finance)", nameUr: "بیع", icon: Award, dbName: "Bay" },
    { nameEn: "Qurbani (Sacrifice)", nameUr: "قربانی", icon: BookOpen, dbName: "Qurbani" },
    { nameEn: "Hazr-o-Ibaha (Rules & Ethics)", nameUr: "حظر واباحۃ", icon: BookOpenCheck, dbName: "Hazr" },
    { nameEn: "Inheritance (Meerath)", nameUr: "میراث", icon: FileText, dbName: "Inheritance" },
    { nameEn: "Seerah and History", nameUr: "سیر و تواریخ", icon: BookMarked, dbName: "Seerah" }
  ];

  // Custom Globe Icon helper (avoid standard Globe since we imported other icons)
  function GlobeIcon(props: any) {
    return (
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
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    );
  }

  // Load Data on Mount
  useEffect(() => {
    async function loadData() {
      // Load categories
      const catRes = await getCategoriesWithCounts();
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
      
      // Load latest answered fatwas (for the specific list section)
      const fatwaRes = await searchFatwas({ sortBy: 'date' });
      if (fatwaRes.success && fatwaRes.data) {
        setLatestFatwas(fatwaRes.data.slice(0, 6)); // Display latest 6 answered fatwas
        setFatwaResults(fatwaRes.data.slice(0, 5)); // Initial search results
      }

      // Load latest books & publications
      const bookRes = await getBooks();
      if (bookRes.success && bookRes.data) {
        setBooks(bookRes.data.slice(0, 4)); // Get latest 4 publications
      }
    }
    loadData();
  }, []);

  // Update Subcategories list when selected category changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      setSubCategoriesList([]);
      setSelectedSubCategory('all');
    } else {
      const catObj = categories.find(c => c.id === selectedCategory);
      if (catObj && catObj.subCategories) {
        setSubCategoriesList(catObj.subCategories);
      } else {
        setSubCategoriesList([]);
      }
      setSelectedSubCategory('all');
    }
  }, [selectedCategory, categories]);

  // Execute Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);
    setHasSearched(true);
    const res = await searchFatwas({
      keyword,
      fatwaNumber,
      categoryId: selectedCategory,
      subCategoryId: selectedSubCategory,
      sortBy
    });
    if (res.success && res.data) {
      setFatwaResults(res.data);
    }
    setSearchLoading(false);
  };

  // Handle Featured Category Click
  const handleFeaturedCategoryClick = async (catItem: any) => {
    // Scroll to search section
    const searchSection = document.getElementById('search-section');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Try to find matching category in loaded categories list
    const found = categories.find(c => 
      c.nameEn.toLowerCase().includes(catItem.dbName.toLowerCase()) || 
      catItem.dbName.toLowerCase().includes(c.nameEn.toLowerCase())
    );

    if (found) {
      setSelectedCategory(found.id);
      setKeyword(catItem.dbName === 'Talaq' ? 'talaq' : '');
      
      // Execute the search automatically
      setSearchLoading(true);
      setHasSearched(true);
      const res = await searchFatwas({
        keyword: catItem.dbName === 'Talaq' ? 'talaq' : '',
        fatwaNumber: '',
        categoryId: found.id,
        subCategoryId: 'all',
        sortBy: 'date'
      });
      if (res.success && res.data) {
        setFatwaResults(res.data);
      }
      setSearchLoading(false);
    } else {
      // If not in database, search by keyword
      setSelectedCategory('all');
      setKeyword(catItem.nameEn);
      setSearchLoading(true);
      setHasSearched(true);
      const res = await searchFatwas({
        keyword: catItem.nameEn,
        fatwaNumber: '',
        categoryId: 'all',
        subCategoryId: 'all',
        sortBy: 'date'
      });
      if (res.success && res.data) {
        setFatwaResults(res.data);
      }
      setSearchLoading(false);
    }
  };

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds limit (5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({
          name: file.name,
          base64: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Question
  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askName || !askPhone || !askCity || !askText) {
      alert("Please fill all required fields.");
      return;
    }
    setAskLoading(true);
    const res = await askQuestion({
      name: askName,
      phone: askPhone,
      email: askEmail,
      city: askCity,
      questionText: askText,
      fileName: attachment?.name,
      fileBase64: attachment?.base64
    });
    setAskLoading(false);
    if (res.success && res.data) {
      setTrackingInfo(res.data);
      // Reset form
      setAskName('');
      setAskPhone('');
      setAskEmail('');
      setAskCity('');
      setAskText('');
      setAttachment(null);
    } else {
      alert(res.error || "Submission failed. Please try again.");
    }
  };

  // Track Question Submit
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackNumber) return;
    setTrackLoading(true);
    setTrackError('');
    setTrackedQuestion(null);
    const res = await trackQuestion(trackNumber.trim());
    setTrackLoading(false);
    if (res.success && res.data) {
      setTrackedQuestion(res.data);
    } else {
      setTrackError(res.error || "Tracking number not found.");
    }
  };

  return (
    <div className="space-y-16 animate-fade-in text-slate-800">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-50 via-emerald-50/20 to-amber-50/20 py-20 px-6 md:px-12 shadow-md border border-stone-200/60">
        <div className="absolute inset-0 bg-cover opacity-[0.04] bg-center pointer-events-none" style={{ backgroundImage: `url('/images/islamic-pattern.svg')` }}></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`inline-flex items-center justify-center bg-islamic-gold/10 text-islamic-gold rounded-full border border-islamic-gold/20 ${
              language === 'ur' 
                ? 'text-lg sm:text-xl md:text-2xl font-normal px-6 py-2 min-h-[44px] font-urdu' 
                : 'text-xs font-semibold px-4 py-1.5 min-h-[34px] tracking-wider uppercase'
            }`}
          >
            <span>{typedText}</span>
            <span className="animate-pulse border-r-2 border-islamic-gold h-4 ml-1"></span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            whileHover="hover"
            variants={{
              hover: {
                transition: {
                  staggerChildren: 0.08,
                }
              }
            }}
            className={`tracking-tight text-slate-800 flex flex-wrap justify-center cursor-default select-none ${
              language === 'ur'
                ? 'text-4xl sm:text-5xl md:text-6xl font-normal font-urdu leading-normal gap-x-0.5 sm:gap-x-1 [word-spacing:-0.12em]'
                : 'font-extrabold text-3xl md:text-5xl leading-tight gap-x-2 md:gap-x-3'
            }`}
          >
            {(language === 'en' ? 'Authentic Islamic Fatwas & Religious Guidance' : 'مستند اسلامی فتاویٰ اور شرعی رہنمائی').split(' ').map((word, idx) => (
              <motion.span 
                key={idx}
                variants={{
                  hover: {
                    scale: [1, 1.18, 1],
                    opacity: [1, 0.75, 1],
                    color: ["#1e293b", "#c29b38", "#1e293b"],
                    transition: {
                      duration: 1.2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }
                  }
                }}
                className="inline-block px-0.5"
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className={`text-slate-600 max-w-3xl mx-auto leading-relaxed ${
              language === 'ur'
                ? 'text-lg sm:text-xl md:text-2xl font-normal font-urdu'
                : 'text-sm md:text-base'
            }`}
          >
            {language === 'en' 
              ? 'Your trusted source for authentic Islamic fatwas, scholarly religious guidance, and verified Islamic publications. Search our extensive fatwa collection, submit your religious questions, and benefit from the guidance of qualified Muftis according to the Hanafi school of Islamic jurisprudence.'
              : 'مستند اسلامی فتاویٰ، علمی شرعی رہنمائی اور مصدقہ اسلامی کتب کے لیے آپ کا قابل اعتماد ذریعہ۔ ہمارے وسیع فتاویٰ ذخیرے میں تلاش کریں، اپنے دینی سوالات ارسال کریں، اور فقہ حنفی کے مطابق مستند مفتیانِ کرام کی رہنمائی سے فائدہ اٹھائیں۔'
            }
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
          >
            <a 
              href="#search-section" 
              className={`w-full sm:w-auto px-8 py-3 bg-islamic-green hover:bg-islamic-darkGreen text-white rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 rtl:space-x-reverse ${
                language === 'ur' ? 'text-lg font-normal font-urdu' : 'font-bold text-sm'
              }`}
            >
              <Search className="w-4 h-4 text-islamic-gold" />
              <span>{language === 'en' ? 'Search Fatwas' : 'فتاویٰ تلاش کریں'}</span>
            </a>
            <a 
              href="#ask-section" 
              className={`w-full sm:w-auto px-8 py-3 bg-white hover:bg-stone-50 text-slate-700 border border-stone-300 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 rtl:space-x-reverse ${
                language === 'ur' ? 'text-lg font-normal font-urdu' : 'font-bold text-sm'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-islamic-green" />
              <span>{language === 'en' ? 'Ask a Question' : 'سوال پوچھیں'}</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* 2. About Markazi Darul Ifta */}
      <section className="bg-white rounded-xl p-8 shadow-sm border border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2 space-y-5">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse text-islamic-green">
            <ShieldCheck className="w-6 h-6 text-islamic-gold" />
            <h3 className={`text-xl md:text-2xl ${
              language === 'ur' ? 'text-2xl md:text-3xl font-normal font-urdu' : 'font-bold'
            }`}>
              {language === 'en' ? 'Preserving Islamic Scholarship Through Authentic Guidance' : 'مستند رہنمائی کے ذریعے اسلامی علمی ورثے کا تحفظ'}
            </h3>
          </div>
          <p className={`text-slate-800 leading-relaxed ${
            language === 'ur' ? 'text-base md:text-lg font-normal font-urdu' : 'text-sm md:text-base font-semibold'
          }`}>
            {language === 'en' 
              ? 'Markazi Darul Ifta, Bareilly Shareef, has been serving the Muslim Ummah by providing authentic Islamic rulings based on the Holy Qur’an, Sunnah, Ijma, and the Hanafi school of Islamic jurisprudence.'
              : 'مرکزی دارالافتاء، بریلی شریف قرآنِ مجید، سنتِ نبوی ﷺ، اجماعِ امت اور فقہِ حنفی کی روشنی میں مستند شرعی فتاویٰ جاری کرکے ملتِ اسلامیہ کی دینی رہنمائی کا عظیم فریضہ انجام دے رہا ہے۔'
            }
          </p>
          <p className={`text-slate-600 leading-relaxed ${
            language === 'ur' ? 'text-base font-normal font-urdu' : 'text-sm'
          }`}>
            {language === 'en' 
              ? 'Our mission is to provide reliable religious guidance, answer contemporary issues with scholarly research, and preserve valuable Islamic literature for future generations.'
              : 'ہمارا مقصد عوامِ مسلمین کو قابلِ اعتماد شرعی رہنمائی فراہم کرنا، پیش آمدہ اور عصری مسائل کا تحقیقی و مدلل حل پیش کرنا، اور اسلامی علمی و فقہی ذخیرے کو محفوظ کرکے آئندہ نسلوں تک منتقل کرنا ہے۔'
            }
          </p>
          <p className={`text-slate-600 leading-relaxed italic border-l-4 border-islamic-gold pl-4 rtl:border-l-0 rtl:border-r-4 rtl:pr-4 ${
            language === 'ur' ? 'text-base font-normal font-urdu' : 'text-sm'
          }`}>
            {language === 'en' 
              ? 'Every fatwa is issued after careful study by qualified Muftis, ensuring authenticity, clarity, and adherence to Islamic principles.'
              : 'ہر فتویٰ مستند اور ماہر مفتیانِ کرام کی جانب سے مکمل تحقیق، غور و خوض اور شرعی اصولوں کی روشنی میں مرتب کیا جاتا ہے، تاکہ اس کی صحت، وضاحت اور اسلامی تعلیمات سے مکمل مطابقت یقینی بنائی جا سکے۔'
            }
          </p>
        </div>
        <div className="bg-gradient-to-b from-stone-50 to-stone-100 p-6 rounded-lg border border-stone-200 flex flex-col justify-between h-full space-y-4">
          <div>
            <h4 className={`text-islamic-green border-b border-stone-200 pb-2 mb-3 ${
              language === 'ur' ? 'text-lg md:text-xl font-normal font-urdu' : 'text-sm font-bold'
            }`}>
              {language === 'en' ? 'Office Details' : 'دفتر کی تفصیلات'}
            </h4>
            <div className={`space-y-2.5 text-slate-600 ${
              language === 'ur' ? 'text-sm font-urdu leading-relaxed' : 'text-[11px]'
            }`}>
              {language === 'en' ? (
                <>
                  <p><strong>Address 1:</strong> No 82, Dargah Aala Hazrat, Saudagaran, Bareilly Shareef India</p>
                  <p><strong>Address 2:</strong> Center of Islamic Studies Jamiatur Raza, Mathurapur, C B Ganj, Bareilly Shareef India</p>
                  <p><strong>Timings:</strong> 9:00 AM - 5:00 PM (Friday Closed)</p>
                </>
              ) : (
                <>
                  <p><strong>پتہ ۱:</strong> مکان نمبر ۸۲، درگاہ اعلیٰ حضرت، سوداگران، بریلی شریف انڈیا</p>
                  <p><strong>پتہ ۲:</strong> جامعۃ الرضا اسلامی ریسرچ سینٹر، مٹھوراپور، سی بی گنج، بریلی شریف انڈیا</p>
                  <p><strong>اوقات:</strong> صبح ۹:۰۰ بجے سے شام ۵:۰۰ بجے تک (جمعہ تعطیل)</p>
                </>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-stone-200">
            <Link href="/introduction" className={`text-islamic-gold hover:text-amber-700 flex items-center space-x-1 rtl:space-x-reverse ${
              language === 'ur' ? 'text-base font-normal font-urdu' : 'text-xs font-bold'
            }`}>
              <span>{language === 'en' ? 'Read Full History' : 'مکمل تاریخ پڑھیں'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Search Section */}
      <section id="search-section" className="bg-white rounded-xl shadow-md border border-stone-200 overflow-hidden">
        <div className="bg-stone-50 p-6 border-b border-stone-200">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Search className="w-6 h-6 text-islamic-green" />
            <div>
              <h3 className={`text-slate-800 ${
                language === 'ur' ? 'text-2xl md:text-3xl font-normal font-urdu' : 'text-lg font-bold'
              }`}>
                {language === 'en' ? 'Find Authentic Islamic Rulings' : 'مستند شرعی فتاویٰ تلاش کریں'}
              </h3>
              <p className={`mt-1 ${language === 'ur' ? 'text-sm md:text-base font-normal font-urdu text-slate-600 leading-relaxed' : 'text-xs text-slate-500'}`}>
                {language === 'en'
                  ? 'Search thousands of published fatwas using keyword, fatwa number, category, or subcategory. Quickly access reliable answers to your religious questions from our verified archive.'
                  : 'کلیدی الفاظ، فتویٰ نمبر، زمرہ (Category) یا ذیلی زمرہ (Subcategory) کے ذریعے ہزاروں شائع شدہ فتاویٰ میں آسانی سے تلاش کریں۔ ہمارے مستند اور تصدیق شدہ ذخیرۂ فتاویٰ سے اپنے دینی مسائل کے قابلِ اعتماد اور مستند شرعی جوابات فوری طور پر حاصل کریں۔'
                }
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className={`text-slate-600 ${language === 'ur' ? 'text-sm font-normal font-urdu' : 'text-xs font-bold'}`}>{t('searchFieldKeyword')}</label>
              <input 
                type="text" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-islamic-gold"
              />
            </div>
            <div className="space-y-1">
              <label className={`text-slate-600 ${language === 'ur' ? 'text-sm font-normal font-urdu' : 'text-xs font-bold'}`}>{t('searchFieldFatwaNo')}</label>
              <input 
                type="text" 
                value={fatwaNumber}
                onChange={(e) => setFatwaNumber(e.target.value)}
                placeholder="e.g. 1447-000001"
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-islamic-gold"
              />
            </div>
            <div className="space-y-1">
              <label className={`text-slate-600 ${language === 'ur' ? 'text-sm font-normal font-urdu' : 'text-xs font-bold'}`}>Sort By</label>
              <select 
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-islamic-gold"
              >
                <option value="date">Latest Date</option>
                <option value="views">Most Views</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-slate-600 ${language === 'ur' ? 'text-sm font-normal font-urdu' : 'text-xs font-bold'}`}>{t('searchFieldCategory')}</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-islamic-gold"
              >
                <option value="all">{t('searchAllCategories')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'en' ? cat.nameEn : cat.nameUr}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className={`text-slate-600 ${language === 'ur' ? 'text-sm font-normal font-urdu' : 'text-xs font-bold'}`}>{t('searchFieldSubCategory')}</label>
              <select 
                value={selectedSubCategory}
                disabled={selectedCategory === 'all'}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-islamic-gold disabled:opacity-50"
              >
                <option value="all">{t('searchAllSubCategories')}</option>
                {subCategoriesList.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {language === 'en' ? sub.nameEn : sub.nameUr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={searchLoading}
              className={`px-6 py-2.5 bg-islamic-green hover:bg-islamic-darkGreen text-white rounded shadow transition-colors flex items-center space-x-2 rtl:space-x-reverse ${
                language === 'ur' ? 'text-lg font-normal font-urdu' : 'font-bold text-sm'
              }`}
            >
              <span>{language === 'en' ? (searchLoading ? 'Searching...' : 'Search Fatwas →') : (searchLoading ? 'تلاش جاری ہے...' : 'فتاویٰ تلاش کریں ←')}</span>
            </button>
          </div>
        </form>

        {/* Search Results */}
        <div className="bg-stone-50 border-t border-stone-200 p-6">
          <h4 className={`text-slate-700 mb-4 ${
            language === 'ur' ? 'text-lg font-normal font-urdu' : 'text-sm font-bold uppercase tracking-wider'
          }`}>
            {hasSearched ? t('searchResults') : 'Latest Answered Fatwas'}
          </h4>

          {searchLoading ? (
            <div className="text-center py-8 text-slate-500 text-sm">Searching the Fatwa archive...</div>
          ) : fatwaResults.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-stone-300 rounded bg-white">
              {t('noResults')}
            </div>
          ) : (
            <div className="space-y-4">
              {fatwaResults.map((fatwa) => (
                <div key={fatwa.id} className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm hover:border-islamic-gold transition-colors space-y-3">
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-stone-100 pb-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{fatwa.publishedAt ? formatDateSafe(fatwa.publishedAt, language) : 'Draft'}</span>
                      <span className={`px-2 py-0.5 bg-islamic-gold/10 text-islamic-gold rounded-full ${
                        language === 'ur' ? 'text-sm font-normal font-urdu' : 'font-semibold'
                      }`}>
                        Fatwa: {fatwa.fatwaNumber}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-xs text-slate-600">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? fatwa.category?.nameEn : fatwa.category?.nameUr}</span>
                      <span>›</span>
                      <span>{language === 'en' ? fatwa.subCategory?.nameEn : fatwa.subCategory?.nameUr}</span>
                    </div>
                  </div>

                  <h5 className={`text-slate-900 line-clamp-2 font-urdu pt-1 ${
                    language === 'ur' ? 'text-lg md:text-xl font-normal' : 'font-bold text-base md:text-lg'
                  }`}>
                    {language === 'en' ? fatwa.titleEn : fatwa.titleUr}
                  </h5>

                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed line-clamp-4 font-urdu italic border-l-2 border-stone-200 pl-2 rtl:border-l-0 rtl:border-r-2 rtl:border-stone-200 rtl:pl-0 rtl:pr-2">
                    {fatwa.question?.questionText || (language === 'en' ? 'Question details not available.' : 'سوال کی تفصیلات دستیاب نہیں۔')}
                  </p>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-500 font-urdu">
                      {language === 'en' ? `Answered by: ${fatwa.answeredBy?.nameEn}` : `جواب بحوالہ: ${fatwa.answeredBy?.nameUr}`}
                    </span>
                    <Link 
                      href={`/fatwa/${fatwa.id}`} 
                      className={`text-islamic-gold hover:text-amber-700 flex items-center space-x-1 ${
                        language === 'ur' ? 'text-base font-normal font-urdu' : 'text-xs font-bold'
                      }`}
                    >
                      <span>Read Full Fatwa</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Featured Categories Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className={`text-slate-800 ${
            language === 'ur' ? 'text-3xl md:text-4xl font-normal font-urdu' : 'text-2xl font-bold'
          }`}>
            {language === 'en' ? 'Browse Fatwas by Category' : 'زمرہ جات کے لحاظ سے فتاویٰ تلاش کریں'}
          </h3>
          <p className={`text-slate-500 ${language === 'ur' ? 'text-base font-urdu' : 'text-sm'}`}>
            {language === 'en'
              ? 'Select an Islamic topic below to instantly load and search rulings in our archive.'
              : 'ہمارے آرکائیو میں موجود فتاویٰ و احکام فوری طور پر دیکھنے اور تلاش کرنے کے لیے نیچے دیے گئے شرعی موضوع کا انتخاب کریں۔'
            }
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredCategories.map((catItem, idx) => {
            const Icon = catItem.icon;
            return (
              <button
                key={idx}
                onClick={() => handleFeaturedCategoryClick(catItem)}
                className="bg-white border border-stone-200 hover:border-islamic-gold p-5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center flex flex-col items-center justify-center space-y-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-stone-50 text-slate-600 group-hover:bg-islamic-gold/10 group-hover:text-islamic-gold flex items-center justify-center transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-slate-800 group-hover:text-islamic-green transition-colors ${
                    language === 'ur' ? 'text-lg font-normal font-urdu' : 'text-sm font-bold'
                  }`}>
                    {language === 'en' ? catItem.nameEn : catItem.nameUr}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. Ask Question Section */}
      <section id="ask-section" className="bg-white rounded-xl shadow-md border border-stone-200 overflow-hidden">
        <div className="bg-stone-50 p-6 border-b border-stone-200">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <HelpCircle className="w-6 h-6 text-islamic-green" />
            <div>
              <h3 className={`text-slate-800 ${
                language === 'ur' ? 'text-2xl md:text-3xl font-normal font-urdu' : 'text-lg font-bold'
              }`}>
                {language === 'en' ? 'Need Islamic Guidance?' : 'شرعی رہنمائی کی ضرورت ہے؟'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'en'
                  ? 'If you cannot find your answer in our Fatwa Library, submit your question directly to our scholars. Your question will be carefully reviewed, researched, and answered according to authentic Hanafi jurisprudence.'
                  : 'اگر آپ کو ہمارے فتاویٰ کتب خانہ میں جواب نہ ملے، تو اپنا سوال براہ راست ہمارے مفتیانِ کرام کی بارگاہ میں ارسال کریں۔ آپ کا سوال فقہ حنفی کے مطابق تفصیلی جواب دیا جائے گا۔'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence>
            {trackingInfo && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg p-5 mb-6 flex flex-col items-center text-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base md:text-lg">{t('trackingSuccess')}</h4>
                <p className="text-sm">
                  {t('trackingNumberMsg')} <strong className="text-emerald-700 text-base md:text-lg select-all bg-emerald-100/50 px-2 py-0.5 rounded border border-emerald-200">{trackingInfo.trackingNumber}</strong>
                </p>
                <p className="text-xs text-emerald-600">
                  {t('trackingStatusMsg')}
                </p>
                <button 
                  onClick={() => setTrackingInfo(null)}
                  className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
                >
                  Ask Another Question
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAskSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={`text-slate-600 ${language === 'ur' ? 'text-sm font-normal font-urdu' : 'text-xs font-bold'}`}>{t('lblFullName')} <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={askName}
                  onChange={(e) => setAskName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-islamic-gold"
                />
              </div>
              <div className="space-y-1">
                <label className={`text-slate-600 ${language === 'ur' ? 'text-sm font-normal font-urdu' : 'text-xs font-bold'}`}>{t('lblPhone')} <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={askPhone}
                  onChange={(e) => setAskPhone(e.target.value)}
                  placeholder="e.g. +91 94116 99786"
                  className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-islamic-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={`text-slate-600 ${language === 'ur' ? 'text-sm font-normal font-urdu' : 'text-xs font-bold'}`}>{t('lblEmail')}</label>
                <input 
                  type="email" 
                  value={askEmail}
                  onChange={(e) => setAskEmail(e.target.value)}
                  placeholder="name@example.com (optional)"
                  className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-islamic-gold"
                />
              </div>
              <div className="space-y-1">
                <label className={`text-slate-600 ${language === 'ur' ? 'text-sm font-normal font-urdu' : 'text-xs font-bold'}`}>{t('lblCity')} <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={askCity}
                  onChange={(e) => setAskCity(e.target.value)}
                  placeholder="e.g. Bareilly, UP"
                  className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-islamic-gold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={`text-slate-600 ${language === 'ur' ? 'text-sm font-normal font-urdu' : 'text-xs font-bold'}`}>{t('lblQuestion')} <span className="text-red-500">*</span></label>
              <textarea 
                required
                rows={5}
                value={askText}
                onChange={(e) => setAskText(e.target.value)}
                placeholder="Write your Islamic query details clearly..."
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-islamic-gold font-urdu"
              ></textarea>
            </div>

            {/* Document upload option hidden as requested */}

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={askLoading}
                className={`px-6 py-3 bg-islamic-green hover:bg-islamic-darkGreen text-white rounded shadow transition-colors flex items-center space-x-2 rtl:space-x-reverse ${
                  language === 'ur' ? 'text-lg font-normal font-urdu' : 'font-bold text-sm'
                }`}
              >
                <Send className="w-4 h-4 text-islamic-gold" />
                <span>{language === 'en' ? (askLoading ? 'Submitting...' : 'Submit') : (askLoading ? 'ارسال ہو رہا ہے...' : 'ارسال کریں')}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 6. Status Tracking Box */}
      <section className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="bg-stone-50 p-5 border-b border-stone-200">
          <h3 className={`text-slate-800 flex items-center space-x-2 rtl:space-x-reverse ${
            language === 'ur' ? 'text-[22px] font-normal font-urdu' : 'text-base font-bold'
          }`}>
            <Clock className="w-5 h-5 text-islamic-gold" />
            <span>{language === 'en' ? 'Track Submitted Question Status' : 'ارسال کردہ سوال کی حیثیت معلوم کریں'}</span>
          </h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              required
              value={trackNumber}
              onChange={(e) => setTrackNumber(e.target.value)}
              placeholder={language === 'en' ? 'Enter your tracking number (e.g. MDI-2026-1234)...' : 'اپنا ٹریکنگ نمبر درج کریں (مثلاً MDI-2026-1234)...'}
              className={`flex-grow border border-stone-300 rounded px-3 py-2 focus:outline-none focus:border-islamic-gold ${
                language === 'ur' ? 'text-sm font-urdu' : 'text-sm'
              }`}
            />
            <button 
              type="submit"
              disabled={trackLoading}
              className={`px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded shadow transition-colors ${
                language === 'ur' ? 'text-lg font-normal font-urdu' : 'text-sm font-bold'
              }`}
            >
              {language === 'en' 
                ? (trackLoading ? 'Searching...' : 'Track Status') 
                : (trackLoading ? 'تلاش جاری ہے...' : 'حیثیت معلوم کریں')
              }
            </button>
          </form>

          {trackError && (
            <p className="text-red-500 text-xs mt-3 font-semibold">{trackError}</p>
          )}

          {trackedQuestion && (
            <div className="mt-5 p-5 bg-stone-50 border border-stone-200 rounded-lg space-y-3">
              <div className="flex justify-between items-center border-b border-stone-200 pb-2 flex-wrap gap-2 text-xs">
                <div>
                  <strong>Tracking Number:</strong> <span className="text-slate-700">{trackedQuestion.trackingNumber}</span>
                </div>
                <div>
                  <strong>Submitted Date:</strong> <span className="text-slate-700">{formatDateSafe(trackedQuestion.createdAt, language)}</span>
                </div>
              </div>
              <div className="text-sm">
                <strong>Status: </strong>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  trackedQuestion.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                  trackedQuestion.status === 'HOLD' ? 'bg-orange-100 text-orange-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {trackedQuestion.status}
                </span>
              </div>
              <div className="text-sm border-t border-stone-200 pt-3">
                <strong>Question Details:</strong>
                <p className="text-slate-600 mt-1 italic font-urdu">"{trackedQuestion.questionText}"</p>
              </div>

              {trackedQuestion.status === 'ANSWERED' && trackedQuestion.fatwa && (
                <div className="bg-emerald-50 border border-emerald-200 rounded p-4 mt-3 space-y-2">
                  <h6 className="font-bold text-emerald-800 text-sm">Fatwa Answer (Published)</h6>
                  <p className="text-xs text-slate-700 line-clamp-3 font-urdu">
                    {language === 'en' ? trackedQuestion.fatwa.answerEn : trackedQuestion.fatwa.answerUr}
                  </p>
                  <Link 
                    href={`/fatwa/${trackedQuestion.fatwa.id}`}
                    className="inline-flex items-center text-xs font-bold text-islamic-green hover:underline space-x-1"
                  >
                    <span>Read Full Fatwa</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 7. Publishing & Printing Department */}
      <section className="bg-white rounded-xl p-8 shadow-sm border border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center space-x-2 text-islamic-green">
            <BookOpen className="w-6 h-6 text-islamic-gold" />
            <h3 className={`text-slate-800 ${
              language === 'ur' ? 'text-2xl md:text-3xl font-normal font-urdu' : 'text-xl md:text-2xl font-bold'
            }`}>
              {language === 'en' ? 'Preserving and Publishing Islamic Knowledge' : 'اسلامی علم کی ترویج اور اشاعت'}
            </h3>
          </div>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {language === 'en'
              ? 'Our Publishing & Printing Department is dedicated to preserving authentic Islamic literature through the publication of books, research papers, journals, and scholarly works. Readers can explore valuable publications prepared by renowned Islamic scholars.'
              : 'ہمارا شعبہ نشر و اشاعت کتابوں، تحقیقی مقالوں، رسائل اور علمی کتب کی اشاعت کے ذریعے مستند اسلامی لٹریچر کو محفوظ کرنے کے لیے وقف ہے۔ قارئین نامور علمائے کرام کی تیار کردہ گراں قدر کتب مطالعہ کر سکتے ہیں۔'
            }
          </p>
        </div>
        <div className="flex justify-center md:justify-end">
          <Link 
            href="/publishing" 
            className={`px-8 py-3.5 bg-islamic-green hover:bg-islamic-darkGreen text-white rounded-lg shadow-md transition-colors inline-flex items-center space-x-2 ${
              language === 'ur' ? 'text-lg font-normal font-urdu' : 'font-bold text-sm'
            }`}
          >
            <span>{language === 'en' ? 'Explore Publications →' : 'کتب اور رسائل دیکھیں →'}</span>
          </Link>
        </div>
      </section>

      {/* 8. Why Choose Markazi Darul Ifta */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h3 className={`text-slate-800 ${
            language === 'ur' ? 'text-3xl md:text-4xl font-normal font-urdu' : 'text-2xl font-bold'
          }`}>
            {language === 'en' ? 'Why Choose Markazi Darul Ifta?' : 'مرکزی دارالافتاء کا انتخاب کیوں کریں؟'}
          </h3>
          <div className="w-16 h-1 bg-islamic-gold mx-auto mt-2"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <h4 className={`text-slate-800 ${language === 'ur' ? 'text-lg font-normal font-urdu' : 'text-sm font-bold'}`}>
              {language === 'en' ? 'Authentic Fatwas' : 'مستند فتاویٰ'}
            </h4>
            <p className={`text-slate-500 leading-relaxed ${language === 'ur' ? 'text-sm font-urdu' : 'text-xs'}`}>
              {language === 'en'
                ? 'Issued by qualified Muftis after detailed research and verification.'
                : 'معتبر و مستند مفتیانِ کرام کی تفصیلی تحقیق اور تصدیق کے بعد جاری کردہ فتاویٰ۔'
              }
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <h4 className={`text-slate-800 ${language === 'ur' ? 'text-lg font-normal font-urdu' : 'text-sm font-bold'}`}>
              {language === 'en' ? 'Hanafi Jurisprudence' : 'فقہ حنفی کے مطابق'}
            </h4>
            <p className={`text-slate-500 leading-relaxed ${language === 'ur' ? 'text-sm font-urdu' : 'text-xs'}`}>
              {language === 'en'
                ? 'Strictly based upon the Qur’an, Sunnah, Ijma, and Hanafi school of thought.'
                : 'قرآن کریم، سنت نبوی، اجماع امت اور فقہ حنفی کے مطابق احکام کا بیان۔'
              }
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <h4 className={`text-slate-800 ${language === 'ur' ? 'text-lg font-normal font-urdu' : 'text-sm font-bold'}`}>
              {language === 'en' ? 'Easy Search' : 'آسان اور تیز رفتار تلاش'}
            </h4>
            <p className={`text-slate-500 leading-relaxed ${language === 'ur' ? 'text-sm font-urdu' : 'text-xs'}`}>
              {language === 'en'
                ? 'Find queries instantly using our advanced categories and filters.'
                : 'جدید زمرہ جات اور فلٹرز کے ذریعے مطلوبہ شرعی مسائل فوری تلاش کریں۔'
              }
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <h4 className={`text-slate-800 ${language === 'ur' ? 'text-lg font-normal font-urdu' : 'text-sm font-bold'}`}>
              {language === 'en' ? 'Confidential Questions' : 'صیغہ راز میں سوالات'}
            </h4>
            <p className={`text-slate-500 leading-relaxed ${language === 'ur' ? 'text-sm font-urdu' : 'text-xs'}`}>
              {language === 'en'
                ? 'Personal religious queries are handled with strict privacy and respect.'
                : 'آپ کے شخصیہ اور شرعی سوالات کی مکمل پردہ داری اور راز داری کا اہتمام۔'
              }
            </p>
          </div>
        </div>
      </section>

      {/* 9. Statistics counters */}
      <section className="bg-gradient-to-r from-stone-50 to-stone-100 rounded-xl p-8 border border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-mono">
        <div className="space-y-1">
          <div className="text-3xl md:text-4xl font-extrabold text-islamic-green">
            <ContinuousCounter target={25000} suffix="+" />
          </div>
          <div className={`text-slate-600 tracking-wider ${language === 'ur' ? 'text-base font-normal font-urdu' : 'text-xs md:text-sm font-semibold uppercase font-sans'}`}>
            {language === 'en' ? 'Published Fatwas' : 'شائع شدہ فتاویٰ'}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-3xl md:text-4xl font-extrabold text-islamic-green">
            <ContinuousCounter target={500} suffix="+" />
          </div>
          <div className={`text-slate-600 tracking-wider ${language === 'ur' ? 'text-base font-normal font-urdu' : 'text-xs md:text-sm font-semibold uppercase font-sans'}`}>
            {language === 'en' ? 'Books & Publications' : 'کتب و مطبوعات'}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-3xl md:text-4xl font-extrabold text-islamic-green">
            <ContinuousCounter target={100} suffix="+" />
          </div>
          <div className={`text-slate-600 tracking-wider ${language === 'ur' ? 'text-base font-normal font-urdu' : 'text-xs md:text-sm font-semibold uppercase font-sans'}`}>
            {language === 'en' ? 'Research Articles' : 'تحقیقی مقالہ جات'}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-3xl md:text-4xl font-extrabold text-islamic-green">
            <ContinuousCounter target={5990} suffix="+" />
          </div>
          <div className={`text-slate-600 tracking-wider ${language === 'ur' ? 'text-base font-normal font-urdu' : 'text-xs md:text-sm font-semibold uppercase font-sans'}`}>
            {language === 'en' ? 'Questions Answered' : 'جواب شدہ سوالات'}
          </div>
        </div>
      </section>

      {/* 10. Latest Fatwas (6 items grid) */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-stone-200 pb-3">
          <div>
            <h3 className={`text-slate-800 ${
              language === 'ur' ? 'text-3xl md:text-4xl font-normal font-urdu' : 'text-xl md:text-2xl font-bold'
            }`}>
              {language === 'en' ? 'Latest Published Fatwas' : 'تازہ ترین شائع شدہ فتاویٰ'}
            </h3>
            <p className={`text-slate-500 mt-1 ${
              language === 'ur' ? 'text-sm font-urdu' : 'text-xs'
            }`}>
              {language === 'en'
                ? 'Explore recently answered queries reviewed by our board of scholars.'
                : 'ہمارے دارالافتاء کے مفتیانِ کرام کے تصدیق شدہ تازہ ترین شرعی فتاویٰ کا مطالعہ کریں۔'
              }
            </p>
          </div>
          <a href="#search-section" className={`text-islamic-gold hover:underline flex items-center space-x-1 rtl:space-x-reverse ${
            language === 'ur' ? 'text-base font-normal font-urdu' : 'text-xs font-bold'
          }`}>
            <span>{language === 'en' ? 'View All' : 'تمام فتاویٰ دیکھیں'}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestFatwas.map((fatwa) => (
            <div key={fatwa.id} className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm hover:border-islamic-gold transition-colors flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span className={`px-2 py-0.5 bg-islamic-gold/10 text-islamic-gold rounded ${
                    language === 'ur' ? 'text-sm font-normal font-urdu' : 'text-[10px] font-bold uppercase'
                  }`}>
                    {language === 'en' ? fatwa.category?.nameEn : fatwa.category?.nameUr}
                  </span>
                  <span>{formatDateSafe(fatwa.createdAt, language)}</span>
                </div>
                <h4 className={`text-slate-900 line-clamp-2 font-urdu pt-1 ${
                  language === 'ur' ? 'text-base md:text-lg font-normal' : 'font-bold text-sm md:text-base'
                }`}>
                  {language === 'en' ? fatwa.titleEn : fatwa.titleUr}
                </h4>
                <p className="text-slate-550 text-xs line-clamp-4 leading-relaxed font-urdu italic border-l-2 border-stone-200 pl-2 rtl:border-l-0 rtl:border-r-2 rtl:border-stone-200 rtl:pl-0 rtl:pr-2">
                  {fatwa.question?.questionText || (language === 'en' ? 'Question details not available.' : 'سوال کی تفصیلات دستیاب نہیں۔')}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-xs">
                <span className={`px-2 py-0.5 bg-stone-100 rounded text-slate-500 font-mono text-[10px] ${
                  language === 'ur' ? 'font-urdu' : ''
                }`}>
                  {language === 'en' ? `Fatwa: ${fatwa.fatwaNumber}` : `فتویٰ: ${fatwa.fatwaNumber}`}
                </span>
                <Link href={`/fatwa/${fatwa.id}`} className={`text-islamic-gold hover:underline ${
                  language === 'ur' ? 'text-base font-normal font-urdu' : 'text-xs font-bold'
                }`}>
                  {language === 'en' ? 'Read More →' : 'تفصیل پڑھیں ←'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. Latest Publications */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-stone-200 pb-3">
          <div>
            <h3 className={`text-slate-800 ${
              language === 'ur' ? 'text-3xl md:text-4xl font-normal font-urdu' : 'text-xl md:text-2xl font-bold'
            }`}>
              {language === 'en' ? 'Latest Publications & Books' : 'تازہ ترین مطبوعات و کتب'}
            </h3>
            <p className={`text-slate-500 mt-1 ${
              language === 'ur' ? 'text-sm font-urdu' : 'text-xs'
            }`}>
              {language === 'en'
                ? 'Read and download valuable Islamic literature prepared by renowned scholars.'
                : 'نامور علمائے کرام کی تیار کردہ گراں قدر کتب و لٹریچر کا مطالعہ کریں اور ڈاؤن لوڈ کریں۔'
              }
            </p>
          </div>
          <Link href="/publishing" className={`text-islamic-gold hover:underline flex items-center space-x-1 rtl:space-x-reverse ${
            language === 'ur' ? 'text-base font-normal font-urdu' : 'text-xs font-bold'
          }`}>
            <span>{language === 'en' ? 'Explore All' : 'تمام مطبوعات دیکھیں'}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {books.map((book) => (
            <div key={book.id} className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="bg-stone-50 p-6 flex justify-center border-b border-stone-100 relative overflow-hidden">
                {/* Book Cover Mockup representation */}
                <div className="w-28 h-36 bg-gradient-to-br from-islamic-green to-islamic-darkGreen rounded shadow-md flex flex-col justify-between p-3 text-white text-[9px] relative group-hover:scale-105 transition-transform duration-300">
                  <div className="border border-white/20 p-1 flex-grow flex flex-col justify-between">
                    <span className="font-urdu leading-tight line-clamp-3 text-[10px] text-center border-b border-white/10 pb-1">{book.title}</span>
                    <div className="flex flex-col items-center">
                      <BookMarked className="w-4 h-4 text-islamic-gold mb-1" />
                      <span className="text-[7px] text-stone-300 font-urdu">مرکزی دارالافتاء</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <span className={`bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200/50 ${
                  language === 'ur' ? 'text-sm font-normal font-urdu' : 'text-[10px] font-semibold uppercase tracking-wider'
                }`}>
                  {language === 'en' ? book.type : (book.type === 'BOOK' ? 'کتاب' : 'رسالہ')}
                </span>
                <h4 className={`text-slate-800 line-clamp-1 ${
                  language === 'ur' ? 'text-lg font-normal font-urdu' : 'text-sm font-bold'
                }`}>
                  {book.title}
                </h4>
                <p className={`text-slate-500 line-clamp-2 leading-relaxed ${
                  language === 'ur' ? 'text-xs font-urdu' : 'text-xs'
                }`}>
                  {book.description || (language === 'en' ? 'Scholarly Islamic publication from Markazi Darul Ifta.' : 'مرکزی دارالافتاء سے شائع کردہ گراں قدر اسلامی کتاب۔')}
                </p>
                <div className="pt-2">
                  <a 
                    href={book.downloadUrl || '#'} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-1.5 border border-stone-300 hover:border-islamic-gold text-slate-700 hover:text-islamic-green rounded flex items-center justify-center space-x-1 rtl:space-x-reverse transition-all ${
                      language === 'ur' ? 'text-sm font-normal font-urdu' : 'text-xs font-bold'
                    }`}
                  >
                    <span>{language === 'en' ? 'Download PDF' : 'پی ڈی ایف ڈاؤن لوڈ کریں'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12. Call to Action Banner */}
      <section className="bg-gradient-to-br from-islamic-green to-islamic-darkGreen rounded-2xl p-10 md:p-14 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-cover opacity-[0.05] bg-center pointer-events-none" style={{ backgroundImage: `url('/images/islamic-pattern.svg')` }}></div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <h3 className={`tracking-tight text-islamic-gold ${
            language === 'ur' ? 'text-3xl md:text-5xl font-normal font-urdu' : 'text-2xl md:text-4xl font-bold'
          }`}>
            {language === 'en' ? 'Seeking Authentic Islamic Guidance?' : 'کیا آپ کو مستند اسلامی رہنمائی کی تلاش ہے؟'}
          </h3>
          <p className={`text-stone-300 leading-relaxed ${
            language === 'ur' ? 'text-sm md:text-lg font-urdu' : 'text-sm md:text-base'
          }`}>
            {language === 'en' 
              ? 'Search our extensive Fatwa Library database or submit your question directly to receive guidance from qualified Islamic scholars.'
              : 'ہمارے فتاویٰ کتب خانہ میں تلاش کریں یا مستند علمائے کرام سے رہنمائی حاصل کرنے کے لیے اپنا سوال براہ راست بھیجیں۔'
            }
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <a 
              href="#search-section" 
              className={`px-6 py-2.5 bg-islamic-gold hover:bg-amber-600 text-white rounded shadow transition-colors ${
                language === 'ur' ? 'text-lg font-normal font-urdu' : 'text-sm font-bold'
              }`}
            >
              {language === 'en' ? 'Search Fatwas' : 'فتاویٰ تلاش کریں'}
            </a>
            <a 
              href="#ask-section" 
              className={`px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded transition-colors ${
                language === 'ur' ? 'text-lg font-normal font-urdu' : 'text-sm font-bold'
              }`}
            >
              {language === 'en' ? 'Ask a Question' : 'سوال پوچھیں'}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
