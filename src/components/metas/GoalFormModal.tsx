import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, GripVertical, Check } from 'lucide-react';
import type { Meta, MetaCategory, MetaPriority, MetaStatus, ChecklistItem } from '../../types';
import { CATEGORIES, CATEGORY_CONFIG, PRIORITY_CONFIG } from './constants';

interface Props {
  meta: Meta | null;
  onSave: (meta: Meta) => void;
  onClose: () => void;
}

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

interface FormState {
  title: string;
  category: MetaCategory;
  description: string;
  priority: MetaPriority;
  deadline: string;
  progress: number;
  checklist: ChecklistItem[];
  status: MetaStatus;
  notes: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  category: 'Outros',
  description: '',
  priority: 'Média',
  deadline: '',
  progress: 0,
  checklist: [],
  status: 'active',
  notes: '',
};

export default function GoalFormModal({ meta, onSave, onClose }: Props) {
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [checkInput, setCheckInput] = useState('');
  const [errors, setErrors] = useState<{ title?: string }>({});
  const titleRef = useRef<HTMLInputElement>(null);

  const isEditing = !!meta;

  useEffect(() => {
    if (meta) {
      setForm({
        title: meta.title,
        category: meta.category,
        description: meta.description,
        priority: meta.priority,
        deadline: meta.deadline ? meta.deadline.split('T')[0] : '',
        progress: meta.progress,
        checklist: meta.checklist,
        status: meta.status,
        notes: meta.notes ?? '',
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
    setTimeout(() => titleRef.current?.focus(), 50);
  }, [meta]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const addCheckItem = () => {
    const text = checkInput.trim();
    if (!text) return;
    set('checklist', [...form.checklist, { id: genId(), text, done: false }]);
    setCheckInput('');
  };

  const removeCheckItem = (id: string) =>
    set('checklist', form.checklist.filter(i => i.id !== id));

  const toggleCheckItem = (id: string) =>
    set('checklist', form.checklist.map(i => i.id === id ? { ...i, done: !i.done } : i));

  const validate = () => {
    const e: { title?: string } = {};
    if (!form.title.trim()) e.title = 'O título é obrigatório.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const effectiveProgress = form.status === 'done' ? 100 : form.progress;

    const saved: Meta = {
      id: meta?.id ?? genId(),
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      priority: form.priority,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : '',
      progress: effectiveProgress,
      checklist: form.checklist,
      status: form.status,
      createdAt: meta?.createdAt ?? new Date().toISOString(),
      pinned: meta?.pinned ?? false,
      notes: form.notes.trim(),
    };
    onSave(saved);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-[#fffdf5] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8d5b0] flex-shrink-0">
          <h2 className="font-serif text-xl text-[#2d5a3d]">
            {isEditing ? 'Editar meta' : 'Nova meta'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#f5ead0] flex items-center justify-center text-[#8a7a66] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-[#5c3d1e] mb-1.5">
                Título <span className="text-red-400">*</span>
              </label>
              <input
                ref={titleRef}
                type="text"
                value={form.title}
                onChange={e => { set('title', e.target.value); setErrors({}); }}
                placeholder="Ex: Construir horta no sítio"
                className="input-field"
                maxLength={80}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Category grid */}
            <div>
              <label className="block text-sm font-semibold text-[#5c3d1e] mb-2">Categoria</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {CATEGORIES.map(cat => {
                  const cfg = CATEGORY_CONFIG[cat];
                  const active = form.category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => set('category', cat)}
                      className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border text-xs font-medium transition-all duration-150 ${
                        active
                          ? 'border-2 shadow-sm'
                          : 'border-[#e8d5b0] text-[#8a7a66] hover:border-[#c9b48a]'
                      }`}
                      style={active ? {
                        borderColor: cfg.color,
                        background: cfg.bg,
                        color: cfg.textColor,
                      } : {}}
                    >
                      <cfg.Icon
                        className="w-4.5 h-4.5"
                        style={{ color: active ? cfg.color : '#8a7a66' }}
                      />
                      <span className="leading-tight text-center">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-[#5c3d1e] mb-1.5">
                Descrição
                <span className="text-[#c9b48a] font-normal ml-1">({form.description.length}/200)</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value.slice(0, 200))}
                placeholder="Descreva brevemente essa meta..."
                rows={2}
                className="input-field resize-none"
              />
            </div>

            {/* Priority + Deadline row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-[#5c3d1e] mb-1.5">Prioridade</label>
                <div className="flex gap-2">
                  {(['Alta', 'Média', 'Baixa'] as MetaPriority[]).map(p => {
                    const cfg = PRIORITY_CONFIG[p];
                    const active = form.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => set('priority', p)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          active ? 'border-2 shadow-sm' : 'border-[#e8d5b0] text-[#8a7a66] hover:border-[#c9b48a]'
                        }`}
                        style={active ? { borderColor: cfg.text, background: cfg.bg, color: cfg.text } : {}}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-semibold text-[#5c3d1e] mb-1.5">Data alvo</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => set('deadline', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Progress + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Progress slider */}
              <div>
                <label className="block text-sm font-semibold text-[#5c3d1e] mb-1.5">
                  Progresso
                  <span className="ml-2 text-[#4a7c59] font-bold">{form.progress}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={form.progress}
                  onChange={e => set('progress', Number(e.target.value))}
                  disabled={form.status === 'done'}
                  className="w-full accent-[#4a7c59] h-2 cursor-pointer disabled:opacity-40"
                />
                <div className="flex justify-between text-[10px] text-[#c9b48a] mt-0.5">
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-[#5c3d1e] mb-1.5">Status</label>
                <div className="flex gap-2">
                  {([
                    { v: 'active' as MetaStatus, label: 'Em andamento', color: '#4a7c59' },
                    { v: 'done'   as MetaStatus, label: 'Concluída',    color: '#6aab7e' },
                  ]).map(opt => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => set('status', opt.v)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        form.status === opt.v
                          ? 'border-2 text-white shadow-sm'
                          : 'border-[#e8d5b0] text-[#8a7a66] hover:border-[#c9b48a]'
                      }`}
                      style={form.status === opt.v ? { background: opt.color, borderColor: opt.color } : {}}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes / anotação rápida */}
            <div>
              <label className="block text-sm font-semibold text-[#5c3d1e] mb-1.5">
                Anotação rápida
                <span className="text-[#c9b48a] font-normal ml-1">(aparece no card)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value.slice(0, 160))}
                placeholder='Ex: "Pesquisar preços antes de decidir..."'
                rows={2}
                className="input-field resize-none font-hand text-base"
              />
            </div>

            {/* Checklist */}
            <div>
              <label className="block text-sm font-semibold text-[#5c3d1e] mb-2">
                Checklist
                {form.checklist.length > 0 && (
                  <span className="ml-1.5 text-[#c9b48a] font-normal">
                    ({form.checklist.filter(i => i.done).length}/{form.checklist.length} feitos)
                  </span>
                )}
              </label>

              {/* Checklist items */}
              {form.checklist.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {form.checklist.map(item => (
                    <div key={item.id} className="flex items-center gap-2 group">
                      <GripVertical className="w-3.5 h-3.5 text-[#e8d5b0] flex-shrink-0" />
                      <button
                        type="button"
                        onClick={() => toggleCheckItem(item.id)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          item.done ? 'bg-[#4a7c59] border-[#4a7c59]' : 'border-[#c9b48a] hover:border-[#4a7c59]'
                        }`}
                      >
                        {item.done && <Check className="w-2.5 h-2.5 text-white" />}
                      </button>
                      <span className={`flex-1 text-sm ${item.done ? 'line-through text-[#c9b48a]' : 'text-[#5c3d1e]'}`}>
                        {item.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCheckItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add item input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={checkInput}
                  onChange={e => setCheckInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCheckItem(); } }}
                  placeholder="Novo item... (Enter para adicionar)"
                  className="input-field flex-1"
                  maxLength={120}
                />
                <button
                  type="button"
                  onClick={addCheckItem}
                  className="w-10 h-10 flex-shrink-0 rounded-lg bg-[#4a7c59]/10 hover:bg-[#4a7c59]/20 flex items-center justify-center text-[#4a7c59] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e8d5b0] bg-[#fdf6e3] flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#e8d5b0] text-[#8a7a66] text-sm font-medium hover:bg-[#f5ead0] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary text-sm"
            >
              {isEditing ? 'Salvar alterações' : 'Criar meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
