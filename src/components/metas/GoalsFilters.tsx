import type { Meta, FilterType } from '../../types';

interface Props {
  filter: FilterType;
  onChange: (f: FilterType) => void;
  metas: Meta[];
  isOverdue: (meta: Meta) => boolean;
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',     label: 'Todas' },
  { key: 'active',  label: 'Em andamento' },
  { key: 'done',    label: 'Concluídas' },
  { key: 'overdue', label: 'Atrasadas' },
];

export default function GoalsFilters({ filter, onChange, metas, isOverdue }: Props) {
  const counts: Record<FilterType, number> = {
    all:     metas.length,
    active:  metas.filter(m => m.status === 'active' && !isOverdue(m)).length,
    done:    metas.filter(m => m.status === 'done').length,
    overdue: metas.filter(m => isOverdue(m)).length,
  };

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(f => {
        const active = filter === f.key;
        return (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              active
                ? 'bg-[#4a7c59] text-white shadow-md shadow-[#4a7c59]/25'
                : 'bg-white border border-[#e8d5b0] text-[#8a7a66] hover:border-[#4a7c59] hover:text-[#4a7c59]'
            }`}
          >
            {f.label}
            {counts[f.key] > 0 && (
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                active ? 'bg-white/20 text-white' : 'bg-[#f5ead0] text-[#8a7a66]'
              }`}>
                {counts[f.key]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
