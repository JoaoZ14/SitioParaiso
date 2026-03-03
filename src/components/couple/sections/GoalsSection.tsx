import { useState, useMemo } from 'react';
import {
  Search, Plus, Edit2, Trash2, PauseCircle, CheckCircle2,
  Star, ChevronDown, ChevronUp, TrendingUp, X,
} from 'lucide-react';
import type { CoupleGoal, GoalCategory, GoalStatus } from '../../../types/couple';
import { calcGoalProgress, calcScenarios, formatBRL, calcForecastDate } from '../../../utils/finance';
import GoalModal from '../GoalModal';

interface Props {
  goals: CoupleGoal[];
  onSave:           (goal: CoupleGoal) => void;
  onDelete:         (id: string) => void;
  onSetStatus:      (id: string, status: GoalStatus) => void;
  onSetFocus:       (id: string) => void;
  onAddAport:       (id: string, amount: number) => void;
  onMarkProgress:   (id: string, delta: number) => void;
  onToggleChecklist:(goalId: string, itemId: string) => void;
}

const CATEGORIES: GoalCategory[] = [
  'Finanças','Carreira','Estudos','Saúde','Casa','Viagens','Projetos','Relacionamento','Outros',
];

const statusLabel: Record<GoalStatus, string> = { active: 'Ativa', paused: 'Pausada', done: 'Concluída' };
const statusStyle: Record<GoalStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  done:   'bg-slate-100 text-slate-500 border-slate-200',
};
const priorityDot: Record<string, string> = {
  Alta: 'bg-red-400', Média: 'bg-amber-400', Baixa: 'bg-slate-300',
};

function ProgressBar({ value, color = '#4a7c59' }: { value: number; color?: string }) {
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </div>
  );
}

function GoalCard({
  goal, onEdit, onDelete, onSetStatus, onSetFocus, onAddAport, onMarkProgress, onToggleChecklist,
}: {
  goal: CoupleGoal;
  onEdit: () => void;
  onDelete: () => void;
  onSetStatus: (s: GoalStatus) => void;
  onSetFocus: () => void;
  onAddAport: (n: number) => void;
  onMarkProgress: (d: number) => void;
  onToggleChecklist: (itemId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [aportVal, setAportVal] = useState('');

  const pct = calcGoalProgress(goal);
  const isDone = goal.status === 'done';
  const isPaused = goal.status === 'paused';

  const forecast = goal.type === 'financial' && goal.monthlyContribution
    ? calcForecastDate(goal.targetValue!, goal.savedValue!, goal.monthlyContribution)
    : null;

  const scenarios = goal.type === 'financial' && goal.monthlyContribution && goal.targetValue
    ? calcScenarios(goal.targetValue, goal.savedValue ?? 0, goal.monthlyContribution)
    : [];

  const handleAport = () => {
    const n = parseFloat(aportVal);
    if (!isNaN(n) && n > 0) { onAddAport(n); setAportVal(''); }
  };

  const progressColor = isDone ? '#059669' : isPaused ? '#94a3b8' : '#4a7c59';

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200
      ${isDone ? 'border-slate-100 opacity-80' : isPaused ? 'border-amber-100' : 'border-slate-100'}
      ${goal.isFocus && !isDone ? 'ring-2 ring-amber-300 ring-offset-1' : ''}`}
    >
      {/* Card header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{goal.category}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusStyle[goal.status]}`}>
              {statusLabel[goal.status]}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[goal.priority]}`} />
              {goal.priority}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={onSetFocus}
              title={goal.isFocus ? 'Remover foco' : 'Definir como foco do mês'}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
                ${goal.isFocus ? 'text-amber-400 bg-amber-50' : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50'}`}
            >
              <Star className="w-3.5 h-3.5" fill={goal.isFocus ? 'currentColor' : 'none'} />
            </button>
            <button onClick={onEdit} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h3 className={`font-semibold text-slate-800 leading-snug ${isDone ? 'line-through text-slate-400' : ''}`}>
          {goal.title}
        </h3>
        {goal.description && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{goal.description}</p>
        )}
      </div>

      {/* Progress */}
      <div className="px-5 pb-3">
        <div className="flex justify-between text-xs mb-1.5">
          {goal.type === 'financial' ? (
            <>
              <span className="text-slate-500">{formatBRL(goal.savedValue ?? 0)} guardado</span>
              <span className="font-bold text-[#4a7c59]">{pct}% — meta: {formatBRL(goal.targetValue ?? 0)}</span>
            </>
          ) : (
            <>
              <span className="text-slate-500">Progresso</span>
              <span className="font-bold text-[#4a7c59]">{pct}%</span>
            </>
          )}
        </div>
        <ProgressBar value={pct} color={progressColor} />
        <div className="flex items-center justify-between mt-1.5 text-xs text-slate-400">
          {goal.type === 'financial' && goal.monthlyContribution && (
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {formatBRL(goal.monthlyContribution)}/mês
            </span>
          )}
          {forecast && <span className="ml-auto">previsão: <strong className="text-slate-500">{forecast}</strong></span>}
          {goal.deadline && !forecast && (
            <span className="ml-auto">prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' })}</span>
          )}
        </div>
      </div>

      {/* Expandable: scenarios or checklist */}
      {(scenarios.length > 0 || (goal.checklist && goal.checklist.length > 0)) && (
        <div className="border-t border-slate-100">
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
          >
            {goal.type === 'financial' ? 'Cenários de alcance' : `Checklist (${goal.checklist?.filter(c => c.done).length ?? 0}/${goal.checklist?.length ?? 0})`}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <div className="px-5 pb-3">
              {goal.type === 'financial' && scenarios.length > 0 && (
                <div className="space-y-1.5">
                  {scenarios.map((s, i) => (
                    <div key={s.label}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs
                        ${i === 0 ? 'bg-red-50 text-red-700' : i === 1 ? 'bg-slate-50 text-slate-600' : 'bg-green-50 text-green-700'}`}
                    >
                      <span className="font-semibold">{s.label}</span>
                      <span>{formatBRL(s.monthly)}/mês</span>
                      <span className="font-bold">{s.date ?? '—'}</span>
                    </div>
                  ))}
                </div>
              )}

              {goal.type === 'non-financial' && goal.checklist && goal.checklist.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {goal.checklist.map(item => (
                    <label key={item.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox" checked={item.done}
                        onChange={() => onToggleChecklist(item.id)}
                        className="w-4 h-4 accent-[#4a7c59] rounded"
                      />
                      <span className={`text-sm flex-1 transition-colors ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick actions */}
      {!isDone && (
        <div className="border-t border-slate-100 px-5 py-3">
          {goal.type === 'financial' ? (
            <div className="flex gap-2">
              <input
                type="number" min="0" step="100" placeholder="Adicionar aporte R$"
                value={aportVal}
                onChange={e => setAportVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAport()}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all"
              />
              <button
                onClick={handleAport}
                className="px-3.5 py-2 rounded-xl bg-[#4a7c59]/10 text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white text-sm font-medium transition-colors"
              >
                + Aportar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 mr-1">Registrar progresso:</span>
              {[5, 10, 20].map(d => (
                <button
                  key={d}
                  onClick={() => onMarkProgress(d)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#4a7c59]/30 text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white transition-colors"
                >
                  +{d}%
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status actions */}
      <div className="border-t border-slate-100 px-5 py-2.5 flex items-center gap-2">
        {goal.status === 'active' && (
          <>
            <button
              onClick={() => onSetStatus('paused')}
              className="flex items-center gap-1.5 text-xs text-amber-600 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <PauseCircle className="w-3.5 h-3.5" /> Pausar
            </button>
            <button
              onClick={() => onSetStatus('done')}
              className="flex items-center gap-1.5 text-xs text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Concluir
            </button>
          </>
        )}
        {goal.status === 'paused' && (
          <button
            onClick={() => onSetStatus('active')}
            className="flex items-center gap-1.5 text-xs text-[#4a7c59] hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Retomar
          </button>
        )}
        {goal.status === 'done' && (
          <button
            onClick={() => onSetStatus('active')}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Reabrir
          </button>
        )}
      </div>
    </div>
  );
}

export default function GoalsSection({
  goals, onSave, onDelete, onSetStatus, onSetFocus, onAddAport, onMarkProgress, onToggleChecklist,
}: Props) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<GoalCategory | 'Todas'>('Todas');
  const [statusFilter, setStatusFilter] = useState<GoalStatus | 'all'>('all');
  const [modalGoal, setModalGoal] = useState<CoupleGoal | null | undefined>(undefined); // undefined = closed

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return goals.filter(g => {
      if (statusFilter !== 'all' && g.status !== statusFilter) return false;
      if (catFilter !== 'Todas' && g.category !== catFilter) return false;
      if (q && !g.title.toLowerCase().includes(q) && !g.category.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [goals, search, catFilter, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar metas…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value as GoalCategory | 'Todas')}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all"
          >
            <option value="Todas">Todas as categorias</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>

          {/* Status filter */}
          <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden text-sm divide-x divide-slate-200">
            {([['all','Todas'], ['active','Ativas'], ['paused','Pausadas'], ['done','Concluídas']] as const).map(([v, l]) => (
              <button
                key={v} onClick={() => setStatusFilter(v)}
                className={`px-3 py-2.5 transition-colors ${statusFilter === v ? 'bg-[#4a7c59] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setModalGoal(null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold hover:bg-[#3a6448] transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Nova meta
        </button>
      </div>

      {/* Count */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <p className="text-slate-400 text-sm mb-3">Nenhuma meta encontrada.</p>
          <button onClick={() => setModalGoal(null)} className="text-sm font-medium text-[#4a7c59] hover:underline">
            + Criar nova meta
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400">{filtered.length} meta{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(g => (
              <GoalCard
                key={g.id} goal={g}
                onEdit={() => setModalGoal(g)}
                onDelete={() => onDelete(g.id)}
                onSetStatus={s => onSetStatus(g.id, s)}
                onSetFocus={() => onSetFocus(g.id)}
                onAddAport={n => onAddAport(g.id, n)}
                onMarkProgress={d => onMarkProgress(g.id, d)}
                onToggleChecklist={itemId => onToggleChecklist(g.id, itemId)}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {modalGoal !== undefined && (
        <GoalModal
          open={true}
          goal={modalGoal}
          onSave={g => { onSave(g); setModalGoal(undefined); }}
          onClose={() => setModalGoal(undefined)}
        />
      )}
    </div>
  );
}
