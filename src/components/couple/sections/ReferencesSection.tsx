import { useState, useMemo } from 'react';
import { Search, Plus, Link2, Image, FileText, Star, X, Trash2, ExternalLink } from 'lucide-react';
import type { CoupleReference, ReferenceType } from '../../../types/couple';
import { genId } from '../../../utils/finance';

interface Props {
  refs: CoupleReference[];
  onSave:     (ref: CoupleReference) => void;
  onDelete:   (id: string) => void;
  onFavorite: (id: string) => void;
}

const typeIcon: Record<ReferenceType, React.ElementType> = {
  link:  Link2,
  image: Image,
  note:  FileText,
};
const typeLabel: Record<ReferenceType, string> = { link: 'Link', image: 'Imagem', note: 'Nota' };
const typeStyle: Record<ReferenceType, string> = {
  link:  'bg-blue-50 text-blue-600 border-blue-200',
  image: 'bg-violet-50 text-violet-600 border-violet-200',
  note:  'bg-amber-50 text-amber-600 border-amber-200',
};

interface RefFormState {
  title: string;
  type: ReferenceType;
  url: string;
  imageUrl: string;
  tagInput: string;
  tags: string[];
  notes: string;
}

const EMPTY_FORM: RefFormState = {
  title: '', type: 'link', url: '', imageUrl: '', tagInput: '', tags: [], notes: '',
};

function RefModal({
  open, ref: ref_, onSave, onClose,
}: {
  open: boolean;
  ref: CoupleReference | null;
  onSave: (r: CoupleReference) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<RefFormState>(EMPTY_FORM);

  useMemo(() => {
    if (!open) return;
    if (ref_) {
      setForm({
        title: ref_.title, type: ref_.type,
        url: ref_.url ?? '', imageUrl: ref_.imageUrl ?? '',
        tagInput: '', tags: [...ref_.tags], notes: ref_.notes ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, ref_]);

  const set = <K extends keyof RefFormState>(k: K, v: RefFormState[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const addTag = () => {
    const t = form.tagInput.trim().toLowerCase();
    if (!t || form.tags.includes(t)) return;
    set('tags', [...form.tags, t]);
    set('tagInput', '');
  };
  const removeTag = (t: string) => set('tags', form.tags.filter(x => x !== t));

  const handleSave = () => {
    if (!form.title.trim()) return;
    const now = new Date().toISOString();
    onSave({
      id: ref_?.id ?? genId(),
      title: form.title.trim(),
      type: form.type,
      url: form.url.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      tags: form.tags,
      notes: form.notes.trim() || undefined,
      favorite: ref_?.favorite ?? false,
      createdAt: ref_?.createdAt ?? now,
    });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{ref_ ? 'Editar referência' : 'Nova referência'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Título *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Nome da referência" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tipo</label>
            <div className="flex gap-2">
              {(['link','image','note'] as ReferenceType[]).map(t => (
                <button key={t} type="button" onClick={() => set('type', t)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all
                    ${form.type === t ? typeStyle[t] : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  {typeLabel[t]}
                </button>
              ))}
            </div>
          </div>

          {form.type === 'link' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">URL</label>
              <input type="url" value={form.url} onChange={e => set('url', e.target.value)}
                placeholder="https://…" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all" />
            </div>
          )}

          {form.type === 'image' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">URL da imagem</label>
              <input type="url" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)}
                placeholder="https://…/imagem.jpg" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tags</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={form.tagInput} onChange={e => set('tagInput', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Digitar tag + Enter" className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all" />
              <button type="button" onClick={addTag} className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map(t => (
                  <span key={t} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#4a7c59]/10 text-[#4a7c59] font-medium">
                    {t}
                    <button onClick={() => removeTag(t)} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Observação</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Contexto, dicas, ideias…" rows={3} maxLength={400}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={handleSave} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#4a7c59] text-white hover:bg-[#3a6448] transition-colors shadow-sm">
            {ref_ ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReferencesSection({ refs, onSave, onDelete, onFavorite }: Props) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReferenceType | 'all'>('all');
  const [tagFilter, setTagFilter] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [modalRef, setModalRef] = useState<CoupleReference | null | undefined>(undefined);

  const topTags = useMemo(() => {
    const cnt: Record<string, number> = {};
    refs.forEach(r => r.tags.forEach(t => { cnt[t] = (cnt[t] ?? 0) + 1; }));
    return Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
  }, [refs]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return refs.filter(r => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (favOnly && !r.favorite) return false;
      if (tagFilter && !r.tags.includes(tagFilter)) return false;
      if (q && !r.title.toLowerCase().includes(q) && !r.notes?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [refs, search, typeFilter, tagFilter, favOnly]);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar referências…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all" />
          </div>

          <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden text-sm divide-x divide-slate-200">
            {(['all','link','image','note'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-2.5 transition-colors ${typeFilter === t ? 'bg-[#4a7c59] text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                {t === 'all' ? 'Todos' : typeLabel[t]}
              </button>
            ))}
          </div>

          <button onClick={() => setFavOnly(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm transition-colors
              ${favOnly ? 'bg-amber-50 border-amber-200 text-amber-600' : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'}`}>
            <Star className="w-4 h-4" fill={favOnly ? 'currentColor' : 'none'} />
            Favoritos
          </button>
        </div>

        <button onClick={() => setModalRef(null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold hover:bg-[#3a6448] transition-colors shadow-sm flex-shrink-0">
          <Plus className="w-4 h-4" /> Nova referência
        </button>
      </div>

      {/* Top tags */}
      {topTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Top tags:</span>
          {topTags.map(t => (
            <button key={t} onClick={() => setTagFilter(tagFilter === t ? '' : t)}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors
                ${tagFilter === t ? 'bg-[#4a7c59] text-white border-[#4a7c59]' : 'bg-white border-slate-200 text-slate-600 hover:border-[#4a7c59]/50'}`}>
              {t}
            </button>
          ))}
          {tagFilter && (
            <button onClick={() => setTagFilter('')} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <X className="w-3 h-3" /> Limpar
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <p className="text-slate-400 text-sm mb-3">Nenhuma referência encontrada.</p>
          <button onClick={() => setModalRef(null)} className="text-sm font-medium text-[#4a7c59] hover:underline">+ Adicionar primeira referência</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(r => {
            const TIcon = typeIcon[r.type];
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                {r.type === 'image' && r.imageUrl && (
                  <div className="h-36 overflow-hidden bg-slate-100">
                    <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${typeStyle[r.type]}`}>
                        <TIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-xs font-medium border px-2 py-0.5 rounded-full ${typeStyle[r.type]}`}>{typeLabel[r.type]}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => onFavorite(r.id)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
                          ${r.favorite ? 'text-amber-400 bg-amber-50' : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50'}`}>
                        <Star className="w-3.5 h-3.5" fill={r.favorite ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={() => onDelete(r.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-semibold text-slate-800 text-sm leading-snug mb-1">{r.title}</h4>
                  {r.notes && <p className="text-xs text-slate-400 line-clamp-2 flex-1">{r.notes}</p>}

                  {r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {r.tags.slice(0, 4).map(t => (
                        <button key={t} onClick={() => setTagFilter(tagFilter === t ? '' : t)}
                          className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 hover:bg-[#4a7c59]/10 hover:text-[#4a7c59] transition-colors">
                          {t}
                        </button>
                      ))}
                    </div>
                  )}

                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      className="mt-3 flex items-center gap-1.5 text-xs text-blue-500 hover:underline truncate">
                      <ExternalLink className="w-3 h-3 flex-shrink-0" /> {r.url}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalRef !== undefined && (
        <RefModal open={true} ref={modalRef}
          onSave={r => { onSave(r); setModalRef(undefined); }}
          onClose={() => setModalRef(undefined)} />
      )}
    </div>
  );
}
