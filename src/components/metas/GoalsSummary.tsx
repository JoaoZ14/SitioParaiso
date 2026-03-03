import { Target, CheckCircle2, TrendingUp, Calendar, Award, Sprout } from 'lucide-react';
import type { Meta } from '../../types';

interface Props {
  metas: Meta[];
  isOverdue: (meta: Meta) => boolean;
  today: Date;
}

export default function GoalsSummary({ metas, isOverdue, today }: Props) {
  const active = metas.filter(m => m.status === 'active');
  const done = metas.filter(m => m.status === 'done');
  const overdueCount = metas.filter(m => isOverdue(m)).length;

  const avgProgress =
    active.length > 0
      ? Math.round(active.reduce((sum, m) => sum + m.progress, 0) / active.length)
      : 0;

  // Completed this month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const doneThisMonth = done.filter(m => new Date(m.createdAt) >= startOfMonth).length;

  // Next deadline meta
  const nextMeta = active
    .filter(m => m.deadline && !isOverdue(m))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];

  const daysUntilNext = nextMeta
    ? Math.ceil((new Date(nextMeta.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const nextLabel =
    daysUntilNext === null ? 'Sem prazo próximo' :
    daysUntilNext === 0   ? 'Vence hoje!' :
    daysUntilNext === 1   ? 'Amanhã' :
    `em ${daysUntilNext} dias`;

  const nextLabelColor =
    daysUntilNext !== null && daysUntilNext <= 2 ? '#ea580c' :
    daysUntilNext !== null && daysUntilNext <= 7 ? '#d97706' : '#c9b48a';

  const progressColor =
    avgProgress >= 75 ? '#4a7c59' : avgProgress >= 40 ? '#d97706' : '#e11d48';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in-up animate-delay-100">
      {/* Metas ativas */}
      <div className="card-paper p-4 flex flex-col gap-2">
        <div className="w-9 h-9 rounded-xl bg-[#4a7c59]/10 flex items-center justify-center">
          <Target className="w-4.5 h-4.5 text-[#4a7c59]" />
        </div>
        <p className="font-serif text-3xl font-bold text-[#4a7c59]">{active.length}</p>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8a7a66]">Metas ativas</p>
          <p className="text-[11px] mt-0.5">
            {overdueCount > 0
              ? <span className="text-red-400 font-medium">{overdueCount} atrasada{overdueCount > 1 ? 's' : ''}</span>
              : <span className="text-[#6aab7e] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Todas em dia</span>}
          </p>
        </div>
      </div>

      {/* Concluídas */}
      <div className="card-paper p-4 flex flex-col gap-2">
        <div className="w-9 h-9 rounded-xl bg-[#6aab7e]/12 flex items-center justify-center">
          <CheckCircle2 className="w-4.5 h-4.5 text-[#6aab7e]" />
        </div>
        <p className="font-serif text-3xl font-bold text-[#6aab7e]">{done.length}</p>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8a7a66]">Concluídas</p>
          <p className="text-[11px] text-[#c9b48a] mt-0.5">
            {doneThisMonth > 0
              ? <span className="text-[#4a7c59] font-medium flex items-center gap-1"><Sprout className="w-3 h-3" /> +{doneThisMonth} este mês</span>
              : metas.length > 0 ? `de ${metas.length} no total` : 'Nenhuma ainda'}
          </p>
        </div>
      </div>

      {/* Progresso médio */}
      <div className="card-paper p-4 flex flex-col gap-2">
        <div className="w-9 h-9 rounded-xl bg-[#d97706]/10 flex items-center justify-center">
          <TrendingUp className="w-4.5 h-4.5 text-[#d97706]" />
        </div>
        <div className="flex items-end gap-1">
          <p className="font-serif text-3xl font-bold" style={{ color: progressColor }}>{avgProgress}</p>
          <span className="text-lg font-bold mb-0.5" style={{ color: progressColor }}>%</span>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8a7a66]">Progresso médio</p>
          <p className="text-[11px] text-[#c9b48a] mt-0.5">das metas ativas</p>
        </div>
      </div>

      {/* Próxima meta */}
      <div className="card-paper p-4 flex flex-col gap-2">
        <div className="w-9 h-9 rounded-xl bg-[#5c3d1e]/8 flex items-center justify-center">
          {doneThisMonth > 0
            ? <Award className="w-4.5 h-4.5 text-[#d97706]" />
            : <Calendar className="w-4.5 h-4.5 text-[#5c3d1e]" />
          }
        </div>
        <p className="font-serif text-base font-bold text-[#5c3d1e] leading-tight line-clamp-2">
          {nextMeta ? nextMeta.title : '—'}
        </p>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8a7a66]">Próxima meta</p>
          <p className="text-[11px] mt-0.5 font-medium" style={{ color: nextLabelColor }}>
            {nextLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
