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
            <h3 className="text-lg font-bold">
              {language === 'en' ? 'Historical Legacy & Academic Foundation' : 'تاریخی پس منظر اور علمی بنیاد'}
            </h3>
          </div>
          
          <div className="space-y-4 text-slate-600 text-sm md:text-base leading-relaxed">
            <p>
              {language === 'en' 
                ? 'Markazi Darul Ifta, Bareilly Shareef is a distinguished institution dedicated to issuing authentic Islamic fatwas and providing reliable religious guidance in accordance with the Hanafi School of Islamic Jurisprudence (Fiqh-e-Hanafi). Established under the visionary patronage of Huzoor Tajush Shariah, Mufti Muhammad Akhtar Raza Khan Azhari (Rahmatullahi Ta’ala Alaih), the institution continues the glorious scholarly tradition of Aala Hazrat Imam Ahmad Raza Khan Al-Qadri (Rahmatullahi Ta’ala Alaih), whose unparalleled contributions to Islamic jurisprudence remain a guiding light for scholars across the world.'
                : 'مرکزی دارالافتاء، بریلی شریف، فقہ حنفی کے مطابق مستند شرعی فتاویٰ جاری کرنے اور قابل بھروسہ شرعی رہنمائی فراہم کرنے والا ایک مقتدر ادارہ ہے۔ حضور تاج الشریعہ مفتی محمد اختر رضا خان ازہری علیہ الرحمہ کی سرپرستی میں قائم یہ ادارہ اعلٰی حضرت امام احمد رضا خان القادری علیہ الرحمہ کی عظیم الشان علمی روایت کو آگے بڑھا رہا ہے جن کے فقہ حنفی میں گراں قدر علمی کارنامے دنیا بھر کے علماء کے لیے مشعلِ راہ ہیں۔'
              }
            </p>

            <p>
              {language === 'en' 
                ? 'To uphold the highest standards of Islamic legal research, Hazrat Allama Mufti Qazi Abdul Rahim Bastavi (Rahmatullahi Ta’ala Alaih) was entrusted with the distinguished responsibility of establishing and leading the academic foundation of Markazi Darul Ifta. Under his scholarly leadership, the institution earned recognition for its meticulous research, balanced legal reasoning, and authentic fatwa writing rooted in the classical Hanafi tradition.'
                : 'شرعی تحقیق کے اعلٰی ترین معیار کو برقرار رکھنے کے لیے، حضرت علامہ مفتی قاضی عبدالرحیم بستوی علیہ الرحمہ کو مرکزی دارالافتاء کی علمی بنیاد رکھنے اور اس کی قیادت کرنے کی اہم ذمہ داری سونپی گئی۔ ان کی علمی سربراہی میں، اس ادارے نے کلاسیکی حنفی روایت پر مبنی باریک بین تحقیق اور متوازن شرعی استدلال کے لیے شہرت حاصل کی۔'
              }
            </p>

            <p>
              {language === 'en' 
                ? 'Since its establishment, Markazi Darul Ifta has been serving Muslims by answering religious queries on matters of worship, family, inheritance, finance, social affairs, and contemporary issues. Every fatwa is issued after thorough research based on the Holy Qur’an, Sunnah, Ijma’, Qiyas, and the authoritative classical texts of the Hanafi School, while remaining faithful to the creed of Ahl al-Sunnah wa al-Jama’ah.'
                : 'اپنے قیام کے بعد سے ہی، مرکزی دارالافتاء عبادات، خاندانی معاملات، وراثت، فنانس، سماجی امور اور دیگر جدید شرعی مسائل کے جوابات فراہم کر کے امتِ مسلمہ کی خدمت کر رہا ہے۔ ہر فتویٰ قرآن و حدیث، اجماع، قیاس اور فقہ حنفی کے مستند کتب کی روشنی میں، مسلکِ اہل سنت و جماعت پر قائم رہتے ہوئے جاری کیا جاتا ہے۔'
              }
            </p>

            <p>
              {language === 'en' 
                ? 'With the blessings of Allah Almighty, the institution has become a trusted source of religious guidance for people from India and many parts of the world, preserving the rich heritage of Islamic scholarship while addressing the needs of the modern age.'
                : 'اللہ تعالٰی کے فضل و کرم سے، یہ ادارہ بھارت اور دنیا بھر کے مسلمانوں کے لیے شرعی رہنمائی کا ایک انتہائی قابل اعتماد مرکز بن چکا ہے، جو جدید دور کے تقاضوں کو پورا کرتے ہوئے اسلامی علم کی قدیم علمی وراثت کا تحفظ کر رہا ہے۔'
              }
            </p>

            <p className="font-semibold text-slate-700">
              {language === 'en' 
                ? 'Today, through this digital platform, Markazi Darul Ifta extends its services globally by enabling users to search authentic fatwas, submit religious questions, and access valuable Islamic publications, ensuring that genuine Islamic knowledge remains accessible for generations to come.'
                : 'آج، اس ڈیجیٹل پلیٹ فارم کے ذریعے، مرکزی دارالافتاء فتاویٰ کی تلاش، سوالات کی آن لائن جمع آوری اور علمی مطبوعات تک رسائی فراہم کر کے عالمی سطح پر اپنی خدمات کا دائرہ بڑھا رہا ہے، تاکہ مستند اسلامی علم آنے والی نسلوں کے لیے عام اور محفوظ رہے۔'
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
      <section className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-islamic-green">
          <ShieldCheck className="w-5 h-5 text-islamic-gold" />
          <h3 className="text-lg font-bold">Rigorous Verification & Working Procedure</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Every query submitted is processed through a strict academic workflow to guarantee theological accuracy:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="bg-stone-50 p-4 rounded border border-stone-200 space-y-1">
            <div className="text-islamic-gold font-bold text-sm">Step 1</div>
            <h5 className="font-bold text-xs text-slate-800">Submission</h5>
            <p className="text-[10px] text-slate-400">Question is logged, tracking number is issued, and placed in Pending Queue.</p>
          </div>
          <div className="bg-stone-50 p-4 rounded border border-stone-200 space-y-1">
            <div className="text-islamic-gold font-bold text-sm">Step 2</div>
            <h5 className="font-bold text-xs text-slate-800">Research & Writing</h5>
            <p className="text-[10px] text-slate-400">Assigned Mufti conducts cross-referencing with classical Arabic and Urdu books.</p>
          </div>
          <div className="bg-stone-50 p-4 rounded border border-stone-200 space-y-1">
            <div className="text-islamic-gold font-bold text-sm">Step 3</div>
            <h5 className="font-bold text-xs text-slate-800">Review Board</h5>
            <p className="text-[10px] text-slate-400">Senior board reviews and confirms accuracy, formatting, and references list.</p>
          </div>
          <div className="bg-stone-50 p-4 rounded border border-stone-200 space-y-1">
            <div className="text-islamic-gold font-bold text-sm">Step 4</div>
            <h5 className="font-bold text-xs text-slate-800">Publication</h5>
            <p className="text-[10px] text-slate-400">Fatwa receives a permanent sequence ID and automatically goes live in archives.</p>
          </div>
        </div>
      </section>

      {/* Scholars Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b border-stone-200 pb-2 flex items-center space-x-2 rtl:space-x-reverse">
          <Users className="w-5 h-5 text-islamic-gold" />
          <span>Panel of Certified Muftis</span>
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

      {/* Office Timings & Contacts */}
      <section className="bg-stone-50 rounded-lg p-5 border border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-slate-700">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Calendar className="w-5 h-5 text-islamic-gold" />
          <div>
            <strong>Office Timings:</strong> Saturday to Thursday: 9:00 AM - 5:00 PM (Friday Closed)
          </div>
        </div>
        <div>
          For urgent queries, call/WhatsApp: <strong>+91 9411699786</strong> or Email: <strong>askmuftijamiaturraza@gmail.com</strong>
        </div>
      </section>
      
    </div>
  );
}
