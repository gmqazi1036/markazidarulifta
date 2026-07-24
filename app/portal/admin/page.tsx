"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '../../actions/auth';
import { 
  getAdminCategories, 
  createCategory, 
  createSubCategory, 
  toggleCategoryStatus, 
  mergeCategories, 
  createMuftiProfile, 
  getAuditLogs,
  getMuftiProfiles,
  updateMuftiProfile,
  createWazifa,
  deleteWazifa,
  updateWazifa,
  createBook,
  deleteBook,
  updateBook,
  translateArabicText
} from '../../actions/portal';
import { getWazaif, getBooks } from '../../actions/public';
import { Shield, PlusCircle, UserPlus, GitMerge, FileText, CheckCircle, RefreshCw, XCircle, Users, Edit3, Trash2, BookOpen, Sparkles, Languages, Upload, Download, Trash, Book } from 'lucide-react';
import Link from 'next/link';

export default function AdminPanel() {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'scholars' | 'wazaif_books'>('scholars');

  // Loading States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [muftis, setMuftis] = useState<any[]>([]);
  const [wazaif, setWazaif] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);

  // Category Form States
  const [newCatEn, setNewCatEn] = useState('');
  const [newCatUr, setNewCatUr] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [newSubEn, setNewSubEn] = useState('');
  const [newSubUr, setNewSubUr] = useState('');
  
  // Merge Categories States
  const [mergeSource, setMergeSource] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');

  // Mufti Form States
  const [editingMuftiId, setEditingMuftiId] = useState<string | null>(null);
  const [muftiEmail, setMuftiEmail] = useState('');
  const [muftiPassword, setMuftiPassword] = useState('');
  const [muftiNameEn, setMuftiNameEn] = useState('');
  const [muftiNameUr, setMuftiNameUr] = useState('');
  const [muftiEmpId, setMuftiEmpId] = useState('');
  const [muftiDesig, setMuftiDesig] = useState('Mufti');
  const [muftiJoinDate, setMuftiJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [muftiQual, setMuftiQual] = useState('Darse Nizami, Specialized Ifta Course');
  const [muftiSpec, setMuftiSpec] = useState('Fiqh Hanafi (Islamic Jurisprudence)');
  const [muftiMobile, setMuftiMobile] = useState('');
  const [muftiStatus, setMuftiStatus] = useState('ACTIVE');
  const [adminHijriOffset, setAdminHijriOffset] = useState(0);

  // Wazifa Form States
  const [wazifaTitle, setWazifaTitle] = useState('');
  const [wazifaArabic, setWazifaArabic] = useState('');
  const [wazifaUrdu, setWazifaUrdu] = useState('');
  const [wazifaEnglish, setWazifaEnglish] = useState('');
  const [wazifaBenefits, setWazifaBenefits] = useState('');
  const [wazifaMethod, setWazifaMethod] = useState('');
  const [wazifaReferences, setWazifaReferences] = useState('');
  const [wazifaCategory, setWazifaCategory] = useState('Peace of Mind');
  const [translating, setTranslating] = useState(false);

  // Book Form States
  const [bookTitle, setBookTitle] = useState('');
  const [bookCategory, setBookCategory] = useState('Islamic Jurisprudence');
  const [bookDescription, setBookDescription] = useState('');
  const [bookType, setBookType] = useState('BOOK');
  const [bookCover, setBookCover] = useState<{ base64: string; fileName: string } | null>(null);
  const [bookDownloadUrl, setBookDownloadUrl] = useState('');

  // Editing States
  const [editingWazifaId, setEditingWazifaId] = useState<string | null>(null);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    const session = await getMe();
    if (!session || session.role !== 'SUPER_ADMIN') {
      router.push('/portal/dashboard');
      return;
    }

    const catRes = await getAdminCategories();
    if (catRes.success && catRes.data) setCategories(catRes.data);

    const logRes = await getAuditLogs();
    if (logRes.success && logRes.data) setAuditLogs(logRes.data);

    const muftisRes = await getMuftiProfiles();
    if (muftisRes.success && muftisRes.data) setMuftis(muftisRes.data);

    const wazaifRes = await getWazaif('all');
    if (wazaifRes.success && wazaifRes.data) setWazaif(wazaifRes.data);

    const booksRes = await getBooks();
    if (booksRes.success && booksRes.data) setBooks(booksRes.data);

    try {
      const { getGlobalHijriOffset } = await import('../../actions/public');
      const offset = await getGlobalHijriOffset();
      setAdminHijriOffset(offset);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  const handleUpdateHijriOffset = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const { updateGlobalHijriOffset } = await import('../../actions/portal');
      const res = await updateGlobalHijriOffset(adminHijriOffset);
      if (res.success) {
        alert("Global Hijri Date offset calibrated successfully!");
        loadData();
      } else {
        alert("Error: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
    setActionLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [router]);

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatEn || !newCatUr) return;
    setActionLoading(true);
    const res = await createCategory(newCatEn.trim(), newCatUr.trim());
    setActionLoading(false);
    if (res.success) {
      alert("Category created successfully!");
      setNewCatEn('');
      setNewCatUr('');
      loadData();
    } else {
      alert("Error: " + res.error);
    }
  };

  // Create Subcategory
  const handleCreateSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || !newSubEn || !newSubUr) return;
    setActionLoading(true);
    const res = await createSubCategory(selectedCatId, newSubEn.trim(), newSubUr.trim());
    setActionLoading(false);
    if (res.success) {
      alert("Sub-Category created successfully!");
      setNewSubEn('');
      setNewSubUr('');
      loadData();
    } else {
      alert("Error: " + res.error);
    }
  };

  // Toggle Active State
  const handleToggleCategory = async (id: string, currentStatus: boolean) => {
    if (!confirm("Are you sure you want to change the status of this category?")) return;
    setActionLoading(true);
    const res = await toggleCategoryStatus(id, !currentStatus);
    setActionLoading(false);
    if (res.success) {
      loadData();
    } else {
      alert("Action failed: " + res.error);
    }
  };

  // Merge Categories
  const handleMergeCategories = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeSource || !mergeTarget) return;
    if (mergeSource === mergeTarget) {
      alert("Source and target categories cannot be the same.");
      return;
    }
    if (!confirm("WARNING: This will move all sub-categories and Fatwas from the source category to the target category, and then delete the source category. This action is irreversible. Proceed?")) {
      return;
    }

    setActionLoading(true);
    const res = await mergeCategories(mergeSource, mergeTarget);
    setActionLoading(false);
    if (res.success) {
      alert("Categories merged successfully!");
      setMergeSource('');
      setMergeTarget('');
      loadData();
    } else {
      alert("Merge failed: " + res.error);
    }
  };

  // Reset Mufti Form
  const resetMuftiForm = () => {
    setEditingMuftiId(null);
    setMuftiEmail('');
    setMuftiPassword('');
    setMuftiNameEn('');
    setMuftiNameUr('');
    setMuftiEmpId('');
    setMuftiDesig('Mufti');
    setMuftiJoinDate(new Date().toISOString().split('T')[0]);
    setMuftiQual('Darse Nizami, Specialized Ifta Course');
    setMuftiSpec('Fiqh Hanafi (Islamic Jurisprudence)');
    setMuftiMobile('');
    setMuftiStatus('ACTIVE');
  };

  // Populate form for editing
  const startEditingMufti = (user: any) => {
    const p = user.muftiProfile;
    if (!p) return;
    setEditingMuftiId(user.id);
    setMuftiEmail(user.email);
    setMuftiPassword('');
    setMuftiNameEn(p.nameEn);
    setMuftiNameUr(p.nameUr);
    setMuftiEmpId(p.employeeId);
    setMuftiDesig(p.designation);
    setMuftiJoinDate(new Date(p.joiningDate).toISOString().split('T')[0]);
    setMuftiQual(p.qualification);
    setMuftiSpec(p.specialization);
    setMuftiMobile(p.mobile);
    setMuftiStatus(p.status);
    window.scrollTo({ top: document.getElementById('mufti-form-container')?.offsetTop || 0, behavior: 'smooth' });
  };

  // Submit Handler for Provision / Edit Mufti Profile
  const handleCreateOrUpdateMufti = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!muftiEmail || !muftiNameEn || !muftiNameUr || !muftiEmpId || !muftiMobile) {
      alert("Please fill all required fields.");
      return;
    }

    setActionLoading(true);
    if (editingMuftiId) {
      // Edit mode
      const res = await updateMuftiProfile(editingMuftiId, {
        email: muftiEmail.trim(),
        password: muftiPassword.trim() ? muftiPassword : undefined,
        nameEn: muftiNameEn.trim(),
        nameUr: muftiNameUr.trim(),
        employeeId: muftiEmpId.trim(),
        designation: muftiDesig.trim(),
        joiningDate: muftiJoinDate,
        qualification: muftiQual.trim(),
        specialization: muftiSpec.trim(),
        mobile: muftiMobile.trim(),
        status: muftiStatus
      });
      setActionLoading(false);

      if (res.success) {
        alert("Mufti Profile updated successfully!");
        resetMuftiForm();
        loadData();
      } else {
        alert("Profile update failed: " + res.error);
      }
    } else {
      // Create mode
      if (!muftiPassword) {
        alert("Password is required for new accounts.");
        setActionLoading(false);
        return;
      }
      const res = await createMuftiProfile({
        email: muftiEmail.trim(),
        passwordHash: muftiPassword,
        nameEn: muftiNameEn.trim(),
        nameUr: muftiNameUr.trim(),
        employeeId: muftiEmpId.trim(),
        designation: muftiDesig.trim(),
        joiningDate: muftiJoinDate,
        qualification: muftiQual.trim(),
        specialization: muftiSpec.trim(),
        mobile: muftiMobile.trim()
      });
      setActionLoading(false);

      if (res.success) {
        alert("Mufti Account and Profile created successfully!");
        resetMuftiForm();
        loadData();
      } else {
        alert("Profile creation failed: " + res.error);
      }
    }
  };

  // Toggle Mufti active state directly
  const handleToggleMuftiStatus = async (user: any) => {
    const p = user.muftiProfile;
    if (!p) return;
    const nextStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!confirm(`Are you sure you want to ${nextStatus === 'ACTIVE' ? 'activate' : 'deactivate'} Mufti ${p.nameEn}?`)) return;

    setActionLoading(true);
    const res = await updateMuftiProfile(user.id, {
      email: user.email,
      nameEn: p.nameEn,
      nameUr: p.nameUr,
      employeeId: p.employeeId,
      designation: p.designation,
      joiningDate: p.joiningDate,
      qualification: p.qualification,
      specialization: p.specialization,
      mobile: p.mobile,
      status: nextStatus
    });
    setActionLoading(false);

    if (res.success) {
      loadData();
    } else {
      alert("Action failed: " + res.error);
    }
  };

  // Handle Arabic Translation (Client-Side fetch to bypass server sandboxing restrictions)
  const handleTranslateArabicText = async () => {
    if (!wazifaArabic.trim()) return;
    setTranslating(true);
    try {
      const encodedText = encodeURIComponent(wazifaArabic.trim());
      
      // Fetch Urdu Translation
      const urRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=ur&dt=t&q=${encodedText}`);
      if (!urRes.ok) throw new Error("Urdu translation request failed.");
      const urData = await urRes.json();
      const translationUr = urData?.[0]?.map((s: any) => s[0]).join('') || '';

      // Fetch English Translation
      const enRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodedText}`);
      if (!enRes.ok) throw new Error("English translation request failed.");
      const enData = await enRes.json();
      const translationEn = enData?.[0]?.map((s: any) => s[0]).join('') || '';

      if (translationUr && translationEn) {
        setWazifaUrdu(translationUr);
        setWazifaEnglish(translationEn);
      } else {
        alert("Translation succeeded but returned empty values.");
      }
    } catch (err: any) {
      console.error("Client translation error:", err);
      alert("Translation failed: " + (err.message || "Network error."));
    } finally {
      setTranslating(false);
    }
  };

  // Upload/Edit Wazifa Form submit
  const handleUploadWazifa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wazifaTitle || !wazifaArabic || !wazifaUrdu || !wazifaEnglish || !wazifaBenefits || !wazifaMethod || !wazifaCategory) {
      alert("Please fill all required fields for Wazifa.");
      return;
    }

    setActionLoading(true);
    let res;
    if (editingWazifaId) {
      res = await updateWazifa(editingWazifaId, {
        title: wazifaTitle.trim(),
        arabicText: wazifaArabic.trim(),
        translationUr: wazifaUrdu.trim(),
        translationEn: wazifaEnglish.trim(),
        benefits: wazifaBenefits.trim(),
        method: wazifaMethod.trim(),
        references: wazifaReferences.trim() || undefined,
        category: wazifaCategory
      });
    } else {
      res = await createWazifa({
        title: wazifaTitle.trim(),
        arabicText: wazifaArabic.trim(),
        translationUr: wazifaUrdu.trim(),
        translationEn: wazifaEnglish.trim(),
        benefits: wazifaBenefits.trim(),
        method: wazifaMethod.trim(),
        references: wazifaReferences.trim() || undefined,
        category: wazifaCategory
      });
    }
    setActionLoading(false);

    if (res.success) {
      alert(editingWazifaId ? "Wazifa updated successfully!" : "Wazifa uploaded successfully!");
      setEditingWazifaId(null);
      setWazifaTitle('');
      setWazifaArabic('');
      setWazifaUrdu('');
      setWazifaEnglish('');
      setWazifaBenefits('');
      setWazifaMethod('');
      setWazifaReferences('');
      loadData();
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleStartEditWazifa = (w: any) => {
    setEditingWazifaId(w.id);
    setWazifaTitle(w.title);
    setWazifaArabic(w.arabicText || '');
    setWazifaUrdu(w.translationUr || '');
    setWazifaEnglish(w.translationEn || '');
    setWazifaBenefits(w.benefits || '');
    setWazifaMethod(w.method || '');
    setWazifaReferences(w.references || '');
    setWazifaCategory(w.category);
    
    const element = document.getElementById("wazifa-form");
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEditWazifa = () => {
    setEditingWazifaId(null);
    setWazifaTitle('');
    setWazifaArabic('');
    setWazifaUrdu('');
    setWazifaEnglish('');
    setWazifaBenefits('');
    setWazifaMethod('');
    setWazifaReferences('');
  };

  // Delete Wazifa handler
  const handleDeleteWazifa = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Wazifa?")) return;
    setActionLoading(true);
    const res = await deleteWazifa(id);
    setActionLoading(false);
    if (res.success) {
      loadData();
    } else {
      alert("Failed to delete: " + res.error);
    }
  };

  // Handle Book Files Change (Only Cover image now)
  const handleBookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setBookCover({ base64, fileName: file.name });
    };
    reader.readAsDataURL(file);
  };

  // Upload/Edit Book Form submit
  const handleUploadBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle || !bookCategory || !bookType) {
      alert("Please fill in Title, Category and Type.");
      return;
    }

    setActionLoading(true);
    let res;
    if (editingBookId) {
      res = await updateBook(editingBookId, {
        title: bookTitle.trim(),
        category: bookCategory.trim(),
        description: bookDescription.trim() || undefined,
        type: bookType,
        coverBase64: bookCover?.base64,
        coverFileName: bookCover?.fileName,
        downloadUrl: bookDownloadUrl.trim() || undefined
      });
    } else {
      res = await createBook({
        title: bookTitle.trim(),
        category: bookCategory.trim(),
        description: bookDescription.trim() || undefined,
        type: bookType,
        coverBase64: bookCover?.base64,
        coverFileName: bookCover?.fileName,
        downloadUrl: bookDownloadUrl.trim() || undefined
      });
    }
    setActionLoading(false);

    if (res.success) {
      alert(editingBookId ? "Book/Magazine updated successfully!" : "Book/Magazine uploaded successfully!");
      setEditingBookId(null);
      setBookTitle('');
      setBookDescription('');
      setBookCover(null);
      setBookDownloadUrl('');
      const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
      fileInputs.forEach(input => { input.value = ''; });
      loadData();
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleStartEditBook = (b: any) => {
    setEditingBookId(b.id);
    setBookTitle(b.title);
    setBookCategory(b.category);
    setBookDescription(b.description || '');
    setBookType(b.type);
    setBookDownloadUrl(b.downloadUrl || '');
    setBookCover(null);

    const element = document.getElementById("book-form");
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEditBook = () => {
    setEditingBookId(null);
    setBookTitle('');
    setBookCategory('Islamic Jurisprudence');
    setBookDescription('');
    setBookType('BOOK');
    setBookDownloadUrl('');
    setBookCover(null);
  };

  // Delete Book handler
  const handleDeleteBook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Book/Magazine?")) return;
    setActionLoading(true);
    const res = await deleteBook(id);
    setActionLoading(false);
    if (res.success) {
      loadData();
    } else {
      alert("Failed to delete: " + res.error);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500 text-sm">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-10 animate-fade-in text-slate-800">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-slate-850 to-slate-950 text-white p-6 rounded-xl border-b border-islamic-gold shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-lg md:text-2xl font-bold flex items-center space-x-2 rtl:space-x-reverse text-slate-100">
            <Shield className="w-6 h-6 text-islamic-gold" />
            <span>Super Administrator Control Center</span>
          </h2>
          <p className="text-xs text-stone-300 mt-1">Configure categories, merge fields, manage scholar profiles, and review audit records.</p>
        </div>
        <Link href="/portal/dashboard" className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded">
          Back to Dashboard
        </Link>
      </section>

      {/* Tab Navigation */}
      <div className="flex border-b border-stone-200 bg-stone-50/50 rounded-lg p-1 gap-1 max-w-md">
        <button
          onClick={() => setActiveTab('scholars')}
          className={`flex-1 py-2 px-3 text-xs md:text-sm font-bold rounded-md transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'scholars'
              ? 'bg-islamic-green text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-stone-100'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Scholars & Configs</span>
        </button>
        <button
          onClick={() => setActiveTab('wazaif_books')}
          className={`flex-1 py-2 px-3 text-xs md:text-sm font-bold rounded-md transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'wazaif_books'
              ? 'bg-islamic-green text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-stone-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Wazaif & Books</span>
        </button>
      </div>

      {activeTab === 'scholars' ? (
        <div className="space-y-10">
          {/* Main Configurations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Categories Administration */}
            <div className="space-y-6">
              
              {/* Create Category */}
              <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center space-x-1.5 rtl:space-x-reverse">
                  <PlusCircle className="w-4 h-4 text-islamic-gold" />
                  <span>Create New Category</span>
                </h3>
                <form onSubmit={handleCreateCategory} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Category Name (English)</label>
                      <input 
                        type="text" 
                        required
                        value={newCatEn}
                        onChange={(e) => setNewCatEn(e.target.value)}
                        placeholder="e.g. Fasting"
                        className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 font-urdu">زمرہ کا نام (اردو)</label>
                      <input 
                        type="text" 
                        required
                        value={newCatUr}
                        onChange={(e) => setNewCatUr(e.target.value)}
                        placeholder="مثال: روزہ"
                        className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none font-urdu"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={actionLoading}
                      className="px-4 py-2 bg-islamic-green hover:bg-islamic-darkGreen text-white text-xs font-bold rounded shadow transition-colors"
                    >
                      Create Category
                    </button>
                  </div>
                </form>
              </div>

              {/* Create Subcategory */}
              <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center space-x-1.5 rtl:space-x-reverse">
                  <PlusCircle className="w-4 h-4 text-islamic-gold" />
                  <span>Create New Sub-Category</span>
                </h3>
                <form onSubmit={handleCreateSubCategory} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Select Parent Category</label>
                    <select 
                      value={selectedCatId}
                      onChange={(e) => setSelectedCatId(e.target.value)}
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.nameEn} ({c.nameUr})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Sub-Category (English)</label>
                      <input 
                        type="text" 
                        required
                        value={newSubEn}
                        onChange={(e) => setNewSubEn(e.target.value)}
                        placeholder="e.g. Ramadan"
                        className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 font-urdu">ذیلی زمرہ کا نام (اردو)</label>
                      <input 
                        type="text" 
                        required
                        value={newSubUr}
                        onChange={(e) => setNewSubUr(e.target.value)}
                        placeholder="مثال: رمضان"
                        className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none font-urdu"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={actionLoading}
                      className="px-4 py-2 bg-islamic-green hover:bg-islamic-darkGreen text-white text-xs font-bold rounded shadow transition-colors"
                    >
                      Create Sub-Category
                    </button>
                  </div>
                </form>
              </div>

              {/* Merge Categories */}
              <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center space-x-1.5 rtl:space-x-reverse">
                  <GitMerge className="w-4 h-4 text-islamic-gold" />
                  <span>Merge Duplicate Categories</span>
                </h3>
                <form onSubmit={handleMergeCategories} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Source (Will be deleted)</label>
                      <select 
                        value={mergeSource}
                        onChange={(e) => setMergeSource(e.target.value)}
                        className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                      >
                        <option value="">-- Choose Category --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.nameEn} ({c.nameUr})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Target (Will keep all fatwas)</label>
                      <select 
                        value={mergeTarget}
                        onChange={(e) => setMergeTarget(e.target.value)}
                        className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                      >
                        <option value="">-- Choose Category --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.nameEn} ({c.nameUr})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={actionLoading}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded shadow transition-colors"
                    >
                      Merge Categories
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Mufti Provisioning / Editing Form */}
            <div id="mufti-form-container" className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center space-x-1.5 rtl:space-x-reverse">
                <UserPlus className="w-4 h-4 text-islamic-gold" />
                <span>{editingMuftiId ? 'Edit Scholar Mufti Profile' : 'Provision Scholar Mufti Profile'}</span>
              </h3>
              <form onSubmit={handleCreateOrUpdateMufti} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Employee Email Address <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      required
                      value={muftiEmail}
                      onChange={(e) => setMuftiEmail(e.target.value)}
                      placeholder="e.g. rafiq@darulifta.org"
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">
                      Account Password {editingMuftiId ? '(Leave blank to keep current)' : <span className="text-red-500">*</span>}
                    </label>
                    <input 
                      type="password" 
                      required={!editingMuftiId}
                      value={muftiPassword}
                      onChange={(e) => setMuftiPassword(e.target.value)}
                      placeholder={editingMuftiId ? '••••••••' : 'Min 6 chars'}
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">English Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={muftiNameEn}
                      onChange={(e) => setMuftiNameEn(e.target.value)}
                      placeholder="Mufti Muhammad Rafiq Raza"
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Urdu Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={muftiNameUr}
                      onChange={(e) => setMuftiNameUr(e.target.value)}
                      placeholder="مفتی محمد رفیق رضا"
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none font-urdu"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Employee ID <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={muftiEmpId}
                      onChange={(e) => setMuftiEmpId(e.target.value)}
                      placeholder="e.g. MDI-003"
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Designation</label>
                    <input 
                      type="text" 
                      value={muftiDesig}
                      onChange={(e) => setMuftiDesig(e.target.value)}
                      placeholder="Mufti"
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Joining Date</label>
                    <input 
                      type="date" 
                      value={muftiJoinDate}
                      onChange={(e) => setMuftiJoinDate(e.target.value)}
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">Theological Qualifications</label>
                  <input 
                    type="text" 
                    value={muftiQual}
                    onChange={(e) => setMuftiQual(e.target.value)}
                    className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">Area of Specialization</label>
                  <input 
                    type="text" 
                    value={muftiSpec}
                    onChange={(e) => setMuftiSpec(e.target.value)}
                    className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Contact Number <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={muftiMobile}
                      onChange={(e) => setMuftiMobile(e.target.value)}
                      placeholder="+91 94116 99786"
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  
                  {/* Show Status Field ONLY during edit mode */}
                  {editingMuftiId && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Profile Status</label>
                      <select 
                        value={muftiStatus}
                        onChange={(e) => setMuftiStatus(e.target.value)}
                        className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                      >
                        <option value="ACTIVE">ACTIVE (Authorized to Answer)</option>
                        <option value="INACTIVE">DEACTIVATED (Locked Out)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  {editingMuftiId && (
                    <button 
                      type="button"
                      onClick={resetMuftiForm}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold rounded shadow transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button 
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-islamic-gold hover:bg-amber-600 text-white text-xs font-bold rounded shadow transition-colors"
                  >
                    {editingMuftiId ? 'Save Changes' : 'Provision Account'}
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Manage Scholars & Mufti Profiles */}
          <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="bg-stone-50 border-b border-stone-200 p-4 font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
              <Users className="w-4 h-4 text-islamic-gold" />
              <span>Manage Scholars & Mufti Profiles</span>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-xs text-slate-600 text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-slate-700">
                    <th className="p-3">Scholar Name</th>
                    <th className="p-3">Employee ID / Designation</th>
                    <th className="p-3">Specialization & Mobile</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {muftis.map((muftiUser) => {
                    const p = muftiUser.muftiProfile;
                    if (!p) return null;
                    return (
                      <tr key={muftiUser.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                        <td className="p-3">
                          <div className="font-semibold text-slate-855">{p.nameEn}</div>
                          <div className="text-[10px] text-slate-400 font-urdu">{p.nameUr}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{muftiUser.email}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold">{p.employeeId}</div>
                          <div className="text-[10px] text-slate-400">{p.designation}</div>
                        </td>
                        <td className="p-3">
                          <div>{p.specialization}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.mobile}</div>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {p.status === 'ACTIVE' ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => startEditingMufti(muftiUser)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold inline-flex items-center space-x-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleToggleMuftiStatus(muftiUser)}
                            className={`px-2 py-1 rounded text-[10px] font-bold ${
                              p.status === 'ACTIVE' 
                                ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {muftis.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        No Mufti profiles provisioned yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Category List & Metrics Table */}
          <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="bg-stone-50 border-b border-stone-200 p-4 font-bold text-slate-800 text-xs uppercase tracking-wider">
              Active Categories & Subcategories Map
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-xs text-slate-600 text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-slate-700">
                    <th className="p-3">Category Name</th>
                    <th className="p-3">Sub-Categories</th>
                    <th className="p-3 text-center">Published Fatwas</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                      <td className="p-3 font-semibold">
                        <div>{cat.nameEn}</div>
                        <div className="text-[10px] text-slate-400 font-urdu">{cat.nameUr}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {cat.subCategories.map((sub: any) => (
                            <span key={sub.id} className="px-2 py-0.5 bg-stone-100 rounded text-[9px] border border-stone-200">
                              {sub.nameEn} ({sub.nameUr})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-800">{cat._count.fatwas}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${cat.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {cat.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleCategory(cat.id, cat.isActive)}
                          className={`px-2 py-1 rounded text-[9px] font-bold ${
                            cat.isActive 
                              ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {cat.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Global Hijri Date Settings Calibration */}
          <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="border-b border-stone-200 pb-3 flex items-center space-x-2 text-islamic-green">
              <Shield className="w-5 h-5 text-islamic-gold" />
              <h3 className="font-bold text-slate-800 text-sm md:text-base uppercase tracking-wider">Global Hijri Calendar Calibration</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calibrate the global Hijri calendar display on the homepage for all site visitors. Adjust this value depending on the local moon sighting of the current month.
            </p>

            <form onSubmit={handleUpdateHijriOffset} className="flex items-center space-x-4 max-w-md">
              <div className="flex-grow space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Calibrate Hijri Date (Offset)</label>
                <select
                  value={adminHijriOffset}
                  onChange={(e) => setAdminHijriOffset(parseInt(e.target.value, 10))}
                  className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-islamic-gold"
                >
                  <option value="-2">-2 days</option>
                  <option value="-1">-1 day</option>
                  <option value="0">Standard (Islamic Umalqura)</option>
                  <option value="1">+1 day</option>
                  <option value="2">+2 days</option>
                </select>
              </div>
              <div className="pt-5">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-islamic-green hover:bg-islamic-darkGreen text-white text-xs font-bold rounded shadow transition-colors"
                >
                  {actionLoading ? 'Saving...' : 'Apply Calibrated Date'}
                </button>
              </div>
            </form>
          </section>

          {/* Audit Log Table */}
          <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="bg-stone-50 border-b border-stone-200 p-4 font-bold text-slate-800 text-xs uppercase tracking-wider flex justify-between items-center">
              <span>Security Audit Trail (Latest Actions)</span>
              <button onClick={loadData} className="p-1 hover:bg-stone-200 rounded">
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 max-h-[300px] overflow-y-auto">
              <table className="w-full text-[10px] md:text-xs text-slate-500 text-left border-collapse font-mono">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-slate-700">
                    <th className="p-2">Timestamp</th>
                    <th className="p-2">Auditor Email</th>
                    <th className="p-2">Operation</th>
                    <th className="p-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                      <td className="p-2 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-2 text-slate-700">{log.user?.email || 'SYSTEM'}</td>
                      <td className="p-2"><span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">{log.action}</span></td>
                      <td className="p-2 text-slate-600">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Upload Wazifa Form */}
            <div id="wazifa-form" className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm space-y-4 font-urdu-desc">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-islamic-gold" />
                  <span>{editingWazifaId ? "Edit Wazifa" : "Upload New Wazifa"}</span>
                </h3>
                {editingWazifaId && (
                  <button
                    type="button"
                    onClick={handleCancelEditWazifa}
                    className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[9px] font-bold border border-stone-300 transition-all"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleUploadWazifa} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Wazifa Title (English)</label>
                  <input
                    type="text"
                    required
                    value={wazifaTitle}
                    onChange={(e) => setWazifaTitle(e.target.value)}
                    placeholder="e.g. Wazifa for Rizq and Prosperity"
                    className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Category / Topic</label>
                    <input
                      type="text"
                      required
                      value={wazifaCategory}
                      onChange={(e) => setWazifaCategory(e.target.value)}
                      placeholder="e.g. Rizq (Sustenance) or Peace of Mind"
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">References / Sources</label>
                    <input
                      type="text"
                      value={wazifaReferences}
                      onChange={(e) => setWazifaReferences(e.target.value)}
                      placeholder="e.g. اوراد و وظائف درگاہ اعلیٰ حضرت"
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none font-urdu"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Arabic Text</label>
                    <button
                      type="button"
                      disabled={translating || !wazifaArabic.trim()}
                      onClick={handleTranslateArabicText}
                      className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold border border-emerald-200 flex items-center space-x-1"
                    >
                      <Languages className="w-2.5 h-2.5" />
                      <span>{translating ? 'Translating...' : 'Auto Translate'}</span>
                    </button>
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={wazifaArabic}
                    onChange={(e) => setWazifaArabic(e.target.value)}
                    placeholder="Type Arabic text here..."
                    className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none font-arabic text-center leading-loose text-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 font-urdu uppercase tracking-wide">Urdu Translation (Correctable)</label>
                    <textarea
                      required
                      rows={3}
                      value={wazifaUrdu}
                      onChange={(e) => setWazifaUrdu(e.target.value)}
                      placeholder="Urdu translation will auto-appear..."
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none font-urdu leading-relaxed text-right text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">English Translation (Correctable)</label>
                    <textarea
                      required
                      rows={3}
                      value={wazifaEnglish}
                      onChange={(e) => setWazifaEnglish(e.target.value)}
                      placeholder="English translation will auto-appear..."
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none leading-relaxed text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Method (How to read)</label>
                    <textarea
                      required
                      rows={2}
                      value={wazifaMethod}
                      onChange={(e) => setWazifaMethod(e.target.value)}
                      placeholder="Method in Urdu..."
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none font-urdu leading-relaxed text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Benefits & Merits</label>
                    <textarea
                      required
                      rows={2}
                      value={wazifaBenefits}
                      onChange={(e) => setWazifaBenefits(e.target.value)}
                      placeholder="Benefits in Urdu..."
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none font-urdu leading-relaxed text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-islamic-green hover:bg-islamic-darkGreen text-white text-xs font-bold rounded shadow transition-colors"
                  >
                    {editingWazifaId ? "Save Changes" : "Upload Wazifa"}
                  </button>
                </div>
              </form>
            </div>

            {/* Upload Book Form */}
            <div id="book-form" className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center space-x-1.5">
                  <Book className="w-4 h-4 text-islamic-gold" />
                  <span>{editingBookId ? "Edit Book or Magazine" : "Upload Book or Magazine"}</span>
                </h3>
                {editingBookId && (
                  <button
                    type="button"
                    onClick={handleCancelEditBook}
                    className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[9px] font-bold border border-stone-300 transition-all"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleUploadBook} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Book/Magazine Title</label>
                  <input
                    type="text"
                    required
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="e.g. Al-Fatawa al-Radawiyyah Vol 1"
                    className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Category</label>
                    <input
                      type="text"
                      required
                      value={bookCategory}
                      onChange={(e) => setBookCategory(e.target.value)}
                      placeholder="e.g. Jurisprudence, Biography, Monthly Magazine"
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Type</label>
                    <select
                      value={bookType}
                      onChange={(e) => setBookType(e.target.value)}
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                    >
                      <option value="BOOK">Book (کتاب)</option>
                      <option value="MAGAZINE">Magazine (رسالہ)</option>
                      <option value="RESEARCH_PAPER">Research Paper (تحقیقی مقالہ)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Description</label>
                  <textarea
                    rows={3}
                    value={bookDescription}
                    onChange={(e) => setBookDescription(e.target.value)}
                    placeholder="Brief description of content..."
                    className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none font-urdu leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Cover Image File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBookFileChange}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-stone-50 file:text-slate-700 hover:file:bg-stone-100"
                    />
                    {bookCover && (
                      <span className="text-[9px] text-emerald-600 block mt-1 font-semibold">✓ Attached: {bookCover.fileName}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Google Drive Link (URL)</label>
                    <input
                      type="url"
                      required
                      value={bookDownloadUrl}
                      onChange={(e) => setBookDownloadUrl(e.target.value)}
                      placeholder="e.g. https://drive.google.com/..."
                      className="w-full border border-stone-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-islamic-green hover:bg-islamic-darkGreen text-white text-xs font-bold rounded shadow transition-colors"
                  >
                    {editingBookId ? "Save Changes" : "Upload Book/Magazine"}
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Manage Existing Wazaif Table */}
          <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="bg-stone-50 border-b border-stone-200 p-4 font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-islamic-gold" />
              <span>Published Wazaif List</span>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-xs text-slate-600 text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-slate-700 font-semibold">
                    <th className="p-3">Title & Category</th>
                    <th className="p-3">Arabic Text</th>
                    <th className="p-3">Urdu Translation</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {wazaif.map((w) => (
                    <tr key={w.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{w.title}</div>
                        <span className="px-2 py-0.5 bg-islamic-gold/15 text-islamic-darkGold rounded text-[9px] font-medium font-urdu mt-1 inline-block">
                          {w.category}
                        </span>
                      </td>
                      <td className="p-3 font-arabic text-right text-lg text-islamic-green leading-loose max-w-[200px] truncate select-all">{w.arabicText}</td>
                      <td className="p-3 font-urdu max-w-[250px] truncate">{w.translationUr}</td>
                      <td className="p-3 text-right flex justify-end space-x-1.5">
                        <button
                          onClick={() => handleStartEditWazifa(w)}
                          className="p-1.5 bg-islamic-green/10 hover:bg-islamic-green/20 text-islamic-green rounded border border-islamic-green/30 transition-all"
                          title="Edit Wazifa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteWazifa(w.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-200 transition-all"
                          title="Delete Wazifa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {wazaif.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400">
                        No custom Wazaif uploaded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Manage Existing Books Table */}
          <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="bg-stone-50 border-b border-stone-200 p-4 font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
              <Book className="w-4 h-4 text-islamic-gold" />
              <span>Published Books & Magazines Catalog</span>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-xs text-slate-600 text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-slate-700 font-semibold">
                    <th className="p-3">Book Title</th>
                    <th className="p-3">Category & Type</th>
                    <th className="p-3">Download Link</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                      <td className="p-3 font-semibold text-slate-800">{b.title}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-stone-100 rounded text-[9px] border border-stone-200 mr-1.5 font-medium">
                          {b.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-urdu">{b.category}</span>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-blue-600">
                        {b.downloadUrl ? (
                          <a href={b.downloadUrl} target="_blank" rel="noreferrer" className="hover:underline">
                            {b.downloadUrl.split('/').pop()}
                          </a>
                        ) : (
                          'No File Attached'
                        )}
                      </td>
                      <td className="p-3 text-right flex justify-end space-x-1.5 font-sans">
                        <button
                          onClick={() => handleStartEditBook(b)}
                          className="p-1.5 bg-islamic-green/10 hover:bg-islamic-green/20 text-islamic-green rounded border border-islamic-green/30 transition-all"
                          title="Edit Book/Magazine"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(b.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-200 transition-all"
                          title="Delete Book/Magazine"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {books.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400">
                        No books or magazines uploaded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
