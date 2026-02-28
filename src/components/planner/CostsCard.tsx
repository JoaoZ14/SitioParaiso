import { useState } from 'react';
import { Plus, Pencil, Trash2, Wallet, X, Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useCosts } from '../../hooks/useCosts';
import type { Cost, CostCategory, Priority } from '../../types';

const CATEGORIES: CostCategory[] = ['Construção', 'Animais', 'Ferramentas', 'Jardim/Horta', 'Documentação', 'Outros'];
const PRIORITIES: Priority[] = ['Alta', 'Média', 'Baixa'];

const PRIORITY_STYLES: Record<Priority, string> = {
  Alta: 'bg-red-100 text-red-700',
  Média: 'bg-yellow-100 text-yellow-700',
  Baixa: 'bg-green-100 text-green-700',
};

const CATEGORY_COLORS: Record<CostCategory, string> = {
  'Construção': 'bg-orange-50 text-orange-700 border-orange-200',
  'Animais': 'bg-green-50 text-green-700 border-green-200',
  'Ferramentas': 'bg-blue-50 text-blue-700 border-blue-200',
  'Jardim/Horta': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Documentação': 'bg-purple-50 text-purple-700 border-purple-200',
  'Outros': 'bg-gray-50 text-gray-700 border-gray-200',
};

const emptyForm = { item: '', category: 'Construção' as CostCategory, value: '', priority: 'Média' as Priority };

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CostsCard() {
  const { costs, loading, addCost, updateCost, deleteCost } = useCosts();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.item.trim() || !form.value) return;
    setSaving(true);
    if (editId) {
      await updateCost(editId, { ...form, value: Number(form.value) });
      setEditId(null);
    } else {
      await addCost({ ...form, value: Number(form.value) });
    }
    setForm(emptyForm);
    setShowForm(false);
    setSaving(false);
  };

  const handleEdit = (cost: Cost) => {
    setForm({ item: cost.item, category: cost.category, value: String(cost.value), priority: cost.priority });
    setEditId(cost.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteCost(id);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  const total = costs.reduce((sum, c) => sum + Number(c.value), 0);
  const byCategory = costs.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + Number(c.value);
    return acc;
  }, {});

  const sortedCosts = [...costs].sort((a, b) => {
    const order = { Alta: 0, Média: 1, Baixa: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="card-paper flex flex-col h-full">
      <div className="flex items-center justify-between p-5 border-b border-[#e8d5b0]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-[#5c3d1e] text-base">Custos</h3>
            <p className="text-xs text-[#8a7a66]">{costs.length} item{costs.length !== 1 ? 'ns' : ''} · {formatBRL(total)}</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="flex items-center gap-1.5 bg-[#4a7c59] text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#2d5a3d] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Novo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border-b border-[#e8d5b0] bg-[#fdf9f0] space-y-3">
          <input
            className="input-field"
            placeholder="Descrição do item (ex: Arame para cerca)"
            value={form.item}
            onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))}
            aria-label="Item"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#8a7a66] block mb-1">Categoria</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as CostCategory }))} aria-label="Categoria">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#8a7a66] block mb-1">Prioridade</label>
              <select className="input-field" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))} aria-label="Prioridade">
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#8a7a66] block mb-1">Valor estimado (R$)</label>
            <input type="number" min={0} step={0.01} className="input-field" placeholder="0,00" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} aria-label="Valor" required />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={handleCancel} className="flex items-center gap-1 text-xs text-[#8a7a66] hover:text-[#5c3d1e] px-3 py-1.5 rounded-full border border-[#e8d5b0] transition-colors">
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-1 text-xs bg-[#4a7c59] text-white px-3 py-1.5 rounded-full hover:bg-[#2d5a3d] transition-colors font-semibold disabled:opacity-60">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {editId ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-[#c9b48a]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : sortedCosts.length === 0 ? (
          <div className="text-center py-10 text-[#c9b48a]">
            <Wallet className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Nenhum custo registrado</p>
            <p className="text-xs mt-1 opacity-70">Adicione os gastos planejados</p>
          </div>
        ) : (
          sortedCosts.map((cost) => (
            <div key={cost.id} className="group bg-white rounded-xl p-3 border border-[#e8d5b0] hover:border-[#4a7c59]/30 transition-all flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`tag-pill flex-shrink-0 ${PRIORITY_STYLES[cost.priority]}`}>{cost.priority}</span>
                <div className="min-w-0">
                  <p className="font-medium text-[#5c3d1e] text-sm truncate">{cost.item}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${CATEGORY_COLORS[cost.category]}`}>{cost.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-bold text-[#4a7c59] text-sm whitespace-nowrap">{formatBRL(Number(cost.value))}</span>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(cost)} className="p-1 text-[#8a7a66] hover:text-[#4a7c59] transition-colors" aria-label="Editar"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(cost.id)} className="p-1 text-[#8a7a66] hover:text-red-500 transition-colors" aria-label="Excluir"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {costs.length > 0 && (
        <div className="border-t border-[#e8d5b0] p-4">
          <button onClick={() => setShowSummary(!showSummary)} className="flex items-center justify-between w-full text-sm font-semibold text-[#5c3d1e] hover:text-[#4a7c59] transition-colors">
            <span>Resumo por categoria</span>
            {showSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showSummary && (
            <div className="mt-3 space-y-1.5">
              {Object.entries(byCategory).map(([cat, val]) => (
                <div key={cat} className="flex items-center justify-between text-xs">
                  <span className="text-[#8a7a66]">{cat}</span>
                  <span className="font-semibold text-[#5c3d1e]">{formatBRL(val)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm font-bold border-t border-[#e8d5b0] pt-2 mt-2">
                <span className="text-[#5c3d1e]">Total geral</span>
                <span className="text-[#4a7c59]">{formatBRL(total)}</span>
              </div>
            </div>
          )}
          {!showSummary && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[#8a7a66]">Total estimado</span>
              <span className="text-sm font-bold text-[#4a7c59]">{formatBRL(total)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
