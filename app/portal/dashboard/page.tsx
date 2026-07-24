"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '../../actions/auth';
import { 
  getPortalStats, 
  getQuestions, 
  getMuftiProfiles,
  assignQuestion,
  reviewFatwa,
  requestTasdeeq,
  submitTasdeeqFeedback,
  publishFatwa,
  getPortalNotifications,
  markNotificationAsRead,
  updateSystemSettings,
  getSystemSetting,
  holdQuestion
} from '../../actions/portal';
import { 
  Shield, 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  BarChart2, 
  AlertCircle, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  Send, 
  FileCheck, 
  Settings, 
  Bell, 
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  Undo
} from 'lucide-react';
import Link from 'next/link';
import { formatDateSafe } from '../../utils/date';

export default function PortalDashboard() {
  const router = useRouter();

  // Session & Global States
  const [session, setSession] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [muftis, setMuftis] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [publishRule, setPublishRule] = useState('FIRST_VERIFIED');

  // Tabs by Role
  // Super Admin & Admin Mufti tabs: NEW, ASSIGNED, PENDING_REVIEW, PENDING_TASDEEQ, PUBLISHED, ALL
  // Mufti tabs: ALL_QUESTIONS, MY_ASSIGNMENTS, PENDING_TASDEEQ, MY_HISTORY
  const [activeTab, setActiveTab] = useState<string>('NEW');

  // UI Modals / Drawer Form States
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [assigneeId, setAssigneeId] = useState('');
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | 'SENT_BACK' | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [tasdeeqMuftiIds, setTasdeeqMuftiIds] = useState<string[]>([]);
  const [tasdeeqStatus, setTasdeeqStatus] = useState<'VERIFIED' | 'REJECTED' | null>(null);
  const [tasdeeqRemarks, setTasdeeqRemarks] = useState('');

  // Loading States
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

      // Determine initial tab based on role
      if (userSession.role === 'MUFTI') {
        setActiveTab('MY_ASSIGNMENTS');
      } else {
        setActiveTab('NEW');
      }

      await refreshData(userSession);
      setLoading(false);
    }
    loadDashboard();
  }, [router]);

  // Load questions when tab changes
  useEffect(() => {
    if (!session) return;
    loadTabQuestions();
  }, [activeTab, session]);

  const refreshData = async (currSession = session) => {
    if (!currSession) return;
    
    // Load Stats
    const statsRes = await getPortalStats();
    if (statsRes.success) {
      setStats(statsRes.stats);
    }

    // Load Notifications
    const notifRes = await getPortalNotifications();
    if (notifRes.success && notifRes.data) {
      setNotifications(notifRes.data);
    }

    // Load active Mufti profiles (for assignments/Tasdeeq selects)
    if (currSession.role === 'SUPER_ADMIN' || currSession.role === 'ADMIN_MUFTI') {
      const muftisRes = await getMuftiProfiles();
      if (muftisRes.success && muftisRes.data) {
        setMuftis(muftisRes.data.filter((m: any) => m.status === 'ACTIVE'));
      }

      // Load system publish settings
      const settingRes = await getSystemSetting('tasdeeq_publish_rule');
      if (settingRes.success && settingRes.value) {
        setPublishRule(settingRes.value);
      }
    }
  };

  const loadTabQuestions = async () => {
    if (!session) return;

    let queryStatus = 'NEW';

    // Map frontend tab to database status
    if (session.role === 'SUPER_ADMIN' || session.role === 'ADMIN_MUFTI') {
      if (activeTab === 'NEW') queryStatus = 'NEW';
      else if (activeTab === 'ASSIGNED') queryStatus = 'ASSIGNED';
      else if (activeTab === 'PENDING_REVIEW') queryStatus = 'PENDING_REVIEW';
      else if (activeTab === 'PENDING_TASDEEQ') queryStatus = 'PENDING_TASDEEQ';
      else if (activeTab === 'PUBLISHED') queryStatus = 'PUBLISHED';
      else if (activeTab === 'ALL') queryStatus = 'ALL';
    } else {
      // Mufti Roles
      if (activeTab === 'ALL_QUESTIONS') queryStatus = 'ALL';
      else if (activeTab === 'MY_ASSIGNMENTS') queryStatus = 'ASSIGNED';
      else if (activeTab === 'PENDING_TASDEEQ') queryStatus = 'PENDING_TASDEEQ';
      else if (activeTab === 'MY_HISTORY') queryStatus = 'PUBLISHED';
    }

    const res = await getQuestions(queryStatus);
    if (res.success && res.data) {
      let filteredData = res.data;

      // Extra filter for Mufti specific tabs
      if (session.role === 'MUFTI') {
        if (activeTab === 'MY_ASSIGNMENTS') {
          // Questions assigned to me specifically
          filteredData = res.data.filter((q: any) => q.assignedToId === session.muftiId);
        } else if (activeTab === 'PENDING_TASDEEQ') {
          // Questions that have a pending TasdeeqRecord for me
          filteredData = res.data.filter((q: any) => 
            q.fatwa?.tasdeeqRecords?.some((tr: any) => tr.muftiId === session.muftiId && tr.status === 'PENDING')
          );
        } else if (activeTab === 'MY_HISTORY') {
          // Questions answered by me
          filteredData = res.data.filter((q: any) => q.fatwa?.answeredById === session.muftiId);
        }
      }

      setQuestions(filteredData);
    }
  };

  // Assign Question
  const handleAssign = async (qId: string) => {
    if (!assigneeId) {
      alert("Please select a Mufti to assign.");
      return;
    }
    setActionLoading(qId);
    const res = await assignQuestion(qId, assigneeId);
    setActionLoading(null);
    if (res.success) {
      alert("Question assigned successfully!");
      setAssigneeId('');
      setSelectedQuestion(null);
      await refreshData();
      await loadTabQuestions();
    } else {
      alert("Failed to assign: " + res.error);
    }
  };

  // Review Submit
  const handleReviewSubmit = async (fId: string) => {
    if (!reviewAction) {
      alert("Please choose a review action.");
      return;
    }
    setActionLoading(fId);
    const res = await reviewFatwa(fId, reviewAction, reviewRemarks);
    setActionLoading(null);
    if (res.success) {
      alert(`Answer has been successfully ${reviewAction.toLowerCase().replace('_', ' ')}.`);
      setReviewAction(null);
      setReviewRemarks('');
      setSelectedQuestion(null);
      await refreshData();
      await loadTabQuestions();
    } else {
      alert("Failed to record review: " + res.error);
    }
  };

  // Send Tasdeeq Request
  const handleRequestTasdeeq = async (fId: string) => {
    if (tasdeeqMuftiIds.length === 0) {
      alert("Please select at least one Mufti.");
      return;
    }
    setActionLoading(fId);
    const res = await requestTasdeeq(fId, tasdeeqMuftiIds);
    setActionLoading(null);
    if (res.success) {
      alert("Tasdeeq request dispatched successfully!");
      setTasdeeqMuftiIds([]);
      setSelectedQuestion(null);
      await refreshData();
      await loadTabQuestions();
    } else {
      alert("Failed to send Tasdeeq: " + res.error);
    }
  };

  // Submit Tasdeeq verification feedback
  const handleTasdeeqVerify = async (fId: string) => {
    if (!tasdeeqStatus) {
      alert("Please select verification status (Verified or Rejected).");
      return;
    }
    setActionLoading(fId);
    const res = await submitTasdeeqFeedback(fId, tasdeeqStatus, tasdeeqRemarks);
    setActionLoading(null);
    if (res.success) {
      alert("Your verification feedback was successfully submitted!");
      setTasdeeqStatus(null);
      setTasdeeqRemarks('');
      setSelectedQuestion(null);
      await refreshData();
      await loadTabQuestions();
    } else {
      alert("Failed to record verification: " + res.error);
    }
  };

  // Publish fatwa
  const handlePublish = async (fId: string) => {
    setActionLoading(fId);
    const res = await publishFatwa(fId);
    setActionLoading(null);
    if (res.success) {
      alert("Fatwa published live on the public portal!");
      setSelectedQuestion(null);
      await refreshData();
      await loadTabQuestions();
    } else {
      alert("Failed to publish: " + res.error);
    }
  };

  // Toggle Hold
  const handleHold = async (qId: string) => {
    if (!confirm("Are you sure you want to put this question on hold?")) return;
    setActionLoading(qId);
    const res = await holdQuestion(qId);
    setActionLoading(null);
    if (res.success) {
      await refreshData();
      await loadTabQuestions();
    } else {
      alert("Action failed: " + res.error);
    }
  };

  // Mark notification read
  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    await refreshData();
  };

  // System rule change handler
  const handleRuleChange = async (val: string) => {
    setPublishRule(val);
    const res = await updateSystemSettings('tasdeeq_publish_rule', val);
    if (res.success) {
      alert("Tasdeeq publishing rule updated successfully!");
    } else {
      alert("Failed to update settings: " + res.error);
    }
  };

  // Status Badge Colors
  const getStatusBadge = (status: string) => {
    const maps: Record<string, string> = {
      NEW: 'bg-blue-50 text-blue-700 border-blue-200',
      PENDING: 'bg-blue-50 text-blue-700 border-blue-200',
      ASSIGNED: 'bg-purple-50 text-purple-700 border-purple-200',
      IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
      PENDING_REVIEW: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      SENT_BACK: 'bg-pink-50 text-pink-700 border-pink-200',
      APPROVED: 'bg-teal-50 text-teal-700 border-teal-200',
      PENDING_TASDEEQ: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      TASDEEQ_COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      PUBLISHED: 'bg-green-50 text-green-700 border-green-200',
      REJECTED: 'bg-red-50 text-red-700 border-red-200',
      HOLD: 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return maps[status] || 'bg-stone-50 text-stone-700 border-stone-200';
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 text-sm">Loading dashboard workspace...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Dashboard header */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-12 h-12 rounded-full bg-islamic-green/10 text-islamic-green flex items-center justify-center border border-islamic-gold/20">
            <ShieldCheck className="w-6 h-6 text-islamic-gold" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold font-urdu">
              {session.role === 'SUPER_ADMIN' ? 'Welcome, Super Admin' : session.role === 'ADMIN_MUFTI' ? 'Welcome, Admin Mufti' : `Assalamu Alaikum, Mufti ${session.muftiNameEn}`}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Role: {session.role} | Account: {session.email}</p>
          </div>
        </div>

        {/* Dashboard Top Right actions */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse relative">
          
          {/* Notification bell */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded-lg text-slate-600 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {getUnreadNotificationsCount() > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                {getUnreadNotificationsCount()}
              </span>
            )}
          </button>

          {/* Super admin control link */}
          {session.role === 'SUPER_ADMIN' && (
            <Link 
              href="/portal/admin"
              className="px-4 py-2 bg-islamic-gold hover:bg-amber-600 text-white rounded text-xs font-bold shadow flex items-center space-x-1.5 rtl:space-x-reverse transition-colors"
            >
              <Shield className="w-4 h-4 text-white" />
              <span>Admin Panel</span>
            </Link>
          )}

          {/* Notifications dropdown list */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-stone-200 shadow-xl rounded-lg p-3 z-50 space-y-2 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-1.5 mb-1.5">
                <span className="text-xs font-bold text-slate-700">Recent Notifications</span>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">No notifications</div>
              ) : (
                <div className="space-y-1.5">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-2 rounded text-xs border transition-colors ${n.read ? 'bg-stone-50/50 border-stone-100' : 'bg-amber-50/40 border-amber-100'}`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-semibold text-slate-700">{n.title}</span>
                        {!n.read && (
                          <button 
                            onClick={() => handleMarkRead(n.id)}
                            className="text-[9px] text-islamic-green font-bold hover:underline"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                      <span className="text-[9px] text-slate-400 block mt-1">{formatDateSafe(n.createdAt, 'en')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Analytics Counter Grid based on role */}
      {stats && (
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          
          {session.role === 'SUPER_ADMIN' && (
            <>
              <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 bg-blue-50 rounded text-blue-600"><HelpCircle className="w-5 h-5" /></div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">New / Pending</div>
                  <div className="text-base font-bold text-slate-800">{stats.pendingQuestions}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 bg-purple-50 rounded text-purple-600"><Clock className="w-5 h-5" /></div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Assigned</div>
                  <div className="text-base font-bold text-slate-800">{stats.assignedQuestions}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 bg-amber-50 rounded text-amber-600"><FileText className="w-5 h-5" /></div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Pending Review</div>
                  <div className="text-base font-bold text-slate-800">{stats.pendingReview}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 bg-indigo-50 rounded text-indigo-600"><ShieldCheck className="w-5 h-5 text-indigo-600" /></div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Pending Tasdeeq</div>
                  <div className="text-base font-bold text-slate-800">{stats.pendingTasdeeq}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 bg-emerald-50 rounded text-emerald-600"><CheckCircle className="w-5 h-5" /></div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Published</div>
                  <div className="text-base font-bold text-slate-800">{stats.published}</div>
                </div>
              </div>
            </>
          )}

          {session.role === 'ADMIN_MUFTI' && (
            <>
              <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 bg-blue-50 rounded text-blue-600"><HelpCircle className="w-5 h-5" /></div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">New Questions</div>
                  <div className="text-base font-bold text-slate-800">{stats.newQuestions}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 bg-purple-50 rounded text-purple-600"><Clock className="w-5 h-5" /></div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Assigned</div>
                  <div className="text-base font-bold text-slate-800">{stats.assigned}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 bg-amber-50 rounded text-amber-600"><FileText className="w-5 h-5" /></div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Review Queue</div>
                  <div className="text-base font-bold text-slate-800">{stats.pendingReview}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 bg-indigo-50 rounded text-indigo-600"><ShieldCheck className="w-5 h-5 text-indigo-600" /></div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Tasdeeq Stage</div>
                  <div className="text-base font-bold text-slate-800">{stats.pendingTasdeeq}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 bg-emerald-50 rounded text-emerald-600"><CheckCircle className="w-5 h-5" /></div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Published Today</div>
                  <div className="text-base font-bold text-slate-800">{stats.publishedToday}</div>
                </div>
              </div>
            </>
          )}

          {session.role === 'MUFTI' && (
            <>
              <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 bg-purple-50 rounded text-purple-600"><Clock className="w-5 h-5" /></div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">My Assignments</div>
                  <div className="text-base font-bold text-slate-800">{stats.assignedQuestions}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 bg-amber-50 rounded text-amber-600"><FileText className="w-5 h-5" /></div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Sent Back / Drafts</div>
                  <div className="text-base font-bold text-slate-800">{stats.draftAnswers}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 bg-blue-50 rounded text-blue-600"><Send className="w-5 h-5" /></div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Submitted (Under Review)</div>
                  <div className="text-base font-bold text-slate-800">{stats.submittedAnswers}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 bg-indigo-50 rounded text-indigo-600"><ShieldCheck className="w-5 h-5" /></div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Pending my Tasdeeq</div>
                  <div className="text-base font-bold text-slate-800">{stats.pendingTasdeeq}</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2.5 bg-emerald-50 rounded text-emerald-600"><CheckCircle className="w-5 h-5" /></div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">My Published Fatwas</div>
                  <div className="text-base font-bold text-slate-800">{stats.publishedFatwas}</div>
                </div>
              </div>
            </>
          )}

        </section>
      )}

      {/* Main Panel Content split into Left (Tables) & Right (Settings / Config / Logs) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Tab-driven workflow queue container */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
          
          {/* Tab Selector */}
          <div className="flex border-b border-stone-200 bg-stone-50 overflow-x-auto scrollbar-thin">
            {session.role !== 'MUFTI' ? (
              // Super Admin & Admin Mufti tabs
              <>
                {(['NEW', 'ASSIGNED', 'PENDING_REVIEW', 'PENDING_TASDEEQ', 'PUBLISHED', 'ALL'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setSelectedQuestion(null); }}
                    className={`flex-grow min-w-[100px] py-3 text-xs font-bold text-center border-b-2 uppercase transition-all whitespace-nowrap px-4 ${
                      activeTab === tab
                        ? 'border-islamic-gold text-islamic-green bg-white'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </>
            ) : (
              // Mufti Tabs
              <>
                {(['MY_ASSIGNMENTS', 'PENDING_TASDEEQ', 'MY_HISTORY', 'ALL_QUESTIONS'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setSelectedQuestion(null); }}
                    className={`flex-grow py-3 text-xs font-bold text-center border-b-2 uppercase transition-all whitespace-nowrap px-4 ${
                      activeTab === tab
                        ? 'border-islamic-gold text-islamic-green bg-white'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* List display */}
          <div className="p-6 flex-grow space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-400 border border-dashed border-stone-300 rounded bg-stone-50/50">
                No questions found matching this queue.
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="bg-stone-50 rounded-lg p-5 border border-stone-200 space-y-3">
                    
                    {/* Header bar metadata */}
                    <div className="flex justify-between items-center border-b border-stone-200/50 pb-2 flex-wrap gap-2">
                      <span className="text-[10px] font-semibold text-slate-500 font-mono">Ref: {q.trackingNumber}</span>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded border ${getStatusBadge(q.status)}`}>
                          {q.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{formatDateSafe(q.createdAt, 'en')}</span>
                      </div>
                    </div>

                    {/* Sender profile */}
                    <div className="text-xs text-slate-600">
                      <strong>From:</strong> {q.name} ({q.city}) | <strong>Phone:</strong> {q.phone}
                    </div>

                    {/* Question body text */}
                    <p className="text-sm font-urdu text-slate-700 leading-relaxed font-medium italic">
                      "{q.questionText}"
                    </p>

                    {/* Attached file link */}
                    {q.attachmentUrl && (
                      <div className="text-[10px] text-islamic-green font-bold">
                        📎 Attached File: <a href={q.attachmentUrl} target="_blank" rel="noreferrer" className="underline">{q.attachmentUrl.split('/').pop()}</a>
                      </div>
                    )}

                    {/* Assigned Mufti badge if exists */}
                    {q.assignedTo && (
                      <div className="text-[10px] text-slate-500 flex items-center space-x-1 rtl:space-x-reverse pt-1">
                        <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>Assigned to: <strong>Mufti {q.assignedTo.nameEn}</strong></span>
                      </div>
                    )}

                    {/* Tasdeeq verifiers status log */}
                    {q.fatwa?.tasdeeqRecords && q.fatwa.tasdeeqRecords.length > 0 && (
                      <div className="bg-stone-100/50 border border-stone-200 rounded p-2 pt-1.5 mt-2 space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Verification signatures (Tasdeeq)</span>
                        <div className="space-y-1">
                          {q.fatwa.tasdeeqRecords.map((tr: any) => (
                            <div key={tr.id} className="flex justify-between items-center text-[10px] text-slate-600">
                              <span>Mufti {tr.mufti.nameEn}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border ${tr.status === 'VERIFIED' ? 'bg-green-100 text-green-800' : tr.status === 'PENDING' ? 'bg-stone-100 text-stone-600' : 'bg-red-100 text-red-800'}`}>
                                {tr.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons bar */}
                    <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-2 border-t border-stone-200/40">
                      
                      {/* Hold button for Super admin or Admin Mufti on new queries */}
                      {(session.role === 'SUPER_ADMIN' || session.role === 'ADMIN_MUFTI') && q.status === 'NEW' && (
                        <button
                          onClick={() => handleHold(q.id)}
                          disabled={actionLoading === q.id}
                          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-slate-700 text-[10px] font-bold rounded border border-stone-200 transition-colors shadow-sm"
                        >
                          Put on Hold
                        </button>
                      )}

                      {/* Expand workflow action console */}
                      {selectedQuestion?.id !== q.id ? (
                        <button
                          onClick={() => {
                            setSelectedQuestion(q);
                            setAssigneeId(q.assignedToId || '');
                          }}
                          className="px-3.5 py-1 bg-islamic-gold hover:bg-amber-600 text-white text-[10px] font-bold rounded shadow-sm transition-colors flex items-center space-x-1"
                        >
                          <span>Manage Workflow</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedQuestion(null)}
                          className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-slate-800 text-[10px] font-bold rounded shadow-sm transition-colors"
                        >
                          Close Panel
                        </button>
                      )}

                      {/* Mufti direct answer routing */}
                      {session.role === 'MUFTI' && activeTab === 'MY_ASSIGNMENTS' && (
                        <Link
                          href={`/portal/answer/${q.id}`}
                          className="px-3.5 py-1 bg-islamic-green hover:bg-emerald-700 text-white text-[10px] font-bold rounded shadow-sm flex items-center space-x-1 transition-colors"
                        >
                          <span>Answer Question</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>

                    {/* EXPANDED INTERACTIVE PANEL */}
                    {selectedQuestion?.id === q.id && (
                      <div className="bg-white border border-stone-200 rounded-lg p-4 mt-3 space-y-4 animate-slide-down">
                        
                        {/* 1. Assign Section (Super Admin / Admin Mufti only) */}
                        {(session.role === 'SUPER_ADMIN' || session.role === 'ADMIN_MUFTI') && (q.status === 'NEW' || q.status === 'HOLD' || q.status === 'ASSIGNED') && (
                          <div className="space-y-2 pb-3 border-b">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center space-x-1">
                              <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                              <span>Assign to Scholar (Mufti)</span>
                            </label>
                            <div className="flex space-x-2">
                              <select
                                value={assigneeId}
                                onChange={(e) => setAssigneeId(e.target.value)}
                                className="flex-grow border rounded px-2.5 py-1 text-xs bg-white focus:outline-none"
                              >
                                <option value="">-- Choose Scholar --</option>
                                {muftis.map(m => (
                                  <option key={m.id} value={m.id}>Mufti {m.nameEn} ({m.designation})</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAssign(q.id)}
                                disabled={actionLoading === q.id}
                                className="px-4 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded shadow transition-colors"
                              >
                                Assign
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 2. Review Section (Super Admin / Admin Mufti only) */}
                        {(session.role === 'SUPER_ADMIN' || session.role === 'ADMIN_MUFTI') && q.status === 'PENDING_REVIEW' && q.fatwa && (
                          <div className="space-y-3 pb-3 border-b">
                            <div className="bg-amber-50/50 border border-amber-100 rounded p-3 text-xs space-y-2">
                              <span className="font-bold text-slate-700 block">Submitted Answer for Review:</span>
                              <div className="space-y-1">
                                <div><strong>Title English:</strong> {q.fatwa.titleEn}</div>
                                <div><strong>Title Urdu:</strong> {q.fatwa.titleUr}</div>
                                <div className="pt-1.5 border-t"><strong>Answer (Urdu):</strong> <p className="font-urdu text-sm mt-1 text-slate-800">{q.fatwa.answerUr}</p></div>
                              </div>
                              <Link 
                                href={`/portal/answer/${q.id}`}
                                className="text-xs text-islamic-gold font-bold inline-block hover:underline"
                              >
                                Edit Answer / References Details
                              </Link>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Review Action</label>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setReviewAction('APPROVED')}
                                  className={`px-3 py-1 rounded text-xs font-bold border transition-colors flex items-center space-x-1 ${reviewAction === 'APPROVED' ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'}`}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  <span>Approve Draft</span>
                                </button>
                                <button
                                  onClick={() => setReviewAction('SENT_BACK')}
                                  className={`px-3 py-1 rounded text-xs font-bold border transition-colors flex items-center space-x-1 ${reviewAction === 'SENT_BACK' ? 'bg-pink-600 border-pink-700 text-white' : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'}`}
                                >
                                  <Undo className="w-3.5 h-3.5" />
                                  <span>Send Back (Correction)</span>
                                </button>
                                <button
                                  onClick={() => setReviewAction('REJECTED')}
                                  className={`px-3 py-1 rounded text-xs font-bold border transition-colors flex items-center space-x-1 ${reviewAction === 'REJECTED' ? 'bg-red-600 border-red-700 text-white' : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'}`}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject completely</span>
                                </button>
                              </div>

                              <textarea
                                value={reviewRemarks}
                                onChange={(e) => setReviewRemarks(e.target.value)}
                                placeholder="Enter review remarks / correction points..."
                                rows={2}
                                className="w-full border rounded p-2 text-xs focus:outline-none mt-2"
                              />

                              <div className="flex justify-end pt-1">
                                <button
                                  onClick={() => handleReviewSubmit(q.fatwa.id)}
                                  disabled={actionLoading === q.fatwa.id}
                                  className="px-4 py-1.5 bg-islamic-green hover:bg-emerald-700 text-white text-xs font-bold rounded shadow transition-colors"
                                >
                                  Submit Review Decision
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. Send Tasdeeq Request Section (Super Admin / Admin Mufti only) */}
                        {(session.role === 'SUPER_ADMIN' || session.role === 'ADMIN_MUFTI') && (q.status === 'APPROVED' || q.status === 'PENDING_TASDEEQ' || q.status === 'TASDEEQ_COMPLETED') && q.fatwa && (
                          <div className="space-y-3 pb-3 border-b">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center space-x-1">
                              <ShieldCheck className="w-4 h-4 text-indigo-600" />
                              <span>Request Tasdeeq (Verification)</span>
                            </label>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border rounded p-2 bg-stone-50 max-h-36 overflow-y-auto">
                              {muftis.map(m => (
                                <label key={m.id} className="flex items-center space-x-2 cursor-pointer py-1">
                                  <input 
                                    type="checkbox"
                                    checked={tasdeeqMuftiIds.includes(m.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setTasdeeqMuftiIds([...tasdeeqMuftiIds, m.id]);
                                      } else {
                                        setTasdeeqMuftiIds(tasdeeqMuftiIds.filter(id => id !== m.id));
                                      }
                                    }}
                                    className="rounded border-stone-300"
                                  />
                                  <span>Mufti {m.nameEn}</span>
                                </label>
                              ))}
                            </div>

                            <div className="flex justify-end">
                              <button
                                onClick={() => handleRequestTasdeeq(q.fatwa.id)}
                                disabled={actionLoading === q.fatwa.id || tasdeeqMuftiIds.length === 0}
                                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow transition-colors"
                              >
                                Send Verification Requests
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 4. Mufti Tasdeeq Form (For selected verifier Mufti) */}
                        {session.role === 'MUFTI' && activeTab === 'PENDING_TASDEEQ' && q.fatwa && (
                          <div className="space-y-3 pb-3 border-b">
                            <div className="bg-indigo-50/50 border border-indigo-100 rounded p-3 text-xs space-y-1.5">
                              <span className="font-bold text-indigo-800">Verification Request Info:</span>
                              <div><strong>Answering Scholar:</strong> Mufti {q.fatwa.answeredBy.nameEn}</div>
                              <div><strong>Answer (Urdu):</strong> <p className="font-urdu text-sm mt-1 text-slate-800">{q.fatwa.answerUr}</p></div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tasdeeq Decision</label>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setTasdeeqStatus('VERIFIED')}
                                  className={`px-3.5 py-1 rounded text-xs font-bold border transition-colors flex items-center space-x-1 ${tasdeeqStatus === 'VERIFIED' ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'}`}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  <span>Verify & Sign (Tasdeeq)</span>
                                </button>
                                <button
                                  onClick={() => setTasdeeqStatus('REJECTED')}
                                  className={`px-3.5 py-1 rounded text-xs font-bold border transition-colors flex items-center space-x-1 ${tasdeeqStatus === 'REJECTED' ? 'bg-red-600 border-red-700 text-white' : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'}`}
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                  <span>Flag / Reject</span>
                                </button>
                              </div>

                              <textarea
                                value={tasdeeqRemarks}
                                onChange={(e) => setTasdeeqRemarks(e.target.value)}
                                placeholder="Add remarks (optional)..."
                                rows={2}
                                className="w-full border rounded p-2 text-xs focus:outline-none mt-2"
                              />

                              <div className="flex justify-end pt-1">
                                <button
                                  onClick={() => handleTasdeeqVerify(q.fatwa.id)}
                                  disabled={actionLoading === q.fatwa.id}
                                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow transition-colors"
                                >
                                  Submit Verification
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 5. Publish Button (Super Admin / Admin Mufti only) */}
                        {(session.role === 'SUPER_ADMIN' || session.role === 'ADMIN_MUFTI') && q.status !== 'PUBLISHED' && q.fatwa && (
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-[10px] text-slate-400">
                              (Tasdeeq verified: {q.fatwa.tasdeeqRecords?.filter((t: any) => t.status === 'VERIFIED').length || 0})
                            </span>
                            <button
                              onClick={() => handlePublish(q.fatwa.id)}
                              disabled={actionLoading === q.fatwa.id}
                              className="px-5 py-1.5 bg-islamic-gold hover:bg-amber-600 text-white text-xs font-bold rounded shadow flex items-center space-x-1.5 transition-colors"
                            >
                              <FileCheck className="w-4 h-4 text-white" />
                              <span>Publish Fatwa Live</span>
                            </button>
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: settings, rules, categories list */}
        <div className="space-y-6">
          
          {/* Rules Configuration Panel (Super Admin & Admin Mufti only) */}
          {(session.role === 'SUPER_ADMIN' || session.role === 'ADMIN_MUFTI') && (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="bg-stone-50 border-b border-stone-200 p-4 font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2 rtl:space-x-reverse">
                <Settings className="w-4 h-4 text-islamic-gold" />
                <span>Fatwa Rules Engine</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">Tasdeeq Publishing Rule</label>
                  <select 
                    value={publishRule}
                    onChange={(e) => handleRuleChange(e.target.value)}
                    className="w-full border rounded px-3 py-1.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="FIRST_VERIFIED">Publish after FIRST verification (At least 1 signature)</option>
                    <option value="ALL_VERIFIED">Publish after ALL verifications (Requires all signatures)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    This determines whether the dashboard allows publishing a Fatwa immediately after the first selected Mufti signs it, or if it blocks publication until all requested verifiers sign.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Category Stats list */}
          {stats && stats.categoryStats && (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="bg-stone-50 border-b border-stone-200 p-4 font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2 rtl:space-x-reverse">
                <BarChart2 className="w-4 h-4 text-islamic-gold" />
                <span>Published Fatwa Counts</span>
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

          {/* Activity Security logs (Super Admin and Admin Mufti only) */}
          {(session.role === 'SUPER_ADMIN' || session.role === 'ADMIN_MUFTI') && stats && stats.recentActivity && (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="bg-stone-50 border-b border-stone-200 p-4 font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2 rtl:space-x-reverse">
                <Shield className="w-4 h-4 text-islamic-gold" />
                <span>System Security Logs</span>
              </div>
              <div className="p-4 space-y-3 font-mono text-[10px] text-slate-500 max-h-[300px] overflow-y-auto">
                {stats.recentActivity.map((log: any, idx: number) => (
                  <div key={idx} className="border-b border-stone-100 pb-2 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 mb-1">
                      <span>Action: <strong>{log.action}</strong></span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-600">{log.details}</p>
                    {log.ipAddress && <span className="text-[8px] text-slate-400 block mt-0.5">IP: {log.ipAddress} | Hijri: {log.hijriDate || 'N/A'}</span>}
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
