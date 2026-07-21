"use client";

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Calendar, Users, Award, Landmark, BookOpen } from 'lucide-react';

export default function Introduction() {
  const { language } = useLanguage();

  const scholars = [
    {
      nameEn: 'Hazrat Allama Mufti Muhammad Asjad Raza Khan Qadri Razvi',
      nameUr: 'حضرت علامہ مفتی محمد اسجد رضا خان قادری رضوی',
      title: 'Chief Mufti, Grand Mufti of India',
      qualification: 'Specialization in Hanafi Jurisprudence (Ifta) & Islamic Theology',
      bio: 'Grand Mufti of India, serving as the supreme religious authority and head of Markazi Darul Ifta, Bareilly Shareef.'
    },
    {
      nameEn: 'Hazrat Allama Mufti Muhammad Nazim Ali Qadri',
      nameUr: 'حضرت علامہ مفتی محمد ناظم علی قادری',
      title: 'Senior Mufti, Markazi Darul Ifta',
      qualification: 'Darse Nizami & Ifta Specialization (Jamiatur Raza, Bareilly Shareef)',
      bio: 'Senior Mufti and teacher of Islamic jurisprudence at Markazi Darul Ifta, specialized in classical Hanafi law.'
    },
    {
      nameEn: 'Hazrat Allama Mufti Muhammad Afzaal Razvi',
      nameUr: 'حضرت علامہ مفتی محمد افضال رضوی',
      title: 'Senior Mufti, Markazi Darul Ifta',
      qualification: 'Specialization in Hanafi Law & Alim Degree (Bareilly Shareef)',
      bio: 'Senior Mufti at Markazi Darul Ifta, overseeing complex family and commercial law queries.'
    },
    {
      nameEn: 'Hazrat Allama Mufti Muhammad Ashiq Husain Kashmiri',
      nameUr: 'حضرت علامہ مفتی محمد عاشق حسین کشمیری',
      title: 'Senior Mufti, Markazi Darul Ifta',
      qualification: 'Alim & Mufti Degree, Specialized Hanafi Ifta Training',
      bio: 'Senior Mufti at Markazi Darul Ifta, reviewing fatwa compilation and religious queries.'
    },
    {
      nameEn: 'Hazrat Allama Mufti Muhammad Belal Anwar Markazi',
      nameUr: 'حضرت علامہ مفتی محمد بلال انور مرکزی',
      title: 'Senior Mufti, Markazi Darul Ifta',
      qualification: 'Specialization in Islamic Jurisprudence & Classical Hanafi Fiqh',
      bio: 'Senior Mufti at Markazi Darul Ifta, specializing in heritage distribution and public queries.'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-stone-50 via-emerald-50/20 to-amber-50/20 p-8 rounded-xl border border-stone-200/60 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-bold text-islamic-green">
          {language === 'en' ? 'Markazi Darul Ifta' : 'مرکزی دارالافتاء'}
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-2 font-semibold">
          {language === 'en' 
            ? 'Continuing the Legacy of Authentic Islamic Scholarship' 
            : 'مستند اسلامی علم کی وراثت کا تسلسل'
          }
        </p>
      </section>

      {/* History Legacy Content */}
      <section className="bg-white rounded-xl p-8 shadow-sm border border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-islamic-green">
            <Landmark className="w-5 h-5 text-islamic-gold" />
            <h3 className={`text-slate-800 ${language === 'ur' ? 'text-2xl md:text-3xl font-normal font-urdu' : 'text-lg font-bold'}`}>
              {language === 'en' ? 'Historical Heritage & Academic Foundation' : 'تاریخی ورثہ اور علمی بنیاد'}
            </h3>
          </div>
          
          <div className="space-y-4 text-slate-600 text-sm md:text-base leading-relaxed">
            <p className={language === 'ur' ? 'font-urdu font-normal text-base md:text-lg text-slate-800 leading-loose' : ''}>
              {language === 'en' 
                ? 'Markazi Darul Ifta, Bareilly Shareef is a premier Islamic institution established to issue authentic shariah fatwas and provide reliable religious guidance to the Muslim Ummah in accordance with Hanafi jurisprudence (Fiqh-e-Hanafi). The institution was founded under the visionary patronage of Huzoor Tajush Shariah, Hazrat Allama Mufti Muhammad Akhtar Raza Khan Azhari (Rahmatullahi Ta’ala Alaih), to uphold and preserve the grand scholarly and legal tradition of Aala Hazrat Imam Ahmad Raza Khan Al-Qadri (Rahmatullahi Ta’ala Alaih). Aala Hazrat’s unprecedented contributions in Islamic jurisprudence, legal research, and ijtihad remain a guiding beacon for scholars and jurists across the globe.'
                : 'مرکزی دارالافتاء، بریلی شریف ایک ممتاز دینی ادارہ ہے جو فقہِ حنفی کی روشنی میں مستند شرعی فتاویٰ جاری کرنے اور امتِ مسلمہ کو قابلِ اعتماد دینی رہنمائی فراہم کرنے کے لیے قائم کیا گیا ہے۔ اس ادارے کی بنیاد حضور تاج الشریعہ حضرت علامہ مفتی محمد اختر رضا خان ازہری رحمۃ اللہ تعالیٰ علیہ کی بصیرت افروز سرپرستی میں رکھی گئی، تاکہ اعلیٰ حضرت امام احمد رضا خان قادری رحمۃ اللہ تعالیٰ علیہ کی عظیم علمی و فقہی روایت کو زندہ رکھا جائے۔ اعلیٰ حضرت کی فقہِ اسلامی، تحقیق اور اجتہاد کے میدان میں بے مثال خدمات آج بھی دنیا بھر کے علماء و مفتیانِ کرام کے لیے مشعلِ راہ ہیں۔'
              }
            </p>

            <p className={language === 'ur' ? 'font-urdu font-normal text-base md:text-lg text-slate-800 leading-loose' : ''}>
              {language === 'en' 
                ? 'To fortify and consolidate the academic foundation of Markazi Darul Ifta, Hazrat Allama Mufti Qazi Abdul Rahim Bastavi (Rahmatullahi Ta’ala Alaih) was entrusted with the essential responsibility of its establishment and scholarly leadership. Under his erudite guidance and research insight, Markazi Darul Ifta attained a distinguished status in the fields of jurisprudential research, balanced legal reasoning, and authentic fatwa writing, establishing a solid foundation for research and Ifta rooted in classical Hanafi tradition.'
                : 'مرکزی دارالافتاء کی علمی بنیاد کو مضبوط اور مستحکم کرنے کے لیے حضرت علامہ مفتی قاضی عبد الرحیم بستوی رحمۃ اللہ تعالیٰ علیہ کو اس ادارے کی تاسیس اور علمی قیادت کی ذمہ داری سونپی گئی۔ آپ کی عالمانہ نگرانی اور تحقیقی بصیرت کے نتیجے میں مرکزی دارالافتاء نے فقہی تحقیق، معتدل استدلال اور مستند فتویٰ نویسی کے میدان میں نمایاں مقام حاصل کیا، اور فقہِ حنفی کی کلاسیکی علمی روایت کے مطابق تحقیق و افتاء کی مضبوط بنیاد قائم ہوئی۔'
              }
            </p>

            <p className={language === 'ur' ? 'font-urdu font-normal text-base md:text-lg text-slate-800 leading-loose' : ''}>
              {language === 'en' 
                ? 'Since its inception, Markazi Darul Ifta has been fulfilling the noble duty of guiding the Muslim Ummah in matters of worship, transactions, family law, inheritance, financial affairs, social issues, and modern contemporary challenges. Every fatwa issued here is compiled after thorough research and verification in light of the Holy Qur’an, Sunnah of the Prophet ﷺ, consensus (Ijma), analogical deduction (Qiyas), and authentic classical books of Hanafi jurisprudence, adhering strictly at every stage to the established creed and principles of Ahl al-Sunnah wa al-Jama’ah.'
                : 'قیامِ ادارہ سے لے کر آج تک مرکزی دارالافتاء عبادات، معاملات، عائلی مسائل، وراثت، مالی امور، سماجی معاملات اور پیش آمدہ عصری مسائل میں امتِ مسلمہ کی شرعی رہنمائی کا فریضہ انجام دے رہا ہے۔ یہاں جاری ہونے والا ہر فتویٰ قرآنِ مجید، سنتِ نبوی ﷺ، اجماعِ امت، قیاسِ شرعی اور فقہِ حنفی کی معتبر و مستند کتب کی روشنی میں مکمل تحقیق و تدقیق کے بعد مرتب کیا جاتا ہے، جبکہ ہر مرحلے پر مسلکِ اہلِ سنت و جماعت کے مسلمہ عقائد و اصول کی مکمل پاسداری کی جاتی ہے۔'
              }
            </p>

            <p className={language === 'ur' ? 'font-urdu font-normal text-base md:text-lg text-slate-800 leading-loose' : ''}>
              {language === 'en' 
                ? 'By the grace and mercy of Allah Almighty, Markazi Darul Ifta has become a highly trusted center of authentic religious guidance for Muslims not only in India but across various countries worldwide. While striving to safeguard and promote Islamic scholarly and jurisprudential heritage, the institution simultaneously provides research-backed, insightful Shariah solutions for modern-day issues.'
                : 'اللہ تعالیٰ کے فضل و کرم سے مرکزی دارالافتاء آج نہ صرف ہندوستان بلکہ دنیا کے مختلف ممالک میں بسنے والے مسلمانوں کے لیے مستند دینی رہنمائی کا معتبر مرکز بن چکا ہے۔ یہ ادارہ ایک جانب اسلامی علمی و فقہی ورثے کے تحفظ اور فروغ کے لیے کوشاں ہے، تو دوسری جانب جدید دور میں پیش آنے والے مسائل کا شرعی حل بھی تحقیق و بصیرت کے ساتھ پیش کرتا ہے۔'
              }
            </p>

            <p className={language === 'ur' ? 'font-urdu font-normal text-base md:text-lg text-slate-800 leading-loose' : 'font-semibold text-slate-700'}>
              {language === 'en' 
                ? 'To further expand this mission, Markazi Darul Ifta has disseminated its services globally through this digital platform, where users can search authentic fatwas, submit their religious queries directly to qualified Muftis, and benefit from valuable Islamic books, journals, and research publications. Our steadfast commitment is to preserve authentic Islamic knowledge, propagate it widely, and pass it on effortlessly to future generations.'
                : 'اسی مقصد کو مزید وسعت دینے کے لیے مرکزی دارالافتاء نے اپنی خدمات کو ڈیجیٹل پلیٹ فارم کے ذریعے عالمی سطح پر عام کیا ہے، جہاں صارفین مستند فتاویٰ تلاش کر سکتے ہیں، اپنے شرعی سوالات براہِ راست مفتیانِ کرام کو ارسال کر سکتے ہیں، اور قیمتی اسلامی کتب، رسائل اور تحقیقی مطبوعات سے استفادہ کر سکتے ہیں۔ ہمارا عزم ہے کہ مستند اسلامی علم کو محفوظ رکھا جائے، اسے عام کیا جائے، اور آنے والی نسلوں تک آسانی سے پہنچایا جائے۔'
              }
            </p>
          </div>
        </div>

        <div className="bg-stone-50 border border-stone-200 p-6 rounded-lg text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-islamic-gold/10 text-islamic-gold flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Under the Aegis of</h4>
          <p className="text-xs text-slate-700 font-bold">Imam Ahmad Raza Trust</p>
          <p className="text-[10px] text-slate-500">
            No 82, Dargah Aala Hazrat, Saudagaran, Bareilly Shareef India
          </p>
        </div>
      </section>

      {/* Working Procedure */}
      <section className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-islamic-green">
          <ShieldCheck className="w-6 h-6 text-islamic-gold" />
          <h3 className={`text-slate-800 ${language === 'ur' ? 'text-2xl md:text-3xl font-normal font-urdu' : 'text-lg md:text-xl font-bold'}`}>
            {language === 'en' ? 'Rigorous Research & Working Procedure' : 'تحقیقی و تدقیقی طریقۂ کار'}
          </h3>
        </div>
        <p className={`text-slate-600 leading-relaxed ${language === 'ur' ? 'text-base md:text-lg font-normal font-urdu' : 'text-sm md:text-base'}`}>
          {language === 'en'
            ? 'At Markazi Darul Ifta, Bareilly Shareef, every religious query received is processed through a structured academic methodology to ensure that every fatwa is issued based on authentic Shariah proofs and Hanafi principles.'
            : 'مرکزی دارالافتاء، بریلی شریف میں موصول ہونے والے ہر شرعی سوال کو ایک منظم اور تحقیقی طریقۂ کار کے تحت مکمل کیا جاتا ہے، تاکہ ہر فتویٰ مستند شرعی دلائل اور فقہِ حنفی کے اصولوں کے مطابق جاری ہو۔'
          }
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-stone-50 p-5 rounded-lg border border-stone-200 space-y-2 hover:border-islamic-gold transition-colors">
            <div className="text-islamic-gold font-bold text-xs uppercase tracking-wider">
              {language === 'en' ? 'Step 1' : 'مرحلہ ۱'}
            </div>
            <h5 className={`text-slate-800 ${language === 'ur' ? 'text-lg font-normal font-urdu' : 'font-bold text-sm'}`}>
              {language === 'en' ? 'Receipt of Query' : 'سوال کی وصولی'}
            </h5>
            <p className={`text-slate-600 leading-relaxed ${language === 'ur' ? 'text-sm font-urdu font-normal' : 'text-xs'}`}>
              {language === 'en'
                ? 'Every question is logged, assigned a unique tracking reference number, and placed in the pending queue for review.'
                : 'ہر سوال کا اندراج کیا جاتا ہے، اسے ایک منفرد حوالہ نمبر دیا جاتا ہے اور قابلِ غور ہونے کی صورت میں اس سوال کو زیرِ التواء رکھا جاتا ہے۔'
              }
            </p>
          </div>

          <div className="bg-stone-50 p-5 rounded-lg border border-stone-200 space-y-2 hover:border-islamic-gold transition-colors">
            <div className="text-islamic-gold font-bold text-xs uppercase tracking-wider">
              {language === 'en' ? 'Step 2' : 'مرحلہ ۲'}
            </div>
            <h5 className={`text-slate-800 ${language === 'ur' ? 'text-lg font-normal font-urdu' : 'font-bold text-sm'}`}>
              {language === 'en' ? 'Research & Drafting' : 'تحقیق و تدوین'}
            </h5>
            <p className={`text-slate-600 leading-relaxed ${language === 'ur' ? 'text-sm font-urdu font-normal' : 'text-xs'}`}>
              {language === 'en'
                ? 'The assigned Mufti conducts thorough research and drafts the response in light of the Holy Qur’an, Sunnah, and authoritative Hanafi texts.'
                : 'مفتی صاحب قرآنِ کریم، سنتِ نبوی ﷺ اور فقہِ حنفی کی معتبر کتب کی روشنی میں مکمل تحقیق کے بعد جواب تیار کرتے ہیں۔'
              }
            </p>
          </div>

          <div className="bg-stone-50 p-5 rounded-lg border border-stone-200 space-y-2 hover:border-islamic-gold transition-colors">
            <div className="text-islamic-gold font-bold text-xs uppercase tracking-wider">
              {language === 'en' ? 'Step 3' : 'مرحلہ ۳'}
            </div>
            <h5 className={`text-slate-800 ${language === 'ur' ? 'text-lg font-normal font-urdu' : 'font-bold text-sm'}`}>
              {language === 'en' ? 'Review of Fatwa' : 'فتوے کا جائزہ'}
            </h5>
            <p className={`text-slate-600 leading-relaxed ${language === 'ur' ? 'text-sm font-urdu font-normal' : 'text-xs'}`}>
              {language === 'en'
                ? 'Once drafted, the response undergoes a deep and meticulous review by senior scholars to prevent any errors.'
                : 'جواب تیار ہونے کے بعد اس کو دوبارہ بنظر عمیق ملاحظہ کیا جاتا ہے، تاکہ غلطیوں سے بچا جا سکے۔'
              }
            </p>
          </div>

          <div className="bg-stone-50 p-5 rounded-lg border border-stone-200 space-y-2 hover:border-islamic-gold transition-colors">
            <div className="text-islamic-gold font-bold text-xs uppercase tracking-wider">
              {language === 'en' ? 'Step 4' : 'مرحلہ ۴'}
            </div>
            <h5 className={`text-slate-800 ${language === 'ur' ? 'text-lg font-normal font-urdu' : 'font-bold text-sm'}`}>
              {language === 'en' ? 'Publication' : 'اشاعت'}
            </h5>
            <p className={`text-slate-600 leading-relaxed ${language === 'ur' ? 'text-sm font-urdu font-normal' : 'text-xs'}`}>
              {language === 'en'
                ? 'Upon final approval, the fatwa is assigned a permanent sequence number and published in the online archive as a permanent record.'
                : 'فتویٰ تیار ہونے کے بعد اسے مستقل نمبر دیا جاتا ہے اور پھر آن لائن ذخیرۂ فتاویٰ میں شائع کر دیا جاتا ہے، جہاں وہ مستقل ریکارڈ کا حصہ بن جاتا ہے۔'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Scholars Section (Temporarily Hidden) */}
      {/* 
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b border-stone-200 pb-2 flex items-center space-x-2 rtl:space-x-reverse">
          <Users className="w-5 h-5 text-islamic-gold" />
          <span>{language === 'en' ? 'Panel of Certified Muftis' : 'مفتیانِ کرام کا پینل'}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scholars.map((scholar, idx) => (
            <div key={idx} className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm space-y-3 hover:border-islamic-gold transition-colors">
              <div>
                <h4 className="font-bold text-slate-900 text-base md:text-lg font-urdu">
                  {language === 'en' ? scholar.nameEn : scholar.nameUr}
                </h4>
                <p className="text-xs font-semibold text-islamic-gold">{scholar.title}</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed border-t border-stone-100 pt-2">
                <strong>Qualification:</strong> {scholar.qualification}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed font-urdu">
                {scholar.bio}
              </p>
            </div>
          ))}
        </div>
      </section>
      */}

      {/* Office Timings & Contacts */}
      <section className="bg-stone-50 rounded-lg p-5 border border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-slate-700">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Calendar className="w-5 h-5 text-islamic-gold" />
          <div className={language === 'ur' ? 'font-urdu text-sm' : ''}>
            <strong>{language === 'en' ? 'Office Timings:' : 'اوقاتِ کار:'}</strong>{' '}
            {language === 'en' 
              ? 'Saturday to Thursday: 8:00 AM - 02:30 PM (Friday Closed)' 
              : 'ہفتہ تا جمعرات: صبح ۸:۰۰ بجے سے دوپہر ۰۲:۳۰ بجے تک (جمعہ تعطیل)'
            }
          </div>
        </div>
        <div className={language === 'ur' ? 'font-urdu text-sm' : ''}>
          {language === 'en' ? (
            <>
              For urgent queries, call/WhatsApp: <strong>9058879712, 0581-2458543</strong>
            </>
          ) : (
            <>
              فوری شرعی رہنمائی اور رابطے کے لیے کال / واٹس ایپ: <strong>۹۰۵۸۸۷۹۷۱۲، ۰۵۸۱-۲۴۵۸۵۴۳</strong>
            </>
          )}
        </div>
      </section>
      
    </div>
  );
}
