import { useMemo, useState } from 'react';
import { TrendingUp, Target, CheckCircle2, Calendar, Shield, Star, Plus, ArrowRight } from 'lucide-react';
import type { CoupleGoal, CoupleTimelineItem, EmergencyFund } from '../../../types/couple';
import { calcGoalProgress, calcOverallProgress, formatBRL, formatDateShort } from '../../../utils/finance';

interface Props {
  goals: CoupleGoal[];
  timeline: CoupleTimelineItem[];
  emergency: EmergencyFund;
  onScrollToGoals: () => void;
  onOpenGoalModal: (goal?: CoupleGoal) => void;
  onAddAport: (goalId: string, amount: number) => void;
  onSetFocus?: (goalId: string) => void;
  onMarkProgress: (goalId: string, delta: number) => void;
}

const emergencyStatusConfig = {
  OK:      { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'OK' },
  Atenção: { color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   label: 'Atenção' },
  Risco:   { color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200',      label: 'Risco' },
};

function ProgressBar({ value, color = '#4a7c59', thin = false }: { value: number; color?: string; thin?: boolean }) {
  return (
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${thin ? 'h-1.5' : 'h-2'}`}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, value)}%`, background: color }}
      />
    </div>
  );
}

export default function DashboardSection({
  goals, timeline, emergency, onScrollToGoals, onOpenGoalModal,
  onAddAport, onMarkProgress,
}: Props) {
  const emergencyTarget = emergency.monthlyExpenses * emergency.safetyMonths;
  const emergencyPct = emergencyTarget > 0
    ? Math.min(100, Math.round((emergency.savedAmount / emergencyTarget) * 100))
    : 0;
  const emergencyStatus = emergencyPct >= 100 ? 'OK' : emergencyPct >= 70 ? 'Atenção' : 'Risco';

  const stats = useMemo(() => {
    const financial = goals.filter(g => g.type === 'financial');
    const totalSaved    = financial.reduce((s, g) => s + (g.savedValue ?? 0), 0);
    const totalTarget   = financial.reduce((s, g) => s + (g.targetValue ?? 0), 0);
    const activeCount   = goals.filter(g => g.status === 'active').length;
    const overallPct    = calcOverallProgress(goals, emergencyPct);
    const topActive     = goals
      .filter(g => g.status === 'active')
      .sort((a, b) => {
        const pa = a.priority === 'Alta' ? 0 : a.priority === 'Média' ? 1 : 2;
        const pb = b.priority === 'Alta' ? 0 : b.priority === 'Média' ? 1 : 2;
        return pa - pb;
      })
      .slice(0, 3);
    const focusGoal = goals.find(g => g.isFocus && g.status === 'active') ?? null;
    const nextMarco = timeline
      .filter(t => t.status === 'planned' && new Date(t.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null;
    return { totalSaved, totalTarget, activeCount, overallPct, topActive, focusGoal, nextMarco };
  }, [goals, timeline, emergencyPct]);

  const { totalSaved, totalTarget, activeCount, overallPct, topActive, focusGoal, nextMarco } = stats;
  const esCfg = emergencyStatusConfig[emergencyStatus];

  const kpis = [
    {
      label: 'Total guardado',
      value: formatBRL(totalSaved),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total necessário',
      value: formatBRL(totalTarget),
      icon: Target,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Progresso geral',
      value: `${overallPct}%`,
      icon: CheckCircle2,
      color: 'text-[#4a7c59]',
      bg: 'bg-[#4a7c59]/10',
    },
    {
      label: 'Metas ativas',
      value: String(activeCount),
      icon: Star,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ];

  return (
    <div className="space-y-6">

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.bg}`}>
                  <Icon className={`w-4.5 h-4.5 ${k.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold tracking-tight ${k.color}`}>{k.value}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">{k.label}</p>
            </div>
          );
        })}

        {/* Próximo marco */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow col-span-2 lg:col-span-2">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4.5 h-4.5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-medium mb-0.5">Próximo marco</p>
              {nextMarco ? (
                <>
                  <p className="font-semibold text-slate-800 text-sm leading-snug truncate">{nextMarco.title}</p>
                  <p className="text-xs text-indigo-500 mt-0.5">{formatDateShort(nextMarco.date)}</p>
                </>
              ) : (
                <p className="text-sm text-slate-400">Nenhum marco planejado</p>
              )}
            </div>
          </div>
        </div>

        {/* Fundo emergência KPI */}
        <div className={`rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow col-span-2 lg:col-span-2 ${esCfg.bg} ${esCfg.border}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className={`w-4.5 h-4.5 ${esCfg.color}`} />
              <p className={`text-xs font-semibold uppercase tracking-wider ${esCfg.color}`}>Fundo de emergência</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${esCfg.bg} ${esCfg.border} ${esCfg.color}`}>
              {esCfg.label}
            </span>
          </div>
          <p className={`text-2xl font-bold ${esCfg.color}`}>{emergencyPct}%</p>
          <ProgressBar value={emergencyPct} color={emergencyPct >= 100 ? '#059669' : emergencyPct >= 70 ? '#d97706' : '#dc2626'} thin />
          <p className="text-xs text-slate-500 mt-1.5">
            {formatBRL(emergency.savedAmount)} de {formatBRL(emergencyTarget)}
          </p>
        </div>
      </div>

      {/* Bottom row: em andamento + foco */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Top 3 em andamento */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Metas em andamento</h3>
            <button
              onClick={onScrollToGoals}
              className="text-xs text-[#4a7c59] font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {topActive.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm mb-3">Nenhuma meta ativa ainda.</p>
              <button
                onClick={() => onOpenGoalModal()}
                className="text-sm font-medium text-[#4a7c59] hover:underline"
              >
                + Criar primeira meta
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {topActive.map(g => {
                const pct = calcGoalProgress(g);
                return (
                  <div key={g.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 flex-shrink-0">{g.category}</span>
                        <span className="text-sm font-medium text-slate-700 truncate">{g.title}</span>
                      </div>
                      <span className="text-sm font-bold text-[#4a7c59] flex-shrink-0">{pct}%</span>
                    </div>
                    <ProgressBar value={pct} />
                    {g.type === 'financial' && (
                      <p className="text-xs text-slate-400">
                        {formatBRL(g.savedValue ?? 0)} de {formatBRL(g.targetValue ?? 0)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Foco do mês */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-semibold text-slate-800">Foco do mês</h3>
          </div>

          {focusGoal ? (
            <>
              <div className="flex-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{focusGoal.category}</span>
                <p className="mt-2 font-semibold text-slate-800 leading-snug">{focusGoal.title}</p>
                {focusGoal.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{focusGoal.description}</p>
                )}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progresso</span>
                    <span className="font-semibold text-[#4a7c59]">{calcGoalProgress(focusGoal)}%</span>
                  </div>
                  <ProgressBar value={calcGoalProgress(focusGoal)} />
                </div>
                {focusGoal.type === 'financial' && (
                  <p className="text-xs text-slate-400 mt-1.5">
                    {formatBRL(focusGoal.savedValue ?? 0)} / {formatBRL(focusGoal.targetValue ?? 0)}
                  </p>
                )}
              </div>

              {/* CTA */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                {focusGoal.type === 'financial' ? (
                  <AportInline goalId={focusGoal.id} onAdd={onAddAport} />
                ) : (
                  <div className="flex gap-2">
                    {[5, 10].map(d => (
                      <button
                        key={d}
                        onClick={() => onMarkProgress(focusGoal.id, d)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold border border-[#4a7c59]/30 text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white transition-colors"
                      >
                        +{d}%
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
              <Star className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-sm text-slate-400 mb-1">Nenhuma meta em foco</p>
              <p className="text-xs text-slate-300">Marque uma meta como foco na aba Metas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AportInline({ goalId, onAdd }: { goalId: string; onAdd: (id: string, n: number) => void }) {
  const [val, setVal] = useState('');
  return (
    <div className="flex gap-2">
      <input
        type="number" min="0" step="100" placeholder="R$ aporte"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            const n = parseFloat(val);
            if (!isNaN(n) && n > 0) { onAdd(goalId, n); setVal(''); }
          }
        }}
        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] bg-slate-50"
      />
      <button
        onClick={() => {
          const n = parseFloat(val);
          if (!isNaN(n) && n > 0) { onAdd(goalId, n); setVal(''); }
        }}
        className="px-3 py-2 rounded-xl bg-[#4a7c59] text-white hover:bg-[#3a6448] transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

