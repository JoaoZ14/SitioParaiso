import { useState } from 'react';
import { ChevronDown, ChevronUp, LayoutGrid } from 'lucide-react';
import type { Meta } from '../../types';
import { CATEGORY_CONFIG, CATEGORIES } from './constants';

interface Props {
  metas: Meta[];
}

export default function CategoryBreakdown({ metas }: Props) {
  const [open, setOpen] = useState(false);

  const usedCategories = CATEGORIES.filter(cat => metas.some(m => m.category === cat));

  if (usedCategories.length === 0) return null;

  const stats = usedCategories.map(cat => {
    const all = metas.filter(m => m.category === cat);
    const active = all.filter(m => m.status === 'active');
    const done = all.filter(m => m.status === 'done');
    const avgProgress =
      active.length > 0
        ? Math.round(active.reduce((sum, m) => sum + m.progress, 0) / active.length)
        : done.length > 0 ? 100 : 0;
    return { cat, total: all.length, active: active.length, done: done.length, avgProgress };
  });

  return (
    <div className="card-paper mb-6 overflow-hidden animate-fade-in-up animate-delay-300">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#f5ead0]/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <LayoutGrid className="w-4 h-4 text-[#4a7c59]" />
          <span className="text-sm font-semibold text-[#5c3d1e]">Distribuição por categoria</span>
          <span className="text-xs bg-[#f5ead0] text-[#8a7a66] px-2 py-0.5 rounded-full font-medium">
            {usedCategories.length} categorias
          </span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-[#8a7a66]" />
          : <ChevronDown className="w-4 h-4 text-[#8a7a66]" />}
      </button>

      {open && (
        <div className="border-t border-[#f5ead0] px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.map(({ cat, total, active, done, avgProgress }) => {
              const cfg = CATEGORY_CONFIG[cat];
              return (
                <div
                  key={cat}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#f0e8d0] hover:shadow-sm transition-shadow"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg }}
                  >
                    <cfg.Icon className="w-5 h-5" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-[#2d5a3d] truncate">{cat}</span>
                      <span className="text-xs font-bold flex-shrink-0 ml-1" style={{ color: cfg.color }}>
                        {avgProgress}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#f5ead0] rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full rounded-full progress-bar-inner"
                        style={{ width: `${avgProgress}%`, background: cfg.color }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#8a7a66]">
                        {active} ativa{active !== 1 ? 's' : ''}
                      </span>
                      <span className="text-[10px] text-[#6aab7e] font-medium">
                        {done}/{total} concluída{done !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
