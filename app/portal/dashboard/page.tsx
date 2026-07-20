"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '../../actions/auth';
import { getPortalStats, getQuestions, holdQuestion } from '../../actions/portal';
import { Shield, Clock, HelpCircle, CheckCircle, BarChart2, PlusCircle, AlertCircle, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { formatDateSafe } from '../../utils/date';

export default function PortalDashboard() {
  const router = useRouter();

  // Session & Stats States
  const [session, setSession] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HOLD' | 'ANSWERED'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const userSession = await getMe();
      if (!userSession) {
        router.push('/portal/login');
        return;
      }
      setSession(userSession);

      // Load stats
      const statsRes = await getPortalStats();
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      // Load questions
      const questionsRes = await getQuestions('PENDING');
      if (questionsRes.success && questionsRes.data) {
        setQuestions(questionsRes.data);
      }

      setLoading(false);
    }
    loadDashboard();
  }, [router]);

  // Load questions when tab changes
  useEffect(() => {
    if (!session) return;
    async function loadTabQuestions() {
      const res = await getQuestions(activeTab);
      if (res.success && res.data) {
        setQuestions(res.data);
      }
    }
    loadTabQuestions();
  }, [activeTab, session]);

  // Put question on hold
  const handleHold = async (id: string) => {
    if (!confirm("Are you sure you want to put this question on hold?")) return;
    setActionLoading(id);
    const res = await holdQuestion(id);
    setActionLoading(null);
    if (res.success) {
      // Reload stats and current tab questions
      const statsRes = await getPortalStats();
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      const questionsRes = await getQuestions(activeTab);
      if (questionsRes.success && questionsRes.data) setQuestions(questionsRes.data);
    } else {
      alert("Action failed: " + res.error);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500 text-sm">Loading dashboard environment...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Session header */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-12 h-12 rounded-full bg-islamic-green/10 text-islamic-green flex items-center justify-center border border-islamic-gold/20">
            <ShieldCheck className="w-6 h-6 text-islamic-gold" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold font-urdu">
              {session.role === 'SUPER_ADMIN' ? 'Welcome, Administrator' : `Assalamu Alaikum, Mufti ${session.muftiNameEn}`}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Role: {session.role} | Account: {session.email}</p>
          </div>
        </div>
        {session.role === 'SUPER_ADMIN' && (
          <Link 
            href="/portal/admin"
            className="px-4 py-2 bg-islamic-gold hover:bg-amber-600 text-white rounded text-xs font-bold shadow flex items-center space-x-1.5 rtl:space-x-reverse transition-colors"
          >
            <Shield className="w-4 h-4 text-white" />
            <span>Open Super Admin Controls</span>
          </Link>
        )}
      </div>

      {/* Analytics Counter Grid */}
      {stats && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2.5 bg-amber-50 rounded text-amber-600"><Clock className="w-5 h-5" /></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Pending</div>
              <div className="text-lg font-bold text-slate-800">{stats.pendingCount}</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2.5 bg-emerald-50 rounded text-emerald-600"><CheckCircle className="w-5 h-5" /></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Answered</div>
              <div className="text-lg font-bold text-slate-800">{stats.answeredCount}</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2.5 bg-orange-50 rounded text-orange-600"><AlertCircle className="w-5 h-5" /></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">On Hold</div>
              <div className="text-lg font-bold text-slate-800">{stats.holdCount}</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2.5 bg-islamic-green/10 rounded text-islamic-green"><HelpCircle className="w-5 h-5 text-islamic-gold" /></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Today's Queries</div>
              <div className="text-lg font-bold text-slate-800">{stats.todayQuestionsCount}</div>
            </div>
          </div>
        </section>
      )}

      {/* Main Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Questions Queue (Left 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
          {/* Tab Selector */}
          <div className="flex border-b border-stone-200 bg-stone-50">
            {(['PENDING', 'HOLD', 'ANSWERED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-grow py-3 text-xs font-bold text-center border-b-2 uppercase transition-all ${
                  activeTab === tab
                    ? 'border-islamic-gold text-islamic-green bg-white'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab} Questions
              </button>
            ))}
          </div>

          {/* List content */}
          <div className="p-6 flex-grow space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 border border-dashed border-stone-300 rounded bg-stone-50/50">
                No questions found in this tab.
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="bg-stone-50 rounded-lg p-5 border border-stone-200 space-y-3">
                    <div className="flex justify-between items-center border-b border-stone-200/50 pb-2 flex-wrap gap-2 text-[10px] font-semibold text-slate-500">
                      <span>Tracking: {q.trackingNumber}</span>
                      <span>Submitted: {formatDateSafe(q.createdAt, 'en')}</span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div><strong>From:</strong> {q.name} ({q.city}) | <strong>Phone:</strong> {q.phone}</div>
                    </div>

                    <p className="text-sm font-urdu text-slate-700 font-medium italic">
                      "{q.questionText}"
                    </p>

                    {q.attachmentUrl && (
                      <div className="text-[10px] text-islamic-green font-bold">
                        📎 Attached File: <a href={q.attachmentUrl} target="_blank" rel="noreferrer" className="underline">{q.attachmentUrl.split('/').pop()}</a>
                      </div>
                    )}

                    {activeTab === 'PENDING' && (
                      <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-2 border-t border-stone-200/40">
                        <button
                          onClick={() => handleHold(q.id)}
                          disabled={actionLoading === q.id}
                          className="px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 text-[10px] font-bold rounded border border-orange-200 transition-colors"
                        >
                          Put on Hold
                        </button>
                        <Link
                          href={`/portal/answer/${q.id}`}
                          className="px-3.5 py-1 bg-islamic-gold hover:bg-amber-600 text-white text-[10px] font-bold rounded flex items-center space-x-1 rtl:space-x-reverse transition-colors shadow-sm"
                        >
                          <span>Answer Question</span>
                          <ArrowRight className="w-3 h-3 text-white" />
                        </Link>
                      </div>
                    )}

                    {activeTab === 'HOLD' && (
                      <div className="flex justify-end pt-2 border-t border-stone-200/40">
                        <Link
                          href={`/portal/answer/${q.id}`}
                          className="px-3.5 py-1 bg-islamic-gold hover:bg-amber-600 text-white text-[10px] font-bold rounded flex items-center space-x-1 rtl:space-x-reverse transition-colors shadow-sm"
                        >
                          <span>Process Answer</span>
                          <ArrowRight className="w-3 h-3 text-white" />
                        </Link>
                      </div>
                    )}

                    {activeTab === 'ANSWERED' && q.fatwa && (
                      <div className="text-[10px] text-slate-400 pt-2 border-t border-stone-200/40 flex justify-between items-center">
                        <span>Fatwa Ref: <strong>{q.fatwa.fatwaNumber}</strong> (Visibility: {q.fatwa.visibility})</span>
                        <Link href={`/fatwa/${q.fatwa.id}`} className="text-islamic-gold font-bold hover:underline">
                          View Published Fatwa
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Categories Stats & Activity Audit logs (Right Column) */}
        <div className="space-y-6">
          {/* Category Stats */}
          {stats && stats.categoryStats && (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="bg-stone-50 border-b border-stone-200 p-4 font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2 rtl:space-x-reverse">
                <BarChart2 className="w-4 h-4 text-islamic-gold" />
                <span>Fatwa Count By Category</span>
              </div>
              <div className="p-4 space-y-2">
                {stats.categoryStats.map((cat: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-stone-100 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-slate-600 font-urdu">{cat.nameUr} ({cat.nameEn})</span>
                    <span className="px-2 py-0.5 bg-islamic-gold/15 text-islamic-darkGold rounded-full font-bold">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit log (Security) */}
          {stats && stats.recentActivity && (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="bg-stone-50 border-b border-stone-200 p-4 font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2 rtl:space-x-reverse">
                <Shield className="w-4 h-4 text-islamic-gold" />
                <span>Security Activity Logs</span>
              </div>
              <div className="p-4 space-y-3 font-mono text-[10px] text-slate-500 max-h-[300px] overflow-y-auto">
                {stats.recentActivity.map((log: any, idx: number) => (
                  <div key={idx} className="border-b border-stone-100 pb-2 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 mb-1">
                      <span>Action: <strong>{log.action}</strong></span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-600">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
