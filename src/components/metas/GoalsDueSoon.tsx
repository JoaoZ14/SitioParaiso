import { Clock, AlertCircle } from 'lucide-react';
import type { Meta } from '../../types';
import { CATEGORY_CONFIG } from './constants';

interface Props {
  metas: Meta[];
  today: Date;
  onEdit: (meta: Meta) => void;
}

export default function GoalsDueSoon({ metas, today, onEdit }: Props) {
  const sevenDaysOut = new Date(today);
  sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);

  const dueSoon = metas
    .filter(m => {
      if (m.status === 'done' || !m.deadline) return false;
      const d = new Date(m.deadline);
      return d >= today && d <= sevenDaysOut;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  if (dueSoon.length === 0) return null;

  const daysUntil = (iso: string) => {
    const ms = new Date(iso).getTime() - today.getTime();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  };

  const dayLabel = (days: number) => {
    if (days === 0) return 'Hoje!';
    if (days === 1) return 'Amanhã';
    return `em ${days} dias`;
  };

  const urgencyColor = (days: number) => {
    if (days === 0) return { text: '#dc2626', bg: '#fee2e2' };
    if (days <= 2)  return { text: '#ea580c', bg: '#ffedd5' };
    return { text: '#d97706', bg: '#fef3c7' };
  };

  return (
    <div className="mb-6 animate-fade-in-up animate-delay-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-[#fef3c7] flex items-center justify-center flex-shrink-0">
          <Clock className="w-3.5 h-3.5 text-[#d97706]" />
        </div>
        <h3 className="text-sm font-semibold text-[#5c3d1e]">Vencendo em breve</h3>
        <span className="text-xs bg-[#fef3c7] text-[#d97706] px-2 py-0.5 rounded-full font-semibold">
          {dueSoon.length}
        </span>
        {dueSoon.some(m => daysUntil(m.deadline) <= 1) && (
          <AlertCircle className="w-4 h-4 text-red-400" />
        )}
      </div>

      {/* Horizontal scrollable strip */}
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {dueSoon.map(meta => {
          const cat = CATEGORY_CONFIG[meta.category] ?? CATEGORY_CONFIG['Outros'];
          const days = daysUntil(meta.deadline);
          const urgency = urgencyColor(days);

          return (
            <button
              key={meta.id}
              onClick={() => onEdit(meta)}
              className="group flex-shrink-0 bg-white border border-[#e8d5b0] rounded-xl p-3.5 hover:shadow-md hover:border-[#d97706]/50 hover:-translate-y-0.5 transition-all duration-200 text-left w-[190px]"
            >
              {/* Category + urgency */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide flex-shrink-0 flex items-center gap-1"
                  style={{ background: cat.bg, color: cat.textColor }}
                >
                  <cat.Icon className="w-3 h-3" />
                  {meta.category}
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: urgency.bg, color: urgency.text }}
                >
                  {dayLabel(days)}
                </span>
              </div>

              {/* Title */}
              <p className="text-sm font-semibold text-[#2d5a3d] line-clamp-2 mb-2 leading-snug">
                {meta.title}
              </p>

              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[#f5ead0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full progress-bar-inner"
                    style={{ width: `${meta.progress}%`, background: cat.color }}
                  />
                </div>
                <span className="text-[10px] font-bold flex-shrink-0" style={{ color: cat.color }}>
                  {meta.progress}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
