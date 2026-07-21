"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ur';

interface TranslationDict {
  [key: string]: {
    en: string;
    ur: string;
  };
}

const translations: TranslationDict = {
  // Navigation & Branding
  brandName: { en: "Markazi Darul Ifta", ur: "مرکزی دارالافتاء" },
  subBrandName: { en: "Bareilly Shareef", ur: "بریلی شریف" },
  trustName: { en: "Under the Aegis of Imam Ahmad Raza Trust", ur: "زیر اہتمام امام احمد رضا ٹرسٹ" },
  navHome: { en: "Home", ur: "صفحہ اول" },
  navIntro: { en: "Introduction of Darul Ifta", ur: "تعارف دارالافتاء" },
  navPublishing: { en: "Publishing & Printing", ur: "شعبہ نشر و اشاعت" },
  navContact: { en: "Contact Us", ur: "رابطہ کریں" },
  navWazaif: { en: "Wazaif", ur: "وظائف" },
  portalLogin: { en: "Portal Login", ur: "پورٹل لاگ ان" },
  portalDashboard: { en: "Mufti Dashboard", ur: "مفتی ڈیش بورڈ" },
  logout: { en: "Logout", ur: "لاگ آؤٹ" },
  
  // Hero Section
  heroTitle: { en: "Authentic Islamic Fatwas & Religious Guidance", ur: "مستند اسلامی فتاویٰ اور شرعی رہنمائی" },
  heroSubtitle: { en: "A trusted digital platform providing authentic Islamic fatwas, reliable religious guidance, and scholarly resources. Explore verified rulings, search our growing fatwa library, and submit your questions to qualified Muftis.", ur: "ایک قابل اعتماد ڈیجیٹل پلیٹ فارم جو مستند اسلامی فتاویٰ، قابل بھروسہ شرعی رہنمائی اور علمی کتب فراہم کرتا ہے۔ تصدیق شدہ فتاویٰ تلاش کریں اور اپنے شرعی سوالات مستند مفتیانِ کرام کی بارگاہ میں ارسال کریں۔" },
  btnSearch: { en: "Search Fatwas", ur: "فتاویٰ تلاش کریں" },
  btnAsk: { en: "Ask a Question", ur: "سوال پوچھیں" },

  // Search Section
  searchHeader: { en: "Search Fatwa Archive", ur: "فتاویٰ آرکائیو میں تلاش کریں" },
  searchPlaceholder: { en: "Enter keyword, topic, or fatwa number (e.g., 1447-000001)...", ur: "موضوع، کلیدی لفظ، یا فتویٰ نمبر درج کریں..." },
  searchFieldKeyword: { en: "Keyword", ur: "کلیدی لفظ" },
  searchFieldFatwaNo: { en: "Fatwa Number", ur: "فتویٰ نمبر" },
  searchFieldCategory: { en: "Category", ur: "زمرہ" },
  searchFieldSubCategory: { en: "Sub-Category", ur: "ذیلی زمرہ" },
  searchBtnSubmit: { en: "Search Now", ur: "ابھی تلاش کریں" },
  searchAllCategories: { en: "All Categories", ur: "تمام زمرہ جات" },
  searchAllSubCategories: { en: "All Sub-Categories", ur: "تمام ذیلی زمرہ جات" },
  searchResults: { en: "Search Results", ur: "تلاش کے نتائج" },
  noResults: { en: "No Fatwas found matching your query.", ur: "آپ کی تلاش کے مطابق کوئی فتویٰ نہیں ملا۔" },

  // Ask Question Section
  askHeader: { en: "Submit a New Islamic Question", ur: "نیا اسلامی سوال ارسال کریں" },
  askIntro: { en: "Muftis of Markazi Darul Ifta will review and answer your queries. You will receive a unique tracking number.", ur: "مرکزی دارالافتاء کے مفتیان کرام آپ کے سوالات کا جائزہ لے کر جواب دیں گے۔ آپ کو ایک منفرد ٹریکنگ نمبر موصول ہوگا۔" },
  lblFullName: { en: "Full Name", ur: "پورا نام" },
  lblPhone: { en: "WhatsApp / Mobile Number", ur: "واٹس ایپ / موبائل نمبر" },
  lblEmail: { en: "Email Address (Optional)", ur: "ای میل ایڈریس (اختیاری)" },
  lblCity: { en: "City / Country", ur: "شہر / ملک" },
  lblQuestion: { en: "Your Question", ur: "آپ کا سوال" },
  lblAttachment: { en: "Attachment (PDF, JPG, PNG, DOCX)", ur: "منسلکہ فائل (PDF, JPG, PNG, DOCX)" },
  btnSubmitQuestion: { en: "Submit Query", ur: "سوال بھیجیں" },
  trackingSuccess: { en: "Question Submitted Successfully!", ur: "سوال کامیابی کے ساتھ جمع ہو گیا ہے!" },
  trackingNumberMsg: { en: "Your tracking number is: ", ur: "آپ کا ٹریکنگ نمبر یہ ہے: " },
  trackingStatusMsg: { en: "Status: PENDING. Please save this number for future reference.", ur: "حیثیت: زیر التواء۔ براہ کرم مستقبل کے حوالے کے لیے یہ نمبر محفوظ فرما لیں۔" },

  // Introduction Page
  introTitle: { en: "Introduction of Markazi Darul Ifta", ur: "مرکزی دارالافتاء کا تعارف" },
  introHistory: { en: "Brief History", ur: "مختصر تاریخ" },
  introHistoryText: { en: "Markazi Darul Ifta was established in Bareilly Shareef to propagate authentic Hanafi jurisprudence under the guidance of Ala Hazrat Imam Ahmad Raza Khan Al-Qadri. For decades, it has served as a beacon of Islamic guidance, answering thousands of inquiries annually from across the globe.", ur: "مرکزی دارالافتاء بریلی شریف میں اعلٰی حضرت امام احمد رضا خان القادری کے فیضانِ علم اور حنفی فقہ کے فروغ کے لیے قائم کیا گیا۔ کئی دہائیوں سے، یہ دنیا بھر کے مسلمانوں کے لیے اسلامی رہنمائی کا ایک اہم مرکز ہے جہاں سالانہ ہزاروں سوالات کے شرعی جوابات دیے جاتے ہیں۔" },
  introObjectives: { en: "Our Objectives", ur: "ہمارے مقاصد" },
  obj1: { en: "Preserving and propagating authentic Hanafi jurisprudence.", ur: "فقہ حنفی کی مستند ترویج و اشاعت۔" },
  obj2: { en: "Providing reliable, authenticated solutions to modern problems.", ur: "جدید مسائل کا قرآن و سنت کی روشنی میں حل پیش کرنا۔" },
  obj3: { en: "Digital preservation of theological fatwas for future generations.", ur: "مستقبل کی نسلوں کے لیے فتاویٰ کا ڈیجیٹل تحفظ۔" },
  timingsTitle: { en: "Office Timings", ur: "دفتر کے اوقات" },
  timingsText: { en: "Saturday to Thursday: 9:00 AM - 5:00 PM (Friday Closed)", ur: "ہفتہ تا جمعرات: صبح 9:00 بجے سے شام 5:00 بجے تک (جمعہ تعطیل)" },

  // Publishing Page
  pubTitle: { en: "Department of Publishing & Printing", ur: "شعبہ نشر و اشاعت و طباعت" },
  pubSubtitle: { en: "Preserving Islamic knowledge through physical printing and digital open access. Access books, research magazines, and booklets from Dargah Aala Hazrat.", ur: "طباعت اور ڈیجیٹل رسائی کے ذریعے اسلامی علوم کا تحفظ۔ درگاہ اعلیٰ حضرت کی کتب، تحقیقی مجلات اور رسائل تک رسائی حاصل کریں۔" },
  pubLitTitle: { en: "Islamic Literature Dissemination", ur: "اسلامی ادبیات کی ترویج و اشاعت" },
  pubLitText1: { en: "The publishing house is dedicated to editing, translating, printing, and publishing classical works of Hanafi Fiqh, theology (Aqeedah), and spirituality. In particular, we work to distribute the writings of Ala Hazrat Imam Ahmad Raza Khan Al-Qadri in modern readable prints and digital editions.", ur: "یہ شعبہ فقہ حنفی، عقائد، اور تصوف کی کلاسیکی کتب کی تحقیق، ترجمہ، طباعت اور اشاعت کے لیے وقف ہے۔ خصوصاً، اعلیٰ حضرت امام احمد رضا خان القادری کی تصنیفات کو جدید دلکش طباعت اور ڈیجیٹل ایڈیشنز میں شائع کیا جاتا ہے۔" },
  pubLitText2: { en: "Additionally, we publish the monthly research journal \"Monthly Sunni Duniya\" Urdu Magazine, containing peer-reviewed research papers and contemporary Fatwas addressing current affairs.", ur: "مزید برآں، ہم ماہنامہ تحقیقی مجلہ \"ماہنامہ سنی دنیا\" شائع کرتے ہیں، جس میں علمی و تحقیقی مضامین اور عصر حاضر کے مسائل پر مبنی فتاویٰ شامل ہوتے ہیں۔" },
  pubBookstoreTitle: { en: "Future Online Bookstore", ur: "مستقبل کا آن لائن کتب خانہ" },
  pubBookstoreText: { en: "We are working on an e-commerce platform allowing users globally to purchase high-quality printed hardcovers of Fatawa Ridwiyyah and other publications with shipping options.", ur: "ہم ایک ای کامرس پلیٹ فارم پر کام کر رہے ہیں جس کے ذریعے دنیا بھر کے صارفین فتاویٰ رضویہ اور دیگر مطبوعات کی اعلیٰ کوالٹی مجلد کتب آن لائن خرید سکیں گے۔" },
  pubComingSoon: { en: "Coming Soon", ur: "عنقریب دستیاب" },
  pubSearchLabel: { en: "Search Publications", ur: "مطبوعات تلاش کریں" },
  pubSearchPlaceholder: { en: "Search by title, description, keywords...", ur: "عنوان، تفصیل یا کلیدی الفاظ سے تلاش کریں..." },
  pubTypeLabel: { en: "Type", ur: "قسم" },
  pubAllTypes: { en: "All Types", ur: "تمام اقسام" },
  pubBooks: { en: "Books", ur: "کتب" },
  pubMagazines: { en: "Magazines", ur: "مجلات" },
  pubResearchPapers: { en: "Research Papers", ur: "تحقیقی مقالے" },
  pubCategoryLabel: { en: "Category", ur: "زمرہ" },
  pubAllCategories: { en: "All Categories", ur: "تمام زمرہ جات" },
  pubLoadingCatalog: { en: "Loading publications catalog...", ur: "مطبوعات کا کیٹلاگ لوڈ ہو رہا ہے..." },
  pubNoResults: { en: "No publications found matching your selection.", ur: "آپ کے منتخب کردہ معیار کے مطابق کوئی مطبوعات نہیں ملیں۔" },
  pubDownloadPdf: { en: "Download PDF", ur: "پی ڈی ایف ڈاؤن لوڈ کریں" },
  pubDownloadingMsg: { en: "Downloading PDF...", ur: "پی ڈی ایف ڈاؤن لوڈ ہو رہی ہے..." }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ur'); // Default to Urdu for authentic Islamic feel

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Language;
    if (savedLang === 'en' || savedLang === 'ur') {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lang', lang);
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    return key;
  };

  const isRtl = language === 'ur';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language, isRtl]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
