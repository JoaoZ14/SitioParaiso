import { useState, useMemo, useCallback } from 'react';
import type React from 'react';
import {
  Plus, Search, Target, ArrowLeft, LogOut,
  Download, Trash2, SlidersHorizontal, X,
  Sparkles, DollarSign, Bookmark, Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMetas } from '../../hooks/useMetas';
import type { Meta, FinanceMeta, FilterType, SortType } from '../../types';
import GoalsSummary from './GoalsSummary';
import GoalCard from './GoalCard';
import GoalsFilters from './GoalsFilters';
import GoalFormModal from './GoalFormModal';
import FinanceGoalCard from './FinanceGoalCard';
import GoalsDueSoon from './GoalsDueSoon';
import CategoryBreakdown from './CategoryBreakdown';
import Toast from './Toast';

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const PRIORITY_ORDER: Record<string, number> = { Alta: 0, Média: 1, Baixa: 2 };

const SORT_LABELS: Record<SortType, string> = {
  priority: 'Prioridade',
  deadline: 'Prazo',
  progress: 'Progresso',
  created: 'Criação',
};

interface ToastState {
  message: string;
  icon?: React.ReactNode;
  key: number;
}

export default function GoalsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const userInitial = user?.email?.charAt(0).toUpperCase() ?? '?';

  // ── Supabase-backed state ──────────────────────────────────
  const {
    metas,
    financeGoal,
    loading,
    error,
    saveMeta,
    patchMeta,
    deleteMeta,
    clearDoneMetas,
    saveFinanceGoal,
  } = useMetas();

  // ── Local UI state ─────────────────────────────────────────
  const [filter, setFilter]       = useState<FilterType>('all');
  const [sortBy, setSortBy]       = useState<SortType>('priority');
  const [search, setSearch]       = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [toast, setToast]         = useState<ToastState | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showTools, setShowTools] = useState(false);

  // ── Stable today reference ─────────────────────────────────
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const isOverdue = useCallback(
    (meta: Meta) =>
      meta.status !== 'done' && !!meta.deadline && new Date(meta.deadline) < today,
    [today],
  );

  // ── Filtered + sorted metas ────────────────────────────────
  const filteredMetas = useMemo(() => {
    let list = metas.filter(m => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      );
    });

    if (filter === 'active')  list = list.filter(m => m.status === 'active' && !isOverdue(m));
    if (filter === 'done')    list = list.filter(m => m.status === 'done');
    if (filter === 'overdue') list = list.filter(m => isOverdue(m));

    return list.slice().sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;

      if (sortBy === 'priority') {
        const pa = PRIORITY_ORDER[a.priority] ?? 2;
        const pb = PRIORITY_ORDER[b.priority] ?? 2;
        if (pa !== pb) return pa - pb;
        if (a.deadline && b.deadline)
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        if (a.deadline && !b.deadline) return -1;
        if (!a.deadline && b.deadline) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'deadline') {
        if (a.deadline && b.deadline)
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        if (a.deadline && !b.deadline) return -1;
        if (!a.deadline && b.deadline) return 1;
        return 0;
      }
      if (sortBy === 'progress') return a.progress - b.progress;
      if (sortBy === 'created')  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [metas, filter, search, sortBy, isOverdue]);

  // ── Actions ────────────────────────────────────────────────

  const handleSave = async (meta: Meta) => {
    await saveMeta(meta);
    setModalOpen(false);
    setEditingMeta(null);
  };

  const handleDelete = async (id: string) => {
    await deleteMeta(id);
  };

  const handleToggleDone = async (id: string) => {
    const meta = metas.find(m => m.id === id);
    if (!meta) return;
    const nowDone = meta.status !== 'done';
    if (nowDone) {
      setToast({
        message: `"${meta.title}" concluída!`,
        icon: <Sparkles className="w-4 h-4 text-yellow-300" />,
        key: Date.now(),
      });
    }
    await patchMeta(id, {
      status:   nowDone ? 'done'   : 'active',
      progress: nowDone ? 100      : meta.progress,
    });
  };

  const handleChecklistToggle = async (metaId: string, itemId: string) => {
    const meta = metas.find(m => m.id === metaId);
    if (!meta) return;
    const updated = meta.checklist.map(i =>
      i.id === itemId ? { ...i, done: !i.done } : i,
    );
    const doneCount    = updated.filter(i => i.done).length;
    const autoProgress = updated.length > 0
      ? Math.round((doneCount / updated.length) * 100)
      : meta.progress;
    await patchMeta(metaId, { checklist: updated, progress: autoProgress });
  };

  const handlePin = async (id: string) => {
    const meta = metas.find(m => m.id === id);
    if (!meta) return;
    await patchMeta(id, { pinned: !meta.pinned });
  };

  const handleProgressChange = async (id: string, progress: number) => {
    await patchMeta(id, { progress });
  };

  const handleEdit = (meta: Meta) => {
    setEditingMeta(meta);
    setModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingMeta(null);
    setModalOpen(true);
  };

  const handleCreateFromFinance = async (title: string, goal: number) => {
    const meta: Meta = {
      id: genId(),
      title,
      category: 'Finanças',
      description: `Meta financeira: juntar ${goal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      priority: 'Alta',
      deadline: '',
      progress: financeGoal.goal > 0
        ? Math.min(100, Math.round((financeGoal.saved / financeGoal.goal) * 100))
        : 0,
      checklist: [],
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    await saveMeta(meta);
    setToast({ message: 'Meta financeira criada!', icon: <DollarSign className="w-4 h-4 text-yellow-300" />, key: Date.now() });
  };

  const handleExport = () => {
    const data = JSON.stringify({ metas, financeGoal, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metas-sitio-paraiso-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'Metas exportadas!', icon: <Download className="w-4 h-4 text-green-300" />, key: Date.now() });
  };

  const handleClearDone = async () => {
    const doneCount = metas.filter(m => m.status === 'done').length;
    if (doneCount === 0) return;
    if (confirm(`Excluir ${doneCount} meta${doneCount > 1 ? 's' : ''} concluída${doneCount > 1 ? 's' : ''}?`)) {
      await clearDoneMetas();
      setShowTools(false);
    }
  };

  const handleFinanceChange = async (values: FinanceMeta) => {
    await saveFinanceGoal(values);
  };

  const doneCount = metas.filter(m => m.status === 'done').length;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fdf6e3]">

      {/* ── TopBar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#fffdf5]/96 backdrop-blur-md border-b border-[#e8d5b0] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/hub')}
                className="flex items-center gap-1.5 text-sm text-[#8a7a66] hover:text-[#4a7c59] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Hub</span>
              </button>
              <div className="w-px h-5 bg-[#e8d5b0]" />
              <div className="flex items-center gap-2 font-serif font-bold text-lg text-[#4a7c59]">
                <Target className="w-5 h-5" />
                Metas Gerais
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Error badge */}
              {error && (
                <span className="hidden sm:flex items-center gap-1 text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                  Erro ao salvar
                </span>
              )}

              {/* Tools dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowTools(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-[#e8d5b0] text-[#8a7a66] hover:border-[#4a7c59] hover:text-[#4a7c59] transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ferramentas</span>
                </button>

                {showTools && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowTools(false)} />
                    <div className="absolute right-0 top-9 bg-white border border-[#e8d5b0] rounded-xl shadow-xl z-20 py-1.5 min-w-[180px]">
                      <button
                        onClick={() => { handleExport(); setShowTools(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#5c3d1e] hover:bg-[#f5ead0] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-[#4a7c59]" />
                        Exportar JSON
                      </button>
                      <button
                        onClick={handleClearDone}
                        disabled={doneCount === 0}
                        className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-colors ${
                          doneCount === 0
                            ? 'text-[#c9b48a] cursor-not-allowed'
                            : 'text-red-400 hover:bg-red-50 hover:text-red-500'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Limpar concluídas {doneCount > 0 && `(${doneCount})`}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* User avatar */}
              <div className="w-7 h-7 rounded-full bg-[#4a7c59] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {userInitial}
              </div>

              <button
                onClick={signOut}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-[#e8d5b0] text-[#8a7a66] hover:border-red-300 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#2d5a3d] mb-1">Metas Gerais</h1>
          <p className="text-[#8a7a66] font-hand text-lg">Nosso plano, passo a passo.</p>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-[#4a7c59] animate-spin" />
            <p className="text-sm text-[#8a7a66]">Carregando metas…</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <GoalsSummary metas={metas} isOverdue={isOverdue} today={today} />

            {/* Goals due soon strip */}
            <GoalsDueSoon metas={metas} today={today} onEdit={handleEdit} />

            {/* Finance goal */}
            <FinanceGoalCard
              financeGoal={financeGoal}
              onChange={handleFinanceChange}
              metas={metas}
              onCreateMeta={handleCreateFromFinance}
            />

            {/* Category breakdown accordion */}
            <CategoryBreakdown metas={metas} />

            {/* ── Controls bar ─────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up animate-delay-300">
              <GoalsFilters filter={filter} onChange={setFilter} metas={metas} isOverdue={isOverdue} />

              <div className="flex gap-2 sm:ml-auto flex-wrap">
                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(v => !v)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#e8d5b0] text-sm text-[#8a7a66] hover:border-[#4a7c59] hover:text-[#4a7c59] bg-white transition-colors whitespace-nowrap"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    {SORT_LABELS[sortBy]}
                  </button>

                  {showSortMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                      <div className="absolute right-0 top-10 bg-white border border-[#e8d5b0] rounded-xl shadow-xl z-20 py-1 min-w-[160px]">
                        {(Object.keys(SORT_LABELS) as SortType[]).map(key => (
                          <button
                            key={key}
                            onClick={() => { setSortBy(key); setShowSortMenu(false); }}
                            className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                              sortBy === key
                                ? 'bg-[#4a7c59]/8 text-[#4a7c59] font-semibold'
                                : 'text-[#5c3d1e] hover:bg-[#f5ead0]'
                            }`}
                          >
                            {SORT_LABELS[key]}
                            {sortBy === key && <span className="text-[#4a7c59]">✓</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Search */}
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9b48a] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar meta..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-field pl-9 sm:w-52"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#f5ead0] hover:bg-[#e8d5b0] flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-[#8a7a66]" />
                    </button>
                  )}
                </div>

                {/* New goal button */}
                <button
                  onClick={handleOpenNew}
                  className="btn-primary flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nova meta</span>
                  <span className="sm:hidden">Nova</span>
                </button>
              </div>
            </div>

            {/* ── Goals grid ─────────────────────────────── */}
            {filteredMetas.length === 0 ? (
              <div className="text-center py-24 animate-fade-in-up">
                <div className="w-16 h-16 rounded-full bg-[#4a7c59]/8 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-[#4a7c59]/30" />
                </div>
                <p className="font-serif text-xl text-[#8a7a66] mb-2">
                  {filter === 'all' && !search ? 'Nenhuma meta criada ainda' : 'Nenhuma meta encontrada'}
                </p>
                <p className="text-sm text-[#c9b48a] mb-8 max-w-xs mx-auto">
                  {filter === 'all' && !search
                    ? 'Crie sua primeira meta e comece a construir o futuro juntos!'
                    : 'Tente ajustar os filtros ou a busca.'}
                </p>
                {filter === 'all' && !search && (
                  <button onClick={handleOpenNew} className="btn-primary inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Criar primeira meta
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Pinned section */}
                {filteredMetas.some(m => m.pinned) && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-[#d97706] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5" fill="currentColor" /> Fixadas
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredMetas.filter(m => m.pinned).map((meta, i) => (
                        <div key={meta.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                          <GoalCard
                            meta={meta}
                            isOverdue={isOverdue(meta)}
                            today={today}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleDone={handleToggleDone}
                            onChecklistToggle={handleChecklistToggle}
                            onPin={handlePin}
                            onProgressChange={handleProgressChange}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 border-t border-[#e8d5b0]" />
                  </div>
                )}

                {/* Remaining metas */}
                {filteredMetas.some(m => !m.pinned) && (
                  <>
                    {filteredMetas.some(m => m.pinned) && (
                      <p className="text-xs font-semibold text-[#8a7a66] uppercase tracking-widest mb-3">
                        Todas as metas
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredMetas.filter(m => !m.pinned).map((meta, i) => (
                        <div
                          key={meta.id}
                          className="animate-fade-in-up"
                          style={{ animationDelay: `${Math.min(i * 60, 400)}ms` }}
                        >
                          <GoalCard
                            meta={meta}
                            isOverdue={isOverdue(meta)}
                            today={today}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleDone={handleToggleDone}
                            onChecklistToggle={handleChecklistToggle}
                            onPin={handlePin}
                            onProgressChange={handleProgressChange}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* ── Modal ────────────────────────────────────────────── */}
      {modalOpen && (
        <GoalFormModal
          meta={editingMeta}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingMeta(null); }}
        />
      )}

      {/* ── Toast ────────────────────────────────────────────── */}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          icon={toast.icon}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
