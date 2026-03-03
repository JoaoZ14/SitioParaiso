import { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { CoupleGoal, GoalCategory, GoalType, GoalStatus, GoalPriority, GoalChecklistItem } from '../../types/couple';
import { calcScenarios, formatBRL, genId } from '../../utils/finance';

interface Props {
  open: boolean;
  goal: CoupleGoal | null;
  onSave: (goal: CoupleGoal) => void;
  onClose: () => void;
}

interface FormState {
  title: string;
  category: GoalCategory;
  type: GoalType;
  description: string;
  priority: GoalPriority;
  deadline: string;
  status: GoalStatus;
  targetValue: string;
  savedValue: string;
  monthlyContribution: string;
  progress: number;
  checklist: GoalChecklistItem[];
}

const EMPTY: FormState = {
  title: '', category: 'Finanças', type: 'financial', description: '',
  priority: 'Média', deadline: '', status: 'active',
  targetValue: '', savedValue: '', monthlyContribution: '',
  progress: 0, checklist: [],
};

const CATEGORIES: GoalCategory[] = [
  'Finanças','Carreira','Estudos','Saúde','Casa','Viagens','Projetos','Relacionamento','Outros',
];
const PRIORITIES: GoalPriority[] = ['Alta', 'Média', 'Baixa'];
const STATUSES: { value: GoalStatus; label: string }[] = [
  { value: 'active',  label: 'Ativa' },
  { value: 'paused',  label: 'Pausada' },
  { value: 'done',    label: 'Concluída' },
];

const priorityColor: Record<GoalPriority, string> = {
  Alta:  'bg-red-50 text-red-700 border-red-200',
  Média: 'bg-amber-50 text-amber-700 border-amber-200',
  Baixa: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function GoalModal({ open, goal, onSave, onClose }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [ckInput, setCkInput] = useState('');
  const [showScenarios, setShowScenarios] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (!open) return;
    if (goal) {
      setForm({
        title: goal.title,
        category: goal.category,
        type: goal.type,
        description: goal.description ?? '',
        priority: goal.priority,
        deadline: goal.deadline ? goal.deadline.slice(0, 10) : '',
        status: goal.status,
        targetValue: goal.targetValue?.toString() ?? '',
        savedValue: goal.savedValue?.toString() ?? '',
        monthlyContribution: goal.monthlyContribution?.toString() ?? '',
        progress: goal.progress ?? 0,
        checklist: goal.checklist ? [...goal.checklist] : [],
      });
    } else {
      setForm(EMPTY);
    }
    setCkInput('');
    setErrors({});
    setShowScenarios(false);
  }, [open, goal]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Título obrigatório.';
    if (form.type === 'financial') {
      const tv = parseFloat(form.targetValue);
      if (isNaN(tv) || tv <= 0) e.targetValue = 'Informe o valor alvo.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const now = new Date().toISOString();
    const saved: CoupleGoal = {
      id: goal?.id ?? genId(),
      title: form.title.trim(),
      category: form.category,
      type: form.type,
      description: form.description.trim() || undefined,
      priority: form.priority,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      status: form.status,
      isFocus: goal?.isFocus ?? false,
      createdAt: goal?.createdAt ?? now,
      updatedAt: now,
      ...(form.type === 'financial'
        ? {
            targetValue: parseFloat(form.targetValue) || 0,
            savedValue: parseFloat(form.savedValue) || 0,
            monthlyContribution: parseFloat(form.monthlyContribution) || 0,
          }
        : {
            progress: form.checklist.length > 0
              ? Math.round((form.checklist.filter(c => c.done).length / form.checklist.length) * 100)
              : form.progress,
            checklist: form.checklist,
          }),
    };
    onSave(saved);
  };

  const addChecklist = () => {
    if (!ckInput.trim()) return;
    set('checklist', [...form.checklist, { id: genId(), text: ckInput.trim(), done: false }]);
    setCkInput('');
  };

  const toggleChecklist = (id: string) =>
    set('checklist', form.checklist.map(c => c.id === id ? { ...c, done: !c.done } : c));

  const removeChecklist = (id: string) =>
    set('checklist', form.checklist.filter(c => c.id !== id));

  const scenarios = (() => {
    if (form.type !== 'financial') return [];
    const tv = parseFloat(form.targetValue);
    const sv = parseFloat(form.savedValue) || 0;
    const mc = parseFloat(form.monthlyContribution);
    if (isNaN(tv) || isNaN(mc) || mc <= 0) return [];
    return calcScenarios(tv, sv, mc);
  })();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {goal ? 'Editar meta' : 'Nova meta'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">

          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Ex: Comprar apartamento próprio"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all
                ${errors.title ? 'border-red-300 ring-red-100' : 'border-slate-200 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59]'}`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Row: Categoria / Tipo / Prioridade */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Categoria</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value as GoalCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tipo</label>
              <select
                value={form.type}
                onChange={e => set('type', e.target.value as GoalType)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all"
              >
                <option value="financial">Financeira</option>
                <option value="non-financial">Não-financeira</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Prioridade</label>
              <div className="flex gap-1.5">
                {PRIORITIES.map(p => (
                  <button
                    key={p} type="button"
                    onClick={() => set('priority', p)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all
                      ${form.priority === p ? priorityColor[p] + ' ring-1 ring-offset-0' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Descrição <span className="text-slate-400 normal-case font-normal">(opcional)</span></label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Contexto, motivação, detalhes…"
              rows={2}
              maxLength={300}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] focus:bg-white transition-all"
            />
          </div>

          {/* Row: Prazo / Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Prazo limite <span className="text-slate-400 normal-case font-normal">(opcional)</span></label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => set('deadline', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all"
              />
            </div>
            {goal && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={e => set('status', e.target.value as GoalStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all"
                >
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* --- FINANCIAL FIELDS --- */}
          {form.type === 'financial' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dados financeiros</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'targetValue'        as const, label: 'Valor alvo (R$)',      placeholder: '60.000', required: true },
                  { key: 'savedValue'         as const, label: 'Já guardado (R$)',     placeholder: '0' },
                  { key: 'monthlyContribution'as const, label: 'Aporte mensal (R$)',   placeholder: '500' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      {f.label} {f.required && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="number" min="0" step="100"
                      value={form[f.key] as string}
                      onChange={e => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all
                        ${f.required && errors[f.key] ? 'border-red-300 ring-red-100' : 'border-slate-200 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59]'}`}
                    />
                    {f.required && errors[f.key] && <p className="text-xs text-red-500 mt-1">{errors[f.key]}</p>}
                  </div>
                ))}
              </div>

              {/* Scenarios */}
              {scenarios.length > 0 && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowScenarios(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-600"
                  >
                    Cenários de alcance
                    {showScenarios ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showScenarios && (
                    <div className="divide-y divide-slate-100">
                      {scenarios.map((s, i) => (
                        <div key={s.label} className={`flex items-center justify-between px-4 py-2.5 text-sm
                          ${i === 0 ? 'bg-red-50/50' : i === 1 ? 'bg-white' : 'bg-green-50/50'}`}
                        >
                          <span className="font-medium text-slate-700">{s.label}</span>
                          <span className="text-slate-500">{formatBRL(s.monthly)}/mês</span>
                          <span className="font-semibold text-slate-700">{s.date ?? '—'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- NON-FINANCIAL FIELDS --- */}
          {form.type === 'non-financial' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Progresso</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {form.checklist.length === 0 && (
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progresso manual</label>
                    <span className="text-sm font-bold text-[#4a7c59]">{form.progress}%</span>
                  </div>
                  <input
                    type="range" min={0} max={100} step={5}
                    value={form.progress}
                    onChange={e => set('progress', Number(e.target.value))}
                    className="w-full accent-[#4a7c59]"
                  />
                </div>
              )}

              {/* Checklist */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Checklist de subtarefas <span className="text-slate-400 normal-case font-normal">(opcional — sobrescreve o % manual)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text" value={ckInput}
                    onChange={e => setCkInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChecklist())}
                    placeholder="Nova subtarefa…"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all"
                  />
                  <button
                    type="button" onClick={addChecklist}
                    className="px-3.5 py-2.5 rounded-xl bg-[#4a7c59] text-white hover:bg-[#3a6448] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {form.checklist.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {form.checklist.map(item => (
                      <div key={item.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <input
                          type="checkbox" checked={item.done}
                          onChange={() => toggleChecklist(item.id)}
                          className="w-4 h-4 accent-[#4a7c59] rounded"
                        />
                        <span className={`flex-1 text-sm ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {item.text}
                        </span>
                        <button onClick={() => removeChecklist(item.id)} className="text-slate-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#4a7c59] text-white hover:bg-[#3a6448] transition-colors shadow-sm"
          >
            {goal ? 'Salvar alterações' : 'Criar meta'}
          </button>
        </div>
      </div>
    </div>
  );
}
