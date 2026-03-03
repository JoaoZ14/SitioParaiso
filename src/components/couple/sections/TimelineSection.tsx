import { useState, useMemo } from 'react';
import { Plus, CheckCircle2, Clock, Trash2, Edit2, X, ExternalLink } from 'lucide-react';
import type { CoupleTimelineItem, TimelineEventType, TimelineStatus } from '../../../types/couple';
import { genId, formatDateShort } from '../../../utils/finance';

interface Props {
  items: CoupleTimelineItem[];
  onSave:   (item: CoupleTimelineItem) => void;
  onDelete: (id: string) => void;
  onMarkDone: (id: string) => void;
}

const TYPE_COLORS: Record<TimelineEventType, string> = {
  Relacionamento: '#e11d48',
  Carreira:       '#6366f1',
  Financeiro:     '#16a34a',
  Viagem:         '#0891b2',
  Projeto:        '#d97706',
  Conquista:      '#f59e0b',
  Outros:         '#8a7a66',
};

const TYPES: TimelineEventType[] = [
  'Relacionamento','Carreira','Financeiro','Viagem','Projeto','Conquista','Outros',
];

interface TLFormState {
  date: string;
  title: string;
  description: string;
  type: TimelineEventType;
  status: TimelineStatus;
  optionalLink: string;
}
const EMPTY_TL: TLFormState = {
  date: '', title: '', description: '', type: 'Conquista', status: 'planned', optionalLink: '',
};

function TLModal({ open, item, onSave, onClose }: {
  open: boolean; item: CoupleTimelineItem | null;
  onSave: (i: CoupleTimelineItem) => void; onClose: () => void;
}) {
  const [form, setForm] = useState<TLFormState>(EMPTY_TL);

  useMemo(() => {
    if (!open) return;
    if (item) {
      setForm({
        date: item.date.slice(0, 10), title: item.title, description: item.description ?? '',
        type: item.type, status: item.status, optionalLink: item.optionalLink ?? '',
      });
    } else {
      setForm(EMPTY_TL);
    }
  }, [open, item]);

  const set = <K extends keyof TLFormState>(k: K, v: TLFormState[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim() || !form.date) return;
    const now = new Date().toISOString();
    onSave({
      id: item?.id ?? genId(),
      date: new Date(form.date).toISOString(),
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      status: form.status,
      optionalLink: form.optionalLink.trim() || undefined,
    });
    void now;
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{item ? 'Editar marco' : 'Novo marco'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Título *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Ex: Comprar apartamento" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Data *</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
              <div className="flex gap-2">
                {([['planned','Planejado'],['done','Realizado']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => set('status', v)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all
                      ${form.status === v
                        ? v === 'done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'border-slate-200 text-slate-500'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tipo</label>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map(t => (
                <button key={t} onClick={() => set('type', t)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                    ${form.type === t
                      ? 'text-white border-transparent'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  style={form.type === t ? { background: TYPE_COLORS[t] } : {}}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Descrição</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Detalhes sobre o marco…" rows={2} maxLength={300}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Link externo <span className="text-slate-400 normal-case font-normal">(opcional)</span></label>
            <input type="url" value={form.optionalLink} onChange={e => set('optionalLink', e.target.value)}
              placeholder="https://…" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={handleSave} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#4a7c59] text-white hover:bg-[#3a6448] transition-colors shadow-sm">
            {item ? 'Salvar' : 'Adicionar marco'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TimelineSection({ items, onSave, onDelete, onMarkDone }: Props) {
  const [filter, setFilter] = useState<TimelineStatus | 'all'>('all');
  const [modalItem, setModalItem] = useState<CoupleTimelineItem | null | undefined>(undefined);

  const sorted = useMemo(() => {
    const now = new Date();
    return [...items]
      .filter(i => filter === 'all' || i.status === filter)
      .sort((a, b) => {
        const da = Math.abs(new Date(a.date).getTime() - now.getTime());
        const db = Math.abs(new Date(b.date).getTime() - now.getTime());
        if (a.status === 'planned' && b.status !== 'planned') return -1;
        if (b.status === 'planned' && a.status !== 'planned') return 1;
        return da - db;
      });
  }, [items, filter]);

  const nextPlanned = useMemo(() =>
    items
      .filter(i => i.status === 'planned' && new Date(i.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null
  , [items]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden text-sm divide-x divide-slate-200">
          {([['all','Todos'],['planned','Planejados'],['done','Realizados']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-2.5 transition-colors ${filter === v ? 'bg-[#4a7c59] text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={() => setModalItem(null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold hover:bg-[#3a6448] transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Adicionar marco
        </button>
      </div>

      {/* Next marco banner */}
      {nextPlanned && filter !== 'done' && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl">
          <Clock className="w-4.5 h-4.5 text-indigo-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-indigo-400 font-medium">Próximo marco</p>
            <p className="text-sm font-semibold text-indigo-800 truncate">{nextPlanned.title}</p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full">{formatDateShort(nextPlanned.date)}</span>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <p className="text-slate-400 text-sm mb-3">Nenhum marco encontrado.</p>
          <button onClick={() => setModalItem(null)} className="text-sm font-medium text-[#4a7c59] hover:underline">+ Adicionar primeiro marco</button>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-3 bottom-3 w-px bg-slate-200" />

          <div className="space-y-4">
            {sorted.map(item => {
              const color = TYPE_COLORS[item.type];
              const isNext = nextPlanned?.id === item.id;
              return (
                <div key={item.id} className="relative flex gap-4">
                  {/* Dot */}
                  <div className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-white
                    ${item.status === 'done' ? 'border-emerald-400' : isNext ? 'border-indigo-400 shadow-md shadow-indigo-100' : 'border-slate-300'}`}
                    style={item.status !== 'done' && !isNext ? { borderColor: color } : {}}
                  >
                    {item.status === 'done'
                      ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                      : <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                    }
                  </div>

                  {/* Content */}
                  <div className={`flex-1 bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all
                    ${isNext ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-slate-100'}
                    ${item.status === 'done' ? 'opacity-80' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                          style={{ background: color }}>
                          {item.type}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
                          ${item.status === 'done' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}>
                          {item.status === 'done' ? 'Realizado' : 'Planejado'}
                        </span>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {item.status === 'planned' && (
                          <button onClick={() => onMarkDone(item.id)}
                            title="Marcar como realizado"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => setModalItem(item)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onDelete(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className={`font-semibold text-slate-800 leading-snug ${item.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDateShort(item.date)}</p>
                    {item.description && <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{item.description}</p>}
                    {item.optionalLink && (
                      <a href={item.optionalLink} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-blue-500 hover:underline">
                        <ExternalLink className="w-3 h-3" /> Ver detalhes
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {modalItem !== undefined && (
        <TLModal open={true} item={modalItem}
          onSave={i => { onSave(i); setModalItem(undefined); }}
          onClose={() => setModalItem(undefined)} />
      )}
    </div>
  );
}
