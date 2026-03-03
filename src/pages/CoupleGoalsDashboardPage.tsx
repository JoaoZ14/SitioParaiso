import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, LogOut, LayoutDashboard, Target, BookOpen, CalendarDays,
  Shield, Plus, CheckCircle2, Clock,
} from 'lucide-react';
import type { CoupleGoal, CoupleReference, CoupleTimelineItem, EmergencyFund, TabId, GoalStatus } from '../types/couple';
import { storageService, STORAGE_KEYS } from '../services/storageService';
import { calcGoalProgress, calcOverallProgress } from '../utils/finance';
import { SEED_GOALS, SEED_REFS, SEED_TIMELINE, SEED_EMERGENCY } from '../data/coupleSeed';
import { useAuth } from '../context/AuthContext';

import DashboardSection   from '../components/couple/sections/DashboardSection';
import GoalsSection       from '../components/couple/sections/GoalsSection';
import ReferencesSection  from '../components/couple/sections/ReferencesSection';
import TimelineSection    from '../components/couple/sections/TimelineSection';
import EmergencyFundSection from '../components/couple/sections/EmergencyFundSection';
import GoalModal          from '../components/couple/GoalModal';

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: 'dashboard',  label: 'Dashboard',    Icon: LayoutDashboard },
  { id: 'goals',      label: 'Metas',        Icon: Target },
  { id: 'references', label: 'Referências',  Icon: BookOpen },
  { id: 'timeline',   label: 'Linha do Tempo', Icon: CalendarDays },
  { id: 'emergency',  label: 'Emergência',   Icon: Shield },
];

export default function CoupleGoalsDashboardPage() {
  const navigate  = useNavigate();
  const { user, signOut } = useAuth();
  const goalsRef  = useRef<HTMLDivElement>(null);

  /* ── State ── */
  const [goals,     setGoals]     = useState<CoupleGoal[]>([]);
  const [refs,      setRefs]      = useState<CoupleReference[]>([]);
  const [timeline,  setTimeline]  = useState<CoupleTimelineItem[]>([]);
  const [emergency, setEmergency] = useState<EmergencyFund>(SEED_EMERGENCY);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [goalModal, setGoalModal] = useState<{ open: boolean; goal: CoupleGoal | null }>({ open: false, goal: null });

  /* ── Load from localStorage (seed if empty) ── */
  useEffect(() => {
    setGoals(    storageService.getJSON(STORAGE_KEYS.GOALS,     SEED_GOALS));
    setRefs(     storageService.getJSON(STORAGE_KEYS.REFS,      SEED_REFS));
    setTimeline( storageService.getJSON(STORAGE_KEYS.TIMELINE,  SEED_TIMELINE));
    setEmergency(storageService.getJSON(STORAGE_KEYS.EMERGENCY, SEED_EMERGENCY));
  }, []);

  /* ── Persist ── */
  useEffect(() => { storageService.setJSON(STORAGE_KEYS.GOALS,     goals);     }, [goals]);
  useEffect(() => { storageService.setJSON(STORAGE_KEYS.REFS,      refs);      }, [refs]);
  useEffect(() => { storageService.setJSON(STORAGE_KEYS.TIMELINE,  timeline);  }, [timeline]);
  useEffect(() => { storageService.setJSON(STORAGE_KEYS.EMERGENCY, emergency); }, [emergency]);

  /* ── Derived ── */
  const emergencyTarget = emergency.monthlyExpenses * emergency.safetyMonths;
  const emergencyPct    = emergencyTarget > 0
    ? Math.min(100, Math.round((emergency.savedAmount / emergencyTarget) * 100))
    : 0;
  const overallPct  = useMemo(() => calcOverallProgress(goals, emergencyPct), [goals, emergencyPct]);
  const lastUpdated = useMemo(() => {
    const ts = goals.map(g => new Date(g.updatedAt).getTime());
    if (!ts.length) return null;
    return new Date(Math.max(...ts));
  }, [goals]);

  /* ── Goal CRUD ── */
  const handleSaveGoal = useCallback((goal: CoupleGoal) => {
    setGoals(prev => {
      const exists = prev.some(g => g.id === goal.id);
      return exists ? prev.map(g => g.id === goal.id ? goal : g) : [...prev, goal];
    });
    setGoalModal({ open: false, goal: null });
  }, []);

  const handleDeleteGoal = useCallback((id: string) =>
    setGoals(prev => prev.filter(g => g.id !== id)), []);

  const handleSetStatus = useCallback((id: string, status: GoalStatus) => {
    setGoals(prev => prev.map(g => g.id === id
      ? { ...g, status, progress: status === 'done' ? 100 : g.progress, updatedAt: new Date().toISOString() }
      : g));
  }, []);

  const handleSetFocus = useCallback((id: string) => {
    setGoals(prev => prev.map(g => ({ ...g, isFocus: g.id === id ? !g.isFocus : false })));
  }, []);

  const handleAddAport = useCallback((goalId: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId || g.type !== 'financial') return g;
      const newSaved = (g.savedValue ?? 0) + amount;
      const done = (g.targetValue ?? 0) > 0 && newSaved >= (g.targetValue ?? 0);
      return {
        ...g,
        savedValue: newSaved,
        status: done ? 'done' : g.status,
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const handleMarkProgress = useCallback((goalId: string, delta: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId || g.type !== 'financial') {
        if (g.id !== goalId) return g;
        const current = calcGoalProgress(g);
        const next = Math.min(100, current + delta);
        return {
          ...g,
          progress: g.checklist && g.checklist.length > 0 ? g.progress : next,
          status: next >= 100 ? 'done' : g.status,
          updatedAt: new Date().toISOString(),
        };
      }
      return g;
    }));
  }, []);

  const handleToggleChecklist = useCallback((goalId: string, itemId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId || !g.checklist) return g;
      const checklist = g.checklist.map(c => c.id === itemId ? { ...c, done: !c.done } : c);
      const donePct = Math.round((checklist.filter(c => c.done).length / checklist.length) * 100);
      return { ...g, checklist, progress: donePct, updatedAt: new Date().toISOString() };
    }));
  }, []);

  /* ── Reference CRUD ── */
  const handleSaveRef = useCallback((ref: CoupleReference) => {
    setRefs(prev => {
      const exists = prev.some(r => r.id === ref.id);
      return exists ? prev.map(r => r.id === ref.id ? ref : r) : [...prev, ref];
    });
  }, []);

  const handleDeleteRef    = useCallback((id: string) => setRefs(prev => prev.filter(r => r.id !== id)), []);
  const handleFavoriteRef  = useCallback((id: string) =>
    setRefs(prev => prev.map(r => r.id === id ? { ...r, favorite: !r.favorite } : r)), []);

  /* ── Timeline CRUD ── */
  const handleSaveTimeline = useCallback((item: CoupleTimelineItem) => {
    setTimeline(prev => {
      const exists = prev.some(t => t.id === item.id);
      return exists ? prev.map(t => t.id === item.id ? item : t) : [...prev, item];
    });
  }, []);

  const handleDeleteTimeline = useCallback((id: string) =>
    setTimeline(prev => prev.filter(t => t.id !== id)), []);

  const handleMarkTimelineDone = useCallback((id: string) =>
    setTimeline(prev => prev.map(t => t.id === id ? { ...t, status: 'done' } : t)), []);

  /* ── Scroll to goals ── */
  const scrollToGoals = useCallback(() => {
    setActiveTab('goals');
    setTimeout(() => goalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, []);

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/hub')}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#4a7c59] flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-slate-800 text-sm hidden sm:block">Metas do Casal</span>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {/* Overall chip */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs bg-[#4a7c59]/10 text-[#4a7c59] px-3 py-1.5 rounded-full font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {overallPct}% geral
              </div>
              {lastUpdated && (
                <div className="hidden md:flex items-center gap-1.5 text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  {lastUpdated.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </div>
              )}
              <button
                onClick={() => setGoalModal({ open: true, goal: null })}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4a7c59] text-white text-xs font-semibold hover:bg-[#3a6448] transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Nova meta
              </button>
              {user && (
                <button
                  onClick={signOut}
                  title="Sair"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div className="border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
              {TABS.map(t => {
                const Icon = t.Icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex-shrink-0
                      ${active
                        ? 'border-[#4a7c59] text-[#4a7c59]'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Page title (visible only on Dashboard) */}
      {activeTab === 'dashboard' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
          <h1 className="text-2xl font-bold text-slate-800">Metas do Casal</h1>
          <p className="text-slate-400 text-sm mt-0.5">Planejamento geral: vida, carreira e finanças</p>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6" ref={goalsRef}>
        {activeTab === 'dashboard' && (
          <DashboardSection
            goals={goals}
            timeline={timeline}
            emergency={emergency}
            onScrollToGoals={scrollToGoals}
            onOpenGoalModal={g => setGoalModal({ open: true, goal: g ?? null })}
            onAddAport={handleAddAport}
            onSetFocus={handleSetFocus}
            onMarkProgress={handleMarkProgress}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsSection
            goals={goals}
            onSave={handleSaveGoal}
            onDelete={handleDeleteGoal}
            onSetStatus={handleSetStatus}
            onSetFocus={handleSetFocus}
            onAddAport={handleAddAport}
            onMarkProgress={handleMarkProgress}
            onToggleChecklist={handleToggleChecklist}
          />
        )}

        {activeTab === 'references' && (
          <ReferencesSection
            refs={refs}
            onSave={handleSaveRef}
            onDelete={handleDeleteRef}
            onFavorite={handleFavoriteRef}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineSection
            items={timeline}
            onSave={handleSaveTimeline}
            onDelete={handleDeleteTimeline}
            onMarkDone={handleMarkTimelineDone}
          />
        )}

        {activeTab === 'emergency' && (
          <EmergencyFundSection
            fund={emergency}
            onUpdate={setEmergency}
          />
        )}
      </main>

      {/* Global Goal Modal */}
      <GoalModal
        open={goalModal.open}
        goal={goalModal.goal}
        onSave={handleSaveGoal}
        onClose={() => setGoalModal({ open: false, goal: null })}
      />
    </div>
  );
}
