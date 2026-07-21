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
  pubTitle: { en: "Department of Publishing & Printing", ur: "شعبۂ نشر و اشاعت" },
  pubSubtitle: { en: "Preserving Islamic knowledge through physical printing and digital open access. Access books, research magazines, and booklets from Dargah Aala Hazrat.", ur: "الرضا مرکزی دار الاشاعت کے تحت اسلامی علمی ورثے کے تحفظ اور فروغ کے لیے مطبوعہ اور ڈیجیٹل ذرائع کے ذریعے مستند اسلامی کتب، تحقیقی رسائل، مجلات اور کتابچوں کی اشاعت کا اہتمام کیا جاتا ہے۔ درگاہِ اعلیٰ حضرت کی علمی و تحقیقی مطبوعات کا مطالعہ کریں اور انہیں بآسانی حاصل کریں۔" },
  pubLitTitle: { en: "Al-Raza Markazi Dar-ul-Isha'at", ur: "الرضا مرکزی دار الاشاعت" },
  pubLitText1: { en: "This publishing department is dedicated to editing, translating, printing, and publishing authentic books of Hanafi Fiqh, theology (Aqeedah), and spirituality (Sufism). In particular, dedicated efforts are made to publish the scholarly and research works of Ala Hazrat Imam Ahmad Raza Khan Qadri (Rahmatullah Alaih) in modern, clear, and highly readable print and digital editions.", ur: "یہ شعبۂ نشر و اشاعت فقہِ حنفی، عقیدہ اور تصوف کی مستند کتب کی تدوین، ترجمہ، طباعت اور اشاعت کے لیے وقف ہے۔ بالخصوص اعلیٰ حضرت امام احمد رضا خان قادری رحمۃ اللہ تعالیٰ علیہ کی علمی و تحقیقی تصنیفات کو جدید، واضح اور قابلِ مطالعہ مطبوعہ و ڈیجیٹل ایڈیشنز کی صورت میں عام کرنے کی کوشش کی جاتی ہے۔" },
  pubLitText2: { en: "Similarly, the institution publishes the monthly research journal \"Monthly Sunni Duniya\", featuring peer-reviewed research articles, Islamic rulings on contemporary issues, and authentic Fatwas relevant to current affairs.", ur: "اسی طرح ادارہ ماہانہ تحقیقی جریدہ ’’ماہنامہ سنّی دنیا‘‘ بھی شائع کرتا ہے، جس میں نظرِ ثانی شدہ تحقیقی مقالات، عصری مسائل پر مبنی شرعی تحقیقات اور موجودہ حالات سے متعلق مستند فتاویٰ شامل ہوتے ہیں۔" },
  pubBookstoreTitle: { en: "Future Initiative", ur: "مستقبل کا منصوبہ" },
  pubBookstoreText: { en: "We are working on a platform that will allow readers worldwide to obtain authentic Islamic publications. Through this platform, secure and reliable delivery facilities will be provided at both national and international levels.", ur: "ہم ایک ایسے پلیٹ فارم پر کام کر رہے ہیں جس کے ذریعے دنیا بھر کے قارئین مستند اسلامی مطبوعات حاصل کر سکیں گے۔ اس پلیٹ فارم کے ذریعے ملکی و بین الاقوامی سطح پر محفوظ اور قابلِ اعتماد ترسیل کی سہولت بھی فراہم کی جائے گی۔" },
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
  pubDownloadingMsg: { en: "Downloading PDF...", ur: "پی ڈی ایف ڈاؤن لوڈ ہو رہی ہے..." },

  // Wazaif Page
  wazifaTitle: { en: "Spiritual Wazaif & Remedies", ur: "روحانی وظائف و مجربات" },
  wazifaSubtitle: { en: "A collection of authenticated spiritual remedies, prayers, and Duas compiled from classical Islamic texts and guidelines of Dargah Aala Hazrat.", ur: "جامع و مستند روحانی وظائف، مسنون دعائیں اور مجرب نقوش کا مجموعہ جو علماء و مفتیانِ درگاہ اعلیٰ حضرت کی تصدیق شدہ کتب سے ماخوذ ہے۔" },
  wazifaFilterTitle: { en: "Filter Category", ur: "زمرہ جات" },
  wazifaAll: { en: "All Wazaif", ur: "تمام وظائف" },
  wazifaLoading: { en: "Loading wazaif...", ur: "وظائف لوڈ ہو رہے ہیں..." },
  wazifaNoResults: { en: "No Wazaif found in this category.", ur: "اس زمرے میں کوئی وظیفہ دستیاب نہیں ہے۔" },
  wazifaUrduTrans: { en: "Urdu Translation:", ur: "اردو ترجمہ:" },
  wazifaEngTrans: { en: "English Translation:", ur: "انگریزی ترجمہ:" },
  wazifaMethod: { en: "Recitation Method:", ur: "پڑھنے کا طریقہ:" },
  wazifaBenefits: { en: "Benefits & Virtue:", ur: "فضائل و برکات:" },
  wazifaSource: { en: "Source Reference:", ur: "حوالہ و مآخذ:" },

  // Contact Page
  contactSubtitle: { en: "Get in touch with the administrative office of Markazi Darul Ifta Bareilly Shareef.", ur: "مرکزی دارالافتاء بریلی شریف کے انتظامی دفتر سے رابطہ کریں۔" },
  contactAddressTitle: { en: "Address", ur: "پتہ" },
  contactAddr1Lbl: { en: "Address 1:", ur: "پتہ 1:" },
  contactAddr1Txt: { en: "No 82, Dargah Aala Hazrat, Saudagaran, Bareilly Shareef India", ur: "نمبر 82، درگاہ اعلیٰ حضرت، سوداگران، بریلی شریف، انڈیا" },
  contactAddr2Lbl: { en: "Address 2:", ur: "پتہ 2:" },
  contactAddr2Txt: { en: "Center of Islamic Studies Jamiatur Raza, Mathurapur, C B Ganj, Bareilly Shareef India", ur: "جامعۃ الرضا ریسرچ سینٹر، مٹھوراپور، سی بی گنج، بریلی شریف، انڈیا" },
  contactPhoneTitle: { en: "Phone & WhatsApp", ur: "فون و واٹس ایپ" },
  contactEmailTitle: { en: "Email", ur: "ای میل ایڈریس" },
  contactHoursTitle: { en: "Office Hours", ur: "دفتر کے اوقات" },
  contactHoursTxt: { en: "Saturday - Thursday: 8:00 AM - 02:30 PM", ur: "ہفتہ تا جمعرات: صبح 8:00 بجے تا دوپہر 2:30 بجے" },
  contactClosedTxt: { en: "(Friday Closed)", ur: "(جمعہ تعطیل)" },
  contactFormTitle: { en: "Send us a Message", ur: "ہمیں پیغام بھیجیں" },
  contactFormSubtitle: { en: "For general administrative inquiries, feedback, or publication requests.", ur: "عام انتظامی امور، فیڈ بیک یا مطبوعات کی درخواست کے لیے فارم پر کریں۔" },
  contactSuccessMsg: { en: "Your message has been sent successfully. We will respond shortly!", ur: "آپ کا پیغام کامیابی کے ساتھ موصول ہو گیا ہے۔ ہم جلد از جلد آپ کو جواب دیں گے!" },
  contactLblName: { en: "Your Name", ur: "آپ کا نام" },
  contactLblEmail: { en: "Email Address", ur: "ای میل ایڈریس" },
  contactLblSubject: { en: "Subject", ur: "موضوع" },
  contactLblMessage: { en: "Message", ur: "پیغام" },
  contactBtnSend: { en: "Send Message", ur: "پیغام ارسال کریں" },
  contactBtnSending: { en: "Sending...", ur: "ارسال ہو رہا ہے..." },
  contactLocationTitle: { en: "Office Location", ur: "دفتر کا مقام" },
  contactLocationSub: { en: "Located near the holy shrine (Dargah) of Aala Hazrat Imam Ahmad Raza Khan in Bareilly.", ur: "بریلی شریف میں اعلٰی حضرت امام احمد رضا خان کے مزارِ اقدس کے نزدیک واقع ہے۔" },
  contactLocationAddress: { en: "Saudagaran, Bareilly Shareef, Uttar Pradesh, India", ur: "سوداگران، بریلی شریف، اتر پردیش، انڈیا" },
  contactOpenMaps: { en: "Open in Google Maps", ur: "گوگل میپس پر دیکھیں" }
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
