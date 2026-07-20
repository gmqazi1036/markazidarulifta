"use client";

import React, { useState, useEffect } from 'react';
import { getBooks } from '../actions/public';
import { BookOpen, Search, Download, FileText, ArrowRight, Library, Book } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { formatDateSafe } from '../utils/date';

export default function Publishing() {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBooks() {
      setLoading(true);
      const res = await getBooks({ query, type: selectedType, category: selectedCategory });
      if (res.success && res.data) {
        setBooks(res.data);
        if (res.categories) {
          setCategories(res.categories);
        }
      }
      setLoading(false);
    }
    loadBooks();
  }, [query, selectedType, selectedCategory]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-islamic-green to-islamic-darkGreen text-white p-8 rounded-xl border-b border-islamic-gold shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold font-urdu text-islamic-gold">
          Department of Publishing & Printing
        </h2>
        <p className="text-xs md:text-sm text-stone-300 mt-2">
          Preserving Islamic knowledge through physical printing and digital open access. Access books, research magazines, and booklets from Dargah Aala Hazrat.
        </p>
      </section>

      {/* Intro Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-stone-200 space-y-3">
          <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2 rtl:space-x-reverse">
            <Library className="w-5 h-5 text-islamic-gold" />
            <span>Islamic Literature Dissemination</span>
          </h3>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            The publishing house is dedicated to editing, translating, printing, and publishing classical works of Hanafi Fiqh, theology (Aqeedah), and spirituality. In particular, we work to distribute the writings of Ala Hazrat Imam Ahmad Raza Khan Al-Qadri in modern readable prints and digital editions.
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            Additionally, we publish the monthly research journal <span className="italic font-bold text-islamic-green">"Monthly Sunnu Duniya" Urdu Magazine</span>, containing peer-reviewed research papers and contemporary Fatwas addressing current affairs.
          </p>
        </div>
        <div className="bg-gradient-to-br from-islamic-green/10 to-islamic-gold/10 p-6 rounded-xl border border-islamic-gold/20 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-islamic-green text-sm flex items-center space-x-1 rtl:space-x-reverse">
              <Book className="w-4 h-4 text-islamic-gold" />
              <span>Future Online Bookstore</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              We are working on an e-commerce platform allowing users globally to purchase high-quality printed hardcovers of Fatawa Ridwiyyah and other publications with shipping options.
            </p>
          </div>
          <div className="text-xs font-bold text-islamic-gold flex items-center space-x-1 rtl:space-x-reverse mt-4 border-t border-stone-200 pt-3">
            <span>Coming Soon</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* Catalog Search & Filters */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow space-y-1">
            <label className="text-xs font-bold text-slate-600">Search Publications</label>
            <div className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, description, keywords..."
                className="w-full border border-stone-300 rounded px-3 py-2 pl-9 text-sm focus:outline-none focus:border-islamic-gold"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
            </div>
          </div>
          <div className="w-full md:w-48 space-y-1">
            <label className="text-xs font-bold text-slate-600">Type</label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-islamic-gold"
            >
              <option value="all">All Types</option>
              <option value="BOOK">Books</option>
              <option value="MAGAZINE">Magazines</option>
              <option value="RESEARCH_PAPER">Research Papers</option>
            </select>
          </div>
          <div className="w-full md:w-48 space-y-1">
            <label className="text-xs font-bold text-slate-600">Category</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-islamic-gold"
            >
              <option value="all">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Catalog List */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading publications catalog...</div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm border border-dashed border-stone-300 rounded">
            No publications found matching your selection.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {books.map((book) => (
              <div key={book.id} className="bg-stone-50 rounded-lg p-5 border border-stone-200 flex flex-col justify-between hover:border-islamic-gold transition-colors">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    <span>{book.category}</span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded">
                      {book.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm md:text-base font-urdu">
                    {book.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-urdu">
                    {book.description || 'No description available for this volume.'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Published: {formatDateSafe(book.publishedDate, language)}
                  </p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-stone-200 flex justify-end">
                  <a 
                    href={book.downloadUrl || '#'} 
                    onClick={() => alert("Downloading PDF... (Mockup Download Link)")}
                    className="px-3.5 py-1.5 bg-islamic-green hover:bg-islamic-darkGreen text-white text-xs font-bold rounded shadow transition-colors flex items-center space-x-1 rtl:space-x-reverse"
                  >
                    <Download className="w-3.5 h-3.5 text-islamic-gold" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
