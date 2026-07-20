"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '../../../actions/auth';
import { getPortalQuestionDetails, submitFatwaAnswer, getAdminCategories, generateFatwaNumber } from '../../../actions/portal';
import { ArrowLeft, Save, PlusCircle, Trash, BookOpen, AlertCircle, FileText, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ReferenceInput {
  type: 'QURAN' | 'HADITH' | 'BOOK' | 'ARABIC' | 'URDU';
  bookTitle: string;
  volume: string;
  page: string;
  text: string;
}

export default function AnswerWorkspace({ params }: { params: { id: string } }) {
  const router = useRouter();

  // Loading States
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  // Data States
  const [question, setQuestion] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategoriesList, setSubCategoriesList] = useState<any[]>([]);
  const [nextFatwaNum, setNextFatwaNum] = useState('');

  // Form Fields States
  const [titleEn, setTitleEn] = useState('');
  const [titleUr, setTitleUr] = useState('');
  const [answerEn, setAnswerEn] = useState('');
  const [answerUr, setAnswerUr] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'INTERNAL' | 'DRAFT'>('PUBLIC');
  const [references, setReferences] = useState<ReferenceInput[]>([]);

  // Translation States & Helper Functions
  const [translatingTitle, setTranslatingTitle] = useState(false);
  const [translatingAnswer, setTranslatingAnswer] = useState(false);

  const translateText = async (text: string): Promise<string> => {
    if (!text.trim()) return '';
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`);
      if (!res.ok) throw new Error('Translation request failed');
      const json = await res.json();
      if (json && json[0]) {
        return json[0].map((item: any) => item[0]).join('');
      }
      return '';
    } catch (err) {
      console.error(err);
      return '';
    }
  };

  const handleAutoTranslateTitle = async () => {
    if (!titleUr) return;
    setTranslatingTitle(true);
    const translated = await translateText(titleUr);
    if (translated) {
      setTitleEn(translated);
    }
    setTranslatingTitle(false);
  };

  const handleAutoTranslateAnswer = async () => {
    if (!answerUr) return;
    setTranslatingAnswer(true);
    const translated = await translateText(answerUr);
    if (translated) {
      setAnswerEn(translated);
    }
    setTranslatingAnswer(false);
  };

  // Load Initial Data
  useEffect(() => {
    async function loadWorkspace() {
      setLoading(true);
      const session = await getMe();
      if (!session) {
        router.push('/portal/login');
        return;
      }

      // Load Question details
      const qRes = await getPortalQuestionDetails(params.id);
      if (!qRes.success || !qRes.data) {
        setError(qRes.error || 'Question details could not be retrieved.');
        setLoading(false);
        return;
      }
      setQuestion(qRes.data);
      
      // Prefill if editing/answering draft
      if (qRes.data.fatwa) {
        const f = qRes.data.fatwa;
        setTitleEn(f.titleEn);
        setTitleUr(f.titleUr);
        setAnswerEn(f.answerEn);
        setAnswerUr(f.answerUr);
        setSelectedCategory(f.categoryId);
        setSelectedSubCategory(f.subCategoryId);
        setVisibility(f.visibility as any);
        if (f.references) {
          setReferences(f.references.map((r: any) => ({
            type: r.type,
            bookTitle: r.bookTitle,
            volume: r.volume || '',
            page: r.page || '',
            text: r.text
          })));
        }
      }

      // Load Categories
      const catRes = await getAdminCategories();
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }

      // Load projected next fatwa number
      const nextNum = await generateFatwaNumber();
      setNextFatwaNum(nextNum);

      setLoading(false);
    }
    loadWorkspace();
  }, [params.id, router]);

  // Load Subcategories when Category Changes
  useEffect(() => {
    if (!selectedCategory) {
      setSubCategoriesList([]);
      setSelectedSubCategory('');
    } else {
      const catObj = categories.find(c => c.id === selectedCategory);
      if (catObj && catObj.subCategories) {
        setSubCategoriesList(catObj.subCategories);
      } else {
        setSubCategoriesList([]);
      }
    }
  }, [selectedCategory, categories]);

  // Reference management helper
  const addReference = () => {
    setReferences([
      ...references,
      { type: 'BOOK', bookTitle: '', volume: '', page: '', text: '' }
    ]);
  };

  const removeReference = (index: number) => {
    const updated = references.filter((_, i) => i !== index);
    setReferences(updated);
  };

  const updateReference = (index: number, key: keyof ReferenceInput, value: string) => {
    const updated = [...references];
    updated[index] = {
      ...updated[index],
      [key]: value
    };
    setReferences(updated);
  };

  // Submit Answering Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn || !titleUr || !answerEn || !answerUr || !selectedCategory || !selectedSubCategory) {
      alert("Please fill in all required fatwa fields.");
      return;
    }

    setSubmitLoading(true);
    const res = await submitFatwaAnswer({
      questionId: params.id,
      titleEn,
      titleUr,
      answerEn,
      answerUr,
      categoryId: selectedCategory,
      subCategoryId: selectedSubCategory,
      visibility,
      references
    });
    setSubmitLoading(false);

    if (res.success) {
      alert(`Fatwa successfully submitted! Assigned Fatwa Number: ${res.data?.fatwaNumber}`);
      router.push('/portal/dashboard');
    } else {
      alert("Submission failed: " + res.error);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500 text-sm">Loading workspace database...</div>;
  }

  if (error || !question) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-red-500 font-bold">{error || 'Workspace could not be loaded'}</p>
        <Link href="/portal/dashboard" className="text-xs text-islamic-green hover:underline">
          Go Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Toolbar */}
      <div className="flex justify-between items-center">
        <Link 
          href="/portal/dashboard" 
          className="flex items-center space-x-1.5 rtl:space-x-reverse text-xs text-slate-500 hover:text-islamic-green font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="text-xs text-slate-500 font-semibold bg-stone-100 px-3 py-1 rounded border border-stone-200">
          Target Question ID: <span className="font-mono">{question.trackingNumber}</span>
        </div>
      </div>

      {/* Question Details card */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 md:p-6 space-y-3">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Submitted Question Text</h3>
        <p className="text-base md:text-lg font-urdu text-slate-800 bg-white p-4 rounded border border-stone-200 leading-relaxed font-semibold italic">
          "{question.questionText}"
        </p>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Submitter: <strong>{question.name}</strong> ({question.city})</span>
          <span>Date: {new Date(question.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Answering Form Sheet */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
        <div className="bg-islamic-green text-white p-5 border-b border-islamic-gold flex justify-between items-center">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <BookOpen className="w-5 h-5 text-islamic-gold" />
            <h3 className="text-lg font-bold">Write Islamic Fatwa Ruling</h3>
          </div>
          <div className="text-xs font-bold text-islamic-gold">
            Next Fatwa ID: {nextFatwaNum}
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          
          {/* Categorization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Category Selection <span className="text-red-500">*</span></label>
              <select 
                required
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-islamic-gold"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nameEn} ({cat.nameUr})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Sub-Category Selection <span className="text-red-500">*</span></label>
              <select 
                required
                disabled={!selectedCategory}
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-islamic-gold disabled:opacity-50"
              >
                <option value="">Select Sub-Category</option>
                {subCategoriesList.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.nameEn} ({sub.nameUr})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600">Fatwa Title (Urdu) <span className="text-red-500">*</span></label>
                <button
                  type="button"
                  onClick={handleAutoTranslateTitle}
                  disabled={translatingTitle || !titleUr}
                  className="text-[10px] font-bold text-islamic-green hover:text-islamic-darkGreen flex items-center space-x-1 disabled:opacity-50 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-islamic-gold" />
                  <span>{translatingTitle ? 'Translating...' : 'Translate to English'}</span>
                </button>
              </div>
              <input 
                type="text"
                required
                value={titleUr}
                onChange={(e) => setTitleUr(e.target.value)}
                onBlur={() => {
                  if (!titleEn && titleUr) {
                    handleAutoTranslateTitle();
                  }
                }}
                placeholder="موضوع کا نام درج کریں"
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-islamic-gold font-urdu"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Fatwa Title (English) <span className="text-red-500">*</span></label>
              <input 
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Enter title in English"
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-islamic-gold"
              />
            </div>
          </div>

          {/* Rulings / Answers */}
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600">Fatwa Ruling (Urdu) <span className="text-red-500">*</span></label>
                <button
                  type="button"
                  onClick={handleAutoTranslateAnswer}
                  disabled={translatingAnswer || !answerUr}
                  className="text-[10px] font-bold text-islamic-green hover:text-islamic-darkGreen flex items-center space-x-1 disabled:opacity-50 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-islamic-gold" />
                  <span>{translatingAnswer ? 'Translating...' : 'Translate to English'}</span>
                </button>
              </div>
              <textarea 
                required
                rows={8}
                value={answerUr}
                onChange={(e) => setAnswerUr(e.target.value)}
                onBlur={() => {
                  if (!answerEn && answerUr) {
                    handleAutoTranslateAnswer();
                  }
                }}
                placeholder="الجواب بعون الملک الوھاب... شرعی فیصلہ یہاں تحریر کریں۔"
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-islamic-gold font-urdu text-base leading-relaxed"
              ></textarea>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Fatwa Ruling (English Translation) <span className="text-red-500">*</span></label>
              <textarea 
                required
                rows={6}
                value={answerEn}
                onChange={(e) => setAnswerEn(e.target.value)}
                placeholder="Write the English translation or explanatory text here..."
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-islamic-gold leading-relaxed"
              ></textarea>
            </div>
          </div>

          {/* References Lists */}
          <div className="space-y-4 border-t border-stone-200 pt-6">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-700 flex items-center space-x-2 rtl:space-x-reverse">
                <BookOpen className="w-4.5 h-4.5 text-islamic-gold" />
                <span>Theological Book References / حواشی و مراجع</span>
              </h4>
              <button
                type="button"
                onClick={addReference}
                className="text-xs font-bold text-islamic-green hover:text-islamic-darkGreen flex items-center space-x-1 rtl:space-x-reverse"
              >
                <PlusCircle className="w-4.5 h-4.5 text-islamic-gold" />
                <span>Add Reference Citation</span>
              </button>
            </div>

            {references.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No citations added yet. It is highly recommended to cite source reference books (Quran, Hadith, Fatawa Ridwiyyah, etc.).</p>
            ) : (
              <div className="space-y-4">
                {references.map((ref, idx) => (
                  <div key={idx} className="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeReference(idx)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    >
                      <Trash className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Ref Type</label>
                        <select
                          value={ref.type}
                          onChange={(e) => updateReference(idx, 'type', e.target.value as any)}
                          className="w-full border border-stone-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-islamic-gold"
                        >
                          <option value="BOOK">Classical Book</option>
                          <option value="QURAN">Al-Quran</option>
                          <option value="HADITH">Hadith Shareef</option>
                          <option value="ARABIC">Arabic Text</option>
                          <option value="URDU">Urdu Text</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Book / Source Title</label>
                        <input
                          type="text"
                          required
                          value={ref.bookTitle}
                          onChange={(e) => updateReference(idx, 'bookTitle', e.target.value)}
                          placeholder="e.g. Fatawa Ridwiyyah, Sahih al-Bukhari"
                          className="w-full border border-stone-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-islamic-gold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Vol.</label>
                          <input
                            type="text"
                            value={ref.volume}
                            onChange={(e) => updateReference(idx, 'volume', e.target.value)}
                            placeholder="e.g. 5"
                            className="w-full border border-stone-300 rounded px-2 py-1 text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Page</label>
                          <input
                            type="text"
                            value={ref.page}
                            onChange={(e) => updateReference(idx, 'page', e.target.value)}
                            placeholder="e.g. 182"
                            className="w-full border border-stone-300 rounded px-2 py-1 text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Reference Text Snippet</label>
                      <textarea
                        required
                        rows={2}
                        value={ref.text}
                        onChange={(e) => updateReference(idx, 'text', e.target.value)}
                        placeholder="Write the reference text snippet in Arabic or Urdu..."
                        className="w-full border border-stone-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-islamic-gold font-urdu"
                      ></textarea>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visibility and Submit */}
          <div className="border-t border-stone-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <label className="text-xs font-bold text-slate-600">Fatwa Visibility Status:</label>
              <select 
                value={visibility}
                onChange={(e: any) => setVisibility(e.target.value)}
                className="border border-stone-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-islamic-gold font-semibold"
              >
                <option value="PUBLIC">Public (Visible to everyone)</option>
                <option value="PRIVATE">Private (Answered via WhatsApp only)</option>
                <option value="INTERNAL">Internal (Visible to Muftis only)</option>
                <option value="DRAFT">Draft (Save but don't publish yet)</option>
              </select>
            </div>

            <div className="flex space-x-2 rtl:space-x-reverse w-full sm:w-auto">
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-grow sm:flex-grow-0 px-6 py-2.5 bg-islamic-gold hover:bg-amber-600 text-white rounded font-bold shadow text-xs transition-colors flex items-center justify-center space-x-1.5 rtl:space-x-reverse"
              >
                <Save className="w-4 h-4 text-white" />
                <span>{submitLoading ? 'Saving...' : 'Publish / Save Ruling'}</span>
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
